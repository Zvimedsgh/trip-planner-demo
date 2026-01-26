import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {} as any,
    res: {} as any,
  };
}

describe("Budget Payment Status Management", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testTripId: number;
  let testHotelId: number;
  let testTransportId: number;
  let testRestaurantId: number;

  beforeAll(async () => {
    const ctx = createTestContext();
    caller = appRouter.createCaller(ctx);
    
    // Create test trip
    const trip = await caller.trips.create({
      name: "Payment Test Trip",
      destination: "Test City",
      startDate: Date.now(),
      endDate: Date.now() + 86400000,
    });
    testTripId = trip.id;

    // Create test hotel with payment status
    const hotel = await caller.hotels.create({
      tripId: testTripId,
      name: "Test Hotel",
      price: "100",
      currency: "USD",
      paymentStatus: "pending",
      checkInDate: Date.now(),
      checkOutDate: Date.now() + 86400000,
    });
    testHotelId = hotel.id;

    // Create test transportation with payment status
    const transport = await caller.transportation.create({
      tripId: testTripId,
      type: "flight",
      origin: "City A",
      destination: "City B",
      price: "50",
      currency: "USD",
      paymentStatus: "pending",
      departureDate: Date.now(),
    });
    testTransportId = transport.id;

    // Create test restaurant with payment status
    const restaurant = await caller.restaurants.create({
      tripId: testTripId,
      name: "Test Restaurant",
      price: "30",
      currency: "USD",
      paymentStatus: "pending",
      date: Date.now(),
    });
    testRestaurantId = restaurant.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testHotelId) await db.deleteHotel(testHotelId);
    if (testTransportId) await db.deleteTransportation(testTransportId);
    if (testRestaurantId) await db.deleteRestaurant(testRestaurantId);
    if (testTripId) await db.deleteTrip(testTripId);
  });

  it("should create expenses with pending payment status by default", async () => {
    const hotels = await caller.hotels.list({ tripId: testTripId });
    const transports = await caller.transportation.list({ tripId: testTripId });
    const restaurants = await caller.restaurants.list({ tripId: testTripId });

    expect(hotels[0].paymentStatus).toBe("pending");
    expect(transports[0].paymentStatus).toBe("pending");
    expect(restaurants[0].paymentStatus).toBe("pending");
  });

  it("should update hotel payment status to paid", async () => {
    await caller.hotels.update({
      id: testHotelId,
      paymentStatus: "paid",
    });

    const hotels = await caller.hotels.list({ tripId: testTripId });
    expect(hotels[0].paymentStatus).toBe("paid");
  });

  it("should update transportation payment status to paid", async () => {
    await caller.transportation.update({
      id: testTransportId,
      paymentStatus: "paid",
    });

    const transports = await caller.transportation.list({ tripId: testTripId });
    expect(transports[0].paymentStatus).toBe("paid");
  });

  it("should update restaurant payment status to paid", async () => {
    await caller.restaurants.update({
      id: testRestaurantId,
      paymentStatus: "paid",
    });

    const restaurants = await caller.restaurants.list({ tripId: testTripId });
    expect(restaurants[0].paymentStatus).toBe("paid");
  });

  it("should calculate correct totals for paid and unpaid expenses", async () => {
    // Reset all to pending
    await caller.hotels.update({ id: testHotelId, paymentStatus: "pending" });
    await caller.transportation.update({ id: testTransportId, paymentStatus: "pending" });
    await caller.restaurants.update({ id: testRestaurantId, paymentStatus: "pending" });

    // Mark hotel as paid
    await caller.hotels.update({ id: testHotelId, paymentStatus: "paid" });

    const hotels = await caller.hotels.list({ tripId: testTripId });
    const transports = await caller.transportation.list({ tripId: testTripId });
    const restaurants = await caller.restaurants.list({ tripId: testTripId });

    const paidTotal = hotels
      .filter(h => h.paymentStatus === "paid" && h.price)
      .reduce((sum, h) => sum + parseFloat(h.price!), 0);

    const unpaidTotal = 
      transports.filter(t => t.paymentStatus === "pending" && t.price).reduce((sum, t) => sum + parseFloat(t.price!), 0) +
      restaurants.filter(r => r.paymentStatus === "pending" && r.price).reduce((sum, r) => sum + parseFloat(r.price!), 0);

    expect(paidTotal).toBe(100);
    expect(unpaidTotal).toBe(80); // 50 + 30
  });
});
