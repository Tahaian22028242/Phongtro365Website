const express = require("express");
const router = express.Router();
const { GoogleGenAI, Type } = require("@google/genai");
const { prisma } = require("../prismaClient");

let aiClient = null;
function getAiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (err) {
      console.warn("[AI Studio] Failed to init GoogleGenAI:", err.message);
    }
  }
  return aiClient;
}

// Helper: Smart fallback ranking algorithm
function algorithmicRecommendation(places, preferences) {
  const {
    prompt = "",
    budgetMax = 10000000,
    preferredArea = "",
    roomType = "",
    perks = [],
    persona = ""
  } = preferences || {};

  const queryLower = (prompt + " " + preferredArea + " " + persona + " " + roomType).toLowerCase();

  const scoredPlaces = places.map((place) => {
    let score = 70;
    const reasons = [];
    const highlights = [];

    // Price scoring
    if (place.price <= budgetMax) {
      score += 15;
      reasons.push(`Giá thuê ${(place.price / 1000000).toFixed(1)} triệu/tháng nằm gọn trong mức ngân sách dự kiến.`);
    } else if (place.price <= budgetMax * 1.15) {
      score += 5;
      reasons.push(`Giá thuê nhỉnh hơn nhẹ nhưng tiện nghi vượt trội so với phân khúc.`);
    } else {
      score -= 20;
    }

    // Location / Query matching
    const addressLower = (place.address || "").toLowerCase();
    const titleLower = (place.title || "").toLowerCase();
    const descLower = (place.description || "").toLowerCase();

    if (queryLower.includes("cầu giấy") && (addressLower.includes("cầu giấy") || titleLower.includes("cầu giấy"))) {
      score += 20;
      reasons.push("Nằm tại trung tâm Quận Cầu Giấy, thuận tiện đi lại nhiều trường ĐH và văn phòng.");
    }
    if (queryLower.includes("đống đa") && (addressLower.includes("đống đa") || titleLower.includes("đống đa"))) {
      score += 20;
      reasons.push("Khu vực Đống Đa sầm uất, gần các trường Ngoại Thương, Ngoại Giao, Luật.");
    }
    if (queryLower.includes("bách khoa") || queryLower.includes("hai bà trưng")) {
      if (addressLower.includes("hai bà trưng") || titleLower.includes("bách khoa") || descLower.includes("bách khoa")) {
        score += 25;
        reasons.push("Gần cụm ĐH Bách Khoa - Xây Dựng - Kinh Tế Quốc Dân.");
      }
    }
    if (queryLower.includes("bình thạnh") || queryLower.includes("hcm") || queryLower.includes("hồ chí minh")) {
      if (addressLower.includes("bình thạnh") || addressLower.includes("quận 1") || addressLower.includes("hồ chí minh") || addressLower.includes("thủ đức")) {
        score += 20;
        reasons.push("Vị trí đắc địa tại TP. Hồ Chí Minh.");
      }
    }

    // Persona matching
    if (persona === 'student' || queryLower.includes("sinh viên")) {
      if (place.price <= 3500000) {
        score += 15;
        highlights.push("Chi phí hợp lý cho sinh viên");
      }
      if (place.perks?.some(p => p.perk === 'wifi' || p.perk === 'parking')) {
        score += 10;
        highlights.push("Đầy đủ Wifi & Chỗ để xe");
      }
    } else if (persona === 'worker' || queryLower.includes("văn phòng") || queryLower.includes("studio")) {
      if (place.area >= 28 || place.perks?.some(p => p.perk === 'elevator' || p.perk === 'air_conditioner')) {
        score += 15;
        highlights.push("Không gian rộng rãi, full tiện nghi");
      }
    }

    // Perks matching
    const placePerkKeys = (place.perks || []).map(p => p.perk);
    if (perks && perks.length > 0) {
      const matchedPerks = perks.filter(p => placePerkKeys.includes(p));
      score += matchedPerks.length * 5;
      if (matchedPerks.length > 0) {
        highlights.push(`Đáp ứng ${matchedPerks.length}/${perks.length} tiện ích yêu cầu`);
      }
    }

    if (place.duration <= 6) {
      highlights.push("Hợp đồng linh hoạt");
    }

    const finalScore = Math.min(99, Math.max(55, score));
    return {
      placeId: place.id,
      matchScore: finalScore,
      matchReason: reasons.length > 0 ? reasons.join(" ") : `Phù hợp với tiêu chí tìm kiếm với diện tích ${place.area}m² tại ${place.address.split(',').slice(-2).join(',').trim()}.`,
      highlights: highlights.length > 0 ? highlights : ["Vị trí thuận tiện", "Đầy đủ tiện ích cơ bản"],
      budgetSuitability: place.price <= budgetMax ? "Rất tiết kiệm & phù hợp" : "Cần cân nhắc ngân sách",
    };
  });

  scoredPlaces.sort((a, b) => b.matchScore - a.matchScore);

  return {
    recommendations: scoredPlaces.slice(0, 6),
    generalAdvice: "Khi đi xem phòng trọ, bạn nên kiểm tra kỹ áp lực nước, đồng hồ điện công tơ riêng, sóng điện thoại/wifi trong phòng và hỏi rõ các phụ phí như vệ sinh, thang máy, gửi xe trước khi đặt cọc.",
    suggestedSearchTerms: ["Phòng trọ Cầu Giấy dưới 4 triệu", "Studio full đồ Đống Đa", "Sleepbox Bình Thạnh trọn gói", "Phòng trọ gần Bách Khoa"]
  };
}

// POST /api/ai/recommend
router.post("/recommend", async (req, res) => {
  try {
    const { prompt, budgetMax, preferredArea, roomType, perks, persona, currentPlaceId } = req.body;

    // Fetch all active places from DB
    const allPlaces = await prisma.place.findMany({
      where: { status: "SEE" },
      include: {
        photos: true,
        perks: true,
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          }
        }
      }
    });

    if (!allPlaces || allPlaces.length === 0) {
      return res.json({ recommendations: [], generalAdvice: "", suggestedSearchTerms: [] });
    }

    // Filter out current place if recommending similar
    const candidatePlaces = currentPlaceId 
      ? allPlaces.filter(p => p.id !== parseInt(currentPlaceId, 10)) 
      : allPlaces;

    const ai = getAiClient();

    if (ai) {
      try {
        const placesSummary = candidatePlaces.map(p => ({
          id: p.id,
          title: p.title,
          address: p.address,
          price: p.price,
          priceFormatted: (p.price / 1000000).toFixed(1) + " triệu/tháng",
          area: `${p.area} m²`,
          duration: `${p.duration} tháng`,
          perks: (p.perks || []).map(k => k.perk).join(", "),
        }));

        const systemPrompt = `Bạn là Chuyên gia Tư vấn và Gợi ý Phòng trọ AI của Phongtro365 tại Việt Nam.
Nhiệm vụ của bạn là phân tích sâu nhu cầu của người đi thuê phòng (sinh viên, người đi làm, gia đình trẻ, v.v.), so sánh với danh sách các phòng trọ hiện có trong hệ thống và đưa ra bảng xếp hạng đề xuất (Recommendations) tốt nhất.

Với mỗi phòng trọ được chọn, hãy chấm điểm độ phù hợp (matchScore từ 60 đến 99%), giải thích lý do thuyết phục, nêu bật các ưu điểm nổi bật (highlights) và đánh giá mức độ phù hợp ngân sách.
Đồng thời đưa ra lời khuyên thực tế (generalAdvice) khi thuê trọ khu vực này và các từ khóa tìm kiếm hữu ích (suggestedSearchTerms).`;

        const userPrompt = `Yêu cầu từ người thuê trọ:
- Câu hỏi / Nhu cầu tự do: "${prompt || 'Tìm phòng trọ phù hợp nhất'}"
- Ngân sách tối đa: ${budgetMax ? (budgetMax / 1000000).toFixed(1) + ' triệu/tháng' : 'Không giới hạn'}
- Khu vực ưu tiên: ${preferredArea || 'Tự do'}
- Loại phòng: ${roomType || 'Tất cả loại phòng'}
- Đối tượng: ${persona || 'Người đi thuê'}
- Tiện ích mong muốn: ${perks && perks.length ? perks.join(', ') : 'Cơ bản'}
${currentPlaceId ? `- Đang xem phòng ID ${currentPlaceId}, hãy tìm phòng tương tự tốt nhất.` : ''}

Danh sách phòng trọ hiện có trong hệ thống:
${JSON.stringify(placesSummary, null, 2)}`;

        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  recommendations: {
                    type: Type.ARRAY,
                    description: "Danh sách 4-6 phòng trọ phù hợp nhất được sắp xếp theo độ tương thích giảm dần",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        placeId: { type: Type.INTEGER, description: "ID phòng trọ" },
                        matchScore: { type: Type.INTEGER, description: "Điểm tương thích từ 60 đến 99" },
                        matchReason: { type: Type.STRING, description: "Lý do chi tiết vì sao phòng này phù hợp với người thuê" },
                        highlights: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "Các điểm nổi bật (2-3 gạch đầu dòng)"
                        },
                        budgetSuitability: { type: Type.STRING, description: "Đánh giá ngân sách ngắn gọn" }
                      },
                      required: ["placeId", "matchScore", "matchReason", "highlights", "budgetSuitability"]
                    }
                  },
                  generalAdvice: {
                    type: Type.STRING,
                    description: "Lời khuyên thực tế và kinh nghiệm khi thuê trọ theo tiêu chí này"
                  },
                  suggestedSearchTerms: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Gợi ý 3-4 cụm từ khóa tìm kiếm phòng liên quan"
                  }
                },
                required: ["recommendations", "generalAdvice", "suggestedSearchTerms"]
              }
            }
          });
        } catch (modelErr) {
          // Backup attempt with flash-lite
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
            }
          });
        }

        const parsed = JSON.parse(response.text.trim());
        
        // Enrich recommendations with full place details
        const enrichedRecs = parsed.recommendations
          .map(rec => {
            const place = candidatePlaces.find(p => p.id === rec.placeId);
            return place ? { ...rec, place } : null;
          })
          .filter(Boolean);

        return res.json({
          recommendations: enrichedRecs,
          generalAdvice: parsed.generalAdvice,
          suggestedSearchTerms: parsed.suggestedSearchTerms,
          isAiPowered: true,
        });
      } catch (geminiError) {
        console.warn("[AI Studio] Gemini API call error, falling back to algorithmic matching:", geminiError.message);
      }
    }

    // Fallback to smart algorithmic recommendation
    const fallbackResult = algorithmicRecommendation(candidatePlaces, {
      prompt,
      budgetMax,
      preferredArea,
      roomType,
      perks,
      persona
    });

    const enrichedFallback = fallbackResult.recommendations
      .map(rec => {
        const place = candidatePlaces.find(p => p.id === rec.placeId);
        return place ? { ...rec, place } : null;
      })
      .filter(Boolean);

    return res.json({
      recommendations: enrichedFallback,
      generalAdvice: fallbackResult.generalAdvice,
      suggestedSearchTerms: fallbackResult.suggestedSearchTerms,
      isAiPowered: !!ai,
    });

  } catch (error) {
    console.error("[AI Studio] Recommendation error:", error);
    res.status(500).json({ error: "Không thể tạo gợi ý lúc này. Vui lòng thử lại sau." });
  }
});

// POST /api/ai/analyze-place
router.post("/analyze-place", async (req, res) => {
  try {
    const { placeId } = req.body;
    const place = await prisma.place.findUnique({
      where: { id: parseInt(placeId, 10) },
      include: { perks: true }
    });

    if (!place) {
      return res.status(404).json({ error: "Không tìm thấy phòng trọ" });
    }

    const ai = getAiClient();
    if (ai) {
      try {
        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: `Phân tích ngắn gọn ưu/nhược điểm và đối tượng thuê phù hợp nhất cho phòng trọ sau:
Tiêu đề: ${place.title}
Địa chỉ: ${place.address}
Giá: ${(place.price / 1000000).toFixed(1)} triệu/tháng
Diện tích: ${place.area} m²
Mô tả: ${place.description}
Tiện ích: ${(place.perks || []).map(p => p.perk).join(', ')}`,
            config: {
              systemInstruction: "Bạn là chuyên gia thẩm định phòng trọ. Hãy phân tích ngắn gọn, khách quan, hữu ích cho người thuê trọ.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  suitability: { type: Type.STRING, description: "Đối tượng phù hợp nhất (sinh viên, người đi làm, gia đình...)" },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 điểm cộng lớn nhất" },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "1-2 lưu ý cần cân nhắc" },
                  estimatedMonthlyExpenses: { type: Type.STRING, description: "Ước tính tổng chi phí sinh hoạt/tháng (tiền phòng + điện nước + dịch vụ)" }
                },
                required: ["suitability", "pros", "cons", "estimatedMonthlyExpenses"]
              }
            }
          });
        } catch (mErr) {
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: `Phân tích ngắn gọn ưu/nhược điểm phòng trọ: ${place.title}, địa chỉ: ${place.address}, giá: ${place.price}đ`,
            config: {
              systemInstruction: "Bạn là chuyên gia thẩm định phòng trọ. Phân tích ngắn gọn dạng JSON.",
              responseMimeType: "application/json",
            }
          });
        }
        const parsed = JSON.parse(response.text.trim());
        return res.json({ analysis: parsed, isAi: true });
      } catch (err) {
        // Continue to fallback
      }
    }

    // Fallback analysis
    const isBudget = place.price <= 3000000;
    return res.json({
      analysis: {
        suitability: isBudget ? "Sinh viên, người mới đi làm tìm kiếm chỗ ở tiết kiệm chi phí" : "Người đi làm văn phòng, cặp đôi cần không gian riêng tư, tiện nghi",
        pros: [
          `Vị trí thuận tiện tại ${place.address.split(',').slice(-2).join(',').trim()}`,
          `Diện tích ${place.area}m² thoáng mát`,
          `Có sẵn các tiện ích thiết yếu: ${(place.perks || []).slice(0, 3).map(p => p.perk).join(', ')}`
        ],
        cons: [
          place.duration > 6 ? `Hợp đồng tối thiểu ${place.duration} tháng cần cam kết dài hạn` : "Cần liên hệ sớm vì các phòng khu vực này thường nhanh hết chỗ"
        ],
        estimatedMonthlyExpenses: `Khoảng ${(place.price / 1000000 + 0.5).toFixed(1)} - ${(place.price / 1000000 + 0.9).toFixed(1)} triệu/tháng (đã gồm điện, nước, internet)`
      },
      isAi: false
    });
  } catch (error) {
    console.error("[AI Studio] Analyze error:", error);
    res.status(500).json({ error: "Lỗi phân tích phòng trọ" });
  }
});

module.exports = router;
