# Security Specification - Pedago

## Data Invariants
1. A user document must exist in `/users/{uid}` before a teacher or school profile can be created at the matching ID.
2. A user can only set their role once (immutable role or restricted access).
3. `teachers` collection allows listing for users with `role == 'school'`.
4. `teachers` profiles must be valid according to the schema (string sizes, types).

## The Dirty Dozen Payloads (Rejection Tests)
1. **Identity Theft**: Creating a teacher profile with a different UID than `request.auth.uid`.
2. **Role Pumping**: Authenticated user trying to set their own role to 'admin' (if exists) or switching from 'teacher' to 'school'.
3. **Ghost Profile**: Creating a teacher profile without a corresponding `users` document.
4. **Data Injection**: Injecting a 2MB string into the `fullName` field of a teacher profile.
5. **PII Leak**: A teacher trying to list other teachers' private phone numbers (if restricted, though here schools need them).
6. **Cross-Tenant Write**: A school director trying to edit a teacher's CV.
7. **Type Poisoning**: Sending `yearsOfExperience` as a boolean.
8. **Orphaned Write**: Deleting the `users` role document while keeping the profile active.
9. **Query Scraping**: Anonymous user trying to list all teachers.
10. **Malicious ID**: Using a 1KB string as a document ID.
11. **Shadow Update**: Adding a field `isVerified: true` to a teacher profile during update.
12. **Timestamp Forgery**: Providing a `createdAt` date from 2020 instead of `request.time`.

## Test Runner logic
The `firestore.rules.test.ts` will verify these rejections.
