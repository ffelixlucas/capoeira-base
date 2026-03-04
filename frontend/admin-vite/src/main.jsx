// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { initMP } from "./utils/mercadoPago";
import { useRipple } from "./hooks/useRipple";
import "flowbite";
import { logger } from "./utils/logger";

if (import.meta.env.MODE === "production" && import.meta.env.VITE_ALLOW_CONSOLE !== "true") {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
}

initMP();

function AppWithRipple() {
  useRipple();
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AppWithRipple />
    </AuthProvider>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        logger.info("Service Worker registrado", reg);
      })
      .catch((err) => {
        logger.error("Erro ao registrar Service Worker", err);
      });
  });
}
