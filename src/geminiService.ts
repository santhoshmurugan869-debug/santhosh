import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface DocResult {
  overview: string;
  codeExplanation: string;
  flowChartExplanation: string;
  architectureDiagram: string;
  fileExplanations: { fileName: string; explanation: string }[];
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      // Check if it's a rate limit error (429)
      const isRateLimit = error?.message?.includes("429") || 
                          error?.status === "RESOURCE_EXHAUSTED" ||
                          JSON.stringify(error).includes("429");
      
      if (isRateLimit && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function generateDocumentation(files: { name: string; content: string }[]): Promise<DocResult> {
  const model = "gemini-3.1-pro-preview"; // Using Pro for better reasoning on code

  const filesContext = files.map(f => `File: ${f.name}\nContent:\n${f.content}`).join("\n\n---\n\n");

  const prompt = `
    You are an expert technical writer and software architect. 
    I will provide you with the source code of a repository. 
    Your task is to analyze the code and generate comprehensive technical documentation.

    The documentation should include:
    1. **Overview**: A high-level summary of what the project does and its core purpose.
    2. **Code Explanation**: Detailed documentation and explanation of the code logic, functions, and classes.
    3. **Flow Chart Explanation**: A comprehensive description of the system flow and logic. This MUST include:
        - **Primary Success Path**: The main flow of the application.
        - **Alternative Flows**: Other valid paths the code might take.
        - **Error Handling Scenarios**: How the system responds to failures, invalid inputs, or exceptions.
        - **Design Patterns**: Explanation of structural decisions.
    4. **Architecture Diagram**: A Mermaid.js diagram (using \`\`\`mermaid\`\`\` blocks) that visually represents the system architecture, component relationships, or data flow.
    5. **File-by-File Explanations**: A brief explanation of what each file does.

    Format your response as a JSON object with the following structure:
    {
      "overview": "Markdown string",
      "codeExplanation": "Markdown string",
      "flowChartExplanation": "Markdown string (textual description)",
      "architectureDiagram": "Markdown string (containing ONLY the mermaid block)",
      "fileExplanations": [
        { "fileName": "string", "explanation": "string" }
      ]
    }

    Here is the source code:
    ${filesContext}
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as DocResult;
  });
}
