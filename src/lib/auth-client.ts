"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Browser-side auth calls (sign in, sign up, sign out). Same-origin, so no baseURL.
// The username is chosen at sign-up; the server checks it (src/lib/auth.ts).
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields({ user: { username: { type: "string", required: false } } })],
});
