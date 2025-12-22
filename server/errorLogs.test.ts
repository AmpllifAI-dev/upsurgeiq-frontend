import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("errorLogs.list", () => {
  it("allows admin to view error logs", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.errorLogs.list({ limit: 10 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("prevents non-admin users from viewing error logs", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.errorLogs.list({ limit: 10 })).rejects.toThrow(
      "Only admins can view error logs"
    );
  });

  it("supports filtering by log level", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.errorLogs.list({ level: "error", limit: 10 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("supports filtering by component", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.errorLogs.list({ 
      component: "Authentication", 
      limit: 10 
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("errorLogs.stats", () => {
  it("allows admin to view error statistics", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.errorLogs.stats();

    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("byLevel");
    expect(result).toHaveProperty("byComponent");
    expect(typeof result.total).toBe("number");
    expect(typeof result.byLevel).toBe("object");
    expect(typeof result.byComponent).toBe("object");
  });

  it("prevents non-admin users from viewing error statistics", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.errorLogs.stats()).rejects.toThrow(
      "Only admins can view error stats"
    );
  });
});

describe("Logger utility", () => {
  it("creates logger with component name", async () => {
    const { createLogger } = await import("./_core/logger");
    
    const logger = createLogger("TestComponent");
    
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("logs messages without throwing errors", async () => {
    const { createLogger } = await import("./_core/logger");
    
    const logger = createLogger("TestComponent");
    
    // These should not throw
    expect(() => logger.info("Test info message")).not.toThrow();
    expect(() => logger.warn("Test warning message")).not.toThrow();
    expect(() => logger.error("Test error message", new Error("Test error"))).not.toThrow();
    expect(() => logger.debug("Test debug message")).not.toThrow();
  });
});
