const axios = require('axios');
const { 
  autoCreateVendor, 
  autoCreateDeletedVendor,
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
 * VENDOR ADVANCE RETURN MIGRATION SCRIPT
 * 
 * Step 1: Get vendor advance return list from third-party API
 * Step 2: Fetch local vendors and accounts for mapping by dataEntryId
 * Step 3: For each record, fetch details to resolve accountId
 * Step 4: Map external data to local payload
 * Step 5: Call local migrate-vendor-advance-returns API
 */

async function fetchExternalAdvanceReturnList(page = 1, size = 1000) {
  const url = `https://trabill.m360ictapi.com/api/v1/vendors/advance-return?search=&page=${page}&size=${size}`;
  console.log(`  - [External] Fetching List: ${url}`);
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.error(`  - [External] Error fetching advance return list:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function fetchExternalAdvanceReturnDetails(advrId) {
  const url = `https://trabill.m360ictapi.com/api/v1/vendors/get-advancereturn-for-edit/${advrId}`;
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data;
  } catch (err) {
    console.error(`    - [External Details] Error fetching details for ${advrId}:`, err.response?.data?.message || err.message);
    return null;
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
    const localVendors = await getLocalData('/api/vendors?pageSize=10000');
    const localAccounts = await getLocalData('/api/accounts?pageSize=1000');

    console.log(`Found ${localVendors.length} vendors and ${localAccounts.length} accounts locally.`);

    console.log('Fetching external vendor advance return list...');
    const recordList = await fetchExternalAdvanceReturnList();
    console.log(`Found ${recordList.length} vendor advance returns on external API.`);

    const range = recordList.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} records)...`);

    let maxVoucherNo = '';
    let maxVoucherVal = 0;

    for (let i = 0; i < range.length; i++) {
      const extItem = range[i];
      const voucherNo = extItem.advr_vouchar_no;
      console.log(`[${startIndex + i + 1}/${Math.min(endIndex, recordList.length)}] Migrating Vendor Advance Return: ${voucherNo} (ID: ${extItem.advr_id})...`);

      // Track max voucher for counter sync
      const vVal = extractVoucherNumber(voucherNo);
      if (vVal > maxVoucherVal) {
        maxVoucherVal = vVal;
        maxVoucherNo = voucherNo;
      }

      // 1. Fetch Details to get accountId
      const details = await fetchExternalAdvanceReturnDetails(extItem.advr_id);
      if (!details) {
        console.warn(`  - WARNING: Could not fetch details for ID "${extItem.advr_id}". Skipping...`);
        continue;
      }

      // 2. Map Vendor
      const externalVendorId = String(extItem.advr_vendor_id);
      let matchedVendor = localVendors.find(v => String(v.dataEntryId) === externalVendorId);
      
      if (!matchedVendor && externalVendorId) {
        matchedVendor = await autoCreateVendor(externalVendorId, LOCAL_API_URL, HEADERS_LOCAL, HEADERS_EXTERNAL);
        if (matchedVendor) {
          localVendors.push(matchedVendor);
        }
      }

      if (!matchedVendor) {
        console.warn(`  - WARNING: Could not find or create local vendor for external ID "${externalVendorId}". Using fallback...`);
        matchedVendor = await autoCreateDeletedVendor(localVendors, LOCAL_API_URL, HEADERS_LOCAL);
      }

      if (!matchedVendor) {
        console.warn(`  - WARNING: Could not find or create local vendor for external ID "${externalVendorId}". Skipping...`);
        continue;
      }

      // 3. Map Account
      const externalAccountId = String(details.advr_account_id);
      let matchedAccount = localAccounts.find(a => String(a.dataEntryId) === externalAccountId);
      
      if (!matchedAccount || !externalAccountId) {
        console.warn(`  - WARNING: External account ID "${externalAccountId}" not found. Using fallback...`);
        matchedAccount = await autoCreateDeletedAccount(localAccounts, LOCAL_API_URL, HEADERS_LOCAL);
      }

      if (!matchedAccount) {
        console.warn(`  - WARNING: Could not find or create local account for external ID "${externalAccountId}". Skipping...`);
        continue;
      }

      // 4. Prepare Payload
      const payload = {
        vendorId: matchedVendor.id,
        voucherNo: extItem.advr_vouchar_no,
        returnDate: extItem.return_date ? extItem.return_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        amount: parseFloat(extItem.advr_amount || 0),
        transactionCharge: parseFloat(details.transaction_charge || 0),
        paymentMethod: extItem.advr_pay_type || "Cash",
        accountId: matchedAccount.id,
        accountName: matchedAccount.name,
        note: extItem.advr_note || "",
      };

      // 5. Call Local API (STANDARD ENDPOINT)
      try {
        /**
         * MIGRATION API CHOICE:
         * We are using the standard API (/api/vendors/advance-return) 
         * which has been updated with REVERT comments to handle migration needs.
         */
        const res = await axios.post(`${LOCAL_API_URL}/api/vendors/advance-return`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: Vendor Advance Return added`);
        
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
