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
- Always use 'min-height: 100vh' for the body instead of 'height: 100vh' to allow scrolling on mobile or smaller screens.
- If the user asks for something unsafe, politely refuse within a valid HTML page displaying the error.
`;

export const generateWebPage = async (prompt: string, currentCode?: string): Promise<string> => {
  // Code generation still uses Gemini as it has a generous free tier via AI Studio
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
    throw new Error("API Key is missing. Please add API_KEY to Vercel Environment Variables.");
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
    Remember to use min-height: 100vh for the body to prevent cutting off content.
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

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('403')) {
      throw new Error("Invalid API Key. Please check your Vercel Environment Variables.");
    }
    throw error;
  }
};

export const generateDittoImage = async (prompt: string): Promise<string> => {
  // SWITCHED TO POLLINATIONS.AI for 100% FREE generation without billing requirements.
  
  try {
    // Construct a strong prompt to ensure consistency with the Ditto character
    const basePrompt = "cute ditto pokemon character, purple amorphous blob, simple face with dot eyes, 2d vector art style, clean white background, high quality";
    const userScenario = prompt;
    
    // Combine them
    const finalPrompt = encodeURIComponent(`${basePrompt}, ${userScenario}`);
    
    // Add a random seed to ensure different results for the same prompt
    const seed = Math.floor(Math.random() * 1000000);
    
    // Pollinations URL construction
    const imageUrl = `https://image.pollinations.ai/prompt/${finalPrompt}?nologo=true&width=1024&height=1024&seed=${seed}&model=flux`;

    // We add a small delay to simulate "processing" so the UI doesn't flash too quickly
    // and to verify the URL is constructed correctly.
    await new Promise(resolve => setTimeout(resolve, 1000));

    return imageUrl;

  } catch (error) {
    console.error("Image Generation Error:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};