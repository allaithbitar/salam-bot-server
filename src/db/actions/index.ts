import type { InferSelectModel } from 'drizzle-orm';
import { and, desc, eq, inArray, or } from 'drizzle-orm';
import {
  chatsHistory,
  dashboardAccounts,
  onGoingChats,
  ratings,
  userPreferences,
  users,
  userType,
} from '../schema';
import { db } from '..';
import {
  encrypt,
  generateNickname,
  generateRandomPassword,
} from '../../helpers';

export async function updateUserActiveState({
  tg_id,
  is_busy,
  is_providing,
}: {
  tg_id: string;
  is_busy?: boolean;
  is_providing?: boolean;
}) {
  return db
    .update(userPreferences)
    .set({
      is_busy,
      is_providing,
    })
    .where(eq(userPreferences.user, tg_id));
  // .from('bot_user_preferences')
  // .update(properties)
  // .eq('user', tgId)
  // .throwOnError();
}

export async function updateUserPreferences({
  tg_id,
  preferences,
}: {
  tg_id: string;
  preferences: Partial<InferSelectModel<typeof userPreferences>>;
}) {
  return db
    .update(userPreferences)
    .set(preferences)
    .where(eq(userPreferences.user, tg_id));
}

export async function createDashboardAccount(tg_id: string) {
  const password = generateRandomPassword();
  const encryptedPassword = encrypt(password);
  return db.insert(dashboardAccounts).values({
    bot_user_id: tg_id,
    password: encryptedPassword,
  });
}

export async function updateDashboardAccount({
  tg_id,
  properties,
}: {
  tg_id: string;
  properties: Partial<InferSelectModel<typeof dashboardAccounts>>;
}) {
  if (properties.password) {
    properties.password = encrypt(properties.password);
  }
  return db
    .update(dashboardAccounts)
    .set(properties)
    .where(eq(dashboardAccounts.bot_user_id, tg_id));
}

export async function deleteDashboardAccount(tg_id: string) {
  return db
    .delete(dashboardAccounts)
    .where(eq(dashboardAccounts.bot_user_id, tg_id));
}

export async function createChat({
  provider_id,
  consumer_id,
}: {
  provider_id: string;
  consumer_id: string;
}) {
  const provider = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.user, provider_id),
  });

  const consumer = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.user, consumer_id),
  });

  if (!consumer || !provider) {
    throw new Error('Failed To Create Chat');
  }
  return db.insert(onGoingChats).values({
    provider_id: provider.user,
    provider_nickname: provider.nickname,
    consumer_id: consumer.user,
    consumer_nickname: consumer.nickname,
  });
}

export async function getUserPreferences(tg_id: string) {
  return db.query.userPreferences.findFirst({
    where: eq(userPreferences.user, tg_id),
  });
}

export function getAllOnGoingChats() {
  return db.query.onGoingChats.findMany();
}

export function removeAllRelatedOnGoingChat(tg_id: string) {
  return db
    .delete(onGoingChats)
    .where(
      or(
        eq(onGoingChats.consumer_id, tg_id),
        eq(onGoingChats.provider_id, tg_id),
      ),
    );
}

export async function registerUser({
  tg_id,
  username,
  first_name,
  last_name,
}: {
  tg_id: string;
  username: string;
  first_name: string;
  last_name: string;
}) {
  await db.insert(users).values({
    tg_id,
    username,
    last_name,
    first_name,
  });
  const a = await db
    .insert(userPreferences)
    .values({
      nickname: generateNickname(),
      user: tg_id,
    })
    .returning();
  console.log(a);
}

export async function syncUserNames({
  tg_id,
  username,
  first_name,
  last_name,
}: {
  tg_id: string;
  username: string;
  first_name: string;
  last_name: string;
}) {
  await db
    .update(users)
    .set({
      username,
      last_name,
      first_name,
    })
    .where(eq(users.tg_id, tg_id));
}

export async function getIsUserRegistered(tg_id: string) {
  return !!(await db.query.users.findFirst({ where: eq(users.tg_id, tg_id) }));
}

export async function updateConnectsHistory(
  consumer_id: string,
  provider_id: string,
) {
  return db
    .insert(chatsHistory)
    .values({
      provider_id,
      consumer_id,
    })
    .onConflictDoUpdate({
      target: [chatsHistory.provider_id, chatsHistory.consumer_id],
      targetWhere: and(
        eq(chatsHistory.consumer_id, consumer_id),
        eq(chatsHistory.provider_id, provider_id),
      ),
      set: { created_at: new Date().toISOString() },
    });
}

export async function getConsumerConnectsList(consumer_id: string) {
  const chats = await db.query.chatsHistory.findMany({
    where: eq(chatsHistory.consumer_id, consumer_id),
  });

  return db
    .select({
      nickname: userPreferences.nickname,
      tg_id: userPreferences.user,
      user_type: userPreferences.user_type,
    })
    .from(userPreferences)
    .where(
      inArray(
        userPreferences.user,
        chats.map((c) => c.provider_id),
      ),
    );

  // const provider=
  // return await cloudDb
  //   .from('bot_user_preferences')
  //   .select('nickname,user')
  //   .in(
  //     'user',
  //     connectIds.map((c) => c.provider_id),
  //   );
}

export async function getLastChatProviderId(consumer_id: string) {
  const chat = await db.query.chatsHistory.findFirst({
    where: eq(chatsHistory.consumer_id, consumer_id),
    orderBy: desc(chatsHistory.created_at),
  });

  return chat;
}

export async function AddRating(provider_id: string, rating: number) {
  console.log({ provider_id, rating });

  await db.insert(ratings).values({ rating, provider_id });
}

export function getAllActiveProviders() {
  return db.query.userPreferences.findMany({
    where: eq(userPreferences.is_providing, true),
  });
}

export function getProviderByTgId(
  tg_id: string,
  user_Type?: (typeof userType.enumValues)[number],
) {
  return db.query.userPreferences.findFirst({
    where: and(
      eq(userPreferences.user, tg_id),
      inArray(
        userPreferences.user_type,
        user_Type ? [user_Type] : ['Specialist', 'Provider'],
      ),
    ),
  });
}

export function getDashboardAccountByTgId(tg_id: string) {
  return db
    .select({
      id: dashboardAccounts.id,
      role: dashboardAccounts.role,
    })
    .from(dashboardAccounts)
    .where(eq(dashboardAccounts.bot_user_id, tg_id));
}

export async function getAllBotUsers() {
  const ratings = await db.query.ratings.findMany();
  const usersData = await db
    .select()
    .from(users)
    .leftJoin(userPreferences, eq(userPreferences.user, users.tg_id));

  return usersData.map((u) => {
    const userRatings = ratings.filter((r) => r.provider_id === u.users.tg_id);
    const sum = userRatings.reduce((acc, curr) => {
      return (acc += curr.rating);
    }, 0);
    return {
      ...u,
      rating: {
        value: sum / userRatings.length,
        count: userRatings.length,
      },
    };
  });

  // .rightJoin(ratings, eq(ratings.provider_id, users.tg_id));
}

export function getBotUserByTgId(tg_id: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.tg_id, tg_id))
    .leftJoin(userPreferences, eq(userPreferences.user, users.tg_id));
}

export async function dashboardLogin({
  password,
  nickname,
}: {
  nickname: string;
  password: string;
}) {
  const userPref = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.nickname, nickname),
  });
  if (
    // eslint-disable-next-line style/operator-linebreak
    !userPref ||
    (userPref && !['Specialist', 'Provider'].includes(userPref.user_type))
  ) {
    throw new Error('UNAUTHORIZED');
  }

  const userDashboardAccount = await db.query.dashboardAccounts.findFirst({
    where: eq(dashboardAccounts.bot_user_id, userPref.user),
  });

  if (!userDashboardAccount) {
    throw new Error('USER_HAS_NO_DASHBOARD_ACCOUNT');
  }

  const userPasswordEncrypted = encrypt(password);

  if (userDashboardAccount.password !== userPasswordEncrypted) {
    throw new Error('WRONG_PASSWORD');
  }

  return {
    tg_id: userDashboardAccount.bot_user_id,
    role: userDashboardAccount.role,
  };
}
