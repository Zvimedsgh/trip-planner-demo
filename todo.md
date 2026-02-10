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
