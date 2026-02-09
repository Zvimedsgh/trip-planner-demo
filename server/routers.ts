import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  // ============ AUTH ============
  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      return ctx.user ?? null;
    }),

    logout: protectedProcedure.mutation(async ({ ctx }) => {
      ctx.clearSession();
      return { success: true };
    }),
  }),

  // ============ TRIPS ============
  trips: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTripsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getTripById(input.id, ctx.user.id);
      }),

    getByShareToken: publicProcedure
      .input(z.object({ shareToken: z.string() }))
      .query(async ({ input }) => {
        return db.getTripByShareToken(input.shareToken);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          destination: z.string(),
          startDate: z.number(),
          endDate: z.number(),
          description: z.string().optional(),
          coverImage: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createTrip({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          destination: z.string().optional(),
          startDate: z.number().optional(),
          endDate: z.number().optional(),
          description: z.string().optional(),
          coverImage: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.id, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        const { id, ...updates } = input;
        return db.updateTrip(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.id, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.deleteTrip(input.id);
      }),

    generateShareToken: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.id, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.generateShareToken(input.id);
      }),

    revokeShareToken: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.id, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.revokeShareToken(input.id);
      }),
  }),

  // ============ TOURIST SITES ============
  touristSites: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.getTouristSitesByTripId(input.tripId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          name: z.string(),
          address: z.string().optional(),
          description: z.string().optional(),
          openingHours: z.string().optional(),
          plannedVisitDate: z.number().optional(),
          plannedVisitTime: z.string().optional(),
          website: z.string().optional(),
          notes: z.string().optional(),
          coverImage: z.string().optional(),
          linkedDocumentId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.createTouristSite(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          address: z.string().optional(),
          description: z.string().optional(),
          openingHours: z.string().optional(),
          plannedVisitDate: z.number().optional(),
          plannedVisitTime: z.string().optional(),
          website: z.string().optional(),
          notes: z.string().optional(),
          coverImage: z.string().optional(),
          linkedDocumentId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const site = await db.getTouristSiteById(input.id);
        if (!site) throw new Error('Tourist site not found');
        
        const trip = await db.getTripById(site.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        const { id, ...updates } = input;
        return db.updateTouristSite(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const site = await db.getTouristSiteById(input.id);
        if (!site) throw new Error('Tourist site not found');
        
        const trip = await db.getTripById(site.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        return db.deleteTouristSite(input.id);
      }),
  }),

  // ============ HOTELS ============
  hotels: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.getHotelsByTripId(input.tripId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          name: z.string(),
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
          coverImage: z.string().optional(),
          parkingImage: z.string().optional(),
          gallery: z.string().optional(),
          notes: z.string().optional(),
          linkedDocumentId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.createHotel(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
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
          coverImage: z.string().optional(),
          parkingImage: z.string().optional(),
          gallery: z.string().optional(),
          notes: z.string().optional(),
          linkedDocumentId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const hotel = await db.getHotelById(input.id);
        if (!hotel) throw new Error('Hotel not found');
        
        const trip = await db.getTripById(hotel.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        const { id, ...updates } = input;
        return db.updateHotel(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const hotel = await db.getHotelById(input.id);
        if (!hotel) throw new Error('Hotel not found');
        
        const trip = await db.getTripById(hotel.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        return db.deleteHotel(input.id);
      }),
  }),

  // ============ TRANSPORTATION ============
  transportation: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.getTransportationByTripId(input.tripId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          type: z.enum(["flight", "train", "bus", "car_rental", "other"]),
          provider: z.string().optional(),
          confirmationNumber: z.string().optional(),
          departureLocation: z.string(),
          arrivalLocation: z.string(),
          departureTime: z.number(),
          arrivalTime: z.number(),
          price: z.string().optional(),
          currency: z.string().optional(),
          seatNumber: z.string().optional(),
          notes: z.string().optional(),
          linkedDocumentId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.createTransportation(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          type: z.enum(["flight", "train", "bus", "car_rental", "other"]).optional(),
          provider: z.string().optional(),
          confirmationNumber: z.string().optional(),
          departureLocation: z.string().optional(),
          arrivalLocation: z.string().optional(),
          departureTime: z.number().optional(),
          arrivalTime: z.number().optional(),
          price: z.string().optional(),
          currency: z.string().optional(),
          seatNumber: z.string().optional(),
          notes: z.string().optional(),
          linkedDocumentId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const transport = await db.getTransportationById(input.id);
        if (!transport) throw new Error('Transportation not found');
        
        const trip = await db.getTripById(transport.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        const { id, ...updates } = input;
        return db.updateTransportation(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const transport = await db.getTransportationById(input.id);
        if (!transport) throw new Error('Transportation not found');
        
        const trip = await db.getTripById(transport.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        return db.deleteTransportation(input.id);
      }),
  }),

  // ============ DOCUMENTS ============
  documents: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.getDocumentsByTripId(input.tripId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          name: z.string(),
          category: z.enum(["passport", "visa", "insurance", "ticket", "hotel", "other"]),
          fileUrl: z.string(),
          fileKey: z.string(),
          mimeType: z.string(),
          tags: z.string().optional(),
          notes: z.string().optional(),
          coverImage: z.string().optional(),
          hotelId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.createDocument(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          category: z.enum(["passport", "visa", "insurance", "ticket", "hotel", "other"]).optional(),
          tags: z.string().optional(),
          notes: z.string().optional(),
          coverImage: z.string().optional(),
          hotelId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const doc = await db.getDocumentById(input.id);
        if (!doc) throw new Error('Document not found');
        
        const trip = await db.getTripById(doc.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        const { id, ...updates } = input;
        return db.updateDocument(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const doc = await db.getDocumentById(input.id);
        if (!doc) throw new Error('Document not found');
        
        const trip = await db.getTripById(doc.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        return db.deleteDocument(input.id);
      }),
  }),

  // ============ PAYMENTS ============
  payments: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.getPaymentsByTripId(input.tripId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          category: z.enum(["hotel", "flight", "activity", "food", "transport", "other"]),
          description: z.string(),
          amount: z.string(),
          currency: z.string(),
          paymentDate: z.number(),
          paymentMethod: z.enum(["cash", "credit_card", "debit_card", "bank_transfer", "other"]).optional(),
          status: z.enum(["paid", "pending", "refunded"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.createPayment(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          category: z.enum(["hotel", "flight", "activity", "food", "transport", "other"]).optional(),
          description: z.string().optional(),
          amount: z.string().optional(),
          currency: z.string().optional(),
          paymentDate: z.number().optional(),
          paymentMethod: z.enum(["cash", "credit_card", "debit_card", "bank_transfer", "other"]).optional(),
          status: z.enum(["paid", "pending", "refunded"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const payment = await db.getPaymentById(input.id);
        if (!payment) throw new Error('Payment not found');
        
        const trip = await db.getTripById(payment.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        const { id, ...updates } = input;
        return db.updatePayment(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const payment = await db.getPaymentById(input.id);
        if (!payment) throw new Error('Payment not found');
        
        const trip = await db.getTripById(payment.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        return db.deletePayment(input.id);
      }),
  }),

  // ============ TRIP TRAVELERS ============
  tripTravelers: router({
    list: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.getTripTravelersByTripId(input.tripId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          name: z.string(),
          email: z.string().optional(),
          phone: z.string().optional(),
          passportNumber: z.string().optional(),
          passportExpiry: z.number().optional(),
          dateOfBirth: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.createTripTraveler(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          passportNumber: z.string().optional(),
          passportExpiry: z.number().optional(),
          dateOfBirth: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const traveler = await db.getTripTravelerById(input.id);
        if (!traveler) throw new Error('Traveler not found');
        
        const trip = await db.getTripById(traveler.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        const { id, ...updates } = input;
        return db.updateTripTraveler(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const traveler = await db.getTripTravelerById(input.id);
        if (!traveler) throw new Error('Traveler not found');
        
        const trip = await db.getTripById(traveler.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        return db.deleteTripTraveler(input.id);
      }),
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
        
        return db.getRoutesByTripId(input.tripId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          name: z.string(),
          nameHe: z.string().optional(),
          description: z.string().optional(),
          descriptionHe: z.string().optional(),
          date: z.number(),
          time: z.string().optional(),
          distanceKm: z.string().optional(),
          estimatedDuration: z.number().optional(),
          roadType: z.string().optional(),
          mapData: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const trip = await db.getTripById(input.tripId, ctx.user.id);
        if (!trip) throw new Error('Trip not found or access denied');
        
        return db.createRoute(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          nameHe: z.string().optional(),
          description: z.string().optional(),
          descriptionHe: z.string().optional(),
          date: z.number().optional(),
          time: z.string().optional(),
          distanceKm: z.string().optional(),
          estimatedDuration: z.number().optional(),
          roadType: z.string().optional(),
          mapData: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const route = await db.getRouteById(input.id);
        if (!route) throw new Error('Route not found');
        
        const trip = await db.getTripById(route.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        const { id, ...updates } = input;
        return db.updateRoute(id, updates);
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

  // ============ ROUTE POIS ============
  routePOIs: router({
    list: protectedProcedure
      .input(z.object({ routeId: z.number() }))
      .query(async ({ ctx, input }) => {
        const route = await db.getRouteById(input.routeId);
        if (!route) throw new Error('Route not found');
        
        const trip = await db.getTripById(route.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        return db.getRoutePOIsByRouteId(input.routeId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          routeId: z.number(),
          name: z.string(),
          nameHe: z.string().optional(),
          type: z.enum(["attraction", "restaurant", "gas_station", "other"]),
          latitude: z.string(),
          longitude: z.string(),
          description: z.string().optional(),
          descriptionHe: z.string().optional(),
          website: z.string().optional(),
          phone: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const route = await db.getRouteById(input.routeId);
        if (!route) throw new Error('Route not found');
        
        const trip = await db.getTripById(route.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        return db.createRoutePOI(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          nameHe: z.string().optional(),
          type: z.enum(["attraction", "restaurant", "gas_station", "other"]).optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          description: z.string().optional(),
          descriptionHe: z.string().optional(),
          website: z.string().optional(),
          phone: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const poi = await db.getRoutePOIById(input.id);
        if (!poi) throw new Error('POI not found');
        
        const route = await db.getRouteById(poi.routeId);
        if (!route) throw new Error('Route not found');
        
        const trip = await db.getTripById(route.tripId, ctx.user.id);
        if (!trip) throw new Error('Access denied');
        
        const { id, ...updates } = input;
        return db.updateRoutePOI(id, updates);
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

  // ============ SYSTEM ============
  system: router({
    notifyOwner: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { notifyOwner } = await import('./_core/notification');
        return notifyOwner(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
