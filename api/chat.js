const axios = require('axios');

export default async function handler(req, res) {
    // 1. الأمان: السماح فقط بطلبات POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    // 2. التحقق من مفتاح التطبيق
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== 'Bearer OMAR_PRO_SECRET_KEY') {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    const { message } = req.body;
    
    // 3. مفتاح Groq (سيتم استخدامه من سيرفر Vercel في أمريكا)
    const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";

    try {
        // 4. الاتصال بموديل مستقر جداً ومجاني (Llama 3.1 8B)
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "أنت 'عمر'، مهندس ميكروتك خبير ومساعد ذكي متفاعل جداً. رد بأسلوب لبق ومفصل كأنك ChatGPT. للأوامر التقنية ضع الكود في النهاية هكذا [CMD]/ip/print[CMD]"
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

        // 5. إرسال الرد لتطبيقك في اليمن
        const replyText = response.data.choices[0].message.content;
        res.status(200).json({ reply: replyText });

    } catch (error) {
        console.error("Error details:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            error: "فشل الاتصال بالذكاء الاصطناعي", 
            details: error.response ? error.response.data.error.message : error.message 
        });
    }
}
