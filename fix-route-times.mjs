import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Routes with CORRECT local times (Bratislava timezone, UTC+2 in summer)
const correctTimes = [
  {
    id: 1,
    // Sep 2, 19:00 LOCAL (not UTC) = 17:00 UTC
    date: new Date('2026-09-02T17:00:00Z').getTime()
  },
  {
    id: 2,
    // Sep 3, 09:00 LOCAL = 07:00 UTC
    date: new Date('2026-09-03T07:00:00Z').getTime()
  },
  {
    id: 3,
    // Sep 4, 09:00 LOCAL = 07:00 UTC
    date: new Date('2026-09-04T07:00:00Z').getTime()
  },
  {
    id: 4,
    // Sep 5, 10:00 LOCAL = 08:00 UTC
    date: new Date('2026-09-05T08:00:00Z').getTime()
  },
  {
    id: 5,
    // Sep 7, 10:00 LOCAL = 08:00 UTC
    date: new Date('2026-09-07T08:00:00Z').getTime()
  },
  {
    id: 6,
    // Sep 9, 08:00 LOCAL = 06:00 UTC
    date: new Date('2026-09-09T06:00:00Z').getTime()
  }
];

async function fixRouteTimes() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    console.log('Fixing route times to local timezone...\n');
    
    for (const route of correctTimes) {
      const [result] = await connection.execute(
        `UPDATE trip_routes SET date = ? WHERE id = ?`,
        [route.date, route.id]
      );
      
      // Get route name for confirmation
      const [rows] = await connection.execute(
        `SELECT name, time FROM trip_routes WHERE id = ?`,
        [route.id]
      );
      
      const localTime = new Date(route.date).toLocaleString('en-US', {
        timeZone: 'Europe/Bratislava',
        dateStyle: 'short',
        timeStyle: 'short'
      });
      
      console.log(`✓ Fixed Route ${route.id}: ${rows[0].name}`);
      console.log(`  Time: ${rows[0].time} (local) = ${localTime}`);
    }
    
    console.log('\n✅ All route times fixed successfully!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixRouteTimes();
