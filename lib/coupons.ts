export interface DiscountCoupon {
  code: string;
  discountPercent: number;
  label: string;
  description: string;
}

export const STATIC_COUPONS: DiscountCoupon[] = [
  { code: "MSF10", discountPercent: 10, label: "10% OFF", description: "Special 10% welcome discount" },
  { code: "MSF15", discountPercent: 15, label: "15% OFF", description: "Special 15% promotional discount" },
  { code: "MSF20", discountPercent: 20, label: "20% OFF", description: "Seasonal 20% membership savings" },
  { code: "MSF25", discountPercent: 25, label: "25% OFF", description: "Quarterly privilege 25% discount" },
  { code: "MSF30", discountPercent: 30, label: "30% OFF", description: "VIP Elite 30% membership discount" },
  { code: "MSF35", discountPercent: 35, label: "35% OFF", description: "Festival reward 35% discount" },
  { code: "MSF40", discountPercent: 40, label: "40% OFF", description: "Maximum founder reward 40% discount" },
];

export function findCoupon(code: string): DiscountCoupon | undefined {
  if (!code) return undefined;
  const clean = code.trim().toUpperCase();
  return STATIC_COUPONS.find((c) => c.code === clean);
}
