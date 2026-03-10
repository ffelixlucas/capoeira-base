// ProdutoGerenciarPage.jsx - Versão com classes admin
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { produtosService } from "../../services/produtosService";
import { toast } from "react-toastify";
import ModalGerarVariacoes from "../../components/admin/produtos/ModalGerarVariacoes";
import SkuLinha from "../../components/admin/produtos/SkuLinha";
import ProdutoGaleria from "../../components/admin/produtos/ProdutoGaleria";

export default function ProdutoGerenciarPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [produto, setProduto] = useState(null);
  const [modalVariacaoOpen, setModalVariacaoOpen] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ativo, setAtivo] = useState(1);


  useEffect(() => {
    carregar();
  }, [id]);

  async function carregar() {
    try {
      const data = await produtosService.buscarPorId(id);
      setProduto(data);
      setNome(data.nome);
      setDescricao(data.descricao);
      setCategoria(data.categoria);
      setAtivo(data.ativo);
    } catch {
      toast.error("Erro ao carregar produto");
      navigate("/admin/produtos");
    } finally {
      setLoading(false);
    }
  }

  async function salvar() {
    try {
      await produtosService.atualizar(id, {
        nome,
        descricao,
        categoria,
        ativo,
      });
  
      toast.success("Produto atualizado");
      carregar();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cor-fundo text-cor-texto p-4 flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  if (!produto) return null;
  console.log("Produto carregado:", produto);

  const imagensReaproveitaveisBrutas = [
    ...(produto.imagens || []).map((img) => ({
      chave: `produto-${img.id}`,
      url: img.url,
      origem: "Produto",
    })),
    ...((produto.skus || []).flatMap((skuItem) =>
      (skuItem.imagens || []).map((img) => {
        const resumoSku = (skuItem.variacoes || [])
          .map((variacao) => variacao.valor)
          .filter(Boolean)
          .join(" • ");

        return {
          chave: `sku-${img.id}`,
          url: img.url,
          origem: resumoSku ? `SKU ${resumoSku}` : `SKU #${skuItem.id}`,
        };
      })
    )),
  ];

  const imagensReaproveitaveis = Array.from(
    new Map(
      imagensReaproveitaveisBrutas.map((imagem) => [imagem.url, imagem])
    ).values()
  );

  return (
    <div className="min-h-screen bg-cor-fundo text-cor-texto pb-24">

      {/* Header */}
      <header className="bg-surface border-b-2 border-cor-secundaria/30 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/produtos")}
            className="text-on-surface/60 hover:text-on-surface"
          >
            ← Voltar
          </button>
          <h1 className="text-lg font-semibold">Gerenciar Produto</h1>
          <span className="text-xs text-on-surface/30">ID #{produto.id}</span>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="p-4 space-y-4">

        {/* Card do produto */}
        <div className="bg-surface rounded-xl border-2 border-cor-secundaria/30 overflow-hidden shadow-sm">

          {/* Formulário */}
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs text-on-surface/40 mb-1">NOME</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input-admin w-full" // Usando nossa classe
              />
            </div>

            <div>
              <label className="block text-xs text-on-surface/40 mb-1">DESCRIÇÃO</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows="3"
                className="textarea-admin w-full" // Usando nossa classe
              />
            </div>

            <div>
              <label className="block text-xs text-on-surface/40 mb-1">CATEGORIA</label>
              <input
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="input-admin w-full" // Usando nossa classe
              />
            </div>

            <label className="flex items-center gap-2 p-2 border-2 border-cor-secundaria/30 rounded-lg cursor-pointer hover:bg-cor-secundaria/5">
              <input
                type="checkbox"
                checked={ativo === 1}
                onChange={() => setAtivo(prev => prev === 1 ? 0 : 1)}
                className="w-5 h-5 rounded border-2 border-cor-secundaria/30 text-cor-primaria focus:ring-cor-primaria"
              />
              <span className="text-sm text-on-surface">Produto ativo na loja</span>
            </label>
          </div>
        </div>

        <ProdutoGaleria
          produto={produto}
          onAtualizado={carregar}
        />

        {/* Seção de variações */}
        {produto.tipo_produto === "variavel" && (
          <div className="bg-surface rounded-xl border-2 border-cor-secundaria/30 overflow-hidden shadow-sm">

            {/* Header com botão */}
            <div className="p-4 border-b-2 border-cor-secundaria/30 flex items-center justify-between">
              <h2 className="font-semibold">Variações</h2>
              <button
                onClick={() => setModalVariacaoOpen(true)}
                className="bg-cor-primaria text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cor-primaria/90 border-2 border-transparent"
              >
                + Nova
              </button>
            </div>

            {/* Lista de SKUs */}
            <div className="p-4">
              {!produto.skus?.length ? (
                <p className="text-center text-on-surface/40 py-8">
                  Nenhuma variação criada
                </p>
              ) : (
                <div className="space-y-3">
                  {produto.skus.map((sku) => (
                    <SkuLinha
                      key={sku.id}
                      sku={sku}
                      imagensReaproveitaveis={imagensReaproveitaveis}
                      onAtualizado={carregar}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botão salvar fixo */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t-2 border-cor-secundaria/30">
          <button
            onClick={salvar}
            className="w-full bg-cor-primaria text-white py-3 rounded-lg font-medium hover:bg-cor-primaria/90 border-2 border-transparent shadow-md"
          >
            Salvar Alterações
          </button>
        </div>

      </div>

      <ModalGerarVariacoes
        open={modalVariacaoOpen}
        onClose={() => setModalVariacaoOpen(false)}
        produtoId={produto.id}
        onSuccess={carregar}
      />

     
    </div>
  );

}
