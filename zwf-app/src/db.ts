import { TaskDoc } from './entity/TaskDoc';
import { LicenseTicket } from './entity/LicenseTicket';
import { RecurringInformation } from './entity/views/RecurringInformation';
import { SystemConfig } from './entity/SystemConfig';
import { SupportInformation } from './entity/views/SupportInformation';
import { SupportMessage } from './entity/SupportMessage';
import { ResourcePage } from './entity/ResourcePage';
import { Payment } from './entity/Payment';
import { EmailLog } from './entity/EmailLog';
import { Message } from './entity/Message';
import { Demplate } from './entity/Demplate';
import { Femplate } from './entity/Femplate';
import { UserProfile } from './entity/UserProfile';
import { TaskField } from './entity/TaskField';
import { Task } from './entity/Task';
import { Tag } from './entity/Tag';
import { SysLog } from './entity/SysLog';
import { OrgClient } from './entity/OrgClient';
import { Org } from './entity/Org';
import { User } from './entity/User';
import { File } from './entity/File';
import { DataSource } from 'typeorm';
import { initializeConfig } from './utils/initializeConfig';
import { redisCache } from './services/redisCache';
import { OrgBasicInformation } from './entity/views/OrgBasicInformation';
import { OrgPaymentMethod } from './entity/OrgPaymentMethod';
import { OrgPromotionCode } from './entity/OrgPromotionCode';
import { TaskInformation } from './entity/views/TaskInformation';
import { UserInformation } from './entity/views/UserInformation';
import { OrgClientStatInformation } from './entity/views/OrgClientStatInformation';
import { OrgMemberInformation } from './entity/views/OrgMemberInformation';
import { Recurring } from './entity/Recurring';
import { SupportUserLastAccess } from './entity/SupportUserLastAccess';
import { TaskActivityInformation } from './entity/views/TaskActivityInformation';
import { TaskEvent } from './entity/TaskEvent';
import { UserAudit } from './entity/UserAudit';
import { TaskTagsTag } from './entity/TaskTagsTag';
import { OrgClientInformation } from './entity/views/OrgClientInformation';
import { OrgSubscriptionPeriodHistoryInformation } from './entity/views/OrgSubscriptionPeriodHistoryInformation';
import { SupportPendingReplyInformation } from './entity/views/SupportPendingReplyInformation';
import { EmailSentOutTask } from './entity/EmailSentOutTask';
import * as dotenv from 'dotenv';
import { Contact } from './entity/Contact';
import { LicenseTicketUsageInformation } from './entity/views/LicenseTicketUsageInformation';
import { OrgSubscriptionPeriod } from './entity/OrgSubscriptionPeriod';
import { NotificationMessage } from './entity/NotificationMessage';
import { TaskEventLastSeen } from './entity/TaskEventLastSeen';
import { SupportMessageLastSeen } from './entity/SupportMessageLastSeen';
import { OrgTermination } from './entity/OrgTermination';
import { OrgClientField } from './entity/OrgClientField';
import { OrgAllClientFieldsInformation } from './entity/views/OrgAllClientFieldsInformation';
dotenv.config();

const views = [
  // StockLatestPaidInformation,
  // StockLatestFreeInformation,
  // SubscriptionPaymentCreditInformation,
  // StockDeprecateSupport,
  // StockDeprecateResistance,
  // CoreDataLatestSnapshot,
  // CoreDataWatchlistEmailTask,
  // AliveSubscriptionInformation,
  // InvoiceInformation,
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
  await db.initialize();
  if (shouldSyncSchema) {
    await syncDatabaseSchema(db);
    await initializeData();
  }
  // return connection;
  return db;
}

async function initializeData() {
  await initializeConfig();
}

async function syncDatabaseSchema(db: DataSource) {
  /**
   * We have to drop all views manually before typeorm sync up the database schema,
   * because typeorm cannot handle the view dependencies (view A depends on view B) correctly
   * and drop views in correct order.
   *
   * As a result, we have to drop all views/materialized views before hand,
   * so as to let typeorm always create fresh views when app starts up.
   */

  await dropAllViewsAndMatviews();

  await db.synchronize(false);
  await db.runMigrations();

  await createIndexOnMaterilializedView();
  // await refreshMaterializedView();
}

async function dropAllViewsAndMatviews() {
  const list = await db.manager.query(`
select format('DROP VIEW IF EXISTS "%I"."%I" cascade;', schemaname, viewname) as sql
from pg_catalog.pg_views
where schemaname in (SELECT * FROM current_schema())
union
select format('DROP MATERIALIZED VIEW IF EXISTS "%I"."%I" cascade;', schemaname, matviewname) as sql
from pg_catalog.pg_matviews
where schemaname in (SELECT * FROM current_schema())
  `);

  for (const item of list) {
    await db.manager.query(item.sql);
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
    const { schema, tableName } = db.getRepository(item.tableEntity).metadata;
    const idxName = `${tableName}_${item.fields.map(x => x.replace(/"/g, '')).join('_')}`;
    const fields = item.fields.join(',');
    await db.manager.query(`CREATE INDEX ${idxName} ON "${schema}"."${tableName}" (${fields})`);
  }
}

const REFRESHING_MV_CACHE_KEY = 'database.mv.refreshing';

export async function refreshMaterializedView(mviewEnitity?: any) {
  const refreshing = await redisCache.get(REFRESHING_MV_CACHE_KEY);
  if (refreshing) {
    return;
  }
  try {
    const targetViews = mviewEnitity ? [mviewEnitity] : mviews;
    for (const viewEntity of targetViews) {
      await redisCache.setex(REFRESHING_MV_CACHE_KEY, 5 * 60, true);
      const { schema, tableName } = db.manager.getRepository(viewEntity).metadata;
      await db.manager.query(`REFRESH MATERIALIZED VIEW "${schema}"."${tableName}"`);
    }
  } finally {
    await redisCache.del(REFRESHING_MV_CACHE_KEY);
  }
}

export const db = new DataSource({
  type: 'postgres',
  host: process.env.TYPEORM_HOST || 'localhost',
  port: +(process.env.TYPEORM_PORT || 5432),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
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
    OrgClientField,
    SysLog,
    Tag,
    Task,
    TaskField,
    TaskDoc,
    File,
    Femplate,
    Demplate,
    EmailLog,
    Message,
    Payment,
    OrgPaymentMethod,
    ResourcePage,
    OrgPromotionCode,
    SupportMessage,
    Contact,
    TaskEvent,
    UserAudit,
    TaskTagsTag,
    Recurring,
    SupportUserLastAccess,
    SupportMessageLastSeen,
    EmailSentOutTask,
    OrgTermination,
    SystemConfig,
    LicenseTicket,
    OrgSubscriptionPeriod,
    NotificationMessage,
    TaskEventLastSeen,
    // Views below
    TaskInformation,
    UserInformation,
    OrgClientStatInformation,
    OrgAllClientFieldsInformation,
    OrgMemberInformation,
    TaskActivityInformation,
    OrgClientInformation,
    OrgBasicInformation,
    SupportInformation,
    SupportPendingReplyInformation,
    RecurringInformation,
    OrgSubscriptionPeriodHistoryInformation,
    LicenseTicketUsageInformation,
  ],
});

