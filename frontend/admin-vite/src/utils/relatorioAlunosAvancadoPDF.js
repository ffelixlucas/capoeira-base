import autoTable from "jspdf-autotable";
import { criarDocumento, salvarPDF } from "./pdfUtils";

function formatarDataPtBr(dataIso) {
  if (!dataIso) return "-";
  const [ano, mes, dia] = String(dataIso).split("-");
  if (!ano || !mes || !dia) return "-";
  return `${dia}/${mes}/${ano}`;
}

export function exportarRelatorioIndividualAlunoPDF({
  aluno,
  metricas,
  inicio,
  fim,
}) {
  const doc = criarDocumento("portrait");
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Relatório Individual do Aluno", pageWidth / 2, 18, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Período: ${formatarDataPtBr(inicio)} até ${formatarDataPtBr(fim)}`,
    pageWidth / 2,
    26,
    { align: "center" }
  );

  autoTable(doc, {
    startY: 34,
    head: [["Campo", "Valor"]],
    body: [
      ["Aluno", aluno?.nome || "-"],
      ["Apelido", aluno?.apelido || "-"],
      ["Turma", aluno?.turma || "-"],
      ["Categoria", aluno?.categoria_nome || "-"],
      ["Presentes", String(metricas?.presentes || 0)],
      ["Faltas", String(metricas?.faltas || 0)],
      ["Total de aulas", String(metricas?.total || 0)],
      [
        "Frequência",
        `${Math.round(Number(metricas?.taxa_presenca || 0) * 100)}%`,
      ],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: 20,
    },
    headStyles: {
      fillColor: [45, 85, 140],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: "bold" },
      1: { cellWidth: 110 },
    },
    margin: { left: 15, right: 15 },
  });

  salvarPDF(doc, "relatorio_individual_aluno.pdf");
}

export function exportarRelatorioFaltasCronicasPDF({
  linhas,
  inicio,
  fim,
  minimoFaltas,
}) {
  const doc = criarDocumento("landscape");
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Relatório de Faltas Crônicas", pageWidth / 2, 18, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Período: ${formatarDataPtBr(inicio)} até ${formatarDataPtBr(
      fim
    )} • Mínimo de faltas: ${minimoFaltas}`,
    pageWidth / 2,
    26,
    { align: "center" }
  );

  autoTable(doc, {
    startY: 34,
    head: [["#", "Aluno", "Turma", "Categoria", "Presentes", "Faltas", "Frequência"]],
    body: linhas.map((item, index) => [
      index + 1,
      item.nome || "-",
      item.turma || "-",
      item.categoria || "-",
      item.presentes,
      item.faltas,
      `${item.frequencia}%`,
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2.6,
      textColor: 20,
    },
    headStyles: {
      fillColor: [45, 85, 140],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 95 },
      2: { cellWidth: 50 },
      3: { cellWidth: 45 },
      4: { cellWidth: 30, halign: "center" },
      5: { cellWidth: 30, halign: "center" },
      6: { cellWidth: 35, halign: "center" },
    },
    margin: { left: 12, right: 12 },
  });

  salvarPDF(doc, "relatorio_faltas_cronicas.pdf");
}
