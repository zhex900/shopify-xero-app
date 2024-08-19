import { createCookie, createMemorySessionStorage } from "@remix-run/node"; // or cloudflare/deno

// In this example the Cookie is created separately.
const sessionCookie = createCookie("__session", {
  secrets: ["r3m1xr0ck5"],
  sameSite: "lax",
  httpOnly: true,
});

const { getSession, commitSession, destroySession } =
  createMemorySessionStorage({
    cookie: sessionCookie,
  });

export { commitSession, destroySession, getSession };
