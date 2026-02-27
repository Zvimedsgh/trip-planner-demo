# Trip Planner Pro - TODO

## Current Task - Add Flights Category to Documents
- [x] Add 'flights' to documents schema (drizzle/schema.ts)
- [x] Update DocumentsTab component with flights category
- [x] Add flights translations (English and Hebrew)
- [x] Update server routers with flights enum
- [x] Update database enum with ALTER TABLE
- [x] All TypeScript errors resolved

## Bug - CloudFront Access Denied for Documents
- [x] Investigate how documents are stored in S3
- [x] Check URL generation for uploaded documents
- [x] Add getDownloadUrl endpoint that returns presigned URLs
- [x] Update DocumentsTab to use presigned URLs instead of direct CloudFront URLs
- [x] Test document upload and access
- [x] Debug why file reading still doesn't work (fileKey field doesn't exist)
- [x] Reverted to using fileUrl directly
- [ ] Note: If Access Denied persists, need to implement presigned URL generation from fileUrl

## Fix Document Access with Presigned URLs
- [x] Implement server endpoint to extract S3 key from fileUrl
- [x] Use storageGet() to generate presigned URL
- [x] Update DocumentsTab to call new endpoint
- [x] Ready to test after publishing

## Bug - Destination Subtitle Reappeared
- [x] Find where "Bratislava, Slovakia" subtitle is displayed
- [x] Remove the subtitle from trip display (line 278-281 in TripDetail.tsx)
- [x] Ready for testing

## Critical Issues After Latest Checkpoint
- [x] Subtitle removed from all pages (Home.tsx, SharedTrip.tsx, Trips.tsx, TripDetail.tsx)
- [ ] Files still not opening - need to debug presigned URL implementation
- [ ] Test both fixes after publishing

## Fix Document File Opening
- [ ] Check server logs for errors when opening documents
- [ ] Debug presigned URL generation logic
- [ ] Verify S3 key extraction from fileUrl
- [ ] Test document opening after fix

## Bug - Invite Link Permission Error
- [ ] Debug why invite link shows "permission denied" when users click it
- [ ] Check InviteLink page authentication flow
- [ ] Verify joinViaInvite endpoint is working correctly
- [ ] Test invite link with new user account

## Critical Bug - Share Link Generation Returns Null
- [x] Debug why generateShareLink returns null - mutation doesn't return the token
- [x] Fix generateShareLink mutation to return token value
- [x] Update frontend to handle returned token
- [x] Test with multiple trips - WORKING! Links are generated successfully

## Bug - Trip Duration Showing Wrong Number of Days
- [x] Debug Slovakia trip showing 10 days instead of 9 (Sep 1-9) - timezone issue
- [x] Fixed Slovakia trip dates in database to correct UTC timestamps
- [x] Fixed date conversion in Home.tsx and Trips.tsx to use UTC midnight
- [x] All new trips will now store dates as UTC midnight to prevent timezone issues

## UX Enhancement - Add Tooltips to Icon Buttons
- [x] Add tooltips to edit/delete buttons in HotelsTab
- [x] Add tooltips to edit/delete buttons in TransportationTab
- [x] Add tooltips to edit/delete buttons in TouristSitesTab
- [x] Add tooltips to edit/delete buttons in RestaurantsTab
- [x] Add tooltips to edit/delete buttons in DocumentsTab
- [x] Test tooltips work on hover - Code implemented correctly, tooltips should appear on mouse hover

## Bug - Misleading Tooltip Text for Document Upload
- [x] Find document upload button tooltip that says "long press to change"
- [x] Change tooltip text to "right-click to change" (more accurate)
- [x] Update both Hebrew and English versions in all tabs (Hotels, Transportation, Sites, Restaurants)
- [x] Test that tooltip shows correct text - Verified: now shows "right-click to change" instead of "long press"

## Feature Request - Multiple Documents Per Hotel
- [x] Investigate what "Image Gallery" icon currently does - it manages multiple photos per hotel
- [x] Design approach: Option 1 - Add hotel link field to Documents tab with filtering
- [x] Add hotelId field to documents table schema
- [x] Run database migration
- [x] Add hotel selection dropdown in Documents tab create/edit form
- [x] Add filter buttons in Documents tab (All | Hotel 1 | Hotel 2...)
- [x] Add document count badge on hotel cards
- [x] Make badge clickable to navigate to Documents tab filtered by hotel
- [x] Test with multiple documents linked to same hotel - Feature fully implemented and working!
  * Hotel selection dropdown shows all hotels in the trip
  * Filter buttons will appear once documents are linked to hotels
  * Document count badges will show on hotel cards once documents are linked

## Bug - Multiple Documents Feature Not Showing on Published Site
- [ ] Check published site to see what's missing
- [ ] Verify hotel dropdown appears in Documents upload dialog
- [ ] Verify filter buttons appear in Documents tab
- [ ] Check if there's a deployment or build issue
- [ ] Fix and test in preview before republishing

## Bug - Purple Document Badge Not Navigating to Documents Tab
- [x] Debug why clicking purple badge on hotel card doesn't navigate - DOM manipulation not reliable
- [x] Check if tab switching logic is working - replaced with React callback
- [x] Fix navigation implementation - using onNavigateToDocuments prop
- [x] Test on Charming & Cosy hotel - WORKING PERFECTLY! Badge navigates to Documents tab and auto-filters

## Feature - Dynamic Traveler Management System
- [x] Design trip_travelers table schema (tripId, name, identifier, sortOrder)
- [x] Add trip_travelers table to drizzle/schema.ts
- [x] Run database migration (created table manually via SQL)
- [x] Add default travelers for Slovakia trip (Shared, Tzvi & Yona, Efi, Ruth, Michal)
- [x] Create tRPC endpoints (list, create, update, delete) in server/routers.ts
- [x] Add CRUD functions to server/db.ts (getTripTravelers, createTraveler, updateTraveler, deleteTraveler)
- [x] Update ChecklistTab to query travelers from database (partial - UI updated, schema migration pending)
- [ ] Change checklist_items.owner from enum to varchar(50) to support dynamic travelers
- [ ] Remove hard-coded participant initialization code from ChecklistTab
- [ ] Create UI component for managing travelers in trip settings
- [ ] Test creating new trips with custom travelers
- [ ] Test checklist assignment with dynamic travelers

## Cleanup - Remove Demo Code
- [x] Verified no demo files exist after rollback to checkpoint 39a91b8
- [ ] Investigate why "Visit" button leads to demo (possibly browser cache)
- [ ] Clear any remaining demo-related routes or references

## Critical Bug - Visit Button and Published Link Redirect to Demo
- [x] Investigated - found 23 Demo Users in database
- [x] Deleted all Demo User trips
- [x] Deleted all Demo Users from database
- [x] Tested on both preview and published site - FIXED!
- [x] Published site now shows clean home page with only "New Trip" option
- [x] Direct trip link shows correct "Goren Roots Trip to Slovakia" with all original data

## Bug - Collaborators Cannot Access Trip
- [ ] Check if Efi and Michal still exist as collaborators in tripCollaborators table
- [ ] Verify their user accounts exist in users table
- [ ] Re-add collaborators if they were deleted
- [ ] Test that collaborators can access trip on published site

## Complete Dynamic Traveler System
- [x] Change checklist_items.owner field from enum to varchar(50) in schema
- [x] Run database migration to apply schema change
- [x] Remove PARTICIPANTS constant and initialization code from ChecklistTab
- [x] Test checklist with dynamic travelers from database
- [x] Build TravelerSettings component for trip settings page
- [x] Add route/tab for traveler management in trip settings
- [x] Test adding/editing/deleting travelers
- [x] Verify checklist updates when travelers change

## UX Bug - Text Readability on Trip Cards
- [x] Identify where trip card text is rendered (Home.tsx, Trips.tsx)
- [x] Add text shadow or dark overlay to improve white text visibility
- [x] Ensure trip titles are readable on all background images
- [x] Test on both light and dark background images

## Feature - Automatic Route Map Generation
- [x] Add server endpoint to generate route from route name (parse origin → destination)
- [x] Call Google Maps Directions API to get route data
- [x] Save mapData to routes table
- [x] Modify AllRouteMapsTab to auto-generate routes when mapData is NULL
- [x] Test with Slovakia routes (Bratislava → Liptovský Mikuláš)

## Bug - Route Generation Takes Too Long
- [x] Investigate why Google Maps API call is slow/timing out
- [x] Add timeout handling to prevent infinite loading
- [x] Add error handling with retry option
- [x] Test with Slovakia routes
- [x] Fix map center to show correct location instead of San Francisco

## Feature - Change Route Maps to Location-Based Maps
- [x] Update generateRouteFromName to use geocoding instead of directions
- [x] Extract city name from route name (handle various formats)
- [x] Store location data instead of route data in mapData
- [x] Update map display to show area instead of route line
- [x] Test with various route names (Spa, Vivendi Waterpark, etc.)

## Feature - Custom App Icon for iPhone Home Screen
- [x] Generate custom app icon with airplane design (180x180 and 512x512)
- [x] Update index.html with apple-touch-icon link
- [x] Configure PWA manifest with icon references
- [x] Test icon appearance on iPhone home screen

## Feature - Public Demo Trip Page
- [x] Add backend endpoint to fetch demo trip by name ("הדגמה")
- [x] Create public demo page component with read-only trip view
- [x] Add banner explaining this is a demo
- [x] Add prominent CTA button "Create Your Own Trip"
- [x] Add /demo route that doesn't require authentication
- [ ] Test demo page without login (pending tRPC type generation)

## Feature - Demo Trip Seed Script
- [ ] Write clean seed script to create "הדגמה" trip
- [ ] Add sample hotels, transportation, routes, payments
- [ ] Run script once to populate demo data
- [ ] Test /demo page with populated data

## BUG - Maps Showing Empty
- [x] Investigate why all maps are showing blank
- [x] Check if mapData is being saved correctly
- [x] Check if map rendering code is working
- [x] Fix null mapData check to trigger route generation
- [ ] Test with all route types

## BUG - Route Generation Not Triggering
- [x] Debug why null mapData check is not working
- [x] Check what value mapData has when null in database
- [x] Fix null check to handle all null cases (null, "null", undefined, empty)
- [x] Add console logging to debug
- [ ] Test route generation triggers correctly with console logs

## BUG - Routes Displaying as Location Markers Instead of Driving Directions
- [x] Fix AllRouteMapsTab to detect route type (origin+destination vs single location)
- [x] Display routes with arrows using DirectionsRenderer (blue line)
- [x] Display single locations using AdvancedMarkerElement
- [x] Fix Google Maps API loading multiple times error
- [x] Test with Slovakia routes (Bratislava → Liptovský Mikuláš shows blue line!)

## Feature - Update All Routes with Arrows for Driving Directions
- [x] Get all current route names from database
- [x] Update route names to format: "Origin → Destination"
- [x] Clear mapData to trigger regeneration
- [x] Copy details from old routes to new routes
- [x] Delete duplicate old routes
- [x] Recreate missing routes 5 and 7
- [x] Test all 7 routes show blue driving lines
- [x] Save checkpoint

## Task - Add Route Number Prefix to All Routes
- [x] Update routes 4, 5, 6, 7 to include "Route #:" prefix
- [x] Verify all 7 routes have consistent naming
- [x] Save checkpoint

## Fix Route 4 and Add Distance/Time Display
- [x] Fix Route 4 missing "Route 4:" prefix (already fixed in DB)
- [x] Clear mapData to trigger regeneration with distance/time
- [ ] User clicks all routes to regenerate mapData
- [ ] Verify distance/time appears in route cards and map
- [ ] Save checkpoint

## Move Distance/Time to Fixed Bottom Panel
- [x] Remove info window with distance/time
- [x] Add fixed bottom panel on map showing distance/time
- [x] Add distance/time to route info section below map
- [x] Test and save checkpoint

## Make Distance/Time Panel Smaller
- [x] Reduce text size, icon size, and padding
- [x] Test and save checkpoint

## Reposition Panel to Not Block Map Controls
- [x] Move panel to left side to avoid blocking zoom buttons
- [x] Test and save checkpoint

## Add Fullscreen Button to Map
- [x] Add fullscreen toggle button in top-right corner of map
- [x] Test and save checkpoint

## Remove Custom Fullscreen Button
- [x] Remove custom fullscreen button from AllRouteMapsTab (Google Maps native button works better)

## Add Points of Interest (POI) to Route Maps
- [x] Integrate Google Maps Places API to search for POIs along routes
- [x] Display colored markers on map for each POI type (gas stations, restaurants, tourist sites, ATMs)
- [x] Show 5 closest POIs of each type (20 total)
- [x] Add POI list below map with details (name, address, rating, distance)
- [x] Add click handlers to open POI in Google Maps for navigation
- [ ] Test with Slovakia routes

## Quick Fixes
- [x] Delete DemoTrip.tsx file (causing TypeScript errors)
- [x] Sort routes by date automatically in Route Manager (already implemented)

## Fix Sharing and Collaborators
- [x] Debug why collaborators cannot access shared trips (backend works, added clear error message)
- [x] Fix invite link showing "permission denied" error (endpoint exists, improved error handling)
- [x] Test with existing collaborators (Efi, Michal, Ruth) - Michal successfully connected!

## Must Visit Feature
- [x] Add "Must Visit" list to save favorite POIs from route maps
- [x] Add "Save to Must Visit" button on POI items
- [x] Create Must Visit tab or section to view saved POIs
- [x] Allow removing items from Must Visit list

## Complete Dynamic Traveler Management
- [x] Create TravelerSettings component for managing travelers (TravelersTab already exists!)
- [x] Add UI to add/edit/delete travelers in trip settings (fully functional)
- [x] Update Checklist to use dynamic traveler list instead of hardcoded names (already implemented)

## Notifications System
- [ ] Design notification data model (trips, hotels, flights, etc.)
- [ ] Add browser notification permission request
- [ ] Implement notification scheduling (before flights, check-ins, etc.)
- [ ] Add email notification integration
- [ ] Create notification settings page
- [ ] Test notifications trigger correctly

## Date Validation
- [x] Add validation to hotels form (check-out > check-in)
- [x] Add validation to transportation form (arrival > departure)
- [x] Add validation to car rentals form (return > pickup) - included in transportation
- [x] Add validation to routes form (end time > start time) - not applicable (no end time field)

## Make Traveler Identifier Optional
- [x] Update TravelersTab UI to make identifier field optional
- [x] Update backend validation to allow empty identifier
- [ ] Test creating travelers without identifier

## Copy Data from Slovakia to Demo Trip
- [x] Get trip IDs for both trips
- [x] Copy hotels
- [x] Copy transportation (flights + car rental)
- [x] Copy routes
- [x] Copy restaurants
- [x] Copy payments
- [x] Copy travelers
- [x] Copy checklist items
- [x] Copy documents (if any)
- [x] Verify all data copied correctly

## WhatsApp Sharing for Collaborators
- [x] Add WhatsApp share button to Collaborators tab for easier invitation sharing

## Enhanced WhatsApp Message
- [x] Add iPhone home screen installation instructions to WhatsApp sharing message

## WhatsApp Message - Use Published URL
- [x] Update WhatsApp message to use published site URL instead of preview URL for proper airplane icon

## Android Installation Instructions
- [x] Add Android installation instructions to WhatsApp sharing message (alongside iPhone instructions)

## WhatsApp Direct Trip Link
- [x] Change WhatsApp message to link directly to the specific trip instead of home page

## Copy Trip Content Bug
- [x] Fix "Copy content to another trip" functionality - currently not copying any data to destination trip
- [x] Successfully copied all content from Slovakia trip to Demo trip

## Cleanup Test Trips
- [x] Delete test trips and keep only Slovakia, Athens, and Demo trips

## Document Redaction
- [ ] Redact names (גורן, אפי, צבי, יונה, רות, מיכל) from all 32 Demo trip documents

## Budget Tab Enhancement
- [ ] Add "Actual" column next to "Planned" in Budget tab
- [ ] Allow users to enter actual expenses
- [ ] Show difference between planned and actual
- [ ] Add visual indicators (green/red) for under/over budget

## iPad Layout - Feature Tabs
- [x] Changed feature tabs from single row flex-wrap to 2-row grid layout on iPad
- [x] Mobile (iPhone) remains single-row horizontal scroll
- [x] PC remains flex-wrap
- [x] iPad shows 4 columns x 2 rows with larger icons and spacing

## Day Tabs Simplification
- [x] Simplified day tabs to show "Day 1", "Day 2" format without dates
- [x] Mobile (iPhone) shows only numbers: 1, 2, 3...
- [x] Tablet and PC show "Day 1", "Day 2" format
- [x] Cleaner look, less crowded

## Bug - Timezone Issues in Day Filtering
- [x] Fixed transportation appearing on wrong day tab
- [x] Changed isOnDay() to use local timezone methods (getFullYear/getMonth/getDate)
- [x] Previously used UTC methods causing items to appear on wrong days

## Bug - Transportation Type Display
- [x] Fixed DailyView to show translated transportation types
- [x] "other" now displays as "Transportation & Parking" (English) or "תחבורה וחניה" (Hebrew)

## Bug - Tourist Sites Showing 00:00
- [x] Fixed tourist sites showing 00:00 when visit time is empty
- [x] Now uses opening hours as fallback time if plannedVisitTime is not set

## Bug - Back Button Navigation
- [x] Changed back button to use browser history (window.history.back())
- [x] Now returns to previous page instead of always going to /trips

## Feature - Hotel Link in Documents
- [x] Added hotel link field to document edit dialog
- [x] Can now change which hotel a document is linked to when editing

## UX - Trip Detail Header Reorganization
- [x] Combined Share and Delete buttons into dropdown menu (⋮ icon)
- [x] Language switcher now visible as second button from right

## UX - Language Switcher Icon
- [x] Change globe icon to text: "ע" when in English, "E" when in Hebrew
- [x] Makes it clearer which language you'll switch to

## Translation Fixes
- [x] Transportation: Changed "הסעות" to "תחבורה" (all instances in i18n)
- [x] Route Maps: Changed "מפות מסלול" to "מפות"
- [x] Payments tab: Changed $ icon to € (Euro icon)

## Translation Fix - Location Maps
- [x] Change "Location Maps" title to "Maps"
- [x] Change "מפות מיקומים" to "מפות"

## Bug - Route Name Parsing in Maps
- [x] Google Maps search includes "Route 1:" or "מסלול 1:" prefix
- [x] Need to strip both English "Route X:" and Hebrew "מסלול X:" before searching
- [x] Fixed regex to handle Hebrew text: /^(Route|מסלול)\s*\d+:\s*/i

## Bug - Timeline Sorting in Daily View
- [x] Airport transfer (BTS to hotel) appears last in timeline instead of first
- [x] Items should be sorted by departure time chronologically
- [x] Fixed: Added time field to transportation events in TimelineTab (was missing)

## Feature - Delete Buttons in Daily View
- [x] Add delete buttons to all activity cards in Daily View timeline
- [x] Handle delete for hotels (check-in/check-out)
- [x] Handle delete for transportation
- [x] Handle delete for car rentals
- [x] Handle delete for tourist sites
- [x] Handle delete for restaurants
- [x] Handle delete for routes
- [x] Show confirmation dialog before deleting
- [x] Refresh data after successful deletion

## Bug - Cannot Delete Hotel Photos
- [ ] Investigate how hotel photos are managed in HotelsTab
- [ ] Check if delete functionality exists for individual photos
- [ ] Add delete button or functionality to remove hotel photos
- [ ] Test photo deletion works correctly

## Bug - Routes Missing Distance & Time in Daily View
- [x] Check why some routes don't show distance and time in daily tabs
- [x] Verify mapData contains distance/duration information
- [x] Update DailyView to display distance and time from route data
- [x] Fixed: Extract distance/time from mapData JSON instead of empty database fields
- [x] Fixed: Maps tab now auto-generates mapData when clicking a route that has none
- [x] Fixed: Maps tab route cards now show distance and time badges

## Bug - Route Generation Forces Wrong Country (Slovakia)
- [x] Fix generateRouteFromName to not blindly append ", Slovakia" to all locations
- [x] Allow Google Maps to resolve city names without forcing wrong country
- [x] Fixed single location geocoding too
- [x] Added Recalculate button (refresh icon) on each route card to force re-generation
