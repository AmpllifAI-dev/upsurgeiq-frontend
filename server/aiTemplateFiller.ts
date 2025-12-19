import { invokeLLM } from "./_core/llm";

interface TemplateData {
  companyName?: string;
  industry?: string;
  productName?: string;
  keyBenefit?: string;
  uniqueFeature?: string;
  ceoName?: string;
  ceoTitle?: string;
  website?: string;
  additionalContext?: string;
}

export async function fillPressReleaseTemplate(
  templateBody: string,
  templateTitle: string,
  templateSubtitle: string,
  data: TemplateData
): Promise<{ title: string; subtitle: string; body: string }> {
  const prompt = `You are an expert PR writer. Fill in the following press release template with the provided information. Replace all placeholders (in [brackets]) with appropriate content based on the context.

Template Title: ${templateTitle}
Template Subtitle: ${templateSubtitle}

Template Body:
${templateBody}

Company Information:
${JSON.stringify(data, null, 2)}

Instructions:
1. Replace ALL placeholders [like this] with appropriate content
2. Maintain professional press release tone
3. Ensure dates are formatted properly (use today's date where needed)
4. Keep the structure and format of the template
5. Make sure all information flows naturally
6. If a placeholder doesn't have corresponding data, make a reasonable assumption based on context

Return ONLY a JSON object with this structure:
{
  "title": "filled title",
  "subtitle": "filled subtitle",
  "body": "filled body content"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a professional PR writer. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "press_release",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The filled press release title",
            },
            subtitle: {
              type: "string",
              description: "The filled press release subtitle",
            },
            body: {
              type: "string",
              description: "The filled press release body content",
            },
          },
          required: ["title", "subtitle", "body"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No content returned from AI");
  }

  const result = JSON.parse(content);
  return result;
}

export async function suggestTemplateFields(
  templateType: string,
  companyInfo: { name?: string; industry?: string; description?: string }
): Promise<{ suggestions: Record<string, string> }> {
  const prompt = `Based on the following company information, suggest appropriate content for a ${templateType} press release template.

Company Name: ${companyInfo.name || "Not provided"}
Industry: ${companyInfo.industry || "Not provided"}
Description: ${companyInfo.description || "Not provided"}

Provide smart suggestions for common press release fields. Return a JSON object with suggested values.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a PR consultant providing suggestions for press releases.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "template_suggestions",
        strict: true,
        schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "object",
              description: "Key-value pairs of field names and suggested content",
              additionalProperties: {
                type: "string",
              },
            },
          },
          required: ["suggestions"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No content returned from AI");
  }

  return JSON.parse(content);
}
