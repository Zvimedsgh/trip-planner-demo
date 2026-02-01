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
