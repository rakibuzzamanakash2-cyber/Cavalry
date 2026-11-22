"use client";

import { createAuthClient } from "better-auth/react";

// Browser-side auth calls (sign in, sign up, sign out). Same-origin, so no baseURL.
export const authClient = createAuthClient();
