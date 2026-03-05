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
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const shouldRegisterSw = import.meta.env.MODE === "production" && !isLocalhost;

  window.addEventListener("load", () => {
    if (shouldRegisterSw) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          logger.info("Service Worker registrado", reg);
        })
        .catch((err) => {
          logger.error("Erro ao registrar Service Worker", err);
        });
      return;
    }

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister()))
      )
      .catch((err) => {
        logger.warn("Não foi possível limpar Service Workers locais", err);
      });
  });
}
