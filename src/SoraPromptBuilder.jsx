import React, { useMemo, useRef, useState } from "react";
import {
  Copy,
  Shuffle,
  RotateCcw,
  Download,
  Languages,
  Wand2,
  CameraOff,
  EyeOff,
  Layers,
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
  ActionBar,
  FloatingToast,
} from "./components/ui";
import PresetManager from "./components/PresetManager.jsx";
import { options, toSelectOptions, findJP } from "./data/options";
import { useCopyFeedback } from "./hooks/useCopyFeedback.js";
import { listToOxford, normalizeEnglish, compactSegments } from "./utils/text.js";

const apertureFromDof = (dof) => {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(dof) ? dof : 35));
  const f = Math.round(1.2 + (clamped / 100) * 10 * 10) / 10;
  return `f/${f.toFixed(1)}`;
};

const pref = (value, manual) => {
  const manualStr = manual && String(manual).trim();
  if (manualStr) return manualStr;
  const valueStr = value && String(value).trim();
  return valueStr || "";
};

const mergeMulti = (list = [], extra) => {
  const items = Array.isArray(list) ? list.filter(Boolean) : [];
  const extraStr = extra && String(extra).trim();
  if (extraStr) items.push(extraStr);
  return items.filter(Boolean);
};

const defaultState = () => ({
  age: "",
  ageManual: "",
  gender: "female",
  genderManual: "",
  ethnicity: "Japanese",
  ethnicityManual: "",
  face: ["natural features", "soft oval face", "light freckles"],
  faceExtra: "",
  hairStyle: ["long straight", "side bangs", "low ponytail"],
  hairExtra: "",
  hairColor: "platinum blonde",
  hairColorManual: "",
  makeup: "natural makeup",
  makeupManual: "",
  eyeColor: "dark brown",
  eyeColorManual: "",

  tops: "fitted light gray long-sleeve, slightly open neckline",
  topsManual: "",
  bottoms: "dark trousers",
  bottomsManual: "",
  dress: "",
  dressManual: "",
  outer: "",
  outerManual: "",
  accessories: [],
  accessoriesExtra: "",
  fashionVibe: "fashionable",
  fashionVibeManual: "",

  background: "cozy room with large window",
  backgroundManual: "",
  bgDetails: ["wooden desk", "soft clutter of books and notes"],
  bgDetailsExtra: "",
  crowd: false,

  activity: ["studying and writing in a notebook"],
  activityManual: "",

  shotDistance: "Medium Shot (MS)",
  shotAngle: "",
  shotStyle: "",
  shotManual: "",
  lens: "",
  focalLength: 50,
  dofStrength: 35,
  focusSubject: "eyes",

  staticCamera: true,
  tripod: true,
  forbidEyeContact: false,
  candidMode: "none",

  cameraMovement: ["locked static frame"],
  cameraMovementManual: "",
  shutterSpeed: "1/48s (180° shutter, natural motion blur)",
  shutterManual: "",
  colorGrade: "neutral cinematic grade",
  colorGradeManual: "",
  renderFinish: ["deliver in 4K UHD, 24fps master"],
  renderFinishExtra: "",
  subjectConsistency: false,

  lighting: "soft desk lamp + ambient practicals",
  lightingManual: "",
  mood: "calm and focused",
  moodManual: "",
  style: ["photorealistic, ultra-detailed, natural skin texture", "cinematic color grading"],
  styleExtra: "",

  extraEN: "",
  extraJP: "",
});

const cloneState = (state) => JSON.parse(JSON.stringify(state));

const buildEnglishPrompt = (state) => {
  const faceList = mergeMulti(state.face, state.faceExtra);
  const hairList = mergeMulti(state.hairStyle, state.hairExtra);
  const accessories = mergeMulti(
    (state.accessories || []).filter((item) => item && item !== "no accessories"),
    state.accessoriesExtra
  );
  const bgDetails = mergeMulti(state.bgDetails, state.bgDetailsExtra);
  const styleList = mergeMulti(state.style, state.styleExtra);
  const renderFinish = mergeMulti(state.renderFinish, state.renderFinishExtra);
  const cameraMovement = mergeMulti(state.cameraMovement, state.cameraMovementManual);
  const actions = mergeMulti(state.activity, state.activityManual);

  const identityParts = compactSegments([
    pref(state.age, state.ageManual),
    pref(state.gender, state.genderManual),
    pref(state.ethnicity, state.ethnicityManual),
  ]);
  const identity = identityParts.join(" ");
  const hairColor = pref(state.hairColor, state.hairColorManual);
  const makeup = pref(state.makeup, state.makeupManual);
  const eyeColor = pref(state.eyeColor, state.eyeColorManual);
  const fashionVibe = pref(state.fashionVibe, state.fashionVibeManual);
  const background = pref(state.background, state.backgroundManual);
  const lighting = pref(state.lighting, state.lightingManual);
  const mood = pref(state.mood, state.moodManual);
  const colorGrade = pref(state.colorGrade, state.colorGradeManual);
  const shutter = pref(state.shutterSpeed, state.shutterManual);

  const outfitBase = pref(state.dress, state.dressManual)
    ? pref(state.dress, state.dressManual)
    : compactSegments([pref(state.tops, state.topsManual), pref(state.bottoms, state.bottomsManual)]).join(" and ");
  const outer = pref(state.outer, state.outerManual);
  const outfit = compactSegments([outfitBase, outer ? `with ${outer}` : ""]).join(" ");
  const accessoriesText = accessories.length ? `accessorised with ${listToOxford(accessories)}` : "";

  const subjectSegment = compactSegments([
    identity ? `A ${identity}` : "A subject",
    faceList.length ? `featuring ${listToOxford(faceList)}` : "",
    hairList.length ? `hair styled ${listToOxford(hairList)}` : "",
    hairColor ? `${hairColor} hair` : "",
    makeup ? makeup : "",
    eyeColor ? `${eyeColor} eyes` : "",
    outfit ? `wearing ${outfit}` : "",
    accessoriesText,
    fashionVibe ? `overall vibe ${fashionVibe}` : "",
    actions.length ? `performing ${listToOxford(actions)}` : "",
  ]).join(", ");

  const locationSegment = compactSegments([
    background ? `Set in ${background}` : "",
    bgDetails.length ? `featuring ${listToOxford(bgDetails)}` : "",
    state.crowd ? "with background passersby" : "with no background crowd",
  ]).join(", ");

  const shotParts = compactSegments([
    state.shotManual?.trim(),
    [state.shotDistance, state.shotAngle, state.shotStyle].filter(Boolean).join(", "),
  ]);
  const lens = state.lens || `${state.focalLength}mm lens`;
  const aperture = apertureFromDof(state.dofStrength);
  const movementText = cameraMovement.length ? `with ${listToOxford(cameraMovement)}` : "";
  const controlFlags = compactSegments([
    state.staticCamera ? "static locked-off framing" : "",
    state.tripod && !state.staticCamera ? "tripod stabilised" : "",
    state.forbidEyeContact ? "no direct eye contact" : "",
    state.candidMode === "far" ? "documentary candid distance" : "",
    state.candidMode === "close" ? "intimate candid proximity" : "",
  ]);

  const cameraSegment = compactSegments([
    shotParts.length ? `Captured as ${shotParts.join(" / ")}` : "Captured shot",
    `using a ${lens}`,
    movementText,
    `depth of field ${state.dofStrength}/100 (${aperture})`,
    `focus locked on ${state.focusSubject}`,
    shutter ? `shutter ${shutter}` : "",
    controlFlags.length ? `controls: ${listToOxford(controlFlags)}` : "",
    state.subjectConsistency ? "maintain subject continuity across edits" : "",
  ]).join(", ");

  const lightingSegment = lighting ? `Lighting: ${lighting}` : "";
  const moodSegment = compactSegments([
    mood ? `Mood: ${mood}` : "",
    state.candidMode !== "none" ? "keep candid, unposed energy" : "",
  ]).join(", ");

  const qualitySegment = compactSegments([
    styleList.length ? `Visual style: ${listToOxford(styleList)}` : "",
    colorGrade ? `Color grade: ${colorGrade}` : "",
  ]).join(", ");

  const renderSegmentParts = [
    renderFinish.length ? `Render finish: ${listToOxford(renderFinish)}` : "",
    "Strictly photorealistic rendering with natural skin texture, realistic fabric folds, detailed hair strands",
    state.extraEN?.trim() ? `Notes: ${state.extraEN.trim()}` : "",
  ].filter(Boolean);
  const renderSegment = renderSegmentParts.join(". ");

  const segments = compactSegments([
    subjectSegment,
    locationSegment,
    cameraSegment,
    lightingSegment,
    moodSegment,
    qualitySegment,
    renderSegment,
  ]);

  return normalizeEnglish(segments.join(". "));
};

const buildJapanesePrompt = (state) => {
  const faceArr = mergeMulti(state.face.map(findJP), state.faceExtra);
  const hairArr = mergeMulti(state.hairStyle.map(findJP), state.hairExtra);
  const accessories = mergeMulti(
    (state.accessories || []).filter((item) => item && item !== "no accessories").map(findJP),
    state.accessoriesExtra
  );
  const bgArr = mergeMulti(state.bgDetails.map(findJP), state.bgDetailsExtra);
  const styleArr = mergeMulti(state.style.map(findJP), state.styleExtra);
  const renderFinish = mergeMulti(state.renderFinish.map(findJP), state.renderFinishExtra);
  const movementArr = mergeMulti(state.cameraMovement.map(findJP), state.cameraMovementManual);
  const actionArr = mergeMulti(state.activity.map(findJP), state.activityManual && findJP(state.activityManual));

  const age = pref(state.age, state.ageManual);
  const gender = pref(state.gender, state.genderManual);
  const ethnicity = pref(state.ethnicity, state.ethnicityManual);
  const identity = compactSegments([age ? findJP(age) : "", findJP(gender), findJP(ethnicity)]).join("・");
  const hairColor = findJP(pref(state.hairColor, state.hairColorManual));
  const makeup = findJP(pref(state.makeup, state.makeupManual));
  const eyeColor = findJP(pref(state.eyeColor, state.eyeColorManual));
  const fashionVibe = pref(state.fashionVibe, state.fashionVibeManual)
    ? findJP(pref(state.fashionVibe, state.fashionVibeManual))
    : "";
  const background = findJP(pref(state.background, state.backgroundManual));
  const lighting = findJP(pref(state.lighting, state.lightingManual));
  const mood = findJP(pref(state.mood, state.moodManual));
  const colorGrade = findJP(pref(state.colorGrade, state.colorGradeManual));
  const shutter = findJP(pref(state.shutterSpeed, state.shutterManual));

  const outfitBase = pref(state.dress, state.dressManual)
    ? findJP(pref(state.dress, state.dressManual))
    : compactSegments([findJP(pref(state.tops, state.topsManual)), findJP(pref(state.bottoms, state.bottomsManual))]).join("・");
  const outer = pref(state.outer, state.outerManual) ? findJP(pref(state.outer, state.outerManual)) : "";
  const outfit = compactSegments([outfitBase, outer]).join("・");
  const accessoryJP = accessories.length ? `アクセサリー：${accessories.join("、")}` : "";

  const shotParts = compactSegments([
    state.shotManual?.trim(),
    [state.shotDistance, state.shotAngle, state.shotStyle].filter(Boolean).map(findJP).join("、"),
  ]);
  const lensJP = state.lens ? findJP(state.lens) : `${state.focalLength}mm`;
  const aperture = apertureFromDof(state.dofStrength);
  const controlFlags = compactSegments([
    state.staticCamera ? "カメラは完全固定" : "",
    state.tripod && !state.staticCamera ? "三脚で安定" : "",
    state.forbidEyeContact ? "カメラ目線は禁止" : "",
    state.candidMode === "far" ? "遠目からのドキュメンタリー観察" : "",
    state.candidMode === "close" ? "覗き見るような至近距離のスナップ感" : "",
    state.subjectConsistency ? "被写体の一貫性を維持" : "",
  ]).join("、");

  const lines = compactSegments([
    identity ? `${identity}の被写体。顔立ち：${faceArr.join("、")}` : `被写体。顔立ち：${faceArr.join("、")}`,
    `ヘアスタイル：${hairArr.join("、")}。髪色：${hairColor}。メイク：${makeup}。瞳：${eyeColor}。`,
    `服装：${outfit}。${accessoryJP}`,
    fashionVibe ? `ファッションムード：${fashionVibe}。` : "",
    `ロケーション：${background}${bgArr.length ? `、${bgArr.join("、")}` : ""}。${state.crowd ? "背景には通行人がいる" : "背景に人物はいない"}。`,
    actionArr.length ? `被写体のアクション：${actionArr.join("、")}。` : "",
    `カメラ：${shotParts.join("／") || "構図指定"}、${lensJP}、被写界深度${state.dofStrength}/100（${aperture}）、フォーカスは${state.focusSubject}。` +
      (shutter ? `シャッター：${shutter}。` : "") +
      (movementArr.length ? `カメラワーク：${movementArr.join("、")}。` : "") +
      (controlFlags ? `${controlFlags}。` : ""),
    `ライティング：${lighting}。ムード：${mood}${state.candidMode !== "none" ? "。演出感を抑え自然体を保つ" : ""}。`,
    `ビジュアルスタイル：${styleArr.join("、")}。カラーグレーディング：${colorGrade}。`,
    `レンダー仕上げ：${renderFinish.join("、") || "指定なし"}。${state.extraJP?.trim() ? `備考：${state.extraJP.trim()}。` : ""}`,
    "超写実的な肌質と布の皺、髪の束感まで忠実に再現。アニメ調・漫画調の表現は禁止。",
  ]);

  return lines.join("\n");
};

const buildSoraJSON = (state, EN) => {
  const face = mergeMulti(state.face, state.faceExtra);
  const hair = mergeMulti(state.hairStyle, state.hairExtra);
  const accessories = mergeMulti(
    (state.accessories || []).filter((item) => item && item !== "no accessories"),
    state.accessoriesExtra
  );
  const bgDetails = mergeMulti(state.bgDetails, state.bgDetailsExtra);
  const styleArr = mergeMulti(state.style, state.styleExtra);
  const renderFinish = mergeMulti(state.renderFinish, state.renderFinishExtra);
  const cameraMovement = mergeMulti(state.cameraMovement, state.cameraMovementManual);
  const actions = mergeMulti(state.activity, state.activityManual);

  const outfitBase =
    pref(state.dress, state.dressManual) ||
    compactSegments([pref(state.tops, state.topsManual), pref(state.bottoms, state.bottomsManual)]).join(", ");
  const outer = pref(state.outer, state.outerManual);
  const outfit = compactSegments([outfitBase, outer ? `with ${outer}` : ""]).join(" ");

  return {
    prompt: EN,
    details: {
      character: {
        age: pref(state.age, state.ageManual),
        gender: pref(state.gender, state.genderManual),
        ethnicity: pref(state.ethnicity, state.ethnicityManual),
        face,
        hair,
        hair_color: pref(state.hairColor, state.hairColorManual),
        makeup: pref(state.makeup, state.makeupManual),
        eye_color: pref(state.eyeColor, state.eyeColorManual),
        outfit,
        accessories,
        fashion_vibe: pref(state.fashionVibe, state.fashionVibeManual),
      },
      scene: {
        background: pref(state.background, state.backgroundManual),
        background_details: bgDetails,
        crowd: !!state.crowd,
        activity: actions,
      },
      camera: {
        shot: pref([state.shotDistance, state.shotAngle, state.shotStyle].filter(Boolean).join(", "), state.shotManual),
        shot_distance: state.shotDistance,
        shot_angle: state.shotAngle,
        shot_style: state.shotStyle,
        shot_manual: state.shotManual,
        lens: state.lens,
        focal_length_mm: Number(state.focalLength),
        depth_of_field: Number(state.dofStrength),
        aperture: apertureFromDof(state.dofStrength),
        focus_subject: state.focusSubject,
        static_camera: !!state.staticCamera,
        tripod: !!state.tripod,
        forbid_eye_contact: !!state.forbidEyeContact,
        candid_mode: state.candidMode,
        camera_movement: cameraMovement,
        shutter_speed: pref(state.shutterSpeed, state.shutterManual),
      },
      style: {
        lighting: pref(state.lighting, state.lightingManual),
        mood: pref(state.mood, state.moodManual),
        visual_style: styleArr,
        color_grade: pref(state.colorGrade, state.colorGradeManual),
      },
      render: {
        finish: renderFinish,
      },
      controls: {
        subject_consistency: !!state.subjectConsistency,
      },
    },
    metadata: state,
  };
};
const randomPick = (arr) => {
  const pool = Array.isArray(arr) ? arr : [];
  if (pool.length === 0) return "";
  const item = pool[Math.floor(Math.random() * pool.length)];
  return item.en;
};

const randomSubset = (arr, min = 1, max = 2) => {
  const pool = Array.isArray(arr) ? [...arr] : [];
  if (pool.length === 0) return [];
  const boundedMin = Math.max(0, Math.min(min, pool.length));
  const boundedMax = Math.max(boundedMin, Math.min(max, pool.length));
  const count = Math.floor(Math.random() * (boundedMax - boundedMin + 1)) + boundedMin;
  return pool
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((item) => item.en);
};

export default function SoraPromptBuilder({ uiLang = "EN" }) {
  const [state, setState] = useState(defaultState);
  const [lang, setLang] = useState("EN");
  const [showPrompt, setShowPrompt] = useState(true);
  const [presetOpen, setPresetOpen] = useState(false);
  const englishRef = useRef(null);
  const japaneseRef = useRef(null);
  const { toast, highlightKey, copyWithFeedback } = useCopyFeedback(600);

  const EN = useMemo(() => buildEnglishPrompt(state), [state]);
  const JP = useMemo(() => buildJapanesePrompt(state), [state]);
  const soraJSON = useMemo(() => buildSoraJSON(state, EN), [state, EN]);

  const englishHighlighted = highlightKey === "prompt-en";
  const japaneseHighlighted = highlightKey === "prompt-jp";

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(soraJSON, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sora_prompt_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const randomize = () => {
    setState((prev) => {
      const base = defaultState();
      const useDress = Math.random() < 0.5;
      const lens = randomPick(options.cameraLens);
      const lensMM = parseInt(lens.match(/(\d+)/)?.[1] || "50", 10);
      const accessoryPool = options.accessories.filter((opt) => opt.en !== "no accessories");
      return {
        ...base,
        staticCamera: prev.staticCamera,
        tripod: prev.tripod,
        forbidEyeContact: prev.forbidEyeContact,
        candidMode: prev.candidMode,
        subjectConsistency: prev.subjectConsistency,
        age: randomPick(options.age),
        ageManual: "",
        gender: "female",
        genderManual: "",
        ethnicity: randomPick(options.ethnicity),
        ethnicityManual: "",
        face: randomSubset(options.face, 1, 3),
        faceExtra: "",
        hairStyle: randomSubset(options.hairStyle, 1, 3),
        hairExtra: "",
        hairColor: randomPick(options.hairColor),
        hairColorManual: "",
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
        accessories: Math.random() < 0.4 ? [] : randomSubset(accessoryPool, 1, 2),
        accessoriesExtra: "",
        fashionVibe: randomPick(options.fashionVibes),
        fashionVibeManual: "",
        background: randomPick(options.background),
        backgroundManual: "",
        bgDetails: randomSubset(options.bgDetails, 1, 3),
        bgDetailsExtra: "",
        crowd: Math.random() < 0.35,
        activity: randomSubset(options.activity, 1, 2),
        activityManual: "",
        shotDistance: randomPick(options.shotDistance),
        shotAngle: randomPick(options.shotAngle),
        shotStyle: Math.random() < 0.5 ? randomPick(options.shotStyle) : "",
        shotManual: "",
        lens,
        focalLength: lensMM,
        dofStrength: Math.floor(Math.random() * 80) + 10,
        focusSubject: ["eyes", "face", "hands", "book", "subject"][Math.floor(Math.random() * 5)],
        cameraMovement: randomSubset(options.cameraMovement, 1, 2),
        cameraMovementManual: "",
        shutterSpeed: randomPick(options.shutterSpeed),
        shutterManual: "",
        colorGrade: randomPick(options.colorGrade),
        colorGradeManual: "",
        renderFinish: randomSubset(options.renderFinish, 1, 2),
        renderFinishExtra: "",
        lighting: randomPick(options.lighting),
        lightingManual: "",
        mood: randomPick(options.mood),
        moodManual: "",
        style: randomSubset(options.style, 2, 3),
        styleExtra: "",
        extraEN: "",
        extraJP: "",
      };
    });
  };

  const reset = () => setState(defaultState());

  const field = (label, node, hint) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {node}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );

  const multiPills = (values, setValues, pool, { min = 0, max } = {}) => (
    <div className="flex flex-wrap gap-2">
      {pool.map((opt) => {
        const active = values.includes(opt.en);
        const disabled = !active && typeof max === "number" && values.length >= max;
        return (
          <button
            type="button"
            key={opt.en}
            disabled={disabled}
            onClick={() => {
              if (active) {
                setValues(values.filter((v) => v !== opt.en));
              } else if (!disabled) {
                setValues([...values, opt.en]);
              }
            }}
            className={`px-2.5 py-1 rounded-full text-xs border transition ${
              active
                ? "bg-black text-white border-black"
                : disabled
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:border-black"
            }`}
          >
            {uiLang === "JP" ? opt.jp : opt.en}
          </button>
        );
      })}
    </div>
  );

  const copyEnglish = () => {
    const exec = () =>
      copyWithFeedback(EN, {
        element: englishRef,
        label: "English copied",
        failLabel: "Copy failed",
      });
    if (lang !== "EN" && typeof window !== "undefined") {
      setLang("EN");
      window.requestAnimationFrame(exec);
    } else {
      exec();
    }
  };

  const copyJapanese = () => {
    const exec = () =>
      copyWithFeedback(JP, {
        element: japaneseRef,
        label: "日本語コピー",
        failLabel: "コピー失敗",
      });
    if (lang !== "JP" && typeof window !== "undefined") {
      setLang("JP");
      window.requestAnimationFrame(exec);
    } else {
      exec();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-28">
      <PresetManager
        open={presetOpen}
        onClose={() => setPresetOpen(false)}
        storageKey="sora-presets-v2"
        currentState={state}
        onApply={(next) => setState(cloneState(next))}
        transformSave={cloneState}
        transformLoad={cloneState}
        title="Sora Presets"
      />

      <FloatingToast message={toast} />

      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wand2 className="h-5 w-5" />
            <div>
              <h1 className="text-base sm:text-lg font-semibold">Sora Prompt Builder — EN/JP</h1>
              <p className="text-xs text-gray-500">
                Structured slots keep subject → location → camera → light → mood → quality → render order.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={randomize} title="Randomize selections">
              <Shuffle className="h-4 w-4" />
              Random
            </Button>
            <Button variant="subtle" onClick={reset} title="Reset to defaults">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Subject" subtitle="Identity, facial detail, hair, wardrobe, and vibe." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field(
                "Age",
                <div className="space-y-2">
                  <Select
                    value={state.age}
                    onChange={(v) => setState({ ...state, age: v })}
                    options={toSelectOptions(options.age, uiLang)}
                  />
                  <Input
                    value={state.ageManual}
                    onChange={(v) => setState({ ...state, ageManual: v })}
                    placeholder="e.g. early 20s"
                  />
                </div>
              )}
              {field(
                "Gender",
                <div className="space-y-2">
                  <Select
                    value={state.gender}
                    onChange={(v) => setState({ ...state, gender: v })}
                    options={toSelectOptions(options.gender, uiLang)}
                  />
                  <Input
                    value={state.genderManual}
                    onChange={(v) => setState({ ...state, genderManual: v })}
                    placeholder="Custom expression"
                  />
                </div>
              )}
              {field(
                "Ethnicity / Vibe",
                <div className="space-y-2">
                  <Select
                    value={state.ethnicity}
                    onChange={(v) => setState({ ...state, ethnicity: v })}
                    options={toSelectOptions(options.ethnicity, uiLang)}
                  />
                  <Input
                    value={state.ethnicityManual}
                    onChange={(v) => setState({ ...state, ethnicityManual: v })}
                    placeholder="e.g. Japanese-Taiwanese vibe"
                  />
                </div>
              )}
              {field(
                "Face (multi)",
                <div className="space-y-2">
                  {multiPills(state.face, (vals) => setState({ ...state, face: vals }), options.face, { max: 4 })}
                  <Input
                    value={state.faceExtra}
                    onChange={(v) => setState({ ...state, faceExtra: v })}
                    placeholder="Manual descriptors"
                  />
                </div>,
                "Freckles, dimples, beauty marks, bone structure."
              )}
              {field(
                "Hair (multi)",
                <div className="space-y-2">
                  {multiPills(state.hairStyle, (vals) => setState({ ...state, hairStyle: vals }), options.hairStyle, { max: 4 })}
                  <Input
                    value={state.hairExtra}
                    onChange={(v) => setState({ ...state, hairExtra: v })}
                    placeholder="Manual hair notes"
                  />
                </div>
              )}
              {field(
                "Hair color",
                <div className="space-y-2">
                  <Select
                    value={state.hairColor}
                    onChange={(v) => setState({ ...state, hairColor: v })}
                    options={toSelectOptions(options.hairColor, uiLang)}
                  />
                  <Input
                    value={state.hairColorManual}
                    onChange={(v) => setState({ ...state, hairColorManual: v })}
                    placeholder="e.g. honey brown ombré"
                  />
                </div>
              )}
              {field(
                "Makeup",
                <div className="space-y-2">
                  <Select
                    value={state.makeup}
                    onChange={(v) => setState({ ...state, makeup: v })}
                    options={toSelectOptions(options.makeup, uiLang)}
                  />
                  <Input
                    value={state.makeupManual}
                    onChange={(v) => setState({ ...state, makeupManual: v })}
                    placeholder="e.g. soft matte skin, glossy lip"
                  />
                </div>
              )}
              {field(
                "Eye color",
                <div className="space-y-2">
                  <Select
                    value={state.eyeColor}
                    onChange={(v) => setState({ ...state, eyeColor: v })}
                    options={toSelectOptions(options.eyeColor, uiLang)}
                  />
                  <Input
                    value={state.eyeColorManual}
                    onChange={(v) => setState({ ...state, eyeColorManual: v })}
                    placeholder="e.g. warm hazel"
                  />
                </div>
              )}
              {field(
                "Outfit",
                <div className="space-y-2">
                  <Input
                    value={state.dress}
                    onChange={(v) => setState({ ...state, dress: v })}
                    placeholder="Dress (optional)"
                  />
                  <Input
                    value={state.tops}
                    onChange={(v) => setState({ ...state, tops: v })}
                    placeholder="Top"
                  />
                  <Input
                    value={state.bottoms}
                    onChange={(v) => setState({ ...state, bottoms: v })}
                    placeholder="Bottom"
                  />
                  <Input
                    value={state.outer}
                    onChange={(v) => setState({ ...state, outer: v })}
                    placeholder="Outerwear"
                  />
                </div>,
                "Populate dress OR top/bottom + optional outer."
              )}
              {field(
                "Accessories",
                <div className="space-y-2">
                  {multiPills(state.accessories, (vals) => setState({ ...state, accessories: vals }), options.accessories, {
                    max: 3,
                  })}
                  <Input
                    value={state.accessoriesExtra}
                    onChange={(v) => setState({ ...state, accessoriesExtra: v })}
                    placeholder="Manual accessories"
                  />
                </div>
              )}
              {field(
                "Fashion vibe",
                <div className="space-y-2">
                  <Select
                    value={state.fashionVibe}
                    onChange={(v) => setState({ ...state, fashionVibe: v })}
                    options={toSelectOptions(options.fashionVibes, uiLang)}
                  />
                  <Input
                    value={state.fashionVibeManual}
                    onChange={(v) => setState({ ...state, fashionVibeManual: v })}
                    placeholder="Manual vibe"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Location" subtitle="Background, details, and crowd control." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field(
                "Backdrop",
                <div className="space-y-2">
                  <Select
                    value={state.background}
                    onChange={(v) => setState({ ...state, background: v })}
                    options={toSelectOptions(options.background, uiLang)}
                  />
                  <Input
                    value={state.backgroundManual}
                    onChange={(v) => setState({ ...state, backgroundManual: v })}
                    placeholder="Manual location"
                  />
                </div>
              )}
              {field(
                "Background details",
                <div className="space-y-2">
                  {multiPills(state.bgDetails, (vals) => setState({ ...state, bgDetails: vals }), options.bgDetails, {
                    max: 4,
                  })}
                  <Input
                    value={state.bgDetailsExtra}
                    onChange={(v) => setState({ ...state, bgDetailsExtra: v })}
                    placeholder="Manual props"
                  />
                </div>
              )}
              <div className="flex items-end">
                <Toggle
                  checked={state.crowd}
                  onChange={(v) => setState({ ...state, crowd: v })}
                  label="Include background passersby"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Action & Movement" subtitle="Subject action plus dedicated camera movement slot." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field(
                "Subject action",
                <div className="space-y-2">
                  {multiPills(state.activity, (vals) => setState({ ...state, activity: vals }), options.activity, { max: 3 })}
                  <Input
                    value={state.activityManual}
                    onChange={(v) => setState({ ...state, activityManual: v })}
                    placeholder="Manual action"
                  />
                </div>,
                "Keep motion verbs consistent for video clips."
              )}
              {field(
                "Camera movement",
                <div className="space-y-2">
                  {multiPills(
                    state.cameraMovement,
                    (vals) => setState({ ...state, cameraMovement: vals }),
                    options.cameraMovement,
                    { max: 2 }
                  )}
                  <Input
                    value={state.cameraMovementManual}
                    onChange={(v) => setState({ ...state, cameraMovementManual: v })}
                    placeholder="Manual move notes"
                  />
                </div>,
                "Separate from subject action for clarity."
              )}
              <div className="flex flex-col gap-3">
                <Toggle
                  checked={state.staticCamera}
                  onChange={(v) => setState({ ...state, staticCamera: v })}
                  label="Static locked camera"
                />
                <Toggle
                  checked={state.tripod}
                  onChange={(v) => setState({ ...state, tripod: v })}
                  label="Tripod stabilised"
                />
                <Toggle
                  checked={state.forbidEyeContact}
                  onChange={(v) => setState({ ...state, forbidEyeContact: v })}
                  label={
                    <span className="inline-flex items-center gap-1">
                      <EyeOff className="h-3.5 w-3.5" />
                      Forbid direct eye contact
                    </span>
                  }
                />
              </div>
              {field(
                "Candid mode",
                <Select
                  value={state.candidMode}
                  onChange={(v) => setState({ ...state, candidMode: v })}
                  options={[
                    { value: "none", label: "none" },
                    { value: "far", label: "far documentary" },
                    { value: "close", label: "close proximity" },
                  ]}
                />,
                "Document how aware the subject feels."
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Camera"
              subtitle="Shot, lens, depth of field, and shutter"
              right={<CameraOff className="h-5 w-5 text-gray-500" />}
            />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field(
                "Shot composition",
                <div className="space-y-2">
                  <Select
                    value={state.shotDistance}
                    onChange={(v) => setState({ ...state, shotDistance: v })}
                    options={toSelectOptions(options.shotDistance, uiLang)}
                  />
                  <Select
                    value={state.shotAngle}
                    onChange={(v) => setState({ ...state, shotAngle: v })}
                    options={toSelectOptions(options.shotAngle, uiLang)}
                  />
                  <Select
                    value={state.shotStyle}
                    onChange={(v) => setState({ ...state, shotStyle: v })}
                    options={toSelectOptions(options.shotStyle, uiLang)}
                  />
                  <Input
                    value={state.shotManual}
                    onChange={(v) => setState({ ...state, shotManual: v })}
                    placeholder="Manual shot notes"
                  />
                </div>
              )}
              {field(
                "Lens",
                <Select
                  value={state.lens}
                  onChange={(v) => {
                    const mm = parseInt(v.match(/(\d+)/)?.[1] || state.focalLength, 10);
                    setState({ ...state, lens: v, focalLength: mm });
                  }}
                  options={toSelectOptions(options.cameraLens, uiLang)}
                />
              )}
              {field(
                "Focal length (mm)",
                <Input
                  type="number"
                  value={state.focalLength}
                  onChange={(v) => setState({ ...state, focalLength: v })}
                  min={8}
                  max={200}
                  step={1}
                />,
                "Typical portrait: 50-85mm"
              )}
              {field(
                "Depth of field (0-100)",
                <Input
                  type="number"
                  value={state.dofStrength}
                  onChange={(v) => setState({ ...state, dofStrength: Math.max(0, Math.min(100, v)) })}
                  min={0}
                  max={100}
                  step={1}
                />,
                "Higher values = deeper focus"
              )}
              {field(
                "Focus subject",
                <Input
                  value={state.focusSubject}
                  onChange={(v) => setState({ ...state, focusSubject: v })}
                  placeholder="e.g. eyes / hands / object"
                />
              )}
              {field(
                "Shutter",
                <div className="space-y-2">
                  <Select
                    value={state.shutterSpeed}
                    onChange={(v) => setState({ ...state, shutterSpeed: v })}
                    options={toSelectOptions(options.shutterSpeed, uiLang)}
                  />
                  <Input
                    value={state.shutterManual}
                    onChange={(v) => setState({ ...state, shutterManual: v })}
                    placeholder="Manual shutter notes"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Lighting & Mood" subtitle="Light design and emotional tone." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field(
                "Lighting",
                <div className="space-y-2">
                  <Select
                    value={state.lighting}
                    onChange={(v) => setState({ ...state, lighting: v })}
                    options={toSelectOptions(options.lighting, uiLang)}
                  />
                  <Input
                    value={state.lightingManual}
                    onChange={(v) => setState({ ...state, lightingManual: v })}
                    placeholder="Manual lighting"
                  />
                </div>
              )}
              {field(
                "Mood",
                <div className="space-y-2">
                  <Select
                    value={state.mood}
                    onChange={(v) => setState({ ...state, mood: v })}
                    options={toSelectOptions(options.mood, uiLang)}
                  />
                  <Input
                    value={state.moodManual}
                    onChange={(v) => setState({ ...state, moodManual: v })}
                    placeholder="Manual mood"
                  />
                </div>
              )}
              {field(
                "Color grade",
                <div className="space-y-2">
                  <Select
                    value={state.colorGrade}
                    onChange={(v) => setState({ ...state, colorGrade: v })}
                    options={toSelectOptions(options.colorGrade, uiLang)}
                  />
                  <Input
                    value={state.colorGradeManual}
                    onChange={(v) => setState({ ...state, colorGradeManual: v })}
                    placeholder="Manual grade"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Style & Render" subtitle="Visual treatments, render finish, and consistency toggle." />
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {field(
                "Style",
                <div className="space-y-2">
                  {multiPills(state.style, (vals) => setState({ ...state, style: vals }), options.style, { max: 4 })}
                  <Input
                    value={state.styleExtra}
                    onChange={(v) => setState({ ...state, styleExtra: v })}
                    placeholder="Manual style"
                  />
                </div>
              )}
              {field(
                "Render finish",
                <div className="space-y-2">
                  {multiPills(
                    state.renderFinish,
                    (vals) => setState({ ...state, renderFinish: vals }),
                    options.renderFinish,
                    { max: 3 }
                  )}
                  <Input
                    value={state.renderFinishExtra}
                    onChange={(v) => setState({ ...state, renderFinishExtra: v })}
                    placeholder="Manual render notes"
                  />
                </div>
              )}
              <div className="flex items-end">
                <Toggle
                  checked={state.subjectConsistency}
                  onChange={(v) => setState({ ...state, subjectConsistency: v })}
                  label="Maintain subject consistency (remix safe)"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Notes" subtitle="Free-form additions." />
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <Textarea
                value={state.extraEN}
                onChange={(v) => setState({ ...state, extraEN: v })}
                placeholder="Extra English notes"
                rows={4}
              />
              <Textarea
                value={state.extraJP}
                onChange={(v) => setState({ ...state, extraJP: v })}
                placeholder="日本語での追記"
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {showPrompt ? (
            <Card>
              <CardHeader
                title={lang === "EN" ? "English Prompt" : "日本語プロンプト"}
                subtitle="Auto-optimised grammar & slot order"
                right={
                  <div className="flex items-center gap-2">
                    <Button variant={lang === "EN" ? "default" : "subtle"} onClick={() => setLang("EN")}>
                      EN
                    </Button>
                    <Button variant={lang === "JP" ? "default" : "subtle"} onClick={() => setLang("JP")}>
                      JP
                    </Button>
                    <Button variant="ghost" onClick={() => setShowPrompt(false)} title="Hide prompt panel">
                      Hide
                    </Button>
                  </div>
                }
              />
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                  <div>Aperture ≈ {apertureFromDof(state.dofStrength)} (DoF {state.dofStrength})</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        copyWithFeedback(JSON.stringify(soraJSON, null, 2), {
                          label: "JSON copied",
                        })
                      }
                      title="Copy JSON"
                    >
                      <Copy className="h-4 w-4" /> JSON
                    </Button>
                    <Button variant="ghost" onClick={exportJSON} title="Export JSON">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="relative space-y-0">
                  <Textarea
                    value={EN}
                    onChange={() => {}}
                    readOnly
                    rows={14}
                    inputRef={englishRef}
                    highlight={englishHighlighted && lang === "EN"}
                    highlightKey="prompt-en"
                    className={`font-mono transition-opacity ${
                      lang === "EN" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
                    }`}
                  />
                  <Textarea
                    value={JP}
                    onChange={() => {}}
                    readOnly
                    rows={16}
                    inputRef={japaneseRef}
                    highlight={japaneseHighlighted && lang === "JP"}
                    highlightKey="prompt-jp"
                    className={`font-mono transition-opacity ${
                      lang === "JP" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button variant="subtle" onClick={() => setShowPrompt(true)}>
              Show prompt panel
            </Button>
          )}
        </div>
      </main>

      <ActionBar>
        <Button onClick={copyEnglish}>
          <Copy className="h-4 w-4" /> EN
        </Button>
        <Button onClick={copyJapanese}>
          <Languages className="h-4 w-4" /> JP
        </Button>
        <Button variant="subtle" onClick={() => setPresetOpen(true)}>
          <Layers className="h-4 w-4" /> Presets
        </Button>
        <Button variant="subtle" onClick={reset}>
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
        <Button variant="subtle" onClick={randomize}>
          <Shuffle className="h-4 w-4" /> Random
        </Button>
      </ActionBar>
    </div>
  );
}
