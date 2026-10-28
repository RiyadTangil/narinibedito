const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { 
  autoCreateClient, 
  autoCreateDeletedAccount,
  EXTERNAL_AUTH_TOKEN, 
  LOCAL_API_URL, 
  LOCAL_SESSION_COOKIE, 
  HEADERS_EXTERNAL, 
  HEADERS_LOCAL,
  getLocalData,
  extractVoucherNumber,
  sleep,
  syncCounter
} = require('./migration-helpers');

/**
 * ADVANCE RETURN MIGRATION SCRIPT
 * 
 * Step 1: Get advance return list from third-party API
 * Step 2: Fetch local clients and accounts for mapping by dataEntryId
 * Step 3: For each record, map external data to local payload
 * Step 4: Call local advance-returns API
 */

const PAYMENT_METHOD_MAP = {
  '1': '6a04073c73601487f0db2133', // Cash
  '2': '6a0407a373601487f0db213e', // Bank
  '3': '6a0407a873601487f0db2141', // Mobile banking
  '4': '6a0407b173601487f0db2144'  // Credit Card
};

async function fetchExternalAdvanceReturnList(page = 1, size = 1000) {
  const url = `https://trabill.m360ictapi.com/api/v1/money-receipt/advance/all?page=${page}&size=${size}&from_date=&to_date=&search=`;
  console.log(`  - [External] Fetching List: ${url}`);
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.error(`  - [External] Error fetching advance return list:`, err.response?.data?.message || err.message);
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
    console.log('Fetching local data for mapping...');
    const localClients = await getLocalData('/api/clients-manager?page=1&limit=10000');
    const localAccounts = await getLocalData('/api/accounts?pageSize=1000');
    const localCategories = await getLocalData('/api/clients/client-categories?pageSize=1000');
    const categoriesJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'client_category.json'), 'utf8'));

    console.log(`Found ${localClients.length} clients, ${localAccounts.length} accounts, and ${localCategories.length} categories locally.`);

    console.log('Fetching external advance return list...');
    const recordList = await fetchExternalAdvanceReturnList();
    console.log(`Found ${recordList.length} advance returns on external API.`);

    const range = recordList.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} records)...`);

    let maxVoucherNo = '';
    let maxVoucherVal = 0;

    for (let i = 0; i < range.length; i++) {
      const extItem = range[i];
      const voucherNo = extItem.advr_vouchar_no;
      console.log(`[${startIndex + i + 1}/${Math.min(endIndex, recordList.length)}] Migrating Advance Return: ${voucherNo} (ID: ${extItem.advr_id})...`);

      // Track max voucher for counter sync
      const vVal = extractVoucherNumber(voucherNo);
      if (vVal > maxVoucherVal) {
        maxVoucherVal = vVal;
        maxVoucherNo = voucherNo;
      }

      // 1. Map Client
      const externalClientId = String(extItem.advr_client_id);
      let matchedClient = localClients.find(c => String(c.dataEntryId) === externalClientId);
      
      if (!matchedClient && externalClientId) {
        matchedClient = await autoCreateClient(externalClientId, localCategories, categoriesJson, LOCAL_API_URL, HEADERS_LOCAL, HEADERS_EXTERNAL);
        if (matchedClient) {
          localClients.push(matchedClient);
        }
      }

      if (!matchedClient) {
        console.warn(`  - WARNING: Could not find or create local client for external ID "${externalClientId}". Skipping...`);
        continue;
      }

      // 2. Map Account
      let matchedAccount = localAccounts.find(a => String(a.dataEntryId) === String(extItem.advr_account_id));
      
      if (!matchedAccount || !extItem.advr_account_id) {
        console.warn(`  - WARNING: External account ID "${extItem.advr_account_id}" not found. Using fallback...`);
        // You might want to auto-create a deleted account or use a specific fallback
        matchedAccount = await autoCreateDeletedAccount(localAccounts, LOCAL_API_URL, HEADERS_LOCAL);
      }

      if (!matchedAccount) {
        console.warn(`  - WARNING: Could not find or create local account for external ID "${extItem.advr_account_id}". Skipping...`);
        continue;
      }

      // 3. Map Payment Method
      const paymentMethod = PAYMENT_METHOD_MAP[String(extItem.advr_payment_type)] || extItem.advr_payment_type;

      // 4. Prepare Payload
      const payload = {
        clientId: matchedClient.id,
        paymentMethod: paymentMethod,
        accountId: matchedAccount.id,
        advanceAmount: String(extItem.advr_amount || 0),
        returnDate: extItem.advr_payment_date ? extItem.advr_payment_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        returnNote: extItem.advr_note || "",
        receiptNo: extItem.advr_trxn_no || "",
        transactionCharge: String(extItem.advr_trxn_charge || 0),
        voucherNo: extItem.advr_vouchar_no, // We'll try to preserve the voucher number if the backend allows it
      };

      // 5. Call Local API (MIGRATION ENDPOINT)
      try {
        /**
         * MIGRATION API CHOICE:
         * We are using the specialized migration API (/api/migrate/advance-returns) 
         * which has relaxed validations (allows zero amounts, skips balance checks, etc).
         * 
         * TO USE EXISTING API:
         * 1. Change endpoint to `${LOCAL_API_URL}/api/advance-returns`
         * 2. Go to advanceReturnService.ts -> createAdvanceReturn and re-apply REVERT 1-3
         */
        const res = await axios.post(`${LOCAL_API_URL}/api/migrate/advance-returns`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: Advance Return added`);
        
        // Brief sleep to prevent overwhelming the server
        await sleep(500);
      } catch (err) {
        console.error(`  - FAILED:`, err.response?.data?.message || err.response?.data?.error || err.message);
        if (err.response?.data?.details) {
          console.error(`    Details:`, JSON.stringify(err.response.data.details));
        }
      }
    }

    // Sync counter after migration
    if (maxVoucherNo) {
      await syncCounter(maxVoucherNo);
    }

    console.log('\nMigration completed.');
  } catch (error) {
    console.error('Critical Error:', error.message);
  }
}

migrate();
