import {
  IAMClient,
  ListOpenIDConnectProvidersCommand,
  ListRolesCommand,
} from "@aws-sdk/client-iam";

const GITHUB_DEPLOYMENT_ROLE_NAME = "github-deployment-role";
const GITHUB_DOMAIN = "token.actions.githubusercontent.com";

const repositoryConfig = [
  {
    owner: "zhex900",
    repo: "shopify-xero-app",
  },
];

const client = new IAMClient({ region: "ap-southeast-2" });

// Create the IAM Role
export const githubDeployRole = async () => {
  const command = new ListOpenIDConnectProvidersCommand({});

  let githubProviderArn: string | any | undefined;

  // check if the OpenID Connect provider already exists
  try {
    const { OpenIDConnectProviderList } = await client.send(command);
    if (OpenIDConnectProviderList) {
      const githubProvider = OpenIDConnectProviderList.find((provider) =>
        provider?.Arn?.includes(GITHUB_DOMAIN),
      );
      console.info(
        "OpenID Connect providers already exist: " + githubProvider?.Arn,
      );
      if (githubProvider) {
        githubProviderArn = githubProvider?.Arn;
      }
    }
  } catch (error) {
    // error handling.
  }

  if (!githubProviderArn) {
    const ghProvider = new aws.iam.OpenIdConnectProvider("GithubProvider", {
      url: `https://${GITHUB_DOMAIN}`,
      clientIdLists: ["sts.amazonaws.com"],
      //https://github.blog/changelog/2023-06-27-github-actions-update-on-oidc-integration-with-aws/
      thumbprintLists: [
        "6938fd4d98bab03faadb97b34396831e3780aea1",
        "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
      ],
    });
    githubProviderArn = ghProvider.arn;
  }
  if (!githubProviderArn) {
    throw new Error("Github OpenID Connect provider does not exist");
  }
  const iamRepoDeployAccess = repositoryConfig.map(
    (r) => `repo:${r.owner}/${r.repo}:*`,
  );

  // grant only requests coming from a specific GitHub repository.
  const conditions: aws.iam.Conditions = {
    StringLike: {
      [`${GITHUB_DOMAIN}:sub`]: iamRepoDeployAccess,
    },
  };

  // check if the role already exists
  try {
    const role = await client.send(
      new ListRolesCommand({
        PathPrefix: "/",
      }),
    );

    // TODO add new policy to the role
    if (role.Roles) {
      const githubDeployRole = role.Roles.find(
        (role) => role.RoleName === GITHUB_DEPLOYMENT_ROLE_NAME,
      );
      console.info("Role already exists: " + githubDeployRole?.RoleName);
      if (githubDeployRole) {
        const role = await aws.iam.getRole({
          name: GITHUB_DEPLOYMENT_ROLE_NAME,
        });

        return role;
      }
    }
  } catch (error) {
    // error handling.
  }
  return new aws.iam.Role("GitHubDeployRole", {
    assumeRolePolicy: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Federated: githubProviderArn, // You need to define or import `ghProvider`
          },
          Action: "sts:AssumeRoleWithWebIdentity",
          Condition: conditions,
        },
      ],
    },
    managedPolicyArns: ["arn:aws:iam::aws:policy/AdministratorAccess"],
    name: GITHUB_DEPLOYMENT_ROLE_NAME, // You need to define or import `GITHUB_DEPLOYMENT_ROLE_NAME`
    description:
      "This role is used via GitHub Actions to deploy with AWS CDK on the target AWS account",
    maxSessionDuration: 3600, // 1 hour in seconds
  });
};
