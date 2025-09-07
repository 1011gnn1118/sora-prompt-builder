import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardContent, Button, Select, Textarea } from "./components/ui";
import { animeOptions, toSelectOptions, findJP } from "./data/animeOptions";
import { Copy, Shuffle, RotateCcw } from "lucide-react";

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
    `${findJP(state.details)}`,
    `カメラアングル:${findJP(state.cameraAngle)}`,
    `ズーム:${findJP(state.zoom)}`,
    `スタイル:${findJP(state.style)}`,
  ];
  return parts.join("、");
}

export default function AnimePromptBuilder() {
  const [state, setState] = useState(defaultState);
  const { copy } = useClipboard();

  const [lang, setLang] = useState("EN");
  const [showPrompt, setShowPrompt] = useState(false);

  const EN = useMemo(() => buildEN(state), [state]);
  const JP = useMemo(() => buildJP(state), [state]);

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
    <div className="max-w-3xl mx-auto space-y-6 pb-32">
      <div className="flex justify-end gap-2">
        <Button onClick={randomize} title="Randomize">
          <Shuffle className="h-4 w-4" />Random
        </Button>
        <Button variant="subtle" onClick={reset} title="Reset">
          <RotateCcw className="h-4 w-4" />Reset
        </Button>
      </div>
      <Card>
        <CardHeader title="Character" />
        <CardContent className="space-y-3">
          {field("Character Type", (
            <Select
              value={state.characterType}
              onChange={(v) => setState({ ...state, characterType: v })}
              options={toSelectOptions(animeOptions.characterType)}
              allowCustom
            />
          ))}
          {field("Hair Color", (
            <Select
              value={state.hairColor}
              onChange={(v) => setState({ ...state, hairColor: v })}
              options={toSelectOptions(animeOptions.hairColor)}
              allowCustom
            />
          ))}
          {field("Hair Style", (
            <Select
              value={state.hairStyle}
              onChange={(v) => setState({ ...state, hairStyle: v })}
              options={toSelectOptions(animeOptions.hairStyle)}
              allowCustom
            />
          ))}
          {field("Eye Color", (
            <Select
              value={state.eyeColor}
              onChange={(v) => setState({ ...state, eyeColor: v })}
              options={toSelectOptions(animeOptions.eyeColor)}
              allowCustom
            />
          ))}
          {field("Expression", (
            <Select
              value={state.expression}
              onChange={(v) => setState({ ...state, expression: v })}
              options={toSelectOptions(animeOptions.expression)}
              allowCustom
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Scene" />
        <CardContent className="space-y-3">
          {field("Pose", (
            <Select
              value={state.pose}
              onChange={(v) => setState({ ...state, pose: v })}
              options={toSelectOptions(animeOptions.pose)}
              allowCustom
            />
          ))}
          {field("Fashion", (
            <Select
              value={state.fashion}
              onChange={(v) => setState({ ...state, fashion: v })}
              options={toSelectOptions(animeOptions.fashion)}
              allowCustom
            />
          ))}
          {field("Background", (
            <Select
              value={state.background}
              onChange={(v) => setState({ ...state, background: v })}
              options={toSelectOptions(animeOptions.background)}
              allowCustom
            />
          ))}
          {field("Mood", (
            <Select
              value={state.mood}
              onChange={(v) => setState({ ...state, mood: v })}
              options={toSelectOptions(animeOptions.mood)}
              allowCustom
            />
          ))}
          {field("Details", (
            <Select
              value={state.details}
              onChange={(v) => setState({ ...state, details: v })}
              options={toSelectOptions(animeOptions.details)}
              allowCustom
            />
          ))}
          {field("Camera Angle", (
            <Select
              value={state.cameraAngle}
              onChange={(v) => setState({ ...state, cameraAngle: v })}
              options={toSelectOptions(animeOptions.cameraAngle)}
              allowCustom
            />
          ))}
          {field("Zoom", (
            <Select
              value={state.zoom}
              onChange={(v) => setState({ ...state, zoom: v })}
              options={toSelectOptions(animeOptions.zoom)}
              allowCustom
            />
          ))}
          {field("Style", (
            <Select
              value={state.style}
              onChange={(v) => setState({ ...state, style: v })}
              options={toSelectOptions(animeOptions.style)}
              allowCustom
            />
          ))}
        </CardContent>
      </Card>

      {showPrompt && (
        <Card className="fixed bottom-16 left-0 right-0 bg-white z-10 max-w-3xl mx-auto">
          <CardHeader
            title="Prompt"
            right={
              <div className="flex gap-2">
                <Button
                  variant={lang === "EN" ? "default" : "subtle"}
                  onClick={() => setLang("EN")}
                >
                  EN
                </Button>
                <Button
                  variant={lang === "JP" ? "default" : "subtle"}
                  onClick={() => setLang("JP")}
                >
                  JP
                </Button>
              </div>
            }
          />
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                {lang === "EN" ? "English" : "日本語"}
              </label>
              <Textarea value={lang === "EN" ? EN : JP} readOnly />
              <Button
                onClick={() => copy(lang === "EN" ? EN : JP)}
                className="mt-1"
                title={lang === "EN" ? "Copy English" : "Copy Japanese"}
              >
                <Copy className="h-4 w-4" />
                {lang === "EN" ? "Copy EN" : "コピー"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Button
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20"
        onClick={() => setShowPrompt((p) => !p)}
      >
        {showPrompt ? "Hide Prompt" : "Show Prompt"}
      </Button>
    </div>
  );
}
