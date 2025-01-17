import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from './schema';

// // for migrations
// console.log(process.env);
//
// try {
//   const migrationClient = postgres({
//     max: 1,
//     host: process.env.POSTGRES_HOST!,
//     port: Number(process.env.POSTGRES_PORT!),
//     user: process.env.POSTGRES_USER!,
//     database: process.env.POSTGRES_DB!,
//     password: process.env.POSTGRES_PASSWORD!,
//   });
//
//   console.log(import.meta.dir);
//
//   await migrate(drizzle(migrationClient), {
//     migrationsFolder: '/home/app/dist/migrations/',
//   });
// } catch (error) {
//   console.error('failed to run migrations', error);
// }

const queryClient = postgres({
  host: process.env.POSTGRES_HOST!,
  port: Number(process.env.POSTGRES_PORT!),
  user: process.env.POSTGRES_USER!,
  database: process.env.POSTGRES_DB!,
  password: process.env.POSTGRES_PASSWORD!,
});
export const db = drizzle(queryClient, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});
