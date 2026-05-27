CREATE TYPE "public"."form_visibility_enum" AS ENUM('PUBLIC', 'UNLISTED');--> statement-breakpoint
CREATE TYPE "public"."field_type_enum" AS ENUM('SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'EMAIL', 'DATE', 'RADIO', 'CHECKBOX', 'SINGLE_SELECT', 'MULTI_SELECT');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(80) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"profile_image_url" text,
	"salt" text,
	"password" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"visibility" "form_visibility_enum" DEFAULT 'PUBLIC' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"theme" varchar(50) DEFAULT 'light',
	"slug" varchar(255),
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"expired" boolean DEFAULT false,
	"expired_at" timestamp,
	CONSTRAINT "forms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "form_field" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"label" varchar(255) NOT NULL,
	"label_key" varchar(100) NOT NULL,
	"description" text,
	"placeholder" text,
	"type" "field_type_enum" NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"options" jsonb,
	"index" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "unique_form_id_and_index" UNIQUE("form_id","index")
);
--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;