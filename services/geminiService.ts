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

// Reference local image uploaded to the repository
const DITTO_REF_IMAGE_URL = "/ditto.png";

// Helper to convert URL to Base64
async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching reference image:", error);
    throw new Error("Failed to load local Ditto reference image. Make sure 'ditto.png' is in the public folder.");
  }
}

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

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate code. Please try again.");
  }
};

export const generateDittoImage = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // 1. Fetch the reference image bytes from local file
    const base64Image = await urlToBase64(DITTO_REF_IMAGE_URL);

    // 2. Call the Image Generation/Editing model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming ditto.png is actually a png, but model is flexible. Ideally use image/png if strictly png.
              data: base64Image
            }
          },
          {
            text: `Using this character (Ditto) as a reference, generate a high-quality 2D cartoon/anime style image of it performing the following action or in the following scene: "${prompt}". Keep the character recognizable as a purple jelly blob with a simple face.`
          }
        ]
      }
    });

    // 3. Extract the image from the response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated in response.");

  } catch (error) {
    console.error("Image Generation Error:", error);
    throw new Error("Failed to generate image. Try a different prompt or check if ditto.png exists.");
  }
};