import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "motion/react";
import "./style.css";
import "./club.css";
import App from "./App";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>,
);

import "./remix.css";

import "./deck.css";
