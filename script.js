const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrcUEpZOEZHXPpmyXDOMv8BoqFLvin4TwwI9nYfuKNpS4EUjR_RJqeA6TdJr7-0z0r/exec";

const form = document.getElementById("drawForm");
const phoneInput = document.getElementById("phone");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const btnLoader = document.getElementById("btnLoader");
const resultContainer = document.getElementById("resultContainer");
const resultBox = document.getElementById("resultBox");
const errorContainer = document.jsdelivr ? null : document.getElementById("errorContainer"); // للتوافق
const errorBox = document.getElementById("errorBox");

let isSubmitting = false;

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const phoneNumber = phoneInput.value.trim();

    if (!phoneNumber) {
        showError("❌ الرجاء إدخال رقم الهاتف");
        return;
    }

    if (phoneNumber.length < 10) {
        showError("❌ رقم الهاتف يجب أن يكون 10 أرقام على الأقل");
        return;
    }

    isSubmitting = true;
    submitBtn.disabled = true;
    btnText.classList.add("hidden");
    btnLoader.classList.remove("hidden");

    try {
        console.log("📤 جاري الإرسال إلى:", GOOGLE_APPS_SCRIPT_URL);

        // استخدام POST بدون no-cors عبر إرسال البيانات كـ JSON وبدء الاستجابة الصحيحة
        // ملاحظة: Google Apps Script يدعم CORS إذا تم التعامل معه عبر text/plain أو إرسال طلب عدي
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ phone: phoneNumber }),
            headers: {
                "Content-Type": "text/plain;charset=utf-8" // 👈 هذا الحل السحري لتجنب مشاكل CORS مع Google Apps Script
            }
        });

        const result = await response.json();
        console.log("📨 الرد:", result);

        if (result.status === "success") {
            showSuccess(result.message, result.discount || "مبارك!");
            phoneInput.value = "";
        } else {
            showError(result.message || "❌ حدث خطأ ما!");
        }

    } catch (error) {
        console.error("❌ خطأ كامل:", error);
        showError("❌ خطأ في الاتصال بالسيرفر، يرجى المحاولة لاحقاً.");
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        btnText.classList.remove("hidden");
        btnLoader.classList.add("hidden");
    }
});

function showSuccess(message, discount) {
    if (errorContainer) errorContainer.classList.add("hidden");
    resultBox.innerHTML = `
        <h2>🎉 تم بنجاح!</h2>
        <div class="discount" style="font-size: 20px; font-weight: bold; color: green; margin: 10px 0;">${discount}</div>
        <p>${message}</p>
    `;
    resultContainer.classList.remove("hidden");
    
    setTimeout(() => {
        resultContainer.classList.add("hidden");
    }, 6000);
}

function showError(message) {
    resultContainer.classList.add("hidden");
    errorBox.innerHTML = `<p>${message}</p>`;
    errorContainer.classList.remove("hidden");
    
    setTimeout(() => {
        errorContainer.classList.add("hidden");
    }, 4000);
}
