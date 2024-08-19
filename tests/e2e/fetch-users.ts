import { SSM } from "@aws-sdk/client-ssm";
import * as fs from "fs";

import { USERS_CREDENTIALS_FILE } from "./utils";

const DEFAULT_REGION = "ap-southeast-2";

const ssm = new SSM({
  region: DEFAULT_REGION,
});

const fetchUsers = async () => {
  const testUsersData = await ssm.getParameter({
    Name: "/dev-store/test-users",
  });

  const testUsers = JSON.parse(testUsersData.Parameter?.Value || "[]") as {
    username: string;
    password: string;
    role: string;
  }[];

  console.log("testUsers", testUsers);
  //write to file
  fs.writeFileSync(USERS_CREDENTIALS_FILE, JSON.stringify(testUsers, null, 2));
};

fetchUsers().then(() => {
  console.log("Users fetched");
});
