// Category colours as full Tailwind class names (Tailwind only keeps classes it
// can see written out in the source).
export type Tone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

export const toneBg: Record<Tone, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
};
