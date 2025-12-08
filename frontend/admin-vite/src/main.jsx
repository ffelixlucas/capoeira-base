// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { initMP } from "./utils/mercadoPago";
import { useRipple } from "./hooks/useRipple";
import "flowbite";

initMP();

// 🔹 Wrapper para ativar ripple depois que AuthProvider já existe
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

// 🔹 Registro do Service Worker (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("Service Worker registrado:", reg);
      })
      .catch((err) => {
        console.error("Erro ao registrar Service Worker:", err);
      });
  });
}
