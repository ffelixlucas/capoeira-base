import { Plus, Pencil, Trash, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function ConfigCategorias({
  categorias = [],
  onAddCategoria,
  onAddGraduacao,
  onEditCategoria,
  onDeleteCategoria,
  onEditGraduacao,
  onDeleteGraduacao,
}) {
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  const [estadoLocal, setEstadoLocal] = useState({});
  const [expandido, setExpandido] = useState({});

  function toggleExpand(catId) {
    setExpandido((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  }

  function abrirFormGraduacao(catId) {
    setEstadoLocal((prev) => ({
      ...prev,
      [catId]: { criando: true, nome: "", ordem: "" },
    }));
  }

  function atualizarCampo(catId, campo, valor) {
    setEstadoLocal((prev) => ({
      ...prev,
      [catId]: { ...prev[catId], [campo]: valor },
    }));
  }

  function cancelarForm(catId) {
    setEstadoLocal((prev) => ({
      ...prev,
      [catId]: { criando: false, nome: "", ordem: "" },
    }));
  }

  return (
    <div className="bg-cor-card p-4 sm:p-6 rounded-2xl border border-cor-secundaria/30 space-y-6">

      {/* TÍTULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-cor-titulo">Categorias e Graduações</h2>

        <button
          onClick={() => setCriando(true)}
          className="flex items-center justify-center gap-2 bg-cor-primaria text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cor-primaria/90 w-full sm:w-auto"
        >
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      {/* CRIAR CATEGORIA */}
      {criando && (
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-3 rounded-lg border shadow">
          <input
            type="text"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Nome da categoria"
            className="flex-1 border px-3 py-2 rounded-md w-full text-black"
          />

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                if (!novoNome.trim()) return;
                onAddCategoria(novoNome.trim());
                setNovoNome("");
                setCriando(false);
              }}
              className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white rounded-md text-sm"
            >
              Salvar
            </button>

            <button
              onClick={() => {
                setCriando(false);
                setNovoNome("");
              }}
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-300 rounded-md text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* LISTA DE CATEGORIAS */}
      <div className="space-y-3">
        {categorias.map((cat) => {
          const estado = estadoLocal[cat.id] || {
            criando: false,
            editando: false,
            nome: cat.nome,
            ordem: "",
          };

          return (
            <div key={cat.id} className="rounded-lg">

              {/* HEADER DA CATEGORIA */}
              <div
                className="group flex items-center justify-between bg-white p-3 rounded-lg shadow border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  if (!e.target.closest(".categoria-acoes")) {
                    toggleExpand(cat.id);
                  }
                }}
              >
                <div className="flex items-center gap-3">

                  {/* Ícone */}
                  <div className="flex items-center text-cor-primaria">
                    {expandido[cat.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>

                  {/* Campo de edição inline */}
                  {estado.editando ? (
                    <input
                      type="text"
                      className="border px-2 py-1 rounded text-sm text-black"
                      value={estado.nome}
                      onChange={(e) =>
                        setEstadoLocal((prev) => ({
                          ...prev,
                          [cat.id]: { ...prev[cat.id], nome: e.target.value },
                        }))
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="font-semibold text-black">{cat.nome}</span>
                  )}

                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {cat.graduacoes?.length || 0} graduações
                  </span>
                </div>

                {/* AÇÕES DA CATEGORIA */}
                <div className="categoria-acoes flex items-center gap-1">

                  {estado.editando ? (
                    <>
                      {/* Salvar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!estado.nome.trim()) return;

                          onEditCategoria(cat.id, estado.nome.trim());

                          setEstadoLocal((prev) => ({
                            ...prev,
                            [cat.id]: { ...prev[cat.id], editando: false },
                          }));
                        }}
                        className="p-2 rounded hover:bg-green-100 transition-colors"
                        title="Salvar"
                      >
                        ✔
                      </button>

                      {/* Cancelar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEstadoLocal((prev) => ({
                            ...prev,
                            [cat.id]: { ...prev[cat.id], editando: false, nome: cat.nome },
                          }));
                        }}
                        className="p-2 rounded hover:bg-gray-200 transition-colors"
                        title="Cancelar"
                      >
                        ✖
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Editar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEstadoLocal((prev) => ({
                            ...prev,
                            [cat.id]: { ...prev[cat.id], editando: true, nome: cat.nome },
                          }));
                        }}
                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Editar categoria"
                      >
                        <Pencil size={16} className="text-gray-600" />
                      </button>

                      {/* Excluir */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategoria(cat.id);
                        }}
                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Excluir categoria"
                      >
                        <Trash size={16} className="text-red-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ÁREA COLAPSÁVEL DE GRADUAÇÕES */}
              <div
                className={`
                  border-l-2 border-gray-200 ml-4 pl-4 mt-1 overflow-hidden transition-all duration-300 ease-in-out
                  ${expandido[cat.id] ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}
                `}
              >
                <div className="space-y-2 py-3">

                  {/* LISTA DE GRADUAÇÕES */}
                  {cat.graduacoes?.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-md border hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-cor-primaria text-white text-xs rounded-full">
                          {g.ordem}
                        </span>

                        <span className="text-sm text-black font-medium">
                          {g.nome}
                        </span>
                      </div>

                      <div className="categoria-acoes flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditGraduacao(g);
                          }}
                          className="p-2 rounded hover:bg-white transition-colors"
                          title="Editar graduação"
                        >
                          <Pencil size={14} className="text-gray-600" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteGraduacao(g.id);
                          }}
                          className="p-2 rounded hover:bg-white transition-colors"
                          title="Excluir graduação"
                        >
                          <Trash size={14} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* FORM DE CRIAR GRADUAÇÃO */}
                  {estado.criando ? (
                    <div className="bg-white p-4 rounded-md border shadow space-y-3 mt-2">
                      <input
                        type="text"
                        placeholder="Nome da graduação"
                        className="w-full border px-3 py-2 rounded-md text-black text-sm"
                        value={estado.nome}
                        onChange={(e) =>
                          atualizarCampo(cat.id, "nome", e.target.value)
                        }
                      />

                      <input
                        type="number"
                        placeholder="Ordem numérica"
                        className="w-full border px-3 py-2 rounded-md text-black text-sm"
                        value={estado.ordem}
                        onChange={(e) =>
                          atualizarCampo(cat.id, "ordem", e.target.value)
                        }
                      />

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!estado.nome.trim()) return;
                            if (!estado.ordem) return;

                            await onAddGraduacao(
                              cat.id,
                              estado.nome.trim(),
                              Number(estado.ordem)
                            );

                            cancelarForm(cat.id);
                          }}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Salvar Graduação
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelarForm(cat.id);
                          }}
                          className="flex-1 px-3 py-2 bg-gray-300 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirFormGraduacao(cat.id);
                      }}
                      className="flex items-center justify-center gap-2 text-sm text-cor-primaria font-medium mt-3 p-2 rounded-lg border border-dashed border-cor-primaria/30 hover:bg-cor-primaria/5 hover:border-cor-primaria/50 transition-all"
                    >
                      <Plus size={16} /> Adicionar Graduação
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
