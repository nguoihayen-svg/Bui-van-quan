
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Transaction } from "../types";

export const getBusinessInsights = async (products: Product[], transactions: Transaction[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Dựa trên dữ liệu cửa hàng sau, hãy cung cấp 3 phân tích ngắn gọn (mỗi phân tích 1 câu) bằng tiếng Việt:
    - Danh sách sản phẩm: ${JSON.stringify(products.map(p => ({ name: p.name, stock: p.stock, price: p.price })))}
    - Lịch sử giao dịch: ${JSON.stringify(transactions.map(t => ({ total: t.total, type: t.type, date: t.date })))}
    
    Tập trung vào:
    1. Sản phẩm nào đang sắp hết hàng.
    2. Xu hướng doanh thu.
    3. Đề xuất chiến lược bán hàng.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Không thể phân tích dữ liệu lúc này.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lỗi khi kết nối với AI để phân tích.";
  }
};
