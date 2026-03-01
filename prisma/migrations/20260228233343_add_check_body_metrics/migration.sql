-- AlterTable
ALTER TABLE "public"."CoachingCheck" ADD COLUMN     "bodyWater" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fatMass" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "gluteCircumference" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "muscleMass" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "thighCircumference" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "waistCircumference" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "weight" TEXT NOT NULL DEFAULT '';
