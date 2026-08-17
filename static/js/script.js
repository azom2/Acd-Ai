// =====================================================
// ACADAI WRITER
// =====================================================


// =====================================================
// ELEMENTS
// =====================================================

const promptInput =
    document.getElementById("prompt");

const projectType =
    document.getElementById("projectType");

const pageCount =
    document.getElementById("pageCount");

const template =
    document.getElementById("template");

const generateBtn =
    document.getElementById("generateBtn");

const loadingBox =
    document.getElementById("loadingBox");

const loadingText =
    document.getElementById("loadingText");

const errorBox =
    document.getElementById("errorBox");

const successBox =
    document.getElementById("successBox");

const projectResult =
    document.getElementById("projectResult");

const projectTitle =
    document.getElementById("projectTitle");

const projectPages =
    document.getElementById("projectPages");


// =====================================================
// ERROR
// =====================================================

function showError(message) {

    if (!errorBox) {
        alert(message);
        return;
    }

    errorBox.textContent =
        "❌ " + message;

    errorBox.classList.remove(
        "hidden"
    );

    if (successBox) {

        successBox.classList.add(
            "hidden"
        );

    }
}


function clearMessages() {

    if (errorBox) {

        errorBox.textContent = "";

        errorBox.classList.add(
            "hidden"
        );

    }

    if (successBox) {

        successBox.textContent = "";

        successBox.classList.add(
            "hidden"
        );

    }

}


function showSuccess(message) {

    if (!successBox) {
        return;
    }

    successBox.textContent =
        "✅ " + message;

    successBox.classList.remove(
        "hidden"
    );

    if (errorBox) {

        errorBox.classList.add(
            "hidden"
        );

    }

}


// =====================================================
// LOADING
// =====================================================

function startLoading(message) {

    if (loadingBox) {

        loadingBox.classList.remove(
            "hidden"
        );

    }

    if (loadingText) {

        loadingText.textContent =
            message;

    }

}


function stopLoading() {

    if (loadingBox) {

        loadingBox.classList.add(
            "hidden"
        );

    }

}


// =====================================================
// GENERATE PROJECT
// =====================================================

if (generateBtn) {

    generateBtn.addEventListener(
        "click",
        async function () {

            clearMessages();


            // -----------------------------------------
            // GET PROMPT
            // -----------------------------------------

            const prompt =
                promptInput
                    ? promptInput.value.trim()
                    : "";


            if (!prompt) {

                showError(
                    "اكتب طلب المشروع أولًا."
                );

                if (promptInput) {

                    promptInput.focus();

                }

                return;

            }


            // -----------------------------------------
            // PAGE COUNT
            // -----------------------------------------

            let pages =
                parseInt(
                    pageCount
                        ? pageCount.value
                        : "10"
                );


            if (isNaN(pages)) {

                pages = 10;

            }


            if (pages < 1) {

                pages = 1;

            }


            if (pages > 100) {

                pages = 100;

            }


            // -----------------------------------------
            // DISABLE BUTTON
            // -----------------------------------------

            generateBtn.disabled =
                true;


            startLoading(
                "جاري تخطيط مشروعك..."
            );


            if (projectResult) {

                projectResult.classList.add(
                    "hidden"
                );

            }


            try {

                // -------------------------------------
                // SEND REQUEST
                // -------------------------------------

                const response =
                    await fetch(
                        "/generate",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    prompt:
                                        prompt,

                                    page_count:
                                        pages,

                                    project_type:
                                        projectType
                                            ? projectType.value
                                            : "بحث جامعي",

                                    template:
                                        template
                                            ? template.value
                                            : "academic"

                                })

                        }
                    );


                // -------------------------------------
                // READ RESPONSE
                // -------------------------------------

                let data;


                try {

                    data =
                        await response.json();

                }
                catch (jsonError) {

                    throw new Error(
                        "الخادم لم يُرجع نتيجة صحيحة."
                    );

                }


                // -------------------------------------
                // SERVER ERROR
                // -------------------------------------

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "حدث خطأ أثناء إنشاء المشروع."
                    );

                }


                // -------------------------------------
                // APPLICATION ERROR
                // -------------------------------------

                if (!data.success) {

                    throw new Error(
                        data.error ||
                        "تعذر إنشاء المشروع."
                    );

                }


                // -------------------------------------
                // PROJECT CHECK
                // -------------------------------------

                if (!data.project) {

                    throw new Error(
                        "لم يتم إرجاع المشروع من الخادم."
                    );

                }


                // -------------------------------------
                // DISPLAY PROJECT
                // -------------------------------------

                displayProject(
                    data.project
                );


                showSuccess(
                    "تم إنشاء مشروعك بنجاح."
                );


            }
            catch (error) {

                console.error(
                    "GENERATE ERROR:",
                    error
                );


                showError(
                    error.message ||
                    "حدث خطأ غير معروف."
                );

            }
            finally {

                stopLoading();

                generateBtn.disabled =
                    false;

            }

        }
    );

}


// =====================================================
// DISPLAY PROJECT
// =====================================================

function displayProject(project) {

    if (!projectResult) {
        return;
    }


    projectResult.classList.remove(
        "hidden"
    );


    // -----------------------------------------
    // TITLE
    // -----------------------------------------

    if (projectTitle) {

        projectTitle.textContent =
            project.project_title ||
            "مشروع جديد";

    }


    if (!projectPages) {
        return;
    }


    // -----------------------------------------
    // CLEAR OLD PROJECT
    // -----------------------------------------

    projectPages.innerHTML = "";


    // -----------------------------------------
    // GET PAGES
    // -----------------------------------------

    const pages =
        Array.isArray(
            project.pages
        )
            ? project.pages
            : [];


    if (pages.length === 0) {

        projectPages.innerHTML =
            "<p>لم يتم إنشاء صفحات للمشروع.</p>";

        return;

    }


    // -----------------------------------------
    // CREATE PAGES
    // -----------------------------------------

    pages.forEach(
        function (page, index) {

            const pageElement =
                document.createElement(
                    "article"
                );


            pageElement.className =
                "project-page";


            // PAGE TITLE

            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                page.title ||
                `صفحة ${index + 1}`;


            // PAGE CONTENT

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "page-content";


            content.textContent =
                page.content ||
                "";


            // ADD

            pageElement.appendChild(
                title
            );

            pageElement.appendChild(
                content
            );

            projectPages.appendChild(
                pageElement
            );

        }
    );

}


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "GLOBAL ERROR:",
            event.error
        );

    }
);