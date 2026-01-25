import { eq, and, desc, asc, sql, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, User, users, 
  trips, InsertTrip, Trip,
  touristSites, InsertTouristSite, TouristSite,
  hotels, InsertHotel, Hotel,
  transportation, InsertTransportation, Transportation,
  carRentals, InsertCarRental, CarRental,
  restaurants, InsertRestaurant, Restaurant,
  documents, InsertDocument, Document,
  dayTrips, InsertDayTrip, DayTrip,
  checklistItems, InsertChecklistItem, ChecklistItem,
  tripCollaborators, InsertTripCollaborator, TripCollaborator,
  activityLog, InsertActivityLog, ActivityLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER QUERIES ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLanguage(userId: number, language: "en" | "he") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ preferredLanguage: language }).where(eq(users.id, userId));
}

export async function searchUsersByName(searchTerm: string): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Search for users whose name contains the search term (case-insensitive)
  // Use LOWER() for case-insensitive comparison
  const result = await db.select().from(users)
    .where(sql`LOWER(${users.name}) LIKE LOWER(${'%' + searchTerm + '%'})`)
    .limit(10);
  
  return result;
}

export async function getUserById(userId: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ TRIP QUERIES ============

export async function createTrip(data: InsertTrip): Promise<Trip> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(trips).values(data);
  const inserted = await db.select().from(trips).where(eq(trips.id, Number(result[0].insertId))).limit(1);
  return inserted[0];
}

export async function getUserTrips(userId: number): Promise<Trip[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Get trips owned by user
  const ownedTrips = await db.select().from(trips).where(eq(trips.userId, userId));
  
  // Get trips where user is a collaborator
  const collaboratedTripsResult = await db
    .select()
    .from(tripCollaborators)
    .innerJoin(trips, eq(tripCollaborators.tripId, trips.id))
    .where(eq(tripCollaborators.userId, userId));
  
  const collaboratedTrips = collaboratedTripsResult.map(row => row.trips);
  
  // Combine and deduplicate
  const allTrips: Trip[] = [...ownedTrips, ...collaboratedTrips];
  const uniqueTrips = Array.from(new Map(allTrips.map(t => [t.id, t])).values());
  
  // Sort by start date descending
  return uniqueTrips.sort((a, b) => b.startDate - a.startDate);
}

export async function getTripById(tripId: number, userId: number): Promise<Trip | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  // First check if user owns the trip
  const ownedTrip = await db.select().from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .limit(1);
  
  if (ownedTrip.length > 0) {
    return ownedTrip[0];
  }
  
  // If not owner, check if user is a collaborator
  const collaboratorAccess = await db.select()
    .from(tripCollaborators)
    .where(and(eq(tripCollaborators.tripId, tripId), eq(tripCollaborators.userId, userId)))
    .limit(1);
  
  if (collaboratorAccess.length > 0) {
    // User is a collaborator, return the trip
    const trip = await db.select().from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);
    return trip[0];
  }
  
  // User has no access
  return undefined;
}

export async function updateTrip(tripId: number, userId: number, data: Partial<InsertTrip>): Promise<Trip | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(trips).set(data).where(and(eq(trips.id, tripId), eq(trips.userId, userId)));
  return getTripById(tripId, userId);
}

export async function deleteTrip(tripId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  // Delete all related data first
  await db.delete(touristSites).where(eq(touristSites.tripId, tripId));
  await db.delete(hotels).where(eq(hotels.tripId, tripId));
  await db.delete(transportation).where(eq(transportation.tripId, tripId));
  await db.delete(carRentals).where(eq(carRentals.tripId, tripId));
  await db.delete(restaurants).where(eq(restaurants.tripId, tripId));
  await db.delete(documents).where(eq(documents.tripId, tripId));
  
  const result = await db.delete(trips).where(and(eq(trips.id, tripId), eq(trips.userId, userId)));
  return true;
}

// ============ TRIP SHARING ============

export async function generateShareToken(tripId: number, userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Generate a random 16-character token
  const token = Array.from({ length: 16 }, () => 
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]
  ).join('');
  
  await db.update(trips).set({ shareToken: token }).where(and(eq(trips.id, tripId), eq(trips.userId, userId)));
  return token;
}

export async function revokeShareToken(tripId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.update(trips).set({ shareToken: null }).where(and(eq(trips.id, tripId), eq(trips.userId, userId)));
  return true;
}

export async function getTripByShareToken(shareToken: string): Promise<Trip | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(trips).where(eq(trips.shareToken, shareToken)).limit(1);
  return result[0];
}

// ============ TOURIST SITES QUERIES ============

export async function createTouristSite(data: InsertTouristSite): Promise<TouristSite> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(touristSites).values(data);
  const inserted = await db.select().from(touristSites).where(eq(touristSites.id, Number(result[0].insertId))).limit(1);
  return inserted[0];
}

export async function getTripTouristSites(tripId: number): Promise<TouristSite[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(touristSites).where(eq(touristSites.tripId, tripId)).orderBy(sql`COALESCE(${touristSites.plannedVisitDate}, 9999999999999)`);
}

export async function updateTouristSite(id: number, data: Partial<InsertTouristSite>): Promise<TouristSite | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(touristSites).set(data).where(eq(touristSites.id, id));
  const result = await db.select().from(touristSites).where(eq(touristSites.id, id)).limit(1);
  return result[0];
}

export async function deleteTouristSite(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(touristSites).where(eq(touristSites.id, id));
  return true;
}

// ============ HOTEL QUERIES ============

export async function createHotel(data: InsertHotel): Promise<Hotel> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(hotels).values(data);
  const inserted = await db.select().from(hotels).where(eq(hotels.id, Number(result[0].insertId))).limit(1);
  return inserted[0];
}

export async function getTripHotels(tripId: number): Promise<Hotel[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(hotels).where(eq(hotels.tripId, tripId)).orderBy(hotels.checkInDate, hotels.checkInTime);
}

export async function updateHotel(id: number, data: Partial<InsertHotel>): Promise<Hotel | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(hotels).set(data).where(eq(hotels.id, id));
  const result = await db.select().from(hotels).where(eq(hotels.id, id)).limit(1);
  return result[0];
}

export async function deleteHotel(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(hotels).where(eq(hotels.id, id));
  return true;
}

// ============ TRANSPORTATION QUERIES ============

export async function createTransportation(data: InsertTransportation): Promise<Transportation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(transportation).values(data);
  const inserted = await db.select().from(transportation).where(eq(transportation.id, Number(result[0].insertId))).limit(1);
  return inserted[0];
}

export async function getTripTransportation(tripId: number): Promise<Transportation[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(transportation).where(eq(transportation.tripId, tripId)).orderBy(transportation.departureDate);
}

export async function updateTransportation(id: number, data: Partial<InsertTransportation>): Promise<Transportation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(transportation).set(data).where(eq(transportation.id, id));
  const result = await db.select().from(transportation).where(eq(transportation.id, id)).limit(1);
  return result[0];
}

export async function deleteTransportation(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(transportation).where(eq(transportation.id, id));
  return true;
}

// ============ CAR RENTAL QUERIES ============

export async function createCarRental(data: InsertCarRental): Promise<CarRental> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(carRentals).values(data);
  const inserted = await db.select().from(carRentals).where(eq(carRentals.id, Number(result[0].insertId))).limit(1);
  return inserted[0];
}

export async function getTripCarRentals(tripId: number): Promise<CarRental[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(carRentals).where(eq(carRentals.tripId, tripId)).orderBy(carRentals.pickupDate);
}

export async function updateCarRental(id: number, data: Partial<InsertCarRental>): Promise<CarRental | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(carRentals).set(data).where(eq(carRentals.id, id));
  const result = await db.select().from(carRentals).where(eq(carRentals.id, id)).limit(1);
  return result[0];
}

export async function deleteCarRental(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(carRentals).where(eq(carRentals.id, id));
  return true;
}

// ============ RESTAURANT QUERIES ============

export async function createRestaurant(data: InsertRestaurant): Promise<Restaurant> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(restaurants).values(data);
  const inserted = await db.select().from(restaurants).where(eq(restaurants.id, Number(result[0].insertId))).limit(1);
  return inserted[0];
}

export async function getTripRestaurants(tripId: number): Promise<Restaurant[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(restaurants).where(eq(restaurants.tripId, tripId)).orderBy(restaurants.reservationDate);
}

export async function updateRestaurant(id: number, data: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(restaurants).set(data).where(eq(restaurants.id, id));
  const result = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
  return result[0];
}

export async function deleteRestaurant(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(restaurants).where(eq(restaurants.id, id));
  return true;
}

// ============ DOCUMENT QUERIES ============

export async function createDocument(data: InsertDocument): Promise<Document> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(documents).values(data);
  const inserted = await db.select().from(documents).where(eq(documents.id, Number(result[0].insertId))).limit(1);
  return inserted[0];
}

export async function getTripDocuments(tripId: number): Promise<Document[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(documents).where(eq(documents.tripId, tripId)).orderBy(desc(documents.createdAt));
}

export async function updateDocument(id: number, data: Partial<InsertDocument>): Promise<Document | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(documents).set(data).where(eq(documents.id, id));
  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return result[0];
}

export async function deleteDocument(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(documents).where(eq(documents.id, id));
  return true;
}

// ============ BUDGET CALCULATION ============

export async function getTripBudget(tripId: number) {
  const db = await getDb();
  if (!db) return { hotels: 0, transportation: 0, carRentals: 0, total: 0 };
  
  const tripHotels = await getTripHotels(tripId);
  const tripTransport = await getTripTransportation(tripId);
  const tripCars = await getTripCarRentals(tripId);
  
  const hotelsTotal = tripHotels.reduce((sum, h) => sum + (parseFloat(h.price || "0")), 0);
  const transportTotal = tripTransport.reduce((sum, t) => sum + (parseFloat(t.price || "0")), 0);
  const carsTotal = tripCars.reduce((sum, c) => sum + (parseFloat(c.price || "0")), 0);
  
  return {
    hotels: hotelsTotal,
    transportation: transportTotal,
    carRentals: carsTotal,
    total: hotelsTotal + transportTotal + carsTotal
  };
}

// ============ DAY TRIPS QUERIES ============

export async function createDayTrip(data: InsertDayTrip): Promise<DayTrip> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(dayTrips).values(data);
  const inserted = await db.select().from(dayTrips).where(eq(dayTrips.id, Number(result[0].insertId))).limit(1);
  return inserted[0];
}

export async function getTripDayTrips(tripId: number): Promise<DayTrip[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(dayTrips).where(eq(dayTrips.tripId, tripId)).orderBy(desc(dayTrips.startTime));
}

export async function updateDayTrip(id: number, data: Partial<InsertDayTrip>): Promise<DayTrip | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(dayTrips).set(data).where(eq(dayTrips.id, id));
  const result = await db.select().from(dayTrips).where(eq(dayTrips.id, id)).limit(1);
  return result[0];
}

export async function deleteDayTrip(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(dayTrips).where(eq(dayTrips.id, id));
  return true;
}

// ============ CHECKLIST QUERIES ============

export async function getTripChecklist(tripId: number): Promise<ChecklistItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checklistItems).where(eq(checklistItems.tripId, tripId)).orderBy(checklistItems.createdAt);
}

export async function createChecklistItem(data: InsertChecklistItem): Promise<ChecklistItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(checklistItems).values(data);
  const inserted = await db.select().from(checklistItems).where(eq(checklistItems.id, Number(result[0].insertId))).limit(1);
  return inserted[0];
}

export async function updateChecklistItem(id: number, data: Partial<InsertChecklistItem>): Promise<ChecklistItem | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(checklistItems).set(data).where(eq(checklistItems.id, id));
  const updated = await db.select().from(checklistItems).where(eq(checklistItems.id, id)).limit(1);
  return updated[0] || null;
}

export async function deleteChecklistItem(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(checklistItems).where(eq(checklistItems.id, id));
  return true;
}


// ============ COLLABORATORS ============

export async function getTripCollaborators(tripId: number): Promise<Array<TripCollaborator & { user: { id: number; name: string | null; email: string | null } }>> {
  const db = await getDb();
  if (!db) return [];
  
  const collaborators = await db
    .select({
      id: tripCollaborators.id,
      tripId: tripCollaborators.tripId,
      userId: tripCollaborators.userId,
      permission: tripCollaborators.permission,
      invitedBy: tripCollaborators.invitedBy,
      lastSeen: tripCollaborators.lastSeen,
      visitCount: tripCollaborators.visitCount,
      createdAt: tripCollaborators.createdAt,
      updatedAt: tripCollaborators.updatedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(tripCollaborators)
    .leftJoin(users, eq(tripCollaborators.userId, users.id))
    .where(eq(tripCollaborators.tripId, tripId))
    .orderBy(desc(tripCollaborators.createdAt));
  
  return collaborators.map(c => ({
    id: c.id,
    tripId: c.tripId,
    userId: c.userId,
    permission: c.permission,
    invitedBy: c.invitedBy,
    lastSeen: c.lastSeen,
    visitCount: c.visitCount,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    user: {
      id: c.userId,
      name: c.userName,
      email: c.userEmail,
    },
  }));
}

export async function getUserCollaboratorPermission(tripId: number, userId: number): Promise<TripCollaborator | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(tripCollaborators)
    .where(and(
      eq(tripCollaborators.tripId, tripId),
      eq(tripCollaborators.userId, userId)
    ))
    .limit(1);
  
  return result[0] || null;
}

export async function addTripCollaborator(data: InsertTripCollaborator): Promise<TripCollaborator> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(tripCollaborators).values(data);
  const inserted = await db
    .select()
    .from(tripCollaborators)
    .where(eq(tripCollaborators.id, Number((result as any).insertId)))
    .limit(1);
  
  return inserted[0];
}

export async function getCollaboratorById(id: number): Promise<TripCollaborator | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(tripCollaborators)
    .where(eq(tripCollaborators.id, id))
    .limit(1);
  
  return result[0] || null;
}

export async function updateCollaboratorPermission(id: number, permission: 'view_only' | 'can_edit'): Promise<TripCollaborator | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db
    .update(tripCollaborators)
    .set({ permission })
    .where(eq(tripCollaborators.id, id));
  
  const updated = await db
    .select()
    .from(tripCollaborators)
    .where(eq(tripCollaborators.id, id))
    .limit(1);
  
  return updated[0] || null;
}

export async function removeCollaborator(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(tripCollaborators).where(eq(tripCollaborators.id, id));
  return true;
}

/**
 * Update collaborator's last seen timestamp and increment visit count
 */
export async function updateCollaboratorVisit(tripId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(tripCollaborators)
    .set({
      lastSeen: new Date(),
      visitCount: sql`${tripCollaborators.visitCount} + 1`,
    })
    .where(
      and(
        eq(tripCollaborators.tripId, tripId),
        eq(tripCollaborators.userId, userId)
      )
    );
}

/**
 * Log a user activity
 */
export async function logActivity(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(activityLog).values(data);
}

/**
 * Get activity log for a trip
 */
export async function getActivityLog(tripId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const activities = await db
    .select({
      id: activityLog.id,
      tripId: activityLog.tripId,
      userId: activityLog.userId,
      action: activityLog.action,
      entityType: activityLog.entityType,
      entityId: activityLog.entityId,
      entityName: activityLog.entityName,
      createdAt: activityLog.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLog)
    .leftJoin(users, eq(activityLog.userId, users.id))
    .where(eq(activityLog.tripId, tripId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);

  return activities.map(a => ({
    id: a.id,
    tripId: a.tripId,
    userId: a.userId,
    action: a.action,
    entityType: a.entityType,
    entityId: a.entityId,
    entityName: a.entityName,
    createdAt: a.createdAt,
    user: {
      id: a.userId,
      name: a.userName,
      email: a.userEmail,
    },
  }));
}
