import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, bigint, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "he"]).default("en").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Trips table - main entity for travel planning
 */
export const trips = mysqlTable("trips", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  startDate: bigint("startDate", { mode: "number" }).notNull(), // UTC timestamp in ms
  endDate: bigint("endDate", { mode: "number" }).notNull(), // UTC timestamp in ms
  description: text("description"),
  coverImage: varchar("coverImage", { length: 500 }),
  shareToken: varchar("shareToken", { length: 32 }).unique(), // Public share link token
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = typeof trips.$inferInsert;

/**
 * Tourist sites table
 */
export const touristSites = mysqlTable("tourist_sites", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }),
  description: text("description"),
  openingHours: varchar("openingHours", { length: 255 }),
  plannedVisitDate: bigint("plannedVisitDate", { mode: "number" }), // UTC timestamp in ms
  plannedVisitTime: varchar("plannedVisitTime", { length: 10 }), // HH:MM format
  website: varchar("website", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TouristSite = typeof touristSites.$inferSelect;
export type InsertTouristSite = typeof touristSites.$inferInsert;

/**
 * Hotels table
 */
export const hotels = mysqlTable("hotels", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }),
  checkInDate: bigint("checkInDate", { mode: "number" }).notNull(), // UTC timestamp in ms
  checkInTime: varchar("checkInTime", { length: 10 }), // HH:MM format
  checkOutDate: bigint("checkOutDate", { mode: "number" }).notNull(), // UTC timestamp in ms
  checkOutTime: varchar("checkOutTime", { length: 10 }), // HH:MM format
  confirmationNumber: varchar("confirmationNumber", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 500 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  category: varchar("category", { length: 100 }),
  coverImage: varchar("coverImage", { length: 500 }),
  parkingImage: varchar("parkingImage", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = typeof hotels.$inferInsert;

/**
 * Transportation table (flights, trains, buses)
 */
export const transportation = mysqlTable("transportation", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  type: mysqlEnum("type", ["flight", "train", "bus", "ferry", "other"]).notNull(),
  flightNumber: varchar("flightNumber", { length: 50 }),
  origin: varchar("origin", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  departureDate: bigint("departureDate", { mode: "number" }).notNull(), // UTC timestamp in ms
  arrivalDate: bigint("arrivalDate", { mode: "number" }),
  confirmationNumber: varchar("confirmationNumber", { length: 100 }),
  website: varchar("website", { length: 500 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transportation = typeof transportation.$inferSelect;
export type InsertTransportation = typeof transportation.$inferInsert;

/**
 * Day trips table - for managing day trips and excursions
 */
export const dayTrips = mysqlTable("day_trips", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  startLocation: varchar("startLocation", { length: 255 }).notNull(),
  endLocation: varchar("endLocation", { length: 255 }).notNull(),
  startTime: bigint("startTime", { mode: "number" }).notNull(), // UTC timestamp in ms
  endTime: bigint("endTime", { mode: "number" }).notNull(), // UTC timestamp in ms
  stops: text("stops"), // JSON array of stops with details
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DayTrip = typeof dayTrips.$inferSelect;
export type InsertDayTrip = typeof dayTrips.$inferInsert;

/**
 * Pre-trip checklist table - for managing tasks before the trip
 */
export const checklistItems = mysqlTable("checklist_items", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["documents", "bookings", "packing", "health", "finance", "other"]).notNull(),
  completed: boolean("completed").default(false).notNull(),
  dueDate: bigint("dueDate", { mode: "number" }), // UTC timestamp in ms, optional
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = typeof checklistItems.$inferInsert;

/**
 * Car rentals table
 */
export const carRentals = mysqlTable("car_rentals", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  carModel: varchar("carModel", { length: 255 }),
  pickupDate: bigint("pickupDate", { mode: "number" }).notNull(), // UTC timestamp in ms
  pickupTime: varchar("pickupTime", { length: 10 }), // HH:MM format
  returnDate: bigint("returnDate", { mode: "number" }).notNull(), // UTC timestamp in ms
  returnTime: varchar("returnTime", { length: 10 }), // HH:MM format
  pickupLocation: varchar("pickupLocation", { length: 500 }),
  returnLocation: varchar("returnLocation", { length: 500 }),
  confirmationNumber: varchar("confirmationNumber", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 500 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CarRental = typeof carRentals.$inferSelect;
export type InsertCarRental = typeof carRentals.$inferInsert;

/**
 * Restaurants table
 */
export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }),
  cuisineType: varchar("cuisineType", { length: 100 }),
  reservationDate: bigint("reservationDate", { mode: "number" }), // UTC timestamp in ms
  reservationTime: varchar("reservationTime", { length: 10 }), // HH:MM format
  numberOfDiners: int("numberOfDiners"),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 500 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;

/**
 * Documents table
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["passport", "visa", "insurance", "booking", "ticket", "restaurant", "hotel", "other"]).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  tags: text("tags"), // JSON array of tags
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;


/**
 * Trip collaborators table - manages shared access to trips
 */
export const tripCollaborators = mysqlTable("trip_collaborators", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  userId: int("userId").notNull(), // The collaborator's user ID
  permission: mysqlEnum("permission", ["view_only", "can_edit"]).default("view_only").notNull(),
  invitedBy: int("invitedBy").notNull(), // User ID of the person who invited
  lastSeen: timestamp("lastSeen"), // Last time the collaborator accessed this trip
  visitCount: int("visitCount").default(0).notNull(), // Number of times accessed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TripCollaborator = typeof tripCollaborators.$inferSelect;
export type InsertTripCollaborator = typeof tripCollaborators.$inferInsert;

/**
 * Routes table - driving routes between destinations
 */
export const routes = mysqlTable("trip_routes", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Route 1: Bratislava → Liptovský Mikuláš"
  nameHe: varchar("nameHe", { length: 255 }), // Hebrew translation
  description: text("description"), // e.g., "Day 2: Drive to mountain accommodation"
  descriptionHe: text("descriptionHe"), // Hebrew translation
  date: bigint("date", { mode: "number" }).notNull(), // UTC timestamp in ms
  time: varchar("time", { length: 5 }), // HH:MM format (24-hour)
  mapData: text("mapData"), // JSON string with map configuration (markers, waypoints, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Route = typeof routes.$inferSelect;
export type InsertRoute = typeof routes.$inferInsert;

/**
 * Activity log table - tracks all user actions on trips
 */
export const activityLog = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  userId: int("userId").notNull(),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  entityType: mysqlEnum("entityType", ["hotel", "transportation", "car_rental", "tourist_site", "restaurant", "document", "checklist", "day_trip"]).notNull(),
  entityId: int("entityId"), // ID of the affected entity
  entityName: varchar("entityName", { length: 255 }), // Name/description for display
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;
