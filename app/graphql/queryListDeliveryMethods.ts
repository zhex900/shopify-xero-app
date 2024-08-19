import type { AdminGraphqlClient } from "~/shopify.server";

interface translatableResourcesResponse {
  data: {
    translatableResources: {
      nodes: {
        translatableContent: {
          key: "name" | "message" | "payment_instructions";
          value: string;
        }[];
      }[];
    };
  };
}

export const queryListDeliveryMethods = async (graphql: AdminGraphqlClient) => {
  const response = (await (
    await graphql(`
      #graphql
      query {
        translatableResources(
          first: 100
          resourceType: DELIVERY_METHOD_DEFINITION
        ) {
          nodes {
            translatableContent {
              key
              value
            }
          }
        }
      }
    `)
  ).json()) as translatableResourcesResponse;

  return response.data.translatableResources.nodes.map(
    ({ translatableContent }) => {
      return translatableContent.find((t) => t.key === "name")?.value;
    },
  ) as string[];
};
