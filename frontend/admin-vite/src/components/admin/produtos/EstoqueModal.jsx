// src/components/admin/produtos/EstoqueModal.jsx
import { useState, useEffect } from 'react'
import { validarEstoque } from '../../../utils/validacoes'

export const EstoqueModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  skuInicial, 
  skus = [] 
}) => {

  const [formData, setFormData] = useState({
    skuId: '',
    quantidade: '',
    motivo: ''
  })

  const [erros, setErros] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        skuId: skuInicial?.id || '',
        quantidade: '',
        motivo: ''
      })
      setErros({})
    }
  }, [isOpen, skuInicial])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (erros[name]) {
      setErros(prev => {
        const novos = { ...prev }
        delete novos[name]
        return novos
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { valido, erros: errosValidacao } = validarEstoque(formData)

    if (!valido) {
      setErros(errosValidacao)
      return
    }

    setLoading(true)

    await onSave({
      skuId: Number(formData.skuId),
      quantidade: Number(formData.quantidade),
      motivo: formData.motivo
    })

    setLoading(false)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-surface text-on-surface rounded-2xl w-full max-w-lg border border-cor-secundaria/30">

        {/* Header */}
        <div className="p-6 border-b border-cor-secundaria/30">
          <h2 className="text-xl font-bold">Entrada de Estoque</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium mb-1">
              SKU *
            </label>
            <select
              name="skuId"
              value={formData.skuId}
              onChange={handleChange}
              className={`w-full p-3 bg-cor-fundo text-on-surface rounded-lg border ${
                erros.skuId 
                  ? 'border-red-500' 
                  : 'border-cor-secundaria/30'
              } focus:outline-none focus:ring-2 focus:ring-cor-primaria/50`}
            >
              <option value="">Selecione um SKU</option>
              {skus.map(sku => (
                <option key={sku.id} value={sku.id}>
                  {sku.sku_codigo} (Estoque: {sku.quantidade || 0})
                </option>
              ))}
            </select>
            {erros.skuId && (
              <p className="mt-1 text-sm text-red-500">
                {erros.skuId}
              </p>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Quantidade *
            </label>
            <input
              type="number"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              min="1"
              className={`w-full p-3 bg-cor-fundo text-on-surface rounded-lg border ${
                erros.quantidade 
                  ? 'border-red-500' 
                  : 'border-cor-secundaria/30'
              } focus:outline-none focus:ring-2 focus:ring-cor-primaria/50`}
              placeholder="Ex: 10"
            />
            {erros.quantidade && (
              <p className="mt-1 text-sm text-red-500">
                {erros.quantidade}
              </p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Motivo *
            </label>
            <input
              type="text"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              className={`w-full p-3 bg-cor-fundo text-on-surface rounded-lg border ${
                erros.motivo 
                  ? 'border-red-500' 
                  : 'border-cor-secundaria/30'
              } focus:outline-none focus:ring-2 focus:ring-cor-primaria/50`}
              placeholder="Ex: Compra fornecedor"
            />
            {erros.motivo && (
              <p className="mt-1 text-sm text-red-500">
                {erros.motivo}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-cor-secundaria/30">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-6 bg-cor-secundaria/10 text-on-surface rounded-lg font-medium hover:bg-cor-secundaria/20 transition-colors order-2 sm:order-1"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] px-6 bg-cor-primaria text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 order-1 sm:order-2"
            >
              {loading ? 'Registrando...' : 'Registrar Entrada'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}