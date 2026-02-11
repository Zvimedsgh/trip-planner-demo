import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { documents } from './drizzle/schema.js';
import { like } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const doc = await db.select().from(documents).where(like(documents.fileKey, '%rO2ij24CRslSjhqO2_UFM%')).limit(1);
console.log(JSON.stringify(doc[0], null, 2));
await connection.end();
