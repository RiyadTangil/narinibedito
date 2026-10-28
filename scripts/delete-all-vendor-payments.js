const axios = require('axios');
const { 
  LOCAL_API_URL, 
  LOCAL_SESSION_COOKIE, 
  HEADERS_LOCAL,
  sleep
} = require('./migration-helpers');

/**
 * DELETE ALL VENDOR PAYMENTS SCRIPT
 * 
 * Step 1: Fetch all local vendor payments
 * Step 2: Loop through each payment and call the DELETE API
 */

async function getLocalVendorPayments(page = 1, pageSize = 1000) {
    try {
        const url = `${LOCAL_API_URL}/api/vendors/payment?page=${page}&pageSize=${pageSize}`;
        console.log(`Fetching local vendor payments: ${url}`);
        const res = await axios.get(url, { headers: HEADERS_LOCAL });
        return res.data?.items || [];
    } catch (err) {
        console.error(`Error fetching vendor payments:`, err.response?.data?.message || err.message);
        return [];
    }
}

async function deleteVendorPayment(id, voucherNo) {
    console.log("vendor id => ", id)
    try {
        const url = `${LOCAL_API_URL}/api/vendors/payment/${id}`;
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
        console.log('Fetching all local vendor payments for deletion...');
        const payments = await getLocalVendorPayments(1, limit);

        if (payments.length === 0) {
            console.log('No vendor payments found to delete.');
            return;
        }

        const range = payments.slice(startIndex);
        console.log(`Found ${payments.length} vendor payments. Processing deletion for ${range.length} items starting from index ${startIndex}...`);

        for (let i = 0; i < range.length; i++) {
            const item = range[i];
            const currentNo = startIndex + i + 1;
            process.stdout.write(`[${currentNo}/${payments.length}] `);

            await deleteVendorPayment(item.id, item.voucherNo);

            // Brief sleep to be safe
            await sleep(500);
        }

        console.log('\nDeletion process completed.');
    } catch (error) {
        console.error('Critical Error:', error.message);
    }
}

run();
