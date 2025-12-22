/**
 * Workflow Automation Engine
 * 
 * Handles automatic enrollment of subscribers into workflows
 * and scheduled sending of workflow step emails based on delays
 */

import { getDb } from "./db";
import { 
  emailWorkflows, 
  workflowSteps, 
  workflowEnrollments, 
  newsletterSubscribers,
  emailCampaigns 
} from "../drizzle/schema";
import { eq, and, lte, isNull } from "drizzle-orm";
// Email sending will be handled via SendGrid API
import { ENV } from "./_core/env";
import axios from "axios";

/**
 * Send email via SendGrid API
 */
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  customArgs?: Record<string, string>;
}) {
  const response = await axios.post(
    "https://api.sendgrid.com/v3/mail/send",
    {
      personalizations: [
        {
          to: [{ email: params.to }],
          custom_args: params.customArgs,
        },
      ],
      from: { email: ENV.fromEmail, name: "UpsurgeIQ" },
      subject: params.subject,
      content: [{ type: "text/html", value: params.html }],
    },
    {
      headers: {
        Authorization: `Bearer ${ENV.sendGridApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

/**
 * Enroll a subscriber into a workflow
 */
export async function enrollSubscriberInWorkflow(
  subscriberId: number,
  workflowId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already enrolled
  const [existing] = await db
    .select()
    .from(workflowEnrollments)
    .where(
      and(
        eq(workflowEnrollments.subscriberId, subscriberId),
        eq(workflowEnrollments.workflowId, workflowId)
      )
    )
    .limit(1);

  if (existing) {
    console.log(`[Workflow Engine] Subscriber ${subscriberId} already enrolled in workflow ${workflowId}`);
    return existing;
  }

  // Get first step of workflow
  const [firstStep] = await db
    .select()
    .from(workflowSteps)
    .where(eq(workflowSteps.workflowId, workflowId))
    .orderBy(workflowSteps.stepOrder)
    .limit(1);

  if (!firstStep) {
    throw new Error(`No steps found for workflow ${workflowId}`);
  }

  // Calculate when first email should be sent
  const now = new Date();
  const scheduledFor = new Date(
    now.getTime() + 
    ((firstStep.delayDays || 0) * 24 * 60 * 60 * 1000) + 
    ((firstStep.delayHours || 0) * 60 * 60 * 1000)
  );

  // Enroll subscriber
  await db.insert(workflowEnrollments).values({
    workflowId,
    subscriberId,
    currentStepId: firstStep.id,
    status: "active",
    enrolledAt: now,
    nextScheduledAt: scheduledFor,
  });

  console.log(`[Workflow Engine] Enrolled subscriber ${subscriberId} in workflow ${workflowId}, first email at ${scheduledFor}`);

  return { workflowId, subscriberId, scheduledFor };
}

/**
 * Process due workflow emails
 * Should be called periodically (e.g., every 5 minutes via cron)
 */
export async function processDueWorkflowEmails() {
  const db = await getDb();
  if (!db) {
    console.error("[Workflow Engine] Database not available");
    return;
  }

  const now = new Date();

  // Find enrollments that are due for sending
  const dueEnrollments = await db
    .select({
      enrollment: workflowEnrollments,
      subscriber: newsletterSubscribers,
      step: workflowSteps,
      workflow: emailWorkflows,
    })
    .from(workflowEnrollments)
    .innerJoin(newsletterSubscribers, eq(workflowEnrollments.subscriberId, newsletterSubscribers.id))
    .innerJoin(workflowSteps, eq(workflowEnrollments.currentStepId, workflowSteps.id))
    .innerJoin(emailWorkflows, eq(workflowEnrollments.workflowId, emailWorkflows.id))
    .where(
      and(
        eq(workflowEnrollments.status, "active"),
        lte(workflowEnrollments.nextScheduledAt, now),
        isNull(workflowEnrollments.completedAt)
      )
    );

  console.log(`[Workflow Engine] Found ${dueEnrollments.length} due emails to send`);

  for (const { enrollment, subscriber, step, workflow } of dueEnrollments) {
    try {
      await sendWorkflowEmail(enrollment, subscriber, step, workflow);
    } catch (error) {
      console.error(`[Workflow Engine] Error sending email for enrollment ${enrollment.id}:`, error);
      
      // Mark as cancelled (no 'failed' status in schema)
      await db
        .update(workflowEnrollments)
        .set({ 
          status: "cancelled",
          completedAt: new Date()
        })
        .where(eq(workflowEnrollments.id, enrollment.id));
    }
  }
}

/**
 * Send a workflow step email
 */
async function sendWorkflowEmail(
  enrollment: typeof workflowEnrollments.$inferSelect,
  subscriber: typeof newsletterSubscribers.$inferSelect,
  step: typeof workflowSteps.$inferSelect,
  workflow: typeof emailWorkflows.$inferSelect
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  console.log(`[Workflow Engine] Sending step ${step.stepOrder} of workflow "${workflow.name}" to ${subscriber.email}`);

  // Send email via SendGrid
  await sendEmail({
    to: subscriber.email,
    subject: step.subject,
    html: step.emailTemplate,
    customArgs: {
      workflow_id: workflow.id.toString(),
      enrollment_id: enrollment.id.toString(),
      step_id: step.id.toString(),
    },
  });

  // Note: lastSentAt field doesn't exist in schema, tracking via nextScheduledAt instead

  // Find next step
  const [nextStep] = await db
    .select()
    .from(workflowSteps)
    .where(
      and(
        eq(workflowSteps.workflowId, workflow.id),
        eq(workflowSteps.stepOrder, step.stepOrder + 1)
      )
    )
    .limit(1);

  if (nextStep) {
    // Calculate next send time
    const nextScheduledAt = new Date(
      Date.now() + 
      ((nextStep.delayDays || 0) * 24 * 60 * 60 * 1000) + 
      ((nextStep.delayHours || 0) * 60 * 60 * 1000)
    );

    // Update enrollment with next step
    await db
      .update(workflowEnrollments)
      .set({
        currentStepId: nextStep.id,
        nextScheduledAt,
      })
      .where(eq(workflowEnrollments.id, enrollment.id));

    console.log(`[Workflow Engine] Scheduled next step ${nextStep.stepOrder} for ${nextScheduledAt}`);
  } else {
    // No more steps - mark workflow as completed
    await db
      .update(workflowEnrollments)
      .set({
        status: "completed",
        completedAt: new Date(),
        nextScheduledAt: null,
      })
      .where(eq(workflowEnrollments.id, enrollment.id));

    console.log(`[Workflow Engine] Workflow "${workflow.name}" completed for subscriber ${subscriber.email}`);
  }
}

/**
 * Auto-enroll new subscribers into workflows with "subscription" trigger
 */
export async function autoEnrollNewSubscriber(subscriberId: number) {
  const db = await getDb();
  if (!db) {
    console.error("[Workflow Engine] Database not available");
    return;
  }

  // Find active workflows with subscription trigger
  const subscriptionWorkflows = await db
    .select()
    .from(emailWorkflows)
    .where(
      and(
        eq(emailWorkflows.triggerType, "subscription"),
        eq(emailWorkflows.isActive, 1)
      )
    );

  console.log(`[Workflow Engine] Found ${subscriptionWorkflows.length} subscription workflows for new subscriber ${subscriberId}`);

  for (const workflow of subscriptionWorkflows) {
    try {
      await enrollSubscriberInWorkflow(subscriberId, workflow.id);
    } catch (error) {
      console.error(`[Workflow Engine] Error enrolling subscriber ${subscriberId} in workflow ${workflow.id}:`, error);
    }
  }
}

/**
 * Pause a workflow enrollment
 */
export async function pauseWorkflowEnrollment(enrollmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(workflowEnrollments)
    .set({ status: "paused" })
    .where(eq(workflowEnrollments.id, enrollmentId));

  console.log(`[Workflow Engine] Paused enrollment ${enrollmentId}`);
}

/**
 * Resume a paused workflow enrollment
 */
export async function resumeWorkflowEnrollment(enrollmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(workflowEnrollments)
    .set({ status: "active" })
    .where(eq(workflowEnrollments.id, enrollmentId));

  console.log(`[Workflow Engine] Resumed enrollment ${enrollmentId}`);
}

/**
 * Cancel a workflow enrollment
 */
export async function cancelWorkflowEnrollment(enrollmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(workflowEnrollments)
    .set({ 
      status: "cancelled",
      completedAt: new Date()
    })
    .where(eq(workflowEnrollments.id, enrollmentId));

  console.log(`[Workflow Engine] Cancelled enrollment ${enrollmentId}`);
}
