import type { AdminGraphqlClient } from "~/shopify.server";

interface Response {
  data: {
    customers: {
      edges: Array<{
        node: {
          tags: string[];
          metafieldDefinitions: {
            edges: Array<{
              node: {
                key: string;
                namespace: string;
                validations: Array<{
                  name: string;
                  value: string;
                }>;
              };
            }>;
          };
        };
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
    };
  };
}

const fetch =
  (graphql: AdminGraphqlClient) =>
  async (cursor: string | null = null): Promise<Response> => {
    const query = `
    query ($cursor: String) {
      customers(first: 100, after: $cursor) {
        edges {
          node {
            tags
            metafieldDefinitions(first:10){
              edges {
                node{
                  key
                  namespace
                  validations {
                    name
                    value
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

    const response = await graphql(query, { variables: { cursor } });

    return response.json() as Promise<Response>;
  };

const safeJSONParse = (value: string | undefined) => {
  if (!value) return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};
export const queryListCustomerMetadata = async (
  graphql: AdminGraphqlClient,
) => {
  let allTags: string[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  let localityMetafield: string | undefined;
  while (hasNextPage) {
    const response = await fetch(graphql)(cursor);
    const { edges, pageInfo } = response.data.customers;

    for (const edge of edges) {
      const result = edge.node.metafieldDefinitions.edges?.find((edge) => {
        return edge.node.key === "locality";
      });
      if (result) {
        localityMetafield = result.node.validations[0].value;
      }

      allTags = [...allTags, ...edge.node.tags];
    }

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }
  console.log("localityMetafield", JSON.stringify(localityMetafield, null, 2));
  // Get unique tags
  return {
    tags: Array.from(new Set(allTags)),
    localities: safeJSONParse(localityMetafield) || [],
  };
};
