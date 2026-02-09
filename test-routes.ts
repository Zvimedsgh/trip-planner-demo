import { getTripRoutes } from './server/db';

async function main() {
  console.log('Checking routes for different trips...\n');
  
  // Check trips 1-10 and 30001
  const tripIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30001, 330001];
  
  for (const tripId of tripIds) {
    const routes = await getTripRoutes(tripId);
    if (routes.length > 0) {
      console.log(`Trip ${tripId}: ${routes.length} routes`);
      routes.forEach(r => {
        console.log(`  - Route ${r.id}: ${r.name}`);
      });
    }
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
