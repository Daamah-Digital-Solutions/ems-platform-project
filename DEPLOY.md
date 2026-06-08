# 🚀 نشر نظام EMS ElRiyadh لايف (مجاناً)

التركيبة:
- **الواجهة (React)** → Netlify
- **الـ backend (FastAPI)** → Render (Free Web Service)
- **قاعدة البيانات** → Neon (Postgres مجاني وثابت)

> كله مجاني. الوحيد اللي ممكن "ينام" بعد ١٥ دقيقة خمول هو الـ backend على Render المجاني (أول طلب بعد النوم بياخد ~٣٠–٥٠ ثانية يصحى). يكفي للتجربة تماماً.

---

## 0) قبل ما تبدأ — ارفع الكود على GitHub
لازم الكود يبقى على GitHub عشان Render و Netlify يسحبوا منه.

```bash
cd C:\Users\MT\Downloads\ems-backend
git init
git add .
git commit -m "EMS ElRiyadh — initial deploy"
# اعمل repo جديد على github.com (خاص)، وبعدين:
git remote add origin https://github.com/<USERNAME>/ems-elriyadh.git
git branch -M main
git push -u origin main
```
(`.gitignore` جاهز — مش هيرفع node_modules ولا قاعدة البيانات المحلية ولا الأسرار.)

---

## 1) قاعدة البيانات — Neon (٣ دقايق)
1. ادخل https://neon.tech وسجّل بحساب GitHub.
2. **Create Project** → اسم: `ems-elriyadh` → المنطقة الأقرب (Frankfurt/EU مثلاً).
3. من **Connection string** انسخ الرابط، شكله كده:
   ```
   postgresql://user:pass@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   احفظه — هنحطه في Render.

---

## 2) الـ Backend — Render (٥ دقايق)
1. ادخل https://render.com وسجّل بـ GitHub.
2. **New** → **Blueprint** → اختر ريبو `ems-elriyadh`. Render هيقرأ `render.yaml` تلقائياً ويلاقي سيرفيس اسمها `ems-elriyadh-api`.
3. قبل ما تعمل Apply، حط المتغيّرين دول يدوياً:
   - `DATABASE_URL` = رابط Neon اللي نسخته.
   - `CORS_ORIGINS` = سيبه مؤقتاً `https://localhost` (هنرجعله بعد ما ناخد رابط Netlify).
   - (`SECRET_KEY` و `PUBLIC_API_KEY` بيتولّدوا تلقائياً — مالكش دعوة بيهم.)
4. **Apply / Deploy**. استنى لحد ما الحالة تبقى **Live**.
5. انسخ رابط السيرفيس، شكله: `https://ems-elriyadh-api.onrender.com`
6. تأكد إنه شغّال: افتح `https://ems-elriyadh-api.onrender.com/health` لازم يرجّع `{"ok":true}`.

> أول تشغيل بيعمل الجداول تلقائياً في Neon + بيانات تجريبية (ستوديو + دخول `demo@move.sa` / `demo123`).

---

## 3) الواجهة — Netlify (٥ دقايق)
1. ادخل https://app.netlify.com وسجّل بـ GitHub.
2. **Add new site → Import an existing project** → **GitHub** → اختر ريبو `ems-elriyadh`.
   (Netlify هيقرأ `netlify.toml` تلقائياً: build = `npm run build`، publish = `dist`، + توجيه الـ SPA.)
3. قبل ما تضغط Deploy: **Add environment variables** → ضيف:
   - `VITE_API_BASE` = رابط Render بتاعك، مثلاً `https://ems-elriyadh-api.onrender.com`
4. **Deploy site**. هتاخد رابط زي `https://ems-elriyadh.netlify.app`.

> مهم: أي تعديل على `VITE_API_BASE` لازم بعده **Trigger deploy** (لأن المتغير بيتحقن وقت الـ build).

---

## 4) اربط الاتنين ببعض (CORS) — مهم جداً
دلوقتي رجّع لـ Render → السيرفيس → **Environment**:
- عدّل `CORS_ORIGINS` يبقى رابط Netlify (وبعدين الدومين):
  ```
  https://ems-elriyadh.netlify.app
  ```
- احفظ → Render هيعيد النشر تلقائياً.

افتح رابط Netlify وسجّل دخول بـ `demo@move.sa` / `demo123`. المفروض كله يشتغل ✅

---

## 5) اربط الدومين emselriyadh.com
الـ CRM المفضّل يكون على subdomain (عشان الموقع التسويقي ياخد الدومين الرئيسي):

**في Netlify** → Site → **Domain management → Add a domain** → اكتب:
- `crm.emselriyadh.com`

Netlify هيقولك تضيف DNS record في مزوّد الدومين بتاعك:
- نوع **CNAME** → الاسم `crm` → القيمة اللي يديهالك Netlify (شكلها زي `xxxx.netlify.app`)

بعد ما الدومين يشتغل، رجّع لـ Render وحدّث `CORS_ORIGINS`:
```
https://ems-elriyadh.netlify.app,https://crm.emselriyadh.com
```

(اختياري — لو عايز الـ API على subdomain برضه زي `api.emselriyadh.com`: من Render → Settings → Custom Domain، وبعدين حدّث `VITE_API_BASE` في Netlify وأعد النشر "Trigger deploy".)

---

## 6) مفتاح الموقع العام (لاستقبال الحجوزات من موقع التسويق)
- من Render → Environment → انسخ قيمة `PUBLIC_API_KEY` (المتولّدة تلقائياً).
- ده اللي يتحط في موقع التسويق كـ هيدر `X-API-Key` لمّا يبعت حجز لـ:
  ```
  POST https://<api-domain>/api/public/leads
  ```

---

## ملخص المتغيّرات

**Render (Backend):**
| المتغير | القيمة |
|--------|--------|
| `DATABASE_URL` | رابط Neon |
| `CORS_ORIGINS` | روابط الواجهة (Netlify + الدومين) |
| `SECRET_KEY` | (تلقائي) |
| `PUBLIC_API_KEY` | (تلقائي) |
| `PUBLIC_STUDIO_ID` | `1` |
| `ENV` | `production` |
| `ZATCA_SANDBOX` | `true` |

**Netlify (Frontend):**
| المتغير | القيمة |
|--------|--------|
| `VITE_API_BASE` | رابط Render API |

---

## لو حاجة مش شغّالة
- **الواجهة بتفتح بس البيانات مش بتيجي / خطأ CORS** → تأكد إن `CORS_ORIGINS` في Render فيه رابط Netlify بالظبط (بـ https وبدون / في الآخر)، و`VITE_API_BASE` في Netlify مظبوط، وأعد النشر بعد أي تعديل.
- **أول طلب بطيء** → Render المجاني نايم؛ طبيعي يصحى في ~٣٠ ثانية.
- **خطأ قاعدة بيانات** → تأكد إن رابط Neon فيه `?sslmode=require`.
