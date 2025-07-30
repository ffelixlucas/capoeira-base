import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";
import InscritoList from "../components/ui/InscritoList";
import ModalInscrito from "../components/inscricoes/ModalInscrito";
import Busca from "../components/ui/Busca";
import ContadorLista from "../components/ui/ContadorLista";
import {
  buscarInscritosPorEvento,
  buscarInscritoPorId,
} from "../services/inscricaoService";
import { Menu } from "@headlessui/react";
import { FaDownload, FaFilePdf, FaFileExcel, FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

function InscritosEvento() {
  const { eventoId } = useParams();

  const [inscritos, setInscritos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [inscritoSelecionado, setInscritoSelecionado] = useState(null);

  // Carregar lista inicial
  useEffect(() => {
    carregarInscritos();
  }, [eventoId, busca]);

  async function carregarInscritos() {
    setCarregando(true);
    try {
      // Passa a busca para a API
      const dados = await buscarInscritosPorEvento(eventoId, busca);
      setInscritos(dados);
    } catch (err) {
      console.error("Erro ao carregar inscritos:", err);
    } finally {
      setCarregando(false);
    }
  }

  async function verFichaCompleta(inscrito) {
    try {
      const dadosCompletos = await buscarInscritoPorId(inscrito.id);
      setInscritoSelecionado(dadosCompletos);
      setModalAberto(true);
    } catch (err) {
      console.error("Erro ao buscar inscrito:", err);
    }
  }

  // Atualizar um inscrito editado na lista
  function atualizarInscritoNaLista(inscritoAtualizado) {
    setInscritos((lista) =>
      lista.map((i) =>
        i.id === inscritoAtualizado.id ? { ...i, ...inscritoAtualizado } : i
      )
    );
    // Atualiza também o inscrito do modal aberto
    setInscritoSelecionado((atual) =>
      atual && atual.id === inscritoAtualizado.id
        ? { ...atual, ...inscritoAtualizado }
        : atual
    );
  }

  // Gerar Excel da lista completa
  function baixarListaExcel() {
    const ws = XLSX.utils.json_to_sheet(inscritos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inscritos");
    XLSX.writeFile(wb, `inscritos_evento_${eventoId}.xlsx`);
  }

  // Gerar PDF apenas com nomes dos inscritos
  function baixarListaPdf() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Lista de Inscritos - Evento ${eventoId}`, 10, 10);
    let y = 30;
    inscritos.forEach((i, idx) => {
      doc.text(`${idx + 1}. ${i.nome}`, 10, y);
      y += 10;
    });
    doc.save(`inscritos_evento_${eventoId}.pdf`);
  }

  // Imprimir apenas os nomes dos inscritos
  function imprimirLista() {
    const conteudo = inscritos
      .map((i, idx) => `${idx + 1}. ${i.nome}`)
      .join("<br/>");

    const win = window.open("", "_blank", "width=800,height=600");
    win.document.write(`
      <html>
        <head>
          <title>Lista de Inscritos</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Lista de Inscritos - Evento ${eventoId}</h2>
          <p>${conteudo}</p>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between mb-4">
        <BotaoVoltarDashboard />
        <Menu as="div" className="relative text-black">
          {/* Botão de ações igual */}
        </Menu>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-white">Inscritos</h2>
        <ContadorLista total={inscritos.length} />
        </div>

      <div className="mb-3">
        <Busca
          placeholder="Buscar por nome, e-mail ou telefone"
          onBuscar={setBusca}
        />
      </div>

      <InscritoList
        inscritos={inscritos}
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
