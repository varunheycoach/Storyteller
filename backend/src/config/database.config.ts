import { SequelizeModuleOptions } from '@nestjs/sequelize';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Sequelize } from 'sequelize';

// Load environment variables from .env
dotenv.config();

// Function to check database connection health
async function isDatabaseHealthy(config: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}): Promise<boolean> {
  const sequelize = new Sequelize({
    dialect: (process.env.DB_DIALECT as any) || 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    logging: true, // Disable logging for health checks
  });

  try {
    await sequelize.authenticate();
    return true; // Connection is healthy
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(
        `Database at ${config.host}:${config.port} is down:`,
        err.message,
      );
    } else {
      console.error(
        `Database at ${config.host}:${config.port} is down:`,
        String(err),
      );
    }
    return false; // Connection failed
  } finally {
    await sequelize.close();
  }
}

let dbName;

switch (process.env.NODE_ENV) {
  case 'production':
    dbName = process.env.DB_NAME_PROD;
    break;
  case 'test':
    dbName = process.env.DB_NAME_TEST;
    break;
  default:
    dbName = process.env.DB_NAME || 'luna';
}

// Database configuration
export const databaseConfig: SequelizeModuleOptions = {
  dialect: (process.env.DB_DIALECT as any) || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  models: [
    path.resolve(__dirname, process.env.MODELS_PATH || '../**/*.model.{js,ts}'),
  ],
  autoLoadModels: true,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  replication: {
    write: {
      host: process.env.DB_HOST || 'localhost', // Primary DB host
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
    },
    read: [
      {
        host: process.env.DB_HOST_REPLICA || 'localhost', // Replica DB host
        port: Number(process.env.DB_PORT_REPLICA) || 5433,
        username: process.env.DB_USERNAME_REPLICA || 'replicator',
        password: process.env.DB_PASSWORD_REPLICA || '',
        database: process.env.DB_NAME_REPLICA || 'luna',
      },
    ],
  },
  pool: {
    max: 5, // Max number of connections in pool
    min: 0, // Min number of connections in pool
    acquire: 30000, // How long to wait before throwing an error if connection not acquired
    idle: 10000, // Max idle time before a connection is released
  },
  timezone: '+05:30', // Set Sequelize to use IST (UTC+5:30)
};

// Perform health check and adjust configuration dynamically
(async () => {
  const replicationConfig = databaseConfig.replication;

  if (replicationConfig && replicationConfig.read && replicationConfig.write) {
    const readReplica = replicationConfig.read[0];

    // Explicitly type `readReplicaConfig` for the `isDatabaseHealthy` function
    const readReplicaConfig = {
      host: readReplica.host || '',
      port: Number(readReplica.port) || 5432, // Ensure port is a number
      username: readReplica.username || '',
      password: readReplica.password || '',
      database: readReplica.database || '',
    };

    const isReplicaHealthy = await isDatabaseHealthy(readReplicaConfig);

    if (!isReplicaHealthy) {
      console.warn(
        'Read replica is down. Redirecting read operations to the primary database.',
      );
      replicationConfig.read = [
        { ...replicationConfig.write }, // Use primary DB for reads
      ];
    }
  } else {
    console.error('Replication configuration is not properly defined.');
  }
})();
