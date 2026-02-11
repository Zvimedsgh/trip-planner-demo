import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { documents } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const docs = await db.select({
  id: documents.id,
  name: documents.name
}).from(documents).where(eq(documents.tripId, 630001));

docs.sort((a, b) => a.name.localeCompare(b.name));

console.log('\n📄 רשימת המסמכים האמיתיים בטיול הדגמה:\n');
docs.forEach((doc, index) => {
  console.log(`${(index + 1).toString().padStart(2, '0')}. ${doc.name} (ID: ${doc.id})`);
});
console.log('');

await connection.end();
