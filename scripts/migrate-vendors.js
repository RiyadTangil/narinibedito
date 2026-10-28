
const axios = require('axios');
const { 
  EXTERNAL_AUTH_TOKEN, 
  LOCAL_API_URL, 
  LOCAL_SESSION_COOKIE, 
  HEADERS_EXTERNAL, 
  HEADERS_LOCAL,
  fetchExternalVendorDetails,
  fetchExternalVendorLedger,
  getLocalData,
  sleep
} = require('./migration-helpers');

/**
 * SIMPLIFIED VENDOR MIGRATION SCRIPT
 * 
 * Step 1: Get vendor list from third-party API
 * Step 2: For each vendor, fetch details and ledger
 * Step 3: Map products using local product dataEntryId
 * Step 4: Call local add-vendor API
 */

async function fetchExternalVendorList(page = 1, size = 200) {
  const url = `https://trabill.m360ictapi.com/api/v1/vendors?page=${page}&size=${size}`;
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.error(`  - [External] Error fetching vendor list:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function migrate() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const endIndex = parseInt(args[1]) || 1;

  if (!LOCAL_SESSION_COOKIE) {
    console.error('ERROR: Please provide LOCAL_SESSION_COOKIE in the script configuration.');
    process.exit(1);
  }

  try {
    console.log('Fetching local products for mapping...');
    const localProducts = await getLocalData('/api/products?pageSize=1000');
    console.log(`Found ${localProducts.length} local products.`);

    console.log('Fetching external vendor list...');
    const vendorList = await fetchExternalVendorList();
    console.log(`Found ${vendorList.length} vendors on external API.`);

    const range = vendorList.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} vendors)...`);

    for (let i = 0; i < range.length; i++) {
      const vendorRef = range[i];
      console.log(`[${startIndex + i + 1}/${endIndex}] Migrating: ${vendorRef.vendor_name} (ID: ${vendorRef.vendor_id})...`);

      // 1. Get External Data
      const details = await fetchExternalVendorDetails(vendorRef.vendor_id);
      if (!details) continue;

      const ledgerData = await fetchExternalVendorLedger(vendorRef.vendor_id);
      const ledgers = ledgerData?.ledgers || [];
      // Look for opening balance in ledger
      let firstLedger = ledgers.find(item => !item.vtrxn_voucher);

      if (firstLedger && !firstLedger.vtrxn_particular_type.toLowerCase().includes("opening balance")) {
        console.log(`    - Note: Considering item with voucher "" as opening balance even though particular type is "${firstLedger.vtrxn_particular_type}"`);
      }

      let openingBalanceType = "due";
      let openingBalanceAmount = 0;
      if (firstLedger) {
        openingBalanceAmount = Math.abs(parseFloat(firstLedger.vtrxn_amount) || 0);
        openingBalanceType = firstLedger.vtrxn_type === "DEBIT" ? "due" : "advance";
      }
  console.log(` leader length  =>( ${ledgers.length} ) name => (${ details.vendor_name || ""}) mobile=> (${ details.vendor_mobile || ""})  ) opening_voucher=> (  ${firstLedger?.vtrxn_voucher || ""}  ) ,amount =>  (${openingBalanceAmount})`);

      // 2. Map Products
      const productsToMap = details.vendor_products || [];
      const mappedProductIds = productsToMap.map(vp => {
        // Find local product where dataEntryId matches vp.vproduct_product_id
        // Wait, I need dataEntryId in localProducts. I'll update the API route next.
        const matched = localProducts.find(lp => String(lp.dataEntryId) === String(vp.vproduct_product_id));
        return matched ? matched.id : null;
      }).filter(id => id !== null);

      // 3. Prepare Payload
      const payload = {
        name: details.vendor_name,
        email: details.vendor_email || "",
        mobile: details.vendor_mobile || "",
        address: details.vendor_address || "",
        fixedAdvance: details.vendor_fixed_advance || 0,
        creditLimit: details.vendor_credit_limit || 0,
        registrationDate: details.vendor_registration_date,
        openingBalanceType: openingBalanceType,
        openingBalance: openingBalanceAmount,
        active: vendorRef.vendor_activity_status === 1,
        products: mappedProductIds,
        dataEntryId: String(vendorRef.vendor_id),
        createdAt: vendorRef.vendor_created_date,
      };

      // 4. Call Local API
      try {
        const res = await axios.post(`${LOCAL_API_URL}/api/vendors`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: ${res.data.message || "Vendor added"}`);
        
        // console.log(`  - Waiting 4 seconds for server processing...`);
        await sleep(500);
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
