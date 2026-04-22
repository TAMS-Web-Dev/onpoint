export function normaliseInput(message: string): string {
  return message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/!/g, "i")
    .replace(/([a-z])[.\-_*](?=[a-z])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export const CRISIS_KEYWORDS: string[] = [
  // Tier 3 — Life-risk
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "take my life",
  "want to die",
  "going to die tonight",
  "don't want to be here anymore",
  "dont want to be here anymore",
  "can't go on",
  "cant go on",
  "no reason to live",
  "better off dead",
  "better off without me",
  "goodbye forever",
  "final goodbye",
  "saying goodbye to everyone",
  "overdose",
  "taken pills",
  "take all my pills",
  "take all the pills",
  "cut myself",
  "cutting myself",
  "hurt myself",
  "harm myself",
  "jump off",
  "hang myself",
  "end it all",
  "end it tonight",

  // Tier 2 — Safeguarding
  "someone is hurting me",
  "he hits me",
  "she hits me",
  "they hit me",
  "being abused",
  "scared of him",
  "scared of her",
  "scared to go home",
  "touching me",
  "makes me do things",
  "forced me",
  "threatens me",

  // Tier 3 — Method-seeking
  "how to overdose",
  "how to kill",
  "how many pills",
  "lethal dose",
  "painless way to die",
  "how to disappear forever",
  "how to end it",
];

export function checkKeywords(message: string): boolean {
  const normalised = normaliseInput(message);
  const raw = message.toLowerCase();
  return CRISIS_KEYWORDS.some(
    (kw) => normalised.includes(kw) || raw.includes(kw)
  );
}
