import { eq, and } from "drizzle-orm";
import { 
  trips, hotels, transportation, touristSites, restaurants, documents, 
  dayTrips, checklistItems, routes, routePointsOfInterest, payments,
  users
} from "../drizzle/schema";
import { getDb } from "./db";

const DEMO_TRIP_ID = 30001; // Slovakia trip ID
const DEMO_DURATION_DAYS = 7;

/**
 * Create or get demo user for the given openId
 */
export async function getOrCreateDemoUser(openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already exists
  const existingUser = await db.select().from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  if (existingUser.length > 0) {
    return existingUser[0];
  }

  // Create new demo user
  const now = Date.now();
  const expiryDate = now + (DEMO_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(users).values({
    openId,
    name: "Demo User",
    isDemoUser: true,
    demoStartDate: now,
    demoExpiryDate: expiryDate,
    maxTrips: 2, // Slovakia demo + 1 custom trip
    role: "user",
    preferredLanguage: "en",
    lastSignedIn: new Date(),
  });

  const newUser = await db.select().from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return newUser[0];
}

/**
 * Copy the Slovakia demo trip to a new user
 */
export async function copyDemoTripToUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the original trip
  const originalTrip = await db.select().from(trips)
    .where(eq(trips.id, DEMO_TRIP_ID))
    .limit(1);

  if (originalTrip.length === 0) {
    throw new Error("Demo trip not found");
  }

  const trip = originalTrip[0];

  // Create new trip for user
  const newTripResult = await db.insert(trips).values({
    userId,
    name: "Discover Slovakia",
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    description: trip.description,
    coverImage: trip.coverImage,
  });

  const newTripId = Number(newTripResult[0].insertId);

  // Copy all related data
  await Promise.all([
    copyHotels(db, DEMO_TRIP_ID, newTripId),
    copyTransportation(db, DEMO_TRIP_ID, newTripId),
    copyTouristSites(db, DEMO_TRIP_ID, newTripId),
    copyRestaurants(db, DEMO_TRIP_ID, newTripId),
    createSampleDocuments(db, newTripId),
    copyDayTrips(db, DEMO_TRIP_ID, newTripId),
    copyChecklistItems(db, DEMO_TRIP_ID, newTripId),
    copyRoutes(db, DEMO_TRIP_ID, newTripId),
    copyPayments(db, DEMO_TRIP_ID, newTripId),
  ]);

  return newTripId;
}

async function copyHotels(db: any, fromTripId: number, toTripId: number) {
  const items = await db.select().from(hotels).where(eq(hotels.tripId, fromTripId));
  if (items.length === 0) return;

  for (const item of items) {
    const { id, ...data } = item;
    await db.insert(hotels).values({ ...data, tripId: toTripId });
  }
}

async function copyTransportation(db: any, fromTripId: number, toTripId: number) {
  const items = await db.select().from(transportation).where(eq(transportation.tripId, fromTripId));
  if (items.length === 0) return;

  for (const item of items) {
    const { id, ...data } = item;
    await db.insert(transportation).values({ ...data, tripId: toTripId });
  }
}

async function copyTouristSites(db: any, fromTripId: number, toTripId: number) {
  const items = await db.select().from(touristSites).where(eq(touristSites.tripId, fromTripId));
  if (items.length === 0) return;

  for (const item of items) {
    const { id, ...data } = item;
    await db.insert(touristSites).values({ ...data, tripId: toTripId });
  }
}

async function copyRestaurants(db: any, fromTripId: number, toTripId: number) {
  const items = await db.select().from(restaurants).where(eq(restaurants.tripId, fromTripId));
  if (items.length === 0) return;

  for (const item of items) {
    const { id, ...data } = item;
    await db.insert(restaurants).values({ ...data, tripId: toTripId });
  }
}

async function copyDocuments(db: any, fromTripId: number, toTripId: number) {
  const items = await db.select().from(documents).where(eq(documents.tripId, fromTripId));
  if (items.length === 0) return;

  for (const item of items) {
    const { id, ...data } = item;
    await db.insert(documents).values({ ...data, tripId: toTripId });
  }
}

async function createSampleDocuments(db: any, tripId: number) {
  const sampleDocs = [
    {
      tripId,
      name: "Sample Passport Copy",
      category: "passport" as const,
      fileUrl: "/demo-document-placeholder",
      fileKey: "demo/sample-passport.pdf",
      mimeType: "application/pdf",
      notes: "This is a sample document for demonstration purposes",
    },
    {
      tripId,
      name: "Sample Flight Booking",
      category: "flights" as const,
      fileUrl: "/demo-document-placeholder",
      fileKey: "demo/sample-flight-booking.pdf",
      mimeType: "application/pdf",
      notes: "Example flight booking confirmation",
    },
    {
      tripId,
      name: "Sample Hotel Confirmation",
      category: "hotel" as const,
      fileUrl: "/demo-document-placeholder",
      fileKey: "demo/sample-hotel-confirmation.pdf",
      mimeType: "application/pdf",
      notes: "Example hotel reservation",
    },
    {
      tripId,
      name: "Sample Travel Insurance",
      category: "insurance" as const,
      fileUrl: "/demo-document-placeholder",
      fileKey: "demo/sample-insurance.pdf",
      mimeType: "application/pdf",
      notes: "Example travel insurance policy",
    },
  ];

  for (const doc of sampleDocs) {
    await db.insert(documents).values(doc);
  }
}

async function copyDayTrips(db: any, fromTripId: number, toTripId: number) {
  const items = await db.select().from(dayTrips).where(eq(dayTrips.tripId, fromTripId));
  if (items.length === 0) return;

  for (const item of items) {
    const { id, ...data } = item;
    await db.insert(dayTrips).values({ ...data, tripId: toTripId });
  }
}

async function copyChecklistItems(db: any, fromTripId: number, toTripId: number) {
  const items = await db.select().from(checklistItems).where(eq(checklistItems.tripId, fromTripId));
  if (items.length === 0) return;

  for (const item of items) {
    const { id, ...data } = item;
    // Set all checklist items to "shared" instead of personal owners
    await db.insert(checklistItems).values({ ...data, owner: "shared", tripId: toTripId });
  }
}

async function copyRoutes(db: any, fromTripId: number, toTripId: number) {
  const items = await db.select().from(routes).where(eq(routes.tripId, fromTripId));
  if (items.length === 0) return;

  for (const item of items) {
    const { id: oldRouteId, ...routeData } = item;
    const newRouteResult = await db.insert(routes).values({ ...routeData, tripId: toTripId });
    const newRouteId = Number((newRouteResult as any).insertId);

    // Copy route POIs
    const pois = await db.select().from(routePointsOfInterest)
      .where(eq(routePointsOfInterest.routeId, oldRouteId));

    for (const poi of pois) {
      const { id, ...poiData } = poi;
      await db.insert(routePointsOfInterest).values({ ...poiData, routeId: newRouteId });
    }
  }
}

async function copyPayments(db: any, fromTripId: number, toTripId: number) {
  // Don't copy real payments - create sample ones instead
  await createSamplePayments(db, toTripId);
}

async function createSamplePayments(db: any, tripId: number) {
  // Don't create sample payments - they require activityId which we don't have
  // Just skip payments for demo mode
  return;
}

/**
 * Check if user has reached trip creation limit
 */
export async function canCreateTrip(userId: number): Promise<{ allowed: boolean; reason?: string }> {
  const db = await getDb();
  if (!db) return { allowed: false, reason: "Database not available" };

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) return { allowed: false, reason: "User not found" };

  const userData = user[0];

  // Full users have no limit
  if (!userData.isDemoUser || userData.maxTrips === null) {
    return { allowed: true };
  }

  // Check current trip count
  const userTrips = await db.select().from(trips).where(eq(trips.userId, userId));
  
  if (userTrips.length >= userData.maxTrips) {
    return { 
      allowed: false, 
      reason: `Demo users can create only ${userData.maxTrips - 1} additional trip` 
    };
  }

  return { allowed: true };
}

/**
 * Check if demo has expired
 */
export async function isDemoExpired(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0 || !user[0].isDemoUser) return false;

  const expiryDate = user[0].demoExpiryDate;
  if (!expiryDate) return false;

  return Date.now() > expiryDate;
}

/**
 * Get days remaining in demo
 */
export async function getDemoTimeRemaining(userId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0 || !user[0].isDemoUser) return null;

  const expiryDate = user[0].demoExpiryDate;
  if (!expiryDate) return null;

  const msRemaining = expiryDate - Date.now();
  return Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
}
