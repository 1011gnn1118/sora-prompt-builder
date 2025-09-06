import React, { useMemo, useState } from "react";
import { Copy, Shuffle, RotateCcw, Download, Languages, Wand2, ShieldCheck } from "lucide-react";

// ===== UI PRIMITIVES (no external UI deps) =====
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-sm border border-gray-200 bg-white ${className}`}>{children}</div>
);
const CardHeader = ({ title, subtitle }) => (
  <div className="px-5 pt-5 pb-3 border-b">
    <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
);
const Button = ({ children, onClick, className = "", variant = "default", title }) => {
  const base = "inline-flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition border focus:outline-none";
  const styles = {
    default: "bg-black text-white border-black hover:opacity-90",
    ghost: "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
    subtle: "bg-gray-900/5 text-gray-800 border-gray-200 hover:bg-gray-900/10",
  };
  return (
    <button title={title} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};
const Select = ({ value, onChange, options, className = "" }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm ${className}`}>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);
const Input = ({ value, onChange, placeholder, className = "", type = "text", min, max, step }) => (
  <input
    value={value}
    onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
    placeholder={placeholder}
    type={type}
    min={min}
    max={max}
    step={step}
    className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm ${className}`}
  />
);
const Textarea = ({ value, onChange, placeholder, rows = 4, className = "" }) => (
  <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm ${className}`} />
);
const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 text-sm">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
    <span>{label}</span>
  </label>
);

// ===== OPTIONS (EN + JP) =====
const options = {
  age: [
    { en: "teen", jp: "10代" },
    { en: "young adult", jp: "若い大人" },
    { en: "adult", jp: "大人" },
    { en: "mature", jp: "成熟した大人" },
    { en: "child", jp: "子供" },
    { en: "senior", jp: "高齢者" },
  ],
  gender: [
    { en: "female", jp: "女性" },
    { en: "male", jp: "男性" },
    { en: "non-binary", jp: "ノンバイナリー" },
    { en: "agender", jp: "無性別" },
  ],
  ethnicity: [
    { en: "Japanese", jp: "日本人風" },
    { en: "East Asian", jp: "東アジア風" },
    { en: "Mixed", jp: "ミックス" },
    { en: "Caucasian", jp: "白人風" },
    { en: "Latina", jp: "ラティーナ風" },
    { en: "Black", jp: "黒人風" },
    { en: "South Asian", jp: "南アジア風" },
    { en: "Southeast Asian", jp: "東南アジア風" },
    { en: "Middle Eastern", jp: "中東風" },
  ],
  face: [
    { en: "natural features", jp: "自然な顔立ち" },
    { en: "soft oval face", jp: "柔らかな卵型の輪郭" },
    { en: "defined jawline", jp: "輪郭のはっきりした顎" },
    { en: "light freckles", jp: "薄いそばかす" },
    { en: "beauty mark under eye", jp: "目の下のほくろ" },
    { en: "subtle dimples", jp: "控えめなえくぼ" },
    { en: "sharp cheekbones", jp: "シャープな頬骨" },
    { en: "almond eyes", jp: "アーモンド形の目" },
    { en: "soft blush on cheeks", jp: "頬の淡い赤み" },
    { en: "upturned nose", jp: "上向きの鼻" },
    { en: "sleepy hooded eyes", jp: "眠そうな一重まぶた" },
  ],
  hairStyle: [
    { en: "long straight", jp: "ロングのストレート" },
    { en: "long wavy", jp: "ロングの緩いウェーブ" },
    { en: "low ponytail", jp: "低い位置のポニーテール" },
    { en: "bob", jp: "ボブ" },
    { en: "side bangs", jp: "サイドバング" },
    { en: "pixie cut", jp: "ピクシーカット" },
    { en: "top knot", jp: "トップノット" },
    { en: "messy bun", jp: "ラフなお団子" },
    { en: "curly bob", jp: "カールのボブ" },
    { en: "double braids", jp: "二つ編み" },
  ],
  makeup: [
    { en: "none", jp: "メイクなし" },
    { en: "natural makeup", jp: "ナチュラルメイク" },
    { en: "soft glam", jp: "ソフトグラム" },
    { en: "bold makeup", jp: "大胆なメイク" },
    { en: "smokey eye", jp: "スモーキーアイ" },
    { en: "glossy lips", jp: "ツヤのあるリップ" },
    { en: "cat-eye eyeliner", jp: "キャットアイライン" },
  ],
  eyeColor: [
    { en: "dark brown", jp: "ダークブラウン" },
    { en: "brown", jp: "ブラウン" },
    { en: "hazel", jp: "ヘーゼル" },
    { en: "black", jp: "黒" },
    { en: "gray", jp: "グレー" },
    { en: "blue", jp: "ブルー" },
    { en: "green", jp: "グリーン" },
  ],
  tops: [
    { en: "fitted light gray long-sleeve, slightly open neckline", jp: "やや胸元の開いた薄いグレーの長袖" },
    { en: "oversized knit sweater", jp: "オーバーサイズのニット" },
    { en: "simple white tee", jp: "シンプルな白T" },
    { en: "button-up shirt", jp: "ボタンアップシャツ" },
    { en: "casual hoodie", jp: "カジュアルなパーカー" },
    { en: "silk blouse", jp: "シルクのブラウス" },
    { en: "graphic tee", jp: "グラフィックT" },
    { en: "turtleneck sweater", jp: "タートルネックセーター" },
  ],
  bottoms: [
    { en: "dark trousers", jp: "ダークトラウザー" },
    { en: "pleated skirt", jp: "プリーツスカート" },
    { en: "high-waist jeans", jp: "ハイウエストジーンズ" },
    { en: "tailored shorts", jp: "テーラードショーツ" },
    { en: "pencil skirt", jp: "タイトスカート" },
    { en: "flowy maxi skirt", jp: "ゆったりしたマキシスカート" },
    { en: "ripped jeans", jp: "ダメージジーンズ" },
  ],
  outer: [
    { en: "", jp: "" },
    { en: "tailored blazer", jp: "テーラードブレザー" },
    { en: "light cardigan", jp: "薄手のカーディガン" },
    { en: "denim jacket", jp: "デニムジャケット" },
    { en: "trench coat", jp: "トレンチコート" },
    { en: "leather jacket", jp: "レザージャケット" },
    { en: "puffer jacket", jp: "中綿ジャケット" },
    { en: "hooded coat", jp: "フード付きコート" },
  ],
  accessories: [
    { en: "round glasses", jp: "丸メガネ" },
    { en: "thin necklace", jp: "細いネックレス" },
    { en: "stud earrings", jp: "スタッドピアス" },
    { en: "headphones", jp: "ヘッドホン" },
    { en: "watch", jp: "腕時計" },
    { en: "no accessories", jp: "アクセサリーなし" },
    { en: "scarf", jp: "スカーフ" },
    { en: "bracelet", jp: "ブレスレット" },
    { en: "beanie hat", jp: "ビーニー帽" },
    { en: "backpack", jp: "バックパック" },
    { en: "fingerless gloves", jp: "指なし手袋" },
  ],
  background: [
    { en: "minimal studio backdrop", jp: "最小限のスタジオ背景" },
    { en: "cozy room with large window", jp: "大きな窓のある居心地のよい部屋" },
    { en: "modern café interior", jp: "モダンなカフェの内装" },
    { en: "night city through window", jp: "窓越しの夜の街並み" },
    { en: "library with tall shelves", jp: "高い本棚のある図書館" },
    { en: "sunlit park", jp: "日差しのある公園" },
    { en: "rain-soaked street at night", jp: "夜の雨に濡れた街路" },
    { en: "mountain cabin interior", jp: "山小屋の室内" },
    { en: "traditional tatami room", jp: "和室の畳" },
  ],
  bgDetails: [
    { en: "rain reflections on glass", jp: "ガラスの雨反射" },
    { en: "soft clutter of books and notes", jp: "本とノートの柔らかな雑然" },
    { en: "neon glow spill", jp: "ネオンの光漏れ" },
    { en: "indoor plants", jp: "観葉植物" },
    { en: "wooden desk", jp: "木製デスク" },
    { en: "retro posters", jp: "レトロポスター" },
    { en: "hanging fairy lights", jp: "吊るされたフェアリーライト" },
    { en: "steam rising from mug", jp: "マグから立ち上る湯気" },
    { en: "floating dust in sunlight", jp: "日差しに舞う塵" },
    { en: "stack of vinyl records", jp: "積み重なったレコード" },
    { en: "old CRT monitor glow", jp: "古いCRTモニターの光" },
  ],
  activity: [
    { en: "studying and writing in a notebook", jp: "ノートに勉強・筆記" },
    { en: "reading a paperback", jp: "文庫本を読む" },
    { en: "using a smartphone thoughtfully", jp: "スマホを思慮深く操作" },
    { en: "sipping coffee while thinking", jp: "コーヒーを飲み考え込む" },
    { en: "staring out of the window", jp: "窓の外を見つめる" },
    { en: "typing on a laptop", jp: "ノートPCでタイピング" },
    { en: "sketching in a notebook", jp: "ノートにスケッチする" },
    { en: "playing acoustic guitar", jp: "アコースティックギターを弾く" },
    { en: "painting on a canvas", jp: "キャンバスに絵を描く" },
    { en: "stretching arms lazily", jp: "腕を伸ばして伸びをする" },
  ],
  shot: [
    { en: "medium shot", jp: "ミディアムショット" },
    { en: "medium close-up", jp: "ミディアムクローズアップ" },
    { en: "close-up", jp: "クローズアップ" },
    { en: "long shot", jp: "ロングショット" },
    { en: "wide shot", jp: "ワイドショット" },
    { en: "full body shot", jp: "全身ショット" },
    { en: "extreme close-up", jp: "エクストリームクローズアップ" },
    { en: "over-the-shoulder shot", jp: "肩越しショット" },
  ],
  lighting: [
    { en: "soft desk lamp + ambient practicals", jp: "柔らかなデスクランプ＋室内の実用光" },
    { en: "cinematic low-key lighting", jp: "シネマ調のローキー照明" },
    { en: "sunset window light", jp: "夕暮れの窓明かり" },
    { en: "bright overcast daylight", jp: "明るい曇天の昼光" },
    { en: "neon sign lighting", jp: "ネオン看板の光" },
    { en: "warm fireplace glow", jp: "暖炉の暖かい光" },
    { en: "cool moonlight through window", jp: "窓から差し込む冷たい月光" },
    { en: "dramatic chiaroscuro", jp: "劇的なキアロスクーロ" },
  ],
  mood: [
    { en: "calm and focused", jp: "穏やかで集中" },
    { en: "quietly reflective", jp: "静かに物思い" },
    { en: "warm and intimate", jp: "温かく親密" },
    { en: "energetic and lively", jp: "エネルギッシュで活気がある" },
    { en: "melancholic", jp: "物悲しい" },
    { en: "nostalgic", jp: "懐かしい" },
    { en: "mysterious", jp: "神秘的" },
    { en: "joyful", jp: "喜びに満ちた" },
  ],
  style: [
    { en: "photorealistic, ultra-detailed, natural skin texture", jp: "超写実・精緻・自然な肌感" },
    { en: "cinematic color grading", jp: "シネマ調カラーグレーディング" },
    { en: "anime-inspired clean lines", jp: "アニメ風のクリーンな線" },
    { en: "vintage film look", jp: "ビンテージフィルム風" },
    { en: "soft film grain", jp: "柔らかなフィルムグレイン" },
    { en: "washed-out 90s photo", jp: "色あせた90年代写真" },
    { en: "VHS tape artifacts", jp: "VHSテープのノイズ" },
    { en: "handheld camcorder style", jp: "ハンディカム風" },
  ],
};

const toSelectOptions = (arr) => arr.map((i) => ({ value: i.en, label: i.en }));

function useClipboard() {
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };
  return { copy };
}

function findJP(en) {
  for (const group of Object.values(options)) {
    const hit = group.find((i) => i.en === en);
    if (hit) return hit.jp || en;
  }
  return en;
}

// ===== DEFAULT STATE (fixes ReferenceError) =====
const defaultState = {
  // Character
  age: "young adult",
  ageManual: "",
  gender: "female",
  genderManual: "",
  ethnicity: "Japanese",
  ethnicityManual: "",
  face: ["natural features", "soft oval face", "light freckles"],
  faceExtra: "",
  hairStyle: ["long straight", "side bangs", "low ponytail"],
  hairExtra: "",
  makeup: "natural makeup",
  makeupManual: "",
  eyeColor: "dark brown",
  eyeColorManual: "",

  // Outfit (each has manual override)
  tops: "fitted light gray long-sleeve, slightly open neckline",
  topsManual: "",
  bottoms: "dark trousers",
  bottomsManual: "",
  outer: "",
  outerManual: "",
  accessories: ["no accessories"],
  accessoriesExtra: "",

  // Scene
  background: "cozy room with large window",
  backgroundManual: "",
  bgDetails: ["wooden desk", "soft clutter of books and notes"],
  bgDetailsExtra: "",
  crowd: false,

  // Action
  activity: "studying and writing in a notebook",
  activityManual: "",

  // Camera
  shot: "medium shot",
  shotManual: "",
  focalLength: 50,
  dofStrength: 35, // 0–100
  focusSubject: "eyes",

  // Lighting / Mood / Style
  lighting: "soft desk lamp + ambient practicals",
  lightingManual: "",
  mood: "calm and focused",
  moodManual: "",
  style: ["photorealistic, ultra-detailed, natural skin texture", "cinematic color grading"],
  styleExtra: "",

  // Output
  extraEN: "",
  extraJP: "",
};

// ===== HELPERS =====
function apertureFromDof(dof) {
  // Maps 0..100 to ~f/1.2 .. f/11.2 (simple & intuitive)
  const f = Math.round(1.2 + (Math.max(0, Math.min(100, dof)) / 100) * 10 * 10) / 10;
  return `f/${f.toFixed(1)}`;
}
function pref(value, manual, legacy) {
  const candidate = (manual && String(manual).trim()) || (legacy && String(legacy).trim());
  return candidate ? candidate : value;
}

function buildEnglishPrompt(state) {
  // Multi lists with optional extra
  const hairList = state.hairStyle.filter(Boolean);
  if (state.hairExtra?.trim()) hairList.push(state.hairExtra.trim());
  const faceList = state.face.filter(Boolean);
  if (state.faceExtra?.trim()) faceList.push(state.faceExtra.trim());
  const accList = state.accessories.filter((a) => a && a !== "no accessories");
  if (state.accessoriesExtra?.trim()) accList.push(state.accessoriesExtra.trim());

  const hair = hairList.join(", ");
  const face = faceList.join(", ");
  const acc = accList.join(", ");
  const accText = acc ? `, wearing ${acc}` : "";
  const outerText = pref(state.outer, state.outerManual) ? `, with ${pref(state.outer, state.outerManual)}` : "";
  const crowd = state.crowd ? "with background passersby present" : "no background people";

  const bgdList = state.bgDetails.filter(Boolean);
  if (state.bgDetailsExtra?.trim()) bgdList.push(state.bgDetailsExtra.trim());
  const bgText = bgdList.length ? `, ${bgdList.join(", ")}` : "";

  const styleList = state.style.filter(Boolean);
  if (state.styleExtra?.trim()) styleList.push(state.styleExtra.trim());
  const style = styleList.join(", ");
  const aperture = apertureFromDof(state.dofStrength);

  const lines = [
    `A ${pref(state.age, state.ageManual)} ${pref(state.gender, state.genderManual)} ${pref(state.ethnicity, state.ethnicityManual)} subject with ${face}.`,
    `Hairstyle: ${hair}. Makeup: ${pref(state.makeup, state.makeupManual)}. Eye color: ${pref(state.eyeColor, state.eyeColorManual)}.`,
    `Outfit: ${pref(state.tops, state.topsManual)}, ${pref(state.bottoms, state.bottomsManual)}${outerText}${accText}.`,
    `Scene: ${pref(state.background, state.backgroundManual)}${bgText}; ${crowd}.`,
    `Action: ${pref(state.activity, state.activityManual)}.`,
    `Camera: ${pref(state.shot, state.shotManual)}, ${state.focalLength}mm lens, ${aperture}, focus on ${state.focusSubject}.`,
    `Lighting: ${pref(state.lighting, state.lightingManual)}. Mood: ${pref(state.mood, state.moodManual)}. Visual style: ${style}.`,
  ];

  const base = lines.join(" \n");
  const extra = state.extraEN?.trim() ? `\nNotes: ${state.extraEN.trim()}` : "";
  return (
    base +
    extra +
    "\nStrictly photorealistic rendering with natural skin texture, realistic fabric folds, detailed hair strands. No cartoon or anime features."
  );
}

function buildJapanesePrompt(state) {
  const hairArr = state.hairStyle.map(findJP).filter(Boolean);
  if (state.hairExtra?.trim()) hairArr.push(state.hairExtra.trim());
  const faceArr = state.face.map(findJP).filter(Boolean);
  if (state.faceExtra?.trim()) faceArr.push(state.faceExtra.trim());

  const accArr = state.accessories.filter((a) => a && a !== "no accessories").map(findJP);
  if (state.accessoriesExtra?.trim()) accArr.push(state.accessoriesExtra.trim());
  const accText = accArr.length ? `、アクセサリーは${accArr.join("、")}` : "";

  const outerJP = pref(state.outer, state.outerManual) ? findJP(pref(state.outer, state.outerManual)) : "";
  const outerText = outerJP ? `、アウターは${outerJP}` : "";
  const crowd = state.crowd ? "背景には通行人がいる" : "背景に人物はいない";

  const bgdArr = state.bgDetails.map(findJP).filter(Boolean);
  if (state.bgDetailsExtra?.trim()) bgdArr.push(state.bgDetailsExtra.trim());
  const bgText = bgdArr.length ? `、${bgdArr.join("、")}` : "";

  const styleArr = state.style.map(findJP).filter(Boolean);
  if (state.styleExtra?.trim()) styleArr.push(state.styleExtra.trim());
  const aperture = apertureFromDof(state.dofStrength);

  const lines = [
    `${findJP(pref(state.age, state.ageManual))}の${findJP(pref(state.gender, state.genderManual))}、${findJP(pref(state.ethnicity, state.ethnicityManual))}の雰囲気。顔立ち：${faceArr.join("、")}。`,
    `ヘア：${hairArr.join("、")}。メイク：${findJP(pref(state.makeup, state.makeupManual))}。瞳の色：${findJP(pref(state.eyeColor, state.eyeColorManual))}。`,
    `服装：${findJP(pref(state.tops, state.topsManual))}、${findJP(pref(state.bottoms, state.bottomsManual))}${outerText}${accText}。`,
    `シーン：${findJP(pref(state.background, state.backgroundManual))}${bgText}。${crowd}。`,
    `動作：${findJP(pref(state.activity, state.activityManual))}。`,
    `カメラ：${findJP(pref(state.shot, state.shotManual))}、${state.focalLength}mm、${aperture}、フォーカスは${state.focusSubject}。`,
    `ライティング：${findJP(pref(state.lighting, state.lightingManual))}。ムード：${findJP(pref(state.mood, state.moodManual))}。ビジュアル：${styleArr.join("、")}。`,
  ];

  const base = lines.join("\n");
  const extra = state.extraJP?.trim() ? `\n備考：${state.extraJP.trim()}` : "";
  return (
    base +
    extra +
    "\n超写実的で自然な肌質、現実的な布のしわ、髪の1本1本まで丁寧に。アニメ・イラスト的表現は不可。"
  );
}

// ===== MAIN COMPONENT =====
export default function SoraPromptBuilder() {
  // Default state is now defined above (fixes ReferenceError)
  const [state, setState] = useState(defaultState);
  const [seed, setSeed] = useState(0);
  const { copy } = useClipboard();

  const EN = useMemo(() => buildEnglishPrompt(state), [state]);
  const JP = useMemo(() => buildJapanesePrompt(state), [state]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sora_prompt_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)].en; }
  function randomSubset(arr, min = 1, max = 2) {
    const n = Math.max(min, Math.min(max, arr.length));
    const k = Math.floor(Math.random() * (n - min + 1)) + min;
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, k).map((i) => i.en);
  }

  const randomize = () => {
    setSeed((s) => s + 1);
    setState((prev) => ({
      ...prev,
      age: randomPick(options.age),
      ageManual: "",
      gender: randomPick(options.gender),
      genderManual: "",
      ethnicity: randomPick(options.ethnicity),
      ethnicityManual: "",
      face: randomSubset(options.face, 1, 3),
      faceExtra: "",
      hairStyle: randomSubset(options.hairStyle, 1, 3),
      hairExtra: "",
      makeup: randomPick(options.makeup),
      makeupManual: "",
      eyeColor: randomPick(options.eyeColor),
      eyeColorManual: "",
      tops: randomPick(options.tops),
      topsManual: "",
      bottoms: randomPick(options.bottoms),
      bottomsManual: "",
      outer: randomPick(options.outer),
      outerManual: "",
      accessories: randomSubset(options.accessories, 1, 2),
      accessoriesExtra: "",
      background: randomPick(options.background),
      backgroundManual: "",
      bgDetails: randomSubset(options.bgDetails, 1, 3),
      bgDetailsExtra: "",
      crowd: Math.random() < 0.4,
      activity: randomPick(options.activity),
      activityManual: "",
      shot: randomPick(options.shot),
      shotManual: "",
      focalLength: [35, 50, 85][Math.floor(Math.random() * 3)],
      dofStrength: Math.floor(Math.random() * 80) + 10,
      focusSubject: ["eyes", "eyelashes", "face", "hands", "book"][Math.floor(Math.random() * 5)],
      lighting: randomPick(options.lighting),
      lightingManual: "",
      mood: randomPick(options.mood),
      moodManual: "",
      style: randomSubset(options.style, 1, 2),
      styleExtra: "",
    }));
  };

  const reset = () => setState(defaultState);

  const field = (label, node, hint) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {node}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );

  const multiPills = (values, setValues, pool) => (
    <div className="flex flex-wrap gap-2">
      {pool.map((opt) => {
        const active = values.includes(opt.en);
        return (
          <button
            key={opt.en}
            onClick={() => setValues(active ? values.filter((v) => v !== opt.en) : [...values, opt.en])}
            className={`px-2.5 py-1 rounded-full text-xs border ${active ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`}
          >
            {opt.en}
          </button>
        );
      })}
    </div>
  );

  // Simple self-tests (smoke tests) to ensure key pieces work
  const selfTests = useMemo(() => {
    const tests = [];
    tests.push({ name: "defaultState defined", pass: typeof defaultState === "object" });
    const en = buildEnglishPrompt(defaultState);
    tests.push({ name: "EN prompt mentions Camera", pass: /Camera:\s/.test(en) });
    const jp = buildJapanesePrompt(defaultState);
    tests.push({ name: "JP prompt mentions カメラ", pass: /カメラ：/.test(jp) });
    return tests;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wand2 className="h-5 w-5" />
            <h1 className="text-base sm:text-lg font-semibold">Sora Prompt Builder — EN/JP</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={randomize} title="Randomize"><Shuffle className="h-4 w-4" />Random</Button>
            <Button variant="subtle" onClick={reset} title="Reset"><RotateCcw className="h-4 w-4" />Reset</Button>
            <Button variant="ghost" onClick={exportJSON} title="Export JSON"><Download className="h-4 w-4" />Export</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: Controls */}
        <div className="xl:col-span-2 space-y-6">
          {/* Character */}
          <Card>
            <CardHeader title="Character" subtitle="Fine-grained controls (no height/weight). Add freckles, moles, dimples, etc." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field("Age", (
                <div className="space-y-2">
                  <Select value={state.age} onChange={(v) => setState({ ...state, age: v })} options={toSelectOptions(options.age)} />
                  <Input value={state.ageManual} onChange={(v) => setState({ ...state, ageManual: v })} placeholder="e.g. early 20s" />
                </div>
              ))}
              {field("Gender", (
                <div className="space-y-2">
                  <Select value={state.gender} onChange={(v) => setState({ ...state, gender: v })} options={toSelectOptions(options.gender)} />
                  <Input value={state.genderManual} onChange={(v) => setState({ ...state, genderManual: v })} placeholder="e.g. androgynous female" />
                </div>
              ))}
              {field("Ethnicity / Vibe", (
                <div className="space-y-2">
                  <Select value={state.ethnicity} onChange={(v) => setState({ ...state, ethnicity: v })} options={toSelectOptions(options.ethnicity)} />
                  <Input value={state.ethnicityManual} onChange={(v) => setState({ ...state, ethnicityManual: v })} placeholder="e.g. Japanese-Taiwanese vibe" />
                </div>
              ))}

              {field("Face (multi)", (
                <div className="space-y-2">
                  {multiPills(state.face, (vals) => setState({ ...state, face: vals }), options.face)}
                  <Input value={state.faceExtra} onChange={(v) => setState({ ...state, faceExtra: v })} placeholder="e.g. tiny beauty mark above lip" />
                </div>
              ), "Add freckles, moles, dimples, etc." )}

              {field("Hair (multi)", (
                <div className="space-y-2">
                  {multiPills(state.hairStyle, (vals) => setState({ ...state, hairStyle: vals }), options.hairStyle)}
                  <Input value={state.hairExtra} onChange={(v) => setState({ ...state, hairExtra: v })} placeholder="e.g. loose strands, tucked behind ear" />
                </div>
              ))}

              {field("Makeup", (
                <div className="space-y-2">
                  <Select value={state.makeup} onChange={(v) => setState({ ...state, makeup: v })} options={toSelectOptions(options.makeup)} />
                  <Input value={state.makeupManual} onChange={(v) => setState({ ...state, makeupManual: v })} placeholder="e.g. natural base, subtle eyeliner" />
                </div>
              ))}

              {field("Eye color", (
                <div className="space-y-2">
                  <Select value={state.eyeColor} onChange={(v) => setState({ ...state, eyeColor: v })} options={toSelectOptions(options.eyeColor)} />
                  <Input value={state.eyeColorManual} onChange={(v) => setState({ ...state, eyeColorManual: v })} placeholder="e.g. deep umber" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Outfit */}
          <Card>
            <CardHeader title="Outfit" subtitle="Clothing & accessories. Each field allows manual override (e.g. custom text)." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field("Tops", (
                <div className="space-y-2">
                  <Select value={state.tops} onChange={(v) => setState({ ...state, tops: v })} options={toSelectOptions(options.tops)} />
                  <Input value={state.topsManual} onChange={(v) => setState({ ...state, topsManual: v })} placeholder="e.g. light gray blouse with open neckline" />
                </div>
              ))}
              {field("Bottoms", (
                <div className="space-y-2">
                  <Select value={state.bottoms} onChange={(v) => setState({ ...state, bottoms: v })} options={toSelectOptions(options.bottoms)} />
                  <Input value={state.bottomsManual} onChange={(v) => setState({ ...state, bottomsManual: v })} placeholder="e.g. tapered dark trousers" />
                </div>
              ))}
              {field("Outer", (
                <div className="space-y-2">
                  <Select value={state.outer} onChange={(v) => setState({ ...state, outer: v })} options={toSelectOptions(options.outer)} />
                  <Input value={state.outerManual} onChange={(v) => setState({ ...state, outerManual: v })} placeholder="e.g. none / cardigan / blazer" />
                </div>
              ))}
              {field("Accessories (multi)", (
                <div className="space-y-2">
                  {multiPills(state.accessories, (vals) => setState({ ...state, accessories: vals }), options.accessories)}
                  <Input value={state.accessoriesExtra} onChange={(v) => setState({ ...state, accessoriesExtra: v })} placeholder="e.g. silver ring, hair tie" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Scene */}
          <Card>
            <CardHeader title="Scene" subtitle="Background, details, and whether to include passersby." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field("Background", (
                <div className="space-y-2">
                  <Select value={state.background} onChange={(v) => setState({ ...state, background: v })} options={toSelectOptions(options.background)} />
                  <Input value={state.backgroundManual} onChange={(v) => setState({ ...state, backgroundManual: v })} placeholder="e.g. large window with city lights" />
                </div>
              ))}
              {field("Background details (multi)", (
                <div className="space-y-2">
                  {multiPills(state.bgDetails, (vals) => setState({ ...state, bgDetails: vals }), options.bgDetails)}
                  <Input value={state.bgDetailsExtra} onChange={(v) => setState({ ...state, bgDetailsExtra: v })} placeholder="e.g. scattered sticky notes, ceramic mug" />
                </div>
              ))}
              <div className="flex items-end"><Toggle checked={state.crowd} onChange={(v) => setState({ ...state, crowd: v })} label="Include background people / passersby" /></div>
            </CardContent>
          </Card>

          {/* Action */}
          <Card>
            <CardHeader title="Action" subtitle="What the subject is doing (presets + manual)." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field("Activity", (
                <div className="space-y-2">
                  <Select value={state.activity} onChange={(v) => setState({ ...state, activity: v })} options={toSelectOptions(options.activity)} />
                  <Input value={state.activityManual} onChange={(v) => setState({ ...state, activityManual: v })} placeholder="e.g. organizing study notes, highlighting text" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Camera */}
          <Card>
            <CardHeader title="Camera" subtitle="Shot, focal length, depth-of-field as a numeric control." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field("Shot type", (
                <div className="space-y-2">
                  <Select value={state.shot} onChange={(v) => setState({ ...state, shot: v })} options={toSelectOptions(options.shot)} />
                  <Input value={state.shotManual} onChange={(v) => setState({ ...state, shotManual: v })} placeholder="e.g. tight medium, slight high angle" />
                </div>
              ))}
              {field("Focal length (mm)", (
                <Input type="number" value={state.focalLength} onChange={(v) => setState({ ...state, focalLength: v })} min={18} max={135} step={1} />
              ), "Typical portrait: 50–85mm" )}
              {field("Depth of field (0–100)", (
                <Input type="number" value={state.dofStrength} onChange={(v) => setState({ ...state, dofStrength: Math.max(0, Math.min(100, v)) })} min={0} max={100} step={1} />
              ), "Higher = deeper focus (mapped to aperture)." )}
              {field("Focus subject (manual)", (
                <Input value={state.focusSubject} onChange={(v) => setState({ ...state, focusSubject: v })} placeholder="e.g. eyes / eyelashes / face / hands / book" />
              ))}
            </CardContent>
          </Card>

          {/* Lighting & Mood */}
          <Card>
            <CardHeader title="Lighting / Mood / Style" subtitle="Cinematic feel without a color palette field (excluded per request)." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field("Lighting", (
                <div className="space-y-2">
                  <Select value={state.lighting} onChange={(v) => setState({ ...state, lighting: v })} options={toSelectOptions(options.lighting)} />
                  <Input value={state.lightingManual} onChange={(v) => setState({ ...state, lightingManual: v })} placeholder="e.g. soft lamp + faint neon spill" />
                </div>
              ))}
              {field("Mood", (
                <div className="space-y-2">
                  <Select value={state.mood} onChange={(v) => setState({ ...state, mood: v })} options={toSelectOptions(options.mood)} />
                  <Input value={state.moodManual} onChange={(v) => setState({ ...state, moodManual: v })} placeholder="e.g. serene, quietly determined" />
                </div>
              ))}
              {field("Style (multi)", (
                <div className="space-y-2">
                  {multiPills(state.style, (vals) => setState({ ...state, style: vals }), options.style)}
                  <Input value={state.styleExtra} onChange={(v) => setState({ ...state, styleExtra: v })} placeholder="e.g. subtle film grain, zero bloom" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Output Notes */}
          <Card>
            <CardHeader title="Notes" subtitle="Free-form notes for both languages." />
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {field("Extra (EN) — manual", (
                <Textarea value={state.extraEN} onChange={(v) => setState({ ...state, extraEN: v })} placeholder="Any extra English notes (e.g. 'light film grain, no bloom')" rows={3} />
              ))}
              {field("追記（JP）— マニュアル", (
                <Textarea value={state.extraJP} onChange={(v) => setState({ ...state, extraJP: v })} placeholder="日本語での追記事項（例：微かなフィルムグレイン、ブルームなし）" rows={3} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Outputs */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="English Prompt" subtitle="Natural prose for Sora (copy-ready)." />
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500">Aperture ≈ {apertureFromDof(state.dofStrength)} (from DoF {state.dofStrength})</div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => copy(EN)} title="Copy English"><Copy className="h-4 w-4" />Copy</Button>
                </div>
              </div>
              <Textarea value={EN} onChange={() => {}} rows={14} className="font-mono" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="日本語プロンプト" subtitle="英語と別でコピペしやすいよう分離。辞書ベースでオフライン生成。" />
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500"><Languages className="h-4 w-4" />内蔵変換（機械翻訳API不使用）</div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => copy(JP)} title="Copy Japanese"><Copy className="h-4 w-4" />コピー</Button>
                </div>
              </div>
              <Textarea value={JP} onChange={() => {}} rows={14} className="font-mono" />
            </CardContent>
          </Card>

          {/* Smoke tests */}
          <Card>
            <CardHeader title="Self‑tests" subtitle="Quick checks to prevent common regressions." />
            <CardContent>
              <ul className="space-y-1 text-sm">
                {selfTests.map((t, i) => (
                  <li key={i} className={`flex items-center gap-2 ${t.pass ? "text-emerald-700" : "text-red-700"}`}>
                    <ShieldCheck className="h-4 w-4" />{t.name}: {t.pass ? "PASS" : "FAIL"}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Utilities" subtitle="Download JSON with current settings." />
            <CardContent className="flex flex-col gap-2">
              <Button variant="ghost" onClick={exportJSON}><Download className="h-4 w-4" />Download JSON</Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-10 text-xs text-gray-500">
        <p>
          Notes: This builder avoids a dedicated color palette field per your request. Each section supports manual overrides ("e.g." inputs). The JP prompt is generated via an internal dictionary to keep everything offline.
        </p>
      </footer>
    </div>
  );
}
