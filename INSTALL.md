TECUMP 2026 UI + Dynamic Media Update

Replace these files in your project:

FRONTEND
src/pages/HomePage.tsx
src/pages/EventsPage.tsx
src/pages/GalleryPage.tsx
src/layouts/PublicLayout.tsx
src/components/EventsProgrammesAdmin.tsx
src/features/events/events.api.ts
src/features/gallery/gallery.api.ts
src/index.css

BACKEND
backend/src/modules/events/interfaces/events.interface.ts
backend/src/modules/events/repositories/events.repository.ts
backend/src/modules/events/controllers/events.controller.ts
backend/src/modules/events/routes/events.routes.ts
backend/src/modules/gallery/gallery.routes.ts
backend/src/modules/gallery/gallery.controller.ts
backend/src/database/migrations/012_event_images.sql

What this update does:
- New more alive, high-contrast landing page with a much larger hero.
- Removes the Featured Ministries section from the homepage.
- Upcoming Events is a floating glassmorphism panel and shows only the first 5 future published events.
- Event cards use the administrator-selected cover image when one exists.
- Admins can upload JPG/PNG/WEBP event cover photos from the New/Edit Event modal.
- Event images are stored as /uploads/... and saved in the event record.
- Latest Gallery on the homepage is fully database-driven. It remains empty until an administrator publishes a gallery album.
- Added a public published-gallery endpoint so the homepage can read current gallery albums without requiring login.
- No hard-coded event or gallery cards are used on the homepage/events page.

Important:
- The new database migration 012_event_images.sql must run on the backend database. This project already runs numbered migrations at startup, so redeploying the backend should apply it if your migration runner is enabled.
- Event uploads are stored in backend/public/uploads. On Railway, local container storage is ephemeral unless you attach persistent storage. For permanent media across redeploys, use a Railway volume or object storage later.

Build after replacing:
npm run build

Then commit:
git add src backend/src/database/migrations/012_event_images.sql
git commit -m "Redesign public UI and add dynamic event media"
git push origin main
