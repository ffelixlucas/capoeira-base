// SkuLinha.jsx - Versão com classes admin e nome oculto quando vazio
import { useState } from "react";
import { produtosService } from "../../../services/produtosService";
import { toast } from "react-toastify";

export default function SkuLinha({ sku, onAtualizado }) {
  const [preco, setPreco] = useState(Number(sku.preco));
  const [estoque, setEstoque] = useState(Number(sku.quantidade));
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const variacoes = sku.variacoes || [];
  const tamanho = variacoes.find(v => v.tipo === "tamanho")?.valor || "—";
  const cor = variacoes.find(v => v.tipo === "cor")?.valor || null;
  const nomeCamisa = variacoes.find(v => v.tipo === "nome_camisa")?.valor || null; // Mudado para null quando não existe
  
  const outrasVariacoes = variacoes.filter(v => 
    v.tipo !== "tamanho" && v.tipo !== "cor" && v.tipo !== "nome_camisa"
  );

  const getCorStyle = (corNome) => {
    if (!corNome) return {};
    
    const corLower = corNome.toLowerCase().trim();
    
    const coresMap = {
      'amarelo': '#FFD700',
      'vermelho': '#FF0000',
      'azul': '#0000FF',
      'verde': '#00FF00',
      'preto': '#000000',
      'branco': '#FFFFFF',
      'rosa': '#FF69B4',
      'roxo': '#800080',
      'laranja': '#FFA500',
      'marrom': '#8B4513',
      'cinza': '#808080',
      'bege': '#F5F5DC',
      'vinho': '#800000',
      'dourado': '#DAA520',
      'prata': '#C0C0C0'
    };
    
    if (coresMap[corLower]) {
      return { backgroundColor: coresMap[corLower] };
    }
    
    if (corLower.startsWith('#')) {
      return { backgroundColor: corLower };
    }
    
    if (corLower.startsWith('rgb')) {
      return { backgroundColor: corLower };
    }
    
    return { backgroundColor: '#CCCCCC' };
  };

  async function salvar() {
    if (preco <= 0) {
      toast.warning("Preço precisa ser maior que zero");
      return;
    }
    if (estoque < 0) {
      toast.warning("Estoque não pode ser negativo");
      return;
    }

    try {
      setLoading(true);
      await produtosService.atualizarSku(sku.id, { preco: Number(preco) });
      await produtosService.atualizarEstoque(sku.id, { quantidade: Number(estoque) });
      toast.success("Variação atualizada!");
      onAtualizado();
      setIsExpanded(false);
    } catch (error) {
      toast.error("Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface rounded-xl border-2 border-cor-secundaria/30 overflow-hidden mb-3 shadow-sm">
      
      {/* CABEÇALHO - Tamanho como título + estoque + seta */}
      <div 
        className="p-4 flex items-center justify-between border-b-2 border-cor-secundaria/30 cursor-pointer hover:bg-cor-secundaria/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-cor-primaria">Tamanho: {tamanho}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            estoque === 0 ? 'text-red-500' :
            estoque < 5 ? 'text-yellow-500' :
            'text-green-500'
          }`}>
            {estoque} un
          </span>
          <svg 
            className={`w-5 h-5 text-on-surface/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="p-4 space-y-3">
        
        {/* Cor (se existir) */}
        {cor && (
          <div className="flex items-start">
            <span className="text-xs text-on-surface/40 w-16 font-medium">Cor:</span>
            <div className="flex items-center gap-2">
              <span 
                className="w-5 h-5 rounded-full border-2 border-cor-secundaria/40 shadow-sm" 
                style={getCorStyle(cor)}
                title={`Cor: ${cor}`}
              />
              <span className="text-base text-on-surface capitalize font-medium">{cor}</span>
            </div>
          </div>
        )}
        
        {/* Outras variações */}
        {outrasVariacoes.map((v, index) => (
          <div key={index} className="flex items-start">
            <span className="text-xs text-on-surface/40 w-16 font-medium capitalize">{v.tipo}:</span>
            <span className="text-base text-on-surface capitalize font-medium">{v.valor}</span>
          </div>
        ))}
        
        {/* Nome - SÓ MOSTRA SE TIVER VALOR */}
        {nomeCamisa && (
          <div className="flex items-start">
            <span className="text-xs text-on-surface/40 w-16 font-medium">Nome:</span>
            <span className="text-base text-on-surface font-medium">{nomeCamisa}</span>
          </div>
        )}

        {/* Preço */}
        <div className="flex items-start">
          <span className="text-xs text-on-surface/40 w-16 font-medium">Preço:</span>
          <span className="text-xl font-bold text-cor-primaria">R$ {Number(preco).toFixed(2)}</span>
        </div>

        {/* Estoque */}
        <div className="flex items-start">
          <span className="text-xs text-on-surface/40 w-16 font-medium">Estoque:</span>
          <span className={`text-xl font-bold ${
            estoque === 0 ? 'text-red-500' :
            estoque < 5 ? 'text-yellow-500' :
            'text-green-500'
          }`}>
            {estoque}
          </span>
        </div>
      </div>

      {/* MODO EDIÇÃO */}
      {isExpanded && (
        <div className="border-t-2 border-cor-secundaria/30 p-4 bg-cor-fundo">
          <div className="space-y-4">
            
            <p className="text-sm font-bold text-on-surface/70">EDITAR VARIAÇÃO</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-on-surface/40 font-medium mb-1">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  className="input-number-admin w-full" // Usando nossa classe
                />
              </div>
              
              <div>
                <label className="block text-xs text-on-surface/40 font-medium mb-1">Estoque</label>
                <input
                  type="number"
                  min="0"
                  value={estoque}
                  onChange={(e) => setEstoque(e.target.value)}
                  className="input-number-admin w-full" // Usando nossa classe
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={salvar}
                disabled={loading}
                className="flex-1 bg-cor-primaria text-white py-3 rounded-lg font-bold hover:bg-cor-primaria/90 disabled:opacity-50 border-2 border-transparent"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="flex-1 border-2 border-cor-secundaria/30 text-on-surface py-3 rounded-lg font-bold hover:bg-cor-secundaria/5"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}