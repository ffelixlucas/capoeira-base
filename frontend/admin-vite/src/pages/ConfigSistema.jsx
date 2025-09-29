import React from "react";
import NotificacoesEmail from "../components/config/NotificacoesEmail";

export default function ConfigSistema() {
  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-cor-titulo">⚙️ Configurações do Sistema</h1>

      {/* Seção de Notificações */}
      <NotificacoesEmail />

      {/* Futuras seções podem ser adicionadas aqui */}
      {/* <OutraConfig /> */}
    </div>
  );
}
