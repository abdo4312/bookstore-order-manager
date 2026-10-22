<div dir="rtl">

# 📚 نظام إدارة حجوزات الكتب — Bookstore Order Manager

تطبيق سطح مكتب لإدارة مكتبة كتب: الطلبات، العملاء، دور النشر، السنوات الدراسية، المواد، التقارير، والفواتير. واجهة عربية RTL مبنية بـ React وTailwind، ويعمل كتطبيق Electron على Windows، مع مزامنة سحابية اختيارية عبر Supabase وقاعدة SQLite محلية.

> **ملاحظة:** هذا المستودع مخصص للعرض (Portfolio). لا يحتوي على أي بيانات عملاء حقيقية أو مفاتيح اتصال.

## 🎯 المشكلة والحل

إدارة حجوزات الكتب في مكتبة صغيرة غالبًا تتم عبر دفتر أو ملفات Excel متفرقة، وده يصعّب تتبع حالة كل طلب ومعرفة مستحقات العملاء. التطبيق يجمع الطلبات، العملاء، دور النشر، والمدفوعات في واجهة واحدة، مع تقارير قابلة للطباعة وتصدير Excel، ويعمل محليًا على Windows مع إمكانية مزامنة سحابية اختيارية.

## ✨ المميزات

- إدارة الطلبات: إضافة، تعديل، حذف، وتتبع الحالة (قيد الانتظار / تم التسليم / ملغي).
- إدارة العملاء: بيانات الاتصال، الملاحظات، وحظر العميل.
- إدارة دور النشر، السنوات الدراسية، المواد، وطرق الدفع.
- لوحة تحكم بإحصائيات سريعة.
- تقارير PDF وفواتير حرارية قابلة للطباعة.
- تصدير البيانات إلى Excel.
- وضعان للبيانات: سحابي (Supabase) أو محلي (SQLite).
- واجهة عربية RTL متجاوبة.
- سجل SQL لتشخيص العمليات.

## 🧩 التحديات التقنية

- **وضعان للبيانات:** نفس طبقة الخدمات تعمل مع Supabase أو SQLite حسب `USE_CLOUD`.
- **عزل Electron:** الواجهة لا تصل إلى Node.js مباشرة؛ الوصول لقاعدة البيانات المحلية عبر `contextBridge` وIPC.
- **واجهة عربية RTL:** تنسيق كامل مع Tailwind، وتقارير PDF تدعم العربية.
- **تقارير متعددة:** PDF، فواتير حرارية، وتصدير Excel من نفس البيانات.

## 🛠️ التقنيات

| الطبقة | التقنية |
|---|---|
| الواجهة | React 19 + TypeScript |
| البناء | Vite 6 |
| التنسيق | Tailwind CSS 3 |
| سطح المكتب | Electron 40 |
| قاعدة البيانات | Supabase (PostgreSQL) + better-sqlite3 |
| التقارير | jsPDF + jspdf-autotable + xlsx |
| الأيقونات | lucide-react |

## 🏗️ الهيكل

```text
.
├── components/          # مكونات الواجهة
│   └── templates/       # قوالب التقارير والفواتير
├── services/            # الخدمات: Supabase، SQLite، PDF، Excel
├── App.tsx              # نقطة دخول الواجهة
├── main.cjs             # عملية Electron الرئيسية + SQLite
├── preload.cjs          # جسر IPC الآمن
├── docs/                # Architecture
├── supabase_schema.sql  # مخطط قاعدة البيانات
├── .env.example         # نموذج متغيرات البيئة
├── CHANGELOG.md
└── package.json
```

## 🚀 التشغيل

### المتطلبات

- Node.js 18 أو أحدث.
- Windows هو الهدف الأساسي للتشغيل والبناء.
- حساب Supabase (اختياري إذا استخدمت وضع SQLite المحلي).

### الخطوات

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
# عدّل .env وضع رابط ومفتاح مشروع Supabase الخاص بك
npm run electron:dev
```

للبناء:

```bash
npm run build       # بناء الواجهة
npm run build:dir   # نسخة Electron قابلة للتشغيل (Windows)
```

### متغيرات البيئة

| المتغير | الوصف |
|---|---|
| `VITE_SUPABASE_URL` | رابط مشروع Supabase |
| `VITE_SUPABASE_ANON_KEY` | المفتاح العام (anon) للمشروع |
| `VITE_ADMIN_PASSWORD` | كلمة مرور قفل لوحة الإدارة المحلي |

> للتبديل إلى وضع SQLite المحلي: غيّر `USE_CLOUD` إلى `false` في `services/config.ts`.

> لا تضع أي `service_role` أو مفاتيح سرية في متغيرات `VITE_*`؛ لأنها تُضمَّن في حزمة العميل وتكون مرئية للمستخدم.

## 🔐 ملاحظات أمان

- لا توجد بيانات عملاء أو ملفات قاعدة بيانات داخل المستودع.
- `VITE_ADMIN_PASSWORD` هو **قفل واجهة محلي فقط** وليس مصادقة حقيقية.
- **RLS مفعّل افتراضيًا** في `supabase_schema.sql`، لكن لازم تضيف سياسات مناسبة قبل أي استخدام إنتاجي.
- راجع [`SECURITY.md`](SECURITY.md) قبل النشر.

## 📚 توثيق إضافي

- [Architecture](docs/ARCHITECTURE.md)
- [Changelog](CHANGELOG.md)
- [Security](SECURITY.md)

## 📄 الترخيص

هذا المشروع تحت ترخيص [MIT](LICENSE).

</div>

---

## English

**Bookstore Order Manager** is a desktop application for managing bookstore orders, customers, publishers, academic years, subjects, reports, and invoices. It features an Arabic RTL interface built with React and Tailwind, runs as an Electron app on Windows, and supports optional cloud sync through Supabase or a local SQLite database.

> This repository is a portfolio showcase. It contains no real customer data or credentials.

### Features

- Order management (create, edit, delete, status tracking).
- Customer profiles, notes, and blocking.
- Publishers, academic years, subjects, and payment methods.
- Dashboard statistics.
- PDF reports and printable thermal receipts.
- Excel export.
- Cloud (Supabase) or local (SQLite) data mode.
- Arabic RTL responsive UI.
- SQL log panel for diagnostics.

### Tech stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 3 · Electron 40 · Supabase (PostgreSQL) · better-sqlite3 · jsPDF · xlsx · lucide-react

### Getting started

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run electron:dev
```

### Build

```bash
npm run build
npm run build:dir
```

### Security

- No real data or secrets are included.
- `VITE_ADMIN_PASSWORD` is a local UI gate, not authentication.
- RLS is enabled by default in `supabase_schema.sql`; add proper policies before production use.
- Never expose a `service_role` key in client-side `VITE_*` variables.

### Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Changelog](CHANGELOG.md)
- [Security](SECURITY.md)

### License

MIT
