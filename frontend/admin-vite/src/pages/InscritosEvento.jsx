import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import InscritoList from "../components/ui/InscritoList";
import ModalInscrito from "../components/inscricoes/ModalInscrito";
import Busca from "../components/ui/Busca";
import ContadorLista from "../components/ui/ContadorLista";
import CardEstat from "../components/ui/CardEstat";
import { UserGroupIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import ResumoCamisetas from "../components/ui/ResumoCamisetas";
import { useInscritosEvento } from "../hooks/useInscritosEvento";
import {
  exportarListaPDF,
  exportarRelatorioPDF,
  exportarRelatorioSemCamisetasPDF,
} from "../utils/relatorioInscritosPDF";
import ModalCamisetas from "../components/ui/ModalCamisetas";
import ExportarPDFModal from "../components/shared/ExportarPDFModal";

function InscritosEvento() {
  const { eventoId } = useParams();
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [camisetasAberto, setCamisetasAberto] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState("todos");

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
  } = useInscritosEvento(eventoId, busca, categoriaFiltro);

  // helpers
  const formatarNome = (nome) => {
    if (!nome) return "-";
    return nome
      .toLowerCase()
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };

  // aplica filtro
  const inscritosFormatados = useMemo(() => {
    let lista = inscritos.map((i) => ({
      ...i,
      nome: formatarNome(i.nome),
      apelido: i.apelido ? formatarNome(i.apelido) : i.apelido,
      responsavel_nome: i.responsavel_nome
        ? formatarNome(i.responsavel_nome)
        : i.responsavel_nome,
    }));
    if (statusFiltro !== "todos") {
      lista = lista.filter((i) => i.status === statusFiltro);
    }
    return lista;
  }, [inscritos, statusFiltro]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <header className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-white">
          Inscritos {evento?.titulo ? `– ${evento.titulo}` : ""}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Gerencie todos os inscritos, pagamentos e informações do evento.
        </p>
      </header>
      {/* Estatísticas lado a lado compactas */}
      <div className="grid grid-cols-2 gap-3">
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
      {/* Busca + Filtros + Contador */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Busca
          placeholder="Buscar por nome, e-mail ou telefone"
          onBuscar={setBusca}
        />
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Filtro de Status */}
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="border rounded-lg px-2 py-2 text-sm text-black w-full sm:w-auto"
          >
            <option value="todos">Todos os Status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="extornado">Extornado</option>
          </select>

          {/* Filtro de Categoria */}
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="border rounded-lg px-2 py-2 text-sm text-black w-full sm:w-auto"
          >
            <option value="todos">Todas as Categorias</option>
            <option value="1">Infantil</option>
            <option value="2">Juvenil</option>
            <option value="3">Jovens e Adultos</option>
          </select>

          {/* Contador */}
          <ContadorLista total={inscritosFormatados.length} />
        </div>
      </div>

      {/* Botões Camisetas + Exportar */}
      <div className="flex flex-wrap gap-2 justify-between sm:justify-start">
        {/* Só aparece se houver camisetas */}
        {resumoCamisetas && resumoCamisetas.length > 0 && (
          <button
            onClick={() => setCamisetasAberto(true)}
            className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1 hover:bg-gray-100 transition text-sm"
          >
            <span className="text-gray-700 text-lg">👕</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-green-500 text-white font-semibold">
              {resumoCamisetas
                .filter((item) => item.status === "pago" || !item.status)
                .reduce((acc, item) => acc + (item.total || 0), 0)}
            </span>
          </button>
        )}

        {/* Exportar PDF */}
        {resumoCamisetas && resumoCamisetas.length > 0 ? (
          <ExportarPDFModal
            onExportLista={() => exportarListaPDF(inscritos, evento)}
            onExportRelatorio={() => exportarRelatorioPDF(inscritos, evento)}
          />
        ) : (
          <button
            onClick={() => exportarRelatorioSemCamisetasPDF(inscritos, evento)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm"
          >
            <span>📄 Exportar PDF</span>
          </button>
        )}
      </div>
      {/* Lista */}
      <div className="bg-white rounded-lg border border-cor-secundaria/30 shadow-sm overflow-hidden">
        <InscritoList
          inscritos={inscritosFormatados}
          carregando={carregando}
          onVerMais={verFichaCompleta}
        />
      </div>
      {/* Modal */}
      <ModalInscrito
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        inscrito={inscritoSelecionado}
        onEditar={atualizarInscritoNaLista}
      />
      <ModalCamisetas
        aberto={camisetasAberto}
        onClose={() => setCamisetasAberto(false)}
        resumo={resumoCamisetas}
      />
    </div>
  );
}

export default InscritosEvento;
