const axios = require('axios');
const { 
  EXTERNAL_AUTH_TOKEN, 
  LOCAL_API_URL, 
  LOCAL_SESSION_COOKIE, 
  HEADERS_EXTERNAL, 
  HEADERS_LOCAL,
  getLocalData
} = require('./migration-helpers');

/**
 * INVOICE COMPARISON SCRIPT
 * 
 * 1. Fetches all local invoices.
 * 2. Fetches all external invoices (Other, Visa, Non-Commission).
 * 3. Merges external data and compares with local data by invoice number.
 * 4. Summarizes totals and flags discrepancies.
 */

async function fetchExternalList(url, typeName) {
  let allItems = [];
  let page = 1;
  const size = 1000;
  
  while (true) {
    const fetchUrl = `${url}${url.includes('?') ? '&' : '?'}page=${page}&size=${size}`;
    console.log(`  - [External] Fetching ${typeName} (Page ${page})...`);
    try {
      const res = await axios.get(fetchUrl, { headers: HEADERS_EXTERNAL });
      const data = res.data.data || [];
      allItems = allItems.concat(data);
      if (data.length < size) break;
      page++;
    } catch (err) {
      console.error(`  - [External] Error fetching ${typeName} at page ${page}:`, err.message);
      break;
    }
  }
  return allItems;
}

async function runComparison() {
  if (!LOCAL_SESSION_COOKIE) {
    console.error('ERROR: Please provide LOCAL_SESSION_COOKIE in migration-helpers.js');
    process.exit(1);
  }

  try {
    console.log('--- FETCHING DATA ---');
    
    // 1. Fetch Local Invoices
    console.log('Fetching local invoices...');
    const localInvoices = await getLocalData('/api/invoices?page=1&pageSize=10000');
    console.log(`Found ${localInvoices.length} local invoices.`);

    // 2. Fetch External Invoices
    console.log('Fetching external invoices...');
    const extOther = await fetchExternalList('https://trabill.m360ictapi.com/api/v1/invoice-others/all', 'Other Invoices');
    const extVisa = await fetchExternalList('https://trabill.m360ictapi.com/api/v1/invoice-visa', 'Visa Invoices');
    const extNonComm = await fetchExternalList('https://trabill.m360ictapi.com/api/v1/invoice-non-commission', 'Non-Commission Invoices');
    
    const externalInvoices = [...extOther, ...extVisa, ...extNonComm];
    console.log(`Found ${externalInvoices.length} total external invoices.`);

    console.log('\n--- COMPARISON START ---');

    let totalLocalSales = 0;
    let totalLocalPurchase = 0;
    let totalLocalReceived = 0;
    let totalLocalDue = 0;

    let totalExtSales = 0;
    let totalExtPurchase = 0;
    let totalExtReceived = 0;
    let totalExtDue = 0;

    let discrepancies = 0;
    const localMap = new Map(localInvoices.map(inv => [inv.invoiceNo, inv]));

    externalInvoices.forEach(ext => {
      const invNo = ext.invoice_no;
      // Use fields as per terminal response shape
      const extSales = parseFloat(ext.net_total || ext.invoice_net_total || 0);
      const extPurchase = parseFloat(ext.invoice_total_cost || ext.invoice_total_vendor_price || 0);
      const extReceived = parseFloat(ext.invclientpayment_amount || ext.invoice_total_payment || 0);
      const extDue = extSales - extReceived;

      totalExtSales += extSales;
      totalExtPurchase += extPurchase;
      totalExtReceived += extReceived;
      totalExtDue += extDue;

      const local = localMap.get(invNo);
      if (local) {
        const localSales = parseFloat(local.salesPrice || 0);
        const localPurchase = parseFloat(local.totalCost || 0);
        const localReceived = parseFloat(local.receivedAmount || 0);
        const localDue = parseFloat(local.dueAmount || 0);

        totalLocalSales += localSales;
        totalLocalPurchase += localPurchase;
        totalLocalReceived += localReceived;
        totalLocalDue += localDue;

        // Compare individual items
        const salesDiff = Math.abs(localSales - extSales);
        const purchaseDiff = Math.abs(localPurchase - extPurchase);
        const receivedDiff = Math.abs(localReceived - extReceived);
        const dueDiff = Math.abs(localDue - extDue);

        if (salesDiff > 0.01 || purchaseDiff > 0.01 || receivedDiff > 0.01 || dueDiff > 0.01) {
          discrepancies++;
          console.log(`[FLAG] Discrepancy found in ${invNo}:`);
          if (salesDiff > 0.01) console.log(`  - Sales:    Ext ${extSales.toFixed(2)} vs Local ${localSales.toFixed(2)} (Diff: ${salesDiff.toFixed(2)})`);
          if (purchaseDiff > 0.01) console.log(`  - Purchase: Ext ${extPurchase.toFixed(2)} vs Local ${localPurchase.toFixed(2)} (Diff: ${purchaseDiff.toFixed(2)})`);
          if (receivedDiff > 0.01) console.log(`  - Received: Ext ${extReceived.toFixed(2)} vs Local ${localReceived.toFixed(2)} (Diff: ${receivedDiff.toFixed(2)})`);
          if (dueDiff > 0.01) console.log(`  - Due:      Ext ${extDue.toFixed(2)} vs Local ${localDue.toFixed(2)} (Diff: ${dueDiff.toFixed(2)})`);
        }
      } else {
        // console.log(`[MISSING] Invoice ${invNo} found externally but not locally.`);
      }
    });

    console.log('\n--- SUMMARY ---');
    console.log(`Total Invoices Checked (Matched): ${localInvoices.length}`);
    console.log(`Total Discrepancies Found: ${discrepancies}`);
    console.log('----------------------------------------------------');
    console.log('Category      | External        | Local           | Difference');
    console.log('----------------------------------------------------');
    console.log(`Sales Price   | ${totalExtSales.toFixed(2).padStart(15)} | ${totalLocalSales.toFixed(2).padStart(15)} | ${(totalExtSales - totalLocalSales).toFixed(2).padStart(12)}`);
    console.log(`Purchase Amt  | ${totalExtPurchase.toFixed(2).padStart(15)} | ${totalLocalPurchase.toFixed(2).padStart(15)} | ${(totalExtPurchase - totalLocalPurchase).toFixed(2).padStart(12)}`);
    console.log(`Received Amt  | ${totalExtReceived.toFixed(2).padStart(15)} | ${totalLocalReceived.toFixed(2).padStart(15)} | ${(totalExtReceived - totalLocalReceived).toFixed(2).padStart(12)}`);
    console.log(`Due Amount    | ${totalExtDue.toFixed(2).padStart(15)} | ${totalLocalDue.toFixed(2).padStart(15)} | ${(totalExtDue - totalLocalDue).toFixed(2).padStart(12)}`);
    console.log('----------------------------------------------------');

    if (discrepancies === 0) {
      console.log('\n✅ ALL MATCHED: No discrepancies found between local and external records.');
    } else {
      console.log(`\n❌ ATTENTION: Found ${discrepancies} invoices with data differences.`);
    }

  } catch (error) {
    console.error('Comparison Error:', error.message);
  }
}

runComparison();
