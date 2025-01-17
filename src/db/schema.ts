// import { pgTable } from "drizzle-orm/pg-core"
import { int, unique } from 'drizzle-orm/mysql-core';
import {
  pgTable,
  integer,
  bigint,
  text,
  serial,
  smallint,
  pgEnum,
  timestamp,
  boolean,
  primaryKey,
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
  tg_id: bigint('tg_id', { mode: 'number' }).unique().primaryKey(),
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
  user: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.tg_id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
});

export const sessions = pgTable('sessions', {
  key: text('key'),
  session: text('session'),
});

export const dashboardAccounts = pgTable('dashboard_accounts', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
  password: text('password').notNull(),
  bot_user_id: bigint('bot_user_id', { mode: 'number' })
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
    provider_id: bigint('provider_id', { mode: 'number' })
      .unique()
      .notNull()
      .references(() => users.tg_id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    consumer_id: bigint('consumer_id', { mode: 'number' })
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
    provider_id: bigint('provider_id', { mode: 'number' })
      .notNull()
      .references(() => users.tg_id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    consumer_id: bigint('consumer_id', { mode: 'bigint' })
      .notNull()
      .references(() => users.tg_id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider_id, t.consumer_id] }),
  }),
);

export const activeProviders = pgTable('active_providers', {
  tg_id: bigint('provider_id', { mode: 'number' })
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
