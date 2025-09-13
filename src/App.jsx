import React, { useState } from "react";
import SoraPromptBuilder from "./SoraPromptBuilder.jsx";
import AnimePromptBuilder from "./AnimePromptBuilder.jsx";
import { Button } from "./components/ui";

export default function App() {
  const [tab, setTab] = useState("sora");
  const [uiLang, setUiLang] = useState("EN");
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b mb-4">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant={tab === "sora" ? "default" : "ghost"}
              onClick={() => setTab("sora")}
            >
              sora-prompt-builder
            </Button>
            <Button
              variant={tab === "anime" ? "default" : "ghost"}
              onClick={() => setTab("anime")}
            >
              anime-prompt-builder
            </Button>
          </div>
          <Button onClick={() => setUiLang(uiLang === "EN" ? "JP" : "EN")}
            variant="subtle">
            {uiLang === "EN" ? "JP" : "EN"}
          </Button>
        </div>
      </header>
      {tab === "sora" ? <SoraPromptBuilder uiLang={uiLang} /> : <AnimePromptBuilder uiLang={uiLang} />}
    </div>
  );
}
