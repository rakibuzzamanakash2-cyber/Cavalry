import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

// Better Auth's endpoints: sign-up, sign-in, sign-out, Google callback, session.
export const { GET, POST } = toNextJsHandler((request: Request) => getAuth().handler(request));
