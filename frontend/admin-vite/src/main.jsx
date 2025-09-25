import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { initMP } from "./utils/mercadoPago";
import { useRipple } from "./hooks/useRipple"; // 🔹 importa hook ripple

// inicializa Mercado Pago SDK
initMP();

function Root() {
  useRipple(); // 🔹 ativa ripple globalmente

  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
