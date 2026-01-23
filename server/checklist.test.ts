import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';
import type { TrpcContext } from './_core/context';

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createTestContext(userId: number): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: 'test@example.com',
    name: 'Test User',
    loginMethod: 'manus',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };
}

describe('Checklist Feature', () => {
  let testTripId: number;
  let testUserId: number = 999;
  let testChecklistItemId: number;

  beforeAll(async () => {
    // Create a test trip
    const trip = await db.createTrip({
      userId: testUserId,
      name: 'Test Trip for Checklist',
      destination: 'Test Destination',
      startDate: Date.now(),
      endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    testTripId = trip.id;
  });

  it('should create a checklist item', async () => {
    const ctx = createTestContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    const item = await caller.checklist.create({
      tripId: testTripId,
      title: 'Check passport expiration',
      category: 'documents',
      notes: 'Make sure passport is valid for 6 months',
    });

    expect(item).toBeDefined();
    expect(item.title).toBe('Check passport expiration');
    expect(item.category).toBe('documents');
    expect(item.completed).toBe(false);
    testChecklistItemId = item.id;
  });

  it('should list checklist items for a trip', async () => {
    const ctx = createTestContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    const items = await caller.checklist.list({ tripId: testTripId });

    expect(items).toBeDefined();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].tripId).toBe(testTripId);
  });

  it('should update checklist item completion status', async () => {
    const ctx = createTestContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    const updated = await caller.checklist.update({
      id: testChecklistItemId,
      completed: true,
    });

    expect(updated).toBeDefined();
    expect(updated?.completed).toBe(true);
  });

  it('should delete a checklist item', async () => {
    const ctx = createTestContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checklist.delete({ id: testChecklistItemId });

    expect(result).toBe(true);

    // Verify deletion
    const items = await caller.checklist.list({ tripId: testTripId });
    const deletedItem = items.find(item => item.id === testChecklistItemId);
    expect(deletedItem).toBeUndefined();
  });
});
