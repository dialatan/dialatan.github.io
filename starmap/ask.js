/* Ask box: match a visitor's question to an existing QUESTIONS topic.
   No network, no new answers. QUESTIONS and TOPIC_KEYWORDS come from data.js. */

const ASK_STOP = new Set([
  "how", "do", "did", "you", "your", "the", "a", "an", "to", "of", "in", "on",
  "for", "and", "or", "with", "what", "why", "when", "this", "that", "i", "my",
  "me", "is", "are", "can", "should", "would", "could", "about", "deal", "from"
]);

function compactText(value) {
  return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function askWords(value) {
  return String(value || "").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

function zhHit(compactQuery, keyword) {
  const key = compactText(keyword);
  if (key.length < 2) return false;
  if (key === "关系") {
    return compactQuery.replace(/没有关系/g, "").replace(/没关系/g, "").includes("关系");
  }
  return compactQuery.includes(key);
}

function enHit(words, compactQuery, keyword) {
  const key = String(keyword || "").toLowerCase();
  if (!key) return false;
  if (key.includes(" ") || key.includes("-")) return compactQuery.includes(compactText(key));
  return words.some((word) => {
    if (word === key) return true;
    if (key.length >= 5 && word.startsWith(key)) return true;
    if (word.length >= 6 && key.startsWith(word)) return true;
    return false;
  });
}

function keywordWeight(keyword) {
  const n = compactText(keyword).length;
  if (n >= 4) return 8;
  if (n === 3) return 7;
  return 6;
}

function scoreTopic(raw, topic) {
  const compactQuery = compactText(raw);
  const words = askWords(raw);
  if (compactQuery.length < 2) return 0;

  let score = 0;
  const qzh = compactText(topic.q.zh);
  const qen = compactText(topic.q.en);
  if (compactQuery.includes(qzh) || qzh.includes(compactQuery) && compactQuery.length >= qzh.length - 1) score += 24;
  else if (qzh.includes(compactQuery) && compactQuery.length >= 4) score += 10;
  if (compactQuery.includes(qen)) score += 24;

  const qWords = askWords(topic.q.en).filter((word) => word.length >= 4 && !ASK_STOP.has(word));
  words.forEach((word) => {
    if (word.length < 4 || ASK_STOP.has(word)) return;
    if (qWords.some((qWord) => qWord === word || qWord.startsWith(word) || word.startsWith(qWord))) score += 8;
  });

  const keys = TOPIC_KEYWORDS[topic.id] || { zh: [], en: [] };
  keys.zh.forEach((keyword) => {
    if (zhHit(compactQuery, keyword)) score += keywordWeight(keyword);
  });
  keys.en.forEach((keyword) => {
    if (enHit(words, compactQuery, keyword)) score += keywordWeight(keyword);
  });
  return score;
}

function matchTopic(raw) {
  const query = String(raw || "").trim();
  if (!query) return { status: "empty" };
  if (compactText(query).length < 2) return { status: "short" };

  const ranked = QUESTIONS.map((topic) => ({
    id: topic.id,
    score: scoreTopic(query, topic)
  })).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const best = ranked[0];
  const second = ranked[1] ? ranked[1].score : 0;
  const clear = best.score >= 6 && (second === 0 || best.score - second >= 2 || best.score >= 16);
  if (!clear) return { status: "none" };
  return { status: "match", id: best.id };
}
