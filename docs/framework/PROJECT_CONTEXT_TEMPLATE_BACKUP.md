# Project Context

**Project Name:** [NAME]  
**Client:** [CLIENT NAME]  
**Start Date:** [DATE]  
**Status:** [Active/Planning/On Hold/Complete]

---

## Project Purpose

### The Problem

[Describe the problem this project solves. Be specific about pain points, inefficiencies, or unmet needs.]

### The Solution

[Describe how this project addresses the problem. What does it do? How does it work?]

### Target Users

[Who will use this? What are their characteristics, needs, and behaviors?]

### Value Proposition

[What makes this solution valuable? Why would someone choose this over alternatives?]

---

## Goals and Success Criteria

### Primary Goals

1. **[Goal #1]**
   - Success Metric: [How we measure this]
   - Target: [Specific target]

2. **[Goal #2]**
   - Success Metric: [How we measure this]
   - Target: [Specific target]

3. **[Goal #3]**
   - Success Metric: [How we measure this]
   - Target: [Specific target]

### Secondary Goals

- [Secondary goal #1]
- [Secondary goal #2]
- [Secondary goal #3]

### What "Done" Looks Like

[Describe the end state. What will exist when this project is complete?]

---

## Technical Architecture

### High-Level Overview

[Describe the system architecture at a high level. What are the major components and how do they interact?]

```
[Consider adding an architecture diagram here]

Example:
Frontend (React) <--> API (Node.js/Express) <--> Database (PostgreSQL)
                          |
                          v
                    External Services (Stripe, SendGrid, etc.)
```

### Technology Stack

**Frontend:**
- Framework: [e.g., React 19]
- Styling: [e.g., Tailwind CSS 4]
- State Management: [e.g., tRPC, React Query]
- Build Tool: [e.g., Vite]

**Backend:**
- Runtime: [e.g., Node.js 22]
- Framework: [e.g., Express 4, tRPC 11]
- Language: [e.g., TypeScript]
- API Style: [e.g., REST, GraphQL, tRPC]

**Database:**
- Type: [e.g., PostgreSQL, MySQL, MongoDB]
- ORM/Query Builder: [e.g., Drizzle, Prisma]
- Hosting: [e.g., AWS RDS, Supabase]

**Infrastructure:**
- Hosting: [e.g., Vercel, AWS, Railway]
- CI/CD: [e.g., GitHub Actions]
- Monitoring: [e.g., Sentry, LogRocket]

**External Services:**
- Authentication: [e.g., OAuth, Auth0]
- Payments: [e.g., Stripe]
- Email: [e.g., SendGrid]
- Storage: [e.g., S3]
- [Other services]

### Why These Technologies?

**[Technology #1]:** [Rationale for choosing this]

**[Technology #2]:** [Rationale for choosing this]

**[Technology #3]:** [Rationale for choosing this]

### Key Technical Decisions

[Document major technical decisions that shape the architecture]

**Decision:** [e.g., "Use tRPC instead of REST"]  
**Rationale:** [Why this was chosen]  
**Tradeoffs:** [What we gave up by choosing this]

---

## Data Model

### Core Entities

[List the main data entities in the system]

**[Entity #1]:**
- Purpose: [What this represents]
- Key Attributes: [Main fields]
- Relationships: [How it relates to other entities]

**[Entity #2]:**
- Purpose: [What this represents]
- Key Attributes: [Main fields]
- Relationships: [How it relates to other entities]

### Data Flow

[Describe how data moves through the system]

Example:
1. User submits form
2. Frontend validates input
3. API receives request
4. Business logic processes data
5. Database stores result
6. Response sent to frontend
7. UI updates

---

## Key Features

### Must-Have Features (MVP)

1. **[Feature #1]**
   - Description: [What it does]
   - User Value: [Why it matters]
   - Status: [Planned/In Progress/Complete]

2. **[Feature #2]**
   - Description: [What it does]
   - User Value: [Why it matters]
   - Status: [Planned/In Progress/Complete]

3. **[Feature #3]**
   - Description: [What it does]
   - User Value: [Why it matters]
   - Status: [Planned/In Progress/Complete]

### Nice-to-Have Features (Post-MVP)

- [Feature #1]
- [Feature #2]
- [Feature #3]

### Out of Scope

[Things that are explicitly NOT part of this project]

- [Out of scope item #1]
- [Out of scope item #2]

---

## Constraints and Limitations

### Technical Constraints

- [Constraint #1: e.g., "Must support IE11"]
- [Constraint #2: e.g., "API response time must be <200ms"]
- [Constraint #3: e.g., "Must work offline"]

### Business Constraints

- **Budget:** [Budget limitations]
- **Timeline:** [Timeline constraints]
- **Resources:** [Team size, skill limitations]

### Regulatory/Compliance

- [Compliance requirement #1: e.g., "GDPR compliance required"]
- [Compliance requirement #2: e.g., "HIPAA compliance required"]

### Known Limitations

[Things the system won't do or can't do]

- [Limitation #1]
- [Limitation #2]

---

## Integration Points

### External Systems

**[System #1]:**
- Purpose: [Why we integrate with this]
- Integration Method: [API, Webhook, etc.]
- Data Exchanged: [What data flows between systems]

**[System #2]:**
- Purpose: [Why we integrate with this]
- Integration Method: [API, Webhook, etc.]
- Data Exchanged: [What data flows between systems]

### Authentication/Authorization

- **Method:** [e.g., OAuth 2.0, JWT]
- **Provider:** [e.g., Auth0, Custom]
- **Roles:** [User roles and permissions]

---

## Security Considerations

### Authentication

[How users prove who they are]

### Authorization

[How the system controls what users can do]

### Data Protection

[How sensitive data is protected]

- Encryption: [At rest, in transit]
- PII Handling: [How personally identifiable information is managed]
- Secrets Management: [How API keys, passwords are stored]

### Compliance

[Relevant security standards or regulations]

---

## Performance Requirements

### Response Time

- **API Endpoints:** [Target response time]
- **Page Load:** [Target load time]
- **Database Queries:** [Target query time]

### Scalability

- **Expected Users:** [Concurrent users the system should support]
- **Data Volume:** [Expected data growth]
- **Traffic Patterns:** [Peak usage times, seasonal variations]

### Availability

- **Uptime Target:** [e.g., 99.9%]
- **Maintenance Windows:** [When downtime is acceptable]

---

## Development Workflow

### Environments

- **Local:** [Local development setup]
- **Development:** [Dev environment URL and purpose]
- **Staging:** [Staging environment URL and purpose]
- **Production:** [Production environment URL]

### Branching Strategy

[How branches are used]

Example:
- `main` - Production code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes

### Deployment Process

[How code gets from development to production]

1. [Step 1]
2. [Step 2]
3. [Step 3]

---

## Timeline and Milestones

### Key Milestones

**[Milestone #1]:** [Date]
- [Deliverable]
- [Deliverable]

**[Milestone #2]:** [Date]
- [Deliverable]
- [Deliverable]

**[Milestone #3]:** [Date]
- [Deliverable]
- [Deliverable]

### Current Phase

**Phase:** [Discovery/Planning/Development/Testing/Launch/Maintenance]

**Started:** [Date]

**Expected Completion:** [Date]

**Progress:** [Brief status update]

---

## Team and Stakeholders

### Project Team

- **Project Manager:** [Name]
- **Lead Developer:** [Name]
- **Designer:** [Name]
- **QA:** [Name]
- **[Other roles]**

### Stakeholders

- **Client Contact:** [Name and role]
- **End Users:** [Who they are]
- **Other Stakeholders:** [Anyone else with interest in the project]

---

## Resources and References

### Documentation

- **API Documentation:** [Link]
- **Design System:** [Link]
- **User Guides:** [Link]

### External Resources

- **Framework Docs:** [Link]
- **Library Docs:** [Link]
- **Tutorials:** [Link]

### Project Management

- **Task Board:** [Link to Jira, Trello, etc.]
- **Repository:** [Link to GitHub, GitLab, etc.]
- **Communication:** [Link to Slack, Discord, etc.]

---

## Glossary

**[Term #1]:** [Definition]

**[Term #2]:** [Definition]

**[Term #3]:** [Definition]

---

## Change Log

### [Date]
- [Change description]

### [Date]
- [Change description]

---

**This document should be updated whenever:**
- Project scope changes
- Major technical decisions are made
- New constraints are discovered
- Architecture evolves

**Last Updated:** [DATE]  
**Updated By:** [NAME]
