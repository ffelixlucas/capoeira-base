import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import InscritoList from "../components/ui/InscritoList";
import ModalInscrito from "../components/inscricoes/ModalInscrito";
import Busca from "../components/ui/Busca";
import ContadorLista from "../components/ui/ContadorLista";
import CardEstat from "../components/ui/CardEstat";
import { UserGroupIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import ResumoCamisetas from "../components/ui/ResumoCamisetas";
import ExportarPDFModal from "../components/shared/ExportarPDFModal";
import { useInscritosEvento } from "../hooks/useInscritosEvento";
import {
  exportarListaPDF,
  exportarRelatorioPDF,
} from "../utils/relatorioInscritosPDF";

function InscritosEvento() {
  const { eventoId } = useParams();
  const [busca, setBusca] = useState("");

  const {
    evento,
    inscritos,
    resumoCamisetas,
    carregando,
    modalAberto,
    inscritoSelecionado,
    setModalAberto,
    verFichaCompleta,
    atualizarInscritoNaLista,
  } = useInscritosEvento(eventoId, busca);

  // Deixa cada palavra com a primeira letra maiúscula
  const formatarNome = (nome) => {
    if (!nome) return "-";
    return nome
      .toLowerCase()
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };

  // Cria uma cópia só para exibição na lista
  const inscritosFormatados = useMemo(
    () =>
      inscritos.map((i) => ({
        ...i,
        nome: formatarNome(i.nome),
        apelido: i.apelido ? formatarNome(i.apelido) : i.apelido,
        responsavel_nome: i.responsavel_nome
          ? formatarNome(i.responsavel_nome)
          : i.responsavel_nome,
      })),
    [inscritos]
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <CardEstat
          valor={evento?.total_inscritos || 0}
          label="Inscritos"
          Icon={UserGroupIcon}
          cor="blue"
        />
        <CardEstat
          valor={`R$ ${Number(evento?.valor_liquido_total ?? 0).toFixed(2)}`}
          label="Total (líquido)"
          Icon={CurrencyDollarIcon}
          cor="green"
        />
      </div>

      {/* Distribuição camisetas */}
      <ResumoCamisetas resumo={resumoCamisetas} />

      {/* Exportações */}
      <div className="flex justify-between mb-4">
        <ExportarPDFModal
          onExportLista={() => exportarListaPDF(inscritos, eventoId)}
          onExportRelatorio={() =>
            exportarRelatorioPDF(inscritos, evento, eventoId)
          }
        />
      </div>

      {/* Lista */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-white">
          Inscritos {evento?.titulo ? `- ${evento.titulo}` : ""}
        </h2>
        <ContadorLista total={inscritos.length} />
      </div>

      <div className="mb-3">
        <Busca
          placeholder="Buscar por nome, e-mail ou telefone"
          onBuscar={setBusca}
        />
      </div>

      <InscritoList
        inscritos={inscritosFormatados}
        carregando={carregando}
        onVerMais={verFichaCompleta}
      />

      <ModalInscrito
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        inscrito={inscritoSelecionado}
        onEditar={atualizarInscritoNaLista}
      />
    </div>
  );
}

export default InscritosEvento;
