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
 * MONEY RECEIPT MIGRATION SCRIPT
 * 
 * Step 1: Get money receipt list from third-party API
 * Step 2: Fetch local clients and accounts for mapping by dataEntryId
 * Step 3: For each receipt, fetch details from external API
 * Step 4: Map external receipt to local payload
 * Step 5: Call local money-receipt API
 */

const PAYMENT_METHOD_MAP = {
  '1': '6a04073c73601487f0db2133', // Cash
  '2': '6a0407a373601487f0db213e', // Bank
  '3': '6a0407a873601487f0db2141', // Mobile banking
  '4': '6a0407b173601487f0db2144'  // Credit Card
};

async function fetchExternalReceiptList(page = 1, size = 1000) {
  const url = `https://trabill.m360ictapi.com/api/v1/money-receipt/all?page=${page}&size=${size}&from_date=&to_date=&search=`;
  console.log(`  - [External] Fetching List: ${url}`);
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.error(`  - [External] Error fetching receipt list:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function fetchExternalReceiptDetails(receiptId) {
  const url = `https://trabill.m360ictapi.com/api/v1/money-receipt/for-edit/${receiptId}`;
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });

    return res.data.data;
  } catch (err) {
    console.error(`  - [External] Error fetching details for receipt ${receiptId}:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function fetchExternalReceiptAllocations(receiptId) {
  const url = `https://trabill.m360ictapi.com/api/v1/money-receipt/view-details/${receiptId}`;
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    // console.log("res.data.data = ", res.data.data)
    return res.data.data || [];
  } catch (err) {
    console.warn(`  - [External] Warning: Error fetching allocations for receipt ${receiptId}:`, err.response?.data?.message || err.message);
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
    const localInvoices = await getLocalData('/api/invoices?page=1&pageSize=10000');
    const localCategories = await getLocalData('/api/clients/client-categories?pageSize=1000');
    const categoriesJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'client_category.json'), 'utf8'));

    console.log(`Found ${localClients.length} clients, ${localAccounts.length} accounts, ${localInvoices.length} invoices, and ${localCategories.length} categories locally.`);

    const invoiceMap = new Map(localInvoices.map(inv => [inv.invoiceNo, inv.id]));

    console.log('Fetching external receipt list...');
    const receiptList = await fetchExternalReceiptList();
    console.log(`Found ${receiptList.length} receipts on external API.`);

    const range = receiptList.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} receipts)...`);

    let maxVoucherNo = '';
    let maxVoucherVal = 0;

    for (let i = 0; i < range.length; i++) {
      const extItem = range[i];
      const voucherNo = extItem.receipt_vouchar_no;
      console.log(`[${startIndex + i + 1}/${Math.min(endIndex, receiptList.length)}] Migrating Receipt: ${voucherNo} (ID: ${extItem.receipt_id})...`);

      // Track max voucher for counter sync
      const vVal = extractVoucherNumber(voucherNo);
      if (vVal > maxVoucherVal) {
        maxVoucherVal = vVal;
        maxVoucherNo = voucherNo;
      }

      // 1. Fetch Detailed Data & Allocations
      const details = await fetchExternalReceiptDetails(extItem.receipt_id);
      if (!details) {
        console.warn(`  - WARNING: Could not fetch details for receipt ${extItem.receipt_id}. Skipping...`);
        continue;
      }

      const externalAllocations = await fetchExternalReceiptAllocations(extItem.receipt_id);
      const invoiceAllocations = [];
      for (const alloc of externalAllocations) {
        const localInvId = invoiceMap.get(alloc.invoice_no);
        if (localInvId) {
          invoiceAllocations.push({
            invoiceId: localInvId,
            amount: parseFloat(alloc.invclientpayment_amount || 0)
          });
        } else {
          console.warn(`    - WARNING: Could not find local invoice "${alloc.invoice_no}" for allocation.`);
        }
      }

      // 2. Map Client
      const externalClientId = details.receipt_combclient ? details.receipt_combclient.split('-')[1]: null;
      let matchedClient = localClients.find(c => String(c.dataEntryId) === String(externalClientId));
      
      if (!matchedClient && externalClientId) {
        matchedClient = await autoCreateClient(externalClientId, localCategories, categoriesJson, LOCAL_API_URL, HEADERS_LOCAL, HEADERS_EXTERNAL);
        if (matchedClient) {
          localClients.push(matchedClient); // Add to local list to prevent re-creation
        }
      }

      if (!matchedClient) {
        console.warn(`  - WARNING: Could not find or create local client for external ID "${externalClientId}". Skipping...`);
        continue;
      }

      // 3. Map Account
      let matchedAccount = localAccounts.find(a => String(a.dataEntryId) === String(details.account_id));
      
      if (!matchedAccount || !details.account_id) {
        console.warn(`  - WARNING: External account ID "${details.account_id}" not found. Using "Deleted Account" fallback...`);
        matchedAccount = await autoCreateDeletedAccount(localAccounts, LOCAL_API_URL, HEADERS_LOCAL);
      }

      if (!matchedAccount) {
        console.warn(`  - WARNING: Could not find or create local account for external ID "${details.account_id}". Skipping...`);
        continue;
      }

      // 4. Map Payment Method (Account Type)
      const paymentMethod = PAYMENT_METHOD_MAP[String(details.receipt_payment_type)];
      if (!paymentMethod) {
        console.warn(`  - WARNING: Could not find mapping for payment type "${details.receipt_payment_type}". Skipping...`);
        continue;
      }

      // 5. Prepare Payload (aligned with ReceiptFormModal.tsx)
      let paymentTo = (details.receipt_payment_to || "OVERALL").toLowerCase();
      if (paymentTo === "overall") paymentTo = "overall";
      if (paymentTo === "advance payment") paymentTo = "advance";
      if (paymentTo === "specific invoice") paymentTo = "invoice";
      if (paymentTo === "specific tickets") paymentTo = "tickets";
      if (paymentTo === "adjust with due") paymentTo = "adjust";
console.log("charge_amount: => ",details.charge_amount)
      const payload = {
        voucherNo: extItem.receipt_vouchar_no,
        clientId: matchedClient.id,
        paymentTo: paymentTo,
        paymentMethod: paymentMethod,
        accountId: matchedAccount.id,
        manualReceiptNo: details.receipt_money_receipt_no || "",
        amount: parseFloat(details.receipt_total_amount || 0),
        discount: parseFloat(details.receipt_total_discount || 0),
        transactionCharge: parseFloat(details.charge_amount || 0),
        paymentDate: details.receipt_payment_date ? details.receipt_payment_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        note: details.receipt_note || "",
        docOneName: details.receipt_scan_copy || undefined,
        docTwoName: details.receipt_scan_copy2 || undefined,
        invoiceAllocations: invoiceAllocations.length > 0 ? invoiceAllocations : undefined,
        manualAllocationOnly: true, // Tell backend to ONLY use our explicit allocations (or none if empty)
      };

      // Special handling for INVOICE type if allocations exist
      // Note: We don't have the external allocation structure from the snippet, 
      // but if the external API provides it in details, we could map it to invoiceAllocations.
      // For now, we assume overall distribution if no specific invoice is provided.
      // 6. Call Local API (MIGRATION ENDPOINT)
      try {
        /**
         * MIGRATION API CHOICE:
         * We are using the specialized migration API (/api/migrate/money-receipts) 
         * which has relaxed validations (allows duplicate voucherNo, zero amounts, etc).
         * 
         * TO USE EXISTING API:
         * 1. Change endpoint to `${LOCAL_API_URL}/api/money-receipts`
         * 2. Go to moneyReceiptService.ts -> createMoneyReceipt and uncomment/re-apply REVERT 1-6
         */

        // console.log("payload => ",payload)
        const res = await axios.post(`${LOCAL_API_URL}/api/migrate/money-receipts`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: ${res.data.ok || res.status === 200 ? "Receipt added" : "Failed"}`);
        
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
