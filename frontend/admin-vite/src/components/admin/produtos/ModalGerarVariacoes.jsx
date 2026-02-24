import { useEffect, useState } from 'react'
import { variacoesService } from '../../../services/variacoesService'
import { produtosService } from '../../../services/produtosService'
import { toast } from 'react-toastify'

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

  // 🔹 Carregar tipos
  useEffect(() => {
    if (!open) return

    async function carregar() {
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
    }

    carregar()
  }, [open])

  function selecionarValor(tipoId, valorId) {
    setSelecionados(prev => ({
      ...prev,
      [tipoId]: valorId || null
    }))
  }

  function obterResumo() {
    return tipos.map(tipo => {
      const valorId = selecionados[tipo.id]
      if (!valorId) return null
      const valor = valoresPorTipo[tipo.id]?.find(v => v.id === valorId)
      return valor?.valor || null
    }).filter(Boolean).join(' • ')
  }

  async function criarVariacao() {

    const valoresIds = Object.values(selecionados).filter(Boolean)

    if (valoresIds.length === 0) {
      toast.warn('Selecione pelo menos um tamanho')
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

      toast.success('Variação criada com sucesso')

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

      <div className="bg-cor-fundo w-full max-w-lg rounded-2xl p-6 border border-cor-secundaria/30 shadow-xl">

        <h2 className="text-xl font-bold mb-2">
          Nova Variação do Produto
        </h2>

        <p className="text-sm text-on-surface/60 mb-6">
          Escolha o tamanho e, se desejar, personalize com nome na camisa.
        </p>

        {/* 🔹 SEÇÃO VARIAÇÕES */}
        <div className="space-y-5 mb-6">

          {tipos.map(tipo => {

            const nomeTipo = tipo.nome.toLowerCase()
            let titulo = tipo.nome.toUpperCase()
            let placeholder = 'Selecione'

            if (nomeTipo === 'tamanho') {
              titulo = 'TAMANHO DA CAMISETA'
              placeholder = 'Selecione o tamanho'
            }

            if (nomeTipo === 'nome_camisa') {
              titulo = 'PERSONALIZAÇÃO (OPCIONAL)'
              placeholder = 'Sem personalização'
            }

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

                  {(valoresPorTipo[tipo.id] || []).map(valor => (
                    <option key={valor.id} value={valor.id}>
                      {valor.valor}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}

        </div>

        {/* 🔹 RESUMO VISUAL */}
        {obterResumo() && (
          <div className="mb-6 p-3 rounded-lg bg-surface border border-cor-secundaria/20 text-sm">
            <strong>Você está criando:</strong>
            <div className="mt-1 text-cor-primaria font-medium">
              {obterResumo()}
            </div>
          </div>
        )}

        {/* 🔹 PREÇO E ESTOQUE */}
        <div className="grid grid-cols-2 gap-4 mb-6">

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

        {/* 🔹 BOTÕES */}
        <div className="flex gap-3">

          <button
            onClick={onClose}
            className="btn-secondary w-full min-h-[44px]"
          >
            Cancelar
          </button>

          <button
            onClick={criarVariacao}
            disabled={loading}
            className="btn-primary w-full min-h-[44px]"
          >
            {loading ? 'Salvando...' : 'Criar Variação'}
          </button>

        </div>

      </div>
    </div>
  )
}