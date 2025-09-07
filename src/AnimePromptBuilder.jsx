import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardContent, Button, Select, Textarea } from "./components/ui";
import { animeOptions, toSelectOptions, findJP } from "./data/animeOptions";
import { Copy } from "lucide-react";

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
  hairColor: "blonde",
  hairStyle: "long straight",
  eyeColor: "blue",
  expression: "smiling",
  outfit: "elegant dress with lace details",
  background: "cherry blossom park",
  style: "anime style",
  pose: "gentle smile with blushing cheeks",
  mood: "romantic",
  lighting: "cinematic lighting",
  base: "cute anime girl",
  detail: "wet hair strands glistening",
  sensual: "sensual atmosphere without nudity",
};

function buildEN(state) {
  const parts = [
    `Detailed illustration of a beautiful anime girl with ${state.hairColor} ${state.hairStyle} hair and ${state.eyeColor} eyes`,
    `${state.expression} expression`,
    `wearing ${state.outfit}`,
    `background: ${state.background}`,
    `style: ${state.style}`,
    state.pose,
    `${state.mood} mood`,
    state.lighting,
    state.base,
    state.detail,
    state.sensual,
  ].filter(Boolean);
  return parts.join(", ");
}

function buildJP(state) {
  const parts = [
    `美少女アニメのイラスト`,
    `髪は${findJP(state.hairColor)}の${findJP(state.hairStyle)}`,
    `瞳は${findJP(state.eyeColor)}`,
    `${findJP(state.expression)}表情`,
    `${findJP(state.outfit)}`,
    `背景:${findJP(state.background)}`,
    `スタイル:${findJP(state.style)}`,
    `${findJP(state.pose)}`,
    `雰囲気:${findJP(state.mood)}`,
    `ライティング:${findJP(state.lighting)}`,
    `${findJP(state.base)}`,
    `${findJP(state.detail)}`,
    `${findJP(state.sensual)}`,
  ].filter(Boolean);
  return parts.join("、");
}

export default function AnimePromptBuilder() {
  const [state, setState] = useState(defaultState);
  const { copy } = useClipboard();

  const EN = useMemo(() => buildEN(state), [state]);
  const JP = useMemo(() => buildJP(state), [state]);

  const field = (label, node) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {node}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader title="Character" />
        <CardContent className="space-y-3">
          {field("Hair Color", (
            <Select
              value={state.hairColor}
              onChange={(v) => setState({ ...state, hairColor: v })}
              options={toSelectOptions(animeOptions.hairColor)}
            />
          ))}
          {field("Hair Style", (
            <Select
              value={state.hairStyle}
              onChange={(v) => setState({ ...state, hairStyle: v })}
              options={toSelectOptions(animeOptions.hairStyle)}
            />
          ))}
          {field("Eye Color", (
            <Select
              value={state.eyeColor}
              onChange={(v) => setState({ ...state, eyeColor: v })}
              options={toSelectOptions(animeOptions.eyeColor)}
            />
          ))}
          {field("Expression", (
            <Select
              value={state.expression}
              onChange={(v) => setState({ ...state, expression: v })}
              options={toSelectOptions(animeOptions.expression)}
            />
          ))}
          {field("Pose", (
            <Select
              value={state.pose}
              onChange={(v) => setState({ ...state, pose: v })}
              options={toSelectOptions(animeOptions.pose)}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Scene" />
        <CardContent className="space-y-3">
          {field("Outfit", (
            <Select
              value={state.outfit}
              onChange={(v) => setState({ ...state, outfit: v })}
              options={toSelectOptions(animeOptions.outfit)}
            />
          ))}
          {field("Background", (
            <Select
              value={state.background}
              onChange={(v) => setState({ ...state, background: v })}
              options={toSelectOptions(animeOptions.background)}
            />
          ))}
          {field("Style", (
            <Select
              value={state.style}
              onChange={(v) => setState({ ...state, style: v })}
              options={toSelectOptions(animeOptions.style)}
            />
          ))}
          {field("Mood", (
            <Select
              value={state.mood}
              onChange={(v) => setState({ ...state, mood: v })}
              options={toSelectOptions(animeOptions.mood)}
            />
          ))}
          {field("Lighting", (
            <Select
              value={state.lighting}
              onChange={(v) => setState({ ...state, lighting: v })}
              options={toSelectOptions(animeOptions.lighting)}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Flavor" />
        <CardContent className="space-y-3">
          {field("Base", (
            <Select
              value={state.base}
              onChange={(v) => setState({ ...state, base: v })}
              options={toSelectOptions(animeOptions.base)}
            />
          ))}
          {field("Detail", (
            <Select
              value={state.detail}
              onChange={(v) => setState({ ...state, detail: v })}
              options={toSelectOptions(animeOptions.detail)}
            />
          ))}
          {field("Sensuality", (
            <Select
              value={state.sensual}
              onChange={(v) => setState({ ...state, sensual: v })}
              options={toSelectOptions(animeOptions.sensual)}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Prompts" />
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">English</label>
            <Textarea value={EN} readOnly />
            <Button onClick={() => copy(EN)} className="mt-1" title="Copy English"><Copy className="h-4 w-4" />Copy EN</Button>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">日本語</label>
            <Textarea value={JP} readOnly />
            <Button onClick={() => copy(JP)} className="mt-1" title="Copy Japanese"><Copy className="h-4 w-4" />Copy JP</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
