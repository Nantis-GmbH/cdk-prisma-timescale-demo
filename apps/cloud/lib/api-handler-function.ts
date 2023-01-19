import { PrismaClient } from "@nantis/prisma";
import { APIGatewayProxyResult } from "aws-lambda";

// Top level await, available in nodejs18 runtime
const prismaClient: PrismaClient = new PrismaClient({
  log: ["query", "error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
});

// Normal handler code
export const handler = async (): Promise<APIGatewayProxyResult> => {

  // This shows how to use the caggs via prisma
  const results15mins = await prismaClient.metric_15min.findMany({
    take: 100,
  });

  const resultsDaily = await prismaClient.metric_1day.findMany({
    take: 100,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      results15mins,
      resultsDaily
    }),
  };
};
