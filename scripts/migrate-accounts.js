const axios = require('axios');
const { 
  EXTERNAL_AUTH_TOKEN, 
  LOCAL_API_URL, 
  LOCAL_SESSION_COOKIE, 
  HEADERS_EXTERNAL, 
  HEADERS_LOCAL 
} = require('./migration-helpers');

/**
 * ACCOUNT MIGRATION SCRIPT
 * 
 * Step 1: Get account list from third-party API
 * Step 2: Fetch local account types for mapping
 * Step 3: Map each external account to local payload
 * Step 4: Call local add-account API
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchExternalAccountList(page = 1, size = 1000) {
  const url = `https://trabill.m360ictapi.com/api/v1/accounts/all?page=${page}&size=${size}&search=`;
  console.log(`  - [External] Fetching: ${url}`);
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });

    return res.data.data || [];
  } catch (err) {
    console.error(`  - [External] Error fetching account list:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function getLocalAccountTypes() {
  try {
    const res = await axios.get(`${LOCAL_API_URL}/api/account-types`, { headers: HEADERS_LOCAL });
    return res.data?.data?.items || [];
  } catch (err) {
    console.error(`  - [Local] Error fetching account types:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function migrate() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const endIndex = parseInt(args[1]) || 1000;

  if (!LOCAL_SESSION_COOKIE) {
    console.error('ERROR: Please provide LOCAL_SESSION_COOKIE in the script configuration.');
    process.exit(1);
  }

  try {
    console.log('Fetching local account types for mapping...');
    const localAccountTypes = await getLocalAccountTypes();
    console.log(`Found ${localAccountTypes.length} local account types.`);

    console.log('Fetching external account list...');
    const accountList = await fetchExternalAccountList();
    console.log(`Found ${accountList.length} accounts on external API.`);

    const range = accountList.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} accounts)...`);

    for (let i = 0; i < range.length; i++) {
      const ext = range[i];
      console.log(`[${startIndex + i + 1}/${Math.min(endIndex, accountList.length)}] Migrating: ${ext.account_name} (ID: ${ext.account_id})...`);

      // 1. Map Account Type
      const matchedType = localAccountTypes.find(t => t.name.toLowerCase() === ext.acctype_name.toLowerCase());
      if (!matchedType) {
        console.warn(`  - WARNING: Could not find local account type for "${ext.acctype_name}". Skipping...`);
        continue;
      }

      // 2. Prepare Payload
      const payload = {
        name: ext.account_name,
        type: matchedType.name,
        accountTypeId: matchedType.id,
        accountNo: ext.account_number || "",
        bankName: ext.account_bank_name || "",
        routingNo: ext.account_routing_no || "",
        cardNo: ext.account_card_no || "",
        branch: ext.account_branch_name || "",
        accountCsv: ext.account_csv || "",
        accountExpireDate: ext.account_expire_date || "",
        accountOpeningAmount: parseFloat(ext.account_opening_amount || 0),
        lastBalance: parseFloat(ext.account_opening_amount || 0),
        dataEntryId: String(ext.account_id),
        createdAt: ext.account_create_date,
      };

      // 3. Call Local API
      try {
        const res = await axios.post(`${LOCAL_API_URL}/api/accounts`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: ${res.data.message || "Account added"}`);
        
        // Brief sleep to prevent overwhelming the server
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
