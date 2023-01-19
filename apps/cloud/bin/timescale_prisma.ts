#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { TimescalePrismaStack } from "../lib/timescale_prisma-stack";

import { config } from "dotenv";
import { getFilePath } from "../util/get-file-path";

// Load environment variables from a .env file
config({ path: getFilePath(import.meta.url, "..", "..", "..", ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "You will need to provide a DATABASE_URL in a .env file at the root of this repository"
  );
}

const app = new cdk.App();
new TimescalePrismaStack(app, "TimescalePrismaStack", {});
