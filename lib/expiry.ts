/**
 * Inclusive Membership Validity & Expiry Calculation Policy:
 * - Monthly: start date + 1 calendar month - 1 day
 * - 3 Months: start date + 3 calendar months - 1 day
 * - 6 Months: start date + 6 calendar months - 1 day
 * - Annual: start date + 12 calendar months - 1 day
 */
export function calculateExpiryDate(startDate: Date | string, durationMonths: number): Date {
  const start = new Date(startDate);
  const end = new Date(start);
  
  // Add calendar months
  end.setMonth(end.getMonth() + durationMonths);
  // Subtract 1 day (inclusive validity policy)
  end.setDate(end.getDate() - 1);
  
  // End of day
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getMembershipStatus(endDate: Date | string): "ACTIVE" | "EXPIRING" | "EXPIRED" {
  const now = new Date();
  const end = new Date(endDate);
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "EXPIRED";
  } else if (diffDays <= 30) {
    return "EXPIRING";
  }
  return "ACTIVE";
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
