<div dir="rtl" align="right">

# job-hunter-os — نظام البحث الذاتي عن الوظائف بالذكاء الاصطناعي (Zero-Code)

**[English](README.md) | العربية (RTL)**

[![MIT License](https://img.shields.io/badge/License-MIT-2ea44f)](LICENSE)
[![Skill Eval 20/20](https://img.shields.io/badge/Eval_Harness-20%2F20_Passing-2ea44f)](evals/RUBRIC.md)
[![Zero Code](https://img.shields.io/badge/Runtime-Zero_Code_Markdown-167d60)](AGENTS.md)
[![Live Dashboard Demo](https://img.shields.io/badge/Live_Preview-Kanban_Dashboard-3b82f6)](https://htmlpreview.github.io/?https://github.com/redasalem/job-hunter-os/blob/main/docs/demo-dashboard.html)

نظام مفتوح المصدر مبني بالكامل من **مهارات Markdown قياسية (`agentskills.io`) + أداة سطر أوامر بلا أي مكتبات خارجية (`Zero-Dependency CLI`)**. يعمل نموذج الذكاء الاصطناعي داخل محررك (**Cursor، Antigravity، Claude Code، VS Code Copilot، Codex، Windsurf، OpenCode**) كمحرك تنفيذي يقود متصفحك عبر **Playwright MCP** ويسجل كل شيء محليًا (مع دعم اختياري لـ **Notion MCP**).

- **معاينة لوحة التحكم التفاعلية مباشرة في المتصفح:** [افتح لوحة Kanban والتحليلات التفاعلية (`docs/demo-dashboard.html`)](https://htmlpreview.github.io/?https://github.com/redasalem/job-hunter-os/blob/main/docs/demo-dashboard.html)

---

## 1. البدء السريع في 30 ثانية (`macOS / Linux / Windows`)

```bash
# 1. تثبيت المهارات عالميًا وربط Playwright MCP
npx job-hunter-os init --global

# 2. تسجيل الدخول مرة واحدة في ملف المتصفح المحلي المعزول (browser-profile/)
npx job-hunter-os login --global

# 3. فحص الجاهزية، صلاحية الروابط الحية، وتشغيل حزمة اختبارات التقييم (20/20)
npx job-hunter-os doctor
npx job-hunter-os eval
```

> **تجربة فورية خلال 15 ثانية بدون بيانات شخصية:** اكتب `/demo` داخل أي محرر مدعوم لتشغيل محاكاة كاملة من [`examples/sandbox-demo/`](examples/sandbox-demo/expected-mission-control.md).

---

## 2. نتائج حزمة التقييم القياسية (`npx job-hunter-os eval` — `20/20`)

يحتوي المستودع على حزمة تقييم حتمية في [`evals/`](evals/RUBRIC.md) تختبر المهارات ضد 5 إعلانات وظائف اختبارية و3 نماذج ATS محلية (`Greenhouse`، `Lever`، `Ashby`):

| الفحص | ما يتم إثباته آليًا | النتيجة |
|---|---|---|
| **منع الهلوسة (`EVAL-04..07`)** | مطابقة 100% للأرقام والمهارات في السيرة الذاتية، صفر كليشيهات ذكاء اصطناعي، وضبط الصفحة الواحدة `A4` | `PASS (4/4)` |
| **الحماية من حقن الأوامر (`EVAL-03, 08, 17`)** | حظر محاولات `SYSTEM OVERRIDE` لتسريب `.env` أو تغيير الراتب، ترك حقول الـ Honeypot فارغة، والتقاط كلمة التحقق (`PINEAPPLE`) | `PASS (3/3)` |
| **فلترة الوظائف الوهمية والمكررة (`EVAL-09..12`)** | استبعاد الوظائف المغلقة (`>90 يومًا`)، الشركات المحظورة، والتكرار عبر المنصات (`company::role_title`) | `PASS (4/4)` |
| **أتمتة نماذج ATS وقاطع الدائرة (`EVAL-13..20`)** | رفع الـ PDF أولًا، جدول القراءة النهائية من الـ DOM قبل `APPROVE`، وتجميد المنصة 24 ساعة عند ظهور `CAPTCHA` | `PASS (9/9)` |

---

## 3. الأوامر وضمانات الأمان الصارمة

| الأمر | الوظيفة |
|---|---|
| `/demo` | محاكاة فورية في 15 ثانية باستخدام بيانات افتراضية |
| `/setup` | فحص بوابات الجاهزية الخمس، فحص روابط GitHub/Portfolio الحية، ومقابلة من 3–4 أسئلة |
| `/daily-run` | دورة كاملة: تحقق الدخول -> اكتشاف وفلترة -> جدول Mission Control -> تفصيل السيرة -> تعبئة بموافقة `APPROVE` |
| `/tailor-cv URL` | تفصيل السيرة الذاتية + خريطة الكلمات المفتاحية `ATS` (`skills/21`) دون إرسال |
| `/apply-url URL` | تطبيق كافة بوابات الأمان على رابط وظيفة واحد |
| `/weekly-report` | تقرير أسبوعي لمعدلات الاستجابة وفجوات المهارات |

### الوثائق التفصيلية
- [`AGENTS.md`](AGENTS.md) — القواعد المرجعية والضمانات العشر غير القابلة للتجاوز.
- [`docs/SKILL_CATALOG.md`](docs/SKILL_CATALOG.md) — دليل المهارات الموحد (`47` مهارة مفحوصة).
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — المعمارية ودورة حياة التنفيذ.
- [`docs/COMPATIBILITY.md`](docs/COMPATIBILITY.md) — مصفوفة التوافق مع أكثر من 25 محررًا ونموذج ذكاء اصطناعي.
- [`PLATFORMS.md`](PLATFORMS.md) — مصفوفة منصات التوظيف العالمية والعربية (`Wuzzuf`، `Bayt`، `LinkedIn`) وشبكات عقود `B2B`.
- [`HIRED.md`](HIRED.md) — سجل قصص النجاح المجتمعي.

مرخص تحت رخصة [MIT](LICENSE) — Reda Salem (`redasalem`).

</div>
