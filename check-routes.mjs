import { db } from './server/db.ts';

const routes = await db.getAllRoutes();
console.log('Total routes:', routes.length);
console.log('\nRoutes by trip:');
const byTrip = routes.reduce((acc, r) => {
  acc[r.tripId] = (acc[r.tripId] || 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify(byTrip, null, 2));

console.log('\nFirst 10 routes:');
routes.slice(0, 10).forEach(r => {
  console.log(`Route ${r.id}: Trip ${r.tripId} - ${r.name}`);
});

process.exit(0);
