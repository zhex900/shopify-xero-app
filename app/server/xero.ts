import type { Session } from "@remix-run/node";
import { jwtDecode } from "jwt-decode";
import type { XeroAccessToken } from "xero-node";
import { XeroClient } from "xero-node";

const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const redirectUrl = process.env.REDIRECT_URI!;
const scopes =
  "offline_access openid profile email accounting.transactions accounting.budgets.read accounting.reports.read accounting.journals.read accounting.settings accounting.settings.read accounting.contacts accounting.contacts.read accounting.attachments accounting.attachments.read files files.read assets assets.read projects projects.read payroll.employees payroll.payruns payroll.payslip payroll.timesheets payroll.settings";

export const xero = new XeroClient({
  clientId,
  clientSecret,
  redirectUris: ["https://jake-local.streampublications.com.au/callback"],
  scopes: scopes.split(" "),
  state: "imaParam=look-at-me-go",
  httpTimeout: 2000,
});

export const refreshToken = async (session: Session) => {
  if (session.data.tokenSet.expires_at >= new Date().getTime() / 1000) {
    console.log("tokenSet is not expired: ");
    return session;
  }

  const refreshTokenSet = await xero.refreshToken();

  console.log("new token ");

  if (!refreshTokenSet.id_token || !refreshTokenSet.access_token) {
    throw Error("TokenSet does not contain id_token or access_token");
  }
  const decodedAccessToken: XeroAccessToken = jwtDecode(
    refreshTokenSet.access_token,
  );

  session.set("decodedAccessToken", decodedAccessToken);
  session.set("tokenSet", refreshTokenSet);

  return session;
};

if (!clientId || !clientSecret || !redirectUrl) {
  throw Error(
    "Environment Variables not all set - please check your .env file in the project root or create one!",
  );
}
//
//https://login.xero.com/identity/connect/authorize?client_id=6E4D6A0F6C054EADB6E0D3F168C43849&scope=offline_access%20openid%20profile%20email%20accounting.transactions%20accounting.budgets.read%20accounting.reports.read%20accounting.journals.read%20accounting.settings%20accounting.settings.read%20accounting.contacts%20accounting.contacts.read%20accounting.attachments%20accounting.attachments.read%20files%20files.read%20assets%20assets.read%20projects%20projects.read%20payroll.employees%20payroll.payruns%20payroll.payslip%20payroll.timesheets%20payroll.settings&response_type=code&redirect_uri=https%3A%2F%2Ftwenty-leg-lightweight-stripes.trycloudflare.com%2Fcallback&state=imaParam%3Dlook-at-me-go
