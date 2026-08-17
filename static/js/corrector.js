const textInput = document.getElementById("text");

const imageInput = document.getElementById("imageInput");

const uploadArea = document.getElementById("uploadArea");

const imagePreviewContainer =
    document.getElementById("imagePreviewContainer");

const imagePreview =
    document.getElementById("imagePreview");

const imageName =
    document.getElementById("imageName");

const removeImageBtn =
    document.getElementById("removeImageBtn");

const correctBtn =
    document.getElementById("correctBtn");

const loadingBox =
    document.getElementById("loadingBox");

const resultBox =
    document.getElementById("resultBox");

const correctedText =
    document.getElementById("correctedText");

const changesList =
    document.getElementById("changesList");

const errorBox =
    document.getElementById("errorBox");

const copyBtn =
    document.getElementById("copyBtn");


// ========================================
// IMAGE SELECTION
// ========================================

imageInput.addEventListener(
    "change",
    function () {

        const file = this.files[0];

        if (!file) {
            return;
        }


        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp"
        ];


        if (!allowedTypes.includes(file.type)) {

            showError(
                "صيغة الصورة غير مدعومة. استخدم PNG أو JPG أو WEBP."
            );

            imageInput.value = "";

            return;
        }


        imageName.textContent = file.name;


        const reader = new FileReader();


        reader.onload = function (event) {

            imagePreview.src =
                event.target.result;

            imagePreviewContainer.classList.remove(
                "hidden"
            );

            uploadArea.classList.add(
                "hidden"
            );
        };


        reader.readAsDataURL(file);

    }
);


// ========================================
// REMOVE IMAGE
// ========================================

removeImageBtn.addEventListener(
    "click",
    function () {

        imageInput.value = "";

        imagePreview.src = "";

        imageName.textContent =
            "لم يتم اختيار صورة";

        imagePreviewContainer.classList.add(
            "hidden"
        );

        uploadArea.classList.remove(
            "hidden"
        );
    }
);


// ========================================
// CORRECT
// ========================================

correctBtn.addEventListener(
    "click",
    async function () {

        hideError();

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


        const language =
            document.getElementById(
                "language"
            ).value;


        const level =
            document.getElementById(
                "level"
            ).value;


        const formData =
            new FormData();


        formData.append(
            "text",
            text
        );


        formData.append(
            "language",
            language
        );


        formData.append(
            "level",
            level
        );


        // مهم جدًا
        // اسم image يجب أن يطابق request.files.get("image")
        if (image) {

            formData.append(
                "image",
                image
            );
        }


        // UI

        correctBtn.disabled = true;

        correctBtn.textContent =
            "جاري التصحيح...";

        loadingBox.classList.remove(
            "hidden"
        );

        resultBox.classList.add(
            "hidden"
        );


        try {

            const response =
                await fetch(
                    "/correct",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.error ||
                    "حدث خطأ أثناء التصحيح."
                );
            }


            displayResult(
                data.result
            );


        } catch (error) {

            console.error(
                "Corrector error:",
                error
            );

            showError(
                error.message
            );


        } finally {

            correctBtn.disabled =
                false;

            correctBtn.textContent =
                "✨ تصحيح النص";

            loadingBox.classList.add(
                "hidden"
            );
        }

    }
);


// ========================================
// DISPLAY RESULT
// ========================================

function displayResult(result) {

    if (!result) {

        showError(
            "لم تصل نتيجة صحيحة من الخادم."
        );

        return;
    }


    correctedText.textContent =
        result.corrected_text || "";


    changesList.innerHTML = "";


    if (
        result.changes &&
        Array.isArray(result.changes)
    ) {

        result.changes.forEach(
            function (change) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "change-item";


                item.innerHTML = `
                    <div>
                        <span class="change-label">
                            قبل
                        </span>

                        <p>
                            ${escapeHTML(
                                change.original || ""
                            )}
                        </p>
                    </div>

                    <div>
                        <span class="change-label">
                            بعد
                        </span>

                        <p>
                            ${escapeHTML(
                                change.corrected || ""
                            )}
                        </p>
                    </div>

                    <small>
                        ${escapeHTML(
                            change.reason || ""
                        )}
                    </small>
                `;


                changesList.appendChild(
                    item
                );

            }
        );

    }


    resultBox.classList.remove(
        "hidden"
    );


    resultBox.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ========================================
// COPY
// ========================================

copyBtn.addEventListener(
    "click",
    async function () {

        const text =
            correctedText.textContent;


        if (!text) {
            return;
        }


        try {

            await navigator.clipboard.writeText(
                text
            );


            copyBtn.textContent =
                "✅ تم النسخ";


            setTimeout(
                function () {

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


// ========================================
// ERROR
// ========================================

function showError(message) {

    errorBox.textContent =
        message;

    errorBox.classList.remove(
        "hidden"
    );
}


function hideError() {

    errorBox.classList.add(
        "hidden"
    );

    errorBox.textContent = "";
}


// ========================================
// SECURITY
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;
}