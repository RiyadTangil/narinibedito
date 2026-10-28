const { 
  HEADERS_EXTERNAL, 
  HEADERS_LOCAL,
  LOCAL_API_URL,
  LOCAL_SESSION_COOKIE,
  sleep
} = require('./migration-helpers');
const axios = require('axios');

/**
 * AGENT MIGRATION SCRIPT
 * 
 * Step 1: Get agents from third-party API
 * Step 2: Call local add-agent API with the same payload as the frontend
 */

async function fetchExternalAgents() {
  let allAgents = [];
  let page = 1;
  const size = 100;
  
  while (true) {
    const url = `https://trabill.m360ictapi.com/api/v1/agent-profile/get-all?page=${page}&size=${size}&search=`;
    console.log(`  - [External] Fetching Agents Page ${page}...`);
    try {
      const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
      const data = res.data.data || [];
      allAgents = allAgents.concat(data);
      if (data.length < size) break;
      page++;
    } catch (err) {
      console.error(`  - [External] Error fetching agents at page ${page}:`, err.response?.data?.message || err.message);
      break;
    }
  }
  return allAgents;
}

async function fetchExternalAgentDetails(agentId) {
  const url = `https://trabill.m360ictapi.com/api/v1/agent-profile/agent/${agentId}`;
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data?.[0] || null;
  } catch (err) {
    console.error(`  - [External] Error fetching agent details for ID ${agentId}:`, err.message);
    return null;
  }
}

async function migrate() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const endIndex = parseInt(args[1]) || 10000;

  if (!LOCAL_SESSION_COOKIE) {
    console.error('ERROR: Please provide LOCAL_SESSION_COOKIE in the script configuration.');
    process.exit(1);
  }

  try {
    console.log('Fetching external agents...');
    const agentsJson = await fetchExternalAgents();
    console.log(`Found ${agentsJson.length} agents on external API.`);

    const range = agentsJson.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} agents)...`);

    for (let i = 0; i < range.length; i++) {
      const agentRef = range[i];
      console.log(`[${startIndex + i + 1}/${endIndex}] Migrating: ${agentRef.agent_name} (ID: ${agentRef.agent_id})...`);

      // 1. Get External Detailed Data (for address, nid, etc.)
      const details = await fetchExternalAgentDetails(agentRef.agent_id);
      if (!details) {
        console.log(`    - Using basic data from list as details fetch failed.`);
      }
      const data = details || agentRef;

      // 2. Prepare Payload (Same as frontend)
      const payload = {
        name: data.agent_name,
        email: data.agent_email || "",
        mobile: data.agent_mobile || "",
        commissionRate: parseFloat(data.agent_commission_rate) || 0,
        address: data.agent_address || "",
        nid: data.agent_nid_no || "",
        openingBalanceType: data.agent_op_balance_type === "ADVANCE" ? "Advance" : "Due",
        dob: data.agent_date_of_birth || "",
        agentPhoto: data.agent_image_copy || "",
        nidFront: data.agent_nid_front || "",
        nidBack: data.agent_nid_back || "",
        dataEntryId: String(data.agent_id),
        createdAt: data.agent_create_date,
      };

      // 3. Call Local API
      try {
        const res = await axios.post(`${LOCAL_API_URL}/api/agents`, payload, { headers: HEADERS_LOCAL });
        if (res.data.existing) {
          console.log(`  - ALREADY EXISTS: ${data.agent_name}`);
        } else {
          console.log(`  - SUCCESS: ${data.agent_name} added`);
        }
      } catch (err) {
        console.error(`  - FAILED:`, err.response?.data?.message || err.message);
      }

      // Small delay to prevent overwhelming the local API
      await sleep(100);
    }

    console.log('\nMigration completed.');
  } catch (error) {
    console.error('Critical Error:', error.message);
  }
}

migrate();
