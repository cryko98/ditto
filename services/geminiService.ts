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
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
    throw new Error("API Key is missing. Please add API_KEY to Vercel Environment Variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePrompt = `Generate a high-quality, 2D vector-style or official anime artwork style image of the Pokémon "Ditto". 
            
  Visual Requirements:
  - Character: Ditto (purple, amorphous, jelly-like blob, simple smiley face with dot eyes and line mouth).
  - Style: Clean lines, vibrant colors, similar to official marketing art.
  - Scene/Action: ${prompt}
  
  Make sure the character is clearly visible and cute.`;

  try {
    // Attempt 1: Try Gemini 2.5 Flash Image (Multimodal)
    console.log("Attempting image gen with gemini-2.5-flash-image...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [{ text: imagePrompt }]
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data in first model response.");

  } catch (error: any) {
    console.warn("Gemini 2.5 Flash Image failed, trying fallback to Imagen 3...", error);

    // Attempt 2: Fallback to Imagen 3 (Dedicated Image Generation Model)
    // This often works if the multimodal model fails or has permission issues.
    try {
       const imagenResponse = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg'
        }
       });
       
       const imageBytes = imagenResponse.generatedImages?.[0]?.image?.imageBytes;
       if (imageBytes) {
         return `data:image/jpeg;base64,${imageBytes}`;
       }

       throw new Error("Imagen 3 also failed to return an image.");

    } catch (fallbackError: any) {
       console.error("Fallback Image Generation Error:", fallbackError);
       // Throw a helpful error message for the user
       if (fallbackError.message?.includes('403') || error.message?.includes('403')) {
          throw new Error("Permission Denied (403). Your API Key might need Billing enabled to generate images.");
       }
       throw new Error("Failed to generate image. Please try again later.");
    }
  }
};