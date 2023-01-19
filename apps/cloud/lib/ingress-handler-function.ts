// Importing from our "custom" prisma client
import { PrismaClient } from "@nantis/prisma";

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
export const handler = async (): Promise<any> => {
  return await prismaClient.metric.create({
    data: {
      device_id: "simulator",
      cpu: Math.random() * 100,
    },
  });
};
