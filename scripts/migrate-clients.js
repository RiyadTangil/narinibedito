const { 
  EXTERNAL_AUTH_TOKEN, 
  LOCAL_API_URL, 
  LOCAL_SESSION_COOKIE, 
  HEADERS_EXTERNAL, 
  HEADERS_LOCAL,
  fetchExternalClientDetails,
  fetchExternalClientLedger,
  getLocalData,
  sleep
} = require('./migration-helpers');
const axios = require('axios');

/**
 * CLIENT MIGRATION SCRIPT
 * 
 * Step 1: Get clients from third-party API
 * Step 2: Get client categories from third-party API
 * Step 3: Call local add-client API with the same payload as the frontend
 */

async function fetchExternalClients() {
  let allClients = [];
  let page = 1;
  const size = 100;
  
  while (true) {
    const url = `https://trabill.m360ictapi.com/api/v1/client/all?page=${page}&size=${size}&search=`;
    console.log(`  - [External] Fetching Clients Page ${page}...`);
    try {
      const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
      const data = res.data.data || [];
      allClients = allClients.concat(data);
      if (data.length < size) break;
      page++;
    } catch (err) {
      console.error(`  - [External] Error fetching clients at page ${page}:`, err.response?.data?.message || err.message);
      break;
    }
  }
  return allClients;
}

async function fetchExternalClientCategories() {
  const url = `https://trabill.m360ictapi.com/api/v1/configuration/client-category?page=1&size=5000`;
  console.log(`  - [External] Fetching Categories: ${url}`);
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.error(`  - [External] Error fetching categories:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function migrate() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const endIndex = parseInt(args[1]) || 10000;

  if (!LOCAL_SESSION_COOKIE) {
    console.error('ERROR: Please provide LOCAL_SESSION_COOKIE in the script configuration.');
    process.exit(1);
  }

  try {
    console.log('Fetching local categories for mapping...');
    const localCategories = await getLocalData('/api/clients/client-categories?pageSize=1000');
    console.log(`Found ${localCategories.length} local categories.`);

    console.log('Fetching external categories...');
    const categoriesJson = await fetchExternalClientCategories();
    console.log(`Found ${categoriesJson.length} categories on external API.`);

    console.log('Fetching external clients...');
    const clientsJson = await fetchExternalClients();
    console.log(`Found ${clientsJson.length} clients on external API.`);

    const range = clientsJson.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} clients)...`);

    for (let i = 0; i < range.length; i++) {
      const clientRef = range[i];
      console.log(`[${startIndex + i + 1}/${endIndex}] Migrating: ${clientRef.client_name} (ID: ${clientRef.client_id})...`);

      // 1. Get External Data
      const details = await fetchExternalClientDetails(clientRef.client_id);
      if (!details) continue;

      const ledgerData = await fetchExternalClientLedger(clientRef.client_id);
      const ledgers = ledgerData?.ledgers || [];
      // Look for opening balance in ledger
      let firstLedger = ledgers.find(item => !item.ctrxn_voucher);

      if (firstLedger && !firstLedger.ctrxn_particular_type.toLowerCase().includes("opening balance")) {
        console.log(`    - Note: Considering item with voucher "" as opening balance even though particular type is "${firstLedger.ctrxn_particular_type}"`);
      }


      let openingBalanceType = "";
      let openingBalanceAmount = 0;
      if (firstLedger) {
        openingBalanceAmount = Math.abs(parseFloat(firstLedger.ctrxn_amount) || 0);
        openingBalanceType = firstLedger.ctrxn_type === "DEBIT" ? "Due" : "Advance";
      }
      console.log(` leader length  =>( ${ledgers.length} ) voutcher no => (  ${firstLedger?.ctrxn_voucher || ""}  ) ,amount =>  (${openingBalanceAmount})`);

      // 2. Map Category
      const extCat = categoriesJson.find(c => c.category_id === details.client_category_id);
      let localCatId = "";
      if (extCat) {
        const matched = localCategories.find(lc =>
          lc.name.toLowerCase() === extCat.category_title.toLowerCase() ||
          (lc.prefix && lc.prefix.toLowerCase() === extCat.category_prefix.toLowerCase())
        );
        localCatId = matched ? matched.id : "";
      }

      // Fallback if category still not found
      if (!localCatId) {
        const fallbackKeywords = ["all servic", "all service", "general", "default", "customer"];
        for (const kw of fallbackKeywords) {
          const fallbackCat = localCategories.find(lc => lc.name.toLowerCase().includes(kw));
          if (fallbackCat) {
            localCatId = fallbackCat.id;
            console.log(`    - Using fallback category: "${fallbackCat.name}" (ID: ${localCatId})`);
            break;
          }
        }
      }

      // Last resort: take the first category if any exists
      if (!localCatId && localCategories.length > 0) {
        localCatId = localCategories[0].id;
        console.log(`    - Using first available category as last resort: "${localCategories[0].name}" (ID: ${localCatId})`);
      }

      if (!localCatId) {
        console.error(`  - SKIPPED: No local category found for client ${details.client_name}`);
        continue;
      }

      // 3. Prepare Payload (Same as frontend)
      const payload = {
        name: details.client_name,
        clientType: details.client_type === "INDIVIDUAL" ? "Individual" : "Corporate",
        categoryId: localCatId,
        email: details.client_email || "",
        phone: details.client_mobile || "",
        address: details.client_address || "",
        gender: details.client_gender || "",
        source: details.client_source || "",
        designation: details.client_designation || "",
        tradeLicenseNo: details.client_trade_license || "",
        openingBalanceType,
        openingBalanceAmount: String(openingBalanceAmount),
        creditLimit: String(details.client_credit_limit || 0),
        walkingCustomer: details.client_walking_customer === 1 ? "Yes" : "No",
        active: details.client_activity_status === 1,
        dataEntryId: String(details.client_id),
        createdAt: details.client_created_date,
      };

      // 4. Call Local API
      try {
        const res = await axios.post(`${LOCAL_API_URL}/api/clients-manager`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: ${res.data.message || "Client added"}`);


      } catch (err) {
        console.error(`  - FAILED:`, err.response?.data?.message || err.message);
      }
    }

    console.log('\nMigration completed.');
  } catch (error) {
    console.error('Critical Error:', error.message);
  }
}

migrate();
