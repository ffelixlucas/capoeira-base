import { useEffect, useState, useCallback } from 'react'
import { variacoesService } from '../../../services/variacoesService'
import { produtosService } from '../../../services/produtosService'
import { toast } from 'react-toastify'
import InfoTip from '../../ui/InfoTip'
import ModoGerenciarVariacoes from './ModoGerenciarVariacoes'

const VALOR_BOOLEANO_PADRAO = 'Sim'
const VALOR_TEMPORARIO_BOOLEANO = '__BOOL_SIM__'

function normalizarTexto(valor) {
  return String(valor || '').trim().toLowerCase()
}

function obterExemploDoTipo(nomeTipo) {
  const nome = nomeTipo.toLowerCase()

  if (nome.includes('tamanho')) return 'Ex.: P, M, G'
  if (nome.includes('cor')) return 'Ex.: Preto, Branco, Azul'
  if (nome.includes('manga')) return 'Ex.: Curta, Comprida'
  if (nome.includes('nome')) return 'Ex.: Sem nome, Com nome'

  return 'Cadastre pelo menos uma opção para esse tipo.'
}

function obterOrientacaoDoTipo(nomeTipo) {
  const nome = nomeTipo.toLowerCase()

  if (nome.includes('manga')) {
    return 'Se isso for só uma marcação, você pode usar o checkbox e o sistema grava internamente "Sim".'
  }

  return 'Tipo é o nome do grupo. Valor é a opção que aparece no select.'
}

function ehMarcacaoSimples(valores) {
  if (valores.length === 0) return true
  if (valores.length !== 1) return false

  return normalizarTexto(valores[0]?.valor) === normalizarTexto(VALOR_BOOLEANO_PADRAO)
}

async function garantirValorBooleano(tipoId) {
  try {
    await variacoesService.criarValor({
      tipoId,
      valor: VALOR_BOOLEANO_PADRAO
    })
  } catch {
    // Se outro fluxo já criou, seguimos e buscamos novamente.
  }

  const valoresAtualizados = await variacoesService.listarValores(tipoId)
  const valorBooleano = valoresAtualizados.find(
    (valor) => normalizarTexto(valor.valor) === normalizarTexto(VALOR_BOOLEANO_PADRAO)
  )

  return {
    valorBooleano,
    valoresAtualizados
  }
}

export default function ModalGerarVariacoes({
  open,
  onClose,
  produtoId,
  onSuccess
}) {
  const [permitirEncomenda, setPermitirEncomenda] = useState(false)
  const [tipos, setTipos] = useState([])
  const [valoresPorTipo, setValoresPorTipo] = useState({})
  const [selecionados, setSelecionados] = useState({})
  const [tiposAtivos, setTiposAtivos] = useState({})
  const [preco, setPreco] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState('criar')
  const [tipoInicialGerenciar, setTipoInicialGerenciar] = useState(null)

  /* ===============================
     RECARREGAR ESTRUTURA
  =============================== */

  const recarregarEstrutura = useCallback(async () => {
    try {
      const tiposData = await variacoesService.listarTipos()
      setTipos(tiposData)

      const mapa = {}

      for (const tipo of tiposData) {
        const valores = await variacoesService.listarValores(tipo.id)
        mapa[tipo.id] = valores
      }

      setValoresPorTipo(mapa)
      setSelecionados({})
      setTiposAtivos({})
    } catch {
      toast.error('Erro ao carregar variações')
    }
  }, [])

  useEffect(() => {
    if (!open) return
    recarregarEstrutura()
  }, [open, recarregarEstrutura])

  /* ===============================
     SELEÇÃO
  =============================== */

  function selecionarValor(tipoId, valorId) {
    setSelecionados(prev => ({
      ...prev,
      [tipoId]: valorId || null
    }))
  }

  function toggleTipoAtivo(tipo, ativo) {
    const valores = valoresPorTipo[tipo.id] || []
    const usarMarcacaoSimples = ehMarcacaoSimples(valores)

    setTiposAtivos((prev) => ({
      ...prev,
      [tipo.id]: ativo
    }))

    setSelecionados((prev) => {
      const proximos = { ...prev }

      if (!ativo) {
        delete proximos[tipo.id]
        return proximos
      }

      if (usarMarcacaoSimples) {
        proximos[tipo.id] = valores[0]?.id || VALOR_TEMPORARIO_BOOLEANO
      }

      return proximos
    })
  }

  function obterResumo() {
    return tipos
      .map(tipo => {
        if (!tiposAtivos[tipo.id]) return null
        const valorId = selecionados[tipo.id]
        if (!valorId) return null
        if (valorId === VALOR_TEMPORARIO_BOOLEANO) return tipo.nome
        const valor = valoresPorTipo[tipo.id]?.find(v => v.id === valorId)
        return valor?.valor || null
      })
      .filter(Boolean)
      .join(' • ')
  }

  /* ===============================
     CRIAR VARIAÇÃO
  =============================== */

  async function criarVariacao() {
    const valoresIds = []

    const tipoTamanho = tipos.find(
      t => t.nome.toLowerCase() === 'tamanho'
    )

    const tiposSelecionados = tipos.filter((tipo) => tiposAtivos[tipo.id])

    if (tiposSelecionados.length === 0) {
      toast.warn('Marque pelo menos um tipo para esta versão')
      return
    }

    if (tipoTamanho && tiposAtivos[tipoTamanho.id] && !selecionados[tipoTamanho.id]) {
      toast.warn('Selecione o tamanho da camiseta')
      return
    }

    const tipoPendente = tiposSelecionados.find((tipo) => {
      const valores = valoresPorTipo[tipo.id] || []

      if (ehMarcacaoSimples(valores)) return false
      if (tipo.nome.toLowerCase() === 'nome_camisa') return false

      return !selecionados[tipo.id]
    })

    if (tipoPendente) {
      toast.warn(`Selecione uma opção para ${tipoPendente.nome}`)
      return
    }

    if (!preco || Number(preco) <= 0) {
      toast.warn('Informe um preço válido')
      return
    }

    if (!quantidade || Number(quantidade) < 0) {
      toast.warn('Informe um estoque válido')
      return
    }

    try {
      setLoading(true)

      for (const tipo of tipos) {
        if (!tiposAtivos[tipo.id]) continue
        const valorSelecionado = selecionados[tipo.id]
        if (!valorSelecionado) continue

        if (valorSelecionado === VALOR_TEMPORARIO_BOOLEANO) {
          const { valorBooleano, valoresAtualizados } = await garantirValorBooleano(tipo.id)

          if (!valorBooleano) {
            toast.error(`Nao foi possivel preparar a variacao ${tipo.nome}`)
            setLoading(false)
            return
          }

          valoresIds.push(valorBooleano.id)
          setValoresPorTipo((prev) => ({
            ...prev,
            [tipo.id]: valoresAtualizados
          }))
          setSelecionados((prev) => ({
            ...prev,
            [tipo.id]: valorBooleano.id
          }))
          continue
        }

        valoresIds.push(valorSelecionado)
      }

      await produtosService.gerarSkus(produtoId, {
        valoresIds,
        preco: Number(preco),
        quantidade: Number(quantidade),
        prontaEntrega: 1,
        encomenda: 0
      })

      toast.success('Versão criada com sucesso')

      onClose()
      onSuccess()

    } catch (err) {
      console.error(err)
      toast.error('Erro ao criar variação')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const tiposSemValores = tipos.filter(
    (tipo) => {
      const valores = valoresPorTipo[tipo.id] || []
      return !ehMarcacaoSimples(valores) && valores.length === 0
    }
  )

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-6 z-50">
      <div className="bg-cor-fundo w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 border border-cor-secundaria/30 shadow-xl">

        {modo === 'criar' && (
          <>
            <h2 className="text-lg sm:text-xl font-bold mb-2">
              Nova Versão do Produto
            </h2>

            <p className="text-sm text-on-surface/60 mb-4">
              Escolha as opções abaixo para criar uma nova versão.
            </p>

            <InfoTip type="info" className="mb-6">
              Cada combinação vira uma nova versão do produto.
              <br /><br />
              Exemplo:
              <br />
              • Camiseta tamanho G
              <br />
              • Camiseta tamanho G com nome do instrutor
            </InfoTip>

            <button
              type="button"
              onClick={() => {
                setTipoInicialGerenciar(null)
                setModo('gerenciar')
              }}
              className="text-sm text-cor-primaria underline mb-2"
            >
              Gerenciar tipos e valores
            </button>

            <InfoTip type="info" className="mb-6">
              Marque apenas os tipos que esta versão realmente usa.
            </InfoTip>

            {tiposSemValores.length > 0 && (
              <InfoTip type="info" className="mb-6">
                Estes tipos ainda não têm valores cadastrados:
                <strong> {tiposSemValores.map((tipo) => tipo.nome).join(', ')}</strong>.
                <br /><br />
                Se forem marcacoes simples, voce pode usar o checkbox normalmente.
              </InfoTip>
            )}

            {/* VARIAÇÕES */}
            <div className="space-y-5 mb-6">
              {tipos.map(tipo => {

                const nomeTipo = tipo.nome.toLowerCase()
                let titulo = tipo.nome.toUpperCase()
                let placeholder = 'Selecione'

                if (nomeTipo === 'tamanho') {
                  titulo = 'TAMANHO'
                  placeholder = 'Selecione o tamanho'
                }

                if (nomeTipo === 'nome_camisa') {
                  titulo = 'PERSONALIZAÇÃO (OPCIONAL)'
                  placeholder = 'Sem personalização'
                }

                const valores = valoresPorTipo[tipo.id] || []
                const usarCheckbox = ehMarcacaoSimples(valores)
                const tipoAtivo = Boolean(tiposAtivos[tipo.id])

                return (
                  <div key={tipo.id} className="rounded-xl border border-cor-secundaria/20 bg-surface p-4">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-cor-primaria"
                        checked={tipoAtivo}
                        onChange={(e) => toggleTipoAtivo(tipo, e.target.checked)}
                      />

                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-on-surface">
                          {titulo}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-on-surface/60">
                          {usarCheckbox
                            ? `Marque quando esta versão tiver ${tipo.nome}.`
                            : `Habilite para escolher uma opção de ${tipo.nome}.`}
                        </span>
                      </span>
                    </label>

                    {tipoAtivo && usarCheckbox && (
                      <div className="mt-3 rounded-xl border border-cor-secundaria/15 bg-cor-secundaria/5 px-3 py-2 text-sm text-on-surface/70">
                        Esta marcacao sera aplicada nesta versão.
                      </div>
                    )}

                    {tipoAtivo && !usarCheckbox && (
                      <div className="mt-3">
                        <select
                          className="select-admin w-full"
                          value={selecionados[tipo.id] || ''}
                          onChange={(e) =>
                            selecionarValor(tipo.id, Number(e.target.value))
                          }
                        >
                          <option value="">{placeholder}</option>
                          {valores.map(valor => (
                            <option key={valor.id} value={valor.id}>
                              {valor.valor}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {tipoAtivo && !usarCheckbox && valores.length === 0 && (
                      <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-900/20 p-4 text-sm text-amber-100">
                        <div className="font-medium">
                          Este tipo ainda nao pode ser usado.
                        </div>
                        <div className="mt-1 text-xs leading-relaxed text-amber-100/80">
                          {obterOrientacaoDoTipo(tipo.nome)}
                          <br />
                          {obterExemploDoTipo(tipo.nome)}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTipoInicialGerenciar(tipo.id)
                            setModo('gerenciar')
                          }}
                          className="mt-3 text-sm font-medium text-amber-200 underline"
                        >
                          Cadastrar valores para {tipo.nome}
                        </button>
                      </div>
                    )}

                    {tipoAtivo && usarCheckbox && (
                      <button
                        type="button"
                        onClick={() => {
                          setTipoInicialGerenciar(tipo.id)
                          setModo('gerenciar')
                        }}
                        className="mt-3 text-xs text-cor-primaria underline"
                      >
                        Gerenciar este tipo
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {obterResumo() && (
              <div className="mb-6 p-3 rounded-lg bg-surface border border-cor-secundaria/20 text-sm">
                <strong>Você está criando:</strong>
                <div className="mt-1 text-cor-primaria font-medium">
                  {obterResumo()}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  PREÇO (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input-number-admin w-full"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  ESTOQUE
                </label>
                <input
                  type="number"
                  className="input-number-admin w-full"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={permitirEncomenda}
                  onChange={(e) => setPermitirEncomenda(e.target.checked)}
                />
                <label className="text-sm text-on-surface/80">
                  Permitir venda sob encomenda quando o estoque zerar
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onClose} className="btn-secondary w-full">
                Cancelar
              </button>

              <button
                onClick={criarVariacao}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Salvando...' : 'Criar Versão'}
              </button>
            </div>
          </>
        )}

        {modo === 'gerenciar' && (
          <ModoGerenciarVariacoes
            tipoInicialId={tipoInicialGerenciar}
            setModo={(novoModo) => {
              setModo(novoModo)
              if (novoModo === 'criar') {
                setTipoInicialGerenciar(null)
                recarregarEstrutura()
              }
            }}
          />
        )}

      </div>
    </div>
  )
}
