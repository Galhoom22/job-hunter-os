<div dir="rtl" align="right">

# job-hunter-os

**نظام تشغيل مهني بالذكاء الاصطناعي. فصّل كل سيرة ذاتية. تحقّق من كل حقيقة. ابقَ أنت صاحب القرار.**

إطار عمل مفتوح المصدر ومحلي بالكامل (`Local-First`) مبني على مبدأ واحد: **يمكن للذكاء الاصطناعي تجهيز طلبات توظيفك، لكنه لا يختلق خبرتك أبدًا ولا يسلبك القرار.**

حوّل سيرتك الذاتية المؤكدة وأوصاف الوظائف الحقيقية إلى سيرة مفصّلة وموثّقة، وخريطة كلمات `ATS`، وتدقيق `Recruiter-SEO` لملف LinkedIn، وملفات تحضير للمقابلات — عبر **48 مهارة Markdown نقية** وأداة **Node.js CLI بدون أي مكتبات خارجية**.

**[English](README.md) | العربية (RTL)** · **[معاينة لوحة Kanban التفاعلية ↗](https://redasalem.github.io/job-hunter-os/demo-dashboard.html)** · **[شارك قصة نجاحك](https://github.com/redasalem/job-hunter-os/issues/new?template=share-success.yml)**

[![Zero Core Dependencies](https://img.shields.io/badge/Core_CLI-0_NPM_Dependencies-2ea44f)](package.json)
[![48 Agent Skills](https://img.shields.io/badge/Skills-48_Pure_Markdown-167d60)](skills/REGISTRY.md)
[![MIT License](https://img.shields.io/badge/License-MIT-2ea44f)](LICENSE)

- **صفر خبرات أو أرقام مختلقة:** كل جملة مُفصّلة مرتبطة بحقيقة مؤكدة؛ والمهارات الناقصة تُعزل بشفافية في **الفجوات الحقيقية (True Gaps)**.
- **صفر إرسال أعمى:** وضع `dry_run: true` مفعّل افتراضيًا؛ والنماذج الحية تتوقف عند **جدول قراءة الـ DOM** بانتظار موافقتك الصريحة `APPROVE`.
- **خصوصية محلية 100%:** سيرتك الذاتية وسجلاتك وملف المتصفح تبقى على جهازك فقط.

![معاينة دورة عمل job-hunter-os في 3 خطوات: /quick-tailor -> جدول Mission Control -> لوحة dashboard.html](assets/demo-preview.png)

---

## ماذا تقدّم للنظام ← ماذا تحصل عليه؟

| المُدخلات (منك) | job-hunter-os (حدود الثقة) | المخرجات (تستلمها فورًا) |
|---|---|---|
| سيرتك الذاتية + تأكيد الحقائق | **تحقق من الحقائق** دون أي هلوسة | سيرة مفصّلة بصيغة **HTML + TXT** (وPDF اختياريًا) |
| وصف وظيفة أو عدة وظائف | **تقييم وحماية** (كشف الوظائف الوهمية وحقن الأوامر) | **خريطة كلمات ATS** (`قبل % ← بعد %`) + قائمة **الفجوات الحقيقية** |
| جلسة متصفح اختيارية | **قراءة DOM + بوابة `APPROVE`** | **ملف تحضير للمقابلة** + مسودة تواصل `<= 75` كلمة + لوحة Kanban محلية |

---

## اختر مسار البداية المناسب لك

| المسار | الأنسب لـ | المتطلبات | أول نتيجة |
|---|---|---|---|
| **1. تجربة فورية (`/demo`)** | رؤية النتيجة خلال 15 ثانية | بدون بيانات شخصية وبدون متصفح | جدول `Mission Control` + **مثال سيرة مفصّلة كامل تلقائيًا** |
| **2. تفصيل سريع (`/quick-tailor`)** | الحصول على أول سيرة مفصّلة حقيقية في دقيقتين | الصق سيرتك + وصف وظيفة واحدة (**بدون تسجيل دخول أو إعداد كامل**) | تأكيد الحقائق + سيرة HTML/TXT + مقارنة ATS والفجوات |
| **3. النظام المهني الكامل (`/setup` ← `/daily-run`)** | بحث وظيفي مستمر عبر عدة منصات | `init` + `login` + 5 بوابات جاهزية | اكتشاف وتقييم وتفصيل وتجهيز نماذج التقديم بموافقة بشرية |

---

## التثبيت المحلي في 30 ثانية (`macOS / Linux / Windows`)

```bash
# 1. التثبيت العالمي وربط المهارات مع محررات الذكاء الاصطناعي
npx github:redasalem/job-hunter-os init --global

# 2. توليد بطاقة الإثبات القابلة لإعادة الإنتاج محليًا (بدون أي بيانات شخصية)
npx github:redasalem/job-hunter-os proof

# 3. اختياري (للنظام الكامل فقط): تسجيل الدخول مرة واحدة في browser-profile/ وفحص الجاهزية
npx github:redasalem/job-hunter-os login --global
npx github:redasalem/job-hunter-os doctor
```

> **شفافية التبعيات:** أداة CLI الأساسية (`bin/cli.mjs`) لا تحتوي على أي مكتبات npm نهائيًا (`dependencies: {}`). أما أتمتة المتصفح وتصدير PDF عبر Playwright MCP فهي **اختيارية** وتعمل عبر `npx` عند استخدامها فقط.

---

## بطاقة الإثبات القابلة لإعادة الإنتاج (`job-hunter proof`)

![بطاقة الإثبات القابلة لإعادة الإنتاج لمشروع Job Hunter OS](assets/proof-card.svg)

> **توضيح النطاق:** الأمر `eval --baseline` و `proof` يتحققان حتميًا من **النماذج المرجعية والمخططات في CI** مقابل [`evals/fixtures/ground-truth.json`](evals/fixtures/ground-truth.json) وليسا مقياسًا عامًا لدقة نماذج الذكاء الاصطناعي. نتائج التشغيل الحي محفوظة منفصلة في [`evals/results/live-agent-eval-run.json`](evals/results/live-agent-eval-run.json) (`20/20 PASS`).

### مصفوفة دعم منصات التوظيف وأنظمة ATS

| مستوى الجاهزية | المنصات / أنظمة ATS | الحالة والأدلة |
|---|---|---|
| **Fixture-Verified (مُختبرة بنماذج HTML محلية)** | **Greenhouse**، **Lever**، **Ashby** | نماذج محلية في [`evals/fixtures/forms/`](evals/fixtures/forms/greenhouse-mock.html) لرفع السيرة أولًا وحماية `honeypot` وقراءة الـ DOM |
| **Playbook-Ready / Field-Testing** | **Workday**، **SmartRecruiters**، **LinkedIn Easy Apply**، **Wellfound** | كتيبات Markdown كاملة مع فحص حداثة `<60 يومًا` واستخراج JSON خفيف لـ LinkedIn |
| **Help Wanted (مساهمات مفتوحة)** | **بوابات التوظيف الإقليمية** (`GulfTalent` و `Bayt`، `Naukri`، `StepStone`) | قضايا `good first issue` مفتوحة للمساهمين |

---

## الأوامر والوثائق المرجعية

- [`AGENTS.md`](AGENTS.md) و [`skills/REGISTRY.md`](skills/REGISTRY.md) — الضمانات العشر وفهرس **48 مهارة موحدة**.
- [`.agent/workflows/quick-tailor.md`](.agent/workflows/quick-tailor.md) و [`.agent/workflows/demo.md`](.agent/workflows/demo.md) — مسارا البداية السريعة.
- [`docs/SKILL_CATALOG.md`](docs/SKILL_CATALOG.md) و [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — الدليل الكامل والمعمارية.
- [`docs/COMPATIBILITY.md`](docs/COMPATIBILITY.md) و [`docs/OPTIONAL_MCP_PLUGINS.md`](docs/OPTIONAL_MCP_PLUGINS.md) — التوافق مع 25+ محررًا وإضافات MCP الاختيارية.
- [`HIRED.md`](HIRED.md) و [`CHANGELOG.md`](CHANGELOG.md) — سجل نتائج المجتمع المستقلة وتاريخ الإصدارات (`v1.4.0`).

مرخص تحت رخصة [MIT](LICENSE) — Reda Salem (`redasalem`).

</div>
