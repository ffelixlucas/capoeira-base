// utils/relatorioInscritosPDF.js
import { criarDocumento, adicionarTitulo, salvarPDF } from "./pdfUtils";
import autoTable from "jspdf-autotable";

/**
 * Normaliza texto: primeira letra maiúscula de cada palavra
 */
function formatarTexto(valor) {
  if (!valor) return "-";
  return valor
    .toLowerCase()
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/**
 * Cabeçalho de seção com linha de separação
 */
function adicionarSecaoTitulo(doc, texto, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(texto, 14, y);
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(14, y + 2, doc.internal.pageSize.getWidth() - 14, y + 2);
  return y + 12;
}

/**
 * Rodapé em todas as páginas
 */
function adicionarRodape(doc, eventoTitulo) {
  const pageCount = doc.internal.getNumberOfPages();
  const data = new Date().toLocaleDateString("pt-BR");

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(100);

    doc.text(`${eventoTitulo} — Gerado em ${data}`, 14, height - 8);
    doc.text(`Página ${i} de ${pageCount}`, width - 14, height - 8, {
      align: "right",
    });
  }
}

/**
 * Lista simples de confirmados (com espaço para assinatura) - formato paisagem
 */
export function exportarListaPDF(inscritos, eventoId) {
  const doc = criarDocumento("landscape"); // paisagem
  let y = adicionarTitulo(doc, "Lista de Confirmados", 20);

  // 🔹 Só pega os pagos
  const confirmados = inscritos.filter((i) => i.status === "pago");

  // Cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Nº", 10, y);
  doc.text("Nome", 25, y);
  doc.text("Documento", 90, y);
  doc.text("Categoria", 140, y);
  doc.text("Camiseta", 180, y);
  doc.text("Assinatura", 220, y);
  y += 8;

  // Linhas
  doc.setFont("helvetica", "normal");
  confirmados.forEach((i, idx) => {
    doc.text(String(idx + 1), 10, y);
    doc.text(formatarTexto(i.nome), 25, y);
    doc.text(i.cpf || "-", 90, y);
    doc.text(formatarTexto(i.categoria), 140, y);
    doc.text((i.tamanho_camiseta || "-").toUpperCase(), 180, y);

    // Linha de assinatura
    doc.line(220, y + 1, 290, y + 1);

    y += 10;

    // Quebra de página
    if (y > 190) {
      doc.addPage("landscape");
      y = 20;
    }
  });

  salvarPDF(doc, `lista_confirmados_${eventoId}.pdf`);
}

/**
 * Relatório completo do evento (versão profissional)
 */
export function exportarRelatorioPDF(inscritos, evento, eventoId) {
  const doc = criarDocumento("portrait");
  let y = adicionarSecaoTitulo(doc, "Resumo do Evento", 20);

  // 🔹 Resumo em tabela
  const resumoData = [
    ["Total inscritos pagos", String(evento.total_inscritos)],
    ["Total bruto", `R$ ${Number(evento.valor_bruto_total ?? 0).toFixed(2)}`],
    ["Total líquido", `R$ ${Number(evento.valor_liquido_total ?? 0).toFixed(2)}`],
    ["Pix", `${inscritos.filter((i) => i.metodo_pagamento === "pix").length} inscritos`],
    ["Cartão", `${inscritos.filter((i) => i.metodo_pagamento === "cartao").length} inscritos`],
  ];

  autoTable(doc, {
    head: [["Métrica", "Valor"]],
    body: resumoData,
    startY: y,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [52, 152, 219], halign: "center" },
    columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
  });
  y = doc.lastAutoTable.finalY + 15;

  // 🔹 Camisetas
  y = adicionarSecaoTitulo(doc, "Distribuição de Camisetas", y);
  const tamanhos = {};
  inscritos
    .filter((i) => i.status === "pago")
    .forEach((i) => {
      const t = i.tamanho_camiseta || "-";
      tamanhos[t] = (tamanhos[t] || 0) + 1;
    });
  const camisetasData = Object.entries(tamanhos).map(([tam, qtd]) => [
    tam.toUpperCase(),
    String(qtd),
  ]);

  autoTable(doc, {
    head: [["Tamanho", "Quantidade"]],
    body: camisetasData,
    startY: y,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [39, 174, 96], halign: "center" },
    bodyStyles: { halign: "center" },
  });

  // 🔹 Lista final em landscape
  doc.addPage("landscape");
  y = adicionarSecaoTitulo(doc, "Lista de Confirmados", 20);

  const confirmados = inscritos.filter((i) => i.status === "pago");
  const listaData = confirmados.map((i, idx) => [
    idx + 1,
    formatarTexto(i.nome),
    i.cpf || "-",
    formatarTexto(i.categoria),
    (i.tamanho_camiseta || "-").toUpperCase(),
    "", // campo para assinatura
  ]);

  autoTable(doc, {
    head: [["Nº", "Nome", "Documento", "Categoria", "Camiseta", "Assinatura"]],
    body: listaData,
    startY: y,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: 20,
      halign: "center",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] }, // linhas zebradas
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { cellWidth: 45 },
      3: { cellWidth: 40 },
      4: { cellWidth: 30, halign: "center" },
      5: { cellWidth: 60 }, // assinatura mais larga
    },
  });

  // 🔹 Rodapé
  adicionarRodape(doc, evento.titulo || "Relatório do Evento");

  salvarPDF(doc, `relatorio_evento_${eventoId}.pdf`);
}

/**
 * Relatório completo do evento (sem camisetas)
 */
export function exportarRelatorioSemCamisetasPDF(inscritos, evento, eventoId) {
  const doc = criarDocumento("portrait");
  let y = adicionarSecaoTitulo(doc, "Resumo do Evento", 20);

  // 🔹 Resumo
  const resumoData = [
    ["Total inscritos pagos", String(evento.total_inscritos)],
    ["Total bruto", `R$ ${Number(evento.valor_bruto_total ?? 0).toFixed(2)}`],
    ["Total líquido", `R$ ${Number(evento.valor_liquido_total ?? 0).toFixed(2)}`],
    ["Pix", `${inscritos.filter(i => i.metodo_pagamento === "pix").length} inscritos`],
    ["Cartão", `${inscritos.filter(i => i.metodo_pagamento === "cartao").length} inscritos`],
  ];

  autoTable(doc, {
    head: [["Métrica", "Valor"]],
    body: resumoData,
    startY: y,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [52, 152, 219], halign: "center" },
    columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
  });

  // 🔹 Lista final em landscape
  doc.addPage("landscape");
  y = adicionarSecaoTitulo(doc, "Lista de Confirmados", 20);

  const confirmados = inscritos.filter(i => i.status === "pago");
  const listaData = confirmados.map((i, idx) => [
    idx + 1,
    formatarTexto(i.nome),
    i.cpf || "-",
    formatarTexto(i.categoria),
    "" // assinatura
  ]);

  autoTable(doc, {
    head: [["Nº", "Nome", "Documento", "Categoria", "Assinatura"]],
    body: listaData,
    startY: y,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [200, 200, 200], textColor: 20, halign: "center" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 90 },
      2: { cellWidth: 45 },
      3: { cellWidth: 60 },
      4: { cellWidth: 80 },
    },
  });

  adicionarRodape(doc, evento.titulo || "Relatório do Evento");
  salvarPDF(doc, `relatorio_evento_${eventoId || evento.id}_sem_camisetas.pdf`);
}
