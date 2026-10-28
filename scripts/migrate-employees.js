const { 
  HEADERS_EXTERNAL, 
  HEADERS_LOCAL,
  LOCAL_API_URL,
  LOCAL_SESSION_COOKIE,
  sleep
} = require('./migration-helpers');
const axios = require('axios');

/**
 * EMPLOYEE MIGRATION SCRIPT
 * 
 * Step 1: Get employees from third-party API
 * Step 2: Call local add-employee API with the same payload as the frontend
 */

async function fetchExternalEmployees() {
  let allEmployees = [];
  let page = 1;
  const size = 100;
  
  while (true) {
    const url = `https://trabill.m360ictapi.com/api/v1/configuration/employee?page=${page}&size=${size}`;
    console.log(`  - [External] Fetching Employees Page ${page}...`);
    try {
      const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
      const data = res.data.data || [];
      allEmployees = allEmployees.concat(data);
      if (data.length < size) break;
      page++;
    } catch (err) {
      console.error(`  - [External] Error fetching employees at page ${page}:`, err.response?.data?.message || err.message);
      break;
    }
  }
  return allEmployees;
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
    console.log('Fetching external employees...');
    const employeesJson = await fetchExternalEmployees();
    console.log(`Found ${employeesJson.length} employees on external API.`);

    const range = employeesJson.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} employees)...`);

    for (let i = 0; i < range.length; i++) {
      const data = range[i];
      console.log(`[${startIndex + i + 1}/${endIndex}] Migrating: ${data.employee_full_name} (ID: ${data.employee_id})...`);

      // Prepare Payload (Same as frontend requirements in route.ts)
      const payload = {
        idCardNo: data.employee_card_id || "",
        name: data.employee_full_name,
        department: data.department_name || "General",
        designation: data.designation_name || "Staff",
        bloodGroup: data.group_name || "",
        salary: parseFloat(data.employee_salary) || 0,
        commission: parseFloat(data.employee_commission) || 0,
        email: data.employee_email || "",
        mobile: data.employee_mobile || "00000000000", // Required by validator
        birthDate: data.employee_birth_date ? data.employee_birth_date.slice(0, 10) : "",
        appointmentDate: data.employee_apppoint_date ? data.employee_apppoint_date.slice(0, 10) : "",
        joiningDate: data.employee_joining_date ? data.employee_joining_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        address: data.employee_address || "",
        active: data.employee_status === 1,
        dataEntryId: String(data.employee_id),
      };

      // Call Local API
      try {
        const res = await axios.post(`${LOCAL_API_URL}/api/employees`, payload, { headers: HEADERS_LOCAL });
        if (res.data.existing) {
          console.log(`  - ALREADY EXISTS: ${data.employee_full_name}`);
        } else {
          console.log(`  - SUCCESS: ${data.employee_full_name} added`);
        }
      } catch (err) {
        console.error(`  - FAILED: ${data.employee_full_name}`, err.response?.data?.message || err.response?.data?.errors || err.message);
      }

      // Small delay to prevent overwhelming the local API
      await sleep(50);
    }

    console.log('\nMigration completed.');
  } catch (error) {
    console.error('Critical Error:', error.message);
  }
}

migrate();
