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
      Think beyond generic "African prints". Consider popular local and international brands frequented by Nigerians with these specific details:
      
      - **Fashion (High-End/Trendy)**: 
        - Kai Collective (High-end, price point starting from ₦160,000+. Popular item: Nao tank top, mesh dresses).
        - Shop Bawsty (Trendy female clothing/dresses).
        - Dye Lab (Adire/Kaftans).
        - Adidas, Mo Accessories.
      - **Beauty/Hair**: 
        - Ri-Girl (Luxury Wigs/Hair).
        - Uncover Skincare, Beauty Hut, Bath & Body Works.
      - **Lifestyle/Gifts**: 
        - Smileys Africa (Premium lifestyle, Shoes, Gym clothes, Fancy socks. Price point starting from ₦40,000+).
        - iFitness (Gym subscriptions).
      - **Tech/Gadgets**: 
        - Apple (AirPods/Headphones), Oraimo (Earbuds/Watches), Meta Ray-Ban glasses, JBL Speakers.
        - Work: Standing desks (Jumia), Mechanical keyboards, Ergonomic mouse, Laptop stands.
      - **Home/Kitchen**: 
        - Radiance Cookware, Buchymix (Blenders/Air fryers), Miniso (Cute home gadgets).
      
      Their interests are: ${interests.length > 0 ? interests.join(', ') : 'General popular items'}.
      ${notes ? `Additional notes/dislikes: ${notes}` : ''}
      
      Please suggest 5 specific, trendy, and thoughtful gift ideas. 
      For each idea, mention specific brands or types of products found at these stores if they fit the interest.
      Ensure the estimated price reflects the brand's actual pricing (e.g., Kai is expensive, Miniso is affordable).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: GIFT_SCHEMA,
        systemInstruction: "You are a savvy personal shopper for a Nigerian friend group. You know the trending local brands and their specific niches: Ri-Girl sells Wigs, Shop Bawsty sells female clothing, Kai Collective is high-end luxury (₦160k+), Smileys Africa is premium lifestyle (₦40k+). You also know international tech staples like Apple, Oraimo, and Meta Ray-Bans. Avoid lazy stereotypes. Suggest specific items like 'Buchymix Blender', 'Ri-Girl Bone Straight Wig', 'Shop Bawsty Dress', 'Uncover Sunscreen', 'Kai Collective Nao Tank Top', 'Oraimo FreePods', 'Standing Desk from Jumia'. Prices should be realistic (in Naira ₦ or USD $)."
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