import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const routes = [
  {
    tripId: 30001,
    name: "Route 1: Bratislava → Liptovský Mikuláš",
    nameHe: "מסלול 1: ברטיסלבה → ליפטובסקי מיקולאש",
    description: "Day 2: Departure at 19:00 from Bratislava to Liptovský Mikuláš",
    descriptionHe: "יום 2: יציאה ב-19:00 מברטיסלבה למיקולאש",
    date: new Date('2026-09-02T19:00:00Z').getTime(),
    time: "19:00"
  },
  {
    tripId: 30001,
    name: "Route 4: Trip to Štrbské Pleso",
    nameHe: "מסלול 4: טיול לשטרבסקה פלסו",
    description: "Day 3: High Tatras mountain lake",
    descriptionHe: "יום 3: אגם ההרים בטטרה הגבוהה",
    date: new Date('2026-09-03T09:00:00Z').getTime(),
    time: "09:00"
  },
  {
    tripId: 30001,
    name: "Route 5: Trip to Jasná – Demänovská Dolina",
    nameHe: "מסלול 5: טיול ליאסנה – דמנובסקה דולינה",
    description: "Day 4: Ski resort and caves",
    descriptionHe: "יום 4: אתר סקי ומערות",
    date: new Date('2026-09-04T09:00:00Z').getTime(),
    time: "09:00"
  },
  {
    tripId: 30001,
    name: "Route 2: Liptovský Mikuláš → Košice",
    nameHe: "מסלול 2: ליפטובסקי מיקולאש → קושיצה",
    description: "Day 5: Journey to Košice via Slovenský Raj",
    descriptionHe: "יום 5: מסע לקושיצה דרך סלובנסקי ראי'",
    date: new Date('2026-09-05T10:00:00Z').getTime(),
    time: "10:00"
  },
  {
    tripId: 30001,
    name: "Route 3: Košice → Vienna",
    nameHe: "מסלול 3: קושיצה → וינה",
    description: "Day 7: Drive to Vienna",
    descriptionHe: "יום 7: נסיעה לוינה",
    date: new Date('2026-09-07T10:00:00Z').getTime(),
    time: "10:00"
  },
  {
    tripId: 30001,
    name: "Route 6: Vienna → Bratislava Airport",
    nameHe: "מסלול 6: וינה → שדה התעופה",
    description: "Day 9: Departure",
    descriptionHe: "יום 9: יציאה",
    date: new Date('2026-09-09T08:00:00Z').getTime(),
    time: "08:00"
  }
];

async function migrateRoutes() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    console.log('Starting route migration...');
    
    for (const route of routes) {
      const [result] = await connection.execute(
        `INSERT INTO trip_routes (tripId, name, nameHe, description, descriptionHe, date, time) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [route.tripId, route.name, route.nameHe, route.description, route.descriptionHe, route.date, route.time]
      );
      console.log(`✓ Inserted: ${route.name}`);
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`Total routes migrated: ${routes.length}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrateRoutes();
