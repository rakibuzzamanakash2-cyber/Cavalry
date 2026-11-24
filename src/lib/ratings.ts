import { z } from "zod";

export const RATING_MAX = 5;

/** A leader's rating: a whole number of stars from 1 to 5. */
export const ratingSchema = z.coerce
  .number({ error: "Choose a rating from 1 to 5." })
  .int("Choose a rating from 1 to 5.")
  .min(1, "Choose a rating from 1 to 5.")
  .max(RATING_MAX, "Choose a rating from 1 to 5.");

/** Average of the ratings given so far, to one decimal place; null if none. */
export function averageRating(ratings: (number | null)[]) {
  const given = ratings.filter((r): r is number => r !== null);
  if (given.length === 0) return null;
  return Math.round((given.reduce((a, b) => a + b, 0) / given.length) * 10) / 10;
}

export function ratingText(value: number | null) {
  return value === null ? "Not rated yet" : `${value} out of ${RATING_MAX}`;
}
