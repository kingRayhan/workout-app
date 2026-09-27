export type HeightUnit = "cm" | "ftin";
export type WeightUnit = "kg" | "lb";

const CM_PER_IN = 2.54;
const LB_PER_KG = 2.2046226218;

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function cmToFtIn(cm: number) {
  const totalIn = Math.round(cm / CM_PER_IN);
  return { ft: Math.floor(totalIn / 12), inch: totalIn % 12 };
}

export function ftInToCm(ft: number, inch: number) {
  return (ft * 12 + inch) * CM_PER_IN;
}

export function kgToLb(kg: number) {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number) {
  return lb / LB_PER_KG;
}

export function formatWeight(kg: number, unit: WeightUnit) {
  return unit === "kg" ? `${round1(kg)} kg` : `${round1(kgToLb(kg))} lb`;
}

export function formatHeight(cm: number, unit: HeightUnit) {
  if (unit === "cm") return `${Math.round(cm)} cm`;
  const { ft, inch } = cmToFtIn(cm);
  return `${ft}′${inch}″`;
}
