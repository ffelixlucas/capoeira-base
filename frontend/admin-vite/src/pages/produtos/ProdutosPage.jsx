// src/pages/produtos/ProdutosPage.jsx
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useProdutos } from '../../hooks/useProdutos'
import { ProdutosTable } from '../../components/admin/produtos/ProdutosTable'
import { ProdutoFormModal } from '../../components/admin/produtos/ProdutoFormModal'
import { produtosService } from '../../services/produtosService'
import { toast } from 'react-toastify'
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx'

export const ProdutosPage = () => {
  const navigate = useNavigate()

  const {
    produtos,
    loading,
    criarProduto,
    listarProdutos
  } = useProdutos()

  const [novoProdutoOpen, setNovoProdutoOpen] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState(null)

  const handleCriarProduto = async (dados) => {
    try {
      await criarProduto(dados)
      toast.success('Produto criado com sucesso!')
      setNovoProdutoOpen(false)
    } catch (error) {
      toast.error(error.message || 'Erro ao criar produto')
    }
  }

  const handleGerenciarProduto = (produto) => {
    navigate(`/admin/produtos/${produto.id}`)
  }

  const handleAbrirEdicao = (produto) => {
    setProdutoEditando(produto)
  }

  const handleSalvarEdicao = async (dados) => {
    if (!produtoEditando) return

    try {
      await produtosService.atualizar(produtoEditando.id, {
        nome: dados.nome,
        descricao: dados.descricao || '',
        categoria: dados.categoria,
        ativo: Number(dados.ativo),
      })
      await listarProdutos()
      toast.success('Produto atualizado com sucesso!')
      setProdutoEditando(null)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Erro ao atualizar produto')
    }
  }

  return (
    <div className="min-h-screen bg-cor-fundo p-4">
      <div className="bg-surface text-on-surface rounded-2xl p-4 border border-cor-secundaria/30">
        
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Loja', path: '/loja' },
            { label: 'Estoque' } // Este fica amarelo
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Produtos</h1>
            <p className="text-on-surface/70">
              Total: {produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'}
            </p>
          </div>
          
          <button
            onClick={() => setNovoProdutoOpen(true)}
            className="min-h-[44px] px-4 bg-cor-primaria text-white rounded-xl font-medium hover:opacity-90 transition-opacity mt-4 sm:mt-0"
          >
            Novo Produto
          </button>
        </div>

        <ProdutosTable
          produtos={produtos}
          loading={loading}
          onGerenciar={handleGerenciarProduto}
          onEditar={handleAbrirEdicao}
        />
      </div>

      <ProdutoFormModal
        isOpen={novoProdutoOpen}
        onClose={() => setNovoProdutoOpen(false)}
        onSave={handleCriarProduto}
      />

      <ProdutoFormModal
        isOpen={Boolean(produtoEditando)}
        produto={produtoEditando}
        onClose={() => setProdutoEditando(null)}
        onSave={handleSalvarEdicao}
      />
    </div>
  )
}
