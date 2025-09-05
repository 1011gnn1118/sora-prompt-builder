import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx"; // default export なので名前は自由

createRoot(document.getElementById("root")).render(<App />);
