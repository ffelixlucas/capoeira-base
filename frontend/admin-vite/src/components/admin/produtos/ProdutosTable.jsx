import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { ProdutoCard } from './ProdutoCard.jsx'

export const ProdutosTable = ({
  produtos,
  loading
}) => {

  const navigate = useNavigate()
  const isMobile = useMediaQuery({ maxWidth: 768 })

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!produtos || produtos.length === 0) {
    return (
      <div className="text-center py-12 bg-surface/50 rounded-lg border border-dashed border-cor-secundaria/30">
        <p className="text-on-surface/70 mb-2">
          Nenhum produto cadastrado
        </p>
      </div>
    )
  }

  // ================= MOBILE =================
  if (isMobile) {
    return (
      <div className="space-y-4">
        {produtos.map(produto => (
          <ProdutoCard
            key={produto.id}
            produto={produto}
            onGerenciar={() => navigate(`/admin/produtos/${produto.id}`)}
          />
        ))}
      </div>
    )
  }

  // ================= DESKTOP =================
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-cor-secundaria/30 text-left">
            <th className="pb-3">Produto</th>
            <th className="pb-3">Categoria</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Variações</th>
            <th className="pb-3">Estoque Total</th>
            <th className="pb-3">Ações</th>
          </tr>
        </thead>

        <tbody>
          {produtos.map(produto => {

            const estoqueTotal = produto.skus?.reduce(
              (total, sku) => total + (sku.quantidade || 0),
              0
            ) || 0

            return (
              <tr key={produto.id} className="border-b border-cor-secundaria/20">
                <td className="py-4 font-medium">{produto.nome}</td>
                <td className="py-4">{produto.categoria}</td>
                <td className="py-4">
                  {produto.ativo ? 'Ativo' : 'Inativo'}
                </td>
                <td className="py-4">{produto.skus?.length || 0}</td>
                <td className="py-4 font-medium">{estoqueTotal}</td>
                <td className="py-4">
                  <button
                    onClick={() => navigate(`/admin/produtos/${produto.id}`)}
                    className="min-h-[44px] px-4 bg-cor-primaria text-white rounded-xl font-medium hover:opacity-90 transition-opacity"                  >
                    Gerenciar
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}