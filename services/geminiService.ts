import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GiftIdea } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

const GIFT_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Name of the gift item" },
      description: { type: Type.STRING, description: "Why this is a good gift based on interests" },
      category: { 
        type: Type.STRING, 
        enum: ['Funny', 'Practical', 'Luxury', 'DIY', 'Sentimental', 'Other'],
        description: "Category of the gift"
      },
      estimatedPrice: { type: Type.STRING, description: "Estimated price range, e.g., $20-$50" }
    },
    required: ["title", "description", "category"],
  }
};

export const generateGiftIdeas = async (
  receiverName: string,
  interests: string[],
  notes: string
): Promise<GiftIdea[]> => {
  try {
    const ai = getClient();
    
    const prompt = `
      I am playing Secret Santa. 
      My giftee is named ${receiverName}.
      
      Their interests are: ${interests.length > 0 ? interests.join(', ') : 'General popular items'}.
      ${notes ? `Additional notes/dislikes: ${notes}` : ''}
      
      Please suggest 5 thoughtful, creative, and diverse gift ideas.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: GIFT_SCHEMA,
        systemInstruction: "You are a helpful holiday gift assistant. You provide specific, actionable gift ideas based on user interests. Avoid generic gift cards unless specified."
      }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text) as GiftIdea[];
    return data;
  } catch (error) {
    console.error("Error generating gift ideas:", error);
    return [];
  }
};