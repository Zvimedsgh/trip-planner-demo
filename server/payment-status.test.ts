import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { db } from "./db";
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
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

const ctx = createTestContext();
const caller = appRouter.createCaller(ctx);

describe("Payment Status Tracking", () => {
  let testTripId: number;
  let testHotelId: number;
  let testTransportId: number;
  let testRestaurantId: number;

  beforeAll(async () => {
    // Create a test trip
    const trip = await caller.trips.create({
      name: "Payment Test Trip",
      destination: "Test City",
      startDate: Date.now(),
      endDate: Date.now() + 86400000,
    });
    testTripId = trip.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testHotelId) await caller.hotels.delete({ id: testHotelId });
    if (testTransportId) await caller.transportation.delete({ id: testTransportId });
    if (testRestaurantId) await caller.restaurants.delete({ id: testRestaurantId });
    if (testTripId) await caller.trips.delete({ id: testTripId });
  });

  it("should create hotel with payment status", async () => {
    const hotel = await caller.hotels.create({
      tripId: testTripId,
      name: "Test Hotel",
      checkInDate: Date.now(),
      checkOutDate: Date.now() + 86400000,
      paymentStatus: "paid",
    });
    testHotelId = hotel.id;
    expect(hotel.paymentStatus).toBe("paid");
  });

  it("should create transportation with payment status", async () => {
    const transport = await caller.transportation.create({
      tripId: testTripId,
      type: "flight",
      origin: "Test Origin",
      destination: "Test Destination",
      departureDate: Date.now(),
      paymentStatus: "pending",
    });
    testTransportId = transport.id;
    expect(transport.paymentStatus).toBe("pending");
  });

  it("should create restaurant with payment status", async () => {
    const restaurant = await caller.restaurants.create({
      tripId: testTripId,
      name: "Test Restaurant",
      paymentStatus: "paid",
    });
    testRestaurantId = restaurant.id;
    expect(restaurant.paymentStatus).toBe("paid");
  });

  it("should update hotel payment status", async () => {
    await caller.hotels.update({
      id: testHotelId,
      paymentStatus: "pending",
    });
    const hotels = await caller.hotels.list({ tripId: testTripId });
    const updated = hotels.find(h => h.id === testHotelId);
    expect(updated?.paymentStatus).toBe("pending");
  });

  it("should update transportation payment status", async () => {
    await caller.transportation.update({
      id: testTransportId,
      paymentStatus: "paid",
    });
    const transports = await caller.transportation.list({ tripId: testTripId });
    const updated = transports.find(t => t.id === testTransportId);
    expect(updated?.paymentStatus).toBe("paid");
  });

  it("should update restaurant payment status", async () => {
    await caller.restaurants.update({
      id: testRestaurantId,
      paymentStatus: "pending",
    });
    const restaurants = await caller.restaurants.list({ tripId: testTripId });
    const updated = restaurants.find(r => r.id === testRestaurantId);
    expect(updated?.paymentStatus).toBe("pending");
  });
});
