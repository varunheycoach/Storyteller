import 'dotenv/config';

const env = process.env.NODE_ENV || 'development';

const allConfig = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'mysecretpassword',
    database: process.env.DB_NAME || 'storyteller',
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 5433),
    dialect: 'postgres' as const,
    timezone: process.env.DB_TIMEZONE || '+5:30',
    migrationStorageTableName:
      process.env.MIGRATION_TABLE_NAME || 'sequelize_meta',
    seederStorage: process.env.SEEDER_STORAGE || 'sequelize',
    models: [process.env.MODELS_PATH || 'src/modules/**/*.entity.{js,ts}'],
    logging: false,
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'my-secret-pwd',
    database: process.env.DB_NAME || 'storyteller',
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 5433),
    dialect: 'postgres' as const,
    timezone: process.env.DB_TIMEZONE || '+5:30',
    migrationStorageTableName:
      process.env.MIGRATION_TABLE_NAME || 'sequelize_meta',
    seederStorage: process.env.SEEDER_STORAGE || 'sequelize',
    models: [process.env.MODELS_PATH || 'src/modules/**/*.entity.{js,ts}'],
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || 5433),
    dialect: 'postgres' as const,
    timezone: process.env.DB_TIMEZONE || '+05:30',
    migrationStorageTableName:
      process.env.MIGRATION_TABLE_NAME || 'sequelize_meta',
    seederStorage: process.env.SEEDER_STORAGE || 'sequelize',
    models: [process.env.MODELS_PATH || 'src/modules/**/*.entity.{js,ts}'],
    logging: false,
  },
};

export default allConfig[env];
