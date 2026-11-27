// Account identifiers: the permanent UID (CAV00012), an optional username and
// the email. Any of the three works on the sign-in form. Kept free of
// server-only imports so tests can use it.

const UID_PATTERN = /^cav\d{5,}$/i;
const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._]{1,28}[a-z0-9])$/;

export function isUid(value: string) {
  return UID_PATTERN.test(value.trim());
}

export function normalizeUid(value: string) {
  return value.trim().toUpperCase();
}

export function normalizeUsername(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase();
}

/** Returns an error message, or null when the username can be used. */
export function usernameProblem(username: string): string | null {
  if (username.length < 3 || username.length > 30) return "Use 3 to 30 characters.";
  if (!USERNAME_PATTERN.test(username))
    return "Use lowercase letters, numbers, dots and underscores, starting and ending with a letter or number.";
  if (isUid(username)) return "That looks like an account ID. Choose a different username.";
  if (/[._]{2}/.test(username)) return "Don't put two dots or underscores together.";
  return null;
}

/** What kind of identifier someone typed on the sign-in form. */
export function identifierKind(value: string): "email" | "uid" | "username" {
  const v = value.trim();
  if (v.includes("@") && !v.startsWith("@")) return "email";
  if (isUid(v)) return "uid";
  return "username";
}
