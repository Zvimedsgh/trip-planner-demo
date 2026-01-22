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
