import { useState } from 'react'
import { produtosService } from '../../../services/produtosService'
import { toast } from 'react-toastify'

export default function SkuLinha({ sku, onAtualizado }) {

    const tamanho = sku.variacoes?.find(v => v.tipo === 'tamanho')?.valor || '—'
    const nomeCamisa = sku.variacoes?.find(v => v.tipo === 'nome_camisa')?.valor || '—'

    const [preco, setPreco] = useState(Number(sku.preco))
    const [estoque, setEstoque] = useState(Number(sku.quantidade))
    const [loading, setLoading] = useState(false)

    async function salvar() {
        try {
            setLoading(true)

            await produtosService.atualizarSku(sku.id, {
                preco: Number(preco)
            })

            await produtosService.atualizarEstoque(sku.id, {
                quantidade: Number(estoque)
            })

            toast.success('Variação atualizada')
            onAtualizado()

        } catch (error) {
            console.error('ERRO REAL:', error)
            toast.error('Erro ao atualizar variação')
            toast.error('Erro ao atualizar variação')
        } finally {
            setLoading(false)
        }
    }

    return (
        <tr className="border-b border-cor-secundaria/20">
            <td className="p-3">{tamanho}</td>
            <td className="p-3">{nomeCamisa}</td>

            <td className="p-3">
                <input
                    type="number"
                    step="0.01"
                    className="input-number-admin w-28"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                />
            </td>

            <td className="p-3">
                <input
                    type="number"
                    className="input-number-admin w-24"
                    value={estoque}
                    onChange={(e) => setEstoque(e.target.value)}
                />
            </td>

            <td className="p-3 text-center">
                <button
                    onClick={salvar}
                    disabled={loading}
                    className="btn-primary px-4 py-1 text-xs"
                >
                    {loading ? 'Salvando...' : 'Salvar'}
                </button>
            </td>
        </tr>
    )
}