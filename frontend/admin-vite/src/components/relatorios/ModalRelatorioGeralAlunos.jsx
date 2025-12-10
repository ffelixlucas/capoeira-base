import React from "react";
import { exportarListaPDFAlunos } from "../../utils/relatorioAlunosPDF";

export default function ModalRelatorioGeralAlunos({
  aberto,
  onClose,
  alunos,
  turmas,
  turmaSelecionada,
  onTrocarTurma,
}) {
  if (!aberto) return null;

  const isMobile = window.innerWidth <= 768;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2">
      {/* MOBILE — fullscreen */}
      {isMobile && (
        <div className="bg-white w-full h-full rounded-lg p-4 overflow-y-auto relative">
          {/* Fechar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 text-2xl"
          >
            ✕
          </button>

          {/* Título */}
          <h2 className="text-xl font-bold text-black text-center mb-4">
            Relatório Geral de Alunos
          </h2>

          {/* Filtro de turma */}
          <div className="w-full mb-4">
            <label className="text-sm font-medium text-black">
              Filtrar por turma:
            </label>

            <select
              className="w-full p-2 border rounded-md bg-white text-black mt-1"
              value={turmaSelecionada}
              onChange={(e) => onTrocarTurma(e.target.value)}
            >
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-black">
                  <th className="p-2 border">Nº</th>
                  <th className="p-2 border">Nome</th>
                  <th className="p-2 border">Apelido</th>
                  <th className="p-2 border">Turma</th>
                  <th className="p-2 border">Categoria</th>
                </tr>
              </thead>

              <tbody>
                {alunos.map((a, index) => (
                  <tr key={index} className="hover:bg-gray-50 text-black">
                    <td className="p-2 border text-center">{index + 1}</td>
                    <td className="p-2 border">{a.nome || "-"}</td>
                    <td className="p-2 border">{a.apelido || "-"}</td>
                    <td className="p-2 border">{a.turma || "-"}</td>
                    <td className="p-2 border">{a.categoria_nome || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botão PDF */}
          <div className="w-full mt-6">
            <button
              className="w-full bg-cor-primaria hover:bg-cor-destaque text-black py-3 rounded-md shadow font-medium"
                onClick={() => exportarListaPDFAlunos(alunos)}
            >
              📄 Exportar PDF
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP — preview tipo A4 */}
      {!isMobile && (
        <div className="bg-white shadow-xl border border-gray-300 p-6 rounded-lg max-w-[900px] max-h-[95vh] overflow-y-auto relative">
          {/* Fechar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 text-xl"
          >
            ✕
          </button>

          <div
            className="mx-auto bg-white p-6"
            style={{ width: "700px", minHeight: "80vh" }}
          >
            {/* Título */}
            <h2 className="text-2xl font-bold text-black text-center mb-4">
              Relatório Geral de Alunos
            </h2>

            {/* Filtro de turma */}
            <div className="w-full mb-4">
              <label className="text-sm font-medium text-black">
                Filtrar por turma:
              </label>

              <select
                className="w-full p-2 border rounded-md bg-white text-black mt-1"
                value={turmaSelecionada}
                onChange={(e) => onTrocarTurma(e.target.value)}
              >
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Tabela */}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-black">
                  <th className="p-2 border">Nº</th>
                  <th className="p-2 border">Nome</th>
                  <th className="p-2 border">Apelido</th>
                  <th className="p-2 border">Turma</th>
                  <th className="p-2 border">Categoria</th>
                </tr>
              </thead>

              <tbody>
                {alunos.map((a, index) => (
                  <tr key={index} className="hover:bg-gray-50 text-black">
                    <td className="p-2 border text-center">{index + 1}</td>
                    <td className="p-2 border">{a.nome || "-"}</td>
                    <td className="p-2 border">{a.apelido || "-"}</td>
                    <td className="p-2 border">{a.turma || "-"}</td>
                    <td className="p-2 border">{a.categoria_nome || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Botão PDF */}
            <div className="flex justify-end mt-6">
              <button
                className="bg-cor-primaria hover:bg-cor-destaque text-black px-4 py-2 rounded-md shadow font-medium"
                onClick={() => exportarListaPDFAlunos(alunos)}
              >
                📄 Exportar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
