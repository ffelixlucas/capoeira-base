# 🖼️ Módulo Galeria – Capoeira Base

## ✅ Descrição
Módulo de gerenciamento da **Galeria de Imagens da Página Pública** do projeto Capoeira Base.

> 🔥 **Tudo que é adicionado, editado, reordenado ou excluído na galeria do painel admin reflete diretamente na landing page pública.**  
> ✔️ O admin tem controle total sobre quais imagens aparecem no site e em qual ordem.

### Funcionalidades principais:
- Upload de imagens com legenda.
- Visualização no carrossel (preview) com autoplay opcional.
- Ordenação manual das imagens.
- Edição de legendas.
- Exclusão de imagens.

## 🚀 Tecnologias
- React + Vite
- Tailwind CSS (100% mobile-first)
- Node.js + Express (API REST)
- Firebase Storage (armazenamento de imagens)

## 🏗️ Estrutura dos Componentes
| Arquivo                | Descrição                                                           |
|------------------------|---------------------------------------------------------------------|
| `GaleriaUploader.jsx`  | Upload de imagem com legenda.                                      |
| `GaleriaPreview.jsx`   | Carrossel de imagens com autoplay e navegação manual.              |
| `GaleriaGrade.jsx`     | Grade de imagens com opções de ordenação, edição e exclusão.       |
| `GaleriaItem.jsx`      | Item individual da grade, com menu de ações.                       |
| `GaleriaMenu.jsx`      | Menu contextual (mover, editar legenda, excluir, visualizar).      |
| `ModalLegenda.jsx`     | Modal para edição da legenda da imagem selecionada.                |

## 🧠 Hook Principal
- `useGaleria.js` → Hook responsável por gerenciar os estados e ações da galeria (listar, upload, remover, editar legenda, atualizar ordem).

## 🔗 Serviços
- `galeriaService.js` → Camada de comunicação com o backend. Contém as funções:
  - `listarImagens()`
  - `uploadImagem()`
  - `deletarImagem()`
  - `atualizarLegenda()`
  - `atualizarOrdem()`

## 📜 Fluxo de Funcionamento
1. **Upload:** O admin seleciona uma imagem e digita uma legenda → envia para backend → salva no Firebase Storage.
2. **Preview:** Permite visualizar as imagens no carrossel, com autoplay opcional.
3. **Grade:** Mostra as imagens em grade, permitindo:
   - Ordenação manual.
   - Edição de legenda via modal.
   - Exclusão de qualquer imagem.
4. **Salvar Ordem:** A nova ordem das imagens é atualizada no backend e reflete automaticamente na página pública.
5. **Integração:** A landing page pública lê as imagens e a ordem diretamente do backend + storage.

## 🎯 Relação com a Página Pública
- ✅ **Totalmente vinculada.**  
- ✅ A galeria do painel admin controla exatamente o que aparece na **seção de galeria da landing page pública.**  
- ✅ Toda alteração (adicionar, remover, mudar legenda, reordenar) é refletida **imediatamente no site público**, sem necessidade de deploy.

## 🛠️ Melhorias Futuras (Checklist)
- [ ] Fechar modal no ESC e clique fora.
- [ ] Feedback de loading no upload, legenda e salvar ordem.
- [ ] Substituir `alert()` por toasts (`react-toastify` ou `sonner`).
- [ ] Tornar os dots do carrossel (`GaleriaPreview`) clicáveis.
- [ ] Adicionar animações de transição (modal, preview).
- [ ] Melhorias de acessibilidade (roles ARIA, foco, labels).
- [ ] Validação local no upload (extensão permitida, tamanho máximo).
- [ ] Mini preview da imagem no uploader antes de enviar.
- [ ] Criar hook `useOrdem()` para centralizar e desacoplar lógica de ordenação.

## 🎯 Foco de Desenvolvimento
- ✅ Mobile-first
- ✅ Low-code
- ✅ Clean code
- ✅ Facilidade total para manutenções futuras

## ✅ Status
- ✔️ Módulo finalizado e funcional
- ✔️ Testado em mobile e desktop
- ✔️ 100% integrado com a página pública
- ✔️ Pronto para produção e manutenção

---
