const { PrismaClient } = require('@prisma/client');

// Reuse PrismaClient across hot-reloads in dev and across serverless invocations when possible
const globalForPrisma = global;

const prisma = globalForPrisma.__prisma__ || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__prisma__ = prisma;
}

module.exports = prisma;
