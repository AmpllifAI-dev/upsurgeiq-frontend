# Global Rules for UpsurgeIQ Development

## Credits Terminology

**CRITICAL DISTINCTION:**

### CREDITS (Client-Facing)
- **What it means:** Credits that CLIENTS use within the UpsurgeIQ platform
- **Examples:** Press release generation credits, campaign credits, social media post credits
- **Visibility:** ALWAYS visible to customers
- **Usage:** "You have 5 credits remaining this month"

### AI CREDITS (System/Internal)
- **What it means:** Manus AI system credits used for backend AI operations
- **Examples:** LLM API calls, token usage, internal AI processing
- **Visibility:** NEVER show to customers
- **Usage:** Internal tracking only, not customer-facing

**Rule:** When discussing "CREDITS" without qualifier, it ALWAYS refers to client-facing credits. System/Manus AI credits must be explicitly called "AI CREDITS" and never exposed to end users.

---

*Established: December 21, 2024*
