const axios = require('axios');
const { 
  autoCreateNonInvoiceCompany,
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
 * NON-INVOICE INCOME MIGRATION SCRIPT
 * 
 * Step 1: Get non-invoice income list from third-party API
 * Step 2: Fetch local data for mapping (Accounts, Non-Invoice Companies)
 * Step 3: For each income, map external payload to local
 * Step 4: Call specialized migration API
 */

const PAYMENT_METHOD_MAP = {
  '1': '6a04073c73601487f0db2133', // Cash
  '2': '6a0407a373601487f0db213e', // Bank
  '3': '6a0407a873601487f0db2141', // Mobile banking
  '4': '6a0407b173601487f0db2144'  // Credit Card
};

async function fetchExternalIncomeList(page = 1, size = 1000) {
  const url = `https://trabill.m360ictapi.com/api/v1/accounts/non-invoice-income?page=${page}&size=${size}&from_date=&to_date=&search=`;
  console.log(`  - [External] Fetching List: ${url}`);
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.error(`  - [External] Error fetching income list:`, err.response?.data?.message || err.message);
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
    const localAccounts = await getLocalData('/api/accounts?pageSize=1000');
    const localCompanies = await getLocalData('/api/configuration/companies?page=1&pageSize=10000');

    console.log(`Found ${localAccounts.length} accounts and ${localCompanies.length} non-invoice companies locally.`);

    console.log('Fetching external non-invoice income list...');
    const incomeList = await fetchExternalIncomeList();
    console.log(`Found ${incomeList.length} incomes on external API.`);

    const range = incomeList.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} items)...`);

    let maxVoucherNo = '';
    let maxVoucherVal = 0;

    for (let i = 0; i < range.length; i++) {
      const extItem = range[i];
      const voucherNo = extItem.nonincome_vouchar_no;
      console.log(`[${startIndex + i + 1}/${Math.min(endIndex, incomeList.length)}] Migrating Income: ${voucherNo} (ID: ${extItem.nonincome_id})...`);

      // Track max voucher for counter sync
      const vVal = extractVoucherNumber(voucherNo);
      if (vVal > maxVoucherVal) {
        maxVoucherVal = vVal;
        maxVoucherNo = voucherNo;
      }

      // 1. Map Company
      
      let matchedCompany = localCompanies.find(c => c.dataEntryId == String(extItem.nonincome_company_id));
      if (!matchedCompany && extItem.nonincome_company_id) {
        matchedCompany = await autoCreateNonInvoiceCompany(extItem.nonincome_company_id, LOCAL_API_URL, HEADERS_LOCAL, HEADERS_EXTERNAL);
        if (matchedCompany) {
          localCompanies.push(matchedCompany); // Cache it
        }
      }

      if (!matchedCompany) {
        console.warn(`  - WARNING: Could not find or create local non-invoice company for external ID "${extItem.nonincome_company_id}". Skipping...`);
        continue;
      }

      // 2. Map Account
      let matchedAccount = localAccounts.find(a => String(a.dataEntryId) === String(extItem.account_id));
      if (!matchedAccount) {
        console.warn(`  - WARNING: External account ID "${extItem.account_id}" not found. Using "Deleted Account" fallback...`);
        matchedAccount = await autoCreateDeletedAccount(localAccounts, LOCAL_API_URL, HEADERS_LOCAL);
      }

      if (!matchedAccount) {
        console.warn(`  - WARNING: Could not find or create local account for external ID "${extItem.account_id}". Skipping...`);
        continue;
      }

      // 3. Map Payment Method
      const paymentMethodId = PAYMENT_METHOD_MAP[String(extItem.account_acctype_id)] || extItem.account_acctype_id;

      // 4. Prepare Payload
      const payload = {
        nonInvoiceCompanyId: matchedCompany.id,
        paymentMethod: paymentMethodId,
        accountId: matchedAccount.id,
        amount: parseFloat(extItem.nonincome_amount || 0),
        date: extItem.nonincome_created_date ? extItem.nonincome_created_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        note: extItem.nonincome_note || "",
        voucherNo: extItem.nonincome_vouchar_no,
      };

      // 5. Call Local API
      try {
        // Check for existing voucher first
        const existingRes = await axios.get(`${LOCAL_API_URL}/api/non-invoice-incomes?search=${payload.voucherNo}`, { headers: HEADERS_LOCAL });
        const existing = existingRes.data?.data || [];
        
        if (existing.find(e => e.voucherNo === payload.voucherNo)) {
          console.log(`  - SKIP: Income ${payload.voucherNo} already exists.`);
          continue;
        }

        const res = await axios.post(`${LOCAL_API_URL}/api/non-invoice-incomes`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: Income added`);
        
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
