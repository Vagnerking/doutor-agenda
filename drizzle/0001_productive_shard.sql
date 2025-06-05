CREATE TYPE "public"."appointment_status" AS ENUM('confirmed', 'cancelled');--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "status" "appointment_status" DEFAULT 'confirmed' NOT NULL;