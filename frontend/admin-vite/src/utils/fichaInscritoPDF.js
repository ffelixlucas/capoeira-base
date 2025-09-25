// src/utils/fichaInscritoPDF.js
import jsPDF from "jspdf";

export function baixarFichaPDF(inscrito, formatarData, formatBool) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("FICHA DE INSCRIÇÃO", 105, y, { align: "center" });
  y += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Apelido: ${inscrito.apelido || "Sem apelido"}`, 15, y); y += 8;
  doc.text(`Nome: ${inscrito.nome}`, 15, y); y += 8;
  doc.text(`Data de Nascimento: ${formatarData(inscrito.data_nascimento)}`, 15, y); y += 8;
  doc.text(`Email: ${inscrito.email || "-"}`, 15, y); y += 8;
  doc.text(`Telefone: ${inscrito.telefone || "-"}`, 15, y); y += 8;
  doc.text(`CPF: ${inscrito.cpf || "-"}`, 15, y); y += 8;
  doc.text(`Categoria: ${inscrito.categoria || "-"}`, 15, y); y += 8;
  if (inscrito.graduacao) { doc.text(`Graduação: ${inscrito.graduacao}`, 15, y); y += 8; }
  doc.text(`Status: ${inscrito.status}`, 15, y); y += 8;
  doc.text(`Valor bruto: R$ ${inscrito.valor_bruto || "0,00"}`, 15, y); y += 8;
  doc.text(`Valor líquido: R$ ${inscrito.valor_liquido || "0,00"}`, 15, y); y += 8;
  doc.text(`Forma de pagamento: ${inscrito.metodo_pagamento || "-"}`, 15, y); y += 8;
  doc.text(`Parcelas: ${inscrito.parcelas || 1}`, 15, y); y += 8;
  doc.text(`Pagamento ID: ${inscrito.pagamento_id || "-"}`, 15, y); y += 8;
  doc.text(`Data Inscrição: ${formatarData(inscrito.criado_em)}`, 15, y); y += 12;

  if (inscrito.responsavel_nome) {
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO RESPONSÁVEL", 15, y); y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Nome: ${inscrito.responsavel_nome}`, 15, y); y += 8;
    if (inscrito.responsavel_documento) { doc.text(`Documento: ${inscrito.responsavel_documento}`, 15, y); y += 8; }
    if (inscrito.responsavel_contato) { doc.text(`Contato: ${inscrito.responsavel_contato}`, 15, y); y += 8; }
    if (inscrito.responsavel_parentesco) { doc.text(`Parentesco: ${inscrito.responsavel_parentesco}`, 15, y); y += 8; }
    y += 12;
  }

  doc.setFont("helvetica", "bold");
  doc.text("AUTORIZAÇÕES E ACEITES", 15, y); y += 8;
  doc.setFont("helvetica", "normal");
  doc.text(`Participação: ${formatBool(inscrito.autorizacao_participacao)}`, 15, y); y += 8;
  doc.text(`Imagem: ${formatBool(inscrito.autorizacao_imagem)}`, 15, y); y += 8;
  doc.text(`Aceite Imagem: ${formatBool(inscrito.aceite_imagem)}`, 15, y); y += 8;
  doc.text(`Aceite Responsabilidade: ${formatBool(inscrito.aceite_responsabilidade)}`, 15, y); y += 8;
  doc.text(`Aceite LGPD: ${formatBool(inscrito.aceite_lgpd)}`, 15, y); y += 8;
  if (inscrito.documento_autorizacao_url) { doc.text(`Documento Autorização: ${inscrito.documento_autorizacao_url}`, 15, y); y += 8; }

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.text("EXTRAS", 15, y); y += 8;
  doc.setFont("helvetica", "normal");
  doc.text(`Tamanho Camiseta: ${inscrito.tamanho_camiseta || "-"}`, 15, y); y += 8;
  if (inscrito.alergias_restricoes) {
    doc.text(`Alergias / Restrições: ${inscrito.alergias_restricoes}`, 15, y);
  }

  doc.save(`ficha_${inscrito.apelido || inscrito.nome}.pdf`);
}

export function imprimirFicha(inscrito) {
  const conteudo = `
  Apelido: ${inscrito.apelido || "Sem apelido"}
  Nome: ${inscrito.nome}
  Telefone: ${inscrito.telefone || "-"}
  Email: ${inscrito.email || "-"}
  CPF: ${inscrito.cpf || "-"}
  Status: ${inscrito.status}
  `;
  const win = window.open("", "_blank", "width=800,height=600");
  win.document.write(`
    <html>
      <head>
        <title>Ficha do Inscrito</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; }
        </style>
      </head>
      <body>
        <h2>Ficha de Inscrição</h2>
        <pre>${conteudo}</pre>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}
