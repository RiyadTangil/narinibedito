const axios = require('axios');
const { 
  EXTERNAL_AUTH_TOKEN, 
  LOCAL_API_URL, 
  LOCAL_SESSION_COOKIE, 
  HEADERS_EXTERNAL, 
  HEADERS_LOCAL, 
  extractVoucherNumber,
  syncCounter
} = require('./migration-helpers');

/**
 * EXPENSE MIGRATION SCRIPT
 * 
 * Step 1: Get expense list from third-party API
 * Step 2: Fetch local accounts and expense heads for mapping by dataEntryId
 * Step 3: For each expense, fetch details from external API
 * Step 4: Map each external expense to local payload
 * Step 5: Call local add-expense API
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchExternalExpenseList(page = 1, size = 1000) {
  const url = `https://trabill.m360ictapi.com/api/v1/expense?page=${page}&size=${size}&from_date=&to_date=&search=`;
  console.log(`  - [External] Fetching List: ${url}`);
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.error(`  - [External] Error fetching expense list:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function fetchExternalExpenseDetails(expenseId) {
  const url = `https://trabill.m360ictapi.com/api/v1/expense/${expenseId}`;
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data;
  } catch (err) {
    console.error(`  - [External] Error fetching details for expense ${expenseId}:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function getLocalAccounts() {
  try {
    const res = await axios.get(`${LOCAL_API_URL}/api/accounts?pageSize=1000`, { headers: HEADERS_LOCAL });
    return res.data?.data || [];
  } catch (err) {
    console.error(`  - [Local] Error fetching accounts:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function getLocalExpenseHeads() {
  try {
    const res = await axios.get(`${LOCAL_API_URL}/api/expense-heads?pageSize=1000`, { headers: HEADERS_LOCAL });
    return res.data?.data?.items || [];
  } catch (err) {
    console.error(`  - [Local] Error fetching expense heads:`, err.response?.data?.message || err.message);
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
    const localAccounts = await getLocalAccounts();
    const localHeads = await getLocalExpenseHeads();
    console.log(`Found ${localAccounts.length} accounts and ${localHeads.length} expense heads locally.`);

    console.log('Fetching external expense list...');
    const expenseList = await fetchExternalExpenseList();
    console.log(`Found ${expenseList.length} expenses on external API.`);

    const range = expenseList.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} expenses)...`);

    let maxVoucherNo = '';
    let maxVoucherVal = 0;

    for (let i = 0; i < range.length; i++) {
      const extItem = range[i];
      const sourceTotal = parseFloat(extItem.expense_total_amount || 0);
      const voucherNo = extItem.expense_vouchar_no;
      console.log(`[${startIndex + i + 1}/${Math.min(endIndex, expenseList.length)}] Migrating Expense: ${voucherNo} (ID: ${extItem.expense_id}) | Source Amount: ${sourceTotal}...`);

      // Track max voucher for counter sync
      const vVal = extractVoucherNumber(voucherNo);
      if (vVal > maxVoucherVal) {
        maxVoucherVal = vVal;
        maxVoucherNo = voucherNo;
      }

      // 1. Fetch Detailed Data
      const details = await fetchExternalExpenseDetails(extItem.expense_id);
      if (!details) {
        console.warn(`  - WARNING: Could not fetch details for expense ${extItem.expense_id}. Skipping...`);
        continue;
      }

      // 2. Map Account
      const matchedAccount = localAccounts.find(a => String(a.dataEntryId) === String(details.account_id));
      if (!matchedAccount) {
        console.warn(`  - WARNING: Could not find local account for external ID "${details.account_id}". Skipping...`);
        continue;
      }

      // 3. Map Items (Expense Heads)
      const mappedItems = [];
      let itemsSum = 0;
      for (const item of (details.expense_details || [])) {
        let matchedHead = localHeads.find(h => String(h.dataEntryId) === String(item.expdetails_head_id));
        
        // --- AUTO-CREATE DELETED HEADS ---
        if (!matchedHead) {
          console.warn(`    - WARNING: Missing head "${item.head_name}" (ID: ${item.expdetails_head_id}). Auto-creating as deleted...`);
          try {
            const headPayload = {
              name: item.head_name || "Unknown Head",
              dataEntryId: String(item.expdetails_head_id),
              deleted: true,
              createdAt: details.expense_created_date
            };
            const headRes = await axios.post(`${LOCAL_API_URL}/api/expense-heads`, headPayload, { headers: HEADERS_LOCAL });
            if (headRes.data?.success) {
              const newHead = headRes.data.data;
              matchedHead = { id: newHead.id, name: newHead.name, dataEntryId: newHead.dataEntryId };
              localHeads.push(matchedHead); 
              console.log(`    - SUCCESS: Created missing head "${newHead.name}"`);
            }
          } catch (headErr) {
            console.error(`    - FAILED: Could not auto-create missing head:`, headErr.response?.data?.message || headErr.message);
          }
        }

        if (matchedHead) {
          const itemAmount = parseFloat(item.expdetails_amount || 0);
          itemsSum += itemAmount;
          mappedItems.push({
            headId: matchedHead.id,
            headName: matchedHead.name,
            amount: itemAmount
          });
        }
      }

      // --- HANDLE DISCREPANCIES (Transaction Charges etc.) ---
      // If items total doesn't match the expense total, we capture it in the transactionCharge field.
      const diff = sourceTotal - itemsSum;
      let transactionCharge = 0;
      if (Math.abs(diff) > 0.001) {
        console.warn(`    - DISCREPANCY DETECTED: Source Total (${sourceTotal}) != Items Sum (${itemsSum}). Mapping Diff (${diff.toFixed(2)}) to transactionCharge field.`);
        transactionCharge = parseFloat(diff.toFixed(2));
      }

      if (mappedItems.length === 0) {
        console.warn(`  - WARNING: No valid items found for expense ${extItem.expense_id}. Skipping...`);
        continue;
      }

      // 4. Prepare Payload
      const payload = {
        date: details.expense_date,
        accountId: matchedAccount.id,
        paymentMethod: details.acctype_name || extItem.acctype_name || "Cash", 
        items: mappedItems,
        transactionCharge: transactionCharge,
        note: details.expense_note || "",
        voucherImage1: details.expense_voucher_url_1 || undefined,
        voucherImage2: details.expense_voucher_url_2 || undefined,
        voucherNo: details.expense_vouchar_no,
        createdAt: extItem.expense_created_date,
      };

      // 5. Call Local API
      try {
        const res = await axios.post(`${LOCAL_API_URL}/api/expenses`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: ${res.data.ok ? "Expense added" : "Failed"}`);
        
        // Brief sleep
        await sleep(500);
      } catch (err) {
        console.error(`  - FAILED:`, err.response?.data?.error || err.response?.data?.message || err.message);
        if (err.response?.data?.details) {
          console.error(`    Details:`, JSON.stringify(err.response.data.details));
        }
      }
    }

    // Sync counter after migration
    if (maxVoucherNo) {
      await syncCounter(maxVoucherNo);
    }

    console.log('\nMigration loop completed.');
    
    // 6. Verification and Cleanup
    await verifyAndCleanup(expenseList);

  } catch (error) {
    console.error('Critical Error:', error.message);
  }
}

async function verifyAndCleanup(expenseList) {
  console.log('\n--- VERIFICATION & SYNC PHASE ---');
  try {
    const res = await axios.get(`${LOCAL_API_URL}/api/expenses?pageSize=1000`, { headers: HEADERS_LOCAL });
    const localExpenses = res.data?.items || [];
    console.log(`Checking ${localExpenses.length} local records against ${expenseList.length} external records...`);

    let syncCount = 0;
    for (const local of localExpenses) {
      const external = expenseList.find(ext => ext.expense_vouchar_no === local.voucherNo);
      
      if (!external) continue;

      const extTotal = parseFloat(external.expense_total_amount || 0);
      const locTotal = parseFloat(local.totalAmount || 0);

      // If amount mismatch > 0.01, update the transactionCharge to sync the totals
      if (Math.abs(extTotal - locTotal) > 0.01) {
        console.warn(`  - [Mismatch] ${local.voucherNo}: External(${extTotal}) != Local(${locTotal}). Syncing via Transaction Charge...`);
        try {
          // 1. Fetch full local details to get existing items (needed for PUT)
          const detailRes = await axios.get(`${LOCAL_API_URL}/api/expenses/${local.id}`, { headers: HEADERS_LOCAL });
          const fullDetail = detailRes.data;

          if (!fullDetail) {
            console.error(`    - Could not fetch details for ${local.voucherNo}. Skipping sync.`);
            continue;
          }

          // 2. Calculate new transactionCharge
          // itemsSum = local.totalAmount - local.transactionCharge
          // we want itemsSum + newTransactionCharge = extTotal
          // so newTransactionCharge = extTotal - (local.totalAmount - local.transactionCharge)
          const currentCharge = parseFloat(local.transactionCharge || 0);
          const newCharge = parseFloat((extTotal - (locTotal - currentCharge)).toFixed(2));

          const updatePayload = {
            date: fullDetail.date,
            accountId: fullDetail.accountId,
            paymentMethod: fullDetail.paymentMethod || "Cash",
            items: fullDetail.items.map(it => ({
              headId: it.headId,
              headName: it.headName,
              amount: it.amount
            })),
            transactionCharge: newCharge,
            note: fullDetail.note,
            voucherImage1: fullDetail.voucherImage1,
            voucherImage2: fullDetail.voucherImage2
          };

          await axios.put(`${LOCAL_API_URL}/api/expenses/${local.id}`, updatePayload, { headers: HEADERS_LOCAL });
          console.log(`    - SUCCESS: Synced ${local.voucherNo}. New Transaction Charge: ${newCharge}`);
          syncCount++;
        } catch (syncErr) {
          console.error(`    - FAILED to sync ${local.voucherNo}:`, syncErr.response?.data?.message || syncErr.message);
        }
      }
    }
    
    if (syncCount === 0) {
      console.log('SUCCESS: All local records are consistent with source totals.');
    } else {
      console.log(`Verification complete. Synced ${syncCount} mismatched records via Transaction Charge.`);
    }
  } catch (err) {
    console.error('Error during verification phase:', err.message);
  }
}

migrate();
