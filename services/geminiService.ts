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
      description: { type: Type.STRING, description: "Why this is a good gift. Mention specific stores (e.g., Jumia, Beauty Hut, Laterna Books) if relevant." },
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
      
      **Target Audience Context**: Modern/Urban Nigerian friends. They have diverse tastes ranging from luxury fashion to specific practical needs (health plans, appliances) and experiences.
      
      **Giftee's Interests**: ${interests.length > 0 ? interests.join(', ') : 'General popular items'}.
      ${notes ? `**Additional Notes/Dislikes**: ${notes}` : ''}
      
      Please suggest 5 specific, thoughtful, and actionable gift ideas based on the interests above. Use the following guide for context:
      
      1. **Specific Requests**: If they asked for something specific (e.g., "AXA Mansard Health Plan", "COSRX Snail Mucin", "J1s/Jordan 1s", "Inverter AC"), prioritize finding a way to give that (e.g., "Pay for a month/year subscription", "Gift card for specific store").
      2. **Fashion & Style**:
         - *High-End/Trendy*: Kai Collective (e.g., Nao Tank), Shop Bawsty, Dye Lab (Adire).
         - *Street/Footwear*: Smileys Africa, Nike (Jordan 1s), New Balance (NB Black sneakers), Adidas.
         - *Accessories*: Ri-Girl (Wigs), Mo Accessories, Ray-Ban Meta glasses.
      3. **Beauty & Wellness**:
         - *Skincare*: Uncover Skincare, COSRX (via Beauty Hut or BuyBetter), Bath & Body Works.
         - *Fitness*: iFitness Gym Subscription, Yoga mats, Dumbbells.
         - *Experiences*: Spa vouchers (e.g., Oriki, Tirta Ayu), Dinner vouchers (Nok by Alara, Kapadoccia).
      4. **Tech & Home**:
         - *Gadgets*: Apple (iPad, AirPods), Oraimo (Soundbars, Earbuds), MagSafe charging stands.
         - *Work/Home*: Standing Desks (Jumia), Office Chairs, Mechanical Keyboards, Live Plants, Buchymix Blenders, Radiance Cookware.
      5. **Abstract/Niche**:
         - *"God/Spiritual"*: Bibles, Journals, Devotionals (e.g., from Laterna Books).
         - *"Money"*: Suggest creative cash gifts (e.g., "Money Cake", "Crisp Mint Notes in a box", "PiggyVest Savings Gift").
         - *"Travel/Visa"*: Luggage, Passport holders, Travel pillows.

      For each idea, mention specific brands or trusted vendors in Nigeria if applicable. Ensure prices are realistic for the Nigerian market (₦) or USD equivalents.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: GIFT_SCHEMA,
        systemInstruction: "You are a sophisticated Personal Shopper for a Nigerian friend group. You understand the nuances of their requests—from specific health insurance plans to luxury fashion (Kai Collective) and street style (J1s). You know that when someone asks for 'Money', they might appreciate a creative presentation. You are helpful, specific with brands (Jumia, Konga, Instagram vendors), and realistic about pricing."
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