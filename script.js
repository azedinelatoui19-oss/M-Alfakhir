// مثال لتوليد قيمة السحب (يمكنك تغيير الطريقة حسب نظامك)
let randomPrize = Math.floor(Math.random() * 50) + 1; // توليد قيمة عشوائية كمثال (أو ضع القيمة التي تريدها)

// إرسال البيانات إلى جوجل شيت
fetch(url, {
    method: 'POST',
    body: JSON.stringify({ 
        phone: phoneNumber, 
        prize: randomPrize 
    }),
    headers: {
        'Content-Type': 'text/plain;charset=utf-8'
    }
})
.then(response => response.text())
.then(data => {
    console.log("تم الإرسال بنجاح");
    
    // إظهار النتيجة للمستخدم على الشاشة في التطبيق
    document.getElementById('resultDiv').innerText = "مبروك! لقد حصلت على قيمة سحب: " + randomPrize;
})
.catch(error => {
    console.error("خطأ في الإرسال:", error);
});
