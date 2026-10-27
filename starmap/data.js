/*
 * 思想星图 · Thinking Star Map — content data
 * All concepts are condensed from youna's 人物思想地图 draft reports.
 * Quotes are short excerpts copied verbatim from each report's
 * "代表性原文引用" section; they have NOT yet been fully verified
 * against the original posts.
 */

const UI = {
  zh: {
    pageLabel: "THINKING STAR MAP · 人物思想地图",
    title: "思想星图",
    subtitle: "四位中文写作者反复出现的想法，画成四个星座。",
    tabMap: "星图",
    tabQA: "同一个问题，四种答案",
    about: "关于这个项目",
    langBtn: "EN",
    tabQAShort: "四种答案",
    aboutShort: "关于",
    langBtnLabel: "Switch to English",
    hint: "把鼠标移到星星上看看，点击可固定卡片。",
    hintTouch: "轻点星星查看概念。",
    quoteLabel: "引自报告摘录",
    quoteNote: "引文尚未与原帖逐条核对",
    close: "关闭",
    viewStar: "在星图中查看",
    inferPrefix: "他可能会这么回答：",
    qaIntro: "同一个问题，放进四份报告里会得到什么回答？以下概括依据报告内容；有些问题作者没有直接谈过，就根据其整体思路推测「他可能会这么回答」或「TA 可能会这么回答」。点击卡片可以回到星图中对应的星星。",
    report: "报告",
    aboutTitle: "关于这个项目",
    aboutBody: [
      "“人物思想地图”是我做的一组研究草稿，试着整理几位公开写作者反复出现的想法。",
      "研究对象和材料由我选择、收集：其中一位作者（崔庆龙）的公开微博，是我用自己写的 Python 脚本整理下来的；其他几位用的是网友整理的合集。",
      "文本分析和初稿由 Codex（AI）完成，报告结构也是它建议的。王川的报告我又根据一本新整理的合集迭代到了 v0.2。",
      "这些报告都还是草稿，引文还没有逐条对照原帖核实。",
      "“四种答案”里标着「他可能会这么回答」或「TA 可能会这么回答」的卡片，是 AI 辅助、根据各份报告做出的推测性转述，不是作者本人说过的话。",
      "这个星图页面是在 AI 辅助编程下完成的。"
    ]
  },
  en: {
    pageLabel: "THINKING STAR MAP · 人物思想地图",
    title: "Thinking Star Map",
    subtitle: "Recurring ideas of four Chinese writers, drawn as four constellations.",
    tabMap: "Star map",
    tabQA: "One question, four answers",
    about: "About this project",
    langBtn: "中",
    tabQAShort: "4 answers",
    aboutShort: "About",
    langBtnLabel: "切换到中文",
    hint: "Hover over a star to read it; click to pin the card.",
    hintTouch: "Tap a star to read the concept.",
    quoteLabel: "Quoted from the report's excerpts",
    quoteNote: "Not yet verified against the original posts",
    close: "Close",
    viewStar: "Show on the star map",
    inferPrefix: "He might answer: ",
    qaIntro: "What happens when you ask the four reports the same question? The summaries below are based on each report; where a writer never addressed a question directly, the card offers an inference from their overall thinking, marked “He might answer” or “They might answer”. Click a card to jump to the matching star.",
    report: "Report",
    aboutTitle: "About this project",
    aboutBody: [
      "“Thinking Maps” (人物思想地图) is a set of draft research reports in which I try to map the recurring ideas of a few public writers.",
      "I chose the subjects and gathered the sources: one writer's (Cui Qinglong's) public Weibo posts were collected with a Python script I wrote; for the others I used fan-compiled collections.",
      "Codex (an AI tool) did the text analysis and drafted the reports, and suggested their structure. I later iterated the Wang Chuan report to v0.2 against a newly compiled book.",
      "The reports are drafts, and the quotes have not yet been fully verified against the original posts.",
      "In “One question, four answers”, cards marked “He might answer” or “They might answer” are AI-assisted paraphrases inferred from each report — not the writers' own words.",
      "Star map page built with AI-assisted coding."
    ]
  }
};

/*
 * Star coordinates (x, y) are in a 0–1 box for each constellation.
 * links: index pairs of related concepts (faint lines).
 */
const WRITERS = [
  {
    id: "wangxing",
    name: { zh: "王兴", en: "Wang Xing" },
    source: { zh: "饭否合集 2007–2021 · 报告 v0.1", en: "Fanfou post collections 2007–2021 · report v0.1" },
    motto: { zh: "给问题换一个坐标系", en: "Give the problem a new coordinate system" },
    color: [236, 196, 110],
    stars: [
      {
        id: "frame",
        x: 0.5, y: 0,
        name: { zh: "换坐标系", en: "Change the frame" },
        summary: {
          zh: "他很少给单点答案，而是把眼前的公司或事件放进更长的历史、更大的地理和不同的时间尺度里比较。合适的分类和参照系，常比零散知识更有用。",
          en: "Rather than offering one-off answers, he places a company or event into longer history, wider geography and different time scales. The right categories and reference frame often matter more than extra facts."
        },
        quote: "正确的视角确实相当于智商加 20 点。"
      },
      {
        id: "history",
        x: 0.15, y: 0.14,
        name: { zh: "历史与世界观", en: "History & worldview" },
        summary: {
          zh: "历史被当作现实问题的案例库，用来分辨眼前的现象是新事物、旧循环，还是长期结构的一个阶段；跨国比较则用来校正单一叙事。",
          en: "History works as a casebook for present problems: is this new, an old cycle, or a phase of a long-term structure? Comparing countries helps correct any single national story."
        },
        quote: "真正的长期价值投资最需要的是正确的世界观。"
      },
      {
        id: "naming",
        x: 0.85, y: 0.28,
        name: { zh: "先把概念说清", en: "Define terms first" },
        summary: {
          zh: "他反复追问词源、译名和近义词的差别。一个概念没被准确命名，往往说明结构还没看清；先拆清定义，再讨论立场。",
          en: "He keeps asking about etymology, translations and near-synonyms. If a concept isn't named precisely, the structure probably isn't clear yet — so define first, argue later."
        },
        quote: "竞争竞争，何为竞，何为争？同向为竞，相向为争。"
      },
      {
        id: "strategy",
        x: 0.3, y: 0.42,
        name: { zh: "战略与战术", en: "Strategy vs. tactics" },
        summary: {
          zh: "战略是选择方向、配置稀缺资源，在“无棋可走”时做决定；战术是具体怎么赢。两者不能互相替代。",
          en: "Strategy means choosing a direction and allocating scarce resources, deciding when there is no obvious move; tactics are how you win right now. Neither can stand in for the other."
        },
        quote: "战略是一种高级的思考活动，人类以外的其他动物只有战术没有战略。"
      },
      {
        id: "longshort",
        x: 0.75, y: 0.56,
        name: { zh: "长期与短期", en: "Long vs. short term" },
        summary: {
          zh: "长期主义不等于只看远方。长期方向提供一致性，短期行动带来反馈；只顾任何一端都容易，难的是持续权衡。",
          en: "Long-termism isn't just looking far ahead. Long-term direction gives consistency and short-term action gives feedback; serving only one side is easy, the hard part is balancing both."
        },
        quote: "如何平衡二者正是管理的实质。"
      },
      {
        id: "product",
        x: 0.85, y: 0.98,
        name: { zh: "产品、用户与迭代", en: "Products, users, iteration" },
        summary: {
          zh: "他常亲自使用产品再拆解体验。好产品要放回具体用户、场景和价格中判断；持续改进会随时间累积成壁垒。",
          en: "He often tries products himself and takes the experience apart. A product is judged against real users, contexts and prices, and steady improvement compounds into a moat over time."
        },
        quote: "他们确实在持续改进，把东西越做越好，把壁垒越筑越高。"
      },
      {
        id: "capital",
        x: 0.55, y: 0.84,
        name: { zh: "组织起来的资源", en: "Organized resources" },
        summary: {
          zh: "钱、人才和数据只是资源，要经过规则、分工和激励被组织起来，才会变成资本和能力。结构与激励比英雄叙事更能解释结果。",
          en: "Money, talent and data are only resources; they become capital and capability once rules, roles and incentives organize them. Structures and incentives explain outcomes better than hero stories."
        },
        quote: "钱不等于资本。有效组织起来的钱才是资本。"
      },
      {
        id: "learning",
        x: 0.12, y: 0.7,
        name: { zh: "持续学习与修正", en: "Keep learning, keep correcting" },
        summary: {
          zh: "读书、地图、旅行和交谈是持续的输入，目的是更新世界模型。“我不知道”“修正一下”常出现，公开纠错也是他思考的一部分。",
          en: "Books, maps, travel and conversation are constant inputs meant to update his model of the world. “I don't know” and “a correction” come up often — correcting himself in public is part of how he thinks."
        },
        quote: "不学习就会落伍。"
      }
    ],
    links: [[0, 1], [0, 2], [1, 3], [3, 4], [4, 5], [3, 6], [6, 5], [1, 7], [7, 2], [4, 7]]
  },

  {
    id: "wangchuan",
    name: { zh: "王川", en: "Wang Chuan" },
    source: { zh: "微博语料（v0.1）+《王川宝典》（v0.2）", en: "Weibo corpus (v0.1) + compiled book (v0.2)" },
    motto: { zh: "一套追求复合增长的个人操作系统", en: "A personal operating system for compound growth" },
    color: [128, 214, 205],
    stars: [
      {
        id: "optionality",
        x: 0.5, y: 0,
        name: { zh: "选择权优先", en: "Optionality first" },
        summary: {
          zh: "钱的意义不是无限积累，而是减少被迫劳动、增加可支配的时间和选择。杠杆、时间压力和无法退出的承诺，都在侵蚀选择权。",
          en: "Money matters because it reduces forced labor and buys time and choices, not because more is always better. Leverage, deadlines and commitments you can't exit all erode your options."
        },
        quote: "如果增加选择权和赚钱，两件事发生冲突，选择权永远优于赚钱。"
      },
      {
        id: "redundancy",
        x: 0.15, y: 0.14,
        name: { zh: "冗余与不确定", en: "Slack for uncertainty" },
        summary: {
          zh: "未来无法准确预测，所以安全不能押在预测上。保留时间、体力、现金和退路，方向错了能迅速改道；冗余不是浪费，而是缓冲。",
          en: "The future can't be predicted precisely, so safety shouldn't depend on forecasts. Keep spare time, energy, cash and exits so you can change course fast; slack isn't waste, it's a buffer."
        },
        quote: "通过大量冗余设置去规避意想不到的灾害，通过开放和涌现去拥抱意想不到的繁荣",
        quoteSource: { zh: "v0.1 报告", en: "v0.1 report" }
      },
      {
        id: "accumulation",
        x: 0.85, y: 0.28,
        name: { zh: "难以被破坏的积累", en: "Hard-to-break accumulation" },
        summary: {
          zh: "积累分层级：能积累、能持续、更快地持续、难以被破坏地更快持续。先保证不归零，再追求速度。",
          en: "Accumulation comes in levels: possible, sustainable, faster and sustainable, and faster, sustainable and hard to destroy. First make sure you can't be wiped out; speed comes last."
        },
        quote: "这里面最重要的是很难被破坏，其次是可以持续，第三才是更快。"
      },
      {
        id: "information",
        x: 0.3, y: 0.42,
        name: { zh: "信息基础设施", en: "Information infrastructure" },
        summary: {
          zh: "智能来自多维信息的整合。开放的信息渠道、交叉验证、知识广度和历史视角，是深度思考和有效行动的底座。",
          en: "Intelligence comes from combining information from many angles. Open channels, cross-checking, breadth and a long historical view form the base for deep thinking and effective action."
        },
        quote: "最高效的读书方法，是带着问题去读书查资料。"
      },
      {
        id: "writing",
        x: 0.75, y: 0.56,
        name: { zh: "写作是认知工具", en: "Writing as a thinking tool" },
        summary: {
          zh: "写作不只是传播结果，而是产生结果的方法：逼自己找证据、暴露矛盾、从反方论证，再借公开反馈修正偏差。",
          en: "Writing isn't just for sharing conclusions — it produces them. It forces you to gather evidence, expose contradictions, argue the other side, and fix biases through public feedback."
        },
        quote: "假设自己是个反对者，写出反对自己观点的证据。"
      },
      {
        id: "connection",
        x: 0.85, y: 0.84,
        name: { zh: "连接与一对多", en: "Connection, one-to-many" },
        summary: {
          zh: "人际关系被看作连接效率问题：长期互惠、资源互补、守住边界；与其一对一说服，不如通过公开写作一对多地吸引同道。",
          en: "Relationships are treated as a question of connection efficiency: long-term reciprocity, complementary resources, firm boundaries. Rather than persuading people one by one, publish and let like-minded readers find you."
        },
        quote: "这种一对 N 的社交，而 N 可以不断增加无上限。"
      },
      {
        id: "setter",
        x: 0.45, y: 0.98,
        name: { zh: "从做题家到出题家", en: "From solver to setter" },
        summary: {
          zh: "做题家在别人定义的框架里优化，确定但容易被替代；出题家定义新问题、规则或平台，承担风险也争取不封顶的回报。",
          en: "A “problem-solver” optimizes inside someone else's framework — safe but replaceable. A “problem-setter” defines new questions, rules or platforms, taking on risk for uncapped upside."
        },
        quote: "不能积累，叠加，创造复利的事情，都不值得去做。"
      },
      {
        id: "interest",
        x: 0.12, y: 0.7,
        name: { zh: "兴趣驱动的成长", en: "Interest-driven growth" },
        summary: {
          zh: "兴趣比意志力更能维持长期迭代：小的真实反馈增强兴趣，兴趣带来更多探索。幸福被理解为持续的成长，而不是短暂快感。",
          en: "Interest sustains long-term iteration better than willpower: small real feedback feeds interest, which drives more exploration. Happiness is framed as ongoing growth rather than a passing high."
        },
        quote: "只要还在成长，不管是哪个维度，成长本身，就是让人有幸福的理由。",
        quoteSource: { zh: "v0.1 报告", en: "v0.1 report" }
      }
    ],
    links: [[0, 1], [0, 2], [1, 2], [1, 3], [3, 4], [2, 4], [4, 5], [4, 6], [3, 7], [7, 6], [5, 6]]
  },

  {
    id: "cui",
    name: { zh: "崔庆龙", en: "Cui Qinglong" },
    source: { zh: "公开微博（Python 脚本整理）· 报告 v0.1", en: "Public Weibo (collected by script) · report v0.1" },
    motto: { zh: "经验如何在关系中形成心理结构", en: "How experience in relationships shapes the self" },
    color: [240, 160, 178],
    stars: [
      {
        id: "experience",
        x: 0.5, y: 0,
        name: { zh: "从体验出发", en: "Start from experience" },
        summary: {
          zh: "先描述一个人实际怎样体验，再做理论解释。追溯过去要建立在当下体验充分展开之后，而不是一下子归因到原生家庭。",
          en: "First describe how a person actually experiences things, then explain. Looking into the past should follow a full look at the present, not jump straight to blaming one's family of origin."
        },
        quote: "当下已经包含着过去，而过去却不一定包含着当下。"
      },
      {
        id: "symptom",
        x: 0.15, y: 0.14,
        name: { zh: "症状也有功能", en: "Symptoms have a job" },
        summary: {
          zh: "拖延、成瘾、讨好或攻击，常常在保护某个被忽略的需要、维持系统的稳定。先问它有什么功能，再问怎么消除。",
          en: "Procrastination, addiction, people-pleasing or aggression often protect a neglected need and keep a system stable. Ask what a behavior does for you before asking how to get rid of it."
        },
        quote: "当杂草被消灭时，花园也会消亡。",
        quoteSource: { zh: "报告注明：转引 Erik Erikson", en: "the report notes this is quoted from Erik Erikson" }
      },
      {
        id: "seen",
        x: 0.85, y: 0.28,
        name: { zh: "被看见", en: "Being seen" },
        summary: {
          zh: "好的回应既同频又保留差异。被看见不是被定义；赞美、一味给予或专业术语，都可能盖住那个具体的人。",
          en: "A good response is attuned yet keeps a difference. Being seen isn't being labeled; praise, endless giving or jargon can all cover up the actual person."
        },
        quote: "倾听不是一个单向行为，倾听是交互事件。"
      },
      {
        id: "cocreate",
        x: 0.6, y: 0.42,
        name: { zh: "理解是共同建构", en: "Understanding is co-created" },
        summary: {
          zh: "共情是尝试理解的姿态，不等于已经理解。理解不是一个人看穿另一个人，而是两个人一起找到可以共用的经验。",
          en: "Empathy is an attempt to understand, not proof that you have. Understanding isn't one person seeing through another; it's two people finding experience they can share."
        },
        quote: "两个人在共同的迷雾中探索到了可以重合的道路。"
      },
      {
        id: "repair",
        x: 0.85, y: 0.7,
        name: { zh: "破裂与修复", en: "Rupture & repair" },
        summary: {
          zh: "冲突本身不是失败。关系是不断陷入僵局、打破僵局、形成新稳态的过程；没有修复的破裂才会走向毁灭。",
          en: "Conflict itself isn't failure. A relationship keeps hitting deadlocks, breaking them and settling into new balances; it's rupture without repair that destroys it."
        },
        quote: "关系只有在包含着‘破裂—修复’要素的持续过程中，才是鲜活而长久的。"
      },
      {
        id: "action",
        x: 0.22, y: 0.56,
        name: { zh: "心理空间与行动", en: "Mental space & action" },
        summary: {
          zh: "焦虑、碎片信息和完美主义会占满心理空间，让人退到低难度的即时刺激。低活力时先减负，再创造小的正反馈；自责只会继续消耗。",
          en: "Anxiety, fragmented information and perfectionism fill up mental space and push people toward easy, instant stimulation. When energy is low, lighten the load first, then build small wins; self-blame only drains more."
        },
        quote: "你行动的方式不仅仅在影响行为，也在建构着一个和它相匹配的生活模式"
      },
      {
        id: "liberation",
        x: 0.15, y: 0.84,
        name: { zh: "从“必须”到“想要”", en: "From “must” to “want”" },
        summary: {
          zh: "边界是能被他人识别的心理轮廓。自我解放不是从利他跳到自私，而是让选择出于自由意志，并承担它带来的限制与责任。",
          en: "A boundary is a psychological outline others can recognize. Self-liberation isn't swinging from selflessness to selfishness; it means choosing freely and owning the limits and responsibilities that come with it."
        },
        quote: "所谓自我解放，就是将越来越多的‘我应该，我必须’变成‘我希望，我想要’。"
      },
      {
        id: "vulnerability",
        x: 0.62, y: 0.98,
        name: { zh: "脆弱与成熟", en: "Vulnerability & maturity" },
        summary: {
          zh: "强大不等于清除脆弱。成熟是能承认怯懦、需要时向人求助而不羞耻，也能坚决而不敌对。",
          en: "Strength doesn't mean erasing vulnerability. Maturity is being able to admit fear, ask for help without shame, and be firm without being hostile."
        },
        quote: "一个人最稳定的自体感不在于消灭了软弱，而在于承认了它，并拥有了使用它的权力。"
      }
    ],
    links: [[0, 1], [0, 2], [2, 3], [3, 4], [1, 5], [5, 6], [6, 7], [4, 7], [0, 3], [1, 6]]
  },

  {
    id: "huchan",
    name: { zh: "胡缠", en: "Hu Chan" },
    /* Gender unknown — don't use 他 / he on inferred cards. */
    inferPrefix: { zh: "TA 可能会这么回答：", en: "They might answer: " },
    source: { zh: "微博文本合集 · 报告 v0.1", en: "Compiled Weibo texts · report v0.1" },
    motto: { zh: "收回对自己生活的选择权", en: "Taking back the right to choose your own life" },
    color: [178, 164, 240],
    stars: [
      {
        id: "agency",
        x: 0.5, y: 0,
        name: { zh: "我愿意 / 我不愿意", en: "“I will” / “I won't”" },
        summary: {
          zh: "最稳定的中心是主体性：从自欺、恐惧和外部评价里，收回对自己生活的解释权与选择权。先问是否由衷，再问是否有效。",
          en: "The steady center is agency: reclaiming the right to interpret and choose your own life from self-deception, fear and outside judgment. Ask whether a choice is wholehearted before asking whether it works."
        },
        quote: "人最值得尊重和珍贵的，就是‘我愿意’和‘我不愿意’。"
      },
      {
        id: "selflove",
        x: 0.15, y: 0.14,
        name: { zh: "自爱作为动力", en: "Self-care as fuel" },
        summary: {
          zh: "长期成长靠关怀、尊重和协商来驱动，而不是羞耻和自我攻击。自我厌弃也许能推动短促任务，却撑不起复杂、长期的问题。",
          en: "Lasting growth runs on care, respect and negotiation with yourself, not shame and self-attack. Self-loathing might push a short task, but it can't carry a complex, long-term one."
        },
        quote: "作为改变的动力，自爱全方位碾压自我厌弃。"
      },
      {
        id: "acceptance",
        x: 0.85, y: 0.28,
        name: { zh: "接纳现实", en: "Accepting what is" },
        summary: {
          zh: "接纳不是消极忍受，而是承认内外现实如其所是，停止把力气耗在否认和幻想上，从而恢复选择与行动的自由。",
          en: "Acceptance isn't passive endurance. It means acknowledging inner and outer reality as it is, so energy stops leaking into denial and fantasy — and the freedom to act returns."
        },
        quote: "当你与真实结盟时，你就获得了自由，是一种行动，或不行动的自由。"
      },
      {
        id: "emotion",
        x: 0.85, y: 0.56,
        name: { zh: "情绪是信息", en: "Feelings are information" },
        summary: {
          zh: "情绪不是敌人，也不是命令。允许它流动、与它保持距离；恐惧是对风险的反应，不是风险本身。",
          en: "Emotions are neither enemies nor orders. Let them flow and keep some distance; fear is a reaction to risk, not the risk itself."
        },
        quote: "它是你对风险的反应，而不是风险本身。"
      },
      {
        id: "smallsteps",
        x: 0.35, y: 0.42,
        name: { zh: "小步行动", en: "Small steps" },
        summary: {
          zh: "懂道理不会自动带来改变。渐进的行动产生新经验，新经验再修改旧信念；动力和反馈往往比“更好的方法”更关键。",
          en: "Understanding doesn't automatically change anything. Small actions create new experiences, and new experiences revise old beliefs; motivation and feedback often matter more than a better method."
        },
        quote: "与其等到万事具备，不如先动起手来。"
      },
      {
        id: "discipline",
        x: 0.12, y: 0.7,
        name: { zh: "协商式自律", en: "Negotiated discipline" },
        summary: {
          zh: "自律不是内心暴君战胜欲望，而是识别、允许欲望并与之协商。外部控制和自我监工会挤压内在动力，最后变成拖延或放弃。",
          en: "Self-discipline isn't an inner tyrant defeating desire; it's noticing desires, allowing them and negotiating. Outside control and self-policing squeeze out motivation and end in procrastination or giving up."
        },
        quote: "人有能力和自己的欲望对话，协商，并且拿出一个让自己心甘情愿执行的方案来。"
      },
      {
        id: "love",
        x: 0.7, y: 0.84,
        name: { zh: "爱需要自由", en: "Love needs freedom" },
        summary: {
          zh: "爱是自由状态下的由衷选择和持续劳作，而不是控制、讨好或依赖。边界不是爱的反面，而是爱的条件。",
          en: "Love is a wholehearted choice made in freedom, plus ongoing work — not control, pleasing or dependence. Boundaries aren't the opposite of love; they're its precondition."
        },
        quote: "爱的发生方式，和存在方式，是自由。"
      },
      {
        id: "pain",
        x: 0.4, y: 0.98,
        name: { zh: "两种痛苦", en: "Two kinds of pain" },
        summary: {
          zh: "有些痛苦是成长和关系本身的一部分，需要主动承担；另一些来自自欺和自我攻击，应该识别并减少。意义来自自愿的承担。",
          en: "Some pain belongs to growth and relationships and is worth carrying; other pain comes from self-deception and self-attack and should be spotted and reduced. Meaning comes from burdens chosen freely."
        },
        quote: "痛苦有别。第二种痛苦是非必须，可避免和消除的。"
      }
    ],
    links: [[0, 1], [0, 2], [2, 3], [2, 4], [1, 5], [4, 5], [0, 6], [6, 7], [4, 7], [3, 4]]
  }
];

/*
 * “同一个问题，四种答案 / One question, four answers”
 * coverage: "yes" | "inferred"  (inferred = the report doesn't discuss this directly;
 *   the card is an AI-assisted paraphrase of how the writer might answer, based on the report's overall framework — no quotes)
 * star: id of the related star in that writer's constellation (optional)
 */
const QUESTIONS = [
  {
    id: "uncertainty",
    q: { zh: "怎么面对不确定？", en: "How do you face uncertainty?" },
    answers: {
      wangxing: {
        coverage: "yes", star: "longshort",
        zh: "把眼前的变化放进更长的历史和更大的坐标里，分辨哪些只是噪声、哪些是结构变化；用长期方向保持一致，再用短期反馈和数据随时修正。",
        en: "Put the change into a longer history and a wider frame to tell noise from real structural shifts; hold a long-term direction, and keep correcting it with short-term feedback and data."
      },
      wangchuan: {
        coverage: "yes", star: "redundancy",
        zh: "不押注预测。下行靠冗余保护——时间、现金、流动性和退路；上行靠开放参与，等待意想不到的增长涌现。",
        en: "Don't bet on forecasts. Protect the downside with slack — time, cash, liquidity, ways out — and capture the upside by staying open to growth no one planned."
      },
      cui: {
        coverage: "inferred", star: "repair",
        zh: "不必追求一切都确定、可控——太确定的生活反而会僵化，适量的未知正是成长的条件。真正的安全感不是什么都不出错，而是出了问题之后还能复原，还能再出去探索。",
        en: "Don't chase total certainty and control — a life that's too certain goes rigid, and some unknown is exactly what growth needs. Real security isn't nothing ever going wrong; it's being able to recover afterwards and go out exploring again."
      },
      huchan: {
        coverage: "yes", star: "emotion",
        zh: "不要求消除恐惧，而是看见、允许它，把它当作关于风险的信息；先接纳现实，再用小步行动去试探。",
        en: "Don't try to get rid of fear; notice and allow it, and treat it as information about risk. Accept reality first, then test the waters with small actions."
      }
    }
  },
  {
    id: "stuck",
    q: { zh: "人为什么会停滞或拖延？", en: "Why do people get stuck or procrastinate?" },
    answers: {
      wangxing: {
        coverage: "inferred", star: "learning",
        zh: "停滞往往是因为不再学习、不再更新自己的模型，或者只盯着眼前、忘了长期。换个坐标系看问题，持续输入，再用现实反馈去修正，就不容易落伍。",
        en: "People stall when they stop learning and stop updating their models, or when they only watch the short term and lose the long view. Change the frame, keep taking things in, and correct course with real feedback, and you won't fall behind."
      },
      wangchuan: {
        coverage: "yes", star: "setter",
        zh: "在别人定义的框架里把局部题目做到极致，会撞上回报递减；被外部指标驱动、缺少兴趣，行动难以持续。健康变差还会形成向下的螺旋。",
        en: "Over-optimizing a narrow problem inside someone else's framework runs into diminishing returns, and work driven by outside metrics rather than interest is hard to sustain. Declining health can add a downward spiral."
      },
      cui: {
        coverage: "yes", star: "symptom",
        zh: "拖延常常在保护某个被忽略的需要。只让“理性自我”统治、严格规训其他部分，会引发反弹；焦虑和完美主义占满心理空间，人就退到低难度的即时刺激。",
        en: "Procrastination often protects a neglected need. Letting a “rational self” rule and drilling the other parts invites rebound; when anxiety and perfectionism fill mental space, people retreat into easy, instant stimulation."
      },
      huchan: {
        coverage: "yes", star: "discipline",
        zh: "自我厌弃和外部控制带来焦虑与自我监控，最后变成反抗、拖延或放弃。出路是自我关怀、识别欲望、内部协商，并设定合适的难度和反馈。",
        en: "Self-loathing and outside control breed anxiety and self-policing, which end in rebellion, procrastination or quitting. The way out is self-care, recognizing your desires, negotiating with yourself, and setting the right difficulty and feedback."
      }
    }
  },
  {
    id: "grow",
    q: { zh: "怎么变得更好？", en: "How do you grow?" },
    answers: {
      wangxing: {
        coverage: "yes", star: "learning",
        zh: "持续输入、精确命名、找可比对象、建立模型、落到行动，再用现实反馈修正——像产品一样持续改进，优势会随时间累积。",
        en: "Keep taking in information, name things precisely, find comparisons, build a model, act on it, then correct it with real feedback — improving steadily, like a product, so advantages compound over time."
      },
      wangchuan: {
        coverage: "yes", star: "accumulation",
        zh: "只做能积累、能复用、能组合的事：开放输入，用写作校正认知，把兴趣变成作品，在真实反馈中迭代，跨过临界点后形成复合增长。",
        en: "Only do things that accumulate, can be reused and can be combined: take in open information, use writing to correct your thinking, turn interests into work, iterate on real feedback, and let growth compound once it passes a tipping point."
      },
      cui: {
        coverage: "yes", star: "cocreate",
        zh: "改变靠新经验，而不只是道理正确：被看见、被准确回应，在安全的关系里经历破裂与修复，带着觉知去行动，让旧经验旁长出新的可用路径。",
        en: "Change comes from new experience, not just correct ideas: being seen and accurately responded to, going through rupture and repair in a safe relationship, and acting with awareness so new pathways grow alongside the old."
      },
      huchan: {
        coverage: "yes", star: "smallsteps",
        zh: "觉察当下、接纳现实、收回选择权，然后小步行动；新经验修正旧信念，成长就这样滚动推进。",
        en: "Notice the present, accept reality, take back your choice, then act in small steps; new experiences revise old beliefs, and growth rolls forward from there."
      }
    }
  },
  {
    id: "judgment",
    q: { zh: "什么是好的判断？", en: "What makes a good judgment?" },
    answers: {
      wangxing: {
        coverage: "yes", star: "frame",
        zh: "先把概念说清，选对尺度，跨国、跨行业比较；看结构和激励而不是人物传奇，相信可以校正的数据多于单一大脑的直觉。",
        en: "Define your terms, pick the right scale, compare across countries and industries; look at structures and incentives instead of hero stories, and trust correctable data over a single mind's intuition."
      },
      wangchuan: {
        coverage: "yes", star: "writing",
        zh: "信息要多维、可交叉验证；把支持和反对自己的证据都写出来并公开接受批评；判断风险时注意比例、基数和边界条件。",
        en: "Use information from many angles that can be cross-checked; write down the evidence for and against your own view and publish it for criticism; judge risks by proportion, base rates and boundary conditions."
      },
      cui: {
        coverage: "inferred", star: "experience",
        zh: "先别急着下结论：把体验本身描述清楚，再去解释原因；看到一个行为，先问它在起什么作用，而不是马上想着消除它。还要记住，共情了不等于已经理解了。",
        en: "Don't rush to a conclusion: describe the experience first, then look for causes. When you see a behavior, ask what it's doing for the person before trying to get rid of it. And remember that feeling empathy isn't the same as having understood."
      },
      huchan: {
        coverage: "inferred", star: "agency",
        zh: "先问这是不是我由衷想要的，再问它有没有用。情绪是信息，不是命令——可以听，但不必照办。比起追求完美，真实更靠得住。",
        en: "First ask whether this is something I truly want, then ask whether it works. Feelings are information, not orders — listen to them, but you don't have to obey. Being real is more reliable than being perfect."
      }
    }
  },
  {
    id: "relationships",
    q: { zh: "关系里什么最重要？", en: "What matters most in relationships?" },
    answers: {
      wangxing: {
        coverage: "inferred", star: "naming",
        zh: "先分清对方是和你同向赛跑，还是迎面冲突：同向的只是对手，相向的才是敌人。也要慎重选择跟谁较劲，因为你选的对手，最后会反过来塑造你自己。",
        en: "First be clear whether the other side is running the same race as you or coming straight at you — a rival in the same race isn't an enemy. And choose your rivals carefully, because whoever you measure yourself against ends up shaping who you become."
      },
      wangchuan: {
        coverage: "yes", star: "connection",
        zh: "关系是连接效率问题：长期互惠、资源互补、守住边界；少做高成本的说服，多用公开写作吸引同道。",
        en: "Relationships are about connection efficiency: long-term reciprocity, complementary resources, firm boundaries. Spend less on costly persuasion and more on public writing that draws like-minded people."
      },
      cui: {
        coverage: "yes", star: "repair",
        zh: "关系的质量要看能否在破裂后修复；好的回应既同频又保留差异，从热恋的理想化走向真实的“二人关系”。",
        en: "A relationship's quality shows in whether it can repair after a rupture. Good responses are attuned yet keep a difference, moving from idealized romance to a real relationship between two people."
      },
      huchan: {
        coverage: "yes", star: "love",
        zh: "爱必须以自由为前提：威胁、讨好、控制能制造依附，却制造不了爱。两个有边界的独立的人，通过倾听、承诺和共同劳作建立连接。",
        en: "Love requires freedom: threats, pleasing and control can create attachment but not love. Two independent people with boundaries connect through listening, commitment and shared work."
      }
    }
  }
];
