import "@shopify/shopify-app-remix/adapters/node";

import { SSM } from "@aws-sdk/client-ssm";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-04";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { DynamoDBSessionStorage } from "@shopify/shopify-app-session-storage-dynamodb";

const ssm = new SSM({
  region: process.env.AWS_REGION,
});

let appUrl = process.env.SHOPIFY_APP_URL;

if (!appUrl) {
  if (!process.env.SHOPIFY_APP_URL_PARAMETER_NAME) {
    throw new Error("SHOPIFY_APP_URL_PARAMETER_NAME is required");
  }
  appUrl = (
    await ssm.getParameter({
      Name: process.env.SHOPIFY_APP_URL_PARAMETER_NAME,
    })
  )?.Parameter?.Value;
}

if (!appUrl) {
  throw new Error("SHOPIFY_APP_URL is required");
}
if (!process.env.SHOPIFY_API_KEY) {
  throw new Error("SHOPIFY_API_KEY is required");
}

if (!process.env.SHOPIFY_API_SECRET) {
  throw new Error("SHOPIFY_API_SECRET is required");
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  appUrl,
  apiVersion: ApiVersion.April24,
  scopes: process.env.SCOPES?.split(","),
  authPathPrefix: "/auth",
  sessionStorage: new DynamoDBSessionStorage({
    sessionTableName: process.env.SESSIONS_TABLE_NAME!,
    shopIndexName: "shopIndexName",
    config: {
      region: process.env.AWS_DEFAULT_REGION,
    },
  }),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.EventBridge,
      arn: "arn:aws:events:ap-southeast-2::event-source/aws.partner/shopify.com/133500370945/xero-integration",
    },
    // TENDER_TRANSACTIONS_CREATE: {
    //   deliveryMethod: DeliveryMethod.EventBridge,
    //   arn: "arn:aws:events:ap-southeast-2::event-source/aws.partner/shopify.com/133500370945/xero-integration",
    // },
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
  isEmbeddedApp: true,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.April24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
export type AdminMain = Awaited<ReturnType<typeof authenticate.admin>>;

export type AdminApiContext = AdminMain["admin"];
export type AdminApiSession = AdminMain["session"];

export type AdminGraphqlClient = AdminApiContext["graphql"];
export type AdminRestClient = AdminApiContext["rest"];
