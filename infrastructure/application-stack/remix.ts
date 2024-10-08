import fs from "node:fs";

import toml from "toml";

import { appUrlParameter } from "./ssm";
import { sessionsTable } from "./storage";

const shopifyAppConfig = toml.parse(
  fs.readFileSync(`${__dirname}/../../../shopify.app.toml`, "utf-8"),
);

if (!shopifyAppConfig.client_id) {
  throw new Error("client_id is required in shopify.app.toml");
}

if (!process.env.SHOPIFY_API_KEY) {
  throw new Error("SHOPIFY_API_SECRET is required");
}

if (!process.env.SHOPIFY_API_SECRET) {
  throw new Error("SHOPIFY_API_SECRET is required");
}

export const remix = new sst.aws.Remix(
  `${$app.name}${$app.stage.toUpperCase()}`,
  {
    link: [sessionsTable],
    permissions: [
      // read parameter from ssm
      {
        actions: ["ssm:GetParameter"],
        resources: [appUrlParameter.arn],
      },
    ],
    environment: {
      SHOPIFY_APP_URL_PARAMETER_NAME: appUrlParameter.name,
      SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
      SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL || "",
      SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
      SHOP_CUSTOM_DOMAIN: process.env.SHOP_CUSTOM_DOMAIN || "",
      SHOPIFY_SCOPES: shopifyAppConfig.access_scopes.scopes || "",
      SESSIONS_TABLE_NAME: sessionsTable.name,
    },
  },
);
