import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaWhatsapp, FaFilePdf, FaPrint } from "react-icons/fa";
import ModalEditarInscrito from "./ModalEditarInscrito";

import jsPDF from "jspdf";

export default function ModalInscrito({ aberto, onClose, inscrito, onEditar }) {
  if (!inscrito) return null;

  const [editarAberto, setEditarAberto] = useState(false);

  // Função para formatar datas
  function formatarData(data) {
    if (!data) return "-";
    const d = new Date(data);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("pt-BR");
  }

  // Função para abrir WhatsApp
  function abrirWhatsApp(numero) {
    if (!numero) return;
    const numeroLimpo = numero.replace(/\D/g, "");
    window.open(`https://wa.me/55${numeroLimpo}`, "_blank");
  }

  function baixarFichaPDF() {
    const doc = new jsPDF();
    let y = 20;

    // --- Título centralizado ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("FICHA DE INSCRIÇÃO", 105, y, { align: "center" });
    y += 15;

    // --- Dados do inscrito ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Nome: ${inscrito.nome}`, 15, y);
    y += 8;
    doc.text(`Apelido: ${inscrito.apelido || "-"}`, 15, y);
    y += 8;
    doc.text(
      `Data de Nascimento: ${formatarData(inscrito.data_nascimento)}`,
      15,
      y
    );
    y += 8;
    doc.text(`Email: ${inscrito.email || "-"}`, 15, y);
    y += 8;
    doc.text(`Telefone: ${inscrito.telefone || "-"}`, 15, y);
    y += 8;
    doc.text(`CPF: ${inscrito.cpf || "-"}`, 15, y);
    y += 8;
    doc.text(`Status: ${inscrito.status}`, 15, y);
    y += 8;
    doc.text(
      `Valor: R$ ${
        inscrito.valor ? Number(inscrito.valor).toFixed(2) : "0,00"
      }`,
      15,
      y
    );
    y += 8;
    doc.text(`Data Inscrição: ${formatarData(inscrito.criado_em)}`, 15, y);

    // --- Espaço e seção Responsável ---
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO RESPONSÁVEL", 15, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Nome: ${inscrito.responsavel_nome || "-"}`, 15, y);
    y += 8;
    doc.text(`Documento: ${inscrito.responsavel_documento || "-"}`, 15, y);
    y += 8;
    doc.text(`Contato: ${inscrito.responsavel_contato || "-"}`, 15, y);
    y += 8;
    doc.text(`Parentesco: ${inscrito.responsavel_parentesco || "-"}`, 15, y);

    // --- Espaço e seção Autorizações ---
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("AUTORIZAÇÕES E ACEITES", 15, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(
      `Participação: ${inscrito.autorizacao_participacao ? "Sim" : "Não"}`,
      15,
      y
    );
    y += 8;
    doc.text(`Imagem: ${inscrito.autorizacao_imagem ? "Sim" : "Não"}`, 15, y);
    y += 8;
    doc.text(`Aceite Imagem: ${inscrito.aceite_imagem ? "Sim" : "Não"}`, 15, y);
    y += 8;
    doc.text(
      `Aceite Responsabilidade: ${
        inscrito.aceite_responsabilidade ? "Sim" : "Não"
      }`,
      15,
      y
    );
    y += 8;
    doc.text(`Aceite LGPD: ${inscrito.aceite_lgpd ? "Sim" : "Não"}`, 15, y);
    y += 8;
    doc.text(
      `Documento Autorização: ${inscrito.documento_autorizacao_url || "-"}`,
      15,
      y
    );

    // --- Espaço e seção Extras ---
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("EXTRAS", 15, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Tamanho Camiseta: ${inscrito.tamanho_camiseta || "-"}`, 15, y);
    y += 8;
    doc.text(
      `Alergias / Restrições: ${inscrito.alergias_restricoes || "-"}`,
      15,
      y
    );

    // Salvar PDF
    doc.save(`ficha_${inscrito.nome}.pdf`);
  }

  // Imprimir ficha
  function imprimirFicha() {
    const conteudo = `
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

  return (
    <Transition appear show={aberto} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Conteúdo do modal */}
        <div className="fixed inset-0 overflow-y-auto text-left">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-gray-800 shadow-xl transition-all">
                {/* Nome e apelido */}
                <Dialog.Title className="text-center text-lg font-bold mb-1">
                  {inscrito.apelido || "Sem apelido"}
                </Dialog.Title>
                <p className="text-sm text-center text-gray-600 mb-3">
                  {inscrito.nome}
                </p>

                {/* Dados completos */}
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Data de Nascimento:</strong>{" "}
                    {formatarData(inscrito.data_nascimento)}
                  </p>
                  <p>
                    <strong>Email:</strong> {inscrito.email || "-"}
                  </p>
                  <p className="flex items-center gap-2">
                    <strong>Telefone:</strong> {inscrito.telefone || "-"}
                    {inscrito.telefone && (
                      <FaWhatsapp
                        onClick={() => abrirWhatsApp(inscrito.telefone)}
                        className="text-green-500 cursor-pointer"
                        title="Abrir no WhatsApp"
                      />
                    )}
                  </p>
                  <p>
                    <strong>CPF:</strong> {inscrito.cpf || "-"}
                  </p>
                  <p>
                    <strong>Status:</strong> {inscrito.status}
                  </p>
                  <p>
                    <strong>Valor:</strong> R${" "}
                    {inscrito.valor
                      ? Number(inscrito.valor).toFixed(2)
                      : "0,00"}
                  </p>
                  <p>
                    <strong>Pagamento ID:</strong>{" "}
                    {inscrito.pagamento_id || "-"}
                  </p>
                  <p>
                    <strong>Data Inscrição:</strong>{" "}
                    {formatarData(inscrito.criado_em)}
                  </p>

                  {/* Dados do responsável */}
                  <p>
                    <strong>Responsável:</strong>{" "}
                    {inscrito.responsavel_nome || "-"}
                  </p>
                  <p>
                    <strong>Documento Responsável:</strong>{" "}
                    {inscrito.responsavel_documento || "-"}
                  </p>
                  <p className="flex items-center gap-2">
                    <strong>Contato Responsável:</strong>{" "}
                    {inscrito.responsavel_contato || "-"}
                    {inscrito.responsavel_contato && (
                      <FaWhatsapp
                        onClick={() =>
                          abrirWhatsApp(inscrito.responsavel_contato)
                        }
                        className="text-green-500 cursor-pointer"
                        title="Abrir no WhatsApp"
                      />
                    )}
                  </p>
                  <p>
                    <strong>Parentesco:</strong>{" "}
                    {inscrito.responsavel_parentesco || "-"}
                  </p>

                  {/* Autorização e aceite */}
                  <p>
                    <strong>Autorização Participação:</strong>{" "}
                    {inscrito.autorizacao_participacao ? "Sim" : "Não"}
                  </p>
                  <p>
                    <strong>Autorização Imagem:</strong>{" "}
                    {inscrito.autorizacao_imagem ? "Sim" : "Não"}
                  </p>
                  <p>
                    <strong>Documento Autorização:</strong>{" "}
                    {inscrito.documento_autorizacao_url || "-"}
                  </p>
                  <p>
                    <strong>Aceite Imagem:</strong>{" "}
                    {inscrito.aceite_imagem ? "Sim" : "Não"}
                  </p>
                  <p>
                    <strong>Aceite Responsabilidade:</strong>{" "}
                    {inscrito.aceite_responsabilidade ? "Sim" : "Não"}
                  </p>
                  <p>
                    <strong>Aceite LGPD:</strong>{" "}
                    {inscrito.aceite_lgpd ? "Sim" : "Não"}
                  </p>

                  {/* Extras */}
                  <p>
                    <strong>Tamanho Camiseta:</strong>{" "}
                    {inscrito.tamanho_camiseta || "-"}
                  </p>
                  <p>
                    <strong>Alergias / Restrições:</strong>{" "}
                    {inscrito.alergias_restricoes || "-"}
                  </p>
                </div>

                {/* Ações */}
                <div className="mt-6 flex flex-wrap justify-between gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={baixarFichaPDF}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
                    >
                      <FaFilePdf /> PDF
                    </button>
                    <button
                      onClick={imprimirFicha}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
                    >
                      <FaPrint /> Imprimir
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditarAberto(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const resp = await fetch(
                            `/public/inscricoes/${inscrito.id}/reenviar-email`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                            }
                          );
                          const data = await resp.json();

                          if (data.ok) {
                            alert(`✅ ${data.mensagem}`);
                          } else {
                            alert(
                              `❌ Erro ao reenviar: ${
                                data.error || "Falha desconhecida"
                              }`
                            );
                          }
                        } catch (err) {
                          console.error("Erro no reenvio:", err);
                          alert("❌ Falha ao reenviar e-mail");
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                    >
                      Reenviar E-mail
                    </button>

                    <button
                      onClick={onClose}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
        {/* Modal de edição renderizado fora das actions */}
        <ModalEditarInscrito
          aberto={editarAberto}
          onClose={() => setEditarAberto(false)}
          inscrito={inscrito}
          onSalvo={(dadosAtualizados) => {
            // Atualiza os dados do modal imediatamente
            Object.assign(inscrito, dadosAtualizados);

            // Dispara callback para atualizar a lista
            onEditar?.(dadosAtualizados);

            // Fecha modal de edição
            setEditarAberto(false);
          }}
        />
      </Dialog>
    </Transition>
  );
}
