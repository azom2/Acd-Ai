const promptInput =
document.getElementById("prompt");

const projectType =
document.getElementById("projectType");

const pageCount =
document.getElementById("pageCount");

const language =
document.getElementById("language");

const analyzeBtn =
document.getElementById("analyzeBtn");

const generateBtn =
document.getElementById("generateBtn");

const designResult =
document.getElementById("designResult");

const loading =
document.getElementById("loading");

const loadingStep =
document.getElementById("loadingStep");

const progressBar =
document.getElementById("progressBar");

const projectResult =
document.getElementById("projectResult");

let currentDesign = null;


/* =====================================================
   ANALYZE DESIGN
===================================================== */

analyzeBtn.addEventListener(
"click",
async function(){

const prompt =
promptInput.value.trim();

if(!prompt){

alert(
"اكتب موضوع المشروع أولًا."
);

return;

}

analyzeBtn.disabled = true;

analyzeBtn.textContent =
"⏳ AcadAI يحلل الموضوع...";

try{

const response =
await fetch(
"/analyze-design",
{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

prompt:prompt,

project_type:
projectType.value,

page_count:
pageCount.value,

language:
language.value

})
}
);

const data =
await response.json();

if(!response.ok){

throw new Error(
data.error ||
"حدث خطأ."
);

}

if(data.error){

throw new Error(
data.error
);

}

currentDesign =
data.design;

showDesign(
data.design
);

}
catch(error){

alert(
"خطأ: " +
error.message
);

console.error(error);

}

analyzeBtn.disabled = false;

analyzeBtn.textContent =
"🎨 تحليل الموضوع واختيار التصميم";

});


/* =====================================================
   SHOW DESIGN
===================================================== */

function showDesign(design){

designResult.classList.remove(
"hidden"
);

document.getElementById(
"designName"
).textContent =
design.design_name ||
"تصميم AcadAI";

document.getElementById(
"designCategory"
).textContent =
design.category ||
"Smart Design";

document.getElementById(
"fontValue"
).textContent =
design.typography?.font ||
"Arial";

document.getElementById(
"colorsValue"
).textContent =
(
design.colors?.primary ||
"#2563eb"
) +
" / " +
(
design.colors?.secondary ||
"#64748b"
);

document.getElementById(
"styleValue"
).textContent =
design.visual_style ||
"Modern";


const preview =
document.getElementById(
"previewPage"
);

const title =
document.getElementById(
"previewTitle"
);

const line =
document.getElementById(
"previewLine"
);

const text =
document.getElementById(
"previewText"
);


const colors =
design.colors || {};

const background =
design.background || {};

const typography =
design.typography || {};


preview.style.background =
background.color ||
"#ffffff";

preview.style.color =
colors.text ||
"#111827";

preview.style.fontFamily =
typography.font ||
"Arial";


title.style.color =
colors.primary ||
"#2563eb";

line.style.color =
colors.secondary ||
"#64748b";

text.style.fontSize =
(
typography.body_size ||
18
) + "px";

text.style.lineHeight =
typography.line_height ||
2;


title.textContent =
design.design_name ||
"عنوان المشروع";

line.textContent =
design.category ||
"AcadAI";

text.textContent =
design.description ||
"سيتم إنشاء المشروع وفق الهوية البصرية التي اختارها AcadAI.";

}


/* =====================================================
   GENERATE PROJECT
===================================================== */

generateBtn.addEventListener(
"click",
async function(){

if(!currentDesign){

alert(
"حلل التصميم أولًا."
);

return;

}

designResult.classList.add(
"hidden"
);

loading.classList.remove(
"hidden"
);

projectResult.innerHTML = "";

generateBtn.disabled = true;

startProgress();


try{

const response =
await fetch(
"/generate",
{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

prompt:
promptInput.value.trim(),

project_type:
projectType.value,

page_count:
pageCount.value,

language:
language.value,

design:
currentDesign

})
}
);

const data =
await response.json();

if(!response.ok){

throw new Error(
data.error ||
"حدث خطأ في الخادم."
);

}

if(data.error){

throw new Error(
data.error
);

}

finishProgress();

renderProject(
data.project
);

}
catch(error){

loading.classList.add(
"hidden"
);

projectResult.innerHTML = `

<div class="create-card">

<h2>❌ حدث خطأ</h2>

<p>
${escapeHTML(error.message)}
</p>

</div>

`;

console.error(error);

}

generateBtn.disabled = false;

});


/* =====================================================
   PROGRESS
===================================================== */

function startProgress(){

const steps = [

"تحليل موضوع المشروع...",

"تحديد هوية التصميم...",

"بناء هيكل الصفحات...",

"كتابة المحتوى...",

"تنسيق العناصر...",

"تجهيز المشروع..."

];

let progress = 5;

progressBar.style.width =
progress + "%";

let index = 0;

loadingStep.textContent =
steps[0];

const interval =
setInterval(
function(){

if(index <
steps.length - 1){

index++;

progress += 12;

if(progress > 90){
progress = 90;
}

progressBar.style.width =
progress + "%";

loadingStep.textContent =
steps[index];

}else{

clearInterval(interval);

}

},
2500
);

window.currentProgressInterval =
interval;

}


function finishProgress(){

if(window.currentProgressInterval){

clearInterval(
window.currentProgressInterval
);

}

progressBar.style.width =
"100%";

loadingStep.textContent =
"تم إنشاء المشروع ✓";

setTimeout(
function(){

loading.classList.add(
"hidden"
);

},
700
);

}


/* =====================================================
   RENDER PROJECT
===================================================== */

function renderProject(project){

if(!project){

return;

}

let html = `

<div class="create-card">

<h2>
✦ ${escapeHTML(
project.project_title ||
"مشروع AcadAI"
)}
</h2>

<p>
${escapeHTML(
project.project_type ||
""
)}
&nbsp; • &nbsp;
${project.total_pages || 0}
صفحة
</p>

<button
class="primary-button"
onclick="window.print()"
>

🖨️ طباعة / حفظ PDF

</button>

</div>

`;

const pages =
project.pages || [];

const design =
project.design || {};

pages.forEach(
function(page,index){

const colors =
design.colors || {};

const background =
design.background || {};

const typography =
design.typography || {};

let content =
formatContent(
page.content || ""
);

html += `

<section
class="project-page"
style="

background:
${safeCSS(
background.color ||
"#ffffff"
)};

color:
${safeCSS(
colors.text ||
"#111827"
)};

font-family:
${safeCSS(
typography.font ||
"Arial"
)};

"
>

<h1
class="project-title"
style="
color:
${safeCSS(
colors.primary ||
"#2563eb"
)};
"
>

${escapeHTML(
page.title || ""
)}

</h1>

${
page.subtitle
?
`
<h3>
${escapeHTML(
page.subtitle
)}
</h3>
`
:
""
}

<div class="project-content">

${content}

</div>

${renderVisuals(
page.visuals || [],
colors
)}

<div class="project-page-number">

${page.page_number || index + 1}

</div>

</section>

`;

});

projectResult.innerHTML =
html;

}


/* =====================================================
   VISUALS
===================================================== */

function renderVisuals(
visuals,
colors
){

if(!Array.isArray(visuals) ||
visuals.length === 0){

return "";

}

let html = "";

visuals.forEach(
function(item){

html += `

<div
class="visual-box"
style="
border:
1px solid
${safeCSS(
colors.primary ||
"#2563eb"
)};
"
>

${escapeHTML(
String(item)
)}

</div>

`;

});

return html;

}


/* =====================================================
   FORMAT
===================================================== */

function formatContent(content){

return escapeHTML(
String(content)
)
.replace(
/\n/g,
"<br>"
);

}


/* =====================================================
   ESCAPE
===================================================== */

function escapeHTML(text){

const div =
document.createElement(
"div"
);

div.textContent =
String(text);

return div.innerHTML;

}


/* =====================================================
   SAFE CSS
===================================================== */

function safeCSS(value){

return String(value)
.replace(
/[^a-zA-Z0-9#(),.%\s-]/g,
""
);

}