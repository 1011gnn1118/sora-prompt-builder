import React, { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Select,
  Textarea,
  Input,
} from "./components/ui";
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
  characterTypeCustom: "",
  hairColorCustom: "",
  hairStyleCustom: "",
  eyeColorCustom: "",
  expressionCustom: "",
  poseCustom: "",
  fashionCustom: "",
  backgroundCustom: "",
  moodCustom: "",
  detailsCustom: "",
  styleCustom: "",
};

function buildEN(state) {
  const characterType = state.characterTypeCustom || state.characterType;
  const hairColor = state.hairColorCustom || state.hairColor;
  const hairStyle = state.hairStyleCustom || state.hairStyle;
  const eyeColor = state.eyeColorCustom || state.eyeColor;
  const expression = state.expressionCustom || state.expression;
  const pose = state.poseCustom || state.pose;
  const fashion = state.fashionCustom || state.fashion;
  const background = state.backgroundCustom || state.background;
  const mood = state.moodCustom || state.mood;
  const details = state.detailsCustom || state.details;
  const style = state.styleCustom || state.style;

  const parts = [
    `Detailed illustration of a ${characterType} with ${hairColor} ${hairStyle} hair and ${eyeColor} eyes`,
    `${expression} expression`,
    `${pose}`,
    `wearing ${fashion}`,
    `background: ${background}`,
    `mood: ${mood}`,
    `${details}`,
    `style: ${style}`,
  ];
  return parts.join(", ");
}

function buildJP(state) {
  const characterType = state.characterTypeCustom || state.characterType;
  const hairColor = state.hairColorCustom || state.hairColor;
  const hairStyle = state.hairStyleCustom || state.hairStyle;
  const eyeColor = state.eyeColorCustom || state.eyeColor;
  const expression = state.expressionCustom || state.expression;
  const pose = state.poseCustom || state.pose;
  const fashion = state.fashionCustom || state.fashion;
  const background = state.backgroundCustom || state.background;
  const mood = state.moodCustom || state.mood;
  const details = state.detailsCustom || state.details;
  const style = state.styleCustom || state.style;

  const parts = [
    `美少女アニメのイラスト`,
    `${findJP(characterType)}`,
    `髪は${findJP(hairColor)}の${findJP(hairStyle)}`,
    `瞳は${findJP(eyeColor)}`,
    `${findJP(expression)}表情`,
    `${findJP(pose)}`,
    `${findJP(fashion)}`,
    `背景:${findJP(background)}`,
    `雰囲気:${findJP(mood)}`,
    `${findJP(details)}`,
    `スタイル:${findJP(style)}`,
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
            <>
              <Select
                value={state.characterType}
                onChange={(v) => setState({ ...state, characterType: v })}
                options={toSelectOptions(animeOptions.characterType)}
              />
              <Input
                placeholder="手入力"
                value={state.characterTypeCustom}
                onChange={(v) => setState({ ...state, characterTypeCustom: v })}
                className="mt-1"
              />
            </>
          ))}
          {field("Hair Color", (
            <>
              <Select
                value={state.hairColor}
                onChange={(v) => setState({ ...state, hairColor: v })}
                options={toSelectOptions(animeOptions.hairColor)}
              />
              <Input
                placeholder="手入力"
                value={state.hairColorCustom}
                onChange={(v) => setState({ ...state, hairColorCustom: v })}
                className="mt-1"
              />
            </>
          ))}
          {field("Hair Style", (
            <>
              <Select
                value={state.hairStyle}
                onChange={(v) => setState({ ...state, hairStyle: v })}
                options={toSelectOptions(animeOptions.hairStyle)}
              />
              <Input
                placeholder="手入力"
                value={state.hairStyleCustom}
                onChange={(v) => setState({ ...state, hairStyleCustom: v })}
                className="mt-1"
              />
            </>
          ))}
          {field("Eye Color", (
            <>
              <Select
                value={state.eyeColor}
                onChange={(v) => setState({ ...state, eyeColor: v })}
                options={toSelectOptions(animeOptions.eyeColor)}
              />
              <Input
                placeholder="手入力"
                value={state.eyeColorCustom}
                onChange={(v) => setState({ ...state, eyeColorCustom: v })}
                className="mt-1"
              />
            </>
          ))}
          {field("Expression", (
            <>
              <Select
                value={state.expression}
                onChange={(v) => setState({ ...state, expression: v })}
                options={toSelectOptions(animeOptions.expression)}
              />
              <Input
                placeholder="手入力"
                value={state.expressionCustom}
                onChange={(v) => setState({ ...state, expressionCustom: v })}
                className="mt-1"
              />
            </>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Scene" />
        <CardContent className="space-y-3">
          {field("Pose", (
            <>
              <Select
                value={state.pose}
                onChange={(v) => setState({ ...state, pose: v })}
                options={toSelectOptions(animeOptions.pose)}
              />
              <Input
                placeholder="手入力"
                value={state.poseCustom}
                onChange={(v) => setState({ ...state, poseCustom: v })}
                className="mt-1"
              />
            </>
          ))}
          {field("Fashion", (
            <>
              <Select
                value={state.fashion}
                onChange={(v) => setState({ ...state, fashion: v })}
                options={toSelectOptions(animeOptions.fashion)}
              />
              <Input
                placeholder="手入力"
                value={state.fashionCustom}
                onChange={(v) => setState({ ...state, fashionCustom: v })}
                className="mt-1"
              />
            </>
          ))}
          {field("Background", (
            <>
              <Select
                value={state.background}
                onChange={(v) => setState({ ...state, background: v })}
                options={toSelectOptions(animeOptions.background)}
              />
              <Input
                placeholder="手入力"
                value={state.backgroundCustom}
                onChange={(v) => setState({ ...state, backgroundCustom: v })}
                className="mt-1"
              />
            </>
          ))}
          {field("Mood", (
            <>
              <Select
                value={state.mood}
                onChange={(v) => setState({ ...state, mood: v })}
                options={toSelectOptions(animeOptions.mood)}
              />
              <Input
                placeholder="手入力"
                value={state.moodCustom}
                onChange={(v) => setState({ ...state, moodCustom: v })}
                className="mt-1"
              />
            </>
          ))}
          {field("Details", (
            <>
              <Select
                value={state.details}
                onChange={(v) => setState({ ...state, details: v })}
                options={toSelectOptions(animeOptions.details)}
              />
              <Input
                placeholder="手入力"
                value={state.detailsCustom}
                onChange={(v) => setState({ ...state, detailsCustom: v })}
                className="mt-1"
              />
            </>
          ))}
          {field("Style", (
            <>
              <Select
                value={state.style}
                onChange={(v) => setState({ ...state, style: v })}
                options={toSelectOptions(animeOptions.style)}
              />
              <Input
                placeholder="手入力"
                value={state.styleCustom}
                onChange={(v) => setState({ ...state, styleCustom: v })}
                className="mt-1"
              />
            </>
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
