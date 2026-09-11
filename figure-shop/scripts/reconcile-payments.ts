import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { reconcilePaymentsBatch } from "../src/services/online-payment.service";
reconcilePaymentsBatch().then((count) => console.log(`Reconciled ${count} orders`)).catch(() => {
  console.error("Payment reconciliation failed"); process.exitCode = 1;
}).finally(() => prisma.$disconnect());
