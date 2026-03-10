// src/components/admin/produtos/ProdutoCard.jsx

export const ProdutoCard = ({
  produto,
  onGerenciar,
  onEditar
}) => {

  const totalSkus = produto.skus?.length || 0

  return (
    <div className="bg-surface text-on-surface rounded-xl p-4 border border-cor-secundaria/30">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">
            {produto.nome}
          </h3>
          <p className="text-sm text-on-surface/70">
            {produto.categoria}
          </p>
        </div>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            produto.ativo
              ? 'bg-cor-primaria/10 text-cor-primaria'
              : 'bg-cor-secundaria/10 text-on-surface/60'
          }`}
        >
          {produto.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Total SKUs */}
      <div className="mb-4 text-sm">
        <span className="text-on-surface/70">Variações: </span>
        <span className="font-medium">{totalSkus}</span>
      </div>

      {/* Ação */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onEditar(produto)}
          className="w-full min-h-[44px] rounded-lg border border-cor-secundaria/30 text-sm font-medium text-on-surface hover:bg-cor-secundaria/10 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onGerenciar(produto)}
          className="w-full min-h-[44px] bg-cor-primaria text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Gerenciar
        </button>
      </div>

    </div>
  )
}
