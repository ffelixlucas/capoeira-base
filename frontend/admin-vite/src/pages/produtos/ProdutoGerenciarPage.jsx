import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { produtosService } from '../../services/produtosService'
import { toast } from 'react-toastify'
import ModalGerarVariacoes from '../../components/admin/produtos/ModalGerarVariacoes'
import SkuLinha from '../../components/admin/produtos/SkuLinha.jsx'

export default function ProdutoGerenciarPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [produto, setProduto] = useState(null)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [ativo, setAtivo] = useState(1)

  const [preco, setPreco] = useState(0)
  const [quantidade, setQuantidade] = useState(0)
  const [modalVariacaoOpen, setModalVariacaoOpen] = useState(false)

  useEffect(() => {
    carregar()
  }, [id])

  async function carregar() {
    try {
      const data = await produtosService.buscarPorId(id)

      setProduto(data)
      setNome(data.nome)
      setDescricao(data.descricao)
      setCategoria(data.categoria)
      setAtivo(data.ativo)

      if (data.tipo_produto === 'simples' && data.skus?.length === 1) {
        setPreco(Number(data.skus[0].preco))
        setQuantidade(Number(data.skus[0].quantidade || 0))
      }

    } catch {
      toast.error('Erro ao carregar produto')
      navigate('/admin/produtos')
    } finally {
      setLoading(false)
    }
  }

  async function salvar() {
    try {
      if (produto.tipo_produto === 'simples') {
        await produtosService.atualizar(id, {
          nome,
          descricao,
          categoria,
          ativo,
          preco,
          quantidade,
        })
      } else {
        await produtosService.atualizar(id, {
          nome,
          descricao,
          categoria,
          ativo,
        })
      }

      toast.success('Produto atualizado com sucesso')
      carregar()

    } catch {
      toast.error('Erro ao atualizar produto')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cor-fundo flex items-center justify-center">
        Carregando...
      </div>
    )
  }

  if (!produto) return null

  return (
    <div className="min-h-screen bg-cor-fundo p-4">
      <div className="max-w-3xl mx-auto bg-surface text-on-surface rounded-2xl p-6 border border-cor-secundaria/30">

        <button
          onClick={() => navigate('/admin/produtos')}
          className="text-sm text-on-surface/60 mb-4"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-bold mb-6">
          Editar Produto
        </h1>

        {/* Nome */}
        <div className="mb-4">
          <label className="text-sm text-on-surface/60">Nome</label>
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="input-admin"
          />
        </div>

        {/* Descrição */}
        <div className="mb-4">
          <label className="text-sm text-on-surface/60">Descrição</label>
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            className="textarea-admin"
          />
        </div>

        {/* Categoria */}
        <div className="mb-4">
          <label className="text-sm text-on-surface/60">Categoria</label>
          <input
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="input-admin"
          />
        </div>

        {/* PRODUTO SIMPLES */}
        {produto.tipo_produto === 'simples' && (
          <>
            <div className="mb-4">
              <label className="text-sm text-on-surface/60">Preço</label>
              <input
                type="number"
                step="0.01"
                value={preco}
                onChange={e => setPreco(Number(e.target.value))}
                className="input-admin"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm text-on-surface/60 mb-2 block">
                Estoque
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantidade(prev => Math.max(0, prev - 1))}
                  className="btn-secondary min-h-[44px] px-4"
                >
                  -
                </button>

                <input
                  type="number"
                  value={quantidade}
                  onChange={e => setQuantidade(Number(e.target.value))}
                  className="input-number-admin w-24"
                />

                <button
                  type="button"
                  onClick={() => setQuantidade(prev => prev + 1)}
                  className="btn-secondary min-h-[44px] px-4"
                >
                  +
                </button>
              </div>
            </div>
          </>
        )}

        {/* PRODUTO VARIÁVEL */}
        {produto.tipo_produto === 'variavel' && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">Variações</h2>

            {produto.skus?.length === 0 && (
              <p className="text-sm text-on-surface/60">
                Nenhuma variação criada ainda.
              </p>
            )}

            {produto.skus?.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-cor-secundaria/30">
                <table className="w-full text-sm">
                  <thead className="bg-surface border-b border-cor-secundaria/30">
                    <tr className="text-left">
                      <th className="p-3">Tamanho</th>
                      <th className="p-3">Nome na Camisa</th>
                      <th className="p-3">Preço (R$)</th>
                      <th className="p-3">Estoque</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>

                  <tbody>
  {produto.skus.map((sku) => (
    <SkuLinha
      key={sku.id}
      sku={sku}
      onAtualizado={carregar}
    />
  ))}
</tbody>
                </table>
              </div>
            )}

            <button
              type="button"
              className="btn-secondary w-full mt-4"
              onClick={() => setModalVariacaoOpen(true)}
            >
              + Adicionar Nova Variação
            </button>

          </div>
        )}

        {/* Ativo */}
        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            checked={ativo === 1}
            onChange={() => setAtivo(prev => prev === 1 ? 0 : 1)}
          />
          <span className="text-sm">Produto ativo na loja</span>
        </div>

        <button
          onClick={salvar}
          className="btn-primary w-full min-h-[48px]"
        >
          Salvar Alterações
        </button>

      </div>

      <ModalGerarVariacoes
        open={modalVariacaoOpen}
        onClose={() => setModalVariacaoOpen(false)}
        produtoId={produto.id}
        onSuccess={carregar}
      />
    </div>
  )
}