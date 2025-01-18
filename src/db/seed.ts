import { dashboardAccounts, userPreferences, users } from './schema';
import { db } from '.';

try {
  console.log('SEEDING');
  await db.insert(users).values({
    tg_id: 535562391,
  });

  await db.insert(userPreferences).values({
    user: 535562391,
    nickname: 'SolZedd',
    user_type: 'Provider',
  });

  await db.insert(dashboardAccounts).values({
    password: '12345',
    bot_user_id: 535562391,
    role: 'Admin',
  });
} catch (error) {
  console.warn('ALREADY SEEDED');
}

process.exit();
