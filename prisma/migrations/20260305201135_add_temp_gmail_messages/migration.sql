/*
  Warnings:

  - The primary key for the `domains` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `plans` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `system_configs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_emails` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_send_emails` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[key]` on the table `system_configs` will be added. If there are existing duplicate values, this will fail.
  - Made the column `enable_short_link` on table `domains` required. This step will fail if there are existing NULL values in that column.
  - Made the column `enable_email` on table `domains` required. This step will fail if there are existing NULL values in that column.
  - Made the column `enable_dns` on table `domains` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cf_api_key_encrypted` on table `domains` required. This step will fail if there are existing NULL values in that column.
  - Made the column `active` on table `domains` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `user_records` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tags` on table `user_records` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "forward_emails" DROP CONSTRAINT "forward_emails_to_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_planId_fkey";

-- DropIndex
DROP INDEX "user_records_created_on_idx";

-- DropIndex
DROP INDEX "user_records_userId_idx";

-- DropIndex
DROP INDEX "user_send_emails_userId_idx";

-- DropIndex
DROP INDEX "user_urls_createdAt_idx";

-- DropIndex
DROP INDEX "user_urls_userId_idx";

-- AlterTable
ALTER TABLE "domains" DROP CONSTRAINT "domains_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "enable_short_link" SET NOT NULL,
ALTER COLUMN "enable_email" SET NOT NULL,
ALTER COLUMN "enable_dns" SET NOT NULL,
ALTER COLUMN "cf_zone_id" DROP NOT NULL,
ALTER COLUMN "cf_api_key" DROP NOT NULL,
ALTER COLUMN "cf_email" DROP NOT NULL,
ALTER COLUMN "cf_api_key_encrypted" SET NOT NULL,
ALTER COLUMN "cf_api_key_encrypted" DROP DEFAULT,
ALTER COLUMN "active" SET NOT NULL,
ADD CONSTRAINT "domains_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "forward_emails" ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "readAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "plans" DROP CONSTRAINT "plans_pkey",
ADD COLUMN     "tempGmailLimit" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "scrape_metas" ALTER COLUMN "link" DROP DEFAULT;

-- AlterTable
ALTER TABLE "system_configs" DROP CONSTRAINT "system_configs_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "planId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "url_metas" ALTER COLUMN "ip" SET DEFAULT '127.0.0.1';

-- AlterTable
ALTER TABLE "user_emails" DROP CONSTRAINT "user_emails_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "user_emails_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_records" ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "tags" SET NOT NULL,
ALTER COLUMN "created_on" DROP NOT NULL,
ALTER COLUMN "created_on" DROP DEFAULT,
ALTER COLUMN "modified_on" DROP NOT NULL,
ALTER COLUMN "modified_on" DROP DEFAULT,
ALTER COLUMN "active" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_send_emails" DROP CONSTRAINT "user_send_emails_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "user_send_emails_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "team" DROP NOT NULL;

-- CreateTable
CREATE TABLE "gmail_accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gmail_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_temp_gmails" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gmailAccountId" TEXT NOT NULL,
    "tempEmailAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "user_temp_gmails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_gmail_messages" (
    "id" TEXT NOT NULL,
    "tempGmailId" TEXT NOT NULL,
    "gmailId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "snippet" TEXT,
    "subject" TEXT,
    "from" TEXT,
    "to" TEXT,
    "date" TIMESTAMP(3),
    "internalDate" TEXT,
    "labelIds" TEXT[],
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "html" TEXT,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temp_gmail_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gmail_accounts_email_key" ON "gmail_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_temp_gmails_tempEmailAddress_key" ON "user_temp_gmails"("tempEmailAddress");

-- CreateIndex
CREATE UNIQUE INDEX "temp_gmail_messages_gmailId_key" ON "temp_gmail_messages"("gmailId");

-- CreateIndex
CREATE INDEX "temp_gmail_messages_tempGmailId_idx" ON "temp_gmail_messages"("tempGmailId");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "user_records_userId_created_on_idx" ON "user_records"("userId", "created_on");

-- CreateIndex
CREATE INDEX "user_send_emails_createdAt_idx" ON "user_send_emails"("createdAt");

-- CreateIndex
CREATE INDEX "user_urls_userId_created_at_idx" ON "user_urls"("userId", "created_at");

-- AddForeignKey
ALTER TABLE "forward_emails" ADD CONSTRAINT "forward_emails_to_fkey" FOREIGN KEY ("to") REFERENCES "user_emails"("emailAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_send_emails" ADD CONSTRAINT "user_send_emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_temp_gmails" ADD CONSTRAINT "user_temp_gmails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_temp_gmails" ADD CONSTRAINT "user_temp_gmails_gmailAccountId_fkey" FOREIGN KEY ("gmailAccountId") REFERENCES "gmail_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temp_gmail_messages" ADD CONSTRAINT "temp_gmail_messages_tempGmailId_fkey" FOREIGN KEY ("tempGmailId") REFERENCES "user_temp_gmails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "unique_urlId_ip" RENAME TO "url_metas_urlId_ip_key";

-- RenameIndex
ALTER INDEX "user_files_userId_providerName_status_lastModified_createdAt_id" RENAME TO "user_files_userId_providerName_status_lastModified_createdA_idx";

-- RenameIndex
ALTER INDEX "users_createdAt_idx" RENAME TO "users_created_at_idx";
