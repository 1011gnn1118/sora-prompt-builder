import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardContent, Button, Select, Textarea } from "./components/ui";
import { animeOptions, toSelectOptions, findJP } from "./data/animeOptions";
import { Copy, Shuffle, RotateCcw, Wand2, Languages, Download } from "lucide-react";

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

const defaultState = {
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
  cameraAngle: "front view",
  zoom: "full body",
  style: "anime style",
};

function buildEN(state) {
  const parts = [
    `Detailed illustration of a ${state.characterType} with ${state.hairColor} ${state.hairStyle} hair and ${state.eyeColor} eyes`,
    `${state.expression} expression`,
    `${state.pose}`,
    `wearing ${state.fashion}`,
    `background: ${state.background}`,
    `mood: ${state.mood}`,
    `genre: ${state.genre}`,
    `${state.details}`,
    `camera angle: ${state.cameraAngle}`,
    `zoom: ${state.zoom}`,
    `style: ${state.style}`,
  ];
  return parts.join(", ");
}

function buildJP(state) {
  const parts = [
    `美少女アニメのイラスト`,
    `${findJP(state.characterType)}`,
    `髪は${findJP(state.hairColor)}の${findJP(state.hairStyle)}`,
    `瞳は${findJP(state.eyeColor)}`,
    `${findJP(state.expression)}表情`,
    `${findJP(state.pose)}`,
    `${findJP(state.fashion)}`,
    `背景:${findJP(state.background)}`,
    `雰囲気:${findJP(state.mood)}`,
    `ジャンル:${findJP(state.genre)}`,
    `${findJP(state.details)}`,
    `カメラアングル:${findJP(state.cameraAngle)}`,
    `ズーム:${findJP(state.zoom)}`,
    `スタイル:${findJP(state.style)}`,
  ];
  return parts.join("、");
}

function buildAnimeJSON(state, EN) {
  const details = {
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
      angle: state.cameraAngle,
      zoom: state.zoom,
    },
    style: {
      visual_style: state.style,
    },
  };

  return {
    prompt: EN,
    details,
    metadata: state,
  };
}

export default function AnimePromptBuilder({ uiLang = "EN" }) {
  const [state, setState] = useState(defaultState);
  const { copy } = useClipboard();

  const [lang, setLang] = useState("EN");
  const [showPrompt, setShowPrompt] = useState(false);

  const EN = useMemo(() => buildEN(state), [state]);
  const JP = useMemo(() => buildJP(state), [state]);

  const exportJSON = () => {
    const animeReady = buildAnimeJSON(state, EN);
    const blob = new Blob([JSON.stringify(animeReady, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anime_prompt_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)].en;
  }

  const randomize = () => {
    setState({
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
      cameraAngle: randomPick(animeOptions.cameraAngle),
      zoom: randomPick(animeOptions.zoom),
      style: randomPick(animeOptions.style),
    });
  };

  const reset = () => setState(defaultState);

  const field = (label, node) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {node}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wand2 className="h-5 w-5" />
            <h1 className="text-base sm:text-lg font-semibold">Anime Prompt Builder — EN/JP</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={randomize} title="Randomize"><Shuffle className="h-4 w-4" />Random</Button>
            <Button variant="subtle" onClick={reset} title="Reset"><RotateCcw className="h-4 w-4" />Reset</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 pb-32 grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader title="Character" />
              <CardContent className="space-y-3">
                {field("Character Type", (
                  <Select
                    value={state.characterType}
                    onChange={(v) => setState({ ...state, characterType: v })}
                    options={toSelectOptions(animeOptions.characterType, uiLang)}
                    allowCustom
                  />
                ))}
                {field("Hair Color", (
                  <Select
                    value={state.hairColor}
                    onChange={(v) => setState({ ...state, hairColor: v })}
                    options={toSelectOptions(animeOptions.hairColor, uiLang)}
                    allowCustom
                  />
                ))}
                {field("Hair Style", (
                  <Select
                    value={state.hairStyle}
                    onChange={(v) => setState({ ...state, hairStyle: v })}
                    options={toSelectOptions(animeOptions.hairStyle, uiLang)}
                    allowCustom
                  />
                ))}
                {field("Eye Color", (
                  <Select
                    value={state.eyeColor}
                    onChange={(v) => setState({ ...state, eyeColor: v })}
                    options={toSelectOptions(animeOptions.eyeColor, uiLang)}
                    allowCustom
                  />
                ))}
                {field("Expression", (
                  <Select
                    value={state.expression}
                    onChange={(v) => setState({ ...state, expression: v })}
                    options={toSelectOptions(animeOptions.expression, uiLang)}
                    allowCustom
                  />
                ))}
                {field("Pose", (
                  <Select
                    value={state.pose}
                    onChange={(v) => setState({ ...state, pose: v })}
                    options={toSelectOptions(animeOptions.pose, uiLang)}
                    allowCustom
                  />
                ))}
                {field("Fashion", (
                  <Select
                    value={state.fashion}
                    onChange={(v) => setState({ ...state, fashion: v })}
                    options={toSelectOptions(animeOptions.fashion, uiLang)}
                    allowCustom
                  />
                ))}
                {field("Details", (
                  <Select
                    value={state.details}
                    onChange={(v) => setState({ ...state, details: v })}
                    options={toSelectOptions(animeOptions.details, uiLang)}
                    allowCustom
                  />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Scene" />
              <CardContent className="space-y-3">
                {field("Background", (
                  <Select
                    value={state.background}
                    onChange={(v) => setState({ ...state, background: v })}
                    options={toSelectOptions(animeOptions.background, uiLang)}
                    allowCustom
                  />
                ))}
                {field("Mood", (
                  <Select
                    value={state.mood}
                    onChange={(v) => setState({ ...state, mood: v })}
                    options={toSelectOptions(animeOptions.mood, uiLang)}
                    allowCustom
                  />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Genre" />
              <CardContent className="space-y-3">
                {field("Genre", (
                  <Select
                    value={state.genre}
                    onChange={(v) => setState({ ...state, genre: v })}
                    options={toSelectOptions(animeOptions.genre, uiLang)}
                    allowCustom
                  />
                ))}
                {field("Style", (
                  <Select
                    value={state.style}
                    onChange={(v) => setState({ ...state, style: v })}
                    options={toSelectOptions(animeOptions.style, uiLang)}
                    allowCustom
                  />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Camera" />
              <CardContent className="space-y-3">
                {field("Camera Angle", (
                  <Select
                    value={state.cameraAngle}
                    onChange={(v) => setState({ ...state, cameraAngle: v })}
                    options={toSelectOptions(animeOptions.cameraAngle, uiLang)}
                    allowCustom
                  />
                ))}
                {field("Zoom", (
                  <Select
                    value={state.zoom}
                    onChange={(v) => setState({ ...state, zoom: v })}
                    options={toSelectOptions(animeOptions.zoom, uiLang)}
                    allowCustom
                  />
                ))}
              </CardContent>
            </Card>
          </div>

        <div className="space-y-6">
          {showPrompt && (
            <Card className="fixed bottom-16 left-0 right-0 bg-white z-10">
              <CardHeader
                title={lang === "EN" ? "English Prompt" : "日本語プロンプト"}
                right={
                  <div className="flex gap-2">
                    <Button variant={lang === "EN" ? "default" : "subtle"} onClick={() => setLang("EN")}>
                      EN
                    </Button>
                    <Button variant={lang === "JP" ? "default" : "subtle"} onClick={() => setLang("JP")}>
                      JP
                    </Button>
                  </div>
                }
              />
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  {lang === "EN" ? (
                    <div className="text-xs text-gray-500">English prompt</div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Languages className="h-4 w-4" />内蔵変換 (機械翻訳API不使用)
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        copy(
                          JSON.stringify(buildAnimeJSON(state, EN), null, 2)
                        )
                      }
                      title="Copy JSON"
                    >
                      <Copy className="h-4 w-4" />
                      {lang === "EN" ? "Copy JSON" : "JSONコピー"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={exportJSON}
                      title="Export JSON"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
                <Textarea value={lang === "EN" ? EN : JP} onChange={() => {}} rows={14} className="font-mono" />
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Button
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20"
        onClick={() => setShowPrompt((p) => !p)}
      >
        {showPrompt ? "Hide Prompt" : "Show Prompt"}
      </Button>
    </div>
  );
}
