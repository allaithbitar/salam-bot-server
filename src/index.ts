/* eslint-disable unused-imports/no-unused-vars */
import { Elysia } from 'elysia';
import { logger } from '@bogeychan/elysia-logger';
import { cors } from '@elysiajs/cors';
import type { InferSelectModel } from 'drizzle-orm';
import {
  createChat,
  createDashboardAccount,
  dashboardLogin,
  deleteDashboardAccount,
  getAllActiveProviders,
  getAllBotUsers,
  getAllOnGoingChats,
  getBotUserByTgId,
  getConsumerConnectsList,
  getDashboardAccountByTgId,
  getIsUserRegistered,
  getProviderByTgId,
  getUserPreferences,
  registerUser,
  removeAllRelatedOnGoingChat,
  syncUserNames,
  updateConnectsHistory,
  updateDashboardAccount,
  updateUserActiveState,
  updateUserPreferences,
} from './db/actions';
import { decrypt, encrypt } from './helpers';
import type { dashboardAccounts, userPreferences } from './db/schema';

const app = new Elysia()
  .use(logger())
  .use(cors())
  .onError(({ error }: { error: any }) => {
    console.log(error);

    return {
      data: null,
      error: error?.message ?? 'SOMETHING_WENT_WRONG',
    };
  })

  .get('/ping', () => 'pong1')
  .get(
    '/GetProviderByTgId',
    async ({ query }: { query: { tg_id: string } }) => {
      try {
        const data = await getProviderByTgId(Number(query.tg_id));
        return {
          data,
          error: null,
        };
      } catch (error: unknown) {
        return {
          data: null,
          error,
        };
      }
    },
  )
  .get('/GetAllActiveProviders', async () => {
    try {
      const data = await getAllActiveProviders();
      return {
        data,
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error,
      };
    }
  })

  .get('/GetAllOnGoingChats', async () => {
    try {
      const data = await getAllOnGoingChats();
      return {
        data,
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error,
      };
    }
  })
  .get(
    '/GetUserPreferences',
    async ({ query, ...rest }: { query: { tg_id: string } }) => {
      try {
        const data = await getUserPreferences(Number(query.tg_id));

        return {
          data,
          error: null,
        };
      } catch (error: unknown) {
        console.log({ error });

        return {
          data: null,
          error,
        };
      }
    },
  )
  .put(
    '/UpdateUserActiveState',
    async ({
      body,
    }: {
      body: { is_busy?: boolean; is_avaiable: boolean; tg_id: number };
    }) => {
      try {
        const data = await updateUserActiveState(body);
        return {
          data,
          error: null,
        };
      } catch (error: unknown) {
        return {
          data: null,
          error,
        };
      }
    },
  )
  .put(
    '/UpdateUserPreferences',
    async ({
      body,
    }: {
      body: {
        tg_id: number;
        preferences: Partial<InferSelectModel<typeof userPreferences>>;
      };
    }) => {
      const data = await updateUserPreferences(body);
      return {
        data,
        error: null,
      };
    },
  )
  .post(
    '/CreateDashboardAccount',
    async ({
      body,
    }: {
      body: {
        tg_id: number;
      };
    }) => {
      const data = await createDashboardAccount(Number(body.tg_id));
      return {
        data,
        error: null,
      };
    },
  )
  .put(
    '/UpdateDashboardAccount',
    async ({
      body,
    }: {
      body: {
        tg_id: number;
        properties: Partial<InferSelectModel<typeof dashboardAccounts>>;
      };
    }) => {
      try {
        const data = await updateDashboardAccount(body);
        return {
          data,
          error: null,
        };
      } catch (error: unknown) {
        return {
          data: null,
          error,
        };
      }
    },
  )
  .delete(
    '/DeleteDashboardAccount',
    async ({
      query,
    }: {
      query: {
        tg_id: number;
      };
    }) => {
      try {
        const data = await deleteDashboardAccount(Number(query.tg_id));
        return {
          data,
          error: null,
        };
      } catch (error: unknown) {
        return {
          data: null,
          error,
        };
      }
    },
  )

  .delete(
    '/RemoveAllRelatedOnGoingChats',
    async ({ query }: { query: { tg_id: string } }) => {
      try {
        const data = await removeAllRelatedOnGoingChat(Number(query.tg_id));
        return {
          data,
          error: null,
        };
      } catch (error: unknown) {
        return {
          data: null,
          error,
        };
      }
    },
  )
  .get('/GetAllBotUsers', async () => {
    try {
      const data = await getAllBotUsers();
      return {
        data: data.map((u) => ({
          ...u.users,
          preferences: u.user_preferences,
        })),
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error,
      };
    }
  })
  .get('/GetBotUserByTgId', async ({ query }: { query: { tg_id: string } }) => {
    try {
      const data = await getBotUserByTgId(Number(query.tg_id));
      if (!data.length) throw new Error('BOT_USER_NOT_FOUND');
      return {
        data: {
          ...data[0].users,
          preferences: data[0].user_preferences,
        },
        // data: data.map((u) => ({
        //   ...u.users,
        //   preferences: u.user_preferences,
        // })),
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error,
      };
    }
  })

  .post(
    '/RegisterUser',
    async ({
      body,
    }: {
      body: {
        tg_id: number;
        username: string;
        first_name: string;
        last_name: string;
      };
    }) => {
      try {
        await registerUser(body);
        return {
          data: true,
          error: null,
        };
      } catch (error: unknown) {
        console.log({ error });

        return {
          data: null,
          error,
        };
      }
    },
  )
  .post(
    '/SyncUserNames',
    async ({
      body,
    }: {
      body: {
        tg_id: number;
        username: string;
        first_name: string;
        last_name: string;
      };
    }) => {
      try {
        await syncUserNames(body);
        return {
          data: true,
          error: null,
        };
      } catch (error: unknown) {
        return {
          data: null,
          error,
        };
      }
    },
  )
  .get(
    '/GetIsUserRegistered',
    async ({
      query,
    }: {
      query: {
        tg_id: string;
      };
    }) => {
      try {
        const data = await getIsUserRegistered(Number(query.tg_id));
        return {
          data,
          error: null,
        };
      } catch (error: unknown) {
        return {
          data: null,
          error,
        };
      }
    },
  )
  .post(
    '/CreateChat',
    async ({
      body,
    }: {
      body: {
        provider_id: number;
        consumer_id: number;
      };
    }) => {
      try {
        const data = await createChat({
          provider_id: Number(body.provider_id),
          consumer_id: Number(body.consumer_id),
        });
        return {
          data,
          error: null,
        };
      } catch (error: unknown) {
        throw new Error('USER_ALREADY_IN_CHAT');
      }
    },
  )
  .post(
    '/UpdateConnectsHistory',
    async ({
      body,
    }: {
      body: {
        provider_id: number;
        consumer_id: number;
      };
    }) => {
      try {
        const data = await updateConnectsHistory(
          body.consumer_id,
          body.provider_id,
        );
        return {
          data,
          error: null,
        };
      } catch (error: unknown) {
        return {
          data: null,
          error,
        };
      }
    },
  )
  .get(
    '/GetConsumerConnectsList',
    async ({
      query,
    }: {
      query: {
        consumer_id: string;
      };
    }) => {
      try {
        const data = await getConsumerConnectsList(Number(query.consumer_id));
        return {
          data,
          error: null,
        };
      } catch (error: unknown) {
        return {
          data: null,
          error,
        };
      }
    },
  )
  .get(
    '/GenerateDashboardAuthToken',
    async ({ query }: { query: { tg_id: string } }) => {
      const data = await getDashboardAccountByTgId(Number(query.tg_id));

      const account = data[0];

      if (!account) {
        throw new Error('DASHBOARD_ACCOUNT_WASNT_FOUND');
      }

      const { role, id: dashboardUserId } = account;

      const token = encrypt(
        JSON.stringify({
          tg_id: Number(query.tg_id),
          dashboardUserId,
          role,
        }),
      );

      return {
        data: token,
        error: null,
      };
    },
  )
  .get(
    '/DashboardAccountByTgId',
    async ({ query }: { query: { tg_id: string } }) => {
      const data = await getDashboardAccountByTgId(Number(query.tg_id));

      if (!data[0]) {
        return {
          data: null,
          error: null,
        };
      }

      const { role, id: dashboardUserId } = data[0];

      return {
        data: {
          tg_id: Number(query.tg_id),
          dashboardUserId,
          role,
        },
        error: null,
      };
    },
  )

  .get(
    '/ValidateDashboardAccountAuthToken',
    async ({ query }: { query: { token: string } }) => {
      try {
        const dec = JSON.parse(decrypt(query.token) ?? '{}') as {
          tg_id: number;
          dashboardUserId: number;
          role: string;
        };

        if (!dec.tg_id) {
          throw new Error('TOKEN_ISNT_VALID');
        }

        const data = await getDashboardAccountByTgId(Number(dec.tg_id));

        const { id: dashboardUserId } = data[0];

        if (!dashboardUserId) {
          throw new Error('DASHBOARD_ACCOUNT_WASNT_FOUND');
        }

        return {
          data: data[0],
          error: null,
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  )
  .post(
    '/LoginDashboard',
    async ({ body }: { body: { nickname: string; password: string } }) => {
      console.error(encrypt(body.password), '123');

      const res = await dashboardLogin(body);
      return {
        data: res,
        error: null,
      };
    },
  );
// app.()
// .use(bearer())
// .use(cors())
// .use(jwt({ secret: process.env.JWT_SECRET as string }))

app.listen(process.env.API_PORT as string, () => {
  console.log(`🦊 Server started at ${app.server?.url.origin}`);
});

process.on('SIGTERM', () => {
  app.stop();
  process.exit();
});
