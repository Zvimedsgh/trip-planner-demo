import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { payments } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('\n📊 Checking payments in Demo trip (630001):\n');

const demoPayments = await db.select().from(payments).where(eq(payments.tripId, 630001)).limit(3);

console.log('Sample payments:');
demoPayments.forEach((p, i) => {
  console.log(`\n${i + 1}. Payment ID ${p.id}:`);
  console.log(`   Activity: ${p.activityType} #${p.activityId}`);
  console.log(`   Amount: ${p.amount} ${p.currency}`);
  console.log(`   All fields:`, Object.keys(p));
});

await connection.end();
