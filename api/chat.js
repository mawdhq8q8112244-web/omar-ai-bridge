const axios = require('axios');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const authHeader = req.headers.authorization;
    const APP_SECRET_KEY = "OMAR_PRO_SECRET_KEY";

    if (!authHeader || authHeader !== `Bearer ${APP_SECRET_KEY}`) {
        return res.status(401).json({ error: "Unauthorized: مفتاح الوصول للجسر غير صحيح" });
    }

    const { message } = req.body;

    // الحل الاحترافي: قراءة المفتاح من بيئة السيرفر (Environment Variable)
    // لكي لا يظهر في GitHub ويتم حظره
    const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "أنت 'عمر'، مهندس ميكروتك عبقري ومساعد ذكي متفاعل. رد بأسلوب لبق ومفصل جداً (مثل ChatGPT). للأوامر التقنية للميكروتك، ضع الكود في نهاية الرد حصراً بين [CMD] و [CMD]."
                },
                { role: "user", content: message }
            ],
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json({ reply: response.data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ error: "فشل الجسر في الاتصال بالذكاء الاصطناعي", details: error.message });
    }
}
