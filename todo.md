# Trip Planner App - TODO

## Core Features
- [x] Trip management - create, edit, delete trips with name, dates, destination
- [x] Tourist sites management - name, address, description, hours, visit date
- [x] Hotel management - name, address, check-in/out, confirmation, price
- [x] Transportation management - type, origin, destination, date/time, confirmation, price
- [x] Car rental management - company, model, dates, locations, confirmation, price
- [x] Restaurant management - name, address, cuisine, reservation date/time, diners
- [x] Document management - upload/store documents with tags and categories
- [x] Timeline view - chronological display of all activities
- [x] Budget calculation - automatic expense summary and total cost
- [x] Bilingual interface - Hebrew and English with smooth switching

## Technical Tasks
- [x] Database schema design
- [x] API endpoints (tRPC routers)
- [x] Home page with elegant design
- [x] Trip list and detail pages
- [x] Tourist sites CRUD
- [x] Hotels CRUD
- [x] Transportation CRUD
- [x] Car rentals CRUD
- [x] Restaurants CRUD
- [x] Documents upload and management
- [x] Timeline component
- [x] Budget summary component
- [x] Language context and translations
- [x] RTL support for Hebrew

## Design
- [x] Elegant color palette
- [x] Typography setup
- [x] Responsive layout
- [x] Card-based interface with gradients


## Bug Fixes
- [x] Transportation form - add departure and arrival time fields
- [x] Transportation form - fix keyboard disappearing after each character
- [x] Transportation form - fix validation error even when all fields are filled

- [x] Transportation form - validation fails even when all fields are filled (mobile issue with date inputs)

## New Features
- [x] Add "Return Flight" button that auto-fills reversed airports and trip end date
- [x] Allow editing the auto-filled values before saving

- [x] Fix keyboard disappearing issue in Hotels form
- [x] Fix keyboard disappearing issue in Tourist Sites form
- [x] Fix keyboard disappearing issue in Car Rentals form
- [x] Fix keyboard disappearing issue in Restaurants form
- [x] Fix keyboard disappearing issue in Documents form

## Currency Support
- [x] Add currency selector dropdown in Hotels form (USD, EUR, GBP, JPY, ILS, CHF, etc.)
- [x] Add currency selector dropdown in Transportation form
- [x] Add currency selector dropdown in Car Rentals form
- [x] Add currency selector dropdown in Restaurants form (with price field)
- [x] Update Budget tab to show amounts with their currencies

## Bug Fixes - Currency
- [x] Fix currency selector clearing form content when changed (Hotels, Transportation, Car Rentals, Restaurants)

## Check-in/Check-out Times
- [x] Add check-in and check-out time fields to Hotels form
- [x] Add pickup and return time fields to Car Rentals form

## Phone Numbers
- [x] Add phone number field to Hotels form
- [x] Add phone number field to Car Rentals form
- [x] Add phone number field to Restaurants form

## Transportation Improvements
- [x] Add flight number field to Transportation form
- [x] Make origin and destination fields empty (no placeholder values)
- [x] Add "Suggest Return Flight" button that swaps origin/destination and uses trip end date

## Budget Display
- [x] Fix budget to show totals per currency (don't mix currencies)

## Form UX
- [x] Fix Tab order in Hotels form
- [x] Fix Tab order in Car Rentals form
- [x] Fix Tab order in Restaurants form
- [x] Fix Tab order in Transportation form

## Budget Display Improvements
- [x] Make currency cards smaller (square boxes)
- [x] Add total in ILS card with real-time exchange rates

## Bug Fixes - Hotels Currency
- [x] Fix currency selector in Hotels form clearing other fields when changed (verified working)

## Timeline Improvements
- [x] Show check-in time for hotels in Timeline view

## Bug - Timeline Missing Check-out
- [x] Fixed: Check-out date was incorrectly set to year 20206 instead of 2026 - corrected via UI

## Time Format
- [x] Change time display from AM/PM to 24-hour format in Timeline

## Hotel Order
- [x] Fix hotel order - sort by check-in date AND time (Bratislava 02:30 before Mikulash 15:00)

## Public Trip Sharing (View-only)
- [x] Add shareToken field to trips table in database
- [x] Create API endpoint to generate/revoke share link
- [x] Create public view page for shared trips (no login required)
- [x] Add "Share" button and dialog in trip detail page
- [x] Show share link with copy button
- [x] Option to disable/revoke share link

## Bug - Shared Trip Page Requires Login
- [x] Fix shared trip page (/shared/:token) to not require authentication

## Shared Trip Page Improvements
- [x] Redesign shared trip page with modern, attractive styling similar to main app
- [x] Add Timeline view to shared trip page

## Home Page Improvements
- [x] Remove fictional trip cards (Paris Adventure, Hotel Booked, Budget Tracking)
- [x] Add beautiful travel destination images instead

## Trip Cards Background Images
- [x] Add background image to trip cards in My Trips page based on destination (Slovakia/Bratislava)

## Hotels Cards Design
- [x] Add colorful background to hotel cards

## Transportation Cards Design
- [x] Make Transportation cards smaller (cube style like others)
- [x] Add colorful background to Transportation cards

## Budget Mobile Fix
- [x] Fix budget display on iPhone (responsive design issue)

## Tourist Sites Images
- [x] Add images to tourist sites based on destination

## More Destination Images
- [x] Add background images for more destinations (Paris, Rome, New York, etc.)

## Custom Trip Image Upload
- [x] Allow users to upload custom image for each trip


## Bug Fixes - Current Session
- [x] תיקון תצוגת תקציב באייפון - שימוש ב-auto-fill grid
- [x] כרטיסי מלונות - רקע צבעוני מלא לכל הקוביה
- [x] צביעת כפתור Trip Details בצבע גרדיאנט בולט

## Hotel Images
- [x] הוספת תמונה למלון בברטיסלבה (Charming & Cozy Ambiente Apartments)

## Hotel-Document Linking
- [x] הוספת אייקון קישור בכרטיסי מלונות למסמכים המתאימים - אייקון FileText מוצג כשיש מסמך booking קשור

## Bug Fixes - Document Links
- [x] תיקון קישורים למסמכים בכרטיסי מלונות - שינוי לפתיחת המסמך בטאב חדש

## Homepage and Trips Page Redesign
- [x] Trips page - stretch trip images as full background for each card
- [x] Homepage - replace My Trips button with Slovakia trip card
- [x] Homepage - add "My Next Trip" placeholder cards that start new trip on click

## New Features - Animations and Quick Actions
- [x] Add parallax scroll effect to homepage trip cards
- [x] Add floating action button (FAB) on trips page with quick actions menu

## Bug - Hotel Pictures
- [x] Fix hotel pictures not displaying - Added coverImage field to schema, uploaded images to CDN, updated database

## Route Planning - Bratislava to Liptovský Mikuláš
- [x] Research attractions and restaurants on the route from Bratislava to Liptovský Mikuláš
- [x] Find restaurants near accommodation in Liptovský Mikuláš area
- [x] Add recommendations to the trip itinerary

## New Features - Route Planning & Enhancements
- [x] Create interactive map showing route from Bratislava to Liptovský Mikuláš
- [x] Add markers for recommended attractions, restaurants, and gas stations
- [x] Add Route Map tab to trip detail page with clickable points
- [ ] Add Daily Planner with drag-and-drop activities
- [ ] Add Packing List / Shopping List tab

## Timeline Enhancement
- [x] Add drive from Bratislava to Liptovský Mikuláš (Sep 2, 14:00-19:00) to Timeline with all stops

## Bug Fix - Date Error
- [x] Fix drive date from 2024 to 2026 (September 2, 2026) - Now shows correctly as Wednesday, September 2, 2026

## Vienna Hotel Parking
- [x] Upload Vienna hotel parking photo and add to documents - Added with tags and height limit note (2.0m)

## New Features - User Requests
- [x] Add Vienna parking photo as background to Vienna hotel card - Added parkingImage field and display logic
- [x] Create Day Trips tab for managing day trips (like Bratislava to Mikuláš)
  - [x] Database schema created
  - [x] Database helpers (CRUD operations)
  - [x] tRPC router with create/list/update/delete
  - [x] Frontend component with forms and display
  - [x] Added to TripDetail tabs with translations
- [ ] Add parking details/photos for other hotels (Bratislava, Košice) - Skipped, no photos available yet
- [x] Expand document links in hotel cards to include "other" category (not just booking) - Now includes parking and other docs
- [ ] Create Pre-Trip Checklist tab (passport, insurance, bookings, car keys)

## Daily View Feature
- [x] Add second row of tabs below main tabs with one tab per day (Sep 1-9)
- [x] Create DailyView component to show all activities for a specific day
- [x] Display hotels, flights, car rentals, sites, restaurants for each day
- [x] Integrate daily tabs into TripDetail page

## Daily Tabs Fix
- [x] Separate daily tabs from activity tabs - prevent content mixing
- [x] Add distinct color to selected day tab for better visibility

## Correct Tab Structure
- [x] Row 1: Activity category tabs (Hotels, Transportation, etc.)
- [x] Row 2: Daily tabs (Day 1-8)
- [x] Daily view shows all activities sorted by time without category headers

## Visual Improvements
- [x] Color active category tab (Hotels, Transportation, etc.)
- [x] Add pastel background colors to activities in daily view
- [x] Show departure time in flights displayed in daily view

## Time Display Bug
- [ ] Fix incorrect time display in daily view (Day 2 activities showing 03:00)
- [ ] Investigate timezone conversion issue
- [ ] Ensure times match what user entered

## Time Fields for All Activities
- [x] Add time field to Tourist Sites (planned visit time)
- [x] Add time field to Restaurants (reservation time)
- [x] Update database schema with new time fields
- [x] Update Tourist Sites form to include time input
- [x] Update Restaurants form to include time input
- [x] Update DailyView to combine date+time for tourist sites
- [x] Update DailyView to combine date+time for restaurants

## UI/UX Improvements and URL Support
- [x] Add URL field to Hotels (website link)
- [x] Add URL field to Tourist Sites (website link)
- [x] Add URL field to Restaurants (website link)
- [x] Add URL field to Transportation (booking link)
- [x] Add URL field to Car Rentals (booking link)
- [x] Update all forms to include URL input field
- [x] Colorize small action buttons (document view, edit, delete) with distinct colors
- [x] Add document links to activities in daily view
- [x] Make document buttons more visible and accessible

## Bug Fixes - Parking Image and URL Display
- [x] Fix parking image upload bug - all activities showing Vienna hotel parking image
- [x] Display website URL in activity cards (Hotels, Tourist Sites, Restaurants, Transportation, Car Rentals)
- [x] Show URL link in daily view activities
- [x] Link activities to ALL their related documents in daily view (not just one)
- [x] Support multiple document buttons per activity in daily view

## Bug Fixes and New Features - Session Complete
- [x] Fix document upload bug - blue button now shows documents (not parking images)
- [x] Fix parking image display - purple button now shows parking images only
- [x] Support multiple document uploads per hotel
- [x] Auto-wrap action buttons to new row if not enough space
- [x] Translate "OTHER" to "BY CAR" in transportation type
- [x] Show "אין מסמך" / "אין תמונת חניה" messages when no files available
- [x] Colorize all action buttons with distinct colors (blue=document, purple=parking, amber=edit, red=delete)
- [x] Display website URLs in all activity cards with external link icon
- [x] Show website and document links in daily view

## Route Maps - In Progress
- [ ] Create route map: Liptovský Mikuláš → Košice with attractions, restaurants, gas stations
- [ ] Create route map: Košice → Vienna with attractions, restaurants, gas stations
- [ ] Update navigation to show all three route maps as separate tabs

## Bug Fixes and New Features - Current Session
- [x] Fix hotel document display bug - all hotels showing same document (not hotel-specific)
- [x] Add automatic background images for new hotels based on hotel name
- [x] Fix currency selector bug - changing currency clears all other fields (regression)
- [x] Add hotel category field to database schema
- [x] Add category selector to Hotels form
- [x] Create "HOTELS TO CHOOSE KOSICE" category group
- [ ] Filter/group hotels by category in Hotels tab (optional enhancement)

## Bug Fix - Hilton Košice Edit Error
- [x] Fix "Cannot read a client value during server rendering" error when editing Hilton Košice hotel
- [x] Change category selector from controlled to uncontrolled component

## Bug Fix - Hilton Košice Edit Error (FIXED)
- [x] Fix "Cannot read a client value during server rendering" error when editing Hilton Košice hotel
- [x] Root cause: key={formKey} prop on form div causes React to rebuild form on edit, triggering SSR hydration mismatch
- [x] Solution: Removed key prop from form div

## Critical Bug - SSR Error When Editing ALL Hotels (FIXED)
- [x] User reports SSR error occurs when editing ALL hotels (not just Košice)
- [x] Root cause: Select.Item with empty string value="" is not allowed
- [x] Fixed by changing empty value to "none" and updating logic to convert "none" to undefined when saving
- [x] All hotels can now be edited without errors

## Bug Fix - Hotel Image Matching
- [x] Fix case-insensitive matching for hotel images (DoubleTree By vs by, Hotel Ambassador not showing) - improved with word-based matching

## Hotel Image Issues - Specific Hotels
- [x] Fix Hotel Ambassador image not showing - filtered common words, requires 1 unique word match
- [x] Fix Apart Hotel GOLDEN apartments image not showing - filtered 'apartments' from matching

## Final Tasks Before Sharing with Travelers
- [x] Reduce card sizes from 3 to 4 columns in Hotels tab
- [x] Reduce card sizes from 3 to 4 columns in Documents tab
- [x] Create RouteMapTab2 (Liptovský Mikuláš → Košice)
- [x] Create RouteMapTab3 (Košice → Vienna)

## Critical Bug - Daily Tabs Missing
- [x] Daily tabs (Day 1-9) disappeared after adding route maps
- [x] Fixed by changing second TabsList to div wrapper

## Bug - Tabs Overlapping
- [x] Category tabs and daily tabs are displaying on the same line and overlapping
- [x] Fixed by wrapping daily tabs in nested div with block display and explicit marginTop

## Solution - Consolidate Route Maps
- [x] Combine Route 1, Route 2, Route 3 into single "Route Maps" tab
- [x] Display all three maps as sections within one tab
- [x] Remove separate route1, route2, route3 tabs from tabs array

## Critical Issues - Current
- [x] Daily tabs (Day 1-9) still not showing after consolidating route maps - FIXED by correcting swapped dates in database
- [x] Hotels marked as "for selection" need visual indicator (badge/tag within hotel card) - Added yellow badge next to hotel name

## Route Maps UI Improvements
- [x] Fix AllRouteMapsTab - only Košice→Vienna map showing, need all 3 maps visible
- [x] Create card-based UI for route maps - show cards/cubes for each map
- [x] Open map in dialog/modal when clicking on card
- [x] Prepare for future map additions with scalable card layout

## Budget Calculation Enhancement
- [x] Update budget logic to handle "selection" category hotels intelligently
- [x] When multiple hotels marked as "selection", include only the highest-priced one in budget
- [x] Exclude other selection hotels from total calculation

## Route Map Dialog Improvements
- [x] Enlarge map dialog to near-fullscreen size (95vw x 95vh)
- [x] Ensure POI markers are visible on map (gas stations=blue, attractions=red, restaurants=green)
- [x] Add POI list below map in 2-3 columns (responsive grid)
- [x] Include POI type icons and names in the list

## New Route Maps - Day Trips & Updates
- [x] Add Route 4: Liptovský Mikuláš → Štrbské Pleso → Liptovský Mikuláš (3/9 day trip) - High Tatras mountain lake
- [x] Add Route 5: Liptovský Mikuláš → Jasná – Demänovská Dolina → Liptovský Mikuláš (day trip) - Ski resort and caves
- [x] Update Route 2: Change Liptovský → Košice to pass through Slovenský Raj National Park - Added waypoint and POIs

## Route Map Dates & Daily Integration
- [x] Add date (3/9) to Route 4 (Štrbské Pleso) title and description
- [x] Add date (4/9) to Route 5 (Demänovská Dolina) title and description
- [x] Confirm Route 2 (Košice) remains at 5/9
- [x] Integrate route titles into corresponding daily tabs (Day 3, Day 4, Day 5)
- [x] Fix all route dates - moved each route one day later to match actual trip schedule

## New Features - Day 6 Košice and Route 6
- [x] Add Jewish Cemetery to Day 6 Košice tourist sites
- [x] Add HLAVNA street to Day 6 Košice tourist sites
- [x] Add free time activity to Day 6 Košice
- [x] Add dinner with Ava restaurant to Day 6 Košice evening
- [x] Create Route 6: Vienna → Bratislava Airport (Day 9)
- [x] Add more POIs to existing route maps (gas stations and restaurants)

## Complete Trip Data Entry from Documents
- [x] Add outbound flight (Sep 1, 22:00 from Israel to Bratislava, arrival Sep 2, 01:10)
- [x] Add return flight (Sep 9, 17:00 from Bratislava to Israel)
- [x] Add car rental transportation (Sep 2, 10:00 pickup - Sep 9, 15:00 return at BTS Airport)
- [x] Add Day 2 Bratislava activities (Bratislava Castle, Old Town, Blue Church, Eurovea Mall + Primark)
- [ ] Verify all 9 days have correct activities and timeline
- [ ] Remove any duplicate or incorrect data from previous entries
- [ ] Fix timezone display issue for flight times

## Bug Fix - Hotel Dates
- [ ] Update all hotel check-in/check-out dates from 2024 to 2026 so they appear in daily timeline views

## Bug Fix - Hotels Not Appearing in Daily Views
- [x] Debug why hotels with correct 2026 dates are not showing in daily timeline tabs - Fixed isOnDay function
- [ ] User needs to manually update hotel dates in UI from 2024 to 2026

## Bug Fix - Trip Dates Wrong Year
- [x] Update trip startDate and endDate from 2024 to 2026 so daily tabs match hotel/activity dates

## Bug Fix - Remove Hardcoded Routes from Daily Views
- [x] Remove route display logic from DailyView component
- [x] Remove route display logic from TimelineTab component
- [x] Routes should only appear in Route Maps tab, not in daily timeline

## Bug Fix - Remove Route 3 from Day 6
- [x] Remove Route 3 (Košice → Vienna) display from Day 6 in DailyView component - Already removed in previous fix

## Feature - Database-Backed Route Management System
- [ ] Create routes table schema in drizzle/schema.ts
- [ ] Push database schema changes
- [ ] Create tRPC procedures for route CRUD (create, list, update, delete)
- [ ] Update AllRouteMapsTab to fetch routes from database
- [ ] Create route management UI (add/edit/delete buttons and forms)
- [ ] Migrate existing 6 hardcoded routes to database
- [ ] Test route management functionality

## Route Cards in Daily Tabs
- [x] Add route cards to daily tabs showing which route is taken that day
- [x] Route cards should appear at top of daily view with map icon
- [x] Include route title, description, and link to full map in Route Maps tab
- [x] Routes should appear on correct days: Route 1 (Day 2), Route 4 (Day 4), Route 5 (Day 5), Route 2 (Day 6), Route 3 (Day 7), Route 6 (Day 9)

## Fix Route Dates - Correction
- [x] Route 4 (Štrbské Pleso) should be Day 3 (not Day 4)
- [x] Route 5 (Jasná) should be Day 4 (not Day 5)
- [x] Route 2 (Liptovský → Košice) should be Day 5 (not Day 6)
- [x] Update dates in AllRouteMapsTab.tsx
- [x] Update dates in DailyView.tsx

## Day 2 Bratislava Activities
- [x] Update Bratislava Castle with time 09:30 and full description
- [x] Update Old Town & St. Michael's Gate with time 11:30 and full description
- [x] Update Blue Church with time 15:00 and full description
- [x] Update Eurovea Shopping with time 15:30 and full description
- [x] Add lunch restaurant (13:30) - Menu dňa at Old Town
- [x] Add dinner restaurant (19:00) - Danube riverside

## Day 6 Košice Activities
- [x] Add St. Elisabeth's Cathedral tourist site (09:30)
- [x] Add State Theatre and Musical Fountain tourist site (11:00)
- [x] Add Orthodox Synagogue (Puškinova) tourist site (14:00)
- [x] Add Zvonárska Synagogue + Potters Street tourist site (15:30)
- [x] Add lunch at Hlavná Street restaurant (12:30)
- [x] Add dinner at Villa Regia restaurant (19:30)

## Fix Route 1 Start Time
- [x] Update Route 1 description in AllRouteMapsTab to show 19:00 start time
- [x] Update Route 1 card in DailyView to show 19:00 start time

## Fix 2024 to 2026 Dates
- [x] Update Day 2 (Sep 2, 2026) tourist sites from 2024 to 2026 timestamp
- [x] Update Day 2 (Sep 2, 2026) restaurants from 2024 to 2026 timestamp
- [x] Update Day 6 (Sep 6, 2026) tourist sites from 2024 to 2026 timestamp
- [x] Update Day 6 (Sep 6, 2026) restaurants from 2024 to 2026 timestamp

## Fix Route Display in Day 3 and Day 4
- [x] Debug day number calculation in DailyView.tsx - Fixed to use Sep 1, 2026 as trip start
- [x] Fixed early return that prevented route cards from showing when no other activities exist
- [x] Moved route card rendering before empty state check
- [x] Verified Route 4 (Štrbské Pleso) appears in Day 3 tab
- [x] Verified Route 5 (Jasná) appears in Day 4 tab

## Vienna Activities (Days 7-8)
### Day 7 Evening (Sep 7)
- [x] Add Stephansplatz walking tour tourist site (19:00)
- [x] Add Figlmüller restaurant for dinner (19:00)
- [x] Add Lugeck restaurant as alternative for dinner (19:00)

### Day 8 Full Day (Sep 8)
- [x] Add Schönbrunn Palace tourist site (08:30)
- [x] Add Naschmarkt tourist site (12:00)
- [x] Add NENI restaurant at Naschmarkt for lunch (12:30)
- [x] Add Hofburg Palace tourist site (15:00)
- [x] Add Austrian National Library tourist site (15:30)
- [x] Add Café Central for coffee and cake (16:30)
- [x] Add Grinzing wine village tourist site (19:00)
- [x] Add Zum Martin Sepp Heuriger restaurant for dinner (19:30)

## Pre-Trip Checklist
- [x] Create initial checklist items for documents category (6 items)
- [x] Create initial checklist items for bookings category (2 items)
- [x] Create initial checklist items for packing category (7 items)
- [x] Create initial checklist items for health category (3 items)
- [x] Create initial checklist items for finance category (4 items)
- [x] Create initial checklist items for other category (4 items)

## Add Deletion Confirmation Dialogs
- [x] Add confirmation dialog for hotel deletion
- [x] Add confirmation dialog for transportation deletion
- [x] Add confirmation dialog for car rental deletion
- [x] Add confirmation dialog for tourist site deletion
- [x] Add confirmation dialog for restaurant deletion
- [x] Add confirmation dialog for document deletion
- [x] Add confirmation dialog for checklist item deletion
- [x] Add confirmation dialog for day trip deletion
- [x] Add confirmation dialog for trip deletion (main page)

## Document Linking Icons
- [x] Hotels already have document linking
- [x] Add document link icon to tourist site cards
- [x] Add document link icon to restaurant cards
- [x] Add document link icon to car rental cards
- [x] Add document link icon to transportation cards

## Collaboration System
- [ ] Create trip_collaborators table in database schema
- [ ] Add permission field (view_only / can_edit) to collaborators table
- [ ] Create tRPC procedure: collaborators.invite (email or share link)
- [ ] Create tRPC procedure: collaborators.list (get all collaborators for a trip)
- [ ] Create tRPC procedure: collaborators.remove (remove collaborator access)
- [ ] Create tRPC procedure: collaborators.updatePermission (change view/edit rights)
- [ ] Add permission check middleware to all create/update/delete procedures
- [ ] Build "Share & Collaborate" UI panel in trip settings
- [ ] Add collaborator list with permission toggles
- [ ] Add invite form (email input + permission selector)
- [ ] Display current user's permission level in UI
- [ ] Show "read-only" indicators when user has view-only access
- [ ] Disable edit/delete buttons for view-only users

## Hotel Images
- [ ] Find and add image for Apart Hotel GOLDEN (Mikuláš)
- [ ] Find and add image for Private holiday house Vivendi (Košice)
- [ ] Find and add images for other hotels if missing

## Budget Tab
- [ ] Add estimated hotel expenses to budget
- [ ] Add estimated food expenses (restaurants) to budget
- [ ] Add estimated transportation expenses (flights, car rental) to budget
- [ ] Add estimated attractions expenses to budget
- [ ] Add estimated fuel/gas expenses to budget
- [ ] Calculate and display total budget

## Restaurants for Days 3-4 (Mikuláš)
- [ ] Research and add lunch restaurant for Day 3
- [ ] Research and add dinner restaurant for Day 3
- [ ] Research and add lunch restaurant for Day 4
- [ ] Research and add dinner restaurant for Day 4

## Collaborator Activity Tracking
- [x] Add lastSeen timestamp field to trip_collaborators table
- [x] Add visitCount field to trip_collaborators table
- [x] Create activity_log table for tracking user actions
- [x] Update trip access procedure to record lastSeen and increment visitCount
- [ ] Add activity logging to all create/update/delete operations
- [x] Display last seen time in CollaboratorsDialog
- [x] Display visit count in CollaboratorsDialog
- [ ] Add activity history view in CollaboratorsDialog

## Collaboration UX - Display Name Invitation
- [x] Change user invitation from User ID to Display Name (first name)
- [x] Update backend to search users by display name instead of userId
- [x] Update CollaboratorsDialog UI to accept display name input
- [x] Add user search/autocomplete for display names
- [x] Test invitation flow with display names

## Hot Springs Addition
- [x] Add Waterpark Bešeňová as tourist site for day 3 at 19:00
- [x] Add Termálny prameň Kalameny as tourist site
- [x] Create document with hot springs information and tips
- [ ] Debug why sites exist in DB but don't appear in UI
- [ ] Fix the loading/display issue
- [ ] Clean up duplicate entries

## Bug Fix - Collaborator Trips Visibility
- [ ] Fix getUserTrips to include trips where user is collaborator
- [ ] Test that Michal and Efi can see shared trips

## Timeline Issues - Current Session
- [ ] Fix timeline date 2/9 issue - Charming hotel check-in/check-out appearing on wrong date
- [x] Fix check-in/check-out times to appear chronologically by hour, not at end of day


- [ ] Fix routes not appearing in timeline for days 3 and 4
- [x] Fix DailyView to display route cards for Day 3 and Day 4
- [x] Add routes to Timeline view so they appear in chronological order

## Dynamic Route Management System
- [x] Create routes table in database schema
- [x] Build tRPC procedures for route CRUD operations (create, list, update, delete)
- [x] Update Timeline to fetch routes from database instead of static array
- [x] Update DailyView to fetch routes from database instead of static array
- [ ] Create route management UI with add/edit/delete functionality in Route Maps tab
- [x] Migrate existing 6 static routes to database

## Bug Fixes - Route Times
- [x] Fix Timeline chronological sorting - events now appear in correct time order

## UX Improvements - Trip Detail Page
- [x] Swap tab order - day tabs above activity tabs
- [x] Add pastel colors to day tabs
- [x] Auto-select current day (or first day if trip not started)
- [x] Make tabs sticky during scroll (freeze position)
- [x] Add floating scroll-to-top button

## Additional UX Improvements - Pending
- [x] Color-code events in Timeline and DailyView to match day colors
- [x] Improve active tab highlighting (make selected tab more visually distinct)

## UX Bugs - Morning Session
- [x] Fix scroll-to-top button - appears after scrolling 300px
- [x] Fix sticky tabs - tabs stay at top-16 below header
- [x] Fix active tab highlighting - darker background + thick border + shadow
- [x] Add pastel colors to activity tabs - slate gray pastel

## Mobile UX Issues - iPhone Testing
- [x] Activity tabs colored with amber pastel (Hotels, Transportation, etc.)
- [x] Selected day tab has border-[3px] thick border
- [x] Scroll-to-top button moved to bottom-left (left-8)
- [x] Day tabs simplified - only numbers with "Days" header

## Debug - Cache Issues
- [ ] Mobile changes not visible on iPhone after checkpoint - investigate server/cache

## UX Improvements - User Feedback Session
- [x] Responsive day tab format - desktop shows "Day 1 - Sep 1", mobile shows only "1"
- [x] Multi-row day tabs - support 30+ day trips with automatic wrapping to multiple rows
- [x] Unique colors for each activity category - Hotels (blue), Transportation (purple), Sites (green), Restaurants (orange), etc.
- [x] Always provide publish checkpoint link after each significant change

## Bug - Tab Switching
- [x] Fix tab switching bug - clicking Transportation or Timeline shows content briefly then jumps back to Day 1
- [x] Root cause: useEffect auto-select logic runs on every render instead of only on mount

## Feature Implementation Queue (9 features)
- [x] 1. Route Management Interface - add/edit/delete routes directly from app
- [x] 1a. Route metadata - distance (km), estimated travel time, road type (completed with #1)
- [ ] 2. Link routes to maps - button in route cards to open corresponding map
- [ ] 3. Timeline filtering - filter by event type (hotels, restaurants, etc.)
- [ ] 4. Trip progress indicator - progress bar showing days elapsed
- [ ] 5. Offline mode - save data to localStorage for offline viewing
- [ ] 6. Global search - search field for hotels, restaurants, attractions
- [ ] 7. PDF export - export full trip details to PDF
- [ ] 8. Real-time notifications - alerts before check-in/flights

## Bug - Route Manager Date Picker
- [x] Fix RangeError: Invalid time value when trying to select a date in the add/edit route form
- [x] Root cause: Date picker returns invalid date format that causes crash - fixed with validation
