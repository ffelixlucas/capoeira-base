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
