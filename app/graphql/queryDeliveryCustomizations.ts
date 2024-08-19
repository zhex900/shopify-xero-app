import { CUSTOMIZATION_NAME } from "~/constant";
import type { ShippingConfigurationType } from "~/schemas";
import type { AdminGraphqlClient } from "~/shopify.server";

interface DeliveryCustomizationsResponse {
  data: {
    deliveryCustomizations: {
      edges: Array<{
        node: {
          title: string;
          id: string;
          metafields: {
            nodes: Array<{
              id: string;
              namespace: string;
              key: string;
              value: string;
            }>;
          };
        };
      }>;
    };
  };
}

const query = `
  #graphql
  query {
    deliveryCustomizations(first: 25) {
      edges {
        node {
          title
          id
          metafields(first: 100) {
            nodes {
              id
              namespace
              key
              value
            }
          }
        }
      }
    }
  }
`;

export const queryDeliveryCustomizationsConfiguration = async (
  graphql: AdminGraphqlClient,
) => {
  const deliveryCustomizations = (await (
    await graphql(query)
  ).json()) as DeliveryCustomizationsResponse;

  const deliveryCustomizationNode =
    deliveryCustomizations.data.deliveryCustomizations.edges.find(
      (edge: any) => edge.node.title === CUSTOMIZATION_NAME,
    );
  if (!deliveryCustomizationNode) {
    return { isInstalled: false };
  }

  const configurationJSON =
    deliveryCustomizationNode.node.metafields.nodes.find((node) => {
      return node.key === "function-configuration";
    });

  return {
    isInstalled: true,
    deliveryCustomizationId: deliveryCustomizationNode.node.id,
    configuration: (configurationJSON?.value
      ? JSON.parse(configurationJSON?.value)
      : undefined) as ShippingConfigurationType | undefined,
  };
};
