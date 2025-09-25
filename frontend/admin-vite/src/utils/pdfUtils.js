// utils/pdfUtils.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Cria um documento PDF novo
 * @param {"p" | "l"} orientacao "p" = retrato, "l" = paisagem
 */
export function criarDocumento(orientacao = "p") {
  return new jsPDF(orientacao, "mm", "a4");
}

/**
 * Adiciona um título centralizado
 */
export function adicionarTitulo(doc, texto, y = 20, tamanhoFonte = 14) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(tamanhoFonte);
  doc.text(texto, 105, y, { align: "center" });
  return y + 10;
}

/**
 * Adiciona uma tabela com AutoTable
 */
export function adicionarTabela(doc, { head, body, startY, theme = "grid", estilos = {} }) {
  autoTable(doc, {
    head,
    body,
    startY,
    theme,
    styles: { fontSize: 10, cellPadding: 3, ...estilos.styles },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: "center", ...estilos.headStyles },
    bodyStyles: { halign: "center", ...estilos.bodyStyles },
    columnStyles: estilos.columnStyles || {},
  });

  return doc.lastAutoTable.finalY;
}

/**
 * Salva o PDF
 */
export function salvarPDF(doc, nomeArquivo) {
  doc.save(nomeArquivo);
}
