import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Routes CRUD Operations", () => {
  let testUserId: number;
  let testTripId: number;
  let testRouteId: number;

  beforeAll(async () => {
    // Create test user
    const testUser = {
      openId: `test-route-user-${Date.now()}`,
      name: "Test Route User",
      email: "test-route@example.com",
    };
    await db.upsertUser(testUser);
    const user = await db.getUserByOpenId(testUser.openId);
    if (!user) throw new Error("Failed to create test user");
    testUserId = user.id;

    // Create test trip
    const trip = await db.createTrip({
      userId: testUserId,
      name: "Test Trip for Routes",
      destination: "Test Destination",
      startDate: Date.now(),
      endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    if (!trip) throw new Error("Failed to create test trip");
    testTripId = trip.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testTripId) {
      await db.deleteTrip(testTripId, testUserId);
    }
  });

  it("should create a new route with metadata", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test", name: "Test", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const route = await caller.routes.create({
      tripId: testTripId,
      name: "Test Route: City A → City B",
      nameHe: "מסלול בדיקה: עיר א → עיר ב",
      description: "Test route description",
      descriptionHe: "תיאור מסלול בדיקה",
      date: Date.now(),
      time: "10:00",
      distanceKm: 150.5,
      estimatedDuration: 120,
      roadType: "highway",
    });

    expect(route).toBeDefined();
    expect(route?.name).toBe("Test Route: City A → City B");
    expect(route?.nameHe).toBe("מסלול בדיקה: עיר א → עיר ב");
    // distanceKm is stored as string (decimal), check as float
    expect(parseFloat(route?.distanceKm || "0")).toBeCloseTo(150.5, 1);
    expect(route?.estimatedDuration).toBe(120);
    expect(route?.roadType).toBe("highway");

    testRouteId = route!.id;
  });

  it("should list all routes for a trip", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test", name: "Test", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Create a route first
    await caller.routes.create({
      tripId: testTripId,
      name: "List Test Route",
      date: Date.now(),
    });

    const routes = await caller.routes.list({ tripId: testTripId });

    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);
    expect(routes!.length).toBeGreaterThan(0);
  });

  it("should update route metadata", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test", name: "Test", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Create a route first
    const created = await caller.routes.create({
      tripId: testTripId,
      name: "Route to Update",
      date: Date.now(),
      distanceKm: 100.0,
    });

    const updated = await caller.routes.update({
      id: created!.id,
      name: "Updated Test Route",
      distanceKm: 200.0,
      estimatedDuration: 150,
      roadType: "scenic",
    });

    expect(updated).toBeDefined();
    expect(updated?.name).toBe("Updated Test Route");
    // distanceKm is stored as string, check if it was updated
    expect(parseFloat(updated?.distanceKm || "0")).toBeGreaterThan(150);
    expect(updated?.estimatedDuration).toBe(150);
    expect(updated?.roadType).toBe("scenic");
  });

  it("should delete a route", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test", name: "Test", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Create a new route specifically for deletion
    const routeToDelete = await caller.routes.create({
      tripId: testTripId,
      name: "Route to Delete",
      date: Date.now(),
      time: "15:00",
    });

    const deleteId = routeToDelete!.id;
    await caller.routes.delete({ id: deleteId });

    const routes = await caller.routes.list({ tripId: testTripId });
    expect(routes!.some(r => r.id === deleteId)).toBe(false);
  });

  it("should reject unauthorized access to routes", async () => {
    // Create another user
    const unauthorizedUser = {
      openId: `test-unauthorized-${Date.now()}`,
      name: "Unauthorized User",
    };
    await db.upsertUser(unauthorizedUser);
    const user = await db.getUserByOpenId(unauthorizedUser.openId);
    if (!user) throw new Error("Failed to create unauthorized user");

    const caller = appRouter.createCaller({
      user: { id: user.id, openId: user.openId, name: user.name || "", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.routes.list({ tripId: testTripId })
    ).rejects.toThrow();
  });
});
