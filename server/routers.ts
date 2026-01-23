import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateLanguage: protectedProcedure
      .input(z.object({ language: z.enum(["en", "he"]) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserLanguage(ctx.user.id, input.language);
        return { success: true };
      }),
  }),

  // ============ TRIPS ============
  trips: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserTrips(ctx.user.id)),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => db.getTripById(input.id, ctx.user.id)),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        destination: z.string().min(1),
        startDate: z.number(),
        endDate: z.number(),
        description: z.string().optional(),
        coverImage: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createTrip({ ...input, userId: ctx.user.id })),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        destination: z.string().min(1).optional(),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        description: z.string().optional(),
        coverImage: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateTrip(id, ctx.user.id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteTrip(input.id, ctx.user.id)),
    
    // Sharing endpoints
    generateShareLink: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.generateShareToken(input.id, ctx.user.id)),
    
    revokeShareLink: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.revokeShareToken(input.id, ctx.user.id)),
    
    // Public endpoint - no auth required
    getByShareToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => db.getTripByShareToken(input.token)),
    
    // Upload cover image
    uploadCoverImage: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        imageData: z.string(), // Base64 encoded image
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.imageData, 'base64');
        const extension = input.mimeType.split('/')[1] || 'jpg';
        const fileKey = `trip-covers/${ctx.user.id}/${input.tripId}-${nanoid(8)}.${extension}`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Update trip with cover image URL
        await db.updateTrip(input.tripId, ctx.user.id, { coverImage: url });
        
        return { url };
      }),
    
    // Collaboration endpoints
    addCollaborator: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        userEmail: z.string().email(),
        permission: z.enum(["view", "edit"]).default("edit"),
      }))
      .mutation(({ ctx, input }) => db.addTripCollaborator(input.tripId, ctx.user.id, input.userEmail, input.permission)),
    
    removeCollaborator: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        userId: z.number(),
      }))
      .mutation(({ ctx, input }) => db.removeTripCollaborator(input.tripId, ctx.user.id, input.userId)),
    
    listCollaborators: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ ctx, input }) => db.getTripCollaborators(input.tripId, ctx.user.id)),
  }),

  // ============ PUBLIC SHARED TRIP DATA ============
  sharedTrip: router({
    getHotels: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const trip = await db.getTripByShareToken(input.token);
        if (!trip) return [];
        return db.getTripHotels(trip.id);
      }),
    
    getTransportation: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const trip = await db.getTripByShareToken(input.token);
        if (!trip) return [];
        return db.getTripTransportation(trip.id);
      }),
    
    getCarRentals: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const trip = await db.getTripByShareToken(input.token);
        if (!trip) return [];
        return db.getTripCarRentals(trip.id);
      }),
    
    getRestaurants: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const trip = await db.getTripByShareToken(input.token);
        if (!trip) return [];
        return db.getTripRestaurants(trip.id);
      }),
    
    getTouristSites: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const trip = await db.getTripByShareToken(input.token);
        if (!trip) return [];
        return db.getTripTouristSites(trip.id);
      }),
  }),

  // ============ TOURIST SITES ============
  touristSites: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ input }) => db.getTripTouristSites(input.tripId)),
    
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        name: z.string().min(1),
        address: z.string().optional(),
        description: z.string().optional(),
        openingHours: z.string().optional(),
        plannedVisitDate: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createTouristSite(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        description: z.string().optional(),
        openingHours: z.string().optional(),
        plannedVisitDate: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateTouristSite(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteTouristSite(input.id)),
  }),

  // ============ HOTELS ============
  hotels: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ input }) => db.getTripHotels(input.tripId)),
    
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        name: z.string().min(1),
        address: z.string().optional(),
        checkInDate: z.number(),
        checkInTime: z.string().optional(),
        checkOutDate: z.number(),
        checkOutTime: z.string().optional(),
        confirmationNumber: z.string().optional(),
        phone: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createHotel(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        checkInDate: z.number().optional(),
        checkInTime: z.string().optional(),
        checkOutDate: z.number().optional(),
        checkOutTime: z.string().optional(),
        confirmationNumber: z.string().optional(),
        phone: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateHotel(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteHotel(input.id)),
  }),

  // ============ TRANSPORTATION ============
  transportation: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ input }) => db.getTripTransportation(input.tripId)),
    
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        type: z.enum(["flight", "train", "bus", "ferry", "other"]),
        flightNumber: z.string().optional(),
        origin: z.string().min(1),
        destination: z.string().min(1),
        departureDate: z.number(),
        arrivalDate: z.number().optional(),
        confirmationNumber: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createTransportation(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(["flight", "train", "bus", "ferry", "other"]).optional(),
        flightNumber: z.string().optional(),
        origin: z.string().min(1).optional(),
        destination: z.string().min(1).optional(),
        departureDate: z.number().optional(),
        arrivalDate: z.number().optional(),
        confirmationNumber: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateTransportation(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteTransportation(input.id)),
  }),

  // ============ CAR RENTALS ============
  carRentals: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ input }) => db.getTripCarRentals(input.tripId)),
    
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        company: z.string().min(1),
        carModel: z.string().optional(),
        pickupDate: z.number(),
        pickupTime: z.string().optional(),
        returnDate: z.number(),
        returnTime: z.string().optional(),
        pickupLocation: z.string().optional(),
        returnLocation: z.string().optional(),
        confirmationNumber: z.string().optional(),
        phone: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createCarRental(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        company: z.string().min(1).optional(),
        carModel: z.string().optional(),
        pickupDate: z.number().optional(),
        pickupTime: z.string().optional(),
        returnDate: z.number().optional(),
        returnTime: z.string().optional(),
        pickupLocation: z.string().optional(),
        returnLocation: z.string().optional(),
        confirmationNumber: z.string().optional(),
        phone: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateCarRental(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteCarRental(input.id)),
  }),

  // ============ RESTAURANTS ============
  restaurants: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ input }) => db.getTripRestaurants(input.tripId)),
    
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        name: z.string().min(1),
        address: z.string().optional(),
        cuisineType: z.string().optional(),
        reservationDate: z.number().optional(),
        numberOfDiners: z.number().optional(),
        phone: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createRestaurant(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        cuisineType: z.string().optional(),
        reservationDate: z.number().optional(),
        numberOfDiners: z.number().optional(),
        phone: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateRestaurant(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteRestaurant(input.id)),
  }),

  // ============ DOCUMENTS ============
  documents: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ input }) => db.getTripDocuments(input.tripId)),
    
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        name: z.string().min(1),
        category: z.enum(["passport", "visa", "insurance", "booking", "ticket", "other"]),
        fileUrl: z.string(),
        fileKey: z.string(),
        mimeType: z.string().optional(),
        tags: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createDocument(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        category: z.enum(["passport", "visa", "insurance", "booking", "ticket", "other"]).optional(),
        tags: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateDocument(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteDocument(input.id)),
    
    upload: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        fileName: z.string(),
        fileData: z.string(), // base64
        mimeType: z.string(),
        category: z.enum(["passport", "visa", "insurance", "booking", "ticket", "other"]),
        tags: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const fileKey = `documents/${ctx.user.id}/${input.tripId}/${nanoid()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return db.createDocument({
          tripId: input.tripId,
          name: input.fileName,
          category: input.category,
          fileUrl: url,
          fileKey: fileKey,
          mimeType: input.mimeType,
          tags: input.tags,
          notes: input.notes,
        });
      }),
  }),

  // ============ DAY TRIPS ============
  dayTrips: router({    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ input }) => db.getTripDayTrips(input.tripId)),
    
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        startLocation: z.string().min(1),
        endLocation: z.string().min(1),
        startTime: z.number(),
        endTime: z.number(),
        stops: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createDayTrip(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        startLocation: z.string().optional(),
        endLocation: z.string().optional(),
        startTime: z.number().optional(),
        endTime: z.number().optional(),
        stops: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateDayTrip(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteDayTrip(input.id)),
  }),

  // ============ BUDGET ============
  budget: router({
    get: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ input }) => db.getTripBudget(input.tripId)),
  }),
});

export type AppRouter = typeof appRouter;
