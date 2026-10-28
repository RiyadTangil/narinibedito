const axios = require("axios");
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
  syncCounter,
} = require("./migration-helpers");

/**
 * VENDOR PAYMENT MIGRATION SCRIPT
 *
 * Step 1: Get vendor payment list from third-party API
 * Step 2: Fetch local vendors and accounts for mapping by dataEntryId
 * Step 3: For each payment, fetch details and allocations from external API
 * Step 4: Map external payment to local payload
 * Step 5: Call local vendor-payment API
 * Step 6: Create allocations if applicable
 */

const PAYMENT_METHOD_MAP = {
  1: "6a04073c73601487f0db2133", // Cash
  2: "6a0407a373601487f0db213e", // Bank
  3: "6a0407a873601487f0db2141", // Mobile banking
  4: "6a0407b173601487f0db2144", // Credit Card
};

async function fetchExternalPaymentList(page = 1, size = 1000) {
  const url = `https://trabill.m360ictapi.com/api/v1/vendors/vendor-payments?page=${page}&size=${size}&search=`;
  console.log(`  - [External] Fetching List: ${url}`);
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.error(
      `  - [External] Error fetching payment list:`,
      err.response?.data?.message || err.message,
    );
    return [];
  }
}

async function fetchExternalPaymentDetails(paymentId) {
  const url = `https://trabill.m360ictapi.com/api/v1/vendors/get-vpay-for-edit/${paymentId}`;
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data;
  } catch (err) {
    console.error(
      `  - [External] Error fetching details for payment ${paymentId}:`,
      err.response?.data?.message || err.message,
    );
    return null;
  }
}

async function fetchExternalPaymentAllocations(paymentId) {
  const url = `https://trabill.m360ictapi.com/api/v1/vendors/view-vendor-payment-details/${paymentId}`;
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.warn(
      `  - [External] Warning: Error fetching allocations for payment ${paymentId}:`,
      err.response?.data?.message || err.message,
    );
    return [];
  }
}

async function migrate() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const endIndex = parseInt(args[1]) || 1000;

  if (!LOCAL_SESSION_COOKIE) {
    console.error(
      "ERROR: Please provide LOCAL_SESSION_COOKIE in the script configuration.",
    );
    process.exit(1);
  }

  try {
    console.log("Fetching local data for mapping...");
    const localVendors = await getLocalData("/api/vendors?pageSize=10000");
    const localAccounts = await getLocalData("/api/accounts?pageSize=1000");
    const localInvoices = await getLocalData(
      "/api/invoices?page=1&pageSize=10000",
    );

    console.log(
      `Found ${localVendors.length} vendors, ${localAccounts.length} accounts, and ${localInvoices.length} invoices locally.`,
    );

    const invoiceMap = new Map();
    localInvoices.forEach((inv) => {
      if (inv.invoiceNo) invoiceMap.set(inv.invoiceNo, inv.id);
      if (inv.dataEntryId) invoiceMap.set(String(inv.dataEntryId), inv.id);
    });

    console.log("Fetching external vendor payment list...");
    const paymentList = await fetchExternalPaymentList();
    console.log(`Found ${paymentList.length} vendor payments on external API.`);

    const range = paymentList.slice(startIndex, endIndex);
    console.log(
      `Processing range ${startIndex} to ${endIndex} (${range.length} payments)...`,
    );

    let maxVoucherNo = "";
    let maxVoucherVal = 0;

    for (let i = 0; i < range.length; i++) {
      const extItem = range[i];
      const voucherNo = extItem.vouchar_no;
      console.log(
        `[${startIndex + i + 1}/${Math.min(endIndex, paymentList.length)}] Migrating Payment: ${voucherNo} (ID: ${extItem.vpay_id})...`,
      );

      // Track max voucher for counter sync
      const vVal = extractVoucherNumber(voucherNo);
      if (vVal > maxVoucherVal) {
        maxVoucherVal = vVal;
        maxVoucherNo = voucherNo;
      }

      // 1. Fetch Detailed Data & Allocations
      const details = await fetchExternalPaymentDetails(extItem.vpay_id);

      // console.log("extItem => ", extItem);
      // console.log("details => ", details);
      if (!details) {
        console.warn(
          `  - WARNING: Could not fetch details for payment ${extItem.vpay_id}. Skipping...`,
        );
        continue;
      }

      const externalAllocations = await fetchExternalPaymentAllocations(
        extItem.vpay_id,
      );

      // 2. Map Vendor
      let externalVendorId = details.com_vendor
        ? details.com_vendor.replace("vendor-", "")
        : extItem.vpay_vendor_id;

      // Fallback for invoice/ticket specific payments where main vendor ID is null
      if (
        !externalVendorId ||
        externalVendorId === "null" ||
        externalVendorId === null
      ) {
        const specificVendor =
          details.specific_inv_vendors?.[0]?.comb_vendor_specific_invoice ||
          details.tickets?.[0]?.invendorpay_comb_vendor ||
          extItem.getInvoiceVendors?.[0]?.invendorpay_comb_vendor;
        if (specificVendor) {
          externalVendorId = String(specificVendor).replace("vendor-", "");
        }
      }

      let matchedVendor = localVendors.find(
        (v) => String(v.dataEntryId) === String(externalVendorId),
      );

      if (
        (!matchedVendor || !externalVendorId || externalVendorId === "null") &&
        (details.com_vendor || extItem.vpay_vendor_id)
      ) {
        const vendorToFetch =
          externalVendorId && externalVendorId !== "null"
            ? externalVendorId
            : null;
        if (vendorToFetch) {
          matchedVendor = await autoCreateVendor(
            vendorToFetch,
            LOCAL_API_URL,
            HEADERS_LOCAL,
            HEADERS_EXTERNAL,
          );
        }
      }

      if (!matchedVendor) {
        console.warn(
          `  - WARNING: External vendor ID "${externalVendorId}" not found. Using "Deleted Vendor" fallback...`,
        );
        matchedVendor = await autoCreateDeletedVendor(
          localVendors,
          LOCAL_API_URL,
          HEADERS_LOCAL,
        );
      }

      if (!matchedVendor) {
        console.warn(
          `  - WARNING: Could not find or create local vendor for external ID "${externalVendorId}". Skipping...`,
        );
        continue;
      }

      // 3. Map Account
      let matchedAccount = localAccounts.find(
        (a) => String(a.dataEntryId) === String(details.account_id),
      );

      if (!matchedAccount || !details.account_id) {
        console.warn(
          `  - WARNING: External account ID "${details.account_id}" not found. Using "Deleted Account" fallback...`,
        );
        matchedAccount = await autoCreateDeletedAccount(
          localAccounts,
          LOCAL_API_URL,
          HEADERS_LOCAL,
        );
      }

      if (!matchedAccount) {
        console.warn(
          `  - WARNING: Could not find or create local account for external ID "${details.account_id}". Skipping...`,
        );
        continue;
      }

      // 4. Map Payment Method (Account Type)
      const paymentMethodId =
        PAYMENT_METHOD_MAP[String(details.payment_method_id)] ||
        details.payment_method_id;

      // 5. Prepare Payload
      let paymentTo = (details.vpay_payment_to || "VENDOR").toLowerCase();
      if (paymentTo === "vendor") paymentTo = "overall";
      if (paymentTo === "specific invoice") paymentTo = "invoice";
      if (paymentTo === "advance payment") paymentTo = "advance";
      if (paymentTo === "ticket") paymentTo = "ticket";

      const invoiceVendors = [];
      let localInvoiceId = null;

      // Find local invoice if it's invoice or ticket specific
      if (["invoice", "ticket"].includes(paymentTo)) {
        const extInvoiceNo = details.invoice_no || extItem.invoice_no;
        localInvoiceId = invoiceMap.get(extInvoiceNo);

        if (localInvoiceId) {
          // Fetch items for this invoice to map to invoiceItemId
          try {
            const invDetailsRes = await axios.get(
              `${LOCAL_API_URL}/api/invoices/${localInvoiceId}`,
              { headers: HEADERS_LOCAL },
            );

            // console.log("invDetailsRes=>", invDetailsRes.data.data.invoice.billing.items);
            const invItems = invDetailsRes.data?.data?.invoice?.billing?.items || [];

            if (paymentTo === "invoice") {
              // Map specific_inv_vendors to local items
              const extAllocs = details.specific_inv_vendors || [];
              for (const extAlloc of extAllocs) {
                const specificVendor =
                  extAlloc.comb_vendor_specific_invoice ||
                  extAlloc.invendorpay_comb_vendor;
                if (!specificVendor) continue;

                const extVId = String(specificVendor).replace("vendor-", "");
                const localV = localVendors.find(
                  (v) => String(v.dataEntryId) === extVId,
                );

                if (localV) {

                  // Find any item for this vendor in this invoice
                  const matchedItem = invItems.find(
                    (item) => String(item.vendorId) === String(localV.id),
                  );

                  if (matchedItem) {
                    invoiceVendors.push({
                      vendorId: localV.id,
                      invoiceItemId: matchedItem._id,
                      amount: parseFloat(
                        extAlloc.specific_inv_amount ||
                          extAlloc.invendorpay_amount ||
                          0,
                      ),
                    });
                  }
                }
              }
            } else if (paymentTo === "ticket") {
              // Map tickets to local items using ticketNo
              const extTickets = details.tickets || [];
              for (const extTicket of extTickets) {
                const extTicketNo = extTicket.invendorpay_ticket_no;
                const extVId = String(
                  extTicket.invendorpay_comb_vendor || extTicket.comb_vendor,
                ).replace("vendor-", "");
                const localV = localVendors.find(
                  (v) => String(v.dataEntryId) === extVId,
                );

                if (localV) {
                  const matchedItem = invItems.find(
                    (item) =>
                      (item.ticketMetadata?.ticketNo === extTicketNo ||
                        item.description === extTicketNo) &&
                      String(item.vendorId) === String(localV.id),
                  );
                  if (matchedItem) {
                    invoiceVendors.push({
                      vendorId: localV.id,
                      invoiceItemId: matchedItem.id,
                      amount: parseFloat(extTicket.invendorpay_amount || 0),
                    });
                  }
                }
              }
            }
          } catch (err) {
            console.warn(
              `    - Warning: Failed to fetch invoice items for ${localInvoiceId}: ${err.message}`,
            );
          }
        }
      }

      const payload = {
        voucherNo: extItem.vouchar_no,
        vendorId: matchedVendor.id,
        invoiceId: localInvoiceId,
        paymentTo: paymentTo,
        paymentMethod: paymentMethodId,
        accountId: matchedAccount.id,
        receiptNo: details.vpay_receipt || "",
        amount: parseFloat(details.payment_amount || 0),
        transactionCharge: parseFloat(details.online_charge || 0),
        vendorAit: parseFloat(details.vendor_ait || 0),
        totalAmount:
          parseFloat(details.payment_amount || 0) +
          parseFloat(details.vendor_ait || 0) +
          parseFloat(details.online_charge || 0),
        date: details.payment_date
          ? details.payment_date.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        note: details.note || "",
        voucher: details.vpay_voucher_copy
          ? `https://m360ict.s3.ap-south-1.amazonaws.com/trabill-storage/${details.vpay_voucher_copy}`
          : undefined,
        referPassport: (details.has_refer_passport || "NO").toLowerCase(),
        passportNo: details.passportNo || "",
        invoiceVendors: invoiceVendors,
        manualAllocationOnly: true, // Tell backend to skip auto-allocation during creation
      };

      // console.log("payload => ", payload);

      // 6. Call Local API
      try {
        // First check if payment already exists to avoid duplicate voucher errors
        const existingPayments = await getLocalData(
          `/api/vendors/payment?search=${payload.voucherNo}`,
        );
        let createdId = existingPayments.find(
          (p) => p.voucherNo === payload.voucherNo,
        )?.id;

        if (!createdId) {
          /**
           * MIGRATION API CHOICE:
           * We are using the specialized migration API (/api/migrate/vendor-payments)
           * which has relaxed validations (allows duplicate voucherNo, zero amounts, etc).
           *
           * TO USE EXISTING API:
           * 1. Change endpoint to `${LOCAL_API_URL}/api/vendors/payment`
           * 2. Go to vendorPaymentService.ts -> createVendorPayment and uncomment/re-apply REVERT 1-5
           */
          const res = await axios.post(
            `${LOCAL_API_URL}/api/migrate/vendor-payments`,
            payload,
            { headers: HEADERS_LOCAL },
          );
          createdId = res.data.id || res.data._id || res.data.created?._id;
          console.log(`  - SUCCESS: Payment added`);
        } else {
          console.log(
            `  - INFO: Payment ${payload.voucherNo} already exists. Syncing allocations...`,
          );
        }

        // 7. Handle Post-Payment Allocations (only for overall/advance payments)
        // For invoice/ticket payments, allocations are already handled via invoiceVendors in the payload
        if (
          createdId &&
          externalAllocations.length > 0 &&
          !["invoice", "ticket"].includes(paymentTo)
        ) {
          console.log(
            `    - Creating ${externalAllocations.length} allocations...`,
          );
          const localAllocations = [];
          for (const alloc of externalAllocations) {
            const localInvId = invoiceMap.get(alloc.invoice_no);
            if (localInvId) {
              localAllocations.push({
                invoiceId: localInvId,
                amount: parseFloat(alloc.invendorpay_amount || 0),
                paymentDate: payload.date,
              });
            } else {
              console.warn(
                `    - WARNING: Could not find local invoice "${alloc.invoice_no}" for allocation.`,
              );
            }
          }

          if (localAllocations.length > 0) {
            try {
              /**
               * MIGRATION ALLOCATIONS API CHOICE:
               * Using /api/migrate/vendor-payments/${createdId}/allocations for relaxed rules.
               *
               * TO USE EXISTING API:
               * 1. Change endpoint to `${LOCAL_API_URL}/api/vendors/payment/${createdId}/allocations`
               * 2. Go to vendorPaymentService.ts -> createVendorPaymentAllocations and re-apply REVERT 1-3
               */
              await axios.post(
                `${LOCAL_API_URL}/api/migrate/vendor-payments/${createdId}/allocations`,
                { allocations: localAllocations },
                { headers: HEADERS_LOCAL },
              );
              console.log(`    - SUCCESS: Allocations created.`);
            } catch (allocErr) {
              console.error(
                `    - FAILED to create allocations:`,
                allocErr.response?.data?.message || allocErr.message,
              );
            }
          }
        }

        // Brief sleep to prevent overwhelming the server
        await sleep(500);
      } catch (err) {
        console.error(
          `  - FAILED:`,
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message,
        );
        if (err.response?.data?.details) {
          console.error(
            `    Details:`,
            JSON.stringify(err.response.data.details),
          );
        }
      }
    }

    // Sync counter after migration
    // if (maxVoucherNo) {
    //   await syncCounter(maxVoucherNo);
    // }

    console.log("\nMigration completed.");
  } catch (error) {
    console.error("Critical Error:", error.message);
  }
}

migrate();
