// utils/relatorioInscritosPDF.js
import { criarDocumento, adicionarTitulo, adicionarTabela, salvarPDF } from "./pdfUtils";

/**
 * Lista simples de confirmados
 */
export function exportarListaPDF(inscritos, eventoId) {
  const doc = criarDocumento("l");
  let y = adicionarTitulo(doc, "Lista de Confirmados");

  const dadosTabela = inscritos.map((i, idx) => [
    idx + 1,
    i.nome || "-",
    i.cpf || "-",
    i.categoria || "-",
    i.tamanho_camiseta || "-"
  ]);

  adicionarTabela(doc, {
    head: [["#", "Nome", "Documento", "Categoria", "Camiseta"]],
    body: dadosTabela,
    startY: y + 5,
  });

  salvarPDF(doc, `lista_confirmados_${eventoId}.pdf`);
}

/**
 * Relatório completo do evento
 */
export function exportarRelatorioPDF(inscritos, evento, eventoId) {
  const doc = criarDocumento("p");

  // Resumo
  adicionarTitulo(doc, "Resumo do Evento");

  const resumoData = [
    ["Total inscritos pagos", String(evento.total_inscritos)],
    ["Total bruto", `R$ ${Number(evento.valor_bruto_total ?? 0).toFixed(2)}`],
    ["Total líquido", `R$ ${Number(evento.valor_liquido_total ?? 0).toFixed(2)}`],
    ["Pix", `${inscritos.filter(i => i.metodo_pagamento === "pix").length} inscritos`],
    ["Cartão", `${inscritos.filter(i => i.metodo_pagamento === "cartao").length} inscritos`],
  ];

  let y = adicionarTabela(doc, {
    head: [["Métrica", "Valor"]],
    body: resumoData,
    startY: 30,
    estilos: {
      headStyles: { fillColor: [0, 122, 204] },
      columnStyles: { 0: { halign: "left" }, 1: { halign: "center" } },
    },
  });

  // Camisetas
  const tamanhos = {};
  inscritos.forEach((i) => {
    const t = i.tamanho_camiseta || "-";
    tamanhos[t] = (tamanhos[t] || 0) + 1;
  });
  const camisetasData = Object.entries(tamanhos).map(([tam, qtd]) => [tam, String(qtd)]);

  y = adicionarTitulo(doc, "Distribuição de Camisetas", y + 15);
  adicionarTabela(doc, {
    head: [["Tamanho", "Quantidade"]],
    body: camisetasData,
    startY: y + 5,
    estilos: {
      headStyles: { fillColor: [40, 167, 69] },
    },
  });

  // Lista final
  doc.addPage();
  adicionarTitulo(doc, "Lista de Confirmados");

  const dadosTabela = inscritos.map(i => [
    i.nome || "-",
    i.cpf || "-",
    i.categoria || "-",
    i.tamanho_camiseta || "-"
  ]);

  adicionarTabela(doc, {
    head: [["Nome", "Documento", "Categoria", "Camiseta"]],
    body: dadosTabela,
    startY: 30,
  });

  salvarPDF(doc, `relatorio_evento_${eventoId}.pdf`);
}
