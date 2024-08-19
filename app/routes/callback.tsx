import type { LoaderFunctionArgs } from "@remix-run/node";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import type {
  TokenSetParameters,
  XeroAccessToken,
  XeroIdToken,
} from "xero-node";

import { commitSession, getSession } from "~/server/sessions";
import { xero } from "~/server/xero";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("req", request.url);

  const session = await getSession(request.headers.get("Cookie"));
  const tokenSet: TokenSetParameters = await xero.apiCallback(request.url);
  await xero.updateTenants(false);

  if (!tokenSet?.id_token) {
    return {};
  }

  if (tokenSet.id_token) {
    const decodedIdToken: XeroIdToken = jwtDecode(tokenSet.id_token);
    session.set("decodedIdToken", decodedIdToken);
  }
  if (!tokenSet?.access_token) {
    return {};
  }
  const decodedAccessToken: XeroAccessToken = jwtDecode(tokenSet.access_token);
  session.set("decodedAccessToken", decodedAccessToken);
  session.set("tokenSet", tokenSet);
  session.set("allTenants", xero.tenants);
  session.set("activeTenant", xero.tenants[0]);

  // go back to shopify xero app page
  // return redirect(appUrl, {
  //   headers: {
  //     "Set-Cookie": await commitSession(session),
  //   },
  // });
  return {};
};

export default function View() {
  useEffect(() => {
    // wait for 5 seconds
    setTimeout(() => {
      window.close();
    }, 5 * 1000);
  }, []);
  return <h1>Xero connected! Closing window...</h1>;
}
