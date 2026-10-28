const axios = require('axios');
const { 
  EXTERNAL_AUTH_TOKEN, 
  LOCAL_API_URL, 
  LOCAL_SESSION_COOKIE, 
  HEADERS_EXTERNAL, 
  HEADERS_LOCAL,
  sleep
} = require('./migration-helpers');

/**
 * EXPENSE HEAD MIGRATION SCRIPT
 * 
 * Step 1: Get expense head list from third-party API
 * Step 2: Map each external head to local payload
 * Step 3: Call local add-expense-head API
 */

async function fetchExternalExpenseHeadList(page = 1, size = 1000) {
  const url = `https://trabill.m360ictapi.com/api/v1/configuration/expense_head?page=${page}&size=${size}`;
  console.log(`  - [External] Fetching: ${url}`);
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.error(`  - [External] Error fetching expense head list:`, err.response?.data?.message || err.message);
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
    console.log('Fetching external expense head list...');
    const headList = await fetchExternalExpenseHeadList();
    console.log(`Found ${headList.length} expense heads on external API.`);

    const range = headList.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} heads)...`);

    for (let i = 0; i < range.length; i++) {
      const ext = range[i];
      console.log(`[${startIndex + i + 1}/${Math.min(endIndex, headList.length)}] Migrating: ${ext.head_name} (ID: ${ext.head_id})...`);

      // 1. Prepare Payload
      const payload = {
        name: ext.head_name,
        dataEntryId: String(ext.head_id),
        createdAt: ext.head_create_date,
      };

      // 2. Call Local API
      try {
        const res = await axios.post(`${LOCAL_API_URL}/api/expense-heads`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: ${res.data.message || "Expense head added"}`);
        
        // Brief sleep
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
