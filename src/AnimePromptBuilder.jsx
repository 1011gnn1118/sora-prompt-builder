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
    `スタイル:${findJP(state.style)}`,
  ];
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
          {field("Character Type", (
            <Select
              value={state.characterType}
              onChange={(v) => setState({ ...state, characterType: v })}
              options={toSelectOptions(animeOptions.characterType)}
            />
          ))}
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
            />
          ))}
          {field("Fashion", (
            <Select
              value={state.fashion}
              onChange={(v) => setState({ ...state, fashion: v })}
              options={toSelectOptions(animeOptions.fashion)}
            />
          ))}
          {field("Background", (
            <Select
              value={state.background}
              onChange={(v) => setState({ ...state, background: v })}
              options={toSelectOptions(animeOptions.background)}
            />
          ))}
          {field("Mood", (
            <Select
              value={state.mood}
              onChange={(v) => setState({ ...state, mood: v })}
              options={toSelectOptions(animeOptions.mood)}
            />
          ))}
          {field("Details", (
            <Select
              value={state.details}
              onChange={(v) => setState({ ...state, details: v })}
              options={toSelectOptions(animeOptions.details)}
            />
          ))}
          {field("Style", (
            <Select
              value={state.style}
              onChange={(v) => setState({ ...state, style: v })}
              options={toSelectOptions(animeOptions.style)}
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
