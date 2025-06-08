# **App Name**: Apollo CMS

## Core Features:

- Dashboard View: Dashboard with key metrics (total pages, files, content blocks), Google Analytics iframe integration, and a Keep Notes section for admin tasks. Additionally, incorporates interactive charts displaying content creation trends and user engagement, providing a more dynamic overview of CMS activity. Includes a 'Recent Activity' feed showing latest edits and updates.
- Page Management: Page management: Create, edit, and delete pages with automatic slug generation, duplication, and search. Includes a preview button to see live page state.
- Content Files (Modules): Content file (module) management: Attach to any page, define schema, add content blocks, and view stats (# of blocks, last updated).
- Schema Builder: Dynamic schema creation: Define content file schemas with various field types (string, number, boolean, timestamp, array, object) and validations (required, max length, regex, default values). Optionally use Schema Templates.
- Content Blocks: Content block management: Add, edit, delete blocks with dynamic form generation from schema. Includes block versioning and draft/publish toggle.
- Media Manager: Media manager: Upload images, videos, PDFs with auto thumbnail, resize, and tag. This tool scans for broken/slow/large media. Attach media to block fields easily.
- Access Control: Role-based access control: Implement user roles (admin, editor, viewer) with permissions per section (e.g., schema edit restricted to Admin) and Firebase-based auth integration.
- Audit Logs: Audit trails: Track who changed what, and when. Show changes on each block/page/file and filter by user, date, type of change.
- Multi-Versioning Support for Content Files: Ability to view and restore prior versions of content files, not just blocks.
- Live Component Previews: An iframe or sandbox area where selected block renders using schema rules.
- Global Search + Filtering System: Fuzzy search across pages, blocks, media, and schema. Filter by tags, type, published/draft status.
- Global Settings Section: Centralized control for Branding (logo, favicon), SEO meta defaults, Schema templates management, Default roles & permissions.
- Form Builder Integration: Form builder using schema logic. Storage of responses in Firestore or export as CSV.
- Analytics Summary Tiles: Custom GA Data API fetch for metrics like: Most visited pages and Bounce rate

## Style Guidelines:

- Left sidebar, collapsible, breadcrumb navigation.
- Inter (sans-serif) + fluid type scale.
- Tabler Icons or Heroicons for uniformity.
- CSS transitions on save, edit, collapse.
- Soft, desaturated blue (#94B4C7) to convey trust and stability, complementing the scientific theme.
- Light gray (#F0F4F7) for a clean and modern interface, providing a neutral backdrop for content.
- Warm coral (#FF7F50) to highlight interactive elements and calls to action, creating a friendly user experience.