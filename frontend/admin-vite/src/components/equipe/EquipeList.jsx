import React from "react";
import { useEquipe } from "../../hooks/useEquipe";

function EquipeList() {
  const { membros, loading, erro } = useEquipe();

  if (loading) return <p className="text-gray-600">Carregando equipe...</p>;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-[800px] w-full text-sm sm:text-base">
        <thead>
          <tr className="bg-gray-100 text-gray-700 font-semibold">
            <th className="px-4 py-3 text-left">Nome</th>
            <th className="px-4 py-3 text-left">Telefone</th>
            <th className="px-4 py-3 text-left">WhatsApp</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Papéis</th> {/* NOVO */}
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {membros.map((membro) => (
            <tr
              key={membro.id}
              className="border-b hover:bg-gray-50 transition text-gray-800"
            >
              <td className="px-4 py-3">{membro.nome}</td>
              <td className="px-4 py-3">{membro.telefone || "-"}</td>
              <td className="px-4 py-3">
                {membro.whatsapp ? (
                  <a
                    href={`https://wa.me/${membro.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    WhatsApp
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3">{membro.email || "-"}</td>

              {/* PAPÉIS */}
              <td className="px-4 py-3 space-x-1 whitespace-nowrap">
                {membro.roles && membro.roles.length > 0 ? (
                  membro.roles.map((role) => (
                    <span
                      key={role.id}
                      className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {role.nome}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">Sem papel</span>
                )}
              </td>

              {/* STATUS */}
              <td className="px-4 py-3 capitalize">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    membro.status === "ativo"
                      ? "bg-green-100 text-green-700"
                      : membro.status === "inativo"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {membro.status}
                </span>
              </td>

              {/* AÇÕES */}
              <td className="px-4 py-3 space-x-2">
                <button className="text-blue-600 hover:underline">Editar</button>
                <button className="text-red-600 hover:underline">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EquipeList;
