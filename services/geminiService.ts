import { GoogleGenAI, Type } from "@google/genai";
import { SeoSettings, Photo } from "../types";

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URI prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};


export const generatePhotoDescription = async (photoFile: File, apiKey?: string): Promise<string> => {
  const effectiveApiKey = apiKey || process.env.API_KEY;
  
  if (!effectiveApiKey) {
    console.error("API_KEY not provided.");
    return ""; // Return empty string if no API key
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
    const base64Data = await fileToBase64(photoFile);

    const imagePart = {
      inlineData: {
        mimeType: photoFile.type,
        data: base64Data,
      },
    };

    const textPart = {
      text: "Describe this image for a photo gallery in one short, captivating sentence.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    const text = response.text;
    if (text) {
      return text.trim();
    } else {
      return "Could not generate a description for this image.";
    }
  } catch (error) {
    console.error("Error generating description:", error);
    return "An error occurred while generating the description.";
  }
};

export const generateSeoSuggestions = async (appName: string, albumTitles: string[], apiKey?: string): Promise<SeoSettings> => {
  const effectiveApiKey = apiKey || process.env.API_KEY;
  
  if (!effectiveApiKey) {
    console.error("API_KEY not provided.");
    return {
      metaTitle: 'Error: API key not configured',
      metaDescription: '',
      metaKeywords: '',
      structuredData: ''
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

    const prompt = `
      Given a photo gallery application named "${appName}" with the following albums: ${albumTitles.join(', ')}.
      Generate SEO metadata to optimize it for search engines.
      - The meta title should be compelling and under 60 characters.
      - The meta description should be engaging and under 160 characters.
      - The keywords should be a comma-separated list of relevant terms.
      - The structuredData should be a valid JSON-LD script for an "ImageGallery" Schema.org type, including a relevant headline and description.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metaTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            metaKeywords: { type: Type.STRING },
            structuredData: { type: Type.STRING },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const suggestions = JSON.parse(jsonText);

    // Validate and format structured data
    if (suggestions.structuredData) {
      try {
          const schema = JSON.parse(suggestions.structuredData);
          suggestions.structuredData = JSON.stringify(schema, null, 2);
      } catch (e) {
          console.warn("AI generated invalid JSON for structured data.", suggestions.structuredData);
          // Fallback to a basic schema
          suggestions.structuredData = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "headline": appName,
            "description": `A beautiful photo gallery featuring albums like ${albumTitles.join(', ')}.`
          }, null, 2);
      }
    }
    
    return suggestions;

  } catch (error) {
    console.error("Error generating SEO suggestions:", error);
    return {
      metaTitle: 'Error generating suggestions',
      metaDescription: '',
      metaKeywords: '',
      structuredData: ''
    };
  }
};

export const searchPhotosInAlbum = async (query: string, photos: {id: string, title: string, description: string}[], apiKey?: string): Promise<string[]> => {
    const effectiveApiKey = apiKey || process.env.API_KEY;
    
    if (!effectiveApiKey) {
        console.error("API_KEY not provided.");
        return [];
    }
    if (photos.length === 0) {
        return [];
    }

    try {
        const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

        const photoDataForPrompt = photos.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description
        }));

        const prompt = `
            You are an intelligent photo gallery search assistant.
            A user is searching for photos with the query: "${query}".
            Here is a list of available photos with their IDs, titles, and AI-generated descriptions:
            ${JSON.stringify(photoDataForPrompt)}

            Analyze the user's query and the photo data. The query might be semantic, so match based on meaning, not just keywords. For example, if the user searches for "happy people", a photo described as "a group of friends laughing" should match.
            
            Return a JSON object with a single key "matchingPhotoIds". This key should contain an array of the string IDs of the photos that are a good match for the search query. If no photos match, the array should be empty.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        matchingPhotoIds: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['matchingPhotoIds']
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        return result.matchingPhotoIds || [];

    } catch (error) {
        console.error("Error searching photos:", error);
        return [];
    }
}