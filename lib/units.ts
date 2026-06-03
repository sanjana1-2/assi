export type DisplayUnit = 'g' | 'kg' | 'mL' | 'L' | 'unit'
export type BaseUnit = 'GRAM' | 'MILLILITER' | 'UNIT'

export const TO_BASE: Record<DisplayUnit, number> = {
  g: 1,
  kg: 1000,
  mL: 1,
  L: 1000,
  unit: 1,
}

export const VALID_UNITS: Record<BaseUnit, DisplayUnit[]> = {
  GRAM: ['g', 'kg'],
  MILLILITER: ['mL', 'L'],
  UNIT: ['unit'],
}

export function toBase(qty: number, unit: DisplayUnit): number {
  return qty * TO_BASE[unit]
}

export function fromBase(baseQty: number, unit: DisplayUnit): number {
  return baseQty / TO_BASE[unit]
}

export function pricePerUnit(basePricePaise: number, unit: DisplayUnit): number {
  return basePricePaise * TO_BASE[unit]
}

export function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(paise / 100)
}
