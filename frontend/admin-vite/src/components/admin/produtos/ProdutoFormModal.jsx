// src/components/admin/produtos/ProdutoFormModal.jsx
import { useState, useEffect } from 'react'
import { validarProdutoBase } from '../../../utils/validacoes'

const getInitialFormData = (produto) => ({
  nome: produto?.nome || '',
  categoria: produto?.categoria || '',
  descricao: produto?.descricao || '',
  ativo: produto?.ativo ?? true,
  tipo_produto: produto?.tipo_produto || 'simples'
})

export const ProdutoFormModal = ({ isOpen, onClose, onSave, produto = null }) => {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    descricao: '',
    ativo: true,
    tipo_produto: 'simples'
  })

  const [erros, setErros] = useState({})
  const [loading, setLoading] = useState(false)
  const modoEdicao = Boolean(produto)

  useEffect(() => {
    if (!isOpen) {
      setFormData(getInitialFormData(null))
      setErros({})
      setLoading(false)
      return
    }

    setFormData(getInitialFormData(produto))
    setErros({})
    setLoading(false)
  }, [isOpen, produto])

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="flex h-full w-full flex-col bg-cor-fundo text-on-surface sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:overflow-hidden sm:rounded-2xl sm:border sm:border-cor-secundaria/20 sm:shadow-2xl">
        
        <div className="sticky top-0 z-10 border-b border-cor-secundaria/30 bg-cor-fundo p-6">
          <h2 className="text-xl font-bold">
            {modoEdicao ? 'Editar Produto' : 'Novo Produto'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
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
                      disabled={modoEdicao}
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
                      disabled={modoEdicao}
                    />
                    Com variações
                  </label>
                </div>

                {modoEdicao ? (
                  <p className="mt-2 text-xs text-on-surface/60">
                    O tipo do produto não é alterado por esta edição rápida.
                  </p>
                ) : null}
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
          </div>

          <div className="sticky bottom-0 border-t border-cor-secundaria/30 bg-cor-fundo p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
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
              {loading
                ? (modoEdicao ? 'Salvando...' : 'Criando...')
                : (modoEdicao ? 'Salvar Alterações' : 'Criar Produto')}
            </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
