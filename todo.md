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
