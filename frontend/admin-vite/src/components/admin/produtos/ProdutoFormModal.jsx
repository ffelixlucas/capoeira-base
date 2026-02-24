// src/components/admin/produtos/ProdutoFormModal.jsx
import { useState, useEffect } from 'react'
import { validarProdutoBase } from '../../../utils/validacoes'

export const ProdutoFormModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    descricao: '',
    ativo: true,
    tipo_produto: 'simples'
  })

  const [erros, setErros] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nome: '',
        categoria: '',
        descricao: '',
        ativo: true,
        tipo_produto: 'simples'
      })
      setErros({})
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
        const newErros = { ...prev }
        delete newErros[name]
        return newErros
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { valido, erros: errosValidacao } = validarProdutoBase(formData)

    if (!valido) {
      setErros(errosValidacao)
      return
    }

    setLoading(true)
    await onSave(formData)
    setLoading(false)
  }

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-cor-fundo text-on-surface w-full h-full sm:h-auto sm:max-w-2xl rounded-none sm:rounded-2xl shadow-2xl border border-cor-secundaria/20">
        
        <div className="p-6 border-b border-cor-secundaria/30">
          <h2 className="text-xl font-bold">Novo Produto</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          <div className="space-y-4">

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nome *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full p-3 bg-surface text-gray-700 rounded-lg border border-cor-secundaria/30 focus:outline-none focus:ring-2 focus:ring-cor-primaria/50"
                placeholder="Ex: Camiseta Oficial"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Categoria *
              </label>
              <input
                type="text"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full p-3 bg-surface text-gray-700 rounded-lg border border-cor-secundaria/30 focus:outline-none focus:ring-2 focus:ring-cor-primaria/50"
                placeholder="Ex: Vestuário"
              />
            </div>

            {/* Tipo Produto */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo do Produto *
              </label>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tipo_produto"
                    value="simples"
                    checked={formData.tipo_produto === 'simples'}
                    onChange={handleChange}
                  />
                  Simples
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tipo_produto"
                    value="variavel"
                    checked={formData.tipo_produto === 'variavel'}
                    onChange={handleChange}
                  />
                  Com variações
                </label>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 bg-surface text-gray-700 rounded-lg border border-cor-secundaria/30 focus:outline-none focus:ring-2 focus:ring-cor-primaria/50"
              />
            </div>

            {/* Ativo */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
              />
              <label className="text-sm font-medium">
                Produto ativo
              </label>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-cor-secundaria/30">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-6 bg-cor-secundaria/10 text-on-surface rounded-lg font-medium"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] px-6 bg-cor-primaria text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Produto'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}