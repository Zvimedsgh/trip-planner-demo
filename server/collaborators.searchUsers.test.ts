import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { User } from "../drizzle/schema";

describe("collaborators.searchUsers", () => {
  let testUser: User;

  beforeAll(async () => {
    // Create a test user
    await db.upsertUser({
      openId: "test-search-user-123",
      name: "Danny Test",
      email: "danny@example.com",
    });
    
    const user = await db.getUserByOpenId("test-search-user-123");
    if (!user) throw new Error("Failed to create test user");
    testUser = user;
  });

  it("should search users by name", async () => {
    const caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.collaborators.searchUsers({ searchTerm: "Danny" });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Should find our test user
    const foundUser = result.find(u => u.name === "Danny Test");
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(testUser.id);
  });

  it("should return empty array for non-existent name", async () => {
    const caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.collaborators.searchUsers({ searchTerm: "NonExistentUser12345" });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should perform case-insensitive search", async () => {
    const caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.collaborators.searchUsers({ searchTerm: "danny" });
    
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    
    // Should find user regardless of case
    const foundUser = result.find(u => u.name === "Danny Test");
    expect(foundUser).toBeDefined();
  });

  it("should only return id and name (not full user object)", async () => {
    const caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.collaborators.searchUsers({ searchTerm: "Danny" });
    
    if (result.length > 0) {
      const user = result[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      // Should NOT have sensitive fields like email, openId
      expect(user).not.toHaveProperty("email");
      expect(user).not.toHaveProperty("openId");
    }
  });
});
