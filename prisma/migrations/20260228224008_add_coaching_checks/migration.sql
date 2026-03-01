-- CreateEnum
CREATE TYPE "public"."SleepComparison" AS ENUM ('BETTER', 'WORSE', 'SAME');

-- CreateTable
CREATE TABLE "public"."CoachingCheck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "workoutsPerWeek" TEXT NOT NULL,
    "workoutIssues" TEXT NOT NULL,
    "workoutChanges" TEXT NOT NULL,
    "stepsOnTarget" TEXT NOT NULL,
    "workoutScore" TEXT NOT NULL,
    "freeMeals" TEXT NOT NULL,
    "nutritionIssues" TEXT NOT NULL,
    "nutritionScore" TEXT NOT NULL,
    "sleepRegular" TEXT NOT NULL,
    "sleepHours" TEXT NOT NULL,
    "sleepCompared" "public"."SleepComparison" NOT NULL,
    "stressHigherThanUsual" TEXT NOT NULL,
    "frontPhotoUrl" TEXT NOT NULL,
    "backPhotoUrl" TEXT NOT NULL,
    "profileOnePhotoUrl" TEXT NOT NULL,
    "profileTwoPhotoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachingCheck_userId_createdAt_idx" ON "public"."CoachingCheck"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "public"."CoachingCheck" ADD CONSTRAINT "CoachingCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoachingCheck" ADD CONSTRAINT "CoachingCheck_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
