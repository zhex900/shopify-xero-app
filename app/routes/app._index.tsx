import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Button,
  Card,
  FormLayout,
  InlineStack,
  Layout,
  Page,
  ProgressBar,
  Text,
  TextField,
} from "@shopify/polaris";
import { RefreshIcon } from "@shopify/polaris-icons";
import { useEffect } from "react";

import { ShopifyIcon } from "~/icons/shopify-icon";
import { XeroIcon } from "~/icons/xero-icon";
import { commitSession, destroySession, getSession } from "~/server/sessions";
import { refreshToken, xero } from "~/server/xero";
import shopify, { authenticate } from "~/shopify.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Xero Shopify Remix App" },
    { name: "description", content: "Welcome to Xero Shopify!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  console.log("load", session?.data?.tokenSet?.refresh_token);
  return json({ session });
}

const ACTIONS = {
  CONNECT: "CONNECT",
  DISCONNECT: "DISCONNECT",
  SYNC: "SYNC",
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  if (data.intent === ACTIONS.CONNECT) {
    const consentUrl: string = await xero.buildConsentUrl();

    console.log("consentUrl", consentUrl, data.appUrl);
    return json({
      consentUrl: `${consentUrl}&appUrl=${data.appUrl}`,
    });
  } else if (data.intent === ACTIONS.DISCONNECT) {
    await xero.revokeToken();
    const session = await getSession(request.headers.get("Cookie"));
    return redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  } else if (data.intent === ACTIONS.SYNC) {
    try {
      // you can refresh the token using the fully initialized client levereging openid-client
      const session = await refreshToken(
        await getSession(request.headers.get("Cookie")),
      );
      const response = await xero.accountingApi.getContacts(
        session.data.activeTenant.tenantId,
      );

      console.log(response.body.contacts?.length);
      return json(response.body, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } catch (e) {
      console.error(e);
      console.log("error", JSON.stringify(e, null, 2));
      return json({});
    }
  }

  return json({});
};

export default function Index() {
  // const [consetUrl, setConsetUrl] = React.useState<string | undefined>();
  const { session } = useLoaderData<typeof loader>();
  const actionData = useActionData<{
    consentUrl?: string;
  }>();
  // console.log("actionData", actionData, session);
  useEffect(() => {
    if (actionData?.consentUrl) {
      // setConsetUrl(actionData.consentUrl);
      console.log(actionData.consentUrl);
      window.open(actionData.consentUrl, "_blank");
    }
  }, [actionData]);

  if (actionData?.consentUrl) {
    // window.open(actionData.consentUrl, "_blank");
    // console.log(actionData?.consentUrl);
  }
  const isConnected = !!session.data?.activeTenant;
  const tenantName = session?.data?.activeTenant?.tenantName;
  const submit = useSubmit();
  return (
    <Page
      title="Xero Integration"
      titleMetadata={
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <XeroIcon />
          <div style={{ height: 20, marginLeft: "8px" }}>
            <Badge
              tone={isConnected ? "success" : "warning"}
              progress="complete"
            >
              {isConnected ? `Connected - ${tenantName}` : "Disconnected"}
            </Badge>
          </div>
        </div>
      }
      subtitle="Real time invoicing"
      compactTitle
      primaryAction={{
        content: `${isConnected ? "Disconnect" : "Connect"} to Xero`,
        disabled: false,
        onAction() {
          submit(
            {
              intent: `${isConnected ? ACTIONS.DISCONNECT : ACTIONS.CONNECT}`,
              appUrl: window.location.href,
            },
            { replace: true, method: "POST" },
          );
        },
      }}
    >
      <Layout>
        <Layout.Section variant="oneThird">
          <div style={{ marginTop: "var(--p-space-500)" }}>
            <BlockStack>
              <Text id="storeDetails" variant="headingMd" as="h2">
                Account setup
              </Text>
              <Text tone="subdued" as="p">
                Select an account for each transaction type.
              </Text>
            </BlockStack>
          </div>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <BlockStack gap={{ xs: "800", sm: "400" }}>
              <FormLayout>
                <TextField
                  label="Sales account"
                  onChange={() => {}}
                  autoComplete="off"
                />
                <TextField
                  label="Shipping Account"
                  onChange={() => {}}
                  autoComplete="email"
                />
                <TextField
                  label="Fees Account"
                  onChange={() => {}}
                  autoComplete="email"
                />
                <TextField
                  label="Payment Account"
                  onChange={() => {}}
                  autoComplete="email"
                />
                <TextField
                  label="Rounding Account"
                  onChange={() => {}}
                  autoComplete="email"
                />
              </FormLayout>
              <InlineStack align="end">
                <Button
                  variant="primary"
                  onClick={() => {}}
                  accessibilityLabel="Save account settings"
                >
                  Save
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <div style={{ marginTop: "var(--p-space-500)" }}>
            <BlockStack>
              <Text id="storeDetails" variant="headingMd" as="h2">
                Xero synchronization
              </Text>
              <Text tone="subdued" as="p">
                Synchronization shopify data with Xero.
              </Text>
            </BlockStack>
          </div>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <BlockStack gap={{ xs: "800", sm: "400" }}>
              {/*<Select*/}
              {/*  label="Synchronization options"*/}
              {/*  options={[*/}
              {/*    {*/}
              {/*      label: "Shopify contacts to Xero contacts",*/}
              {/*      value: "today",*/}
              {/*    },*/}
              {/*    {*/}
              {/*      label: "Shopify products to Xero products",*/}
              {/*      value: "yesterday",*/}
              {/*    },*/}
              {/*  ]}*/}
              {/*  // onChange={handleSelectChange}*/}
              {/*  // value={selected}*/}
              {/*/>*/}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ShopifyIcon />
                <div
                  style={{
                    marginLeft: 10,
                  }}
                />
                <ProgressBar progress={0} />
                <div
                  style={{
                    marginLeft: 10,
                  }}
                />
                <XeroIcon />
              </div>

              <InlineStack align="end">
                <Button
                  icon={RefreshIcon}
                  variant="primary"
                  onClick={() => {
                    submit(
                      {
                        intent: ACTIONS.SYNC,
                      },
                      { replace: true, method: "POST" },
                    );
                  }}
                  accessibilityLabel="Synchronize"
                >
                  Synchronization
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
// design the layout of the app

// implement the connect to xero button
