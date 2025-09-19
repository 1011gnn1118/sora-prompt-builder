import React, { useMemo, useRef, useState } from "react";
import {
  Copy,
  Shuffle,
  RotateCcw,
  Download,
  Languages,
  Wand2,
  Layers,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Select,
  Textarea,
  Input,
  ActionBar,
  FloatingToast,
} from "./components/ui";
import PresetManager from "./components/PresetManager.jsx";
import { animeOptions, toSelectOptions, findJP } from "./data/animeOptions";
import { useCopyFeedback } from "./hooks/useCopyFeedback.js";
import { listToOxford, normalizeEnglish, compactSegments } from "./utils/text.js";

const mergeMulti = (list = [], extra) => {
  const arr = Array.isArray(list) ? list.filter(Boolean) : [];
  const extraStr = extra && String(extra).trim();
  if (extraStr) arr.push(extraStr);
  return arr.filter(Boolean);
};

const defaultState = () => ({
  characterType: "cheerful and energetic girl",
  hairColor: "blonde",
  hairStyle: "long straight",
  eyeColor: "blue",
  expression: "smiling",
  pose: "smiling and waving hand",
  fashion: "sailor-inspired outfit",
  background: "after school classroom",
  mood: "romantic atmosphere",
  genre: "shōnen (action, friendship, rivalry, coming-of-age)",
  details: "sparkling eyes",
  shotDistance: "Medium Shot (MS)",
  shotAngle: "",
  shotStyle: "",
  style: "anime style",
  cameraMovement: "static anime cut",
  shutterSpeed: "1/60s (anime crisp)",
  colorGrade: "neutral anime grade",
  renderFinish: ["4K clean line art render"],
  renderFinishExtra: "",
  subjectConsistency: false,
  extraEN: "",
  extraJP: "",
});

const cloneState = (state) => JSON.parse(JSON.stringify(state));

const buildEN = (state) => {
  const renderFinish = mergeMulti(state.renderFinish, state.renderFinishExtra);
  const subjectSegment = `Detailed illustration of a ${state.characterType} with ${state.hairColor} ${state.hairStyle} hair, ${state.eyeColor} eyes, ${state.expression} expression, posing as ${state.pose}, wearing ${state.fashion}.`;
  const sceneSegment = `Set in ${state.background} with a ${state.mood} mood, within a ${state.genre} tone, featuring ${state.details}.`;
  const cameraParts = compactSegments([
    [state.shotDistance, state.shotAngle, state.shotStyle].filter(Boolean).join(", "),
    state.cameraMovement,
    `shutter ${state.shutterSpeed}`,
  ]);
  const cameraSegment = cameraParts.length ? `Camera: ${cameraParts.join(", ")}.` : "";
  const styleSegment = `Visual style: ${state.style}. Color grade: ${state.colorGrade}.`;
  const renderSegmentParts = compactSegments([
    renderFinish.length ? `Render finish: ${listToOxford(renderFinish)}` : "",
    state.subjectConsistency ? "Maintain subject continuity across frames" : "",
    state.extraEN?.trim() ? `Notes: ${state.extraEN.trim()}` : "",
  ]);
  const renderSegment = renderSegmentParts.join(". ");

  return normalizeEnglish(
    compactSegments([subjectSegment, sceneSegment, cameraSegment, styleSegment, renderSegment]).join(" ")
  );
};

const buildJP = (state) => {
  const renderFinish = mergeMulti(state.renderFinish.map(findJP), state.renderFinishExtra);
  const lines = compactSegments([
    `${findJP(state.characterType)}。髪は${findJP(state.hairColor)}の${findJP(state.hairStyle)}、瞳は${findJP(state.eyeColor)}、表情は${findJP(state.expression)}。ポーズ：${findJP(state.pose)}。衣装：${findJP(state.fashion)}。`,
    `背景：${findJP(state.background)}。ムード：${findJP(state.mood)}。ジャンル：${findJP(state.genre)}。ディテール：${findJP(state.details)}。`,
    `カメラ：${[state.shotDistance, state.shotAngle, state.shotStyle].filter(Boolean).map(findJP).join("、")}、カメラワーク：${findJP(state.cameraMovement)}、シャッター：${findJP(state.shutterSpeed)}。`,
    `スタイル：${findJP(state.style)}。カラーグレーディング：${findJP(state.colorGrade)}。`,
    `レンダー仕上げ：${renderFinish.join("、") || "指定なし"}。${state.subjectConsistency ? "被写体の一貫性を保持。" : ""}${
      state.extraJP?.trim() ? `備考：${state.extraJP.trim()}。` : ""
    }`,
  ]);
  return lines.join("\n");
};

const buildAnimeJSON = (state, EN) => {
  const renderFinish = mergeMulti(state.renderFinish, state.renderFinishExtra);
  return {
    prompt: EN,
    details: {
      character: {
        type: state.characterType,
        hair_color: state.hairColor,
        hair_style: state.hairStyle,
        eye_color: state.eyeColor,
        expression: state.expression,
        pose: state.pose,
        fashion: state.fashion,
        details: state.details,
      },
      scene: {
        background: state.background,
        mood: state.mood,
        genre: state.genre,
      },
      camera: {
        shot_distance: state.shotDistance,
        shot_angle: state.shotAngle,
        shot_style: state.shotStyle,
        camera_movement: state.cameraMovement,
        shutter_speed: state.shutterSpeed,
      },
      style: {
        visual_style: state.style,
        color_grade: state.colorGrade,
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
  return pool[Math.floor(Math.random() * pool.length)].en;
};

export default function AnimePromptBuilder({ uiLang = "EN" }) {
  const [state, setState] = useState(defaultState);
  const [lang, setLang] = useState("EN");
  const [presetOpen, setPresetOpen] = useState(false);
  const englishRef = useRef(null);
  const japaneseRef = useRef(null);
  const { toast, highlightKey, copyWithFeedback } = useCopyFeedback(600);

  const EN = useMemo(() => buildEN(state), [state]);
  const JP = useMemo(() => buildJP(state), [state]);
  const animeJSON = useMemo(() => buildAnimeJSON(state, EN), [state, EN]);
  const englishHighlighted = highlightKey === "anime-en";
  const japaneseHighlighted = highlightKey === "anime-jp";

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(animeJSON, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anime_prompt_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const randomize = () => {
    setState((prev) => {
      const base = defaultState();
      return {
        ...base,
        characterType: randomPick(animeOptions.characterType),
        hairColor: randomPick(animeOptions.hairColor),
        hairStyle: randomPick(animeOptions.hairStyle),
        eyeColor: randomPick(animeOptions.eyeColor),
        expression: randomPick(animeOptions.expression),
        pose: randomPick(animeOptions.pose),
        fashion: randomPick(animeOptions.fashion),
        background: randomPick(animeOptions.background),
        mood: randomPick(animeOptions.mood),
        genre: randomPick(animeOptions.genre),
        details: randomPick(animeOptions.details),
        shotDistance: randomPick(animeOptions.shotDistance),
        shotAngle: randomPick(animeOptions.shotAngle),
        shotStyle: Math.random() < 0.5 ? randomPick(animeOptions.shotStyle) : "",
        style: randomPick(animeOptions.style),
        cameraMovement: randomPick(animeOptions.cameraMovement),
        shutterSpeed: randomPick(animeOptions.shutterSpeed),
        colorGrade: randomPick(animeOptions.colorGrade),
        renderFinish: [randomPick(animeOptions.renderFinish)],
        subjectConsistency: prev.subjectConsistency,
        extraEN: "",
        extraJP: "",
      };
    });
  };

  const reset = () => setState(defaultState());

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
        storageKey="anime-presets-v2"
        currentState={state}
        onApply={(next) => setState(cloneState(next))}
        transformSave={cloneState}
        transformLoad={cloneState}
        title="Anime Presets"
      />

      <FloatingToast message={toast} />

      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wand2 className="h-5 w-5" />
            <div>
              <h1 className="text-base sm:text-lg font-semibold">Anime Prompt Builder — EN/JP</h1>
              <p className="text-xs text-gray-500">Slot-structured EN prompt keeps translation stable.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={randomize} title="Randomize anime prompt">
              <Shuffle className="h-4 w-4" /> Random
            </Button>
            <Button variant="subtle" onClick={reset} title="Reset to defaults">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Character" subtitle="Core description for the hero or heroine." />
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Character type</label>
                <Select
                  value={state.characterType}
                  onChange={(v) => setState({ ...state, characterType: v })}
                  options={toSelectOptions(animeOptions.characterType, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Hair color</label>
                <Select
                  value={state.hairColor}
                  onChange={(v) => setState({ ...state, hairColor: v })}
                  options={toSelectOptions(animeOptions.hairColor, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Hair style</label>
                <Select
                  value={state.hairStyle}
                  onChange={(v) => setState({ ...state, hairStyle: v })}
                  options={toSelectOptions(animeOptions.hairStyle, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Eye color</label>
                <Select
                  value={state.eyeColor}
                  onChange={(v) => setState({ ...state, eyeColor: v })}
                  options={toSelectOptions(animeOptions.eyeColor, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Expression</label>
                <Select
                  value={state.expression}
                  onChange={(v) => setState({ ...state, expression: v })}
                  options={toSelectOptions(animeOptions.expression, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Pose</label>
                <Select
                  value={state.pose}
                  onChange={(v) => setState({ ...state, pose: v })}
                  options={toSelectOptions(animeOptions.pose, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Fashion</label>
                <Select
                  value={state.fashion}
                  onChange={(v) => setState({ ...state, fashion: v })}
                  options={toSelectOptions(animeOptions.fashion, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Special details</label>
                <Select
                  value={state.details}
                  onChange={(v) => setState({ ...state, details: v })}
                  options={toSelectOptions(animeOptions.details, uiLang)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Scene & Mood" subtitle="Background, tone, and movement." />
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Background</label>
                <Select
                  value={state.background}
                  onChange={(v) => setState({ ...state, background: v })}
                  options={toSelectOptions(animeOptions.background, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Mood</label>
                <Select
                  value={state.mood}
                  onChange={(v) => setState({ ...state, mood: v })}
                  options={toSelectOptions(animeOptions.mood, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Genre</label>
                <Select
                  value={state.genre}
                  onChange={(v) => setState({ ...state, genre: v })}
                  options={toSelectOptions(animeOptions.genre, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Camera movement</label>
                <Select
                  value={state.cameraMovement}
                  onChange={(v) => setState({ ...state, cameraMovement: v })}
                  options={toSelectOptions(animeOptions.cameraMovement, uiLang)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Camera" subtitle="Shot selection and shutter." />
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Shot distance</label>
                <Select
                  value={state.shotDistance}
                  onChange={(v) => setState({ ...state, shotDistance: v })}
                  options={toSelectOptions(animeOptions.shotDistance, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Shot angle</label>
                <Select
                  value={state.shotAngle}
                  onChange={(v) => setState({ ...state, shotAngle: v })}
                  options={toSelectOptions(animeOptions.shotAngle, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Shot style</label>
                <Select
                  value={state.shotStyle}
                  onChange={(v) => setState({ ...state, shotStyle: v })}
                  options={toSelectOptions(animeOptions.shotStyle, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Shutter</label>
                <Select
                  value={state.shutterSpeed}
                  onChange={(v) => setState({ ...state, shutterSpeed: v })}
                  options={toSelectOptions(animeOptions.shutterSpeed, uiLang)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Style & Render" subtitle="Visual finish and consistency toggle." />
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Visual style</label>
                <Select
                  value={state.style}
                  onChange={(v) => setState({ ...state, style: v })}
                  options={toSelectOptions(animeOptions.style, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Color grade</label>
                <Select
                  value={state.colorGrade}
                  onChange={(v) => setState({ ...state, colorGrade: v })}
                  options={toSelectOptions(animeOptions.colorGrade, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Render finish</label>
                <Select
                  value={state.renderFinish[0]}
                  onChange={(v) => setState({ ...state, renderFinish: [v] })}
                  options={toSelectOptions(animeOptions.renderFinish, uiLang)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Extra render notes</label>
                <Input
                  value={state.renderFinishExtra}
                  onChange={(v) => setState({ ...state, renderFinishExtra: v })}
                  placeholder="e.g. add subtle grain"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-600">Subject consistency</label>
                <div className="mt-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 mr-2"
                    checked={state.subjectConsistency}
                    onChange={(e) => setState({ ...state, subjectConsistency: e.target.checked })}
                  />
                  <span className="text-sm">Keep subject identity consistent for remix clips</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Notes" subtitle="Optional extra notes." />
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <Textarea
                value={state.extraEN}
                onChange={(v) => setState({ ...state, extraEN: v })}
                placeholder="Extra English notes"
                rows={3}
              />
              <Textarea
                value={state.extraJP}
                onChange={(v) => setState({ ...state, extraJP: v })}
                placeholder="日本語での補足"
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title={lang === "EN" ? "English Prompt" : "日本語プロンプト"}
              subtitle="Optimised order for Sora"
              right={
                <div className="flex items-center gap-2">
                  <Button variant={lang === "EN" ? "default" : "subtle"} onClick={() => setLang("EN")}>
                    EN
                  </Button>
                  <Button variant={lang === "JP" ? "default" : "subtle"} onClick={() => setLang("JP")}>
                    JP
                  </Button>
                </div>
              }
            />
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                <div>Order: subject → scene → camera → style → render</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => copyWithFeedback(JSON.stringify(animeJSON, null, 2), { label: "JSON copied" })}
                    title="Copy JSON"
                  >
                    <Copy className="h-4 w-4" /> JSON
                  </Button>
                  <Button variant="ghost" onClick={exportJSON} title="Export JSON">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Textarea
                  value={EN}
                  onChange={() => {}}
                  readOnly
                  rows={12}
                  inputRef={englishRef}
                  highlight={englishHighlighted && lang === "EN"}
                  highlightKey="anime-en"
                  className={`font-mono transition-opacity ${
                    lang === "EN" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
                  }`}
                />
                <Textarea
                  value={JP}
                  onChange={() => {}}
                  readOnly
                  rows={14}
                  inputRef={japaneseRef}
                  highlight={japaneseHighlighted && lang === "JP"}
                  highlightKey="anime-jp"
                  className={`font-mono transition-opacity ${
                    lang === "JP" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
                  }`}
                />
              </div>
            </CardContent>
          </Card>
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
