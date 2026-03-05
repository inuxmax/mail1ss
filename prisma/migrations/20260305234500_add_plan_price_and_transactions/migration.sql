-- AlterTable
ALTER TABLE "plans"
ADD COLUMN "price" DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "transactions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "planId" UUID NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USDT',
  "status" TEXT NOT NULL,
  "transId" TEXT,
  "requestId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transId_key" ON "transactions"("transId");
CREATE UNIQUE INDEX "transactions_requestId_key" ON "transactions"("requestId");

-- AddForeignKey
ALTER TABLE "transactions"
ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transactions"
ADD CONSTRAINT "transactions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
