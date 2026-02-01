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
