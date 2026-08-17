from flask import Flask, render_template, request, jsonify
from google import genai
from google.genai import types
import os
import json
import time


# =========================================================
# FLASK
# =========================================================

app = Flask(__name__)


# =========================================================
# GEMINI API
# =========================================================

API_KEY = os.environ.get("GEMINI_API_KEY")

if not API_KEY:
    print("WARNING: GEMINI_API_KEY غير موجود.")

client = None

if API_KEY:
    client = genai.Client(
        api_key=API_KEY
    )


# =========================================================
# GEMINI MODELS
# =========================================================

MODELS = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
]


# =========================================================
# GEMINI GENERATOR
# =========================================================

def generate_with_fallback(contents):

    if client is None:
        raise Exception(
            "GEMINI_API_KEY غير موجود. "
            "ضع مفتاح Gemini في متغير البيئة أولًا."
        )

    last_error = None

    for model_name in MODELS:

        print(
            f"Trying Gemini model: {model_name}"
        )

        for attempt in range(2):

            try:

                response = client.models.generate_content(
                    model=model_name,
                    contents=contents
                )

                if response and response.text:

                    print(
                        f"SUCCESS: {model_name}"
                    )

                    return response

            except Exception as e:

                last_error = e

                error_text = str(e).lower()

                print(
                    f"ERROR [{model_name}]: {e}"
                )

                temporary_error = (
                    "503" in error_text
                    or "unavailable" in error_text
                    or "429" in error_text
                    or "resource exhausted" in error_text
                    or "high demand" in error_text
                    or "rate limit" in error_text
                )

                if temporary_error:

                    if attempt == 0:

                        time.sleep(2)

                        continue

                    break

                break

    raise Exception(
        "تعذر استخدام نماذج Gemini. "
        f"آخر خطأ: {last_error}"
    )


# =========================================================
# CLEAN JSON
# =========================================================

def clean_json(text):

    if not text:
        return ""

    text = text.strip()

    if text.startswith("```json"):
        text = text[7:]

    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# =========================================================
# AI WRITER
# =========================================================

@app.route("/writer")
def writer():

    return render_template(
        "writer.html"
    )


# =========================================================
# AI REWRITER
# =========================================================

@app.route("/rewriter")
def rewriter():

    return render_template(
        "rewriter.html"
    )


# =========================================================
# AI CORRECTOR
# =========================================================

@app.route("/corrector")
def corrector():

    return render_template(
        "corrector.html"
    )


# =========================================================
# AI WRITER
# =========================================================

@app.route(
    "/generate",
    methods=["POST"]
)
def generate():

    try:

        data = request.get_json(
            silent=True
        ) or {}

        prompt = data.get(
            "prompt",
            ""
        ).strip()

        page_count = data.get(
            "page_count",
            10
        )

        project_type = data.get(
            "project_type",
            "بحث جامعي"
        )

        template = data.get(
            "template",
            "academic"
        )

        if not prompt:

            return jsonify({
                "success": False,
                "error":
                    "اكتب ما تريد إنشاءه أولًا."
            }), 400


        try:

            page_count = int(
                page_count
            )

        except:

            page_count = 10


        page_count = max(
            1,
            min(
                page_count,
                100
            )
        )


        instructions = f"""
أنت AcadAI Writer.

مهمتك إنشاء مشروع أكاديمي كامل
حسب طلب المستخدم.

طلب المستخدم:
{prompt}

نوع المشروع:
{project_type}

القالب:
{template}

عدد الصفحات المطلوب:
{page_count}

================================

أنشئ المشروع نفسه.

لا تشرح للمستخدم كيفية إنشاء المشروع.

إذا كان المشروع طبيًا:
استخدم أسلوبًا طبيًا وأكاديميًا.

إذا كان بيولوجيًا:
استخدم أسلوبًا علميًا مناسبًا.

إذا كان تاريخيًا:
نظم المحتوى بطريقة تاريخية.

إذا كان تقنيًا:
استخدم أسلوبًا تقنيًا واضحًا.

إذا كان المشروع طويلًا:
قسمه إلى صفحات وأقسام وعناوين فرعية.

================================

يجب أن يحتوي المشروع عند الحاجة على:

- غلاف
- فهرس
- مقدمة
- أقسام رئيسية
- عناوين فرعية
- محتوى كامل
- خاتمة
- مراجع إذا طلبها المستخدم

================================

قواعد مهمة:

1. لا تخترع حقائق.

2. لا تخترع مراجع أو مصادر حقيقية.

3. لا تغير موضوع المستخدم.

4. اجعل المحتوى مناسبًا لطالب جامعي.

5. صحح اللغة والإملاء.

6. لا تضع المشروع كله في صفحة واحدة.

7. اجعل كل صفحة تحتوي على محتوى مناسب.

8. اختر تصميمًا مناسبًا للمشروع.

9. حدد الخط والألوان.

10. لا تقل Gemini للمستخدم.

11. استخدم اسم AcadAI.

12. إذا طلب المستخدم أكثر من 50 صفحة،
حاول إنشاء العدد المطلوب قدر الإمكان.

================================

أعد JSON فقط.

لا Markdown.

لا ```json.

لا كلام خارج JSON.

استخدم هذا الهيكل:

{{
    "project_title": "عنوان المشروع",

    "language": "لغة المشروع",

    "style": {{
        "font": "اسم الخط",
        "primary_color": "#000000",
        "secondary_color": "#000000",
        "background": "#ffffff"
    }},

    "pages": [

        {{
            "page_number": 1,
            "page_type": "cover",
            "title": "عنوان المشروع",
            "subtitle": "",
            "content": ""
        }},

        {{
            "page_number": 2,
            "page_type": "table_of_contents",
            "title": "الفهرس",
            "subtitle": "",
            "content": ""
        }},

        {{
            "page_number": 3,
            "page_type": "content",
            "title": "عنوان القسم",
            "subtitle": "",
            "content": "محتوى الصفحة"
        }}

    ]
}}
"""


        response = generate_with_fallback(
            instructions
        )


        text = clean_json(
            response.text
        )


        project = json.loads(
            text
        )


        return jsonify({

            "success": True,

            "project": project

        })


    except json.JSONDecodeError:

        return jsonify({

            "success": False,

            "error":
                "لم يرجع الذكاء الاصطناعي JSON صالحًا.",

            "raw_response":
                text
                if "text" in locals()
                else ""

        }), 500


    except Exception as e:

        print(
            "WRITER ERROR:",
            e
        )

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# =========================================================
# IMAGE HANDLER
# =========================================================

def get_image_part(file):

    if not file:
        return None


    filename = (
        file.filename
        .lower()
        .strip()
    )


    allowed_extensions = (
        ".png",
        ".jpg",
        ".jpeg",
        ".webp"
    )


    if not filename.endswith(
        allowed_extensions
    ):

        raise Exception(
            "صيغة الصورة غير مدعومة. "
            "استخدم PNG أو JPG أو JPEG أو WEBP."
        )


    image_bytes = file.read()


    if not image_bytes:

        raise Exception(
            "الصورة فارغة."
        )


    max_size = 10 * 1024 * 1024


    if len(image_bytes) > max_size:

        raise Exception(
            "حجم الصورة كبير جدًا. "
            "الحد الأقصى هو 10MB."
        )


    mime_type = file.mimetype


    if mime_type not in [
        "image/png",
        "image/jpeg",
        "image/webp"
    ]:

        raise Exception(
            "نوع الصورة غير مدعوم."
        )


    return types.Part.from_bytes(
        data=image_bytes,
        mime_type=mime_type
    )


# =========================================================
# AI REWRITER
# TEXT + IMAGE + ACADEMIC IMPROVEMENT
# =========================================================

@app.route(
    "/rewrite",
    methods=["POST"]
)
def rewrite():

    try:

        text = request.form.get(
            "text",
            ""
        ).strip()


        style = request.form.get(
            "style",
            "academic"
        )


        language = request.form.get(
            "language",
            "ar"
        )


        improvement = request.form.get(
            "improvement",
            "academic"
        )


        image = request.files.get(
            "image"
        )


        image_part = None


        if image and image.filename:

            image_part = get_image_part(
                image
            )


        if not text and not image_part:

            return jsonify({

                "success": False,

                "error":
                    "اكتب نصًا أو ارفع صورة أولًا."

            }), 400


        language_names = {

            "ar": "العربية",

            "fr": "الفرنسية",

            "en": "الإنجليزية"

        }


        style_names = {

            "academic":
                "أكاديمي",

            "professional":
                "احترافي",

            "simple":
                "بسيط وواضح",

            "scientific":
                "علمي",

            "creative":
                "إبداعي",

            "detailed":
                "مفصل",

            "short":
                "مختصر",

            "academic_pro":
                "أكاديمي احترافي"

        }


        improvement_names = {

            "language":
                "تحسين اللغة",

            "academic":
                "تحويل النص إلى أسلوب أكاديمي",

            "academic_pro":
                "تحسين أكاديمي متقدم",

            "presentation":
                "تحويل النص إلى نص احترافي جاهز للعرض الجامعي"

        }


        improvement_text = improvement_names.get(
            improvement,
            "تحسين أكاديمي"
        )


        prompt = f"""
أنت AcadAI Academic Rewriter.

مهمتك تحسين النص الذي يقدمه المستخدم.

هذه ليست مجرد إعادة صياغة بسيطة.

مستوى التحسين:
{improvement_text}

اللغة:
{language_names.get(language, "العربية")}

الأسلوب:
{style_names.get(style, "أكاديمي")}

========================================

إذا كان النص مقالًا علميًا طويلًا:

حوّله إلى نص أكاديمي احترافي.

قم بتحسين:

- اللغة
- القواعد
- الإملاء
- علامات الترقيم
- وضوح الجمل
- ترابط الأفكار
- الانتقال بين الفقرات
- المصطلحات العلمية
- ترتيب الأفكار
- تنظيم الفقرات
- العناوين
- العناوين الفرعية
- المقدمة
- الخاتمة
- الأسلوب الأكاديمي

========================================

إذا كان النص غير منظم:

قم بإعادة تنظيمه.

يمكنك إنشاء:

عنوان رئيسي

مقدمة

1. قسم رئيسي

1.1 قسم فرعي

1.2 قسم فرعي

2. قسم رئيسي

3. مناقشة

الخاتمة

لكن لا تضف أقسامًا غير ضرورية.

========================================

إذا كان النص طويلًا جدًا:

لا تختصره بشكل كبير.

حافظ على جميع المعلومات المهمة.

لا تحذف الأفكار الأساسية.

قم فقط بتحسين طريقة عرضها.

========================================

إذا كان الهدف عرضًا جامعيًا:

اجعل النص:

- رسميًا
- واضحًا
- منظمًا
- سهل القراءة
- مناسبًا للعرض أمام الأساتذة
- مناسبًا للبحوث الجامعية

========================================

قواعد مهمة جدًا:

لا تغير معنى النص.

لا تخترع معلومات.

لا تخترع أرقامًا.

لا تخترع نتائج علمية.

لا تخترع مراجع.

لا تضف مصادر غير موجودة.

لا تنسب معلومات إلى مصادر لم يقدمها المستخدم.

========================================

إذا كانت هناك صورة:

1. اقرأ النص الموجود في الصورة.

2. استخرج النص.

3. افهم النص.

4. حسنه حسب المستوى المطلوب.

5. حافظ على معنى النص.

========================================

إذا وجدت أخطاء إملائية أو نحوية:

في وضع التحسين الأكاديمي:
قم بتصحيحها.

في الوضع العادي:
أخبر المستخدم بوجودها
واقترح استخدام AI Corrector.

========================================

لا تقل Gemini.

استخدم AcadAI.

========================================

أعد JSON فقط.

ممنوع Markdown.

ممنوع ```json.

ممنوع أي كلام خارج JSON.

استخدم:

{{
    "extracted_text": "",

    "rewritten_text": "",

    "improvement_level": "{improvement}",

    "structure": {{

        "has_title": true,

        "has_introduction": true,

        "has_headings": true,

        "has_subheadings": true,

        "has_conclusion": true

    }},

    "quality": {{

        "language": 0,

        "academic_style": 0,

        "clarity": 0,

        "organization": 0,

        "readability": 0

    }},

    "has_spelling_errors": false,

    "error_message": "",

    "suggest_corrector": false
}}
"""


        contents = []


        if image_part:

            contents.append(
                image_part
            )


        if text:

            contents.append(

                prompt
                + "\n\nالنص الذي قدمه المستخدم:\n"
                + text

            )

        else:

            contents.append(
                prompt
            )


        response = generate_with_fallback(
            contents
        )


        result_text = clean_json(
            response.text
        )


        result = json.loads(
            result_text
        )


        return jsonify({

            "success": True,

            "result": result

        })


    except json.JSONDecodeError:

        return jsonify({

            "success": False,

            "error":
                "تعذر قراءة نتيجة إعادة الصياغة.",

            "raw_response":
                result_text
                if "result_text" in locals()
                else ""

        }), 500


    except Exception as e:

        print(
            "REWRITER ERROR:",
            e
        )


        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# =========================================================
# AI CORRECTOR
# TEXT + IMAGE
# =========================================================

@app.route(
    "/correct",
    methods=["POST"]
)
def correct():

    try:

        text = request.form.get(
            "text",
            ""
        ).strip()


        language = request.form.get(
            "language",
            "ar"
        )


        level = request.form.get(
            "level",
            "full"
        )


        image = request.files.get(
            "image"
        )


        image_part = None


        if image and image.filename:

            image_part = get_image_part(
                image
            )


        if not text and not image_part:

            return jsonify({

                "success": False,

                "error":
                    "اكتب نصًا أو ارفع صورة أولًا."

            }), 400


        language_names = {

            "ar": "العربية",

            "fr": "الفرنسية",

            "en": "الإنجليزية"

        }


        level_names = {

            "spelling":
                "تصحيح إملائي",

            "grammar":
                "تصحيح إملائي ونحوي",

            "full":
                "تصحيح كامل وتحسين الأسلوب"

        }


        prompt = f"""
أنت AcadAI Corrector.

مهمتك تصحيح النص.

اللغة:
{language_names.get(language, "العربية")}

نوع التصحيح:
{level_names.get(level, "تصحيح كامل")}

================================

إذا كانت هناك صورة:

اقرأ النص الموجود في الصورة.

استخرج النص.

ثم صححه.

================================

صحح:

- الأخطاء الإملائية
- الأخطاء النحوية
- علامات الترقيم
- الأسلوب إذا طلب المستخدم ذلك

================================

لا تغير معنى النص.

لا تخترع معلومات.

لا تضف معلومات غير موجودة.

لا تحذف معلومات مهمة.

================================

أعد JSON فقط:

{{
    "extracted_text": "",

    "corrected_text": "",

    "summary": {{

        "spelling": 0,

        "grammar": 0,

        "punctuation": 0,

        "style": 0

    }},

    "changes": [

        {{
            "original": "",
            "corrected": "",
            "reason": ""
        }}

    ]
}}

ممنوع Markdown.

ممنوع ```json.

ممنوع كلام خارج JSON.
"""


        contents = []


        if image_part:

            contents.append(
                image_part
            )


        if text:

            contents.append(

                prompt
                + "\n\nالنص:\n"
                + text

            )

        else:

            contents.append(
                prompt
            )


        response = generate_with_fallback(
            contents
        )


        result_text = clean_json(
            response.text
        )


        result = json.loads(
            result_text
        )


        return jsonify({

            "success": True,

            "result": result

        })


    except json.JSONDecodeError:

        return jsonify({

            "success": False,

            "error":
                "تعذر قراءة نتيجة التصحيح.",

            "raw_response":
                result_text
                if "result_text" in locals()
                else ""

        }), 500


    except Exception as e:

        print(
            "CORRECTOR ERROR:",
            e
        )


        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    print("")
    print("========================================")
    print("             AcadAI")
    print("========================================")
    print("Home      : /")
    print("Writer    : /writer")
    print("Rewriter  : /rewriter")
    print("Corrector : /corrector")
    print("========================================")
    print("")

    app.run(
        debug=True
    )