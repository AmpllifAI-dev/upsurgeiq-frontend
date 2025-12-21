# Architectural Decisions & Conventions

This document tracks key architectural decisions, integration patterns, and conventions for the UpsurgeIQ project to maintain consistency and prevent contradictory implementations.

---

## Content Management

### Blog System
**Decision:** Use WordPress as the blog CMS instead of custom database tables  
**Rationale:** Leverage existing WordPress infrastructure, better content management experience, SEO plugins, media management  
**Implementation:**
- WordPress site: https://amplifai.wpenginepowered.com
- REST API access via: `index.php?rest_route=/wp/v2/posts` (WP Engine requirement)
- Authentication: Application Password for AmplifAI-dev@thealchemyexperience.co.uk
- UpsurgeIQ blog page fetches content from WordPress REST API
- Blog posts managed entirely in WordPress admin

**Related Files:**
- `server/wordpress.ts` - WordPress API integration helpers
- `client/src/pages/Blog.tsx` - Blog listing page (fetches from WordPress)
- `client/src/pages/BlogPost.tsx` - Individual blog post display

---

## Hosting & Deployment

### WordPress Hosting
**Provider:** WP Engine  
**Site URL:** https://amplifai.wpenginepowered.com  
**Admin Access:** AmplifAI-dev@thealchemyexperience.co.uk (Administrator role)

**Important Notes:**
- WP Engine requires `index.php?rest_route=` format for REST API (not `/wp-json/`)
- Trailing slashes are important for permalink structure: `/sample-post/`
- REST API requires Application Password authentication (not main password)

---

## Legal Information

### Company Details
**Legal Name:** Life's Passions Ltd  
**Address:** Sanders Gate, Churchfields, Stonesfield, Witney, Oxfordshire, OX29 8PP, UK  

**Used In:**
- Privacy Policy page
- Terms of Service page
- Cookie Policy page
- Footer copyright notices

---

## Design System

### Color Palette
**Primary:** Deep Teal (#008080)  
**Accent:** Lime Green (#7FFF00)  
**Typography:** Inter/Poppins (modern sans-serif)

### Layout Patterns
**Public Pages:** Custom navigation (top nav, hamburger menu on mobile)  
**Internal Tools/Dashboards:** DashboardLayout with sidebar navigation  

**Hamburger Menu:** Must appear on all public-facing pages (Home, Subscribe, Upgrade, About, Contact, Blog, etc.)

---

## SEO Standards

### Meta Tags
**Rule:** All public pages MUST include SEO meta tags from the start  
**Implementation:** Use `<SEO />` component from `client/src/components/SEO.tsx`  
**Required Fields:**
- title
- description  
- og:title, og:description, og:image
- twitter:card, twitter:title, twitter:description

**Affected Pages:** Home, About, Contact, Blog, Testimonials, Pricing Calculator, FAQ, Status, Resources

---

## URL Structure & Permalinks

### WordPress Permalinks
**Standard:** Trailing slash format (`/sample-post/`)  
**Rationale:** SEO consistency, avoid duplicate content issues, match WordPress defaults

### UpsurgeIQ Routes
**Convention:** No trailing slashes for React routes (`/dashboard`, `/blog`, `/about`)

---

## Authentication & User Management

### User Roles
- `admin` - Full platform access, can manage all content and users
- `user` - Standard subscriber access
- `partner` - White-label partner access (20% commission tracking)

**Role Field:** `user.role` in database (enum: 'admin' | 'user' | 'partner')  
**Usage:** Check `ctx.user.role` in tRPC procedures for admin-only operations

---

## Payment & Subscriptions

### Stripe Configuration
**Environment:** Test mode (sandbox)  
**Product IDs:**
- Starter (£49): `prod_Td2pC4hUddBbAH` / `price_1SfmjyAGfyqPBnQ9JPZoNoWl`
- Pro (£99): `prod_Td2sl51moqbe4C` / `price_1SfmmWAGfyqPBnQ9LeAJ711i`
- Scale (£349): `prod_Td2tuhKJPQ41d8` / `price_1SfmnuAGfyqPBnQ9U5P7KfF4`

**Configured In:** `server/products.ts`

---

## File Storage

### S3 Integration
**Rule:** Use S3 as single source of truth for all file storage  
**Implementation:** `storagePut()` and `storageGet()` from `server/storage.ts`  
**Never:** Store file bytes in database columns (BLOB/BYTEA)  
**Database:** Store only metadata (URL, file key, mime type, size, owner)

---

## Database Migrations

### Drizzle ORM
**Command:** `pnpm db:push` to push schema changes  
**Schema:** `drizzle/schema.ts`  
**Note:** Drizzle may prompt interactively for column creation - use `yes ''` for automation if needed

---

## React Best Practices

### Hooks Rules
**Critical:** All hooks MUST be called before any conditional returns  
**Example Error:** "Rendered more hooks than during the previous render"  
**Solution:** Move `useMutation`, `useQuery`, etc. to top of component

### Infinite Loading Loops
**Problem:** Creating new objects/arrays in render that are used as query inputs  
**Solution:** Stabilize references with `useState` or `useMemo`

```tsx
// ❌ Bad: New Date() creates new reference every render
const { data } = trpc.items.getByDate.useQuery({ date: new Date() });

// ✅ Good: Initialize once with useState
const [date] = useState(() => new Date());
const { data } = trpc.items.getByDate.useQuery({ date });
```

---

## Third-Party Integrations

### WordPress REST API
**URL Format:** `https://amplifai.wpenginepowered.com/index.php?rest_route=/wp/v2/posts`  
**Authentication:** Basic Auth with Application Password  
**User:** AmplifAI-dev@thealchemyexperience.co.uk  
**Password:** Stored in `/home/ubuntu/wordpress-app-password.txt` (not committed to git)

### Social Media OAuth
- Facebook: Configured
- Instagram: Configured  
- LinkedIn: Configured
- X (Twitter): Removed per user preference

---

## Future Roadmap (V2)

### Planned Features
1. **Testimonials Section:** Showcase customer success stories (waiting for initial users)
2. **Newsletter System:** Email newsletter for captured leads
3. **Website Builder for Small Businesses:** Simple, cheap websites with add-on tools, domain setup, full communications agency offering

**Documented In:** `ROADMAP_V2.md`

---

## Development Workflow

### Todo Tracking
**File:** `todo.md` at project root  
**Format:** Flat list with markdown checkboxes  
**Convention:**
- `[ ]` for pending tasks
- `[x]` for completed tasks  
- Never delete items (keep as history)
- Review before each checkpoint

### Checkpoints
**Rule:** Save checkpoint after completing features, before risky operations  
**Command:** `webdev_save_checkpoint`  
**Recovery:** `webdev_rollback_checkpoint` (never use `git reset --hard`)

---

## Testing Standards

### Vitest Tests
**Required For:** web-db-user features  
**Location:** `server/*.test.ts`  
**Reference:** `server/auth.logout.test.ts`  
**Convention:** Always review/write/update unit tests before delivering features

---

*Last Updated: December 21, 2025*
