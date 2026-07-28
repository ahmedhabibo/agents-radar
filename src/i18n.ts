/**
 * Centralized i18n strings for bilingual (ar/en) report generation.
 */

export type Lang = "ar" | "en";

/** Get a bilingual string by language key. */
function t(ar: string, en: string): Record<Lang, string> {
  return { ar, en };
}

// ---------------------------------------------------------------------------
// Status & error messages (used in index.ts, rollup.ts)
// ---------------------------------------------------------------------------

export const MSG = {
  noActivity: t("لا نشاط خلال آخر ٢٤ ساعة.", "No activity in the last 24 hours."),
  summaryFailed: t("⚠️ فشل إنشاء الملخص.", "⚠️ Summary generation failed."),
  skillsFailed: t("⚠️ فشل إنشاء ملخص المهارات.", "⚠️ Skills summary generation failed."),
  trendingNoData: t(
    "⚠️ تعذر جلب بيانات التوجهات، فشل إنشاء التقرير.",
    "⚠️ Trending data unavailable, unable to generate report.",
  ),
  trendingFailed: t("⚠️ فشل إنشاء تقرير التوجهات.", "⚠️ Trending report generation failed."),
} as const;

// ---------------------------------------------------------------------------
// Report headers & labels (used in report-builders.ts, index.ts, rollup.ts)
// ---------------------------------------------------------------------------

export const CLI_REPORT = {
  title: t("نشرة أدوات CLI للذكاء الاصطناعي", "AI CLI Tools Community Digest"),
  meta: (utcStr: string, count: number, lang: Lang) =>
    lang === "en"
      ? `> Generated: ${utcStr} UTC | Tools covered: ${count}\n\n`
      : `> وقت التوليد: ${utcStr} UTC | عدد الأدوات: ${count}\n\n`,
  skillsHeading: t("أبرز مهارات Claude Code", "Claude Code Skills Highlights"),
  skillsSource: t("مصدر البيانات", "Source"),
  comparison: t("مقارنة شاملة", "Cross-Tool Comparison"),
  detail: t("تقارير تفصيلية لكل أداة", "Per-Tool Reports"),
} as const;

export const OPENCLAW_REPORT = {
  title: t("نشرة OpenClaw البيئية", "OpenClaw Ecosystem Digest"),
  deepDive: t("تقرير OpenClaw التفصيلي", "OpenClaw Deep Dive"),
  comparison: t("مقارنة بيئية شاملة", "Cross-Ecosystem Comparison"),
  peers: t("تقارير المشاريع المنافسة", "Peer Project Reports"),
} as const;

export const WEB_REPORT = {
  title: t("تقرير المحتوى الرسمي للذكاء الاصطناعي", "Official AI Content Report"),
  firstCrawl: t("أول زحف كامل", "First full crawl"),
  todayUpdate: t("تحديث اليوم", "Today's update"),
  newContent: (count: number, lang: Lang) =>
    lang === "en" ? `New content: ${count} articles` : `محتوى جديد: ${count} مقالة`,
  generated: (utcStr: string, lang: Lang) =>
    lang === "en" ? `Generated: ${utcStr} UTC` : `وقت التوليد: ${utcStr} UTC`,
  sourcesHeader: t("المصادر:", "Sources:"),
  issueTitle: (dateStr: string, isFirstRun: boolean, lang: Lang) =>
    lang === "en"
      ? `🌐 Official AI Content Report ${dateStr}${isFirstRun ? " (First Crawl)" : ""}`
      : `🌐 تقرير المحتوى الرسمي للذكاء الاصطناعي ${dateStr}${isFirstRun ? " (أول زحف كامل)" : ""}`,
} as const;

export const TRENDING_REPORT = {
  title: t("توجهات المصادر المفتوحة للذكاء الاصطناعي", "AI Open Source Trends"),
  sources: t("المصادر: GitHub Trending + GitHub Search API", "Sources: GitHub Trending + GitHub Search API"),
  issueTitle: (dateStr: string, lang: Lang) =>
    lang === "en" ? `📈 AI Open Source Trends ${dateStr}` : `📈 توجهات المصادر المفتوحة للذكاء الاصطناعي ${dateStr}`,
} as const;

export const HN_REPORT = {
  title: t("نشرة Hacker News للذكاء الاصطناعي", "Hacker News AI Community Digest"),
  issueTitle: (dateStr: string, lang: Lang) =>
    lang === "en" ? `📰 Hacker News AI Digest ${dateStr}` : `📰 نشرة Hacker News للذكاء الاصطناعي ${dateStr}`,
} as const;

export const PH_REPORT = {
  title: t("نشرة منتجات Product Hunt للذكاء الاصطناعي", "Product Hunt AI Products Digest"),
  issueTitle: (dateStr: string, lang: Lang) =>
    lang === "en" ? `🚀 Product Hunt AI Digest ${dateStr}` : `🚀 نشرة منتجات Product Hunt للذكاء الاصطناعي ${dateStr}`,
} as const;

export const ARXIV_REPORT = {
  title: t("نشرة أبحاث ArXiv للذكاء الاصطناعي", "ArXiv AI Research Digest"),
  issueTitle: (dateStr: string, lang: Lang) =>
    lang === "en" ? `📚 ArXiv AI Research Digest ${dateStr}` : `📚 نشرة أبحاث ArXiv للذكاء الاصطناعي ${dateStr}`,
} as const;

export const HF_REPORT = {
  title: t("نشرة Hugging Face للنماذج الرائجة", "Hugging Face Trending Models Digest"),
  issueTitle: (dateStr: string, lang: Lang) =>
    lang === "en" ? `🤗 Hugging Face Trending Models ${dateStr}` : `🤗 نشرة Hugging Face للنماذج الرائجة ${dateStr}`,
} as const;

export const COMMUNITY_REPORT = {
  title: t("نشرة المجتمعات التقنية للذكاء الاصطناعي", "Tech Community AI Digest"),
  issueTitle: (dateStr: string, lang: Lang) =>
    lang === "en" ? `💬 Tech Community AI Digest ${dateStr}` : `💬 نشرة المجتمعات التقنية للذكاء الاصطناعي ${dateStr}`,
} as const;

export const WEEKLY_REPORT = {
  title: t("التقرير الأسبوعي لأدوات الذكاء الاصطناعي", "AI Tools Ecosystem Weekly Report"),
  coverage: t("فترة التغطية", "Coverage"),
  issueTitle: (weekStr: string) => `📅 التقرير الأسبوعي لأدوات الذكاء الاصطناعي ${weekStr}`,
} as const;

export const MONTHLY_REPORT = {
  title: t("التقرير الشهري لأدوات الذكاء الاصطناعي", "AI Tools Ecosystem Monthly Report"),
  issueTitle: (monthStr: string) => `📆 التقرير الشهري لأدوات الذكاء الاصطناعي ${monthStr}`,
} as const;

export const ISSUE_LABELS = {
  cli: t("digest", "digest-en"),
  openclaw: t("openclaw", "openclaw-en"),
  web: t("web", "web-en"),
  trending: t("trending", "trending-en"),
  hn: t("hn", "hn-en"),
  ph: t("ph", "ph-en"),
  arxiv: t("arxiv", "arxiv-en"),
  hf: t("hf", "hf-en"),
  community: t("community", "community-en"),
} as const;

export const CLI_ISSUE_TITLE = (dateStr: string, lang: Lang) =>
  lang === "en" ? `📊 AI CLI Tools Digest ${dateStr}` : `📊 نشرة أدوات AI CLI ${dateStr}`;

export const OPENCLAW_ISSUE_TITLE = (dateStr: string, lang: Lang) =>
  lang === "en" ? `🦞 OpenClaw Ecosystem Digest ${dateStr}` : `🦞 نشرة OpenClaw البيئية ${dateStr}`;

// ---------------------------------------------------------------------------
// Footer (used in report.ts)
// ---------------------------------------------------------------------------

export const FOOTER = {
  autoGen: t("هذه النشرة أُنشئت تلقائياً بواسطة", "This digest is auto-generated by"),
} as const;

// ---------------------------------------------------------------------------
// Report labels for manifest/RSS (used in generate-manifest.ts)
// ---------------------------------------------------------------------------

export const REPORT_LABELS: Record<string, string> = {
  "ai-cli": "نشرة أدوات AI CLI",
  "ai-cli-en": "AI CLI Tools Digest",
  "ai-agents": "نشرة AI Agents البيئية",
  "ai-agents-en": "AI Agents Ecosystem Digest",
  "ai-web": "تقرير المحتوى الرسمي للذكاء الاصطناعي",
  "ai-web-en": "Official AI Content Report",
  "ai-trending": "توجهات المصادر المفتوحة للذكاء الاصطناعي",
  "ai-trending-en": "AI Open Source Trends",
  "ai-hn": "نشرة Hacker News للذكاء الاصطناعي",
  "ai-hn-en": "Hacker News AI Community Digest",
  "ai-ph": "نشرة منتجات Product Hunt للذكاء الاصطناعي",
  "ai-ph-en": "Product Hunt AI Products Digest",
  "ai-arxiv": "نشرة أبحاث ArXiv للذكاء الاصطناعي",
  "ai-arxiv-en": "ArXiv AI Research Digest",
  "ai-hf": "نشرة Hugging Face النماذج الرائجة",
  "ai-hf-en": "Hugging Face Trending Models Digest",
  "ai-community": "نشرة المجتمعات التقنية للذكاء الاصطناعي",
  "ai-community-en": "Tech Community AI Digest",
  "ai-weekly": "التقرير الأسبوعي لأدوات الذكاء الاصطناعي",
  "ai-weekly-en": "AI Tools Weekly Digest",
  "ai-monthly": "التقرير الشهري لأدوات الذكاء الاصطناعي",
  "ai-monthly-en": "AI Tools Monthly Digest",
};

export const NOTIFY_LABELS: Record<string, Record<Lang, string>> = {
  "ai-cli": t("أدوات AI CLI", "AI CLI Tools"),
  "ai-agents": t("بيئة AI Agents", "AI Agents Ecosystem"),
  "ai-web": t("تحديثات رسمية", "Official Updates"),
  "ai-trending": t("توجهات GitHub", "GitHub Trends"),
  "ai-hn": t("مجتمع HN", "HN Community"),
  "ai-ph": t("Product Hunt", "Product Hunt"),
  "ai-arxiv": t("أبحاث ArXiv", "ArXiv Research"),
  "ai-hf": t("نماذج HF", "HF Models"),
  "ai-community": t("مجتمع تقني", "Tech Community"),
  "ai-weekly": t("أسبوعي أدوات AI", "AI Tools Weekly"),
  "ai-monthly": t("شهري أدوات AI", "AI Tools Monthly"),
};