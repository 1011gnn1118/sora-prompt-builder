import React, { useState } from "react";
import SoraPromptBuilder from "./SoraPromptBuilder.jsx";
import AnimePromptBuilder from "./AnimePromptBuilder.jsx";
import { Button } from "./components/ui";

export default function App() {
  const [tab, setTab] = useState("sora");
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b mb-4">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
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
      </header>
      {tab === "sora" ? <SoraPromptBuilder /> : <AnimePromptBuilder />}
    </div>
  );
}
