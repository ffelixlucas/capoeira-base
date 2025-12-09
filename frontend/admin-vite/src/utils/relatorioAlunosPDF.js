// utils/relatorioAlunosPDF.js
import { criarDocumento, salvarPDF } from "./pdfUtils";
import autoTable from "jspdf-autotable";

/** Une nome e apelido em formato compacto */
function formatarNomeCompleto(aluno) {
  const nome = aluno.nome || "";
  const apelido = aluno.apelido || "";

  if (apelido && apelido !== "-" && apelido !== "null" && apelido !== "undefined") {
    return `${apelido} - ${nome}`;
  }
  return nome;
}

/** Formata textos curtos */
function formatarCompacto(valor, max = 20) {
  if (!valor || valor === "-" || valor === "null") return "-";

  const texto = valor
    .toString()
    .toLowerCase()
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

  return texto.length > max ? texto.substring(0, max - 1) + "…" : texto;
}

/* ===================================================================================
   LISTA SIMPLES DE ALUNOS — PORTRAIT — APENAS AS COLUNAS QUE EXISTEM HOJE
=================================================================================== */
export function exportarListaPDFAlunos(alunos) {
  const doc = criarDocumento("portrait");
  let y = 20;

  // Título centralizado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Lista de Alunos", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });

  y += 10;

  // Ordena por nome
  const ordenados = [...alunos].sort((a, b) =>
    (a.nome || "").localeCompare(b.nome || "", "pt-BR", { sensitivity: "base" })
  );

  // COLUNAS REAIS:
  // categoria pode vir null → normalizamos para "-"
  const corpo = ordenados.map((a, idx) => [
    idx + 1,
    a.nome || "",
    a.apelido || "",
    a.turma || "-",
    a.categoria || "-",   // <<<<<<<<<<<<<<<<<<<<<<<<<<<< ADICIONADO
  ]);

  autoTable(doc, {
    startY: y + 10,

    head: [["Nº", "Nome", "Apelido", "Turma", "Categoria"]],
    body: corpo,

    styles: {
      fontSize: 9,
      cellPadding: 3,
      halign: "left",      // Alinhado à esquerda, como você pediu
      valign: "middle",
      overflow: "linebreak",
    },

    headStyles: {
      fillColor: [50, 100, 200],
      textColor: 255,
      fontStyle: "bold",
      halign: "left",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    // COLUNAS AJUSTADAS PARA CABER NO PORTRAIT
    columnStyles: {
      0: { cellWidth: 12, halign: "center" }, // Nº
      1: { cellWidth: 70 },                  // Nome
      2: { cellWidth: 45 },                  // Apelido
      3: { cellWidth: 30 },                  // Turma
      4: { cellWidth: 35 },                  // Categoria  <<<<<<<<<<<<<<<<<
    },

    margin: { left: 20, right: 20 },
    tableWidth: "auto",
  });

  // Rodapé
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const dataAtual = new Date().toLocaleDateString("pt-BR");

  doc.setFontSize(8);
  doc.text(`Gerado em ${dataAtual}`, 20, pageHeight - 10);
  doc.text(`Página 1`, pageWidth - 20, pageHeight - 10, { align: "right" });

  salvarPDF(doc, "lista_alunos.pdf");
}


/* ===================================================================================
   RELATÓRIO COMPLETO — LANDSCAPE — COM TELEFONE (ÚNICO DADO EXTRA QUE EXISTE)
=================================================================================== */
export function exportarRelatorioPDFAlunos(alunos) {
  const doc = criarDocumento("landscape");
  const pageWidth = doc.internal.pageSize.getWidth();

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("RELATÓRIO DE ALUNOS", pageWidth / 2, 20, { align: "center" });

  // Subtítulo
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const subtitulo = `${dataAtual} • Total: ${alunos.length}`;
  doc.text(subtitulo, pageWidth / 2, 27, { align: "center" });

  const alunosOrdenados = [...alunos].sort((a, b) =>
    (a.nome || "").localeCompare(b.nome || "", "pt-BR", { sensitivity: "base" })
  );

  // Somente os campos que EXISTEM hoje
  const dadosTabela = alunosOrdenados.map((aluno, index) => [
    index + 1,
    formatarNomeCompleto(aluno),
    formatarCompacto(aluno.turma, 12),
    aluno.telefone_aluno || aluno.telefone || "-",
  ]);

  autoTable(doc, {
    startY: 32,
    head: [["#", "Aluno", "Turma", "Telefone"]],
    body: dadosTabela,

    styles: {
      fontSize: 8,
      cellPadding: 3,
      halign: "left",
      valign: "middle",
      overflow: "linebreak",
    },

    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
      halign: "left",
    },

    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 120 },
      2: { cellWidth: 45 },
      3: { cellWidth: 60 },
    },

    margin: { left: 20, right: 20 },
    tableWidth: "auto",
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.text(`Gerado em: ${dataAtual}`, 20, pageHeight - 10);
  doc.text(`Página 1`, pageWidth - 20, pageHeight - 10, { align: "right" });

  salvarPDF(doc, `relatorio_alunos_${dataAtual.replace(/\//g, "-")}.pdf`);
}
