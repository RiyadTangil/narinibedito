/**
 * Order status and payment constants with numeric enum storage per workspace standards.
 */

export const ORDER_STATUS = {
  PENDING: 1,
  CONFIRMED: 2,
  PROCESSING: 3,
  SHIPPED: 4,
  DELIVERED: 5,
  CANCELLED: 6,
} as const;

export type OrderStatusValue = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_MAP: Record<number, { labelBn: string; labelEn: string; color: string; step: number }> = {
  [ORDER_STATUS.PENDING]: {
    labelBn: "অর্ডার গ্রহণ করা হয়েছে (পেন্ডিং)",
    labelEn: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    step: 1,
  },
  [ORDER_STATUS.CONFIRMED]: {
    labelBn: "অর্ডার কনফার্মড",
    labelEn: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    step: 2,
  },
  [ORDER_STATUS.PROCESSING]: {
    labelBn: "পার্সেল প্রস্তুত হচ্ছে",
    labelEn: "Processing",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    step: 3,
  },
  [ORDER_STATUS.SHIPPED]: {
    labelBn: "ডেলিভারিতে আছে (কুরিয়ারে হস্তান্তর)",
    labelEn: "Shipped",
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    step: 4,
  },
  [ORDER_STATUS.DELIVERED]: {
    labelBn: "ডেলিভারি সম্পন্ন",
    labelEn: "Delivered",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    step: 5,
  },
  [ORDER_STATUS.CANCELLED]: {
    labelBn: "অর্ডার বাতিল",
    labelEn: "Cancelled",
    color: "bg-rose-100 text-rose-800 border-rose-300",
    step: 0,
  },
};

export const PAYMENT_METHOD = {
  CASH_ON_DELIVERY: 1,
  BKASH: 2,
  NAGAD: 3,
} as const;

export const PAYMENT_METHOD_MAP: Record<number, { labelBn: string; labelEn: string }> = {
  [PAYMENT_METHOD.CASH_ON_DELIVERY]: { labelBn: "ক্যাশ অন ডেলিভারি", labelEn: "Cash on Delivery" },
  [PAYMENT_METHOD.BKASH]: { labelBn: "বিকাশ", labelEn: "bKash" },
  [PAYMENT_METHOD.NAGAD]: { labelBn: "নগদ", labelEn: "Nagad" },
};
