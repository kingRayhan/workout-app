export type BmiCategory = "under" | "normal" | "over" | "obese";

/** WHO adult cut-offs. */
export const BMI_BANDS: {
  id: BmiCategory;
  label: string;
  min: number;
  max: number;
}[] = [
  { id: "under", label: "Underweight", min: 0, max: 18.5 },
  { id: "normal", label: "Normal", min: 18.5, max: 25 },
  { id: "over", label: "Overweight", min: 25, max: 30 },
  { id: "obese", label: "Obese", min: 30, max: Infinity },
];

export const OBESITY_CLASSES = [
  { id: 1, label: "Class 1 Obesity", min: 30, max: 35 },
  { id: 2, label: "Class 2 Obesity", min: 35, max: 40 },
  { id: 3, label: "Class 3 Obesity (Severe)", min: 40, max: Infinity },
] as const;

export function obesityClass(value: number) {
  return OBESITY_CLASSES.find((c) => value >= c.min && value < c.max) ?? null;
}

export function bmi(kg: number, heightCm: number): number {
  const m = heightCm / 100;
  return Math.round((kg / (m * m)) * 10) / 10;
}

export function bmiCategory(value: number) {
  return BMI_BANDS.find((b) => value >= b.min && value < b.max) ?? BMI_BANDS[3]!;
}

/** Body weight (kg) that corresponds to a BMI at this height. */
export function kgForBmi(value: number, heightCm: number): number {
  const m = heightCm / 100;
  return value * m * m;
}

/** Healthy weight range (BMI 18.5–25) for this height, rounded to 0.1 kg. */
export function healthyRange(heightCm: number) {
  return {
    min: Math.round(kgForBmi(18.5, heightCm) * 10) / 10,
    max: Math.round(kgForBmi(25, heightCm) * 10) / 10,
  };
}
