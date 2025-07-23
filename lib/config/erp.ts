// Configuration for Housing & Transport ERP system
export const ERP_CONFIG = {
  // Housing configuration
  housing: {
    maxOccupancyPerRoom: 4,
    defaultRentProrationMethod: "daily",
    moveInGracePeriod: 3, // days
    moveOutNoticePeriod: 14, // days
  },

  // Transport configuration
  transport: {
    maxPassengersPerTrip: 50,
    defaultCostPerMile: 0.65,
    tripBookingAdvanceHours: 24,
  },

  // Billing configuration
  billing: {
    billingCycleDays: 14, // bi-weekly
    payrollExportFormat: "csv",
    autoCalculateUtilities: true,
    prorationPrecision: 4, // decimal places
  },

  // System configuration
  system: {
    dateFormat: "MM/dd/yyyy",
    timeZone: "America/New_York",
    currency: "USD",
    maxFileUploadSize: 10 * 1024 * 1024, // 10MB
  },
} as const;

export type ERPConfig = typeof ERP_CONFIG;
