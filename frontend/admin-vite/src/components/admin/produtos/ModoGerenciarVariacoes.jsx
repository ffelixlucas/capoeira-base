import { useEffect, useState, useCallback } from "react"
import { variacoesService } from "../../../services/variacoesService"
import { toast } from "react-toastify"

function obterPlaceholderValor(nomeTipo = "") {
  const nome = nomeTipo.toLowerCase()

  if (nome.includes("tamanho")) return "Ex: P, M, G"
  if (nome.includes("cor")) return "Ex: Preto, Branco, Azul"
  if (nome.includes("manga")) return "Ex: Sim"
  if (nome.includes("nome")) return "Ex: Sem nome, Com nome"

  return "Ex: opção 1, opção 2"
}

function obterDicaTipo(nomeTipo = "") {
  const nome = nomeTipo.toLowerCase()

  if (nome.includes("manga")) {
    return 'Dica: para marcações simples como "Manga comprida", basta um único valor como "Sim". Na geração da versão isso pode aparecer como checkbox.'
  }

  return "Tipo é o nome do grupo. Valor é cada opção que vai aparecer no select."
}

export default function ModoGerenciarVariacoes({ setModo, tipoInicialId = null }) {

  const [tipos, setTipos] = useState([])
  const [tipoSelecionado, setTipoSelecionado] = useState(null)
  const [valores, setValores] = useState([])

  const [novoTipo, setNovoTipo] = useState("")
  const [novoValor, setNovoValor] = useState("")
  const [editandoTipoId, setEditandoTipoId] = useState(null)
  const [nomeTipoEdicao, setNomeTipoEdicao] = useState("")
  const [editandoValorId, setEditandoValorId] = useState(null)
  const [valorEdicao, setValorEdicao] = useState("")

  const [loadingTipo, setLoadingTipo] = useState(false)
  const [loadingValor, setLoadingValor] = useState(false)
  const [savingTipoId, setSavingTipoId] = useState(null)
  const [savingValorId, setSavingValorId] = useState(null)

  /* ===============================
     CARREGAR TIPOS
  =============================== */

  const carregarTipos = useCallback(async () => {
    try {
      const data = await variacoesService.listarTipos()
      setTipos(data)
    } catch {
      toast.error("Erro ao carregar tipos")
    }
  }, [])

  useEffect(() => {
    carregarTipos()
  }, [carregarTipos])

  useEffect(() => {
    if (!tipoInicialId || tipos.length === 0) return

    const tipoInicial = tipos.find((tipo) => tipo.id === tipoInicialId)
    if (tipoInicial) {
      setTipoSelecionado(tipoInicial)
    }
  }, [tipoInicialId, tipos])

  /* ===============================
     CARREGAR VALORES
  =============================== */

  const carregarValores = useCallback(async (tipoId) => {
    try {
      const data = await variacoesService.listarValores(tipoId)
      setValores(data)
    } catch {
      toast.error("Erro ao carregar valores")
    }
  }, [])

  useEffect(() => {
    if (!tipoSelecionado) {
      setValores([])
      return
    }

    carregarValores(tipoSelecionado.id)
  }, [tipoSelecionado, carregarValores])

  /* ===============================
     CRIAR TIPO
  =============================== */

  async function criarTipo() {

    if (!novoTipo.trim()) {
      toast.warn("Digite o nome do tipo")
      return
    }

    try {
      setLoadingTipo(true)

      await variacoesService.criarTipo({
        nome: novoTipo.trim()
      })

      toast.success("Tipo criado com sucesso")
      setNovoTipo("")
      await carregarTipos()

    } catch {
      toast.error("Erro ao criar tipo")
    } finally {
      setLoadingTipo(false)
    }
  }

  async function salvarTipoEdicao(tipo) {
    const nome = nomeTipoEdicao.trim()

    if (!nome) {
      toast.warn("Digite o nome do tipo")
      return
    }

    try {
      setSavingTipoId(tipo.id)
      await variacoesService.atualizarTipo(tipo.id, { nome })
      toast.success("Tipo atualizado")
      setEditandoTipoId(null)
      setNomeTipoEdicao("")
      await carregarTipos()
      setTipoSelecionado((atual) =>
        atual?.id === tipo.id ? { ...atual, nome } : atual
      )
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erro ao atualizar tipo"
      )
    } finally {
      setSavingTipoId(null)
    }
  }

  /* ===============================
     CRIAR VALOR
  =============================== */

  async function criarValor() {

    if (!tipoSelecionado) {
      toast.warn("Selecione um tipo primeiro")
      return
    }

    if (!novoValor.trim()) {
      toast.warn("Digite o valor")
      return
    }

    try {
      setLoadingValor(true)

      await variacoesService.criarValor({
        tipoId: tipoSelecionado.id,
        valor: novoValor.trim()
      })

      toast.success("Valor criado")
      setNovoValor("")
      await carregarValores(tipoSelecionado.id)

    } catch {
      toast.error("Erro ao criar valor")
    } finally {
      setLoadingValor(false)
    }
  }

  async function salvarValorEdicao(valor) {
    const texto = valorEdicao.trim()

    if (!texto) {
      toast.warn("Digite o valor")
      return
    }

    try {
      setSavingValorId(valor.id)
      await variacoesService.atualizarValor(valor.id, { valor: texto })
      toast.success("Valor atualizado")
      setEditandoValorId(null)
      setValorEdicao("")
      await carregarValores(tipoSelecionado.id)
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erro ao atualizar valor"
      )
    } finally {
      setSavingValorId(null)
    }
  }

  /* ===============================
     REMOVER VALOR
  =============================== */

  async function removerValor(valorId) {

    const confirmar = window.confirm(
      "Tem certeza que deseja remover este valor?"
    )

    if (!confirmar) return

    try {
      await variacoesService.excluirValor(valorId)
      toast.success("Valor removido")
      await carregarValores(tipoSelecionado.id)
    } catch {
      toast.error("Erro ao remover valor")
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-on-surface">
          Gerenciar Estrutura de Variações
        </h2>
        <p className="text-sm text-on-surface/60 mt-1">
          Tipo é o nome do grupo. Valor é a opção que aparece no produto ou marca a variação.
        </p>
      </div>

      {/* Criar Tipo */}
      <div className="bg-surface p-4 rounded-xl border border-border">
        <label className="block text-sm font-medium text-on-surface mb-2">
          Criar novo tipo
        </label>

        <div className="flex gap-3">
          <input
            type="text"
            className="input-admin flex-1"
            placeholder="Ex: tamanho, cor, material"
            value={novoTipo}
            onChange={(e) => setNovoTipo(e.target.value)}
          />

          <button
            onClick={criarTipo}
            disabled={loadingTipo}
            className="btn-primary whitespace-nowrap"
          >
            {loadingTipo ? "..." : "+ Criar"}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Lista de Tipos */}
        <div>
          <h3 className="text-sm font-semibold text-on-surface mb-3">
            Tipos existentes
          </h3>

          <div className="space-y-2">
            {tipos.map((tipo) => (
              <div
                key={tipo.id}
                className={`p-3 rounded-lg border cursor-pointer text-sm transition-colors
                  ${
                    tipoSelecionado?.id === tipo.id
                      ? "border-cor-primaria bg-cor-primaria/5 text-cor-primaria"
                      : "border-border bg-surface hover:border-cor-primaria/30"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoSelecionado(tipo)}
                    className="flex-1 text-left"
                  >
                    {editandoTipoId === tipo.id ? (
                      <input
                        type="text"
                        value={nomeTipoEdicao}
                        onChange={(e) => setNomeTipoEdicao(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="input-admin w-full"
                        autoFocus
                      />
                    ) : (
                      tipo.nome
                    )}
                  </button>

                  {editandoTipoId === tipo.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => salvarTipoEdicao(tipo)}
                        disabled={savingTipoId === tipo.id}
                        className="text-xs font-medium text-cor-primaria"
                      >
                        {savingTipoId === tipo.id ? "..." : "Salvar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditandoTipoId(null)
                          setNomeTipoEdicao("")
                        }}
                        className="text-xs text-on-surface/60"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setTipoSelecionado(tipo)
                        setEditandoTipoId(tipo.id)
                        setNomeTipoEdicao(tipo.nome)
                      }}
                      className="text-xs text-on-surface/60 hover:text-cor-primaria"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>
            ))}

            {tipos.length === 0 && (
              <div className="text-sm text-on-surface/40 italic p-3">
                Nenhum tipo criado ainda
              </div>
            )}
          </div>
        </div>

        {/* Valores */}
        {tipoSelecionado ? (
          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-3">
              Valores de:{" "}
              <span className="text-cor-primaria">
                {tipoSelecionado.nome}
              </span>
            </h3>

            <div className="bg-surface p-4 rounded-xl border border-border">
              <div className="mb-4 rounded-lg border border-cor-secundaria/20 bg-cor-secundaria/5 p-3 text-xs leading-relaxed text-on-surface/70">
                {obterDicaTipo(tipoSelecionado.nome)}
              </div>

              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {valores.map((valor) => (
                  <div
                    key={valor.id}
                    className="flex justify-between items-center p-2 rounded-lg border border-border text-sm"
                  >
                    <div className="flex-1 pr-3">
                      {editandoValorId === valor.id ? (
                        <input
                          type="text"
                          value={valorEdicao}
                          onChange={(e) => setValorEdicao(e.target.value)}
                          className="input-admin w-full"
                          autoFocus
                        />
                      ) : (
                        valor.valor
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {editandoValorId === valor.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => salvarValorEdicao(valor)}
                            disabled={savingValorId === valor.id}
                            className="text-xs font-medium text-cor-primaria"
                          >
                            {savingValorId === valor.id ? "..." : "Salvar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditandoValorId(null)
                              setValorEdicao("")
                            }}
                            className="text-xs text-on-surface/60"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditandoValorId(valor.id)
                            setValorEdicao(valor.valor)
                          }}
                          className="text-on-surface/40 hover:text-cor-primaria text-xs transition-colors"
                        >
                          Editar
                        </button>
                      )}

                      <button
                        onClick={() => removerValor(valor.id)}
                        className="text-on-surface/40 hover:text-red-500 text-xs transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}

                {valores.length === 0 && (
                  <div className="text-sm text-on-surface/40 italic text-center py-4">
                    Nenhum valor cadastrado
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  className="input-admin flex-1"
                  placeholder={obterPlaceholderValor(tipoSelecionado.nome)}
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                />

                <button
                  onClick={criarValor}
                  disabled={loadingValor}
                  className="btn-primary whitespace-nowrap"
                >
                  {loadingValor ? "..." : "+ Add"}
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-surface/50 rounded-xl border border-border p-6 flex items-center justify-center">
            <p className="text-sm text-on-surface/40 text-center">
              Selecione um tipo para gerenciar seus valores
            </p>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <button
          onClick={() => setModo("criar")}
          className="text-sm text-on-surface/60 hover:text-cor-primaria transition-colors"
        >
          ← Voltar
        </button>
      </div>

    </div>
  )
}
