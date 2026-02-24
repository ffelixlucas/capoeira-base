import { useEffect, useState, useCallback } from 'react'
import { variacoesService } from '../../../services/variacoesService'
import { produtosService } from '../../../services/produtosService'
import { toast } from 'react-toastify'
import InfoTip from '../../ui/InfoTip'
import ModoGerenciarVariacoes from './ModoGerenciarVariacoes'

export default function ModalGerarVariacoes({
  open,
  onClose,
  produtoId,
  onSuccess
}) {

  const [tipos, setTipos] = useState([])
  const [valoresPorTipo, setValoresPorTipo] = useState({})
  const [selecionados, setSelecionados] = useState({})
  const [preco, setPreco] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState('criar')

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

  function obterResumo() {
    return tipos
      .map(tipo => {
        const valorId = selecionados[tipo.id]
        if (!valorId) return null
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

    const valoresIds = Object.values(selecionados).filter(Boolean)

    const tipoTamanho = tipos.find(
      t => t.nome.toLowerCase() === 'tamanho'
    )

    if (tipoTamanho && !selecionados[tipoTamanho.id]) {
      toast.warn('Selecione o tamanho da camiseta')
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
              onClick={() => setModo('gerenciar')}
              className="text-sm text-cor-primaria underline mb-2"
            >
              Gerenciar tipos e valores
            </button>

            <InfoTip type="warning" className="mb-6">
              Se precisar de um tamanho, cor ou nome que ainda não exista,
              clique em <strong>Gerenciar tipos e valores</strong>.
            </InfoTip>

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

                return (
                  <div key={tipo.id}>
                    <label className="block text-sm font-semibold mb-2">
                      {titulo}
                    </label>

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

                    {valores.length === 0 && (
                      <div className="mt-2 text-xs text-red-400">
                        Nenhum valor cadastrado.
                      </div>
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
            setModo={(novoModo) => {
              setModo(novoModo)
              if (novoModo === 'criar') {
                recarregarEstrutura()
              }
            }}
          />
        )}

      </div>
    </div>
  )
}