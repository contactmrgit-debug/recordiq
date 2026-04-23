import { PrismaClient } from "@prisma/client";

// Canonical Prisma client for the app.
// Import prisma from "@/lib/prisma" everywhere.
// Do not create additional Prisma client helpers.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
