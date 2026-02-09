import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(userId: number): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-doc-link-user",
    email: "test-doc-link@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
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

describe("Document Linking System", () => {
  let testUserId: number = 1; // Use existing user
  let testTripId: number;
  let testDocumentId: number;
  let testTransportationId: number;
  let testHotelId: number;

  beforeAll(async () => {

    // Create test trip
    const trip = await db.createTrip({
      userId: testUserId,
      name: "Test Trip for Document Linking",
      destination: "Test Destination",
      startDate: Date.now(),
      endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    testTripId = trip.id;

    // Create test document
    const document = await db.createDocument({
      tripId: testTripId,
      name: "Flight Ticket TLV-BTS",
      category: "ticket",
      fileUrl: "https://example.com/ticket.pdf",
      fileKey: "test/ticket.pdf",
    });
    testDocumentId = document.id;

    // Create test transportation
    const transportation = await db.createTransportation({
      tripId: testTripId,
      type: "flight",
      origin: "Tel Aviv",
      destination: "Bratislava",
      departureDate: Date.now(),
      flightNumber: "W62387",
    });
    testTransportationId = transportation.id;

    // Create test hotel
    const hotel = await db.createHotel({
      tripId: testTripId,
      name: "Test Hotel",
      checkInDate: Date.now(),
      checkOutDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
    });
    testHotelId = hotel.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testTransportationId) await db.deleteTransportation(testTransportationId);
    if (testHotelId) await db.deleteHotel(testHotelId);
    if (testDocumentId) await db.deleteDocument(testDocumentId);
    if (testTripId) await db.deleteTrip(testTripId, testUserId);
  });

  it("should link a document to transportation", async () => {
    const ctx = createTestContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    // Link document to transportation
    await caller.transportation.update({
      id: testTransportationId,
      linkedDocumentId: testDocumentId,
    });

    // Verify the link was created
    const transports = await caller.transportation.list({ tripId: testTripId });
    const linkedTransport = transports.find(t => t.id === testTransportationId);
    
    expect(linkedTransport).toBeDefined();
    expect(linkedTransport?.linkedDocumentId).toBe(testDocumentId);
  });

  it("should unlink a document from transportation", async () => {
    const ctx = createTestContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    // First link the document
    await caller.transportation.update({
      id: testTransportationId,
      linkedDocumentId: testDocumentId,
    });

    // Then unlink it by passing null explicitly
    // Note: We need to update via db directly since tRPC strips undefined
    await db.updateTransportation(testTransportationId, {
      linkedDocumentId: null,
    });

    // Verify the link was removed
    const transports = await caller.transportation.list({ tripId: testTripId });
    const unlinkedTransport = transports.find(t => t.id === testTransportationId);
    
    expect(unlinkedTransport).toBeDefined();
    expect(unlinkedTransport?.linkedDocumentId).toBeNull();
  });

  it("should link a document to hotel", async () => {
    const ctx = createTestContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    // Link document to hotel
    await caller.hotels.update({
      id: testHotelId,
      linkedDocumentId: testDocumentId,
    });

    // Verify the link was created
    const hotels = await caller.hotels.list({ tripId: testTripId });
    const linkedHotel = hotels.find(h => h.id === testHotelId);
    
    expect(linkedHotel).toBeDefined();
    expect(linkedHotel?.linkedDocumentId).toBe(testDocumentId);
  });

  it("should create transportation with linked document", async () => {
    const ctx = createTestContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    // Create transportation with document link
    const newTransport = await caller.transportation.create({
      tripId: testTripId,
      type: "train",
      origin: "Bratislava",
      destination: "Vienna",
      departureDate: Date.now() + 24 * 60 * 60 * 1000,
      linkedDocumentId: testDocumentId,
    });

    expect(newTransport.linkedDocumentId).toBe(testDocumentId);

    // Cleanup
    await db.deleteTransportation(newTransport.id);
  });

  it("should create hotel with linked document", async () => {
    const ctx = createTestContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    // Create hotel with document link
    const newHotel = await caller.hotels.create({
      tripId: testTripId,
      name: "Hotel with Document",
      checkInDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
      checkOutDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
      linkedDocumentId: testDocumentId,
    });

    expect(newHotel.linkedDocumentId).toBe(testDocumentId);

    // Cleanup
    await db.deleteHotel(newHotel.id);
  });
});
