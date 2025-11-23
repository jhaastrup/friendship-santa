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
      title: { type: Type.STRING, description: "Name of the gift item (mention specific brand if applicable)" },
      description: { type: Type.STRING, description: "Why this is a good gift. Mention specific stores (e.g., Jumia, Oraimo, Uncover) if relevant." },
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
      
      Target Audience Context: Modern/Urban Nigerian friends (living in Nigeria or abroad).
      
      Please suggest gifts that Nigerians actually want and shop for. 
      Think beyond generic "African prints". Consider popular local and international brands frequented by Nigerians, such as:
      - Tech/Gadgets: Apple (AirPods/Headphones), Oraimo (Earbuds/Watches), Meta Ray-Ban glasses, JBL Speakers.
      - Work/Office: Standing desks (Jumia), Mechanical keyboards, Ergonomic mouse, Laptop stands.
      - Fashion: Dye Lab, Kai Collective (especially the popular Nao tank top), Ri-Girl, Shop Bawsty, Adidas, Mo Accessories.
      - Beauty/Self-care: Uncover Skincare, Beauty Hut, Bath & Body Works.
      - Home/Kitchen: Radiance Cookware, Buchymix (Blenders/Air fryers), Miniso (Cute home gadgets).
      - Lifestyle/Gifts: Smileys Africa (Shoes, Gym clothes, Fancy socks), iFitness (Gym subscriptions), Jumia, Konga.
      
      Their interests are: ${interests.length > 0 ? interests.join(', ') : 'General popular items'}.
      ${notes ? `Additional notes/dislikes: ${notes}` : ''}
      
      Please suggest 5 specific, trendy, and thoughtful gift ideas. 
      For each idea, mention specific brands or types of products found at these stores if they fit the interest.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: GIFT_SCHEMA,
        systemInstruction: "You are a savvy personal shopper for a Nigerian friend group. You know the trending local brands (Kai Collective, Dye Lab, Uncover, Smileys Africa etc.) and popular international brands (Adidas, Miniso, Apple, Oraimo, Meta). Avoid lazy stereotypes. Suggest specific items like 'Buchymix Blender', 'iFitness Gym membership', 'Smileys Africa Gym Wear', 'Uncover Sunscreen', 'Kai Collective Nao Tank Top', 'Oraimo FreePods', 'Standing Desk from Jumia', or 'Meta Ray-Bans' if they match the user's interests. Prices can be in Naira (₦) or USD ($)."
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