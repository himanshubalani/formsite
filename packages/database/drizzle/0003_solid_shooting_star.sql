CREATE TYPE "public"."field_type_enum" AS ENUM('TEXT', 'NUMBER', 'EMAIL', 'DATE', 'RADIO', 'CHECKBOX', 'SELECT', 'PASSWORD');--> statement-breakpoint
CREATE TABLE "form_field" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid,
	"label" varchar(100) NOT NULL,
	"label_key" varchar(100) NOT NULL,
	"description" text,
	"placeholder" text,
	"type" "field_type_enum" NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"index" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "unique_form_id_and_index" UNIQUE("form_id","index")
);
--> statement-breakpoint
ALTER TABLE "forsm" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "forsm" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "forsm" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_form_id_forsm_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forsm"("id") ON DELETE no action ON UPDATE no action;