<div dir="rtl" align="right">

# job-hunter-os — مساعد AI لتفصيل السيرة الذاتية وتجهيز المقابلات بموافقة بشرية صارمة

**[English](README.md) | العربية (RTL)** · **[معاينة لوحة Kanban التفاعلية مباشرة ↗](https://redasalem.github.io/job-hunter-os/demo-dashboard.html)**

[![MIT License](https://img.shields.io/badge/License-MIT-2ea44f)](LICENSE)
[![Harness Validator 20/20](https://img.shields.io/badge/CI_Harness_Validator-20%2F20_Baseline-2ea44f)](evals/README.md)
[![48 Consolidated Skills](https://img.shields.io/badge/Skills-48_Consolidated_Markdown-167d60)](skills/REGISTRY.md)
[![Zero Code](https://img.shields.io/badge/Runtime-Zero_Code_Markdown-167d60)](AGENTS.md)
[![Live Dashboard Demo](https://img.shields.io/badge/Live_Preview-Kanban_Dashboard-3b82f6)](https://redasalem.github.io/job-hunter-os/demo-dashboard.html)

مساعد مهني مفتوح المصدر يعتمد على **48 مهارة Markdown موحدة (`agentskills.io`) + أداة CLI بدون أي مكتبات خارجية (`dependencies: {}`)**. يفصل لك السيرة الذاتية حسب كل وظيفة بدقة من حقائقك المؤكدة، يحسب نسبة تطابق كلمات `ATS`، يقدم تدقيقًا وتطويرًا موثقًا لملف LinkedIn (`0–100` Recruiter-SEO عبر [`skills/linkedin-growth.md`](skills/linkedin-growth.md))، يجهز ملف التحضير للمقابلة (`interview-dossier.md`) ورسائل التواصل المختصرة (`<= 75` كلمة)، ويجهز نماذج التقديم عبر **Playwright MCP** باستخراج JSON خفيف للتوكنات ودون إرسال تلقائي أعمى.

> **ما الذي لن يفعله النظام أبدًا (حدود ثقة تشغيلية صارمة):**
> - **لا إرسال تلقائي أعمى:** وضع `dry_run: true` مفعّل افتراضيًا؛ وعند التفعيل الحي يتوقف النموذج عند **جدول قراءة الـ DOM النهائي** وينتظر كلمة `APPROVE` صراحةً منك.
> - **لا أرقام أو مهارات مختلقة:** صفر هلوسة في السيرة الذاتية، وأي مهارة ناقصة تُعرض بشفافية في الفجوات.
> - **لا تجاوز لحماية المواقع أو شروط الاستخدام:** أي `CAPTCHA` أو تحذير يفعّل قاطع الدائرة 24 ساعة فورًا مع التزام صارم بفاصل زمني بشري **3–9 ثوانٍ**.

---

## ⚡ جرّب `/demo` خلال 15 ثانية والمعاينة الحية (بدون إعداد)

![معاينة دورة عمل job-hunter-os في 3 خطوات: /demo -> جدول Mission Control -> لوحة dashboard.html](assets/demo-preview.png)

- **محاكاة `/demo` فورية:** افتح المستودع في **Cursor أو Antigravity أو Claude Code أو VS Code Copilot أو Codex CLI أو OpenCode** واكتب `/demo` (أو راجع [`examples/sandbox-demo/`](examples/sandbox-demo/expected-mission-control.md) و [`examples/outputs/`](examples/outputs/sample-interview-dossier.md)).
- **معاينة لوحة التحكم في المتصفح:** [افتح لوحة Kanban والتحليلات عبر GitHub Pages](https://redasalem.github.io/job-hunter-os/demo-dashboard.html) ([`docs/demo-dashboard.html`](docs/demo-dashboard.html)) — أو شغّل `npx github:redasalem/job-hunter-os dashboard` محليًا.

---

## 1. البدء السريع في 30 ثانية (`macOS / Linux / Windows`)

```bash
# 1. تثبيت المهارات عالميًا وربط Playwright MCP
npx github:redasalem/job-hunter-os init --global

# 2. تسجيل الدخول مرة واحدة في ملف المتصفح المحلي المعزول (browser-profile/)
npx github:redasalem/job-hunter-os login --global

# 3. فحص الجاهزية، صلاحية الروابط الحية، والتثبت من فاحص الحزمة القياسية
npx github:redasalem/job-hunter-os doctor
npx github:redasalem/job-hunter-os eval --baseline
```

---

## 2. نتائج التقييم الحية ومصفوفة دعم أنظمة ATS (`eval --baseline` / `--file`)

> **توضيح مهم:** الأمر `eval --baseline` هو **فاحص حتمي في CI للتحقق من سلامة المخططات والنماذج المرجعية** ([`evals/results/baseline-verified-run.json`](evals/results/baseline-verified-run.json)) وليس قياسًا لنموذج حي. أما جلسات التقييم الحية للنماذج فتُحفظ منفصلة مثل [`evals/results/live-agent-eval-run.json`](evals/results/live-agent-eval-run.json) وتُقيّم عبر `--file` مقابل ملف الحقيقة الثابت [`evals/fixtures/ground-truth.json`](evals/fixtures/ground-truth.json). راجع [`evals/README.md`](evals/README.md).

| نوع التقييم | الملف / الأمر | النطاق | النتيجة الحتمية |
|---|---|---|---|
| **فحص CI المرجعي (Baseline)** | `node ./bin/cli.mjs eval --baseline` | التحقق الحتمي من المخطط والـ 20 اختبارًا عبر Linux/macOS/Windows | **20 / 20 PASS** |
| **تشغيل حي لنموذج ذكاء اصطناعي** | `node ./bin/cli.mjs eval --file evals/results/live-agent-eval-run.json` | جلسة Gemini حية نفذت [`evals/PROMPT.md`](evals/PROMPT.md) على 5 وظائف و3 نماذج ATS | **20 / 20 PASS (100%)** |

### مصفوفة دعم منصات التوظيف وأنظمة ATS

| مستوى الجاهزية | المنصات / أنظمة ATS | الحالة والأدلة |
|---|---|---|
| **Fixture-Verified (مُختبرة بنماذج HTML محلية)** | **Greenhouse**، **Lever**، **Ashby** | نماذج محلية في [`evals/fixtures/forms/`](evals/fixtures/forms/greenhouse-mock.html) تشمل رفع السيرة أولًا، مصيدة الـ `honeypot`، وقراءة الـ `DOM` قبل `APPROVE` |
| **Playbook-Ready / Field-Testing** | **Workday**، **SmartRecruiters**، **LinkedIn Easy Apply**، **Wellfound** | كتيبات Markdown كاملة مع فحص حداثة `<60 يومًا` في `doctor` وتحت الاختبار الميداني المستمر |
| **Help Wanted (مساهمات مفتوحة)** | **بوابات التوظيف الإقليمية** (`GulfTalent` و `Bayt`، `Naukri` الهند، `StepStone` أوروبا) | قضايا `good first issue` مفتوحة للمساهمين |

---

## 3. الأوامر والوثائق المرجعية

| الأمر | الوظيفة |
|---|---|
| `/demo` | محاكاة فورية في 15 ثانية باستخدام بيانات افتراضية |
| `/setup` | فحص بوابات الجاهزية الخمس، فحص روابط GitHub/Portfolio الحية، ومقابلة من 3–4 أسئلة |
| `/daily-run` | دورة كاملة: تحقق الدخول -> اكتشاف وفلترة -> جدول Mission Control -> تفصيل السيرة -> تعبئة بموافقة `APPROVE` |
| `/tailor-cv URL` | تفصيل السيرة الذاتية + خريطة الكلمات المفتاحية `ATS` (`skills/21`) دون إرسال |
| `/apply-url URL` | تطبيق كافة بوابات الأمان على رابط وظيفة واحد |
| `/weekly-report` | تقرير أسبوعي لمعدلات الاستجابة وفجوات المهارات |

- [`AGENTS.md`](AGENTS.md) — الضمانات العشر غير القابلة للتجاوز.
- [`docs/SKILL_CATALOG.md`](docs/SKILL_CATALOG.md) — دليل المهارات الموحد (**48 مهارة موحدة**).
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — المعمارية ودورة حياة التنفيذ.
- [`docs/COMPATIBILITY.md`](docs/COMPATIBILITY.md) — التوافق مع أكثر من 25 محررًا ونموذجًا.
- [`docs/OPTIONAL_MCP_PLUGINS.md`](docs/OPTIONAL_MCP_PLUGINS.md) — إضافات MCP الاختيارية (مثل `stickerdaniel/linkedin-mcp-server`) مع تحذيرات حدود الاستخدام.
- [`PLATFORMS.md`](PLATFORMS.md) — مصفوفة منصات التوظيف العالمية والعربية (`Wuzzuf`، `Bayt`، `LinkedIn`) وشبكات عقود `B2B`.
- [`HIRED.md`](HIRED.md) & [`CHANGELOG.md`](CHANGELOG.md) — سجل قصص النجاح وتاريخ الإصدارات (`v1.3.0`).

مرخص تحت رخصة [MIT](LICENSE) — Reda Salem (`redasalem`).

</div>
