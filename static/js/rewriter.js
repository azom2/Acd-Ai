const textInput =
    document.getElementById("textInput");

const imageInput =
    document.getElementById("imageInput");

const imageName =
    document.getElementById("imageName");

const imagePreview =
    document.getElementById("imagePreview");

const imagePreviewContainer =
    document.getElementById(
        "imagePreviewContainer"
    );

const removeImageBtn =
    document.getElementById(
        "removeImageBtn"
    );

const charCount =
    document.getElementById("charCount");

const language =
    document.getElementById("language");

const style =
    document.getElementById("style");

const rewriteBtn =
    document.getElementById("rewriteBtn");

const loadingBox =
    document.getElementById("loadingBox");

const errorBox =
    document.getElementById("errorBox");

const resultSection =
    document.getElementById(
        "resultSection"
    );

const extractedBox =
    document.getElementById(
        "extractedBox"
    );

const extractedText =
    document.getElementById(
        "extractedText"
    );

const rewrittenText =
    document.getElementById(
        "rewrittenText"
    );

const spellingWarning =
    document.getElementById(
        "spellingWarning"
    );

const warningMessage =
    document.getElementById(
        "warningMessage"
    );

const copyBtn =
    document.getElementById(
        "copyBtn"
    );


/* =====================================
   CHARACTER COUNT
===================================== */

textInput.addEventListener(
    "input",
    () => {

        charCount.textContent =
            textInput.value.length;

    }
);


/* =====================================
   IMAGE SELECT
===================================== */

imageInput.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files[0];

        if (!file) {
            return;
        }

        imageName.textContent =
            file.name;

        const reader =
            new FileReader();

        reader.onload = (
            event
        ) => {

            imagePreview.src =
                event.target.result;

            imagePreviewContainer
                .classList
                .remove("hidden");

        };

        reader.readAsDataURL(file);

    }
);


/* =====================================
   REMOVE IMAGE
===================================== */

removeImageBtn.addEventListener(
    "click",
    () => {

        imageInput.value = "";

        imageName.textContent =
            "لم يتم اختيار صورة";

        imagePreview.src = "";

        imagePreviewContainer
            .classList
            .add("hidden");

    }
);


/* =====================================
   REWRITE
===================================== */

rewriteBtn.addEventListener(
    "click",
    async () => {

        const text =
            textInput.value.trim();

        const image =
            imageInput.files[0];


        if (!text && !image) {

            showError(
                "اكتب نصًا أو ارفع صورة أولًا."
            );

            return;
        }


        hideError();

        rewriteBtn.disabled = true;

        loadingBox
            .classList
            .remove("hidden");


        const formData =
            new FormData();


        formData.append(
            "text",
            text
        );


        formData.append(
            "language",
            language.value
        );


        formData.append(
            "style",
            style.value
        );


        if (image) {

            formData.append(
                "image",
                image
            );
formData.append(
    "improvement",
    improvement.value
);
        }


        try {

            const response =
                await fetch(
                    "/rewrite",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.error ||
                    "حدث خطأ أثناء إعادة الصياغة."
                );

            }


            displayResult(
                data.result
            );


        } catch (error) {

            console.error(
                "REWRITER ERROR:",
                error
            );

            showError(
                error.message
            );

        } finally {

            rewriteBtn.disabled = false;

            loadingBox
                .classList
                .add("hidden");

        }

    }
);


/* =====================================
   DISPLAY RESULT
===================================== */

function displayResult(result) {

    resultSection
        .classList
        .remove("hidden");


    const extracted =
        result.extracted_text || "";


    if (extracted) {

        extractedText.textContent =
            extracted;

        extractedBox
            .classList
            .remove("hidden");

    } else {

        extractedBox
            .classList
            .add("hidden");

    }


    rewrittenText.textContent =
        result.rewritten_text || "";


    if (
        result.has_spelling_errors ||
        result.suggest_corrector
    ) {

        warningMessage.textContent =
            result.error_message ||
            "تم العثور على أخطاء إملائية أو نحوية. ننصحك باستخدام AI Corrector.";

        spellingWarning
            .classList
            .remove("hidden");

    } else {

        spellingWarning
            .classList
            .add("hidden");

    }


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =====================================
   COPY
===================================== */

copyBtn.addEventListener(
    "click",
    async () => {

        const text =
            rewrittenText.textContent.trim();

        if (!text) {
            return;
        }

        try {

            await navigator.clipboard
                .writeText(text);


            copyBtn.textContent =
                "✅ تم النسخ";


            setTimeout(
                () => {

                    copyBtn.textContent =
                        "📋 نسخ";

                },
                1500
            );


        } catch {

            showError(
                "تعذر نسخ النص."
            );

        }

    }
);


/* =====================================
   ERROR
===================================== */

function showError(message) {

    errorBox.textContent =
        "❌ " + message;

    errorBox
        .classList
        .remove("hidden");

}


function hideError() {

    errorBox
        .classList
        .add("hidden");

}
const improvement =
    document.getElementById("improvement");