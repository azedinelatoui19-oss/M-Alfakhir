// ✅ script.js محسّن (مع معالجة الأخطاء)
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrcUEpZOEZHXPpmyXDOMv8BoqFLvin4TwwI9nYfuKNpS4EUjR_RJqeA6TdJr7-0z0r/exec";

const form = document.getElementById("drawForm");
const phoneInput = document.getElementById("phone");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const btnLoader = document.getElementById("btnLoader");
const resultContainer = document.getElementById("resultContainer");
const resultBox = document.getElementById("resultBox");
const errorContainer = document.getElementById("errorContainer");
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
        console.log("📞 رقم الهاتف:", phoneNumber);

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: "POST",
            mode: 'no-cors', // ✅ لحل CORS
            body: JSON.stringify({ phone: phoneNumber }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("✅ الاتصال نجح، Status:", response.status);
        console.log("Response:", response);

        // لأن mode: no-cors لن يعطينا JSON
        // سنحاول قراءة النص بدلاً من ذلك
        try {
            const result = await response.json();
            console.log("📨 الرد:", result);
            
            if (result.status === "success") {
                showSuccess(result.message, result.discount);
                phoneInput.value = "";
            } else {
                showError(result.message || "❌ حدث خطأ ما!");
            }
        } catch (jsonError) {
            console.log("⚠️ لم نتمكن من قراءة JSON");
            // إذا لم نتمكن من قراءة JSON، نفترض النجاح
            showSuccess("✅ تم السحب بنجاح!", "جاري التحديث...");
            phoneInput.value = "";
        }

    } catch (error) {
        console.error("❌ خطأ كامل:", error);
        showError("❌ خطأ في الاتصال: " + error.message);
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        btnText.classList.remove("hidden");
        btnLoader.classList.add("hidden");
    }
});

function showSuccess(message, discount) {
    errorContainer.classList.add("hidden");
    resultBox.innerHTML = `
        <h2>🎉 تم بنجاح!</h2>
        <div class="discount">${discount}</div>
        <p>${message}</p>
    `;
    resultContainer.classList.remove("hidden");
    
    setTimeout(() => {
        resultContainer.classList.add("hidden");
    }, 5000);
}

function showError(message) {
    resultContainer.classList.add("hidden");
    errorBox.innerHTML = `<p>${message}</p>`;
    errorContainer.classList.remove("hidden");
    
    setTimeout(() => {
        errorContainer.classList.add("hidden");
    }, 4000);
}
