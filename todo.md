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

## Feature - Demo Mode System (7-Day Trial)
### Phase 1: Database Schema
- [x] Add isDemoUser boolean field to users table
- [x] Add demoStartDate timestamp field to users table
- [x] Add demoExpiryDate timestamp field to users table
- [x] Add maxTrips integer field to users table (default null for full users, 2 for demo)
- [x] Run database migration

### Phase 2: Demo Route & Auto-Copy
- [x] Create demo helper functions (getOrCreateDemoUser, copyDemoTripToUser)
- [x] Copy Slovakia trip (ID 30001) to demo user with all related data
- [x] Set demo expiry to 7 days from first access
- [ ] Create frontend /demo page that calls these functions
- [ ] Redirect to home page after setup

### Phase 3: Trip Creation Limits
- [x] Add trip count check in trips.create procedure
- [x] Block creation if demo user has 2+ trips
- [x] Show error message: "Demo users can create only 1 additional trip"
- [ ] Test trip creation limit enforcement

### Phase 4: Demo Mode Banner
- [x] Create DemoBanner component with countdown timer
- [x] Show "Demo Mode - X days remaining" in header
- [x] Update countdown every minute
- [x] Hide banner for full users
- [x] Show red banner when expired or 1 day remaining

### Phase 5: Expiration Warnings & Upgrade Flow
- [x] Show warning dialog when 1 day remaining: "Demo expires in 24 hours"
- [x] Create upgrade dialog with "Continue" / "Delete" options
- [x] If Continue: show "Keep my trip" / "Start fresh" dialog
- [ ] Implement data migration logic (keep new trip only, delete Slovakia demo)
- [ ] Auto-delete all data after 8 days if no action
- [ ] Connect dialogs to backend procedures

### Phase 6: Digital Signature Agreement
- [x] Create SignatureAgreement component with canvas signature pad
- [x] Add placeholder text for agreement (user will provide later)
- [x] Implement signature capture and save
- [x] Integrate signature dialog into upgrade flow
- [ ] Show payment instructions after signature (Bit/Paybox - details TBD)
- [ ] Manual admin approval flow to convert demo→full user
- [ ] Backend procedures for upgrade request

### Phase 7: Testing
- [ ] Test complete demo flow from /demo to upgrade
- [ ] Test trip creation limits
- [ ] Test expiration warnings and countdown
- [ ] Test data migration (keep vs delete)
- [ ] Test signature capture
