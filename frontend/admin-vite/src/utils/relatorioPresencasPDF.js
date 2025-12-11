import { criarDocumento, salvarPDF } from "./pdfUtils";
import autoTable from "jspdf-autotable";

function formatarNome(a) {
  if (a.apelido) return `${a.apelido} – ${a.nome}`;
  return a.nome;
}

function corPercentual(p) {
  if (p >= 75) return { text: `${p}%`, color: "#16a34a" };
  if (p >= 50) return { text: `${p}%`, color: "#ca8a04" };
  return { text: `${p}%`, color: "#dc2626" };
}

function capitalizar(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function exportarRelatorioPresencasPDF({
  turmaNome,
  inicio,
  fim,
  metricas,
}) {
  const doc = criarDocumento("portrait");
  let y = 20;

  // TÍTULO
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    `Relatório de Presença — ${turmaNome}`,
    doc.internal.pageSize.getWidth() / 2,
    y,
    { align: "center" }
  );

  y += 10;

  // SUBTÍTULO
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Período: ${inicio} até ${fim}`,
    doc.internal.pageSize.getWidth() / 2,
    y,
    { align: "center" }
  );

  y += 10;

  // PREPARA DADOS
  const corpo = metricas.map((a, idx) => ({
    numero: idx + 1,
    nomeObj: {
      apelido: a.apelido ? capitalizar(a.apelido) : null,
      nome: capitalizar(a.nome),
      temApelido: Boolean(a.apelido),
    },
    presencas: a.metricas.presentes,
    faltas: a.metricas.faltas,
    total: a.metricas.total,
    percentual: "",
    turma: a.turma || "-",
    categoria: a.categoria_nome || "-",
    corPercentual: a.metricas.percentual ?? 0,
  }));

  // TABELA — CENTRALIZAÇÃO VISUAL ESTÁVEL
  autoTable(doc, {
    startY: y,
    head: [["Nº", "Nome", "P", "F", "Total", "%", "Turma", "Categoria"]],
    body: corpo.map((l) => [
      l.numero,
      "",
      l.presencas,
      l.faltas,
      l.total,
      l.percentual,
      l.turma,
      l.categoria,
    ]),

    tableWidth: "auto",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
      valign: "middle",
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
    },

    headStyles: {
      fillColor: [230, 200, 40],
      textColor: 0,
      fontStyle: "bold",
      halign: "center",
    },

    columnStyles: {
      1: { halign: "left", cellWidth: 75 },
      6: { halign: "left" }, // Turma
      7: { halign: "left" }, // Categoria
    },

    margin: { left: 20, right: 20 }, // não mexe mais

    didDrawCell: function (data) {
      // ------------------- DESENHAR O NOME MANUALMENTE -------------------
      if (data.section === "body" && data.column.index === 1) {
        const linha = corpo[data.row.index];
        if (!linha) return;

        const { apelido, nome, temApelido } = linha.nomeObj;

        const x = data.cell.x + 2;
        const y = data.cell.y + data.cell.height / 2 + 2;

        if (temApelido) {
          // Apelido normal
          doc.setFont("helvetica", "normal");
          doc.text(apelido, x, y);

          // Tamanho do apelido + separador
          const wApelido = doc.getTextWidth(apelido + " – ");

          // separador
          doc.text(" – ", x + doc.getTextWidth(apelido), y);

          // Nome itálico
          doc.setFont("helvetica", "italic");
          doc.text(nome, x + wApelido, y);

          // volta ao normal
          doc.setFont("helvetica", "normal");
        } else {
          // Nome normal (sem itálico)
          doc.setFont("helvetica", "normal");
          doc.text(nome, x, y);
        }
      }
    },
  });

  // RODAPÉ
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(8);

  const dataAtual = new Date().toLocaleDateString("pt-BR");

  doc.text(`Gerado em ${dataAtual}`, 14, pageHeight - 10);
  doc.text(`Página 1`, pageWidth - 14, pageHeight - 10, { align: "right" });

  salvarPDF(doc, "relatorio_presencas.pdf");
}
