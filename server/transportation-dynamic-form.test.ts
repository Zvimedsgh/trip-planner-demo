import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Dynamic Transportation Form", () => {
  const caller = appRouter.createCaller({
    user: { id: 1, email: "test@example.com", name: "Test User", role: "user" },
  });

  it("should create car rental with car-specific fields", async () => {
    const result = await caller.transportation.create({
      tripId: 1,
      type: "car_rental",
      origin: "Tel Aviv Airport",
      destination: "Tel Aviv Airport",
      departureDate: Date.now(),
      arrivalDate: Date.now() + 86400000 * 3,
      company: "Hertz",
      carModel: "Toyota Corolla",
      pickupLocation: "Tel Aviv Airport",
      returnLocation: "Tel Aviv Airport",
      phone: "+972-50-1234567",
      price: "500",
      currency: "USD",
    });

    expect(result).toBeDefined();
    expect(result.type).toBe("car_rental");
    expect(result.company).toBe("Hertz");
    expect(result.carModel).toBe("Toyota Corolla");
    expect(result.pickupLocation).toBe("Tel Aviv Airport");
    expect(result.returnLocation).toBe("Tel Aviv Airport");
    expect(result.phone).toBe("+972-50-1234567");
  });

  it("should create flight without car rental fields", async () => {
    const result = await caller.transportation.create({
      tripId: 1,
      type: "flight",
      origin: "TLV",
      destination: "JFK",
      departureDate: Date.now(),
      flightNumber: "LY001",
      price: "800",
      currency: "USD",
    });

    expect(result).toBeDefined();
    expect(result.type).toBe("flight");
    expect(result.flightNumber).toBe("LY001");
    expect(result.origin).toBe("TLV");
    expect(result.destination).toBe("JFK");
    // Car rental fields should be null for flights (database returns null for optional fields)
    expect(result.company).toBeNull();
    expect(result.carModel).toBeNull();
  });

  it("should update car rental with new car model", async () => {
    // Create first
    const created = await caller.transportation.create({
      tripId: 1,
      type: "car_rental",
      origin: "Airport",
      destination: "Airport",
      departureDate: Date.now(),
      company: "Avis",
      carModel: "Hyundai i30",
      pickupLocation: "Airport",
      returnLocation: "Airport",
    });

    // Update
    const updated = await caller.transportation.update({
      id: created.id,
      carModel: "Toyota Yaris",
    });

    expect(updated.carModel).toBe("Toyota Yaris");
    expect(updated.company).toBe("Avis"); // Should remain unchanged
  });

  it("should handle train without car rental fields", async () => {
    const result = await caller.transportation.create({
      tripId: 1,
      type: "train",
      origin: "Paris",
      destination: "London",
      departureDate: Date.now(),
      price: "150",
      currency: "EUR",
    });

    expect(result).toBeDefined();
    expect(result.type).toBe("train");
    expect(result.origin).toBe("Paris");
    expect(result.destination).toBe("London");
    expect(result.company).toBeNull();
  });
});
