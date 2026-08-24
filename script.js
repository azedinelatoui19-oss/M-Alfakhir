// ✅ الرابط الفعلي
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrcUEpZOEZHXPpmyXDOMv8BoqFLvin4TwwI9nYfuKNpS4EUjR_RJqeA6TdJr7-0z0r/exec";
const ADMIN_PHONE = "0655787605"; // الرقم الإداري

// العناصر
const form = document.getElementById("drawForm");
const phoneInput = document.getElementById("phone");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const btnLoader = document.getElementById("btnLoader");

const discountContainer = document.getElementById("discountContainer");
const discountValue = document.getElementById("discountValue");
const discountPhone = document.getElementById("discountPhone");
const savingText = document.getElementById("savingText");
const autoSaveBtn = document.getElementById("autoSaveBtn");

const successContainer = document.getElementById("successContainer");
const successMessage = document.getElementById("successMessage");
const newDrawBtn = document.getElementById("newDrawBtn");

const errorContainer = document.getElementById("errorContainer");
const errorBox = document.getElementById("errorBox");

// متغيرات
let isSubmitting = false;
let currentDiscount = null;
let currentPhone = null;

// ===== جدول الاحتمالات =====
const DISCOUNT_PROBABILITIES = [
    { discount: "10%", probability: 90, emoji: "😊", saving: "توفير بسيط لكن مفيد!" },
    { discount: "20%", probability: 8.5, emoji: "😃", saving: "توفير جيد!" },
    { discount: "50%", probability: 1, emoji: "🤩", saving: "توفير رائع جداً!" },
    { discount: "100%", probability: 0.5, emoji: "🤑", saving: "مجاني تماماً! 🎁" }
];

// ===== الحدث 1: السحب =====
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const phoneNumber = phoneInput.value.trim();

    // ✅ التحقق الأساسي
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
        // 🔍 التحقق من عدم التكرار (محلي أولاً)
        const drawnNumbers = JSON.parse(localStorage.getItem("drawnNumbers") || "[]");
        
        if (phoneNumber !== ADMIN_PHONE && drawnNumbers.includes(phoneNumber)) {
            showError(`⚠️ عذراً! الرقم ${phoneNumber} استُخدم مسبقاً للسحب.\n\nكل رقم يسحب مرة واحدة فقط`);
            isSubmitting = false;
            submitBtn.disabled = false;
            btnText.classList.remove("hidden");
            btnLoader.classList.add("hidden");
            return;
        }

        // 🎲 حساب الخصم بناءً على الاحتمالات
        const discount = calculateDiscountWithProbability();

        // 💾 حفظ البيانات مؤقتاً
        currentDiscount = discount.discount;
        currentPhone = phoneNumber;

        // 🎰 عرض الخصم
        displayDiscount(discount, phoneNumber);

        // ⏱️ حفظ تلقائي بعد 3 ثوانٍ
        setTimeout(() => {
            autoSave();
        }, 3000);

        isSubmitting = false;
        submitBtn.disabled = false;
        btnText.classList.remove("hidden");
        btnLoader.classList.add("hidden");

    } catch (error) {
        console.error("Error:", error);
        showError("❌ خطأ: " + error.message);
        isSubmitting = false;
        submitBtn.disabled = false;
        btnText.classList.remove("hidden");
        btnLoader.classList.add("hidden");
    }
});

// ===== الحدث 2: حفظ تلقائي =====
autoSaveBtn.addEventListener("click", async () => {
    await autoSave();
});

async function autoSave() {
    autoSaveBtn.disabled = true;
    autoSaveBtn.textContent = "⏳ جاري الحفظ...";

    try {
        // 📤 إرسال البيانات إلى Google Sheets
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: "POST",
            mode: 'no-cors',
            body: JSON.stringify({
                phone: currentPhone,
                discount: currentDiscount
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Response Status:", response.status);

        // ✅ حفظ البيانات محلياً
        if (currentPhone !== ADMIN_PHONE) {
            const drawnNumbers = JSON.parse(localStorage.getItem("drawnNumbers") || "[]");
            drawnNumbers.push(currentPhone);
            localStorage.setItem("drawnNumbers", JSON.stringify(drawnNumbers));
        }

        // 🎉 عرض رسالة النجاح
        showSuccess(currentPhone, currentDiscount);

        // ✨ مسح النموذج
        phoneInput.value = "";
        currentDiscount = null;
        currentPhone = null;

    } catch (error) {
        console.error("Error:", error);
        showError("❌ خطأ في الحفظ: " + error.message);
    } finally {
        autoSaveBtn.disabled = false;
        autoSaveBtn.textContent = "✅ جاري الحفظ الآلي...";
    }
}

// ===== الحدث 3: سحب جديد =====
newDrawBtn.addEventListener("click", () => {
    successContainer.classList.add("hidden");
    form.classList.remove("hidden");
    phoneInput.focus();
});

// ===== دوال مساعدة =====

// 🎲 حساب الخصم بناءً على الاحتمالات
function calculateDiscountWithProbability() {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (let i = 0; i < DISCOUNT_PROBABILITIES.length; i++) {
        cumulative += DISCOUNT_PROBABILITIES[i].probability;
        if (random <= cumulative) {
            return DISCOUNT_PROBABILITIES[i];
        }
    }

    // القيمة الافتراضية (10%)
    return DISCOUNT_PROBABILITIES[0];
}

// 🎰 عرض الخصم
function displayDiscount(discountObj, phone) {
    errorContainer.classList.add("hidden");
    form.classList.add("hidden");
    
    discountValue.textContent = discountObj.discount;
    discountPhone.textContent = `📱 رقمك: ${phone}`;
    savingText.textContent = discountObj.emoji + " " + discountObj.saving;
    
    discountContainer.classList.remove("hidden");
    
    // تأثير الظهور
    discountContainer.style.animation = "none";
    setTimeout(() => {
        discountContainer.style.animation = "slideDown 0.5s ease-out";
    }, 10);
}

// ✅ عرض رسالة النجاح
function showSuccess(phone, discount) {
    discountContainer.classList.add("hidden");
    form.classList.add("hidden");
    
    successMessage.innerHTML = `
        <strong>✅ تم حفظ السحب بنجاح!</strong><br>
        📱 رقم الهاتف: <strong>${phone}</strong><br>
        🎁 الخصم: <strong style="color: #e74c3c; font-size: 20px;">${discount}</strong>
    `;
    
    successContainer.classList.remove("hidden");
}

// ❌ عرض رسائل الخطأ
function showError(message) {
    discountContainer.classList.add("hidden");
    form.classList.remove("hidden");
    
    errorBox.innerHTML = `<p>${message}</p>`;
    errorContainer.classList.remove("hidden");
    
    setTimeout(() => {
        errorContainer.classList.add("hidden");
    }, 5000);
}
