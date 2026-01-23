import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";
import { nanoid } from "nanoid";

describe("Trip Collaboration", () => {
  let testTripId: number;
  let ownerUserId: number;
  let collaboratorUserId: number;
  const ownerOpenId = `test-owner-${nanoid(8)}`;
  const collabOpenId = `test-collab-${nanoid(8)}`;
  const testEmail = `collaborator-${nanoid(8)}@test.com`;
  const ownerEmail = `owner-${nanoid(8)}@test.com`;

  beforeAll(async () => {
    // Create owner user
    await db.upsertUser({
      openId: ownerOpenId,
      name: "Test Owner",
      email: ownerEmail,
      loginMethod: "email",
    });
    
    const ownerUser = await db.getUserByOpenId(ownerOpenId);
    if (!ownerUser) throw new Error("Failed to create owner user");
    ownerUserId = ownerUser.id;

    // Create collaborator user
    await db.upsertUser({
      openId: collabOpenId,
      name: "Test Collaborator",
      email: testEmail,
      loginMethod: "email",
    });
    
    const collabUser = await db.getUserByEmail(testEmail);
    if (!collabUser) throw new Error("Failed to create collaborator user");
    collaboratorUserId = collabUser.id;

    // Create test trip
    const trip = await db.createTrip({
      userId: ownerUserId,
      name: "Test Collaboration Trip",
      destination: "Test Location",
      startDate: Date.now(),
      endDate: Date.now() + 86400000,
    });
    testTripId = trip.id;
  });

  it("should add a collaborator to a trip", async () => {
    const collaborator = await db.addTripCollaborator(
      testTripId,
      ownerUserId,
      testEmail,
      "edit"
    );

    expect(collaborator).toBeDefined();
    expect(collaborator?.tripId).toBe(testTripId);
    expect(collaborator?.userId).toBe(collaboratorUserId);
    expect(collaborator?.permission).toBe("edit");
  });

  it("should list collaborators for a trip", async () => {
    const collaborators = await db.getTripCollaborators(testTripId, ownerUserId);

    expect(collaborators).toBeDefined();
    expect(collaborators.length).toBeGreaterThan(0);
    expect(collaborators[0].userEmail).toBe(testEmail);
  });

  it("should verify collaborator can access trip", async () => {
    const canAccess = await db.canAccessTrip(testTripId, collaboratorUserId);
    expect(canAccess).toBe(true);
  });

  it("should remove a collaborator from a trip", async () => {
    const removed = await db.removeTripCollaborator(
      testTripId,
      ownerUserId,
      collaboratorUserId
    );

    expect(removed).toBe(true);

    const collaborators = await db.getTripCollaborators(testTripId, ownerUserId);
    expect(collaborators.length).toBe(0);
  });

  it("should prevent non-owner from adding collaborators", async () => {
    await expect(
      db.addTripCollaborator(testTripId, collaboratorUserId, "another@test.com", "edit")
    ).rejects.toThrow("Unauthorized");
  });
});
