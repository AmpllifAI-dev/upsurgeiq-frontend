import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeAlertScheduler } from "../alertScheduler";
import { initializeDefaultThresholds } from "../costAlertChecker";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Stripe webhook MUST be registered BEFORE express.json() for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const { handleStripeWebhook } = await import("../webhooks/stripe");
      await handleStripeWebhook(req, res);
    }
  );
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  
  // SendGrid webhook for email event tracking
  app.post("/api/sendgrid/webhook", async (req, res) => {
    const { handleSendGridWebhook } = await import("../sendgridWebhook");
    await handleSendGridWebhook(req, res);
  });
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Social media OAuth routes
  const oauthRoutes = (await import("../oauthRoutes")).default;
  app.use("/api/oauth", oauthRoutes);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Initialize default alert thresholds (only runs once)
    initializeDefaultThresholds().catch(console.error);
    
    // Initialize credit alert scheduler
    initializeAlertScheduler();
    
    // Initialize usage notifications job (daily at 9 AM)
    import("../jobs/usageNotificationsJob").catch(console.error);
    
    // Initialize scheduled press release publishing job (every 5 minutes)
    import("../jobs/publishScheduledReleases").then(module => {
      module.startScheduledPublishingJob();
    }).catch(console.error);
    
    // Initialize workflow automation engine (every 5 minutes)
    import("../workflowEngine").then(module => {
      setInterval(() => {
        module.processDueWorkflowEmails().catch(console.error);
      }, 5 * 60 * 1000); // Every 5 minutes
      
      // Run immediately on startup
      module.processDueWorkflowEmails().catch(console.error);
    }).catch(console.error);
  });
}

startServer().catch(console.error);
