import { useState, useEffect } from 'react'
import { validarSku } from '../../../utils/validacoes'

export const SkuFormModal = ({ isOpen, onClose, onSave, produto }) => {

  const initialState = {
    sku_codigo: '',
    preco: '',
    pronta_entrega: false,
    encomenda: false
  }

  const [formData, setFormData] = useState(initialState)
  const [erros, setErros] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialState)
      setErros({})
      setLoading(false)
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (erros[name]) {
      setErros(prev => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { valido, erros: errosValidacao } = validarSku(formData)

    if (!valido) {
      setErros(errosValidacao)
      return
    }

    try {
      setLoading(true)
      await onSave(formData)
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-surface text-on-surface rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-cor-secundaria/30">

        {/* Header */}
        <div className="p-6 border-b border-cor-secundaria/30">
          <h2 className="text-xl font-bold">
            Novo SKU {produto?.nome ? `- ${produto.nome}` : ''}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Código */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Código SKU *
            </label>
            <input
              type="text"
              name="sku_codigo"
              value={formData.sku_codigo}
              onChange={handleChange}
              className={`w-full p-3 bg-cor-fundo text-on-surface rounded-lg border ${
                erros.sku_codigo
                  ? 'border-red-500'
                  : 'border-cor-secundaria/30'
              } focus:outline-none focus:ring-2 focus:ring-cor-primaria/50`}
            />
            {erros.sku_codigo && (
              <p className="mt-1 text-sm text-red-500">
                {erros.sku_codigo}
              </p>
            )}
          </div>

          {/* Preço */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Preço *
            </label>
            <input
              type="number"
              name="preco"
              value={formData.preco}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full p-3 bg-cor-fundo text-on-surface rounded-lg border ${
                erros.preco
                  ? 'border-red-500'
                  : 'border-cor-secundaria/30'
              } focus:outline-none focus:ring-2 focus:ring-cor-primaria/50`}
            />
            {erros.preco && (
              <p className="mt-1 text-sm text-red-500">
                {erros.preco}
              </p>
            )}
          </div>

          {/* Tipo */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="pronta_entrega"
                checked={formData.pronta_entrega}
                onChange={handleChange}
                className="w-5 h-5 rounded border-cor-secundaria/30 text-cor-primaria focus:ring-cor-primaria"
              />
              Pronta entrega
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="encomenda"
                checked={formData.encomenda}
                onChange={handleChange}
                className="w-5 h-5 rounded border-cor-secundaria/30 text-cor-primaria focus:ring-cor-primaria"
              />
              Encomenda
            </label>
          </div>

          {(erros.pronta_entrega || erros.encomenda) && (
            <p className="text-sm text-red-500">
              {erros.pronta_entrega || erros.encomenda}
            </p>
          )}

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-cor-secundaria/30">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-[44px] px-6 bg-cor-secundaria/10 text-on-surface rounded-lg font-medium hover:bg-cor-secundaria/20 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] px-6 bg-cor-primaria text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar SKU'}
            </button>

          </div>

        </form>
      </div>
    </div>
  )
}