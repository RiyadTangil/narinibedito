const axios = require('axios');
const { 
  autoCreateAccount,
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
 * BALANCE TRANSFER MIGRATION SCRIPT
 * 
 * Step 1: Get balance transfer list from third-party API
 * Step 2: Fetch local data for mapping (Accounts)
 * Step 3: For each transfer, map external accounts to local ones
 * Step 4: Handle missing accounts by auto-creating them
 * Step 5: Call local balance transfer API
 */

async function fetchExternalTransferList(page = 1, size = 1000) {
  const url = `https://trabill.m360ictapi.com/api/v1/accounts/balance-transfer?page=${page}&size=${size}&from_date=&to_date=&search=`;
  console.log(`  - [External] Fetching List: ${url}`);
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.error(`  - [External] Error fetching transfer list:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function migrate() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const endIndex = parseInt(args[1]) || 5000;

  if (!LOCAL_SESSION_COOKIE) {
    console.error('ERROR: Please provide LOCAL_SESSION_COOKIE in the script configuration.');
    process.exit(1);
  }

  try {
    console.log('Fetching local accounts for mapping...');
    const localAccounts = await getLocalData('/api/accounts?pageSize=10000');
    console.log(`Found ${localAccounts.length} accounts locally.`);

    console.log('Fetching external balance transfer list...');
    const transferList = await fetchExternalTransferList();
    console.log(`Found ${transferList.length} transfers on external API.`);

    const range = transferList.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} items)...`);

    let maxVoucherNo = '';
    let maxVoucherVal = 0;

    for (let i = 0; i < range.length; i++) {
      const extItem = range[i];
      const voucherNo = extItem.btransfer_vouchar_no;
      console.log(`[${startIndex + i + 1}/${Math.min(endIndex, transferList.length)}] Migrating Transfer: ${voucherNo} (ID: ${extItem.btransfer_id})...`);

      // Track max voucher for counter sync
      const vVal = extractVoucherNumber(voucherNo);
      if (vVal > maxVoucherVal) {
        maxVoucherVal = vVal;
        maxVoucherNo = voucherNo;
      }

      // 1. Map From Account
      let fromAccount = localAccounts.find(a => String(a.dataEntryId) === String(extItem.btransfer_from_account_id));
      if (!fromAccount && extItem.btransfer_from_account_id) {
        fromAccount = await autoCreateAccount(extItem.btransfer_from_account_id, extItem.btransfer_from_name, localAccounts, LOCAL_API_URL, HEADERS_LOCAL, HEADERS_EXTERNAL);
      }
      if (!fromAccount) {
        console.warn(`  - WARNING: External from_account_id "${extItem.btransfer_from_account_id}" not found. Using fallback...`);
        fromAccount = await autoCreateDeletedAccount(localAccounts, LOCAL_API_URL, HEADERS_LOCAL);
      }

      // 2. Map To Account
      let toAccount = localAccounts.find(a => String(a.dataEntryId) === String(extItem.btransfer_to_account_id));
      if (!toAccount && extItem.btransfer_to_account_id) {
        toAccount = await autoCreateAccount(extItem.btransfer_to_account_id, extItem.btransfer_to_name, localAccounts, LOCAL_API_URL, HEADERS_LOCAL, HEADERS_EXTERNAL);
      }
      if (!toAccount) {
        console.warn(`  - WARNING: External to_account_id "${extItem.btransfer_to_account_id}" not found. Using fallback...`);
        toAccount = await autoCreateDeletedAccount(localAccounts, LOCAL_API_URL, HEADERS_LOCAL);
      }

      if (!fromAccount || !toAccount) {
        console.error(`  - FAILED: Could not resolve accounts for transfer ${extItem.btransfer_vouchar_no}. Skipping...`);
        continue;
      }

      // 3. Prepare Payload
      const payload = {
        transferFromId: fromAccount.id,
        transferToId: toAccount.id,
        amount: parseFloat(extItem.btransfer_amount || 0),
        transferCharge: parseFloat(extItem.btransfer_charge || 0),
        date: extItem.btransfer_date ? extItem.btransfer_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        note: extItem.btransfer_note || "Migrated Balance Transfer",
        voucherNo: extItem.btransfer_vouchar_no,
        isMigration: true,
      };

      // 4. Call Local API
      try {
        // Check for existing voucher first
        const existingRes = await axios.get(`${LOCAL_API_URL}/api/balance-transfer?search=${payload.voucherNo}`, { headers: HEADERS_LOCAL });
        const existing = existingRes.data?.data?.items || [];
        
        if (existing.find(e => e.voucherNo === payload.voucherNo)) {
          console.log(`  - SKIP: Transfer ${payload.voucherNo} already exists.`);
          continue;
        }

        const res = await axios.post(`${LOCAL_API_URL}/api/balance-transfer`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: Transfer added`);
        
        // Brief sleep to prevent overwhelming the server
        await sleep(500);
      } catch (err) {
        console.error(`  - FAILED:`, err.response?.data?.message || err.response?.data?.error || err.message);
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
