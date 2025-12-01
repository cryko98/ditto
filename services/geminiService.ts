import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are Ditto, an expert frontend engineer AI. 
Your task is to generate a SINGLE, self-contained HTML file based on the user's description.
The HTML file must include:
1. Modern HTML5 structure.
2. Embedded CSS within <style> tags (make it look modern and beautiful).
3. Embedded JavaScript within <script> tags (if interactivity is needed).
4. Use Tailwind CSS via CDN if complex styling is required (<script src="https://cdn.tailwindcss.com"></script>).

IMPORTANT RULES:
- Return ONLY the raw HTML code. 
- Do NOT wrap the code in markdown blocks (no \`\`\`html ... \`\`\`). 
- Do NOT add explanations or text outside the HTML.
- If the user asks for something unsafe, politely refuse within a valid HTML page displaying the error.
`;

export const generateWebPage = async (prompt: string, currentCode?: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // If there is existing code, we ask the model to modify it
  let fullPrompt = prompt;
  if (currentCode && !currentCode.startsWith('<!-- No code')) {
    fullPrompt = `
    Here is the current HTML code:
    ${currentCode}

    USER REQUEST: ${prompt}

    INSTRUCTIONS: 
    Return the FULLY updated HTML file incorporating the user's changes. 
    Do not return just the diff. Return the complete working HTML file.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, 
      }
    });

    const text = response.text;
    if (!text) return "<!-- No code generated -->";
    
    // Cleanup in case the model accidentally adds markdown despite instructions
    return text.replace(/```html/g, '').replace(/```/g, '');

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate code. Please try again.");
  }
};