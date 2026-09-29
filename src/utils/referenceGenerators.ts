import { sequenceService, TELLERBUD_REFERENCE_REGISTRY, TellerBudReferenceType } from '../services/sequenceService';

export { sequenceService, TELLERBUD_REFERENCE_REGISTRY };
export type { TellerBudReferenceType };

/**
 * Generate next Store Code (TB-STR-000001, etc.)
 */
export function generateStoreCode(): string {
  return sequenceService.nextStoreCode();
}

/**
 * Generate next Booth Code (TB-BTH-000001, etc.)
 */
export function generateBoothCode(): string {
  return sequenceService.nextBoothCode();
}

/**
 * Generate any system reference by type
 */
export function generateSystemReference(type: TellerBudReferenceType): string {
  return sequenceService.nextReference(type);
}
