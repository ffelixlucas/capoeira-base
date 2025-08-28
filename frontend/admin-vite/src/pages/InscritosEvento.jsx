import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import InscritoList from "../components/ui/InscritoList";
import ModalInscrito from "../components/inscricoes/ModalInscrito";
import Busca from "../components/ui/Busca";
import ContadorLista from "../components/ui/ContadorLista";
import CardEstat from "../components/ui/CardEstat";
import { UserGroupIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import {
  buscarInscritosPorEvento,
  buscarInscritoPorId,
} from "../services/inscricaoService";
import { Menu } from "@headlessui/react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import ResumoCamisetas from "../components/ui/ResumoCamisetas";

function InscritosEvento() {
  const { eventoId } = useParams();

  const [evento, setEvento] = useState(null);
  const [inscritos, setInscritos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [inscritoSelecionado, setInscritoSelecionado] = useState(null);
  const [resumoCamisetas, setResumoCamisetas] = useState([]);


  // Carregar lista inicial
  useEffect(() => {
    carregarInscritos();
  }, [eventoId, busca]);

  async function carregarInscritos() {
    setCarregando(true);
    try {
      // Agora a API retorna { evento, inscritos }
      const dados = await buscarInscritosPorEvento(eventoId, busca);
      setEvento(dados.evento);
      setInscritos(dados.inscritos);
      setResumoCamisetas(dados.resumo_camisetas || []);
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
          <h2>Lista de Inscritos - Evento ${evento?.titulo || ""}</h2>
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
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <CardEstat
          valor={evento?.total_inscritos || 0}
          label="Total de Inscritos"
          Icon={UserGroupIcon}
          cor="blue"
        />

        <CardEstat
          valor={`R$ ${Number(evento?.valor_liquido_total ?? 0).toFixed(2)}`}
          label="Total (líquido após taxas)"
          Icon={CurrencyDollarIcon}
          cor="green"
        />
      </div>

      <ResumoCamisetas resumo={resumoCamisetas} />

      <div className="flex justify-between mb-4">
        <Menu as="div" className="relative text-black">
          {/* Botão de ações */}
        </Menu>
      </div>

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
