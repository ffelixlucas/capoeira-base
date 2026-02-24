import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { validarEstoque } from '../../../utils/validacoes'
import api from '../../../services/api'

export default function AjustarEstoqueModal({
  isOpen,
  onClose,
  sku,
  onAtualizado
}) {

  const [quantidade, setQuantidade] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erros, setErros] = useState({})

  useEffect(() => {
    if (isOpen) {
      setQuantidade('')
      setMotivo('')
      setErros({})
    }
  }, [isOpen])

  if (!isOpen) return null

  async function handleSalvar() {

    const dados = {
      skuId: sku.id,
      quantidade: Number(quantidade),
      motivo
    }

    const { valido, erros } = validarEstoque(dados)

    if (!valido) {
      setErros(erros)
      return
    }

    try {
      setLoading(true)

      await api.post('/estoque/entrada', dados)

      toast.success('Entrada de estoque registrada')
      onAtualizado()
      onClose()

    } catch (err) {
      toast.error('Erro ao registrar entrada')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface text-on-surface p-6 rounded-2xl w-full max-w-sm border border-cor-secundaria/30">

        <h2 className="text-lg font-bold mb-4">
          Entrada de Estoque
        </h2>

        <p className="text-sm text-on-surface/60 mb-4">
          SKU: {sku.sku_codigo}
        </p>

        <div className="space-y-3">

          <div>
            <label className="text-sm font-medium">
              Quantidade *
            </label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full border border-cor-secundaria/30 rounded-lg px-3 py-2 bg-transparent"
            />
            {erros.quantidade && (
              <p className="text-sm text-red-500">{erros.quantidade}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Motivo *
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full border border-cor-secundaria/30 rounded-lg px-3 py-2 bg-transparent"
              placeholder="Ex: Compra fornecedor"
            />
            {erros.motivo && (
              <p className="text-sm text-red-500">{erros.motivo}</p>
            )}
          </div>

        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-cor-secundaria/30"
          >
            Cancelar
          </button>

          <button
            onClick={handleSalvar}
            disabled={loading}
            className="px-4 py-2 bg-cor-primaria text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>

      </div>
    </div>
  )
}