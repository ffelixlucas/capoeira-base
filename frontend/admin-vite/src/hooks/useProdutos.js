import { useState, useEffect, useCallback } from 'react'
import { produtosService } from '../services/produtosService'

export const useProdutos = () => {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(false)

  const listarProdutos = useCallback(async () => {
    setLoading(true)

    try {
      const data = await produtosService.listar()
      setProdutos(data)
    } catch (err) {
      const message =
        err.response?.data?.message || 'Erro ao carregar produtos'
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // 🔵 CRIAR PRODUTO (simples ou variável)
  const criarProduto = async (dados) => {
    setLoading(true)

    try {
      await produtosService.criar(dados)
      await listarProdutos()
    } catch (err) {
      const message =
        err.response?.data?.message || 'Erro ao criar produto'
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  // 🔵 CRIAR SKU (produto variável)
  const criarSku = async (dados) => {
    setLoading(true)

    try {
      await produtosService.criarSku(dados)
      await listarProdutos()
    } catch (err) {
      const message =
        err.response?.data?.message || 'Erro ao criar SKU'
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const ajustarEstoque = async (dados) => {
    setLoading(true)

    try {
      await produtosService.ajustarEstoque(dados)
      await listarProdutos()
    } catch (err) {
      const message =
        err.response?.data?.message || 'Erro ao ajustar estoque'
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listarProdutos().catch(() => {})
  }, [listarProdutos])

  return {
    produtos,
    loading,
    listarProdutos,
    criarProduto,
    criarSku,
    ajustarEstoque
  }
}