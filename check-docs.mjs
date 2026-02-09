import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const docs = await db.select().from(schema.documents).limit(2);
console.log(JSON.stringify(docs, null, 2));
await connection.end();
