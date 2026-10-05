/**
 * TellerBud Reservation Fee Utility
 *
 * Implements the approved dynamic Reservation Fee formula for:
 * 1. Cash Pickup (TB-SVC-CP-001)
 * 2. Agent-to-Agent Liquidity (TB-SVC-A2A-004)
 *
 * Formula:
 * Full Reservation Fee = (1.2% × Reservation Amount) + (ZMW 0.10 × Number of Minutes) + ZMW 20.00
 *
 * Customer/Requester Visibility: 100% of Full Reservation Fee
 * Fulfilling/Receiving Agent Visibility: 80% of Full Reservation Fee (Full Fee × 0.80)
 * Fixed Penalty Reserve: ZMW 20.00 held separately with default status 'Held'
 */

export interface ReservationFeeBreakdown {
  chargeId: string; // e.g. 'TB-CHG-000001'
  reservationAmount: number; // Principal transaction amount
  percentageRate: number; // 0.012 (1.2%)
  percentageComponent: number; // Reservation Amount × 0.012
  ratePerMinute: number; // 0.10 (ZMW 0.10)
  minutes: number; // System-recorded duration
  timeComponent: number; // Minutes × 0.10
  penaltyReserve: number; // Fixed 20.00
  penaltyReserveStatus: 'Held' | 'Released' | 'Forfeited';
  fullReservationFee: number; // Percentage + Time + Penalty
  agentVisibleFee: number; // Full Reservation Fee × 0.80
  feeStatus: 'Calculated' | 'Pending' | 'Held' | 'Settled' | 'Refunded';
  calculationTimestamp: string;
  startTimestamp?: string;
  endTimestamp?: string;
}

export const RESERVATION_FEE_CONFIG = {
  PERCENTAGE_RATE: 0.012, // 1.2%
  TIME_RATE_PER_MINUTE: 0.10, // ZMW 0.10 per minute
  PENALTY_RESERVE_FIXED: 20.00, // ZMW 20.00
  CUSTOMER_VISIBILITY_RATE: 1.00, // 100%
  AGENT_VISIBILITY_RATE: 0.80, // 80%
  FORMULA_DISPLAY: '(Reservation Amount × 1.2%) + (Minutes × ZMW 0.10) + ZMW 20.00',
};

/**
 * Calculates the dynamic reservation fee based on principal amount and duration in minutes.
 * Rounds all financial values strictly to 2 decimal places.
 */
export function calculateReservationFee(
  reservationAmount: number,
  minutes: number = 30,
  options?: {
    chargeIndex?: number;
    customChargeId?: string;
    startTimestamp?: string;
    endTimestamp?: string;
    feeStatus?: 'Calculated' | 'Pending' | 'Held' | 'Settled' | 'Refunded';
  }
): ReservationFeeBreakdown {
  const safeAmount = Math.max(0, Number(reservationAmount) || 0);
  const safeMinutes = Math.max(0, Math.round(Number(minutes) || 0));

  // 1. Percentage Component: 1.2% × Reservation Amount
  const rawPercentage = safeAmount * RESERVATION_FEE_CONFIG.PERCENTAGE_RATE;
  const percentageComponent = Math.round(rawPercentage * 100) / 100;

  // 2. Time Component: ZMW 0.10 × Minutes
  const rawTime = safeMinutes * RESERVATION_FEE_CONFIG.TIME_RATE_PER_MINUTE;
  const timeComponent = Math.round(rawTime * 100) / 100;

  // 3. Penalty Reserve: Fixed ZMW 20.00
  const penaltyReserve = RESERVATION_FEE_CONFIG.PENALTY_RESERVE_FIXED;

  // 4. Full Reservation Fee: Percentage + Time + Penalty Reserve
  const rawFullFee = percentageComponent + timeComponent + penaltyReserve;
  const fullReservationFee = Math.round(rawFullFee * 100) / 100;

  // 5. Agent-visible Fee: 80% of Full Reservation Fee
  const rawAgentFee = fullReservationFee * RESERVATION_FEE_CONFIG.AGENT_VISIBILITY_RATE;
  const agentVisibleFee = Math.round(rawAgentFee * 100) / 100;

  // Generate approved format: TB-CHG-000001
  const chargeId =
    options?.customChargeId ||
    `TB-CHG-${String(options?.chargeIndex ?? 1).padStart(6, '0')}`;

  const calculationTimestamp = new Date().toISOString();

  return {
    chargeId,
    reservationAmount: safeAmount,
    percentageRate: RESERVATION_FEE_CONFIG.PERCENTAGE_RATE,
    percentageComponent,
    ratePerMinute: RESERVATION_FEE_CONFIG.TIME_RATE_PER_MINUTE,
    minutes: safeMinutes,
    timeComponent,
    penaltyReserve,
    penaltyReserveStatus: 'Held',
    fullReservationFee,
    agentVisibleFee,
    feeStatus: options?.feeStatus || 'Held',
    calculationTimestamp,
    startTimestamp: options?.startTimestamp,
    endTimestamp: options?.endTimestamp,
  };
}

/**
 * Checks if a given service mode ID supports dynamic Reservation Fees.
 * Strictly:
 * - TB-SVC-CP-001 (Cash Pickup): TRUE
 * - TB-SVC-A2A-004 (Agent-to-Agent Liquidity): TRUE
 * - TB-SVC-CD-002 (Cash Delivery): FALSE
 * - TB-SVC-WI-003 (Walk-In Transaction): FALSE
 */
export function isServiceModeEligibleForReservationFee(serviceId: string): boolean {
  const normId = (serviceId || '').trim().toUpperCase();
  return (
    normId === 'TB-SVC-CP-001' ||
    normId === 'TB-SVC-A2A-004' ||
    normId.includes('CASH-PICKUP') ||
    normId.includes('AGENT-LIQUIDITY') ||
    normId.includes('CP-001') ||
    normId.includes('A2A-004')
  );
}

/**
 * Formats a currency amount into standard ZMW representation
 */
export function formatZMWAmount(amount: number): string {
  return `ZMW ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
