import { useParams } from "react-router-dom";
import { useLojaSkus } from "../../hooks/public/useLojaSkus";
import ProdutoCard from "../../components/public/loja/ProdutoCard";

export default function LojaPublic() {
  const { slug } = useParams();
  const { skus, carregando, erro } = useLojaSkus(slug);

  return (
    <div className="min-h-screen bg-cor-fundo py-8">
      <div className="w-full max-w-7xl mx-auto px-4">

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Loja Online
        </h1>

        {carregando && (
          <p className="text-center text-gray-600">
            Carregando produtos...
          </p>
        )}

        {erro && (
          <p className="text-center text-red-500">
            {erro}
          </p>
        )}

        {!carregando && !erro && skus.length === 0 && (
          <p className="text-center text-gray-600">
            Nenhum produto disponível.
          </p>
        )}

        {!carregando && skus.length > 0 && (
          <div className="
            grid 
            grid-cols-2 
            sm:grid-cols-3 
            md:grid-cols-4 
            lg:grid-cols-5 
            gap-4
          ">
            {skus.map((sku) => (
              <ProdutoCard
                key={sku.id}
                sku={sku}
                slug={slug}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
