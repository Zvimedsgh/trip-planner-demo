import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut, storageGet } from "./storage";
import { nanoid } from "nanoid";
import { promises as fs } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

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
    
    // Public demo trip endpoint
    getDemo: publicProcedure.query(async () => {
      // Fetch the demo trip by name
      const demoTrip = await db.getDemoTripByName("הדגמה");
      return demoTrip;
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.id, ctx.user.id);
        // If user is a collaborator (not owner), update their lastSeen and visitCount
        if (trip && trip.userId !== ctx.user.id) {
          const collab = await db.getUserCollaboratorPermission(input.id, ctx.user.id);
          if (collab) {
            await db.updateCollaboratorVisit(input.id, ctx.user.id);
          }
        }
        return trip;
      }),
    
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
      .mutation(async ({ ctx, input }) => {
        const token = await db.generateShareToken(input.id, ctx.user.id);
        return { token };
      }),
    
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
        plannedVisitTime: z.string().optional(),
        website: z.string().optional(),
        notes: z.string().optional(),
        coverImage: z.string().optional(),
        linkedDocumentId: z.number().nullable().optional(),
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
        plannedVisitTime: z.string().optional(),
        website: z.string().optional(),
        notes: z.string().optional(),
        coverImage: z.string().optional(),
        linkedDocumentId: z.number().nullable().optional(),
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
        website: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        category: z.string().optional(),
        paymentStatus: z.enum(["paid", "pending"]).optional(),
        notes: z.string().optional(),
        linkedDocumentId: z.number().nullable().optional(),
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
        website: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        category: z.string().optional(),
        paymentStatus: z.enum(["paid", "pending"]).optional(),
        notes: z.string().optional(),
        parkingImage: z.string().optional(),
        gallery: z.string().optional(), // JSON string of image URLs array
        linkedDocumentId: z.number().nullable().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateHotel(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteHotel(input.id)),
    
    uploadParkingImage: protectedProcedure
      .input(z.object({
        hotelId: z.number(),
        imageData: z.string(), // Base64 encoded image
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.imageData, 'base64');
        const extension = input.mimeType.split('/')[1] || 'jpg';
        const fileKey = `hotel-parking/${ctx.user.id}/${input.hotelId}-${nanoid(8)}.${extension}`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Update hotel with parking image URL
        await db.updateHotel(input.hotelId, { parkingImage: url });
        
        return { url };
      }),
  }),

  // ============ TRANSPORTATION ============
  transportation: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ input }) => db.getTripTransportation(input.tripId)),
    
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        type: z.enum(["flight", "train", "bus", "ferry", "car_rental", "other"]),
        flightNumber: z.string().optional(),
        origin: z.string().min(1),
        destination: z.string().min(1),
        departureDate: z.number(),
        departureTime: z.string().optional(),
        arrivalDate: z.number().optional(),
        arrivalTime: z.string().optional(),
        confirmationNumber: z.string().optional(),
        website: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        paymentStatus: z.enum(["paid", "pending"]).optional(),
        notes: z.string().optional(),
        linkedDocumentId: z.number().nullable().optional(),
        // Car rental specific fields
        company: z.string().optional(),
        carModel: z.string().optional(),
        pickupLocation: z.string().optional(),
        returnLocation: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(({ input }) => db.createTransportation(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(["flight", "train", "bus", "ferry", "car_rental", "other"]).optional(),
        flightNumber: z.string().optional(),
        origin: z.string().min(1).optional(),
        destination: z.string().min(1).optional(),
        departureDate: z.number().optional(),
        departureTime: z.string().optional(),
        arrivalDate: z.number().optional(),
        arrivalTime: z.string().optional(),
        confirmationNumber: z.string().optional(),
        website: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        paymentStatus: z.enum(["paid", "pending"]).optional(),
        notes: z.string().optional(),
        linkedDocumentId: z.number().nullable().optional(),
        // Car rental specific fields
        company: z.string().optional(),
        carModel: z.string().optional(),
        pickupLocation: z.string().optional(),
        returnLocation: z.string().optional(),
        phone: z.string().optional(),
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
        website: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
        linkedDocumentId: z.number().nullable().optional(),
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
        website: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
        paymentStatus: z.enum(["paid", "pending"]).optional(),
        linkedDocumentId: z.number().nullable().optional(),
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
        reservationTime: z.string().optional(),
        numberOfDiners: z.number().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        paymentStatus: z.enum(["paid", "pending"]).optional(),
        notes: z.string().optional(),
        coverImage: z.string().optional(),
        linkedDocumentId: z.number().nullable().optional(),
      }))
      .mutation(({ input }) => db.createRestaurant(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        cuisineType: z.string().optional(),
        reservationDate: z.number().optional(),
        reservationTime: z.string().optional(),
        numberOfDiners: z.number().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        paymentStatus: z.enum(["paid", "pending"]).optional(),
        notes: z.string().optional(),
        coverImage: z.string().optional(),
        linkedDocumentId: z.number().nullable().optional(),
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
        category: z.enum(["passport", "visa", "insurance", "booking", "ticket", "restaurant", "hotel", "flights", "other"]),
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
        category: z.enum(["passport", "visa", "insurance", "booking", "ticket", "restaurant", "hotel", "flights", "other"]).optional(),
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
        category: z.enum(["passport", "visa", "insurance", "booking", "ticket", "restaurant", "hotel", "flights", "other"]),
        tags: z.string().optional(),
        notes: z.string().optional(),
        hotelId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let buffer = Buffer.from(input.fileData, "base64");
        let fileName = input.fileName;
        let mimeType = input.mimeType;
        
        // Check if file is .docx and needs conversion
        const isDocx = input.mimeType.includes('wordprocessingml') || 
                       input.mimeType.includes('msword') || 
                       fileName.toLowerCase().endsWith('.docx') ||
                       fileName.toLowerCase().endsWith('.doc');
        
        if (isDocx) {
          // Convert .docx to PDF
          const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docx-convert-'));
          const inputPath = path.join(tmpDir, fileName);
          const outputName = fileName.replace(/\.(docx?|DOCX?)$/, '.pdf');
          const outputPath = path.join(tmpDir, outputName);
          
          try {
            // Write docx to temp file
            await fs.writeFile(inputPath, buffer);
            
            // Convert using LibreOffice
            await execAsync(
              `libreoffice --headless --convert-to pdf --outdir "${tmpDir}" "${inputPath}"`
            );
            
            // Read converted PDF
            buffer = Buffer.from(await fs.readFile(outputPath));
            fileName = outputName;
            mimeType = 'application/pdf';
          } finally {
            // Cleanup temp files
            await fs.rm(tmpDir, { recursive: true, force: true });
          }
        }
        
        const fileKey = `documents/${ctx.user.id}/${input.tripId}/${nanoid()}-${fileName}`;
        const { url } = await storagePut(fileKey, buffer, mimeType);
        
        return db.createDocument({
          tripId: input.tripId,
          name: fileName,
          category: input.category,
          fileUrl: url,
          fileKey: fileKey,
          mimeType: mimeType,
          tags: input.tags,
          notes: input.notes,
          hotelId: input.hotelId,
        });
      }),
    
    convertToPdf: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input }) => {
        // Get document from database
        const doc = await db.getDocument(input.documentId);
        if (!doc) throw new Error('Document not found');
        
        // Check if already PDF
        if (doc.mimeType === 'application/pdf' || doc.name.toLowerCase().endsWith('.pdf')) {
          return { url: doc.fileUrl, alreadyPdf: true };
        }
        
        // Check if it's a .docx file
        const isDocx = doc.mimeType?.includes('wordprocessingml') || 
                       doc.mimeType?.includes('msword') || 
                       doc.name.toLowerCase().endsWith('.docx') ||
                       doc.name.toLowerCase().endsWith('.doc');
        
        if (!isDocx) {
          throw new Error('Only .docx files can be converted to PDF');
        }
        
        // Download the .docx file from S3
        const response = await fetch(doc.fileUrl);
        if (!response.ok) throw new Error('Failed to download document');
        const buffer = Buffer.from(await response.arrayBuffer());
        
        // Convert to PDF
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docx-convert-'));
        const inputPath = path.join(tmpDir, doc.name);
        const outputName = doc.name.replace(/\.(docx?|DOCX?)$/, '.pdf');
        const outputPath = path.join(tmpDir, outputName);
        
        try {
          // Write docx to temp file
          await fs.writeFile(inputPath, buffer);
          
          // Convert using LibreOffice
          await execAsync(
            `libreoffice --headless --convert-to pdf --outdir "${tmpDir}" "${inputPath}"`
          );
          
          // Read converted PDF
          const pdfBuffer = Buffer.from(await fs.readFile(outputPath));
          
          // Upload PDF to S3 (replace old file)
          const newFileKey = doc.fileKey.replace(/\.(docx?|DOCX?)$/, '.pdf');
          const { url: pdfUrl } = await storagePut(newFileKey, pdfBuffer, 'application/pdf');
          
          // Update database record
          await db.updateDocument(input.documentId, {
            name: outputName,
            fileUrl: pdfUrl,
            fileKey: newFileKey,
            mimeType: 'application/pdf',
          });
          
          return { url: pdfUrl, converted: true };
        } finally {
          // Cleanup temp files
          await fs.rm(tmpDir, { recursive: true, force: true });
        }
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

  // ============ TRAVELERS ============
  travelers: router({    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ input }) => db.getTripTravelers(input.tripId)),
    
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        name: z.string().min(1),
        identifier: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(({ input }) => db.createTraveler(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        identifier: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateTraveler(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteTraveler(input.id)),
  }),

  // ============ CHECKLIST ============
  checklist: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ input }) => db.getTripChecklist(input.tripId)),
    
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        title: z.string().min(1),
        category: z.enum(["documents", "bookings", "packing", "health", "finance", "other"]),
        dueDate: z.number().optional(),
        notes: z.string().optional(),
        owner: z.string().optional(),
      }))
      .mutation(({ input }) => db.createChecklistItem(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        category: z.enum(["documents", "bookings", "packing", "health", "finance", "other"]).optional(),
        completed: z.boolean().optional(),
        dueDate: z.number().optional(),
        notes: z.string().optional(),
        owner: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateChecklistItem(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteChecklistItem(input.id)),
  }),

  // ============ BUDGET ============
  budget: router({
    get: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(({ input }) => db.getTripBudget(input.tripId)),
  }),

  // ============ ROUTES ============
  routes: router({
    // Generate route/location data from route name
    generateRouteFromName: protectedProcedure
      .input(z.object({ routeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const route = await db.getRouteById(input.routeId);
        if (!route) throw new Error('Route not found');
        
        const trip = await db.getTripById(route.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        // Extract location/route info from name
        let locationName = route.name;
        
        // Remove "Day X:" prefix if exists
        locationName = locationName.replace(/^Day \d+:\s*/i, '');
        
        // Remove "Route X:" prefix if exists
        locationName = locationName.replace(/^Route \d+:\s*/i, '');
        
        const { makeRequest } = await import('./_core/map');
        
        // Check if this is a route (contains arrow) or a single location
        if (locationName.includes('→') || locationName.includes('->')) {
          // This is a ROUTE between two cities
          const parts = locationName.split(/→|->/).map(p => p.trim());
          if (parts.length !== 2) {
            throw new Error('Route format should be: "City → City"');
          }
          
          const [origin, destination] = parts;
          
          // Call Google Maps Directions API
          const directionsResult = await makeRequest<any>(
            '/maps/api/directions/json',
            {
              origin: `${origin}, Slovakia`,
              destination: `${destination}, Slovakia`,
              mode: 'driving',
            }
          );
          
          if (directionsResult.status !== 'OK' || !directionsResult.routes?.[0]) {
            throw new Error(`Failed to get directions: ${directionsResult.status}`);
          }
          
          const routeData = directionsResult.routes[0];
          const leg = routeData.legs[0];
          
          // Create mapData object for ROUTE
          const mapData = {
            type: 'route',
            origin: {
              name: origin,
              address: leg.start_address,
              location: leg.start_location,
            },
            destination: {
              name: destination,
              address: leg.end_address,
              location: leg.end_location,
            },
            distance: leg.distance,
            duration: leg.duration,
            polyline: routeData.overview_polyline.points,
          };
          
          // Update route with mapData
          await db.updateRoute(input.routeId, {
            mapData: JSON.stringify(mapData),
            distanceKm: (leg.distance.value / 1000).toFixed(1),
            estimatedDuration: Math.round(leg.duration.value / 60), // minutes
          });
          
          return { success: true, mapData };
        } else {
          // This is a SINGLE LOCATION (activity, attraction, etc.)
          const geocodingResult = await makeRequest<any>(
            '/maps/api/geocode/json',
            {
              address: `${locationName}, Slovakia`,
            }
          );
          
          if (geocodingResult.status !== 'OK' || !geocodingResult.results?.[0]) {
            throw new Error(`Failed to find location: ${geocodingResult.status}`);
          }
          
          const location = geocodingResult.results[0];
          
          // Create mapData object for LOCATION
          const mapData = {
            type: 'location',
            location: {
              name: locationName,
              address: location.formatted_address,
              coordinates: location.geometry.location,
              placeId: location.place_id,
            },
          };
          
          // Update route with mapData
          await db.updateRoute(input.routeId, {
            mapData: JSON.stringify(mapData),
          });
          
          return { success: true, mapData };
        }
      }),
    
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        return db.getTripRoutes(input.tripId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        name: z.string().min(1),
        nameHe: z.string().optional(),
        description: z.string().optional(),
        descriptionHe: z.string().optional(),
        date: z.number(),
        time: z.string().optional(),
        distanceKm: z.number().optional(),
        estimatedDuration: z.number().optional(),
        roadType: z.string().optional(),
        mapData: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        const { distanceKm, ...data } = input;
        return db.createRoute({
          ...data,
          distanceKm: distanceKm !== undefined ? distanceKm.toString() : undefined,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        nameHe: z.string().optional(),
        description: z.string().optional(),
        descriptionHe: z.string().optional(),
        date: z.number().optional(),
        time: z.string().optional(),
        distanceKm: z.number().optional(),
        estimatedDuration: z.number().optional(),
        roadType: z.string().optional(),
        mapData: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const route = await db.getRouteById(input.id);
        if (!route) throw new Error('Route not found');
        const trip = await db.getTripById(route.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        const { id, distanceKm, ...data } = input;
        return db.updateRoute(id, {
          ...data,
          distanceKm: distanceKm !== undefined ? distanceKm.toString() : undefined,
        });
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const route = await db.getRouteById(input.id);
        if (!route) throw new Error('Route not found');
        const trip = await db.getTripById(route.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        return db.deleteRoute(input.id);
      }),
  }),

  // ============ ROUTE POINTS OF INTEREST ============
  routePOI: router({
    list: protectedProcedure
      .input(z.object({ routeId: z.number() }))
      .query(async ({ ctx, input }) => {
        const route = await db.getRouteById(input.routeId);
        if (!route) throw new Error('Route not found');
        const trip = await db.getTripById(route.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        return db.getRoutePOIs(input.routeId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        routeId: z.number(),
        name: z.string().min(1),
        nameHe: z.string().optional(),
        type: z.enum(['attraction', 'restaurant', 'gas_station', 'other']),
        latitude: z.number(),
        longitude: z.number(),
        address: z.string().optional(),
        placeId: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const route = await db.getRouteById(input.routeId);
        if (!route) throw new Error('Route not found');
        const trip = await db.getTripById(route.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        const { latitude, longitude, ...data } = input;
        return db.createRoutePOI({
          ...data,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        nameHe: z.string().optional(),
        type: z.enum(['attraction', 'restaurant', 'gas_station', 'other']).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        address: z.string().optional(),
        placeId: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const poi = await db.getRoutePOIById(input.id);
        if (!poi) throw new Error('POI not found');
        const route = await db.getRouteById(poi.routeId);
        if (!route) throw new Error('Route not found');
        const trip = await db.getTripById(route.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        const { id, latitude, longitude, ...data } = input;
        return db.updateRoutePOI(id, {
          ...data,
          latitude: latitude !== undefined ? latitude.toString() : undefined,
          longitude: longitude !== undefined ? longitude.toString() : undefined,
        });
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const poi = await db.getRoutePOIById(input.id);
        if (!poi) throw new Error('POI not found');
        const route = await db.getRouteById(poi.routeId);
        if (!route) throw new Error('Route not found');
        const trip = await db.getTripById(route.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        return db.deleteRoutePOI(input.id);
      }),
  }),

  // ============ COLLABORATORS ============
  collaborators: router({
    // Search users by name
    searchUsers: protectedProcedure
      .input(z.object({ searchTerm: z.string().min(1) }))
      .query(async ({ input }) => {
        const users = await db.searchUsersByName(input.searchTerm);
        // Return only id and name for privacy
        return users.map(u => ({ id: u.id, name: u.name }));
      }),
    
    // List all collaborators for a trip
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Check if user is owner or collaborator
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        return db.getTripCollaborators(input.tripId);
      }),
    
    // Get my permission for a trip
    getMyPermission: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) return null;
        // If user is owner, they have full edit rights
        if (trip.userId === ctx.user.id) {
          return { permission: 'can_edit' as const, isOwner: true };
        }
        // Check if user is a collaborator
        const collab = await db.getUserCollaboratorPermission(input.tripId, ctx.user.id);
        return collab ? { permission: collab.permission, isOwner: false } : null;
      }),
    
    // Invite a user to collaborate (by user ID)
    invite: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        userId: z.number(),
        permission: z.enum(['view_only', 'can_edit']),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if current user is the trip owner
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip || trip.userId !== ctx.user.id) {
          throw new Error('Only trip owner can invite collaborators');
        }
        // Check if user is already a collaborator
        const existing = await db.getUserCollaboratorPermission(input.tripId, input.userId);
        if (existing) {
          throw new Error('User is already a collaborator');
        }
        return db.addTripCollaborator({
          tripId: input.tripId,
          userId: input.userId,
          permission: input.permission,
          invitedBy: ctx.user.id,
        });
      }),
    
    // Update collaborator permission
    updatePermission: protectedProcedure
      .input(z.object({
        id: z.number(),
        permission: z.enum(['view_only', 'can_edit']),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get the collaborator record
        const collab = await db.getCollaboratorById(input.id);
        if (!collab) throw new Error('Collaborator not found');
        // Check if current user is the trip owner
        const trip = await db.getTripById(collab.tripId, ctx.user.id);
        if (!trip || trip.userId !== ctx.user.id) {
          throw new Error('Only trip owner can update permissions');
        }
        return db.updateCollaboratorPermission(input.id, input.permission);
      }),
    
    // Remove a collaborator
    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Get the collaborator record
        const collab = await db.getCollaboratorById(input.id);
        if (!collab) throw new Error('Collaborator not found');
        // Check if current user is the trip owner
        const trip = await db.getTripById(collab.tripId, ctx.user.id);
        if (!trip || trip.userId !== ctx.user.id) {
          throw new Error('Only trip owner can remove collaborators');
        }
        return db.removeCollaborator(input.id);
      }),
    
    // Get activity log for a trip
    getActivityLog: protectedProcedure
      .input(z.object({ 
        tripId: z.number(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Check if user is owner or collaborator
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        return db.getActivityLog(input.tripId, input.limit);
      }),
    
    // Join trip via invite link
    joinViaInvite: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripByShareToken(input.token);
        if (!trip) throw new Error('Invalid invite link');
        
        // Check if user is already owner
        if (trip.userId === ctx.user.id) {
          return { tripId: trip.id, alreadyMember: true };
        }
        
        // Check if user is already a collaborator
        const existing = await db.getUserCollaboratorPermission(trip.id, ctx.user.id);
        if (existing) {
          return { tripId: trip.id, alreadyMember: true };
        }
        
        // Add user as collaborator with can_edit permission
        await db.addTripCollaborator({
          tripId: trip.id,
          userId: ctx.user.id,
          permission: 'can_edit',
          invitedBy: trip.userId, // Trip owner invited them
        });
        
        return { tripId: trip.id, alreadyMember: false };
      }),
  }),

  // ============ PAYMENTS ============
  payments: router({
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        activityType: z.enum(["hotel", "transportation", "car_rental", "restaurant", "tourist_site", "other"]),
        activityId: z.number(),
        amount: z.number(),
        currency: z.string(),
        paymentDate: z.number(),
        paymentMethod: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        return db.createPayment({
          ...input,
          amount: input.amount.toString(),
        });
      }),
    
    getActivityPayments: protectedProcedure
      .input(z.object({
        activityType: z.string(),
        activityId: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getActivityPayments(input.activityType, input.activityId);
      }),
    
    getTripPayments: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        return db.getTripPayments(input.tripId);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        amount: z.number().optional(),
        currency: z.string().optional(),
        paymentDate: z.number().optional(),
        paymentMethod: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, amount, ...rest } = input;
        const data = {
          ...rest,
          ...(amount !== undefined && { amount: amount.toString() }),
        };
        return db.updatePayment(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deletePayment(input.id);
      }),
  }),

  // ============ MUST VISIT POIs ============
  mustVisitPOIs: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        return db.getTripMustVisitPOIs(input.tripId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        tripId: z.number(),
        name: z.string().min(1),
        address: z.string().optional(),
        category: z.string().min(1),
        categoryIcon: z.string().optional(),
        categoryColor: z.string().optional(),
        rating: z.number().optional(),
        latitude: z.number(),
        longitude: z.number(),
        placeId: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        return db.createMustVisitPOI({
          ...input,
          userId: ctx.user.id,
          rating: input.rating?.toString(),
          latitude: input.latitude.toString(),
          longitude: input.longitude.toString(),
        });
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteMustVisitPOI(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ STORAGE ============
  storage: router({
    uploadImage: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // Base64 data URL
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Extract base64 data from data URL
        const base64Data = input.fileData.split(',')[1] || input.fileData;
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique file name
        const extension = input.contentType.split('/')[1] || 'jpg';
        const fileName = `${nanoid()}.${extension}`;
        const fileKey = `images/${fileName}`;
        
        // Upload to S3
        const result = await storagePut(fileKey, buffer, input.contentType);
        
        return { url: result.url, key: result.key };
      }),
  }),
});

export type AppRouter = typeof appRouter;
