/**
 * LLM prompt builders for data-source reports (trending, web, HN)
 * and rollup reports (weekly, monthly).
 *
 * Separated from prompts.ts to keep each module focused.
 */

import type { WebFetchResult } from "./web.ts";
import type { TrendingData } from "./trending.ts";
import type { HnData } from "./hn.ts";
import type { PhData } from "./ph.ts";
import type { ArxivData } from "./arxiv.ts";
import type { HfData } from "./hf.ts";
import type { DevtoData } from "./devto.ts";
import type { LobstersData } from "./lobsters.ts";
import type { Lang } from "./i18n.ts";
export function buildTrendingPrompt(data: TrendingData, dateStr: string, lang: Lang = "ar"): string {
  const trendingSection =
    data.trendingFetchSuccess && data.trendingRepos.length > 0
      ? data.trendingRepos
          .map(
            (r) =>
              `- [${r.fullName}](${r.url})` +
              (r.language ? ` [${r.language}]` : "") +
              ` ⭐${r.totalStars.toLocaleString()}` +
              (r.todayStars > 0 ? ` (+${r.todayStars} today)` : "") +
              (r.forks > 0 ? ` 🍴${r.forks.toLocaleString()}` : "") +
              (r.description ? `\n  ${r.description}` : ""),
          )
          .join("\n")
      : lang === "en"
        ? "(Unable to fetch today's GitHub Trending list)"
        : "(تعذّر جلب قائمة GitHub Trending لهذا اليوم)";

  const searchSection =
    data.searchRepos.length > 0
      ? data.searchRepos
          .map(
            (r) =>
              `- [${r.fullName}](${r.url})` +
              (r.language ? ` [${r.language}]` : "") +
              ` ⭐${r.stargazersCount.toLocaleString()}` +
              ` [topic:${r.searchQuery}]` +
              (r.description ? `\n  ${r.description}` : ""),
          )
          .join("\n")
      : lang === "en"
        ? "(No search results)"
        : "(لا توجد نتائج بحث)";

  if (lang === "en") {
    return `You are a technical analyst focused on the AI open-source ecosystem. The following is ${dateStr} GitHub AI-related trending repository data. Please filter for AI relevance, categorize, and analyze trends.

## Data Sources
- **Trending List** (github.com/trending, today's stars most reliable): Real-time hot list with today's new stars
- **Topic Search** (GitHub Search API, topic tags): AI-related projects active in last 7 days, grouped by topic

---

## GitHub Today's Trending (${data.trendingRepos.length} repositories)
${trendingSection}

---

## AI Topic Search Results (${data.searchRepos.length} repositories, deduplicated)
${searchSection}

---

Generate a structured AI Open Source Trends Report in English:

**Step 1 (Filter)**: From the above data, select projects clearly related to AI/ML (exclude unrelated general tools, frontend frameworks, games, etc.). Skip non-AI trending repos.

**Step 2 (Categorize)**: Group filtered projects into these categories (a project can belong to multiple; pick the primary one):
- 🔧 AI Infrastructure (frameworks, SDKs, inference engines, dev tools, CLI)
- 🤖 AI Agents / Workflows (agent frameworks, automation, multi-agent systems)
- 📦 AI Applications (specific apps, vertical solutions)
- 🧠 LLMs / Training (model weights, training frameworks, fine-tuning tools)
- 🔍 RAG / Knowledge (vector databases, retrieval-augmented generation, knowledge management)

**Step 3 (Output Report)** with these sections:

1. **Today's Highlights** — 3-5 sentences on the most noteworthy AI open-source developments today

2. **Top Projects by Category** — For each category, render a **Markdown table** with exactly these columns:

   | Project | Lang | Stars (total / today) | Summary |
   | :--- | :--- | ---: | :--- |

   - **Project**: repo name as a Markdown link to its GitHub URL
   - **Lang**: primary language (leave blank if unknown)
   - **Stars**: total stars, plus today's new stars in parentheses when available (e.g. "86,392 (+1,851)"); copy the numbers from the input verbatim, do not recompute
   - **Summary**: 2 sentences — what the project is and why it's worth attention today, including any standout data point or momentum signal
   - List 3-8 projects per category; omit a category's table entirely if no project falls under it

3. **Trend Signal Analysis** — 200-300 words, distill from today's hot list:
   - Which type of AI tool is getting explosive community attention?
   - Any new tech stacks or directions appearing for the first time?
   - Connection to recent LLM releases / industry events

4. **Community Hot Spots** — Bullet list of 3-5 specific projects or directions worth developer focus, with brief reasoning

Style: English, professional and concise, must include GitHub links for every project.
`;
  }

  return `أنت محلّل تقني متخصّص في منظومة الذكاء الاصطناعي مفتوحة المصدر. فيما يلي بيانات ${dateStr} لأشهر مستودعات GitHub المرتبطة بالذكاء الاصطناعي، يُرجى إجراء تصفية للصلة بالذكاء الاصطناعي والتصنيف وتحليل الاتجاهات.

## توضيح البيانات
- **قائمة Trending** (github.com/trending، عدد stars اليوم هو الأكثر موثوقية): قائمة ساخنة لحظية لليوم، تتضمّن الـ stars المُضافة اليوم
- **البحث الموضوعي** (GitHub Search API، وسوم topic): مشاريع الذكاء الاصطناعي النشطة خلال 7 أيام، مُجمَّعة حسب الموضوع

---

## GitHub Trending لهذا اليوم (إجمالي ${data.trendingRepos.length} مستودعاً)
${trendingSection}

---

## نتائج البحث الموضوعي للذكاء الاصطناعي (إجمالي ${data.searchRepos.length} مستودعاً، بعد إزالة التكرار)
${searchSection}

---

يُرجى إنشاء تقرير يومي لاتجاهات الذكاء الاصطناعي مفتوحة المصدر، بالمواصفات التالية:

**الخطوة الأولى (التصفية)**: من البيانات أعلاه، اختَر المشاريع المرتبطة بوضوح بالذكاء الاصطناعي/تعلم الآلة (استبعِد الأدوات العامة غير ذات الصلة، وأُطر العمل الأمامية، والألعاب، إلخ)، وتجاوز المستودعات غير المرتبطة بالذكاء الاصطناعي في قائمة Trending.

**الخطوة الثانية (التصنيف)**: صنّف المشاريع المُصفّاة وفق الأبعاد التالية (يمكن أن ينتمي المشروع إلى أكثر من فئة، مع إعطاء الأولوية للفئة الرئيسية):
- 🔧 البنية التحتية للذكاء الاصطناعي (الأُطر، SDK، محرّكات الاستدلال، أدوات التطوير، CLI)
- 🤖 وكلاء الذكاء الاصطناعي/تدفقات العمل (أُطر Agent، الأتمتة، أنظمة متعددة الوكلاء)
- 📦 تطبيقات الذكاء الاصطناعي (تطبيقات محددة، حلول قطاعية)
- 🧠 النماذج اللغوية الكبيرة/التدريب (أوزان النماذج، أُطر التدريب، أدوات الضبط الدقيق)
- 🔍 RAG/قاعدة المعرفة (قواعد البيانات المتجهة، الاسترجاع المعزّز، إدارة المعرفة)

**الخطوة الثالثة (إخراج التقرير)**، مع تضمين الأقسام التالية:

1. **أبرز ما في اليوم** — 3 إلى 5 جُمل تُلخّص أبرز التطورات في مجال الذكاء الاصطناعي مفتوحة المصدر اليوم

2. **أبرز المشاريع حسب كل فئة** — لكل فئة، استخدم **جدول Markdown** بالأعمدة الثابتة التالية:

   | المشروع | اللغة | Stars (الإجمالي / اليوم) | وصف موجز |
   | :--- | :--- | ---: | :--- |

   - **المشروع**: اسم المستودع كرابط Markdown يشير إلى رابط GitHub الخاص به
   - **اللغة**: اللغة الأساسية (اتركه فارغاً إذا غير معروف)
   - **Stars**: إجمالي عدد الـ stars، مع توضيح الإضافة اليومية بين قوسين عند توفّرها (مثل "86,392 (+1,851)")؛ انسخ الأرقام من المدخلات كما هي، ولا تُعيد حسابها
   - **الوصف الموجز**: جملتان — ما هو المشروع ولماذا يستحق المتابعة اليوم، مع الإشارة إلى أي نقطة بيانات بارزة أو إشارة زخم
   - اذكُر 3 إلى 8 مشاريع لكل فئة؛ احذف جدول الفئة بالكامل إذا لم يندرج أي مشروع تحتها

3. **تحليل إشارات الاتجاهات** — 200 إلى 300 كلمة، استخلصها من القائمة الساخنة اليوم:
   - أي نوع من أدوات الذكاء الاصطناعي يحظى باهتمام مجتمعي متفجّر؟
   - هل تظهر أي حِزَم تقنية أو اتجاهات جديدة لأول مرة؟
   - الصلة بإصدارات النماذج اللغوية الكبيرة الأخيرة / الأحداث الصناعية

4. **بؤرة الاهتمام المجتمعي** — قائمة نقطية تضم 3 إلى 5 مشاريع أو اتجاهات محددة تستحق اهتمام المطورين، مع إيجاز الأسباب

اللغة: العربية، احترافية وموجزة، يجب تضمين روابط GitHub لكل مشروع.
`;
}

export function buildWebReportPrompt(results: WebFetchResult[], dateStr: string, lang: Lang = "ar"): string {
  const isAnyFirstRun = results.some((r) => r.isFirstRun);

  const siteSections = results
    .map(({ siteName, isFirstRun, newItems, totalDiscovered }) => {
      const mode =
        lang === "en"
          ? isFirstRun
            ? `First full crawl (sitemap total ${totalDiscovered} URLs, showing latest ${newItems.length} articles)`
            : `Incremental update, ${newItems.length} new articles today`
          : isFirstRun
            ? `أول زحف كامل للجدول (sitemap إجمالي ${totalDiscovered} رابط، عرض أحدث ${newItems.length} مقالة)`
            : `تحديث تزايدي اليوم، إجمالي ${newItems.length} محتوى جديد`;

      if (newItems.length === 0) {
        const noContent =
          lang === "en" ? `(${mode}, no content to analyze.)` : `(${mode}، لا يوجد محتوى لتحليله.)`;
        return `## ${siteName}\n\n${noContent}`;
      }

      const categoryLabel = lang === "en" ? "Category" : "الفئة";
      const dateLabel = lang === "en" ? "Published/Updated" : "تاريخ النشر/التحديث";
      const unknownDate = lang === "en" ? "unknown" : "غير معروف";
      const excerptLabel = lang === "en" ? "Excerpt" : "مقتطف";
      const metadataOnlyNote =
        lang === "en"
          ? "(metadata-only: title derived from URL slug, may be inaccurate; no article text available)"
          : "(بيانات وصفية فقط: العنوان مُستنتَج من مسار URL، وقد يكون غير دقيق؛ لا يتوفر نص المقال)";
      const itemsText = newItems
        .map((item) => {
          const lines = [
            `### [${item.title || item.url}](${item.url})`,
            `- ${categoryLabel}: ${item.category} | ${dateLabel}: ${item.lastmod.slice(0, 10) || unknownDate}`,
          ];
          if (item.content) {
            lines.push(`- ${excerptLabel}: ${item.content}`);
          } else {
            lines.push(`- ${metadataOnlyNote}`);
          }
          return lines.join("\n");
        })
        .join("\n\n");

      const lp = lang === "en" ? "(" : "(";
      const rp = lang === "en" ? ")" : ")";
      return `## ${siteName}${lp}${mode}${rp}\n\n${itemsText}`;
    })
    .join("\n\n---\n\n");

  const firstRunNote =
    lang === "en"
      ? isAnyFirstRun
        ? "This is the first full crawl. Please focus on the overall content landscape, historical context, and core themes of each site, rather than individual articles."
        : "This is an incremental update. Please focus on today's new content and assess its strategic significance in context."
      : isAnyFirstRun
        ? "هذا أول زحف كامل. يُرجى التركيز على المشهد العام للمحتوى والسياق التاريخي والمواضيع الأساسية لكل موقع، بدلاً من المقالات الفردية."
        : "هذا تحديث تزايدي. يُرجى التركيز على المحتوى الجديد لليوماتقييم أهميته الاستراتيجية في السياق.";

  if (lang === "en") {
    return `You are a deep content analyst focused on AI, skilled at extracting strategic signals from official announcements, technical blogs, research papers, and product documentation.

The following content was crawled on ${dateStr} from Anthropic (claude.com / anthropic.com) and OpenAI (openai.com). ${firstRunNote}

${siteSections}

---

Generate a detailed AI Official Content Tracking Report in English with these sections:

1. **Today's Highlights** — 3-5 sentences on the most important new releases or developments, calling out key highlights

2. **Anthropic / Claude Content Highlights** — Organize important content by category (news / research / engineering / learn, etc.):
   - For each piece, 2-4 sentences extracting core insights, technical details, or business significance
   - Note publication date and original link
   - If first full crawl, trace important milestones chronologically

3. **OpenAI Content Highlights** — Same structure, organized by research / release / company / safety categories
   - ⚠️ Note: OpenAI data is metadata-only (titles derived from URL slugs, no article text). Only list URLs and categories objectively. Do NOT speculate on title meanings or fabricate content summaries. If information is insufficient for analysis, state the data limitation clearly.

4. **Strategic Signal Analysis** — Based on both companies' release cadence and content focus, analyze:
   - Each company's recent technical priorities (model capabilities / safety / productization / ecosystem)
   - Competitive dynamics: who is setting the agenda, who is following
   - Potential impact on developers and enterprise users

5. **Notable Details** — Extract hidden signals from titles, phrasing, and timing, e.g.:
   - New terms or topics appearing for the first time
   - Dense releases in a category (may signal a product milestone)
   - Policy, compliance, and safety developments

${isAnyFirstRun ? "6. **Content Landscape Overview** — First full crawl only: summarize the content category distribution for both companies and describe their content strategy style (academic-oriented vs product-oriented vs user stories, etc.)\n\n" : ""}Style: English, professional and detailed, suited for AI researchers, product managers, and technical decision-makers. Every item must include official links.
`;
  }

  return `أنت محلّل محتوى متعمّق متخصّص في مجال الذكاء الاصطناعي، ماهر في استخلاص الإشارات الاستراتيجية من الإعلانات الرسمية والمدوّنات التقنية وأوراق البحث ووثائق المنتجات.

فيما يلي محتوى تمّ جلبه بتاريخ ${dateStr} من موقعي Anthropic (claude.com / anthropic.com) و OpenAI (openai.com)، ${firstRunNote}

${siteSections}

---

يُرجى إنشاء تقرير مفصّل لتتبّع المحتوى الرسمي للذكاء الاصطناعي، يضمّن الأقسام التالية:

1. **أبرز ما في اليوم** — 3 إلى 5 جُمل تُلخّص أهم الإصدارات أو التطورات الجديدة، مع إبراز النقاط المحورية

2. **أبرز محتوى Anthropic / Claude** — نَظّم المحتوى المهم حسب الفئة (news / research / engineering / learn، إلخ):
   - لكل عنصر، استخلص في 2 إلى 4 جُمل الرؤى الأساسية والتفاصيل التقنية أو الأهمية التجارية
   - أشر إلى تاريخ النشر والرابط الأصلي
   - إذا كان أول زحف كامل، تتبّع المعالم المهمة زمنياً

3. **أبرز محتوى OpenAI** — بنفس الهيكل، نَظّم حسب فئات research / release / company / safety
   - ⚠️ ملاحظة: بيانات OpenAI هي بيانات وصفية فقط (العناوين مُستنتَجة من مسارات URL، لا يوجد نص للمقال). اذكُر الروابط والفئات بشكل موضوعي فقط. لا تتكهّن على معاني العناوين أو تختلق ملخّصات للمحتوى. إذا كانت المعلومات غير كافية للتحليل، اذكُر قيد البيانات بوضوح.

4. **قراءة الإشارات الاستراتيجية** — بناءً على وتيرة الإصدار وتركيز المحتوى لدى الشركتين، حلّل:
   - أولويات كل شركة التقنية الأخيرة (قدرات النماذج / الأمان / التحويل إلى منتج / المنظومة)
   - الديناميكيات التنافسية: من يضع جدول الأعمال، ومن يتابع
   - الأثر المحتمل على المطورين والمستخدمين المؤسسيين

5. **تفاصيل تستحق الانتباه** — استخلص الإشارات الخفية من العناوين والصياغة وتوقيت النشر، مثل:
   - ظهور مصطلحات أو مواضيع جديدة لأول مرة
   - كثافة الإصدارات في فئة معيّنة (قد تشير إلى مرحلة منتج)
   - التطورات في السياسات والامتثال والأمان

${isAnyFirstRun ? "6. **نظرة عامة على مشهد المحتوى** — خاص بأول زحف كامل: لخّص التوزيع الفئوي للمحتوى لدى الشركتين وصِف أسلوب استراتيجية المحتوى لكل منهما (أكاديمي التوجّه مقابل موجّه نحو المنتج مقابل قصص المستخدمين، إلخ)\n\n" : ""}اللغة: العربية، احترافية ومفصّلة، تناسب الباحثين في مجال الذكاء الاصطناعي ومديري المنتجات وصنّاع القرار التقني. يجب تضمين الروابط الرسمية لكل عنصر.
`;
}

export function buildWeeklyPrompt(
  dailyDigests: Record<string, string>,
  weekStr: string,
  lang: Lang = "ar",
): string {
  const digestEntries = Object.entries(dailyDigests)
    .map(([date, content]) => `## ${date}\n\n${content}`)
    .join("\n\n---\n\n");

  if (lang === "en") {
    return `You are a technical analyst focused on the AI open-source ecosystem. The following are daily digest summaries from the past 7 days (${weekStr}) of AI tool community activity. Generate a comprehensive weekly recap.

${digestEntries}

---

Generate an AI Tools Ecosystem Weekly Report with these sections:

1. **Week's Top Stories** - 5-8 most important events, releases, and community developments this week, each with date
2. **CLI Tools Progress** - Overall activity and key changes for each AI CLI tool (Claude Code, Codex, Gemini CLI, etc.)
3. **AI Agent Ecosystem** - Key developments from OpenClaw and peer projects this week
4. **Open Source Trends** - Most notable technical directions from GitHub Trending and AI community this week
5. **HN Community Highlights** - Core AI discussion topics and community sentiment on Hacker News this week
6. **Official Announcements** - Important content published by Anthropic and OpenAI this week (if any)
7. **Next Week's Signals** - Based on this week's data, predict trends and upcoming events worth watching

Style: English, concise and professional, helping technical developers quickly grasp the week's developments.
`;
  }

  return `أنت محلّل تقني متخصّص في منظومة الذكاء الاصطناعي مفتوحة المصدر. فيما يلي ملخّصات يومية لنشاط مجتمع أدوات الذكاء الاصطناعي خلال الأيام السبعة الماضية (${weekStr})، يُرجى إنشاء تقرير مراجعة أسبوعي شامل.

${digestEntries}

---

يُرجى إنشاء تقرير أسبوعي لمنظومة أدوات الذكاء الاصطناعي يضمّن الأقسام التالية:

1. **أبرز أخبار الأسبوع** — 5 إلى 8 أهم الأحداث والإصدارات والتطورات المجتمعية هذا الأسبوع، مع تاريخ كل منها
2. **تقدّم أدوات CLI** — النشاط العام والتغييرات الرئيسية لكل أداة CLI للذكاء الاصطناعي (Claude Code و Codex و Gemini CLI، إلخ)
3. **منظومة وكلاء الذكاء الاصطناعي** — التطورات الرئيسية من OpenClaw والمشاريع المماثلة هذا الأسبوع
4. **اتجاهات مفتوحة المصدر** — أبرز الاتجاهات التقنية من GitHub Trending ومجتمع الذكاء الاصطناعي هذا الأسبوع
5. **أبرز ما جرى في مجتمع Hacker News** — المواضيع الأساسية للنقاش حول الذكاء الاصطناعي ومزاج المجتمع على Hacker News هذا الأسبوع
6. **الإعلانات الرسمية** — المحتوى المهم الذي نشرته Anthropic و OpenAI هذا الأسبوع (إن وُجد)
7. **إشارات الأسبوع القادم** — استناداً إلى بيانات هذا الأسبوع، توقّع الاتجاهات والأحداث القادمة التي تستحق المتابعة

اللغة: العربية، موجزة واحترافية، تساعد المطورين التقنيين على استيعاب تطورات الأسبوع بسرعة.
`;
}

export function buildMonthlyPrompt(
  sourceDigests: Record<string, string>,
  monthStr: string,
  lang: Lang = "ar",
): string {
  const digestEntries = Object.entries(sourceDigests)
    .map(([key, content]) => `## ${key}\n\n${content}`)
    .join("\n\n---\n\n");

  if (lang === "en") {
    return `You are a technical analyst focused on the AI open-source ecosystem. The following are ${monthStr} AI tool community digest summaries (${Object.keys(sourceDigests).length} reports total). Generate a comprehensive monthly review.

${digestEntries}

---

Generate an AI Tools Ecosystem Monthly Report with these sections:

1. **Month's Top Stories** - 5-10 most important events and milestones this month, in chronological order
2. **CLI Tools Monthly Progress** - Overall development trajectory, major releases, and community growth for each key AI CLI tool
3. **AI Agent Ecosystem Monthly Review** - Ecosystem landscape shifts, emerging projects, notable signals this month
4. **Technical Trend Summary** - Most significant technical directions and paradigm shifts in AI open-source this month
5. **Community Health Assessment** - Monthly activity comparison across major projects, developer engagement evaluation
6. **Official Announcements Review** - Strategic analysis of Anthropic and OpenAI content published this month
7. **Next Month's Outlook** - Based on this month's trends, predict key directions and potential events to watch

Style: English, in-depth analysis, data-driven, suited for monthly retrospectives and strategic decision-making.
`;
  }

  return `أنت محلّل تقني متخصّص في منظومة الذكاء الاصطناعي مفتوحة المصدر. فيما يلي ملخّصات مجتمع أدوات الذكاء الاصطناعي لشهر ${monthStr} (إجمالي ${Object.keys(sourceDigests).length} تقريراً)، يُرجى إنشاء تقرير المراجعة الشهري الشامل.

${digestEntries}

---

يُرجى إنشاء تقرير شهري لمنظومة أدوات الذكاء الاصطناعي يضمّن الأقسام التالية:

1. **أبرز أخبار الشهر** — 5 إلى 10 أهم الأحداث والمعالم في هذا الشهر، مرتّبة زمنياً
2. **التقدّم الشهري لأدوات CLI** — المسار العام للتطوير والإصدارات الرئيسية ونمو المجتمع لكل أداة CLI رئيسية للذكاء الاصطناعي
3. **المراجعة الشهرية لمنظومة وكلاء الذكاء الاصطناعي** — تحوّلات مشهد المنظومة والمشاريع الناشئة والإشارات الجديرة بالاهتمام هذا الشهر
4. **ملخّص الاتجاهات التقنية** — أبرز الاتجاهات التقنية وتحوّلات النموذج في مجال الذكاء الاصطناعي مفتوحة المصدر هذا الشهر
5. **تقييم صحة المجتمع** — مقارنة النشاط الشهري عبر المشاريع الرئيسية وتقييم تفاعل المطورين
6. **مراجعة الإعلانات الرسمية** — تحليل استراتيجي للمحتوى الذي نشرته Anthropic و OpenAI هذا الشهر
7. **النظرة المستقبلية للشهر القادم** — استناداً إلى اتجاهات هذا الشهر، توقّع الاتجاهات الرئيسية والأحداث المحتملة للمتابعة

اللغة: العربية، تحليل متعمّق، مدفوع بالبيانات، يناسب المراجعات الشهرية واتخاذ القرارات الاستراتيجية.
`;
}

// ---------------------------------------------------------------------------
// Highlights prompt — extracts structured highlights from finished reports
// for use in Telegram notifications.
// ---------------------------------------------------------------------------

export interface ReportHighlights {
  [reportId: string]: string[];
}

export function buildHighlightsPrompt(
  reportContents: Record<string, string>,
  lang: Lang = "ar",
  itemsPerReport: number = 6,
): string {
  const sections = Object.entries(reportContents)
    .map(([id, content]) => `## [${id}]\n\n${content.slice(0, 2000)}`)
    .join("\n\n---\n\n");

  if (lang === "en") {
    return `You are a concise news editor. The following are today's AI ecosystem report excerpts, each labeled with a report ID.

${sections}

---

For each report, extract ${itemsPerReport} of the most noteworthy highlights — the kind that would make a reader want to click through. Each highlight should be a single short sentence (under 60 characters).

Return ONLY valid JSON, no markdown fences, no explanation. Format:
{"ai-cli":["highlight 1","highlight 2",...],"ai-agents":["highlight 1","highlight 2",...],...}

Rules:
- Use the exact report IDs from the [brackets] above as keys
- Only include reports that have meaningful content (skip reports with failure messages or no activity)
- ${itemsPerReport} highlights per report, each under 60 characters
- Focus on: new releases, notable features, trending projects, key discussions
- Be specific: include project names, version numbers, star counts where relevant`;
  }

  return `أنت محرّر أخبار موجز. فيما يلي مقتطفات تقارير منظومة الذكاء الاصطناعي لهذا اليوم، لكل تقرير معرّف مُحدّد.

${sections}

---

لكل تقرير، استخرِج ${itemsPerReport} من أبرز النقاط الجديرة بالاهتمام — تلك التي تجعل القارئ راغباً في النقر للاطّلاع. كل نقطة يجب أن تكون جملة قصيرة واحدة (أقل من 60 حرفاً).

أعِد JSON صالحاً فقط، دون شبّيكات markdown ودون شرح. الصيغة:
{"ai-cli":["نقطة 1","نقطة 2",...],"ai-agents":["نقطة 1","نقطة 2",...],...}

القواعد:
- استخدم معرّفات التقارير المذكورة بين الأقواس المربعة أعلاه كمفاتيح
- ضَمّن التقارير ذات المحتوى الجوهري فقط (تجاوز التقارير التي تحوي رسائل فشل أو لا نشاط فيها)
- ${itemsPerReport} نقاط لكل تقرير، كل نقطة أقل من 60 حرفاً
- ركّز على: الإصدارات الجديدة، الميزات المهمة، المشاريع الرائجة، النقاشات المحورية
- كُن محدّداً: اذكُر أسماء المشاريع وأرقام الإصدارات وعدد الـ stars حيثما ورد ذكرها
- كل نقطة يجب أن تُكتب بالعربية؛ حتى لو كان الأصل (عنوان ورقة، اسم نموذج، عنوان نقاش) بالإنجليزية، اترجم إلى العربية، ولا تُبقَ الإنجليزية سوى للأسماء العلمية كأسماء المشاريع والنماذج والمنتجات، ولا تنقل جُمل إنجليزية كاملة كما هي`;
}

export function buildHnPrompt(data: HnData, dateStr: string, lang: Lang = "ar"): string {
  const storiesText = data.stories
    .map((s, i) =>
      lang === "en"
        ? `${i + 1}. **${s.title}**\n` +
          `   Link: ${s.url}\n` +
          `   Discussion: ${s.hnUrl}\n` +
          `   HN Rank: ${s.hnRank ?? i + 1} | Score: ${s.points} | Comments: ${s.comments} | Author: ${s.author} | Time: ${s.createdAt.slice(0, 16)}`
        : `${i + 1}. **${s.title}**\n` +
          `   الرابط: ${s.url}\n` +
          `   النقاش: ${s.hnUrl}\n` +
          `   ترتيب HN: ${s.hnRank ?? i + 1} | النقاط: ${s.points} | التعليقات: ${s.comments} | الكاتب: ${s.author} | الوقت: ${s.createdAt.slice(0, 16)}`,
    )
    .join("\n\n");

  if (lang === "en") {
    return `You are an AI industry news analyst. The following are AI-related posts from the current Hacker News topstories feed as of ${dateStr} (ordered by HN rank, ${data.stories.length} total):

---

${storiesText}

---

Generate a structured Hacker News AI Community Digest in English:

1. **Today's Highlights** — 3-5 sentences on the hottest AI discussion topics and community sentiment on HN today

2. **Top News & Discussions** — Organized by category, render a **Markdown table** per category with exactly these columns:

   | Title | Score | Comments | Summary |
   | :--- | ---: | ---: | :--- |

   - **Title**: title as a Markdown link to the original article, followed by a " · [HN](discussion-url)" link to the HN thread
   - **Score / Comments**: copy the numbers from the input verbatim
   - **Summary**: 2 sentences — why this matters and what the community's typical reaction is
   - Select the 2-5 most representative items per category; omit a category's table if empty

   Categories:
   - 🔬 Models & Research (new model releases, papers, benchmarks)
   - 🛠️ Tools & Engineering (open-source projects, frameworks, engineering practices)
   - 🏢 Industry News (company news, funding, product launches)
   - 💬 Opinions & Debates (notable Ask HN, Show HN, or hot discussion threads)

3. **Community Sentiment Signal** — 100-200 words analyzing today's HN AI discussion mood and focus:
   - Which topics are most active (high score + high comments)?
   - Any clear points of controversy or consensus?
   - Compared to last cycle, any notable shift in focus?

4. **Worth Deep Reading** — List 2-3 pieces most worth developers/researchers reading in depth, with brief reasoning

Style: English, concise and professional, preserve all original links.
`;
  }

  return `أنت محلّل أخبار صناعة الذكاء الاصطناعي. فيما يلي منشورات مرتبطة بالذكاء الاصطناعي مأخوذة من تغذية Hacker News القصصية الأكثر رواجاً بتاريخ ${dateStr} (مرتّبة حسب ترتيب HN، ${data.stories.length} إجمالاً):

---

${storiesText}

---

يُرجى إنشاء ملخّص مجتمع Hacker News للذكاء الاصطناعي، بالمواصفات التالية:

1. **أبرز ما في اليوم** — 3 إلى 5 جُمل تُلخّص مواضيع النقاش الأكثر رواجاً حول الذكاء الاصطناعي ومزاج المجتمع على HN اليوم

2. **أبرز الأخبار والنقاشات** — نَظّم حسب الفئة، استخدم **جدول Markdown** لكل فئة بالأعمدة الثابتة التالية:

   | العنوان | النقاط | التعليقات | وصف موجز |
   | :--- | ---: | ---: | :--- |

   - **العنوان**: العنوان كرابط Markdown يشير للمقال الأصلي، متبوعاً بـ " · [HN](رابط النقاش)" يشير إلى نقاش HN
   - **النقاط / التعليقات**: انسخ الأرقام من المدخلات كما هي، لا تُعيد حسابها
   - **الوصف الموجز**: جملتان — لماذا تستحق المتابعة وكيف يؤدّي المجتمع عادةً
   - اختر 2 إلى 5 عناصر تمثيلية لكل فئة؛ احذف جدول الفئة إذا كان فارغاً

   الفئات:
   - 🔬 النماذج والبحث (إصدارات نماذج جديدة، أوراق، معايير قياس)
   - 🛠️ الأدوات والهندسة (مشاريع مفتوحة المصدر، أُطر، ممارسات هندسية)
   - 🏢 أخبار الصناعة (أخبار الشركات، تمويل، إطلاق منتجات)
   - 💬 الآراء والجدل (نقاشات Ask HN أو Show HN أو مواضيع ساخنة جديرة بالاهتمام)

3. **إشارة مزاج المجتمع** — 100 إلى 200 كلمة، حلّل مزاج النقاش حول الذكاء الاصطناعي على HN اليوم ومحاور التركيز:
   - أي المواضيع أكثر نشاطاً (نقاط عالية + تعليقات كثيرة)؟
   - أي نقاط خلاف أو إجماع واضحة؟
   - مقارنة بالدورة السابقة، أي تحوّل جذري في التركيز؟

4. **يستحق القراءة المتعمّقة** — 2 إلى 3 عناصر تستحق أن يقرأها المطورون/الباحثون بتعمّق، مع إيجاز الأسباب

اللغة: العربية، موجزة واحترافية، احتفظ بجميع الروابط الأصلية.
`;
}

export function buildPhPrompt(data: PhData, dateStr: string, lang: Lang = "ar"): string {
  const productsText = data.products
    .map((p, i) =>
      lang === "en"
        ? `${i + 1}. **${p.name}** — ${p.tagline}\n` +
          `   Product Hunt: ${p.url}\n` +
          `   Website: ${p.website}\n` +
          `   Votes: ${p.votesCount} | Comments: ${p.commentsCount} | Topics: ${p.topics.join(", ")}`
        : `${i + 1}. **${p.name}** — ${p.tagline}\n` +
          `   Product Hunt: ${p.url}\n` +
          `   الموقع الرسمي: ${p.website}\n` +
          `   الأصوات: ${p.votesCount} | التعليقات: ${p.commentsCount} | المواضيع: ${p.topics.join(", ")}`,
    )
    .join("\n\n");

  if (lang === "en") {
    return `You are an AI product analyst. The following are AI-related products launched on Product Hunt in the past 24 hours as of ${dateStr} (sorted by votes, ${data.products.length} total):

---

${productsText}

---

Generate a structured Product Hunt AI Products Digest in English:

1. **Today's Highlights** — 3-5 sentences on the most notable AI product launches and trends on Product Hunt today

2. **Top Products** — Organized by category, render a **Markdown table** per category with exactly these columns:

   | Product | Votes | Comments | Summary |
   | :--- | ---: | ---: | :--- |

   - **Product**: product name as a Markdown link to its Product Hunt page, followed by " · [site](website-url)" when a website is available
   - **Votes / Comments**: copy the numbers from the input verbatim
   - **Summary**: 2 sentences — the tagline plus what problem it solves and what makes it stand out
   - Select the most representative products per category; omit a category's table if empty

   Categories:
   - 🤖 AI Agents & Assistants (chatbots, copilots, autonomous agents)
   - 🛠️ Developer Tools (APIs, SDKs, coding tools, dev infrastructure)
   - 📊 AI Applications (vertical products, SaaS tools powered by AI)
   - 🎨 Creative & Content (image/video/text generation, design tools)
   - 🔧 Infrastructure & Models (model serving, fine-tuning, MLOps)

3. **Market Signal** — 100-200 words analyzing today's Product Hunt AI launch patterns:
   - Which categories are most crowded?
   - Any innovative approaches or novel use cases?
   - Open-source vs closed-source trend among launches

4. **Worth Trying** — List 2-3 products most worth developers trying out, with brief reasoning

Style: English, concise and professional, preserve all original links.
`;
  }

  return `أنت محلّل منتجات ذكاء اصطناعي. فيما يلي منتجات مرتبطة بالذكاء الاصطناعي أُطلقت على Product Hunt خلال الـ 24 ساعة الماضية بتاريخ ${dateStr} (مرتّبة حسب الأصوات، ${data.products.length} إجمالاً):

---

${productsText}

---

يُرجى إنشاء ملخّص منتجات الذكاء الاصطناعي على Product Hunt، بالمواصفات التالية:

1. **أبرز ما في اليوم** — 3 إلى 5 جُمل تُلخّص الاتجاه العام وأبرز إطلاقات منتجات الذكاء الاصطناعي على Product Hunt اليوم

2. **أبرز المنتجات** — نَظّم حسب الفئات التالية، استخدم **جدول Markdown** لكل فئة بالأعمدة الثابتة التالية:

   | المنتج | الأصوات | التعليقات | وصف موجز |
   | :--- | ---: | ---: | :--- |

   - **المنتج**: اسم المنتج كرابط Markdown يشير لصفحة Product Hunt الخاصة به، متبوعاً بـ " · [الموقع](رابط الموقع)" إن توفّر موقع رسمي
   - **الأصوات / التعليقات**: انسخ الأرقام من المدخلات كما هي، لا تُعيد حسابها
   - **الوصف الموجز**: جملتان — مع الوصف المختصر، اشرح المشكلة التي يحلّها وما يميّزه
   - اختر المنتجات الأكثر تمثيلاً لكل فئة؛ احذف جدول الفئة إذا كان فارغاً

   الفئات:
   - 🤖 وكلاء ومساعدو الذكاء الاصطناعي (روبوتات المحادثة، Copilot، وكلاء مستقلون)
   - 🛠️ أدوات المطورين (API، SDK، أدوات البرمجة، البنية التحتية للتطوير)
   - 📊 تطبيقات الذكاء الاصطناعي (منتجات قطاعية، أدوات SaaS مدعومة بالذكاء الاصطناعي)
   - 🎨 الإبداع والمحتوى (توليد الصور/الفيديو/النص، أدوات التصميم)
   - 🔧 البنية التحتية والنماذج (خدمة النماذج، الضبط الدقيق، MLOps)

3. **إشارة السوق** — 100 إلى 200 كلمة، حلّل أنماط إطلاق منتجات الذكاء الاصطناعي على Product Hunt اليوم:
   - أي الفئات أكثر اكتظاظاً؟
   - أي مقاربات مبتكرة أو حالات استخدام جديدة؟
   - اتجاه المفتوح مقابل المغلق المصدر

4. **يستحق التجربة** — 2 إلى 3 منتجات يستحق المطورون تجربتها، مع إيجاز الأسباب

اللغة: العربية، موجزة واحترافية، احتفظ بجميع الروابط الأصلية.
`;
}

// ---------------------------------------------------------------------------
// ArXiv prompt
// ---------------------------------------------------------------------------

export function buildArxivPrompt(data: ArxivData, dateStr: string, lang: Lang = "ar"): string {
  const papersText = data.papers
    .map((p, i) => {
      const authors =
        p.authors.length > 3 ? p.authors.slice(0, 3).join(", ") + " et al." : p.authors.join(", ");
      const cats = p.categories.slice(0, 3).join(", ");
      return lang === "en"
        ? `${i + 1}. **${p.title}**\n` +
            `   Link: ${p.url}\n` +
            `   Authors: ${authors} | Categories: ${cats}\n` +
            `   Published: ${p.published.slice(0, 10)}\n` +
            `   Abstract: ${p.summary.slice(0, 300)}${p.summary.length > 300 ? "..." : ""}`
        : `${i + 1}. **${p.title}**\n` +
            `   الرابط: ${p.url}\n` +
            `   المؤلفون: ${authors} | الفئات: ${cats}\n` +
            `   تاريخ النشر: ${p.published.slice(0, 10)}\n` +
            `   الملخّص: ${p.summary.slice(0, 300)}${p.summary.length > 300 ? "..." : ""}`;
    })
    .join("\n\n");

  if (lang === "en") {
    return `You are an AI research analyst. The following are recent AI-related papers from ArXiv as of ${dateStr} (${data.papers.length} papers from cs.AI, cs.CL, cs.LG):

---

${papersText}

---

Generate a structured ArXiv AI Research Digest in English:

1. **Today's Highlights** — 3-5 sentences on the most significant research directions and breakthroughs

2. **Key Papers** — Select 8-15 most important papers, organized by theme. Under each theme header, render a **Markdown table** with exactly these columns:

   | Paper | Authors | Summary |
   | :--- | :--- | :--- |

   - **Paper**: title as a Markdown link to its ArXiv URL
   - **Authors**: abbreviated (first 3 + et al.)
   - **Summary**: 2 sentences — the key contribution and why it matters
   - Omit a theme's table if no paper falls under it

   Themes:
   - 🧠 Large Language Models (architecture, training, alignment, evaluation)
   - 🤖 Agents & Reasoning (planning, tool use, multi-agent, chain-of-thought)
   - 🔧 Methods & Frameworks (new techniques, benchmarks, efficiency improvements)
   - 📊 Applications (domain-specific, multimodal, code generation)

3. **Research Trend Signal** — 100-200 words on emerging research directions visible from today's submissions

4. **Worth Deep Reading** — 2-3 papers most worth reading in full, with reasoning

Style: English, concise and professional, preserve all ArXiv links.
`;
  }

  return `أنت محلّل أبحاث الذكاء الاصطناعي. فيما يلي أحدث الأوراق المرتبطة بالذكاء الاصطناعي على ArXiv بتاريخ ${dateStr} (إجمالي ${data.papers.length} ورقة، من cs.AI و cs.CL و cs.LG):

---

${papersText}

---

يُرجى إنشاء ملخّص أبحاث ArXiv للذكاء الاصطناعي، بالمواصفات التالية:

1. **أبرز ما في اليوم** — 3 إلى 5 جُمل تُلخّص أبرز اتجاهات البحث والاختراقات

2. **الأوراق الرئيسية** — اختَر 8 إلى 15 من أهم الأوراق، نَظّمها حسب الموضوع. تحت كل عنوان موضوع، استخدم **جدول Markdown** بالأعمدة الثابتة التالية:

   | الورقة | المؤلفون | وصف موجز |
   | :--- | :--- | :--- |

   - **الورقة**: العنوان كرابط Markdown يشير إلى رابط ArXiv الخاص به
   - **المؤلفون**: مختصَر (أول 3 + et al.)
   - **الوصف الموجز**: جملتان — المساهمة الأساسية ولماذا تستحق الاهتمام
   - احذف جدول الموضوع إذا لم يندرج أي ورقة تحته

   المواضيع:
   - 🧠 النماذج اللغوية الكبيرة (البنية، التدريب، المواءمة، التقييم)
   - 🤖 الوكلاء والاستدلال (التخطيط، استخدام الأدوات، متعدد الوكلاء، سلسلة الأفكار)
   - 🔧 الطرق والأطر (تقنيات جديدة، معايير قياس، تحسينات الكفاءة)
   - 📊 التطبيقات (قطاعية، متعددة الأنماط، توليد الأكواد)

3. **إشارة اتجاه البحث** — 100 إلى 200 كلمة حول اتجاهات البحث الناشئة الظاهرة من المساهمات اليومية

4. **يستحق القراءة المتعمّقة** — 2 إلى 3 أوراق تستحق القراءة كاملة، مع إيجاز الأسباب

اللغة: العربية، موجزة واحترافية، احتفظ بجميع روابط ArXiv.
`;
}

// ---------------------------------------------------------------------------
// Hugging Face prompt
// ---------------------------------------------------------------------------

export function buildHfPrompt(data: HfData, dateStr: string, lang: Lang = "ar"): string {
  const modelsText = data.models
    .map((m, i) =>
      lang === "en"
        ? `${i + 1}. **${m.id}**\n` +
          `   Link: ${m.url}\n` +
          `   Author: ${m.author} | Pipeline: ${m.pipelineTag || "N/A"}\n` +
          `   Likes: ${m.likes.toLocaleString()} | Downloads: ${m.downloads.toLocaleString()}\n` +
          `   Tags: ${m.tags.slice(0, 5).join(", ")}`
        : `${i + 1}. **${m.id}**\n` +
          `   الرابط: ${m.url}\n` +
          `   المؤلف: ${m.author} | المهمة: ${m.pipelineTag || "N/A"}\n` +
          `   الإعجابات: ${m.likes.toLocaleString()} | التنزيلات: ${m.downloads.toLocaleString()}\n` +
          `   الوسوم: ${m.tags.slice(0, 5).join(", ")}`,
    )
    .join("\n\n");

  if (lang === "en") {
    return `You are an AI model ecosystem analyst. The following are trending models on Hugging Face Hub as of ${dateStr} (${data.models.length} models, sorted by weekly likes):

---

${modelsText}

---

Generate a structured Hugging Face Trending Models Digest in English:

1. **Today's Highlights** — 3-5 sentences on the most notable model releases and trends on Hugging Face

2. **Trending Models** — Organized by category. Under each category header, render a **Markdown table** with exactly these columns:

   | Model | Author | Likes | Downloads | Summary |
   | :--- | :--- | ---: | ---: | :--- |

   - **Model**: model name as a Markdown link to its HF URL
   - **Likes / Downloads**: copy the numbers from the input verbatim (keep the thousands separators; do not recompute or round)
   - **Summary**: 2 sentences — what it is and why it's trending, including a standout capability or data point
   - Omit a category's table entirely if no model falls under it

   Categories:
   - 🧠 Language Models (LLMs, chat models, instruction-tuned)
   - 🎨 Multimodal & Generation (image, video, audio, text-to-X)
   - 🔧 Specialized Models (code, math, medical, embeddings)
   - 📦 Fine-tunes & Quantizations (community fine-tunes, GGUF, AWQ)

3. **Ecosystem Signal** — 100-200 words analyzing model ecosystem trends:
   - Which model families are gaining momentum?
   - Open-weight vs proprietary trends
   - Notable quantization or fine-tuning activity

4. **Worth Exploring** — 2-3 models most worth trying or studying, with reasoning

Style: English, concise and professional, preserve all HuggingFace links.
`;
  }

  return `أنت محلّل منظومة نماذج الذكاء الاصطناعي. فيما يلي النماذج الرائجة على Hugging Face Hub بتاريخ ${dateStr} (إجمالي ${data.models.length} نموذجاً، مرتّبة حسب الإعجابات الأسبوعية):

---

${modelsText}

---

يُرجى إنشاء ملخّص النماذج الرائجة على Hugging Face، بالمواصفات التالية:

1. **أبرز ما في اليوم** — 3 إلى 5 جُمل تُلخّص أبرز إصدارات النماذج والاتجاهات على Hugging Face

2. **النماذج الرائجة** — نَظّم حسب الفئات التالية. تحت كل عنوان فئة، استخدم **جدول Markdown** بالأعمدة الثابتة التالية:

   | النموذج | المؤلف | الإعجابات | التنزيلات | وصف موجز |
   | :--- | :--- | ---: | ---: | :--- |

   - **النموذج**: اسم النموذج كرابط Markdown يشير إلى رابط HF الخاص به
   - **الإعجابات / التنزيلات**: انسخ الأرقام من بيانات المدخلات كما هي (احتفظ بفواصل الآلاف؛ لا تُعيد الحساب أو التقريب)
   - **الوصف الموجز**: جملتان — ما هو النموذج ولماذا يتصدر الرواج، مع الإشارة إلى قدرة بارزة أو نقطة بيانات لافتة
   - احذف جدول الفئة بالكامل إذا لم يندرج أي نموذج تحتها

   الفئات:
   - 🧠 النماذج اللغوية (نماذج LLM، نماذج المحادثة، المُعدّلة بالتعليمات)
   - 🎨 متعدد الأنماط والتوليد (الصور، الفيديو، الصوت، نص إلى X)
   - 🔧 النماذج المتخصّصة (الأكواد، الرياضيات، الطب، التضمينات)
   - 📦 الضبط الدقيق والتكميم (تعديلات مجتمعية، GGUF، AWQ)

3. **إشارة المنظومة** — 100 إلى 200 كلمة، حلّل اتجاهات منظومة النماذج:
   - أي عائلات النماذج تكتسب زخماً؟
   - اتجاهات الأوزان المفتوحة مقابل المغلقة
   - نشاط التكميم أو الضبط الدقيق الجدير بالاهتمام

4. **يستحق الاستكشاف** — 2 إلى 3 نماذج تستحق التجربة أو الدراسة، مع إيجاز الأسباب

اللغة: العربية، موجزة واحترافية، احتفظ بجميع روابط HuggingFace.
`;
}

// ---------------------------------------------------------------------------
// Community prompt (Dev.to + Lobste.rs combined)
// ---------------------------------------------------------------------------

export function buildCommunityPrompt(
  devto: DevtoData,
  lobsters: LobstersData,
  dateStr: string,
  lang: Lang = "ar",
): string {
  const devtoText =
    devto.articles.length > 0
      ? devto.articles
          .map((a, i) =>
            lang === "en"
              ? `${i + 1}. **${a.title}**\n` +
                `   Link: ${a.url}\n` +
                `   Author: ${a.user} | Reactions: ${a.positiveReactionsCount} | Comments: ${a.commentsCount} | Reading: ${a.readingTimeMinutes} min\n` +
                `   Tags: ${a.tags.join(", ")}\n` +
                `   ${a.description}`
              : `${i + 1}. **${a.title}**\n` +
                `   الرابط: ${a.url}\n` +
                `   الكاتب: ${a.user} | الإعجابات: ${a.positiveReactionsCount} | التعليقات: ${a.commentsCount} | القراءة: ${a.readingTimeMinutes} دقيقة\n` +
                `   الوسوم: ${a.tags.join(", ")}\n` +
                `   ${a.description}`,
          )
          .join("\n\n")
      : lang === "en"
        ? "(No Dev.to articles available)"
        : "(لا توجد مقالات Dev.to متاحة)";

  const lobstersText =
    lobsters.stories.length > 0
      ? lobsters.stories
          .map((s, i) =>
            lang === "en"
              ? `${i + 1}. **${s.title}**\n` +
                `   Link: ${s.url}\n` +
                `   Discussion: ${s.commentsUrl}\n` +
                `   Score: ${s.score} | Comments: ${s.commentCount} | Author: ${s.author} | Tags: ${s.tags.join(", ")}`
              : `${i + 1}. **${s.title}**\n` +
                `   الرابط: ${s.url}\n` +
                `   النقاش: ${s.commentsUrl}\n` +
                `   النقاط: ${s.score} | التعليقات: ${s.commentCount} | الكاتب: ${s.author} | الوسوم: ${s.tags.join(", ")}`,
          )
          .join("\n\n")
      : lang === "en"
        ? "(No Lobste.rs stories available)"
        : "(لا توجد محتويات Lobste.rs متاحة)";

  if (lang === "en") {
    return `You are a tech community analyst. The following are AI-related content from Dev.to and Lobste.rs as of ${dateStr}:

## Dev.to Articles (${devto.articles.length} articles)

${devtoText}

---

## Lobste.rs Stories (${lobsters.stories.length} stories)

${lobstersText}

---

Generate a structured Tech Community AI Digest in English:

1. **Today's Highlights** — 3-5 sentences on the most discussed AI topics across these communities today

2. **Dev.to Highlights** — Select 5-10 most valuable articles as a **Markdown table**:

   | Article | Reactions | Comments | Summary |
   | :--- | ---: | ---: | :--- |

   - **Article**: title as a Markdown link
   - **Reactions / Comments**: copy the numbers from the input verbatim
   - **Summary**: 2 sentences — the key takeaway for developers

3. **Lobste.rs Highlights** — Select 3-8 most notable stories as a **Markdown table**:

   | Story | Score | Comments | Summary |
   | :--- | ---: | ---: | :--- |

   - **Story**: title as a Markdown link, followed by " · [discuss](discussion-url)"
   - **Score / Comments**: copy the numbers from the input verbatim
   - **Summary**: 2 sentences — why it's worth reading

4. **Community Pulse** — 100-200 words on what these communities are talking about:
   - Common themes across both platforms
   - Practical concerns developers have about AI tools
   - Emerging tutorials, patterns, or best practices

5. **Worth Reading** — 2-3 articles/stories most worth reading in depth

Style: English, concise and developer-friendly, preserve all original links.
`;
  }

  return `أنت محلّل مجتمع تقني. فيما يلي محتوى مرتبط بالذكاء الاصطناعي من Dev.to و Lobste.rs بتاريخ ${dateStr}:

## مقالات Dev.to (إجمالي ${devto.articles.length} مقالة)

${devtoText}

---

## محتوى Lobste.rs (إجمالي ${lobsters.stories.length} عنصراً)

${lobstersText}

---

يُرجى إنشاء ملخّص المجتمع التقني للذكاء الاصطناعي، بالمواصفات التالية:

1. **أبرز ما في اليوم** — 3 إلى 5 جُمل تُلخّص مواضيع النقاش الأكثر رواجاً حول الذكاء الاصطناعي في هذه المجتمعات اليوم

2. **أبرز مقالات Dev.to** — اختَر 5 إلى 10 من أنفع المقالات على شكل **جدول Markdown**:

   | المقال | الإعجابات | التعليقات | وصف موجز |
   | :--- | ---: | ---: | :--- |

   - **المقال**: العنوان كرابط Markdown
   - **الإعجابات / التعليقات**: انسخ الأرقام من المدخلات كما هي، لا تُعيد حسابها
   - **الوصف الموجز**: جملتان — الاستفادة الأساسية للمطورين

3. **أبرز محتويات Lobste.rs** — اختَر 3 إلى 8 من أبرز القصص على شكل **جدول Markdown**:

   | القصة | النقاط | التعليقات | وصف موجز |
   | :--- | ---: | ---: | :--- |

   - **القصة**: العنوان كرابط Markdown، متبوعاً بـ " · [نقاش](رابط النقاش)"
   - **النقاط / التعليقات**: انسخ الأرقام من المدخلات كما هي، لا تُعيد حسابها
   - **الوصف الموجز**: جملتان — لماذا يستحق القراءة

4. **نبض المجتمع** — 100 إلى 200 كلمة، حلّل ما يتحدّث عنه المجتمع التقني:
   - المواضيع المشتركة بين المنصّتين
   - المخاوف العملية للمطورين بشأن أدوات الذكاء الاصطناعي
   - الشروحات والأنماط وأفضل الممارسات الناشئة

5. **يستحق القراءة المتعمّقة** — 2 إلى 3 مقالات/قصص تستحق القراءة بتعمّق

اللغة: العربية، موجزة وملائمة للمطورين، احتفظ بجميع الروابط الأصلية.
`;
}
