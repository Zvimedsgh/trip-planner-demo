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
