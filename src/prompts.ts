/**
 * LLM prompt builders and item formatting.
 */

import type { RepoConfig, GitHubItem, GitHubRelease } from "./github.ts";
import type { Lang } from "./i18n.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RepoDigest {
  config: RepoConfig;
  issues: GitHubItem[];
  prs: GitHubItem[];
  releases: GitHubRelease[];
  summary: string;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatItem(item: GitHubItem, lang: Lang = "ar"): string {
  const labels = item.labels.map((l) => l.name).join(", ");
  const labelStr = labels ? ` [${labels}]` : "";
  const body = (item.body ?? "").replace(/\n/g, " ").trim().slice(0, 300);
  const ellipsis = (item.body ?? "").length > 300 ? "..." : "";
  const t =
    lang === "en"
      ? {
          author: "Author",
          created: "Created",
          updated: "Updated",
          comments: "Comments",
          url: "URL",
          summary: "Summary",
        }
      : { author: "المؤلف", created: "تاريخ الإنشاء", updated: "تاريخ التحديث", comments: "التعليقات", url: "الرابط", summary: "الملخص" };
  // Extract "owner/repo" from html_url to avoid full GitHub URLs that trigger cross-references
  const repoSlug = item.html_url.replace(/^https:\/\/github\.com\//, "").replace(/\/(issues|pull)\/\d+$/, "");
  const itemKind = item.html_url.includes("/pull/") ? "PR" : "Issue";
  const refStr = `${repoSlug} ${itemKind} #${item.number}`;
  return [
    `#${item.number} [${item.state.toUpperCase()}]${labelStr} ${item.title}`,
    `  ${t.author}: ${item.user.login} | ${t.created}: ${item.created_at.slice(0, 10)} | ${t.updated}: ${item.updated_at.slice(0, 10)} | ${t.comments}: ${item.comments} | 👍: ${item.reactions?.["+1"] ?? 0}`,
    `  ${t.url}: ${refStr}`,
    `  ${t.summary}: ${body}${ellipsis}`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Sampling helpers (shared)
// ---------------------------------------------------------------------------

const CLI_ISSUE_LIMIT = 30;
const CLI_PR_LIMIT = 20;

/** Sort by comment count desc, take top N. */
export function topN(items: GitHubItem[], n: number): GitHubItem[] {
  return [...items].sort((a, b) => b.comments - a.comments).slice(0, n);
}

export function sampleNote(total: number, sampled: number, lang: Lang = "ar"): string {
  if (lang === "en") {
    return total > sampled
      ? `(Total: ${total} items; showing top ${sampled} by comment count)`
      : `(Total: ${total} items)`;
  }
  return total > sampled ? `(إجمالي ${total} عنصر؛ يعرض ${sampled} الأكثر تعليقاً)` : `(إجمالي ${total} عنصر)`;
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

export function buildCliPrompt(
  cfg: RepoConfig,
  issues: GitHubItem[],
  prs: GitHubItem[],
  releases: GitHubRelease[],
  dateStr: string,
  lang: Lang = "ar",
): string {
  const sampledIssues = topN(issues, CLI_ISSUE_LIMIT);
  const sampledPrs = topN(prs, CLI_PR_LIMIT);

  const issuesText =
    sampledIssues.map((i) => formatItem(i, lang)).join("\n") || (lang === "en" ? "None" : "لا يوجد");
  const prsText = sampledPrs.map((p) => formatItem(p, lang)).join("\n") || (lang === "en" ? "None" : "لا يوجد");
  const releasesText = releases.length
    ? releases.map((r) => `- ${r.tag_name}: ${r.name}\n  ${(r.body ?? "").slice(0, 300)}`).join("\n")
    : lang === "en"
      ? "None"
      : "لا يوجد";

  const issueNote = sampleNote(issues.length, sampledIssues.length, lang);
  const prNote = sampleNote(prs.length, sampledPrs.length, lang);

  if (lang === "en") {
    return `You are a technical analyst focused on AI developer tools. Based on the following GitHub data, generate the ${cfg.name} community digest for ${dateStr}.

# Data source: github.com/${cfg.repo}

## Latest Releases (last 24h)
${releasesText}

## Latest Issues (updated in last 24h)${issueNote}
${issuesText}

## Latest Pull Requests (updated in last 24h)${prNote}
${prsText}

---

Generate a structured English digest with the following sections:

1. **Today's Highlights** - 2-3 sentences summarizing the most important updates
2. **Releases** - If new versions exist, summarize changes; omit if none
3. **Hot Issues** - Pick 10 noteworthy Issues, explain why they matter and community reaction
4. **Key PR Progress** - Pick 10 important PRs, describe features or fixes
5. **Feature Request Trends** - Distill the most-requested feature directions from all Issues
6. **Developer Pain Points** - Summarize recurring developer frustrations or high-frequency requests

Style: concise and professional, suited for technical developers. Include GitHub links for each item.
`;
  }

  return `أنت محلل تقني متخصص في أدوات تطوير الذكاء الاصطناعي. يرجى إنشاء تقرير مجتمعي يومي لـ ${dateStr} حول ${cfg.name} استناداً إلى بيانات GitHub التالية.

# مصدر البيانات: github.com/${cfg.repo}

## أحدث الإصدارات (آخر 24 ساعة)
${releasesText}

## أحدث الـ Issues (تم التحديث خلال آخر 24 ساعة) ${issueNote}
${issuesText}

## أحدث Pull Requests (تم التحديث خلال آخر 24 ساعة) ${prNote}
${prsText}

---

يرجى إنشاء تقرير يومي منظم باللغة العربية يتضمن الأقسام التالية:

1. **أبرز أحداث اليوم** - 2-3 جمل تلخص أهم المستجدات
2. **الإصدارات** - إذا كانت هناك إصدارات جديدة، لخص محتوى التحديثات؛ وإلا فاحذف هذا القسم
3. **أبرز Issues المجتمعية** - اختر 10 Issues جديرة بالاهتمام، واشرح أهميتها وردود فعل المجتمع
4. **أهم تطورات PR** - اختر 10 PRs مهمة، واشرح الميزات أو الإصلاحات
5. **توجهات طلبات الميزات** - استخلص أهم توجهات الميزات التي يركز عليها المجتمع (مثل دمج IDE، الأداء، دعم نماذج جديدة)
6. **نقاط اختناق المطورين** - لخص نقاط الضعف المتكررة أو المطالب عالية التكرار من ملاحظات المطورين

متطلبات الأسلوب: موجز ومهني، مناسب للمطورين التقنيين. أرفق رابط GitHub مع كل بند.
`;
}

const PEER_ISSUE_LIMIT = 30;
const PEER_PR_LIMIT = 20;

export function buildPeerPrompt(
  cfg: RepoConfig,
  issues: GitHubItem[],
    prs: GitHubItem[],
  releases: GitHubRelease[],
  dateStr: string,
  issueLimit = PEER_ISSUE_LIMIT,
  prLimit = PEER_PR_LIMIT,
  lang: Lang = "ar",
): string {
  const totalIssues = issues.length;
  const totalPrs = prs.length;

  const sampledIssues = topN(issues, issueLimit);
  const sampledPrs = topN(prs, prLimit);

  const noneStr = lang === "en" ? "None" : "لا يوجد";
  const issuesText = sampledIssues.map((i) => formatItem(i, lang)).join("\n") || noneStr;
  const prsText = sampledPrs.map((p) => formatItem(p, lang)).join("\n") || noneStr;
  const releasesText = releases.length
    ? releases.map((r) => `- ${r.tag_name}: ${r.name}\n  ${(r.body ?? "").slice(0, 300)}`).join("\n")
    : noneStr;

  const openIssues = issues.filter((i) => i.state === "open").length;
  const closedIssues = issues.filter((i) => i.state === "closed").length;
  const openPrs = prs.filter((p) => p.state === "open").length;
  const mergedPrs = prs.filter((p) => p.state === "closed").length;

  const issueSampleNote = sampleNote(totalIssues, sampledIssues.length, lang);
  const prSampleNote = sampleNote(totalPrs, sampledPrs.length, lang);

  if (lang === "en") {
    return `You are an analyst of AI agent and personal AI assistant open-source projects. Based on the following GitHub data from ${cfg.name} (github.com/${cfg.repo}), generate a project digest for ${dateStr}.

# Data Overview
- Issues updated in last 24h: ${totalIssues} (open/active: ${openIssues}, closed: ${closedIssues})
- PRs updated in last 24h: ${totalPrs} (open: ${openPrs}, merged/closed: ${mergedPrs})
- New releases: ${releases.length}

## Latest Releases
${releasesText}

## Latest Issues ${issueSampleNote}
${issuesText}

## Latest Pull Requests ${prSampleNote}
${prsText}

---

Generate a structured English ${cfg.name} project digest with the following sections:

1. **Today's Overview** - 3-5 sentences summarizing project status, including activity assessment
2. **Releases** - If new versions exist, detail changes, breaking changes, migration notes; omit if none
3. **Project Progress** - Merged/closed PRs today, what features advanced or were fixed
4. **Community Hot Topics** - Most active Issues/PRs with most comments/reactions (with links), analyze underlying needs
5. **Bugs & Stability** - Bugs, crashes, regressions reported today, ranked by severity, note if fix PRs exist
6. **Feature Requests & Roadmap Signals** - User-requested features, predict which might be in next version
7. **User Feedback Summary** - Real user pain points, use cases, satisfaction/dissatisfaction
8. **Backlog Watch** - Long-unanswered important Issues or PRs needing maintainer attention

Style: objective, data-driven, highlighting project health. Include GitHub links for each item.
`;
  }

  return `أنت محلل مشاريع مفتوحة المصدر في مجال وكلاء الذكاء الاصطناعي والمساعدين الشخصيين. يرجى إنشاء تقرير ديناميكيات مشروع ${dateStr} استناداً إلى بيانات GitHub من ${cfg.name} (github.com/${cfg.repo}).

# نظرة عامة على البيانات
- تحديثات الـ Issues خلال آخر 24 ساعة: ${totalIssues} عنصر (مفتوح/نشط: ${openIssues}، مغلق: ${closedIssues})
- تحديثات الـ PR خلال آخر 24 ساعة: ${totalPrs} عنصر (بانتظار الدمج: ${openPrs}، مدمج/مغلق: ${mergedPrs})
- إصدارات جديدة: ${releases.length}

## أحدث الإصدارات
${releasesText}

## أحدث الـ Issues ${issueSampleNote}
${issuesText}

## أحدث Pull Requests ${prSampleNote}
${prsText}

---

يرجى إنشاء تقرير يومي منظم لمشروع ${cfg.name} يتضمن الأقسام التالية:

1. **نظرة عامة اليوم** - 3-5 جمل تصف الحالة العامة للمشروع اليوم، بما في ذلك تقييم النشاط
2. **الإصدارات** - إذا كانت هناك إصدارات جديدة، اشرح بالتفصيل محتوى التحديثات والتغييرات الجذرية وملاحظات الترحيل؛ وإلا فاحذف هذا القسم
3. **تقدم المشروع** - أهم PRs المدمجة/المغلقة اليوم، وما الميزات التي تم تطويرها أو إصلاحها، ومدى تقدم المشروع
4. **المواضيعة الساخنة في المجتمع** - أكثر الـ Issues وPRs نشاطاً بالتعليقات والتفاعلات اليوم (مع روابط)، وحلل الدوافع الكامنة
5. **الأخطاء والاستقرار** - الأخطاء والانهيارات ومشاكل التراجع المبلغ عنها اليوم، مرتبة حسب الخطورة، مع الإشارة إلى وجود PR إصلاحي
6. **طلبات الميزات وإشارات خريطة الطريق** - الميزات الجديدة التي اقترحها المستخدمون، مع توقع أيها قد يدخل الإصدار التالي بناءً على PRs القائمة
7. **ملخص ملاحظات المستخدمين** - استخلص نقاط الضعف الحقيقية، سيناريوهات الاستخدام، ومستوى الرضا/عدم الرضا من تعليقات الـ Issues
8. **متابعة الأعمال المتراكمة** - Issues أو PRs مهمة لم يتم الرد عليها منذ فترة طويلة، لتنبيه المشرفين

متطلبات الأسلوب: موضوعي ومهني، قائم على البيانات، مع إبراز صحة المشروع. أرفق رابط GitHub مع كل بند.
`;
}

export function buildPeersComparisonPrompt(
  openclawDigest: RepoDigest,
  peerDigests: RepoDigest[],
  dateStr: string,
  lang: Lang = "ar",
): string {
  const noActivityStr = lang === "en" ? "No activity in the last 24 hours." : "لا يوجد نشاط خلال آخر 24 ساعة.";

  const openclawSection =
    lang === "en"
      ? `## OpenClaw (core reference, github.com/${openclawDigest.config.repo})\n${openclawDigest.summary}`
      : `## OpenClaw (مرجع أساسي، github.com/${openclawDigest.config.repo})\n${openclawDigest.summary}`;

  const peerSections = peerDigests
    .map((d) => {
      const hasData = d.issues.length || d.prs.length || d.releases.length;
      if (!hasData) return `## ${d.config.name} (github.com/${d.config.repo})\n${noActivityStr}`;
      return `## ${d.config.name} (github.com/${d.config.repo})\n${d.summary}`;
    })
    .join("\n\n---\n\n");

  if (lang === "en") {
    return `You are a senior analyst of the AI agent and personal AI assistant open-source ecosystem. The following are ${dateStr} community digest summaries for each project.

${openclawSection}

---

${peerSections}

---

Generate a cross-project comparison report in English with these sections:

1. **Ecosystem Overview** - 3-5 sentences on the overall personal AI assistant / agent open-source landscape
2. **Activity Comparison** - Table comparing Issues count, PR count, Release status, and health score for each project
3. **OpenClaw's Position** - Advantages vs peers, technical approach differences, community size comparison
4. **Shared Technical Focus Areas** - Requirements emerging across multiple projects (note which projects, specific needs)
5. **Differentiation Analysis** - Key differences in feature focus, target users, technical architecture
6. **Community Momentum & Maturity** - Activity tiers, which are rapidly iterating, which are stabilizing
7. **Trend Signals** - Industry trends extracted from community feedback, value for AI agent developers

Style: concise and professional, data-backed, suited for technical decision-makers and developers.
`;
  }

  return `أنت محلل تقني متمرس في النظام البيئي مفتوح المصدر لوكلاء الذكاء الاصطناعي والمساعدين الشخصيين. فيما يلي ملخصات المجتمع الديناميكي لكل مشروع مفتوح المصدر بتاريخ ${dateStr}.

${openclawSection}

---

${peerSections}

---

يرجى إنشاء تقرير تحليل مقارن أفقي يتضمن الأقسام التالية بناءً على بيانات المشاريع أعلاه:

1. **المشهد الكامل** - 3-5 جمل تصف الحالة العامة للنظام البيئي مفتوح المصدر للمساعدين الشخصيين ووكلاء الذكاء الاصطناعي
2. **مقارنة النشاط عبر المشاريع** - جدول يلخص عدد الـ Issues وPRs والإصدارات و "Assessment الصحة لكل مشروع اليوم
3. **موقع OpenClaw في النظام البيئي** - المزايا مقارنة بالمشابهين، اختلافات النهج التقني، مقارنة حجم المجتمع
4. **مجالات التركيز التقني المشتركة** - احتياجات تظهر عبر مشاريع متعددة (حدد أي المشاريع المعنية والاحتياجات المحددة)
5. **تحليل التمايز** - اختلافات رئيسية في تركيز الميزات، الجمهور المستهدف، والهندسة المعمارية التقنية
6. **نشاط المجتمع ومستوى النضج** - تصنيف النشاط، أي المشاريع في مرحلة التطوير السرة وأيها في مرحلة التثبيت
7. **إشارات جديرة بالاه** - توجهات صناعية مستخلصة من ملاحظات المجتمع، قيمة مرجعية لمطوري وكلاء الذكاء الاصطناعي

متطلبات الأسلوب: موجز ومهني، مدعوم بالبيانات، مناسب لصانع القرار التقني والمطورين.
`;
}

export function buildSkillsPrompt(
  prs: GitHubItem[],
  issues: GitHubItem[],
  dateStr: string,
  lang: Lang = "ar",
): string {
  const topPrs = topN(prs, 20);
  const topIssues = topN(issues, 15);

  const noneStr = lang === "en" ? "None" : "لا يوجد";
  const prsText = topPrs.map((p) => formatItem(p, lang)).join("\n") || noneStr;
  const issuesText = topIssues.map((i) => formatItem(i, lang)).join("\n") || noneStr;

  if (lang === "en") {
    return `You are a technical analyst focused on the Claude Code ecosystem. The following data is from github.com/anthropics/skills (official Claude Code Skills repository). Analyze the community's most-watched Skills activity (data as of ${dateStr}).

## Repository Context
anthropics/skills is the official Claude Code Skills collection. Each PR typically represents a new or improved Skill. The community proposes new Skills and reports issues via Issues; PRs represent actual Skill submissions.

## Popular Pull Requests (sorted by comments, ${prs.length} total, showing top ${topPrs.length})
${prsText}

## Community Issues (sorted by comments, ${issues.length} total, showing top ${topIssues.length})
${issuesText}

---

Generate a Claude Code Skills community highlights report in English with these sections:

1. **Top Skills Ranking** - List the 5-8 most-discussed Skills (PRs) by comments/attention, describe each Skill's functionality, discussion highlights, and current status (open/merged/draft)
2. **Community Demand Trends** - From Issues, distill the most-anticipated new Skill directions (e.g. workflow automation, code review, test generation, documentation)
3. **High-Potential Pending Skills** - Active-comment PRs not yet merged; these Skills may land soon
4. **Skills Ecosystem Insight** - One-sentence summary: what is the community's most concentrated demand at the Skills level?

Style: concise and professional, include GitHub links for each item.
`;
  }

  return `أنت محلل تقني متخصص في نظام Claude Code البيئي. فيما يلي بيانات من github.com/anthropics/skills (مستودع Claude Code Skills الرسمي)، يرجى تحليل أكثر مهارات المجتمع متابعة (حتى ${dateStr}).

## وصف المستودع
anthropics/skills هو مستودع Skills الرسمي لـ Claude Code. كل PR يمثل عادةً Skill جديدة أو محسنة. يقترح المجتمع Skills جديدة ويبلغ عن المشاكل عبر Issues؛ وتمثل PRs مهارات ملموسة مقدم.

## Pull Requests الشائعة (مرتبة حسب عدد التعليقات، إجمالي ${prs.length} عنصر، تعرض أعلى ${topPrs.length})
${prsText}

## Issues مجتمعية (مرتبة حسب عدد التعليقات، إجمالي ${issues.length} عنصر، يعرض أعلى ${topIssues.length})
${issuesText}

---

يرجى إنشاء تقرير ن¦قات ساخنة لمجتمع Claude Code Skills يتضمن الأقسام التالية:

1. **ترتيب أشهر Skills** - أدرج 5-8 مهارات Skills (PR) الأكثر مناقشة حسب التعليقات/الاهتمام، صف وظيفة كل Skill ونقاط  ساخنة في المناقشات وحالتها الحالية (open/merged/draft)
2. **توجهات طلب المجتمع** - من الـ Issues، استخلص أكثر توجهات Skills الجديدة المتوقعة (مثل أتمتة سير العمل، مراجحة الكود، توليد الاختبارات، التوثيق)
3. **Skills واعدة معلقة** - PRs نشطة التعليقات لم يتم دمجها بعد؛ قد تظهر هذه الـ Skills قريباً
4. **رؤى نظام Skills البيئي** - ملخص بجملة واحدة: ما هو أكثر مطلب مركز للمجتمع على مستوى Skills؟

متطلبات الأسلوب: موجز ومهني، كل بند مرفق برابط GitHub.
`;
}

export function buildComparisonPrompt(digests: RepoDigest[], dateStr: string, lang: Lang = "ar"): string {
  const noActivityStr = lang === "en" ? "No activity in the last 24 hours." : "لا يوجد نشاط خلال آخر 24 ساعة.";

  const sections = digests
    .map((d) => {
      const hasData = d.issues.length || d.prs.length || d.releases.length;
      if (!hasData) return `## ${d.config.name} (github.com/${d.config.repo})\n${noActivityStr}`;
      return `## ${d.config.name} (github.com/${d.config.repo})\n${d.summary}`;
    })
    .join("\n\n---\n\n");

  if (lang === "en") {
    return `You are a senior technical analyst of the AI developer tools ecosystem. The following are ${dateStr} community digest summaries for each major AI CLI tool:

${sections}

---

Generate a cross-tool comparison report in English with these sections:

1. **Ecosystem Overview** - 3-5 sentences on the overall AI CLI tools development landscape
2. **Activity Comparison** - Table comparing word count, PR count, Release status for each tool today
3. **Shared Feature Directions** - Requirements appearing across multiple tool communities (note which tools, specific needs)
4. **Differentiation Analysis** - Differences in feature focus, target users, and technical approach
5. **Community Momentum & Maturity** - Which tools have more active communities, which are rapidly iterating
6. **Trend Signals** - Industry trends from community feedback, reference value for developers

Style: concise and professional, data-backed, suited for technical decision-makers and developers.
`;
  }

  return `أنت محلل تقني كبير ممتع في النظام البيئي لأدوات تطوير الذكاء الاصطناعي. فيما يلي ${dateStr} ملخصات ديناميكية مجتمعية لأبرز أدوات AI CLI:

${sections}

---

يرجى إنشاء تقرير مقارنة أفقي بين الأدوات يتضمن الأقسام التالية بناءً على البيانات أعلاه:

1. **المشهد الكامل** - 3-5 جمل تلخص حالة تطور أدوات AI CLI بشكل عام
2. **مقارنة النشاط عبر الأدوات** - جدول يلخص عدد الـ Issues وPRs وحالة الإصدارات لكل أداة اليوم
3. **مجالات الميزات المشتركة** - احتياجات تظهر عبر مجتمعات أدوات متعددة (حدد أي الأدوات، الاحتياجات المحددة)
4. **تحليل التموضع والتفريق** - اختلافات في تركيز الميزات، الجمهور المستهدف، والنهج التقني لكل أداة
5. **نشاط المجتمع ومستوى النضج** - أي الأدوات لديها مجتمع أنشط، وأيها في مرحلة التكرار السريع
6. **إشارات تستحق التبيان** - توجهات صناعية من ملاحظات المجتمع، ما هو المرجع المستفاد للمطورين

متطلبات الأسلوب: موجزة ومهنية، بدعم البيانات، تناسب كل من المطورين وصناع القرار التقنيين.
`;
}
