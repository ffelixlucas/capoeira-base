# 🖼️ Módulo Galeria – Capoeira Base

## ✅ Descrição
Módulo de gerenciamento da **Galeria de Imagens da Página Pública** do projeto Capoeira Base.

> 🔥 **Tudo que é adicionado, editado, reordenado ou excluído na galeria do painel admin reflete diretamente na landing page pública.**  
> ✔️ O admin tem controle total sobre quais imagens aparecem no site e em qual ordem.

### Funcionalidades principais:
- Upload de imagens com legenda.
- Visualização no carrossel (preview) com autoplay opcional.
- **Dots do carrossel clicáveis.**
- Mini preview da imagem antes de enviar.
- Ordenação manual das imagens (por botões ou número de posição).
- Edição de legendas.
- Exclusão de imagens.
- Feedback visual com toasts e loading em todas as ações.
- Fechamento de modais no ESC ou clique fora.
- Acessibilidade aplicada (aria-label, roles e foco correto).

## 🚀 Tecnologias
- React + Vite
- Tailwind CSS (100% mobile-first)
- Node.js + Express (API REST)
- Firebase Storage (armazenamento de imagens)
- React Toastify (feedback de notificação)
- Headless UI (menu contextual acessível)

## 🏗️ Estrutura dos Componentes
| Arquivo                | Descrição                                                           |
|------------------------|---------------------------------------------------------------------|
| `GaleriaUploader.jsx`  | Upload de imagem com legenda e mini preview antes de enviar.        |
| `GaleriaPreview.jsx`   | Carrossel de imagens com autoplay, navegação manual e dots clicáveis.|
| `GaleriaGrade.jsx`     | Grade de imagens com ordenação manual, edição e exclusão.          |
| `GaleriaItem.jsx`      | Item individual da grade, com número de ordem, legenda e menu.     |
| `GaleriaMenu.jsx`      | Menu contextual (ver, mover, editar legenda, excluir).             |
| `ModalLegenda.jsx`     | Modal para edição da legenda da imagem, com foco automático.       |

## 🧠 Hook Principal
- `useGaleria.js` → Hook responsável por gerenciar os estados e ações da galeria:
  - Listagem
  - Upload
  - Remoção
  - Edição de legenda
  - Atualização da ordem
  - Controle de loading e validações

## 🔗 Serviços
- `galeriaService.js` → Camada de comunicação com o backend. Contém as funções:
  - `listarImagens()`
  - `uploadImagem()`
  - `deletarImagem()`
  - `atualizarLegenda()`
  - `atualizarOrdem()`

## 📜 Fluxo de Funcionamento
1. **Upload:** O admin seleciona uma imagem, vê o preview, digita a legenda e envia → backend salva no Firebase Storage.
2. **Preview:** Visualização no carrossel, com autoplay opcional e navegação por setas ou dots clicáveis.
3. **Grade:** Mostra as imagens em grade, permitindo:
   - Alterar a ordem (botões ou número da posição).
   - Editar legenda via modal.
   - Excluir imagens.
4. **Salvar Ordem:** A nova ordem das imagens é atualizada no backend e reflete imediatamente na página pública.
5. **Integração:** A landing page pública lê as imagens e sua ordem diretamente do backend e do Firebase Storage, **sem necessidade de deploy.**

## 🎯 Relação com a Página Pública
- ✅ **100% vinculada.**  
- ✅ A galeria do painel admin controla exatamente o que aparece na **seção de galeria da landing page pública.**  
- ✅ Toda alteração (adicionar, excluir, mudar legenda, reordenar) é refletida **imediatamente no site público**, sem necessidade de deploy manual.

## 🛠️ Melhorias Futuras
- [ ] Implementar hook dedicado `useOrdem()` para desacoplar lógica de ordenação.
- [ ] Adicionar animações de transição nas mudanças de imagem e nos modais (opcional).
- [ ] (Avaliar) Permitir drag & drop para ordenação como evolução futura.
- [ ] (Avaliar) Sistema de categorias ou filtros na galeria.

## 🎯 Foco de Desenvolvimento
- ✅ Mobile-first
- ✅ Low-code
- ✅ Clean code
- ✅ UX profissional
- ✅ Facilidade total para manutenção e escalabilidade futura

## ✅ Status
- ✔️ Módulo concluído e funcional
- ✔️ Testado em mobile e desktop
- ✔️ 100% integrado com a página pública
- ✔️ Feedback visual completo (toasts + loading)
- ✔️ Pronto para produção, manutenção e escalabilidade

---
