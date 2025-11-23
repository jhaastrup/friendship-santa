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
      description: { type: Type.STRING, description: "Why this is a good gift based on interests. Mention if it has specific Nigerian cultural relevance." },
      category: { 
        type: Type.STRING, 
        enum: ['Funny', 'Practical', 'Luxury', 'DIY', 'Sentimental', 'Other'],
        description: "Category of the gift"
      },
      estimatedPrice: { type: Type.STRING, description: "Estimated price range, e.g., $20-$50 or ₦20,000-₦50,000" }
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
      
      Context: The group consists of Nigerian friends (International/Nigerian context). 
      Please suggest gifts that are culturally relevant to Nigerians (living in Nigeria or abroad) where appropriate, or generally great international gifts.
      
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
        systemInstruction: "You are a helpful holiday gift assistant. The users are Nigerian friends. Provide specific, actionable gift ideas. Mix globally popular items with items that have Nigerian cultural relevance (e.g., fashion, food, local brands) if they fit the interests. Prices can be in USD or Naira. Avoid generic gift cards unless specified."
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