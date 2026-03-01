-- AlterTable
ALTER TABLE "public"."CoachingCheck" ADD COLUMN     "isProcessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processedById" TEXT;

-- CreateIndex
CREATE INDEX "CoachingCheck_isProcessed_createdAt_idx" ON "public"."CoachingCheck"("isProcessed", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "public"."CoachingCheck" ADD CONSTRAINT "CoachingCheck_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
