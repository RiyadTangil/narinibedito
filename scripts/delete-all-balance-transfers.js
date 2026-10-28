const axios = require('axios');
const { 
  LOCAL_API_URL, 
  LOCAL_SESSION_COOKIE, 
  HEADERS_LOCAL,
  sleep
} = require('./migration-helpers');

/**
 * DELETE ALL BALANCE TRANSFERS SCRIPT
 * 
 * Step 1: Fetch all local balance transfers
 * Step 2: Loop through each transfer and call the DELETE API
 */

async function getLocalBalanceTransfers(page = 1, pageSize = 5000) {
  try {
    const url = `${LOCAL_API_URL}/api/balance-transfer?page=${page}&pageSize=${pageSize}`;
    console.log(`Fetching local balance transfers: ${url}`);
    const res = await axios.get(url, { headers: HEADERS_LOCAL });
    // Based on the service response structure: { items: [], pagination: { ... } }
    return res.data?.data?.items || res.data?.items || [];
  } catch (err) {
    console.error(`Error fetching balance transfers:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function deleteBalanceTransfer(id, voucherNo) {
  try {
    const url = `${LOCAL_API_URL}/api/balance-transfer/${id}`;
    const res = await axios.delete(url, { headers: HEADERS_LOCAL });
    console.log(`  - [SUCCESS] Deleted: ${voucherNo} (ID: ${id})`);
    return true;
  } catch (err) {
    console.error(`  - [FAILED] Could not delete ${voucherNo}:`, err.response?.data?.message || err.response?.data?.error || err.message);
    return false;
  }
}

async function run() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const limit = parseInt(args[1]) || 5000;

  if (!LOCAL_SESSION_COOKIE) {
    console.error('ERROR: Please provide LOCAL_SESSION_COOKIE in the script configuration.');
    process.exit(1);
  }

  try {
    console.log('Fetching all local balance transfers for deletion...');
    const transfers = await getLocalBalanceTransfers(1, limit);
    
    if (transfers.length === 0) {
      console.log('No balance transfers found to delete.');
      return;
    }

    const range = transfers.slice(startIndex);
    console.log(`Found ${transfers.length} transfers. Processing deletion for ${range.length} items starting from index ${startIndex}...`);

    for (let i = 0; i < range.length; i++) {
      const item = range[i];
      const currentNo = startIndex + i + 1;
      process.stdout.write(`[${currentNo}/${transfers.length}] `);
      
      await deleteBalanceTransfer(item.id, item.voucherNo);
      
      // Brief sleep to be safe
      await sleep(500);
    }

    console.log('\nDeletion process completed.');
  } catch (error) {
    console.error('Critical Error:', error.message);
  }
}

run();
