import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";

import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const w = await admin.rest.resources.Webhook.all({
    session: session,
  });

  return { data: w.data };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const a = await admin.graphql(
    `#graphql
    query webhooks {
      webhookSubscriptions(first: 100) {
        edges {
          node {
            id
            topic
            endpoint {
              __typename
              ... on WebhookHttpEndpoint {
                callbackUrl
              }
              ... on WebhookEventBridgeEndpoint {
                arn
              }
            }
          }
        }
      }
    }`,
  );
  const w = await admin.rest.resources.Webhook.all({
    session: session,
  });
  console.log("q", JSON.stringify(w, null, 2));
  const result = await admin.rest.resources.Webhook.delete({
    session: session,
    id: 1291147837592,
  });
  // const result = await admin.graphql(
  //   `#graphql
  //   mutation {
  //     eventBridgeWebhookSubscriptionCreate(
  //       topic: ORDERS_CREATE
  //       webhookSubscription: {
  //         arn: "arn:aws:events:ap-southeast-2::event-source/aws.partner/shopify.com/133500370945/xero-integration"
  //         format: JSON
  //       }
  //     ) {
  //       webhookSubscription {
  //         id
  //       }
  //       userErrors {
  //         message
  //       }
  //     }
  //   }`,
  // );
  // const resultJson = await result.json();
  // //gid://shopify/WebhookSubscription/1291147837592
  // console.log(JSON.stringify(resultJson, null, 2));
  return json("ok");
};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const { data } = useLoaderData<typeof loader>();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const install = () => submit({}, { replace: true, method: "POST" });

  return (
    <Page>
      <TitleBar title="Delivery Customisation"></TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Installation
                  </Text>
                </BlockStack>
                <code>{JSON.stringify(data, null, 2)}</code>
                <InlineStack gap="300">
                  <Button loading={isLoading} onClick={install}>
                    Install
                  </Button>
                </InlineStack>
                {actionData && (
                  <InlineStack gap="300">
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>{JSON.stringify(actionData, null, 2)}</code>
                      </pre>
                    </Box>
                  </InlineStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
