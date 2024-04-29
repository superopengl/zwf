import { SupportMessage } from './entity/SupportMessage';
import { ResourcePage } from './entity/ResourcePage';
import { Payment } from './entity/Payment';
import { Subscription } from './entity/Subscription';
import { EmailLog } from './entity/EmailLog';
import { Message } from './entity/Message';
import { DocTemplate } from './entity/DocTemplate';
import { TaskTemplate } from './entity/TaskTemplate';
import { UserProfile } from './entity/UserProfile';
import { TaskDoc } from './entity/TaskDoc';
import { TaskField } from './entity/TaskField';
import { Task } from './entity/Task';
import { Tag } from './entity/Tag';
import { SysLog } from './entity/SysLog';
import { OrgClient } from './entity/OrgClient';
import { Org } from './entity/Org';
import { User } from './entity/User';
import { File } from './entity/File';
import { Connection, createConnection, getConnectionManager, getManager, getRepository, DataSource } from 'typeorm';
import { initializeConfig } from './utils/initializeConfig';
import { initializeEmailTemplates } from './utils/initializeEmailTemplates';
import { redisCache } from './services/redisCache';
import { OrgAliveSubscription } from './entity/views/OrgAliveSubscription';
import { OrgBasicInformation } from './entity/views/OrgBasicInformation';
import { OrgPaymentMethod } from './entity/OrgPaymentMethod';
import { CreditTransaction } from './entity/CreditTransaction';
import { OrgPromotionCode } from './entity/OrgPromotionCode';
import { TaskInformation } from './entity/views/TaskInformation';
import { UserInformation } from './entity/views/UserInformation';
import { OrgClientStatInformation } from './entity/views/OrgClientStatInformation';
import { OrgMemberInformation } from './entity/views/OrgMemberInformation';
import { Recurring } from './entity/Recurring';
import { SupportUserLastAccess } from './entity/SupportUserLastAccess';
import { SupportUserUnreadInformation } from './entity/views/SupportUserUnreadInformation';
import { TaskTrackingInformation } from './entity/views/ClientTaskTrackingInformation';
import { TaskTrackingLastAccess } from './entity/TaskTrackingLastAccess';
import { TaskTracking } from './entity/TaskTracking';
import { UserLogin } from './entity/UserLogin';

const views = [
  // StockLatestPaidInformation,
  // StockLatestFreeInformation,
  // SubscriptionPaymentCreditInformation,
  // StockDeprecateSupport,
  // StockDeprecateResistance,
  // CoreDataLatestSnapshot,
  // CoreDataWatchlistEmailTask,
  // AliveSubscriptionInformation,
  // ReceiptInformation,
  // RevertableCreditTransactionInformation,
  // RevenueChartInformation
  //  OrgBasicInformation,
  //  OrgAliveSubscription,
];
const mviews = [
  // StockDataInformation,
  // StockLatestFairValue,
  // StockDailyPe,
  // StockComputedPe90,
  // StockHistoricalTtmEps,
  // StockHistoricalComputedFairValue,
  // StockPutCallRatio90,
];

export async function connectDatabase(shouldSyncSchema = false) {
  await AppDataSource.initialize();
  // const connection = await createConnection();
  // if (shouldSyncSchema) {
  //   await syncDatabaseSchema(connection);
  //   await initializeData();
  // }
  // return connection;
}

// async function initializeData() {
//   await initializeConfig();
//   await initializeEmailTemplates();
// }

async function syncDatabaseSchema(connection: Connection) {
  /**
   * We have to drop all views manually before typeorm sync up the database schema,
   * because typeorm cannot handle the view dependencies (view A depends on view B) correctly
   * and drop views in correct order.
   *
   * As a result, we have to drop all views/materialized views before hand,
   * so as to let typeorm always create fresh views when app starts up.
   */

  await dropAllViewsAndMatviews();

  await connection.synchronize(false);
  await connection.runMigrations();

  await createIndexOnMaterilializedView();
  // await refreshMaterializedView();
}

async function dropAllViewsAndMatviews() {
  const list = await AppDataSource.manager.query(`
select format('DROP VIEW IF EXISTS "%I"."%I" cascade;', schemaname, viewname) as sql
from pg_catalog.pg_views 
where schemaname = 'zwf'
union 
select format('DROP MATERIALIZED VIEW IF EXISTS "%I"."%I" cascade;', schemaname, matviewname) as sql
from pg_catalog.pg_matviews 
where schemaname = 'zwf'
  `);

  for (const item of list) {
    await AppDataSource.manager.query(item.sql);
  }
}

async function createIndexOnMaterilializedView() {
  const list: { tableEntity: any, fields: string[] }[] = [
    // {
    //   tableEntity: StockDataInformation,
    //   fields: ['symbol'],
    // },
  ];

  for (const item of list) {
    const { schema, tableName } = AppDataSource.getRepository(item.tableEntity).metadata;
    const idxName = `${tableName}_${item.fields.map(x => x.replace(/"/g, '')).join('_')}`;
    const fields = item.fields.join(',');
    await AppDataSource.manager.query(`CREATE INDEX ${idxName} ON "${schema}"."${tableName}" (${fields})`);
  }
}

const REFRESHING_MV_CACHE_KEY = 'database.mv.refreshing'

export async function refreshMaterializedView(mviewEnitity?: any) {
  const refreshing = await redisCache.get(REFRESHING_MV_CACHE_KEY);
  if (refreshing) {
    return;
  }
  try {
    const targetViews = mviewEnitity ? [mviewEnitity] : mviews;
    for (const viewEntity of targetViews) {
      await redisCache.setex(REFRESHING_MV_CACHE_KEY, 5 * 60, true);
      const { schema, tableName } = AppDataSource.manager.getRepository(viewEntity).metadata;
      await AppDataSource.manager.query(`REFRESH MATERIALIZED VIEW "${schema}"."${tableName}"`);
    }
  } finally {
    await redisCache.del(REFRESHING_MV_CACHE_KEY);
  }
}

export let AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.TYPEORM_HOST || "localhost",
  port: +(process.env.TYPEORM_PORT || 5432),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database:  process.env.TYPEORM_DATABASE,
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',
  schema: process.env.TYPEORM_SCHEMA || 'zwf',
  migrations: [],
  migrationsRun: false,
  migrationsTableName: 'migration',
  maxQueryExecutionTime: 10000,
  extra: {
    max: 20,
    connectionTimeoutMillis: 3000,
  },
  entities: [
    User, 
    UserProfile, 
    Org, 
    OrgClient, 
    SysLog, 
    Tag, 
    Task, 
    TaskField, 
    TaskDoc, 
    File, 
    TaskTemplate, 
    DocTemplate, 
    EmailLog,
    Message,
    Subscription,
    Payment,
    OrgPaymentMethod,
    ResourcePage,
    CreditTransaction,
    OrgPromotionCode,
    SupportMessage,
    TaskInformation,
    UserInformation,
    OrgClientStatInformation,
    OrgMemberInformation,
    OrgAliveSubscription,
    Recurring,
    SupportUserLastAccess,
    SupportUserUnreadInformation,
    TaskTrackingInformation,
    TaskTrackingLastAccess,
    TaskTracking,
    UserLogin,
  ],
})

