import React, { useEffect } from "react";
import NotificacoesEmail from "../components/config/NotificacoesEmail";
import ConfigCategorias from "../components/config/ConfigCategorias";
import { useCategorias } from "../hooks/useCategorias";

export default function ConfigSistema() {
  const {
    categorias,
    carregando,

    adicionarCategoria,
    editarCategoria,
    excluirCategoria,

    adicionarGraduacao,
    editarGraduacao,
    excluirGraduacao,
  } = useCategorias();

  /* -------------------------------------------------------------------------- */
  /* 🔄 Scroll automático até categorias se abrir com #categorias              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (window.location.hash === "#categorias") {
      const alvo = document.getElementById("categorias");
      if (alvo) {
        setTimeout(() => {
          alvo.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    }
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-cor-titulo">
        ⚙️ Configurações do Sistema
      </h1>

      {/* Notificações */}
      <NotificacoesEmail />

      {/* Categorias */}
      <div id="categorias">
        <ConfigCategorias
          categorias={categorias}
          carregando={carregando}
          onAddCategoria={adicionarCategoria}
          onEditCategoria={(cat) => editarCategoria(cat.id, cat.nome)}
          onDeleteCategoria={excluirCategoria}
          onAddGraduacao={(categoriaId, nome, ordem) =>
            adicionarGraduacao(categoriaId, nome, ordem)
          }
          onEditGraduacao={(g) => editarGraduacao(g.id, g)}
          onDeleteGraduacao={excluirGraduacao}
        />
      </div>
    </div>
  );
}
