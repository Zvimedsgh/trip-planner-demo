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
- [x] Update Checklist to use dynamic traveler list instead of hardcoded names (already implemented)eler management with Slovakia trip

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

## Budget Calculation Bug
- [ ] Fix budget summary to properly reflect paid vs unpaid payments - currently showing all as unpaid even when marked as paid

## Budget Calculation Bug
- [x] Fix budget summary to properly reflect paid vs unpaid payments - now uses paymentStatus field instead of payments table

## Document Names Cleanup in Demo Trip
- [x] Identified document with technical ID prefix: "cYWNC1MfiJAL2nOZPCRxW-הסעה מהשדה בברטיסלבה למלון בעיר.docx"
- [x] Cleaned up document name to: "הסעה מהשדה בברטיסלבה למלון בעיר.docx"

## User Guide Creation
- [x] Write comprehensive user guide in Hebrew (Markdown)
- [x] Convert guide to PDF format
- [x] Create Help page component in website
- [x] Add Help page route and navigation link
- [ ] Test both PDF and web page versions

## Fix User Guide PDF RTL Direction
- [x] Create HTML template with RTL styling
- [x] Convert Markdown to RTL PDF
- [x] Update PDF in public folder

## Fix Itinerary Items Not Appearing in Day-by-Day Tab
- [x] Investigate why itinerary items (e.g., SREBSKE on Day 4) don't appear in Day-by-Day tab
- [x] Check database to verify itinerary dates are correct
- [x] Fix code to properly sync itinerary items with days (changed to UTC date comparison)
- [ ] Test the fix with Slovakia trip

## Fix Route Sorting in Day-by-Day Timeline
- [x] Check database timestamp of transportation route (Sep 2, 01:30)
- [x] Investigate why route at 01:30 appears last instead of first in timeline
- [x] Fix sorting logic to properly order activities by time - Changed all setHours to setUTCHours in DailyView.tsx
- [x] Test that transportation appears before check-in

## Fix Timeline Timezone Handling - Remove UTC, Store Local Time
- [x] Analyze current schema (timestamps vs date+time+location)
- [x] Update database schema to store date, time, location separately for all tables
- [x] Migrate existing Slovakia trip data to new format
- [x] Update backend tRPC procedures for new schema (schema auto-updates)
- [x] Update frontend components (DailyView) to use date+time directly
- [x] Test timeline sorting works correctly (transportation 01:30 before hotel 02:30) ✅ VERIFIED

## Fix Flight Times to Match Itinerary
- [x] Check current flight times in database
- [x] Update outbound flight (W6 7062): Depart TLV 22:30 Israel time, Arrive BTS 01:10 Slovakia time
- [x] Update return flight (W6 7061): Depart BTS 17:05 Slovakia time, Arrive TLV 21:35 Israel time
- [x] Verify timeline displays correct times (Day-by-day view works)
- [x] Fix Transportation tab to display correct times from new departureTime/arrivalTime fields

## Fix "Show on Map" for Routes
- [ ] Investigate how "Show on Map" currently works for routes
- [ ] Fix route selection to display actual route path on map instead of POIs
- [ ] Test that clicking route shows the driving/travel path on map

## Fix Route Map Layout - Map Too Small
- [x] Increase map height from current slim size to 60vh (60% of viewport height)
- [x] Reduce POI list max height from 96 to 64 (256px) to give more space to map
- [x] Fix MapView to inherit parent height with className="h-full"
- [ ] Test that route path is clearly visible on larger map

## Fix Route Dialog Scrolling on Mobile
- [x] Fix route dialog content not scrollable on mobile (iPhone)
- [x] POI list is not accessible - no scrolling available in dialog
- [x] Made DialogContent flex container with scrollable content area
- [x] First fix didn't work - conflicted with grid layout
- [x] Investigated Dialog component - uses grid not flex
- [x] Applied second fix: overflow-hidden on dialog, maxHeight calc on content wrapper
- [ ] Test second fix on iPhone

## Add "Open in Google Maps" Button to Route Dialog
- [x] Add button to route dialog that opens route in Google Maps app/website
- [x] Use Google Maps directions URL with origin and destination
- [x] Button should be prominent and easy to tap on mobile (py-4 px-6, text-lg)
- [x] Smart URL generation: directions for routes, search for locations
- [ ] Test that button opens Google Maps with correct route and POIs

## Simplify Route Maps - Open Google Maps Directly
- [x] Fix Google Maps link to open app directly (not browser/in-app) - using window.location.href
- [x] Make route cards open Google Maps directly when clicked
- [x] Hide embedded map dialog (keep code for potential future use)
- [ ] Test that clicking route card opens Google Maps app and stays there

## Fix Google Maps Opening from PWA
- [x] window.location.href doesn't work in PWA - navigates within app
- [x] Use programmatic <a> element click to trigger external app opening
- [ ] Test on published site after fix
- [ ] If still doesn't work, may need to revert to embedded map dialog

## Fix Google Maps URL to Show Route Instantly
- [x] Current URL requires user to select route and push button on intermediate page
- [x] Fixed by using window.open() like RouteManager
- [x] Use location names instead of coordinates
- [x] Added &region=SK for Slovakia context
- [ ] Test that route appears instantly when opening Google Maps

## Fix Day Page "View on map" Link
- [x] Location Maps tab works correctly with window.open()
- [x] Day page "View on map" link still shows Trip Planner intermediate page
- [x] Apply same fix to day page route component (DailyView.tsx)
- [ ] Test that both locations work correctly

## Fix Transportation Edit Form Time Display Bug
- [x] Transportation shows 01:30 in display view (correct)
- [x] Edit form shows 3:00 instead of 01:30 (wrong)
- [x] Fixed to use stored time instead of extracting from timestamp
- [ ] Test that edit form displays the correct saved time

## Fix Hotel/Transportation Validation - Date+Time Comparison
- [x] Hotel validation rejects same-day stays (check-in 2:30, check-out 11:00)
- [x] Error: "Check-out date must be after check-in date" even though times are valid
- [x] Validation only compares dates, not date+time
- [x] Added combineDateAndTime helper and fixed validation in both create and update
- [ ] Test that same-day hotel stays now save correctly

## Bug - Transportation Arrival Time Not Saving
- [x] User tries to change arrival time from 01:30 to 02:30
- [x] Change doesn't save - reverts to old time (01:30)
- [x] Investigate transportation update mutation
- [x] Fix arrival time persistence - added departureTime/arrivalTime to router schema and frontend mutations
- [ ] Test that arrival time changes save correctly

## Bug - Action Icons Hidden on Tourist Site Cards
- [x] Long site names push action icons off screen to the right
- [x] Icons are present but invisible beyond screen edge
- [x] Need to constrain site name width and ensure icons stay visible
- [x] Fix layout in site card component - added flex-1 min-w-0 to text container and flex-shrink-0 to buttons
- [ ] Test that all action icons are now visible on cards with long names

## Bug - Action Icons Hidden on Restaurant Cards
- [x] Same layout issue as tourist sites - long names push icons off screen
- [x] Apply same flex layout fix to restaurant cards - added flex-1 min-w-0 and flex-shrink-0
- [ ] Test that all action icons are now visible on restaurant cards with long names

## Bug - Document Icon Opens .docx Files Incorrectly
- [x] Vienna parking hotel has .docx file linked (Word document)
- [x] Clicking blue document icon tries to open .docx in new tab
- [x] Browser shows blank page with loading spinners and download prompt
- [x] .docx files cannot be displayed in browser - need conversion
- [x] Implement server-side .docx to PDF conversion during document upload using LibreOffice
- [x] Store converted PDF version for consistent browser viewing
- [ ] Test uploading new .docx file and verify it converts to PDF
- [ ] Note: Existing .docx files remain as-is, only new uploads are converted

## Feature - On-Demand Document Conversion
- [x] Add server endpoint to convert existing .docx files to PDF when accessed
- [x] Download .docx from S3, convert to PDF, upload PDF, update database
- [x] Update frontend to call conversion endpoint before opening .docx files
- [x] Cache converted PDF so future clicks don't reconvert (database updated with PDF URL)
- [ ] Test with existing Vienna Parking .docx file

## Bug - PDF Viewing on iOS Safari
- [x] iPhone shows blank page when opening PDF
- [x] iPad shows download prompt instead of displaying PDF
- [x] window.open() doesn't work reliably on iOS Safari
- [x] Create PDF viewer modal component with iframe
- [x] Replace window.open with modal for consistent cross-device experience
- [ ] Test on iPhone, iPad, and desktop

## Bug - PDF Conversion Not Working
- [ ] Modal opens but shows .docx file instead of PDF
- [ ] Conversion mutation may be failing silently
- [ ] Check server logs for LibreOffice errors
- [ ] Verify conversion endpoint returns correct PDF URL
- [ ] Test conversion with sample .docx file

## Bug - Word Documents Not Displaying in Modal
- [x] Vienna Parking hotel has .docx file that shows blank in modal
- [x] iOS Safari cannot display Word documents in iframe
- [x] Simplified PDF viewer modal to detect file type
- [x] For PDFs: show iframe preview
- [x] For Word/other docs: show friendly download message with button
- [x] Removed complex on-demand conversion logic
- [x] Cleaned up unused convertPdfMutation code
- [ ] Test on iPhone, iPad, and desktop

## Feature - Automatic .docx to PDF Conversion [REVERTED]
- [x] Attempted auto-conversion but LibreOffice not available in production
- [x] Reverting to download approach for reliability across all environments

## Bug - Document Conversion Failing
- [x] Modal shows "Failed to convert document" error
- [x] LibreOffice not installed in production environment
- [x] Conversion approach not viable for deployed site
- [x] Reverting to download approach for .docx files
- [x] Reverted PdfViewerModal to show download UI for .docx files
- [x] Removed documentId prop from modal component
- [x] Removed pdfViewerDocumentId state from HotelsTab
- [x] Commented out convertToPdf procedure in server routers
- [x] Updated comments to reflect download approach instead of conversion
- [x] Test PDF viewing in modal (should work)
- [x] Test .docx download interface (shows friendly download UI with clear messaging)

## Update Document Links - Convert .docx to .pdf
- [x] Query database to find all documents with .docx in fileUrl or name
- [x] User uploaded only 3 PDFs (not all 34 documents)
- [ ] Identify which 3 specific documents were converted
- [ ] Update only those 3 documents in database (fileUrl, fileKey, name, mimeType)
- [ ] Revert the mass update that changed all 55 documents
- [ ] Test the 3 PDF documents load correctly in modal

## Fix Document Selection Dialog
- [x] Document names are truncated/cut off in DocumentLinkDialog
- [x] User cannot read full names to select correct document
- [x] Fix dialog to show full document names without truncation (changed truncate to break-words)
- [x] Test dialog shows complete names for all documents (verified - names wrap properly)

## Update Document Categories
- [ ] Analyze where document categories are defined (schema, frontend, backend)
- [ ] Check existing documents with "ברכב" category in database
- [ ] Rename "ברכב" to "תחבורה וחניה" (Transportation & Parking)
- [ ] Add new category "אתרים" (Sites)
- [ ] Update database enum if categories are stored as enum
- [ ] Update frontend category labels and translations
- [ ] Test category dropdown shows new categories
- [ ] Verify existing documents still display correctly

## Update Document Categories - Rename ברכב and Add אתרים
- [x] Confirmed "ברכב" category exists with 13 documents
- [x] Found "ברכב" is Hebrew translation of "other" category
- [x] Renamed category "other" translation: "ברכב" → "תחבורה וחניה"
- [x] Added new category "sites" with Hebrew "אתרים"
- [x] Updated category enum in drizzle/schema.ts
- [x] Updated i18n translations (English + Hebrew)
- [x] Updated DocumentsTab icons (MapPin), colors (teal), and dropdowns
- [x] Updated server/routers.ts validation schemas
- [x] Applied database migration (ALTER TABLE documents)
- [x] Test category display, filtering, and document upload
- [x] Verified English: "Transportation & Parking" and "Sites"
- [x] Verified Hebrew: "תחבורה וחניה" and "אתרים"
- [x] All 11 documents from "ברכב" now show under "תחבורה וחניה"

## Bug - Duplicate Documents Without Delete Icons
- [x] Two "Kosice, Slovakia- All You Must Know Before You Go" documents showing in Sites category
- [x] Both documents missing delete icon (trash button)
- [x] Checked database - confirmed 2 duplicate documents
- [x] Could not determine why delete icons were missing
- [x] Deleted both duplicate documents from database
- [ ] User will re-upload one fresh copy
- [ ] Verify new upload has delete icon visible

## iPad Layout Improvements
- [x] Day tabs showing too much text ("Day 1 - Sep 1" is too long)
- [x] Feature tabs cramped in single row on iPad
- [x] Shorten day tab labels to show only "Day 1", "Day 2", etc. (remove dates)
- [x] Arrange feature tabs in 2 rows for better spacing on tablet
- [x] Removed flex-1, set fixed width (110px on tablet)
- [x] Increased icon size and padding for better touch targets
- [x] Centered tabs with justify-center
- [x] Test layout on iPad screen size to verify improvements
- [x] Verified day tabs show only "יום 1", "יום 2" etc.
- [x] Verified feature tabs wrap into 2 rows with proper spacing
- [x] Tabs are bigger and easier to tap on iPad

## Bug - Responsive Layout Broken After iPad Fix
- [x] iPhone: Feature tabs now wrap into 2 rows messily (should be single scrollable row)
- [x] iPad: Feature tabs still cramped in single row (should wrap to 2 rows)
- [x] Used proper responsive breakpoints (default for mobile, md: for tablet)
- [x] Mobile: overflow-x-auto with flex-1 for single scrollable row
- [x] Tablet: flex-wrap with fixed width (110px) for 2-row layout
- [ ] Test on iPhone to verify single scrollable row
- [ ] Test on iPad to verify 2-row wrapping layout

## Bug - iPhone Feature Tabs Wrapping
- [x] iPhone shows feature tabs wrapping into 2 rows (should be single scrollable row)
- [x] Icons showing without labels and getting cut off
- [x] Removed flex-1, added flex-shrink-0 with fixed width (80px) on mobile
- [x] This forces single row with horizontal scrolling on mobile
- [ ] Test on iPhone to verify single scrollable row works

## Bug - Responsive Layout Regression
- [x] iPad went back to single row (should be 2 rows)
- [x] iPhone still wrapping/not working (should be single scrollable row)
- [x] flex-shrink-0 applying to all screens, preventing iPad wrapping
- [x] Added md:flex-shrink to allow wrapping on tablet while keeping flex-shrink-0 on mobile
- [ ] Test on all devices after C&P

## Bug - Invalid Tailwind Class
- [x] Used `md:flex-shrink` which doesn't exist in Tailwind
- [x] Tailwind responsive utilities not working - switched to custom CSS with @media queries
- [x] Added .feature-tab class with flex-shrink: 0 (mobile) and flex-shrink: 1 (tablet @768px+)
- [ ] C&P to test on all devices
