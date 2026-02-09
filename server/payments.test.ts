import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('Payment System', () => {
  let testTripId: number;
  let testHotelId: number;
  let testUserId: number;
  let testPaymentId: number;

  beforeAll(async () => {
    // Create test user
    const testUser = {
      openId: 'test-payment-user-' + Date.now(),
      name: 'Payment Test User',
      email: 'payment-test@example.com',
    };
    await db.upsertUser(testUser);
    const user = await db.getUserByOpenId(testUser.openId);
    if (!user) throw new Error('Failed to create test user');
    testUserId = user.id;

    // Create test trip
    const trip = await db.createTrip({
      userId: testUserId,
      name: 'Payment Test Trip',
      destination: 'Test Destination',
      startDate: Date.now(),
      endDate: Date.now() + 86400000 * 7,
    });
    testTripId = trip.id;

    // Create test hotel with price
    const hotel = await db.createHotel({
      tripId: testTripId,
      name: 'Test Hotel',
      checkInDate: Date.now(),
      checkOutDate: Date.now() + 86400000 * 2,
      price: '500.00',
      currency: 'EUR',
      paymentStatus: 'pending',
    });
    testHotelId = hotel.id;
  });

  it('should create a payment for a hotel', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: 'test-payment-user', name: 'Test User', email: 'test@example.com', role: 'user' },
      req: {} as any,
      res: {} as any,
    });

    const payment = await caller.payments.create({
      tripId: testTripId,
      activityType: 'hotel',
      activityId: testHotelId,
      amount: 200,
      currency: 'EUR',
      paymentDate: Date.now(),
      paymentMethod: 'credit_card',
      notes: 'Deposit payment',
    });

    expect(payment).toBeDefined();
    expect(payment.amount).toBe('200.00');
    expect(payment.currency).toBe('EUR');
    expect(payment.activityType).toBe('hotel');
    expect(payment.activityId).toBe(testHotelId);
    testPaymentId = payment.id;
  });

  it('should retrieve payments for an activity', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: 'test-payment-user', name: 'Test User', email: 'test@example.com', role: 'user' },
      req: {} as any,
      res: {} as any,
    });

    const payments = await caller.payments.getActivityPayments({
      activityType: 'hotel',
      activityId: testHotelId,
    });

    expect(payments).toBeDefined();
    expect(payments.length).toBeGreaterThan(0);
    expect(payments[0].activityId).toBe(testHotelId);
  });

  it('should retrieve all payments for a trip', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: 'test-payment-user', name: 'Test User', email: 'test@example.com', role: 'user' },
      req: {} as any,
      res: {} as any,
    });

    const payments = await caller.payments.getTripPayments({
      tripId: testTripId,
    });

    expect(payments).toBeDefined();
    expect(payments.length).toBeGreaterThan(0);
    expect(payments[0].tripId).toBe(testTripId);
  });

  it('should update a payment', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: 'test-payment-user', name: 'Test User', email: 'test@example.com', role: 'user' },
      req: {} as any,
      res: {} as any,
    });

    const updated = await caller.payments.update({
      id: testPaymentId,
      amount: 250,
      notes: 'Updated deposit payment',
    });

    expect(updated).toBeDefined();
    expect(updated?.amount).toBe('250.00');
    expect(updated?.notes).toBe('Updated deposit payment');
  });

  it('should handle multiple payments (deposit + final)', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: 'test-payment-user', name: 'Test User', email: 'test@example.com', role: 'user' },
      req: {} as any,
      res: {} as any,
    });

    // Add second payment (final payment)
    await caller.payments.create({
      tripId: testTripId,
      activityType: 'hotel',
      activityId: testHotelId,
      amount: 250,
      currency: 'EUR',
      paymentDate: Date.now() + 86400000,
      paymentMethod: 'bank_transfer',
      notes: 'Final payment',
    });

    const payments = await caller.payments.getActivityPayments({
      activityType: 'hotel',
      activityId: testHotelId,
    });

    expect(payments.length).toBe(2);
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    expect(totalPaid).toBe(500); // 250 + 250 = 500 (full hotel price)
  });

  it('should delete a payment', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: 'test-payment-user', name: 'Test User', email: 'test@example.com', role: 'user' },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.payments.delete({
      id: testPaymentId,
    });

    expect(result).toBe(true);

    const payments = await caller.payments.getActivityPayments({
      activityType: 'hotel',
      activityId: testHotelId,
    });

    expect(payments.find(p => p.id === testPaymentId)).toBeUndefined();
  });
});
