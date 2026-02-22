import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Function to extract time from timestamp
function extractTime(timestamp) {
  const d = new Date(timestamp);
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Function to get midnight UTC for a date
function getMidnightUTC(timestamp) {
  const d = new Date(timestamp);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

// Migrate transportation
const [transports] = await conn.query('SELECT * FROM transportation WHERE tripId = 30001');
for (const t of transports) {
  const depTime = extractTime(t.departureDate);
  const depDate = getMidnightUTC(t.departureDate);
  const depLoc = t.type === 'flight' && t.origin.includes('Israel') ? 'Israel' : 'Slovakia';
  
  let arrTime = null, arrDate = null, arrLoc = null;
  if (t.arrivalDate) {
    arrTime = extractTime(t.arrivalDate);
    arrDate = getMidnightUTC(t.arrivalDate);
    arrLoc = 'Slovakia';
  }
  
  await conn.query(
    'UPDATE transportation SET departureDate=?, departureTime=?, departureLocation=?, arrivalDate=?, arrivalTime=?, arrivalLocation=? WHERE id=?',
    [depDate, depTime, depLoc, arrDate, arrTime, arrLoc, t.id]
  );
  console.log(`Updated transportation ${t.id}: ${depTime} ${depLoc}`);
}

// Migrate hotels
const [hotels] = await conn.query('SELECT * FROM hotels WHERE tripId = 30001');
for (const h of hotels) {
  await conn.query(
    'UPDATE hotels SET checkInDate=?, checkOutDate=?, location=? WHERE id=?',
    [getMidnightUTC(h.checkInDate), getMidnightUTC(h.checkOutDate), 'Slovakia', h.id]
  );
  console.log(`Updated hotel ${h.id}: Slovakia`);
}

// Migrate tourist sites
const [sites] = await conn.query('SELECT * FROM tourist_sites WHERE tripId = 30001 AND plannedVisitDate IS NOT NULL');
for (const s of sites) {
  await conn.query(
    'UPDATE tourist_sites SET plannedVisitDate=?, location=? WHERE id=?',
    [getMidnightUTC(s.plannedVisitDate), 'Slovakia', s.id]
  );
  console.log(`Updated site ${s.id}: Slovakia`);
}

// Migrate restaurants
const [restaurants] = await conn.query('SELECT * FROM restaurants WHERE tripId = 30001 AND reservationDate IS NOT NULL');
for (const r of restaurants) {
  await conn.query(
    'UPDATE restaurants SET reservationDate=?, location=? WHERE id=?',
    [getMidnightUTC(r.reservationDate), 'Slovakia', r.id]
  );
  console.log(`Updated restaurant ${r.id}: Slovakia`);
}

// Migrate routes
const [routes] = await conn.query('SELECT * FROM trip_routes WHERE tripId = 30001');
for (const r of routes) {
  await conn.query(
    'UPDATE trip_routes SET date=?, location=? WHERE id=?',
    [getMidnightUTC(r.date), 'Slovakia', r.id]
  );
  console.log(`Updated route ${r.id}: Slovakia`);
}

await conn.end();
console.log('Migration complete!');
