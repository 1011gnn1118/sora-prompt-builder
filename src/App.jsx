import React, { useMemo, useState } from "react";
import {
  Copy,
  Shuffle,
  RotateCcw,
  Download,
  Languages,
  Wand2,
  ShieldCheck,
  CameraOff,
  EyeOff,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Select,
  Input,
  Textarea,
  Toggle,
} from "./components/ui";
import { options, toSelectOptions, findJP } from "./data/options";

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


// ===== DEFAULT STATE (extended for candid & static camera) =====
const defaultState = {
  // Character
  age: "",
  ageManual: "",
  gender: "female",
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

  // Outfit
  tops: "fitted light gray long-sleeve, slightly open neckline",
  topsManual: "",
  bottoms: "dark trousers",
  bottomsManual: "",
  dress: "",
  dressManual: "",
  outer: "",
  outerManual: "",
  accessories: ["no accessories"],
  accessoriesExtra: "",
  fashionVibe: "fashionable",
  fashionVibeManual: "",

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

  // Movement & candid controls
  staticCamera: true, // lock camera (no zoom/pan)
  tripod: true, // locked-off tripod style
  forbidEyeContact: false, // never look toward camera
  candidMode: "none", // "none" | "far" | "close"

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
function pref(value, manual) {
  const candidate = (manual && String(manual).trim()) || (value && String(value).trim());
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

  // Camera motion & candid strings
  const staticStr = state.staticCamera
    ? ", static locked-off tripod shot, no zoom, no panning, no dolly, no push-in, absolutely no handheld shake or micro jitter, zero camera motion of any kind; composition never changes, like CCTV or a still photograph"
    : "";
  const tripodStr = state.tripod && !state.staticCamera ? ", tripod shot (no handheld shake)" : "";
  const forbidEyeStr = state.forbidEyeContact ? ", excluding any direct eye contact with the viewer" : "";
  let candidStr = "";
  if (state.candidMode === "far") {
    candidStr = ", captured documentary-style from a discreet distance as an unaware candid moment";
  } else if (state.candidMode === "close") {
    candidStr = ", candid close proximity as if peeking into her private space, unposed and unaware";
  }

  const moodExtra = state.candidMode !== "none" ? ", candid, natural, unposed" : "";

  const fullBodyGuarantee = state.shot.includes("full body") ? ", the entire figure fully visible from head to toe, never cropped" : "";
  const actionRepetition = ", the motion is clearly captured and repeated continuously as a central sustained action";

  const subjectParts = [];
  const age = pref(state.age, state.ageManual);
  const gender = pref(state.gender, state.genderManual);
  const ethnicity = pref(state.ethnicity, state.ethnicityManual);
  if (age) subjectParts.push(age);
  if (gender) subjectParts.push(gender);
  if (ethnicity) subjectParts.push(ethnicity);
  const subject = subjectParts.join(" ");

  const dress = pref(state.dress, state.dressManual);
  const outfit = dress
    ? `${dress}${outerText}${accText}`
    : `${pref(state.tops, state.topsManual)}, ${pref(state.bottoms, state.bottomsManual)}${outerText}${accText}`;
  const fashionVibe = pref(state.fashionVibe, state.fashionVibeManual);

  const lines = [
    `A ${subject} subject with ${face}.`,
    `Hairstyle: ${hair}. Makeup: ${pref(state.makeup, state.makeupManual)}. Eye color: ${pref(state.eyeColor, state.eyeColorManual)}.`,
    `Outfit: ${outfit}.`,
    fashionVibe ? `Fashion vibe: ${fashionVibe}.` : "",
    `Scene: ${pref(state.background, state.backgroundManual)}${bgText}; ${crowd}.`,
    `Action: ${pref(state.activity, state.activityManual)}${actionRepetition}${state.forbidEyeContact ? ", never looking toward the camera" : ""}.`,
    `Camera: ${pref(state.shot, state.shotManual)}, ${state.focalLength}mm lens, ${aperture}, focus on ${state.focusSubject}${staticStr}${tripodStr}${candidStr}${forbidEyeStr}${fullBodyGuarantee}.`,
    `Lighting: ${pref(state.lighting, state.lightingManual)}. Mood: ${pref(state.mood, state.moodManual)}${moodExtra}. Visual style: ${style}.`,
  ];

  const base = lines.filter(Boolean).join(" \n");
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

  const staticStr = state.staticCamera ? "、カメラは固定 - 三脚使用。ズーム・パン・ドリー・プッシュイン・手ブレ・微揺れ一切なし。構図は終始不変でCCTVや静止写真のよう" : "";
  const tripodStr = state.tripod && !state.staticCamera ? "、三脚で手ブレなし" : "";
  const forbidEyeStr = state.forbidEyeContact ? "、カメラ目線は一切なし" : "";
  let candidStr = "";
  if (state.candidMode === "far") candidStr = "、離れた位置からのドキュメンタリー風の観察ショット";
  else if (state.candidMode === "close") candidStr = "、至近距離から覗き見るようなアンポーズの密着ショット";
  const moodExtra = state.candidMode !== "none" ? "、スナップ的・自然体・演出感のない雰囲気" : "";

  const fullBodyGuarantee = state.shot.includes("full body") ? "、頭からつま先まで完全に写っており、クロップされない" : "";
  const actionRepetition = "。動作は明確に画面に収められ、繰り返し持続的に主要な要素として強調される";

  const ageJP = pref(state.age, state.ageManual);
  const subjectLine = `${ageJP ? findJP(ageJP) + "の" : ""}${findJP(pref(state.gender, state.genderManual))}、${findJP(pref(state.ethnicity, state.ethnicityManual))}の雰囲気。顔立ち：${faceArr.join("、")}。`;

  const dressJP = pref(state.dress, state.dressManual)
    ? findJP(pref(state.dress, state.dressManual))
    : "";
  const outfitJP = dressJP
    ? `${dressJP}${outerText}${accText}`
    : `${findJP(pref(state.tops, state.topsManual))}、${findJP(pref(state.bottoms, state.bottomsManual))}${outerText}${accText}`;
  const fashionJP = pref(state.fashionVibe, state.fashionVibeManual);

  const lines = [
    subjectLine,
    `ヘア：${hairArr.join("、")}。メイク：${findJP(pref(state.makeup, state.makeupManual))}。瞳の色：${findJP(pref(state.eyeColor, state.eyeColorManual))}。`,
    `服装：${outfitJP}。`,
    fashionJP ? `ファッションの雰囲気：${findJP(fashionJP)}。` : "",
    `シーン：${findJP(pref(state.background, state.backgroundManual))}${bgText}。${crowd}。`,
    `動作：${findJP(pref(state.activity, state.activityManual))}${actionRepetition}${state.forbidEyeContact ? "。視線は対象に固定され、カメラを見ることはない" : ""}。`,
    `カメラ：${findJP(pref(state.shot, state.shotManual))}、${state.focalLength}mm、${aperture}、フォーカスは${state.focusSubject}${staticStr}${tripodStr}${candidStr}${forbidEyeStr}${fullBodyGuarantee}。`,
    `ライティング：${findJP(pref(state.lighting, state.lightingManual))}。ムード：${findJP(pref(state.mood, state.moodManual))}${moodExtra}。ビジュアル：${styleArr.join("、")}。`,
  ];

  const base = lines.filter(Boolean).join("\n");
  const extra = state.extraJP?.trim() ? `\n備考: ${state.extraJP.trim()}` : "";
  return (
    base +
    extra +
    "\n超写実的で自然な肌質、現実的な布のしわ、髪の1本1本まで丁寧に。アニメ・イラスト的表現は不可。"
  );
}

// ===== MAIN COMPONENT =====
export default function SoraPromptBuilder() {
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
    const useDress = Math.random() < 0.5;
    setState((prev) => ({
      ...prev,
      age: randomPick(options.age),
      ageManual: "",
      gender: "female",
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
      dress: useDress ? randomPick(options.fashionDresses) : "",
      dressManual: "",
      tops: useDress ? "" : randomPick(options.tops),
      topsManual: "",
      bottoms: useDress ? "" : randomPick(options.bottoms),
      bottomsManual: "",
      outer: randomPick(options.outer),
      outerManual: "",
      accessories: randomSubset(options.accessories, 1, 2),
      accessoriesExtra: "",
      fashionVibe: randomPick(options.fashionVibes),
      fashionVibeManual: "",
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
      // keep candid/static settings as-is so UX remains predictable
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

  // Self-tests to catch regressions (kept + expanded)
  const selfTests = useMemo(() => {
    const tests = [];
    tests.push({ name: "defaultState defined", pass: typeof defaultState === "object" });
    const en = buildEnglishPrompt(defaultState);
    tests.push({ name: "EN prompt mentions Camera", pass: /Camera:\\s/.test(en) });
    const jp = buildJapanesePrompt(defaultState);
    tests.push({ name: "JP prompt mentions カメラ", pass: /カメラ：/.test(jp) });
    tests.push({ name: "Static camera phrase present (EN)", pass: buildEnglishPrompt({ ...defaultState, staticCamera: true }).includes("static locked-off tripod") });
    tests.push({ name: "Absolute no-movement present (EN)", pass: buildEnglishPrompt({ ...defaultState, staticCamera: true }).includes("no push-in") });
    tests.push({ name: "Candid FAR injects wording (EN)", pass: buildEnglishPrompt({ ...defaultState, candidMode: "far" }).includes("documentary-style") });
    tests.push({ name: "Candid CLOSE injects wording (EN)", pass: buildEnglishPrompt({ ...defaultState, candidMode: "close" }).includes("peeking into her private space") });
    tests.push({ name: "JP static phrase present", pass: buildJapanesePrompt({ ...defaultState, staticCamera: true }).includes("ズーム・パン・ドリー・プッシュイン・手ブレ・微揺れ一切なし") });
    tests.push({ name: "Forbid eye contact injects (EN)", pass: buildEnglishPrompt({ ...defaultState, forbidEyeContact: true }).includes("excluding any direct eye contact") });
    tests.push({ name: "Action repetition phrase present (EN)", pass: buildEnglishPrompt({ ...defaultState, activity: "stretching arms lazily" }).includes("repeated continuously") });
    tests.push({ name: "Action repetition phrase present (JP)", pass: buildJapanesePrompt({ ...defaultState, activity: "stretching arms lazily" }).includes("繰り返し持続的に") });
    tests.push({ name: "Full body guarantee triggers (EN)", pass: buildEnglishPrompt({ ...defaultState, shot: "full body shot" }).includes("fully visible from head to toe") });
    tests.push({ name: "Aperture mapping works", pass: /^f\/[0-9]+\.[0-9]$/.test(apertureFromDof(defaultState.dofStrength)) });
    tests.push({ name: "Lighting field composes", pass: buildEnglishPrompt({ ...defaultState, lighting: "neon sign lighting" }).includes("Lighting: neon sign lighting") });
    tests.push({ name: "Dress field composes (EN)", pass: buildEnglishPrompt({ ...defaultState, dress: "sundress", tops: "", bottoms: "" }).includes("Outfit: sundress") });
    tests.push({ name: "Dress field composes (JP)", pass: buildJapanesePrompt({ ...defaultState, dress: "sundress", tops: "", bottoms: "" }).includes("服装：サマードレス") });
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
              <CardHeader title="Character" subtitle="Fine-grained controls - add freckles, moles, dimples, etc." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field("Age", (
                <div className="space-y-2">
                  <Select value={state.age} onChange={(v) => setState({ ...state, age: v })} options={[{ value: "", label: "" }, ...toSelectOptions(options.age)]} />
                  <Input value={state.ageManual} onChange={(v) => setState({ ...state, ageManual: v })} placeholder="e.g. early 20s" />
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
            <CardHeader title="Outfit" subtitle="Clothing & accessories. Each field allows manual override - custom text supported." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field("Tops", (
                <div className="space-y-2">
                  <Select value={state.tops} onChange={(v) => setState({ ...state, tops: v })} options={toSelectOptions(options.tops)} />
                  <Input value={state.topsManual} onChange={(v) => setState({ ...state, topsManual: v })} placeholder="e.g. silky blouse with a deep V-neckline (subtle)" />
                </div>
              ))}
              {field("Bottoms", (
                <div className="space-y-2">
                  <Select value={state.bottoms} onChange={(v) => setState({ ...state, bottoms: v })} options={toSelectOptions(options.bottoms)} />
                  <Input value={state.bottomsManual} onChange={(v) => setState({ ...state, bottomsManual: v })} placeholder="e.g. sleek high-waist mini skirt / tapered trousers" />
                </div>
              ))}
              {field("Dress", (
                <div className="space-y-2">
                  <Select
                    value={state.dress}
                    onChange={(v) => setState({ ...state, dress: v })}
                    options={[{ value: "", label: "" }, ...toSelectOptions(options.fashionDresses)]}
                  />
                  <Input
                    value={state.dressManual}
                    onChange={(v) => setState({ ...state, dressManual: v })}
                    placeholder="e.g. floral midi dress"
                  />
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
              {field("Fashion vibe", (
                <div className="space-y-2">
                  <Select value={state.fashionVibe} onChange={(v) => setState({ ...state, fashionVibe: v })} options={toSelectOptions(options.fashionVibes)} />
                  <Input value={state.fashionVibeManual} onChange={(v) => setState({ ...state, fashionVibeManual: v })} placeholder="e.g. urban casual chic" />
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
            <CardHeader title="Action" subtitle="What the subject is doing - choose from options or enter manually." />
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
            <CardHeader title="Camera" subtitle="Shot, focal length, depth-of-field, and movement or candid controls." right={<CameraOff className="h-5 w-5 text-gray-500" />} />
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
              ), "Higher = deeper focus - mapped to aperture" )}
              {field("Focus subject (manual)", (
                <Input value={state.focusSubject} onChange={(v) => setState({ ...state, focusSubject: v })} placeholder="e.g. eyes / eyelashes / face / hands / book" />
              ))}
              {/* Movement toggles */}
              <div className="flex flex-col gap-3">
                <Toggle checked={state.staticCamera} onChange={(v) => setState({ ...state, staticCamera: v })} label="Static camera - no zoom or pan" />
                <Toggle checked={state.tripod} onChange={(v) => setState({ ...state, tripod: v })} label="Locked-off tripod - no handheld shake" />
                <Toggle checked={state.forbidEyeContact} onChange={(v) => setState({ ...state, forbidEyeContact: v })} label={<span className="inline-flex items-center gap-1"><EyeOff className="h-3.5 w-3.5"/>Forbid direct eye contact</span>} />
              </div>
              {/* Candid selector */}
              {field("Candid mode", (
                <Select
                  value={state.candidMode}
                  onChange={(v) => setState({ ...state, candidMode: v })}
                  options={[
                    { value: "none", label: "none" },
                    { value: "far", label: "far - documentary observe" },
                    { value: "close", label: "close - peeking proximity" },
                  ]}
                />
              ), "Choose how unaware is conveyed." )}
            </CardContent>
          </Card>

          {/* Lighting & Mood */}
          <Card>
            <CardHeader title="Lighting / Mood / Style" subtitle="Cinematic feel without a color palette field." />
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
              {field("Extra EN - manual", (
                <Textarea value={state.extraEN} onChange={(v) => setState({ ...state, extraEN: v })} placeholder="Any extra English notes - e.g. light film grain, no bloom" rows={3} />
              ))}
              {field("追記 JP - マニュアル", (
                <Textarea value={state.extraJP} onChange={(v) => setState({ ...state, extraJP: v })} placeholder="日本語での追記事項 - 例: 微かなフィルムグレイン、ブルームなし" rows={3} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Outputs */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="English Prompt" subtitle="Natural prose for Sora - copy-ready." />
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
                <div className="flex items-center gap-2 text-xs text-gray-500"><Languages className="h-4 w-4" />内蔵変換 (機械翻訳API不使用)</div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => copy(JP)} title="Copy Japanese"><Copy className="h-4 w-4" />コピー</Button>
                </div>
              </div>
              <Textarea value={JP} onChange={() => {}} rows={14} className="font-mono" />
            </CardContent>
          </Card>

          {/* Smoke tests */}
          <Card>
            <CardHeader title="Self-tests" subtitle="Quick checks to prevent common regressions." />
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
          Notes: This builder includes static camera, candid modes (far or close), forbid-eye-contact, and continuous-action emphasis. All ASCII punctuation to avoid parser errors.
        </p>
      </footer>
    </div>
  );
}
