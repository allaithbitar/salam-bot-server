DO $$ BEGIN
 CREATE TYPE "public"."dashboard_account_role" AS ENUM('Admin', 'Provider');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_type" AS ENUM('Consumer', 'Provider', 'Specialist');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "active_providers" (
	"provider_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chats_history" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"provider_id" text NOT NULL,
	"consumer_id" text NOT NULL,
	CONSTRAINT "chats_history_provider_id_consumer_id_pk" PRIMARY KEY("provider_id","consumer_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dashboard_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"password" text NOT NULL,
	"bot_user_id" text NOT NULL,
	"role" "dashboard_account_role" DEFAULT 'Provider' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "on_going_chats" (
	"provider_id" text NOT NULL,
	"consumer_id" text NOT NULL,
	"consumer_nickname" text NOT NULL,
	"provider_nickname" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "on_going_chats_provider_id_consumer_id_pk" PRIMARY KEY("provider_id","consumer_id"),
	CONSTRAINT "on_going_chats_provider_id_unique" UNIQUE("provider_id"),
	CONSTRAINT "on_going_chats_consumer_id_unique" UNIQUE("consumer_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"provider_id" text NOT NULL,
	"rating" integer NOT NULL,
	CONSTRAINT "ratings_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"nickname" text NOT NULL,
	"will_to_provide" smallint DEFAULT 3 NOT NULL,
	"user_type" "user_type" DEFAULT 'Consumer' NOT NULL,
	"is_providing" boolean DEFAULT false NOT NULL,
	"is_busy" boolean DEFAULT false NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "user_preferences_id_unique" UNIQUE("id"),
	CONSTRAINT "user_preferences_nickname_unique" UNIQUE("nickname")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"tg_id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"username" text DEFAULT '' NOT NULL,
	"first_name" text DEFAULT '' NOT NULL,
	"lastName" text DEFAULT '' NOT NULL,
	CONSTRAINT "users_tg_id_unique" UNIQUE("tg_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "active_providers" ADD CONSTRAINT "active_providers_provider_id_users_tg_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("tg_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats_history" ADD CONSTRAINT "chats_history_provider_id_users_tg_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("tg_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats_history" ADD CONSTRAINT "chats_history_consumer_id_users_tg_id_fk" FOREIGN KEY ("consumer_id") REFERENCES "public"."users"("tg_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboard_accounts" ADD CONSTRAINT "dashboard_accounts_bot_user_id_users_tg_id_fk" FOREIGN KEY ("bot_user_id") REFERENCES "public"."users"("tg_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "on_going_chats" ADD CONSTRAINT "on_going_chats_provider_id_users_tg_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("tg_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "on_going_chats" ADD CONSTRAINT "on_going_chats_consumer_id_users_tg_id_fk" FOREIGN KEY ("consumer_id") REFERENCES "public"."users"("tg_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "on_going_chats" ADD CONSTRAINT "on_going_chats_consumer_nickname_user_preferences_nickname_fk" FOREIGN KEY ("consumer_nickname") REFERENCES "public"."user_preferences"("nickname") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "on_going_chats" ADD CONSTRAINT "on_going_chats_provider_nickname_user_preferences_nickname_fk" FOREIGN KEY ("provider_nickname") REFERENCES "public"."user_preferences"("nickname") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_provider_id_users_tg_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("tg_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_tg_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("tg_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
