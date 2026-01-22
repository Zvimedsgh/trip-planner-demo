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
- [ ] Make currency cards smaller (square boxes)
- [ ] Add total in ILS card with real-time exchange rates
