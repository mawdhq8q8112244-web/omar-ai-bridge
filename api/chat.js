const axios = require('axios');

export default async function handler(req, res) {
    // 1. السماح فقط بطلبات POST لزيادة الأمان
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    // 2. التأكد من هوية التطبيق (Security Check)
    const authHeader = req.headers.authorization;
    const APP_SECRET_KEY = "OMAR_PRO_SECRET_KEY";

    if (!authHeader || authHeader !== `Bearer ${APP_SECRET_KEY}`) {
        return res.status(401).json({ error: "Unauthorized access: المفتاح السري للجسر غير صحيح" });
    }

    const { message } = req.body;

    // 3. مفتاح Groq (يفضل وضعه في Environment Variables في Vercel، أو تركه هنا للسرعة حالياً)
    const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";

    // 4. قائمة بأقوى الموديلات الذكية (سنجربها بالترتيب لضمان النجاح 100%)
    const models = [
        "llama-3.3-70b-versatile",
        "llama-3.1-70b-versatile",
        "mixtral-8x7b-32768"
    ];

    let lastError = null;

    for (const model of models) {
        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: model,
                messages: [
                    {
                        role: "system",
                        content: `أنت 'عمر'، مهندس ميكروتك يمني عبقري وخبير شبكات عالمي.
                        - ردودك يجب أن تكون ذكية جداً، تقنية، ومفصلة.
                        - تفاعل مع المستخدم بلهجة ودودة (يا غالي، يا بطل).
                        - إذا طلب العميل أمراً برمجياً، ضع الكود في نهاية الرد حصراً بصيغة: [CMD]/الأمر[CMD].
                        - كن مثل ChatGPT في قدرتك على تحليل المشاكل واقتراح حلول هندسية متطورة.`
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

            // إذا نجح الاتصال بموديل، أرسل الرد فوراً للتطبيق
            const reply = response.data.choices[0].message.content;
            return res.status(200).json({ reply: reply });

        } catch (error) {
            lastError = error;
            console.error(`Model ${model} failed, trying next...`);
            continue; 
        }
    }

    // إذا فشلت كل المحاولات
    res.status(500).json({ 
        error: "فشل الاتصال بالذكاء الاصطناعي العالمي من السيرفر الأمريكي", 
        details: lastError?.message 
    });
}
