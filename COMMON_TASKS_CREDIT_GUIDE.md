# Common Tasks AI Credit Guide
**Version:** 1.0  
**Last Updated:** December 21, 2024  
**Purpose:** Standard AI credit estimates for recurring web development tasks

---

## How to Use This Guide

This document provides **time-based AI credit estimates** for common development tasks. Each task includes:
- **Base time** (straightforward implementation)
- **AI credits** (1 credit ≈ 1 minute)
- **Complexity variants** (simple/medium/complex)
- **Real-world examples** from actual projects

**Formula:** `Total Credits = Base Credits × Complexity + Overhead (50%)`

---

## Table of Contents

1. [Project Setup & Infrastructure](#project-setup--infrastructure)
2. [Database Operations](#database-operations)
3. [Backend/API Development](#backendapi-development)
4. [Frontend Components](#frontend-components)
5. [Authentication & Authorization](#authentication--authorization)
6. [Third-Party Integrations](#third-party-integrations)
7. [Testing & Quality Assurance](#testing--quality-assurance)
8. [Deployment & DevOps](#deployment--devops)
9. [Project Management](#project-management)

---

## Project Setup & Infrastructure

### Initial Project Scaffolding

| Task | Base Time | AI Credits | Complexity | Notes |
|------|-----------|------------|------------|-------|
| **Create new React project** | 5 min | 8 | Low | Using Vite/CRA |
| **Set up TypeScript config** | 3 min | 5 | Low | tsconfig.json |
| **Configure Tailwind CSS** | 5 min | 8 | Low | Install + config |
| **Set up ESLint/Prettier** | 5 min | 8 | Low | Code quality tools |
| **Initialize Git repository** | 2 min | 3 | Low | .gitignore setup |
| **Set up folder structure** | 5 min | 8 | Low | Components, pages, utils |
| **Configure environment variables** | 3 min | 5 | Low | .env setup |
| **Set up package.json scripts** | 3 min | 5 | Low | Build, dev, test scripts |

**Total for Basic Project Setup:** ~50 AI credits (33 min base + 50% overhead)

---

### Backend Server Setup

| Task | Base Time | AI Credits | Complexity | Notes |
|------|-----------|------------|------------|-------|
| **Express server initialization** | 8 min | 12 | Low | Basic server.js |
| **tRPC setup with routers** | 12 min | 18 | Medium | Type-safe APIs |
| **CORS & middleware config** | 5 min | 8 | Low | Security headers |
| **Error handling middleware** | 8 min | 12 | Medium | Global error handler |
| **Logging setup (Winston/Pino)** | 10 min | 15 | Medium | Structured logging |
| **Rate limiting** | 8 min | 12 | Medium | Prevent abuse |
| **Request validation** | 10 min | 15 | Medium | Zod/Joi schemas |

**Total for Backend Setup:** ~92 AI credits (61 min base + 50% overhead)

---

## Database Operations

### Schema Design & Setup

| Task | Base Time | AI Credits | Complexity | Examples |
|------|-----------|------------|------------|----------|
| **Single table creation** | 5 min | 8 | Low | Users, posts |
| **Table with relations (1-2)** | 10 min | 15 | Medium | User → posts |
| **Complex schema (5+ tables)** | 30 min | 45 | High | E-commerce catalog |
| **Add indexes** | 3 min | 5 | Low | Per index |
| **Add foreign keys** | 5 min | 8 | Low | Per relationship |
| **Enum/custom types** | 5 min | 8 | Low | Status enums |

**Real Example from UpsurgeIQ:**
- Added 5 white-label columns: 10 min = **15 AI credits**

---

### Database Migrations

| Task | Base Time | AI Credits | Complexity | Notes |
|------|-----------|------------|------------|-------|
| **Simple column addition** | 5 min | 8 | Low | Using ORM |
| **Column with data migration** | 15 min | 23 | Medium | Transform existing data |
| **Table rename/restructure** | 20 min | 30 | High | Risky operation |
| **Add/modify constraints** | 8 min | 12 | Medium | NOT NULL, UNIQUE |
| **Rollback migration** | 10 min | 15 | Medium | Undo changes |

**Best Practice:** Use direct SQL via webdev_execute_sql to save ~30% time vs. interactive migrations.

---

### Query Development

| Task | Base Time | AI Credits | Complexity | Examples |
|------|-----------|------------|------------|----------|
| **Simple SELECT query** | 3 min | 5 | Low | Get by ID |
| **JOIN query (2-3 tables)** | 8 min | 12 | Medium | User + posts + comments |
| **Complex aggregation** | 15 min | 23 | High | Analytics queries |
| **Full-text search** | 12 min | 18 | Medium | Search implementation |
| **Pagination logic** | 8 min | 12 | Medium | Offset/cursor based |
| **Query optimization** | 20 min | 30 | High | Indexes, explain plans |

**Real Example from UpsurgeIQ:**
- CSV export queries (4 types): 25 min = **38 AI credits**

---

## Backend/API Development

### CRUD Operations

| Task | Base Time | AI Credits | Complexity | Notes |
|------|-----------|------------|------------|-------|
| **Create endpoint** | 8 min | 12 | Low | POST with validation |
| **Read/List endpoint** | 5 min | 8 | Low | GET with filters |
| **Update endpoint** | 10 min | 15 | Medium | PATCH with validation |
| **Delete endpoint** | 5 min | 8 | Low | Soft/hard delete |
| **Bulk operations** | 15 min | 23 | Medium | Batch create/update |

**Complete CRUD for one resource:** ~66 AI credits (44 min base + 50% overhead)

---

### Business Logic

| Task | Base Time | AI Credits | Complexity | Examples |
|------|-----------|------------|------------|----------|
| **Simple validation** | 5 min | 8 | Low | Email format, required fields |
| **Complex business rules** | 20 min | 30 | High | Multi-step workflows |
| **Data transformation** | 10 min | 15 | Medium | Format conversion |
| **Calculation logic** | 12 min | 18 | Medium | Pricing, discounts |
| **State machine** | 25 min | 38 | High | Order status flow |
| **Background job** | 15 min | 23 | Medium | Async processing |

**Real Example from UpsurgeIQ:**
- Usage notifications logic: 20 min = **30 AI credits**

---

### File Operations

| Task | Base Time | AI Credits | Complexity | Notes |
|------|-----------|------------|------------|-------|
| **File upload endpoint** | 12 min | 18 | Medium | Multipart handling |
| **S3 integration** | 15 min | 23 | Medium | Upload/download |
| **Image processing** | 20 min | 30 | High | Resize, compress |
| **PDF generation** | 25 min | 38 | High | Complex layouts |
| **CSV export** | 12 min | 18 | Medium | Data to CSV |
| **File validation** | 8 min | 12 | Medium | Type, size checks |

**Real Example from UpsurgeIQ:**
- CSV export system (4 types): 40 min = **60 AI credits**

---

## Frontend Components

### Basic UI Components

| Task | Base Time | AI Credits | Complexity | Examples |
|------|-----------|------------|------------|----------|
| **Button component** | 3 min | 5 | Low | With variants |
| **Input field** | 5 min | 8 | Low | Text, number, etc. |
| **Dropdown/Select** | 8 min | 12 | Medium | With search |
| **Modal/Dialog** | 10 min | 15 | Medium | Overlay, close logic |
| **Card component** | 5 min | 8 | Low | Container with styling |
| **Badge/Chip** | 3 min | 5 | Low | Status indicators |
| **Tooltip** | 5 min | 8 | Low | Hover info |
| **Loading spinner** | 3 min | 5 | Low | Animation |

**Using shadcn/ui:** Reduce time by 40% (pre-built, just customize)

---

### Form Components

| Task | Base Time | AI Credits | Complexity | Notes |
|------|-----------|------------|------------|-------|
| **Simple form (3-5 fields)** | 15 min | 23 | Medium | Name, email, message |
| **Complex form (10+ fields)** | 35 min | 53 | High | Multi-section |
| **Form validation** | 10 min | 15 | Medium | Client-side rules |
| **Multi-step form** | 40 min | 60 | High | Wizard with progress |
| **File upload form** | 20 min | 30 | High | Drag-drop, preview |
| **Dynamic fields** | 25 min | 38 | High | Add/remove inputs |

**Real Example from UpsurgeIQ:**
- White-label settings form: 25 min = **38 AI credits**

---

### Data Display Components

| Task | Base Time | AI Credits | Complexity | Examples |
|------|-----------|------------|------------|----------|
| **Simple table** | 12 min | 18 | Medium | Rows and columns |
| **Sortable table** | 20 min | 30 | High | Click headers to sort |
| **Filterable table** | 25 min | 38 | High | Search, filters |
| **Paginated table** | 18 min | 27 | Medium | Page controls |
| **Data grid (full-featured)** | 45 min | 68 | High | Sort, filter, page, export |
| **Chart (simple)** | 15 min | 23 | Medium | Bar, line, pie |
| **Dashboard widget** | 20 min | 30 | High | Stats + visualization |

**Real Example from UpsurgeIQ:**
- Usage tracking dashboard: 20 min = **30 AI credits**

---

### Page Components

| Task | Base Time | AI Credits | Complexity | Notes |
|------|-----------|------------|------------|-------|
| **Static landing page** | 20 min | 30 | Medium | Hero, features, CTA |
| **List page with filters** | 30 min | 45 | High | Table + search + filters |
| **Detail/View page** | 20 min | 30 | Medium | Show single item |
| **Edit page** | 25 min | 38 | High | Form + save logic |
| **Dashboard page** | 35 min | 53 | High | Multiple widgets |
| **Settings page** | 30 min | 45 | High | Tabs, forms, save |

**Real Example from UpsurgeIQ:**
- Billing history page: 30 min = **45 AI credits**

---

## Authentication & Authorization

### Auth Implementation

| Task | Base Time | AI Credits | Complexity | Notes |
|------|-----------|------------|------------|-------|
| **OAuth integration** | 45 min | 68 | High | Google, GitHub, etc. |
| **JWT implementation** | 30 min | 45 | High | Token generation, validation |
| **Session management** | 25 min | 38 | High | Cookie handling |
| **Password hashing** | 10 min | 15 | Medium | bcrypt/argon2 |
| **Login page** | 20 min | 30 | Medium | Form + validation |
| **Registration page** | 25 min | 38 | High | Form + email verification |
| **Password reset flow** | 40 min | 60 | High | Email + token + reset |
| **Protected routes** | 12 min | 18 | Medium | Route guards |

**Complete Auth System:** ~300 AI credits (200 min base + 50% overhead)

---

### Role-Based Access Control

| Task | Base Time | AI Credits | Complexity | Examples |
|------|-----------|------------|------------|----------|
| **Add role field to user** | 5 min | 8 | Low | admin/user enum |
| **Role check middleware** | 10 min | 15 | Medium | Backend protection |
| **Frontend role guards** | 12 min | 18 | Medium | Conditional rendering |
| **Permission system** | 35 min | 53 | High | Granular permissions |
| **Admin panel access** | 15 min | 23 | Medium | Role-gated routes |

**Real Example from UpsurgeIQ:**
- Admin-only white-label settings: 15 min = **23 AI credits**

---

## Third-Party Integrations

### Payment Processing

| Task | Base Time | AI Credits | Complexity | Provider |
|------|-----------|------------|------------|----------|
| **Stripe setup** | 20 min | 30 | High | API keys, webhooks |
| **Checkout session** | 25 min | 38 | High | Create payment |
| **Subscription management** | 40 min | 60 | High | Plans, billing |
| **Invoice retrieval** | 15 min | 23 | Medium | List invoices |
| **Webhook handling** | 30 min | 45 | High | Event processing |
| **Payment methods** | 20 min | 30 | High | Add/remove cards |

**Real Example from UpsurgeIQ:**
- Invoice/billing system: 40 min = **60 AI credits**

**Complete Stripe Integration:** ~240 AI credits (160 min base + 50% overhead)

---

### Email Services

| Task | Base Time | AI Credits | Complexity | Provider |
|------|-----------|------------|------------|----------|
| **SendGrid setup** | 10 min | 15 | Medium | API key config |
| **Simple email send** | 8 min | 12 | Medium | Transactional |
| **Email template** | 15 min | 23 | Medium | HTML template |
| **Bulk email** | 20 min | 30 | High | Batch sending |
| **Email tracking** | 25 min | 38 | High | Opens, clicks |

---

### Cloud Storage

| Task | Base Time | AI Credits | Complexity | Provider |
|------|-----------|------------|------------|----------|
| **AWS S3 setup** | 12 min | 18 | Medium | Credentials, bucket |
| **File upload to S3** | 15 min | 23 | Medium | Presigned URLs |
| **File download from S3** | 10 min | 15 | Medium | Get object |
| **Delete from S3** | 8 min | 12 | Medium | Remove object |
| **List S3 objects** | 10 min | 15 | Medium | Pagination |

**Real Example from UpsurgeIQ:**
- S3 helpers already provided in template: 0 min = **0 AI credits** (reuse existing)

---

### Maps & Location

| Task | Base Time | AI Credits | Complexity | Provider |
|------|-----------|------------|------------|----------|
| **Google Maps setup** | 15 min | 23 | Medium | API key, component |
| **Display map** | 10 min | 15 | Medium | Basic map view |
| **Add markers** | 12 min | 18 | Medium | Custom pins |
| **Geocoding** | 15 min | 23 | Medium | Address → coordinates |
| **Directions** | 20 min | 30 | High | Route calculation |
| **Places search** | 18 min | 27 | Medium | Autocomplete |

---

### AI/LLM Integration

| Task | Base Time | AI Credits | Complexity | Provider |
|------|-----------|------------|------------|----------|
| **OpenAI setup** | 10 min | 15 | Medium | API key config |
| **Simple completion** | 12 min | 18 | Medium | Chat endpoint |
| **Streaming response** | 20 min | 30 | High | SSE implementation |
| **Function calling** | 25 min | 38 | High | Tool use |
| **Embeddings** | 15 min | 23 | Medium | Vector generation |
| **Image generation** | 18 min | 27 | Medium | DALL-E integration |

---

## Testing & Quality Assurance

### Unit Testing

| Task | Base Time | AI Credits | Complexity | Framework |
|------|-----------|------------|------------|-----------|
| **Test setup (Vitest/Jest)** | 10 min | 15 | Medium | Config files |
| **Simple function test** | 5 min | 8 | Low | Pure functions |
| **API endpoint test** | 12 min | 18 | Medium | Mock requests |
| **Component test** | 15 min | 23 | Medium | React Testing Library |
| **Integration test** | 20 min | 30 | High | Multiple modules |
| **Mock setup** | 8 min | 12 | Medium | External services |

**Real Example from UpsurgeIQ:**
- Billing tests (5 tests): 15 min = **23 AI credits**

---

### E2E Testing

| Task | Base Time | AI Credits | Complexity | Framework |
|------|-----------|------------|------------|-----------|
| **Playwright setup** | 15 min | 23 | Medium | Install + config |
| **Simple flow test** | 12 min | 18 | Medium | Login, navigate |
| **Form submission test** | 15 min | 23 | Medium | Fill + submit |
| **Complex workflow test** | 30 min | 45 | High | Multi-step process |

---

### Code Quality

| Task | Base Time | AI Credits | Complexity | Notes |
|------|-----------|------------|------------|-------|
| **Fix linting errors** | 5 min | 8 | Low | Per file |
| **TypeScript error fixes** | 10 min | 15 | Medium | Type issues |
| **Refactor for readability** | 20 min | 30 | High | Clean code |
| **Performance optimization** | 30 min | 45 | High | Profiling + fixes |
| **Security audit fixes** | 25 min | 38 | High | Vulnerability patches |

---

## Deployment & DevOps

### CI/CD Setup

| Task | Base Time | AI Credits | Complexity | Platform |
|------|-----------|------------|------------|----------|
| **GitHub Actions workflow** | 20 min | 30 | High | Build + test + deploy |
| **Docker setup** | 25 min | 38 | High | Dockerfile + compose |
| **Environment variables** | 8 min | 12 | Medium | Secrets management |
| **Build optimization** | 15 min | 23 | Medium | Caching, parallelization |

---

### Deployment

| Task | Base Time | AI Credits | Complexity | Platform |
|------|-----------|------------|------------|----------|
| **Vercel deployment** | 10 min | 15 | Medium | Connect repo |
| **AWS deployment** | 35 min | 53 | High | EC2/ECS setup |
| **Database migration** | 15 min | 23 | Medium | Production schema |
| **Domain setup** | 12 min | 18 | Medium | DNS configuration |
| **SSL certificate** | 8 min | 12 | Medium | Let's Encrypt |

**Note:** Manus provides built-in hosting, reducing deployment to ~5 min = **8 AI credits**

---

## Project Management

### Planning & Documentation

| Task | Base Time | AI Credits | Complexity | Notes |
|------|-----------|------------|------------|-------|
| **Initial project plan** | 15 min | 23 | Medium | Feature breakdown |
| **Task breakdown** | 10 min | 15 | Medium | Per major feature |
| **Todo.md creation** | 5 min | 8 | Low | Checklist |
| **Todo.md update** | 2 min | 3 | Low | Per task |
| **README documentation** | 20 min | 30 | High | Setup instructions |
| **API documentation** | 25 min | 38 | High | Endpoints, examples |
| **Code comments** | 10 min | 15 | Medium | Per complex module |

---

### Version Control

| Task | Base Time | AI Credits | Complexity | Notes |
|------|-----------|------------|------------|-------|
| **Checkpoint creation** | 8 min | 12 | Medium | Manus webdev |
| **Git commit** | 2 min | 3 | Low | Standard commit |
| **Branch management** | 5 min | 8 | Low | Create/merge |
| **Rollback** | 10 min | 15 | Medium | Restore previous state |

**Real Example from UpsurgeIQ:**
- Checkpoint with documentation: 10 min = **15 AI credits**

---

## Quick Reference Tables

### By Task Category

| Category | Small Task | Medium Task | Large Task |
|----------|------------|-------------|------------|
| **Database** | 8 credits | 15 credits | 45 credits |
| **Backend API** | 12 credits | 23 credits | 60 credits |
| **Frontend Component** | 8 credits | 30 credits | 68 credits |
| **Integration** | 15 credits | 38 credits | 90 credits |
| **Testing** | 8 credits | 23 credits | 45 credits |
| **Deployment** | 12 credits | 23 credits | 53 credits |

---

### By Complexity Level

| Complexity | Time Range | Credit Range | Examples |
|------------|------------|--------------|----------|
| **Trivial** | 2-5 min | 3-8 | Button, link, text change |
| **Low** | 5-10 min | 8-15 | Simple component, basic query |
| **Medium** | 10-25 min | 15-38 | Form, API endpoint, page |
| **High** | 25-60 min | 38-90 | Integration, complex feature |
| **Very High** | 60-120 min | 90-180 | Complete module, auth system |

---

## Project Estimation Worksheet

### Example: E-Commerce Checkout

| Task | Quantity | Credits Each | Total |
|------|----------|--------------|-------|
| **Database Tables** | | | |
| - Orders table | 1 | 15 | 15 |
| - Order items table | 1 | 15 | 15 |
| - Payment methods table | 1 | 15 | 15 |
| **Backend APIs** | | | |
| - Create order endpoint | 1 | 23 | 23 |
| - Calculate totals logic | 1 | 18 | 18 |
| - Stripe integration | 1 | 60 | 60 |
| **Frontend** | | | |
| - Cart component | 1 | 30 | 30 |
| - Checkout form | 1 | 53 | 53 |
| - Order confirmation page | 1 | 30 | 30 |
| **Testing** | | | |
| - API tests | 3 | 18 | 54 |
| - E2E checkout flow | 1 | 45 | 45 |
| **PM & Docs** | | | |
| - Planning | 1 | 23 | 23 |
| - Documentation | 1 | 30 | 30 |
| - Checkpoints | 2 | 15 | 30 |
| **Subtotal** | | | **441** |
| **Buffer (20%)** | | | **88** |
| **TOTAL** | | | **529 AI credits** |

**Estimated Time:** ~529 minutes = **8.8 hours**

---

## Cost Optimization Tips

### High-Impact Savings

1. **Reuse Existing Components** - Save 40-60% on UI work
   - Example: Using shadcn/ui instead of building from scratch

2. **Leverage Template Features** - Save 100% on already-built features
   - Example: UpsurgeIQ template includes OAuth, S3, LLM helpers

3. **Batch Similar Tasks** - Save 20-30% on context switching
   - Example: Create all database tables in one session

4. **Use Direct SQL for Migrations** - Save 30% vs. interactive tools
   - Example: webdev_execute_sql instead of drizzle-kit prompts

5. **Strategic Testing** - Save 40% by testing critical paths only
   - Example: Test happy path + error cases, skip edge cases

---

## Real-World Project Examples

### UpsurgeIQ Session Breakdown

| Feature | Credits Used | Efficiency |
|---------|--------------|------------|
| Invoice/Billing | 60 | Excellent (Stripe reuse) |
| Usage Dashboard | 30 | Excellent (simple UI) |
| PDF Export | 23 | Excellent (existing lib) |
| CSV Export | 60 | Good (4 export types) |
| Notifications | 53 | Good (cron setup) |
| White Label (Backend) | 60 | Good (DB changes) |
| White Label (Frontend) | 75 | Good (integration) |
| **Total** | **361** | **6 hours actual** |

---

## Conclusion

Use this guide to quickly estimate AI credits for any web development task:

1. **Identify the task type** (database, API, frontend, etc.)
2. **Determine complexity** (low/medium/high)
3. **Look up base credits** in the relevant table
4. **Add 50% overhead** for testing, PM, buffer
5. **Sum all tasks** for total project estimate

**Most Common Tasks:**
- Simple API endpoint: **12 credits**
- Medium complexity page: **45 credits**
- Third-party integration: **60 credits**
- Complete CRUD feature: **100 credits**

**For accurate estimates, track actual time vs. estimates and refine your multipliers over time.**

---

## Version History

- **v1.0 (Dec 21, 2024)** - Initial guide based on UpsurgeIQ session analysis
