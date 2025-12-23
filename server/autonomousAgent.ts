import { invokeLLM } from "./_core/llm";
import { addIssueComment } from "./issueTracker";
import { notifyOwner } from "./_core/notification";

export interface IssueContext {
  id: number;
  title: string;
  description: string;
  issueType: string;
  priority: string;
  pageUrl?: string;
  browserInfo?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  screenshotUrls?: string;
}

export async function investigateIssue(issue: IssueContext) {
  try {
    // Post initial comment that investigation has started
    await addIssueComment({
      issueId: issue.id,
      userId: 1, // System user
      comment: "🤖 Autonomous investigation started. Analyzing issue details...",
      isInternal: false,
    });

    // Analyze the issue using LLM
    const analysisPrompt = `You are an autonomous technical support agent analyzing a user-reported issue.

**Issue Details:**
- Type: ${issue.issueType}
- Priority: ${issue.priority}
- Title: ${issue.title}
- Description: ${issue.description}
${issue.pageUrl ? `- Page URL: ${issue.pageUrl}` : ""}
${issue.browserInfo ? `- Browser: ${issue.browserInfo}` : ""}
${issue.stepsToReproduce ? `- Steps to Reproduce:\n${issue.stepsToReproduce}` : ""}
${issue.expectedBehavior ? `- Expected: ${issue.expectedBehavior}` : ""}
${issue.actualBehavior ? `- Actual: ${issue.actualBehavior}` : ""}

**Your Task:**
1. Classify the issue severity (trivial, minor, major, critical)
2. Identify if this is auto-fixable (broken link, typo, CSS issue, etc.)
3. Determine root cause if possible
4. Provide investigation findings
5. Suggest next steps

Respond in JSON format:
{
  "severity": "trivial|minor|major|critical",
  "autoFixable": boolean,
  "category": "string (e.g., 'UI Bug', 'Data Issue', 'Performance')",
  "rootCause": "string or null",
  "findings": "detailed analysis",
  "nextSteps": ["step1", "step2"],
  "needsHumanReview": boolean
}`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a technical support AI that analyzes and triages software issues." },
        { role: "user", content: analysisPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "issue_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              severity: { type: "string", enum: ["trivial", "minor", "major", "critical"] },
              autoFixable: { type: "boolean" },
              category: { type: "string" },
              rootCause: { type: ["string", "null"] },
              findings: { type: "string" },
              nextSteps: { type: "array", items: { type: "string" } },
              needsHumanReview: { type: "boolean" },
            },
            required: ["severity", "autoFixable", "category", "findings", "nextSteps", "needsHumanReview"],
            additionalProperties: false,
          },
        },
      },
    });

    const analysisContent = response.choices[0].message.content;
    const analysisString = typeof analysisContent === 'string' ? analysisContent : JSON.stringify(analysisContent);
    const analysis = JSON.parse(analysisString || "{}");

    // Post investigation findings
    const findingsComment = `🔍 **Investigation Complete**

**Severity:** ${analysis.severity}
**Category:** ${analysis.category}
${analysis.rootCause ? `**Root Cause:** ${analysis.rootCause}\n` : ""}

**Findings:**
${analysis.findings}

**Recommended Next Steps:**
${analysis.nextSteps.map((step: string, i: number) => `${i + 1}. ${step}`).join("\n")}

${analysis.autoFixable ? "✅ This issue appears to be auto-fixable. Attempting automatic resolution..." : "⚠️ This issue requires manual intervention."}`;

    await addIssueComment({
      issueId: issue.id,
      userId: 1,
      comment: findingsComment,
      isInternal: false,
    });

    // Escalate if needs human review
    if (analysis.needsHumanReview || analysis.severity === "critical" || analysis.severity === "major") {
      await notifyOwner({
        title: `🚨 Issue #${issue.id} Requires Your Attention`,
        content: `**${issue.title}**\n\nSeverity: ${analysis.severity}\nCategory: ${analysis.category}\n\n${analysis.findings}\n\n[View Issue](/issues/${issue.id})`,
      });
    }

    return analysis;
  } catch (error) {
    console.error("Investigation error:", error);
    await addIssueComment({
      issueId: issue.id,
      userId: 1,
      comment: "❌ Investigation failed due to technical error. Escalating to human review.",
      isInternal: false,
    });
    
    // Escalate on error
    await notifyOwner({
      title: `⚠️ Issue #${issue.id} Investigation Failed`,
      content: `Autonomous investigation encountered an error for: ${issue.title}\n\nPlease review manually: /issues/${issue.id}`,
    });
    
    return null;
  }
}

export async function attemptAutoFix(issue: IssueContext, analysis: any) {
  try {
    await addIssueComment({
      issueId: issue.id,
      userId: 1,
      comment: "🔧 Attempting automatic fix...",
      isInternal: false,
    });

    // Use LLM to generate fix suggestions
    const fixPrompt = `Based on this issue analysis, suggest specific code changes or fixes:

**Issue:** ${issue.title}
**Category:** ${analysis.category}
**Root Cause:** ${analysis.rootCause || "Unknown"}
**Findings:** ${analysis.findings}

Provide concrete fix suggestions in JSON format:
{
  "fixable": boolean,
  "fixType": "code|config|data|documentation",
  "changes": ["specific change 1", "specific change 2"],
  "confidence": "low|medium|high",
  "risks": ["potential risk 1"]
}`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a software engineer providing fix recommendations." },
        { role: "user", content: fixPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "fix_suggestion",
          strict: true,
          schema: {
            type: "object",
            properties: {
              fixable: { type: "boolean" },
              fixType: { type: "string", enum: ["code", "config", "data", "documentation"] },
              changes: { type: "array", items: { type: "string" } },
              confidence: { type: "string", enum: ["low", "medium", "high"] },
              risks: { type: "array", items: { type: "string" } },
            },
            required: ["fixable", "fixType", "changes", "confidence", "risks"],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0].message.content;
    const contentString = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
    const fixSuggestion = JSON.parse(contentString || "{}");

    const fixComment = `🛠️ **Auto-Fix Analysis**

**Fixable:** ${fixSuggestion.fixable ? "Yes" : "No"}
**Fix Type:** ${fixSuggestion.fixType}
**Confidence:** ${fixSuggestion.confidence}

**Suggested Changes:**
${fixSuggestion.changes.map((change: string, i: number) => `${i + 1}. ${change}`).join("\n")}

${fixSuggestion.risks.length > 0 ? `**Potential Risks:**\n${fixSuggestion.risks.map((risk: string, i: number) => `${i + 1}. ${risk}`).join("\n")}` : ""}

${fixSuggestion.confidence === "high" && fixSuggestion.fixable ? "✅ High confidence fix identified. Ready for implementation." : "⚠️ Manual review recommended before implementing changes."}`;

    await addIssueComment({
      issueId: issue.id,
      userId: 1,
      comment: fixComment,
      isInternal: false,
    });

    return fixSuggestion;
  } catch (error) {
    console.error("Auto-fix error:", error);
    await addIssueComment({
      issueId: issue.id,
      userId: 1,
      comment: "❌ Auto-fix analysis failed. Manual intervention required.",
      isInternal: false,
    });
    return null;
  }
}
