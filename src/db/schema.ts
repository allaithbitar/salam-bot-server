// import { pgTable } from "drizzle-orm/pg-core"
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  smallint,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const userType = pgEnum('user_type', [
  'Consumer',
  'Provider',
  'Specialist',
]);

export const dashboardAccountRole = pgEnum('dashboard_account_role', [
  'Admin',
  'Provider',
]);

export const users = pgTable('users', {
  tg_id: text('tg_id').unique().primaryKey(),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
  username: text('username').notNull().default(''),
  first_name: text('first_name').notNull().default(''),
  last_name: text('lastName').notNull().default(''),
});

export const userPreferences = pgTable('user_preferences', {
  id: serial('id').unique().primaryKey(),
  nickname: text('nickname').unique().notNull(),
  will_to_provide: smallint('will_to_provide').notNull().default(3),
  user_type: userType('user_type').notNull().default('Consumer'),
  is_providing: boolean('is_providing').notNull().default(false),
  is_busy: boolean('is_busy').notNull().default(false),
  is_blocked: boolean('is_blocked').notNull().default(false),
  user: text('user_id')
    .notNull()
    .references(() => users.tg_id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
});

// export const botSessions = pgTable(
//   'bot_sessions',
//   {
//     key: text('key'),
//     session: text('session'),
//   },
//   (table) => ({
//     pk: primaryKey({ columns: [table.key] }),
//     pkWithCustomName: primaryKey({
//       name: 'bot_sessions_pkey',
//       columns: [table.key],
//     }),
//   }),
// );

export const dashboardAccounts = pgTable('dashboard_accounts', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
  password: text('password').notNull(),
  bot_user_id: text('bot_user_id')
    .notNull()
    .references(() => users.tg_id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  role: dashboardAccountRole('role').notNull().default('Provider'),
});

export const onGoingChats = pgTable(
  'on_going_chats',
  {
    provider_id: text('provider_id')
      .unique()
      .notNull()
      .references(() => users.tg_id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    consumer_id: text('consumer_id')
      .notNull()
      .unique()
      .references(() => users.tg_id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    consumer_nickname: text('consumer_nickname')
      .notNull()
      .references(() => userPreferences.nickname, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    provider_nickname: text('provider_nickname')
      .notNull()
      .references(() => userPreferences.nickname, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider_id, t.consumer_id] }),
  }),
);

export const chatsHistory = pgTable(
  'chats_history',
  {
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
      .notNull()
      .defaultNow(),
    provider_id: text('provider_id')
      .notNull()
      .references(() => users.tg_id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    consumer_id: text('consumer_id')
      .notNull()
      .references(() => users.tg_id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider_id, table.consumer_id] }),
    pkWithCustomName: primaryKey({
      name: 'provider_id_consumer_id',
      columns: [table.provider_id, table.consumer_id],
    }),
  }),
);

export const ratings = pgTable('ratings', {
  id: serial('id').unique().primaryKey(),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
  provider_id: text('provider_id')
    .notNull()
    .references(() => users.tg_id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  rating: integer('rating').notNull(),
});

export const activeProviders = pgTable('active_providers', {
  tg_id: text('provider_id')
    .notNull()
    .references(() => users.tg_id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
});

// export const activeProviders = pgTable('active_providers', {
//   tg_id: integer('tg_id').unique().notNull().primaryKey(),
//   is_available: boolean().notNull().default(true),
// });
