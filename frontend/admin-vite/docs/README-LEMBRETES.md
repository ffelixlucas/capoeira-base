# 📘 Módulo Lembretes – Frontend (Admin)

## 🎯 Objetivo

Interface 100% mobile-first e funcional para controle de lembretes internos da equipe administrativa.

## 📂 Estrutura de Componentes

```
src/components/lembretes/
├── ModalLembretes.jsx   // Modal central com botão flutuante para criar lembrete
├── LembreteLista.jsx    // Lista com scroll de lembretes
├── LembreteCard.jsx     // Cartão individual com status e ações
├── LembreteForm.jsx     // Formulário de criação/edição
```

## 🧠 Hook Personalizado

```
src/hooks/useLembretes.js
```

* Responsável por carregar, adicionar, editar e excluir lembretes.
* Gerencia estado local (lembretes, loading, erro).

## 🔌 Service HTTP

```
src/services/lembretesService.js
```

* Consome API `/api/lembretes` com axios.
* Funções: `listarLembretes`, `criarLembrete`, `atualizarLembrete`, `excluirLembrete`

## ⚙️ Comportamento UX

* Ao clicar no card "Pendências" do Dashboard, abre `ModalLembretes`.
* Modal lista lembretes com:

  * Cor por prioridade (baixa = sem cor, média = amarela, alta = vermelha)
  * Texto riscado para lembretes `status = feito`
  * Descrição e data (se existirem)
* Botão verde flutuante para adicionar (se tiver permissão)
* Ícones de edição (🖉) e exclusão (❌) com base em permissões
* Formulário acessível, responsivo e validado

## 🔐 Permissões Aplicadas

Via `usePermissao()` e ícones condicionais:

| Papel     | Criar | Editar | Excluir |
| --------- | ----- | ------ | ------- |
| admin     | ✅     | ✅      | ✅       |
| instrutor | ✅     | ✅      | ❌       |
| outros    | ❌     | ❌      | ❌       |

## 💡 Integração com Dashboard

* O Dashboard mostra apenas a **contagem de lembretes pendentes**.
* Ao clicar, abre o modal com a lista completa.

## 📱 Mobile-first

* Modal 100% adaptado para tela pequena
* Botões grandes e com espaçamento adequado
* Scroll vertical para lista longa
* Fecha com ESC ou clique fora

## 🛠️ Melhorias Futuras

* [ ] Checkbox para marcar como feito direto no card
* [ ] Filtro por data/prioridade no topo
* [ ] Animações de entrada/saída do modal
* [ ] Confirmação ao excluir

## ✅ Status

* [x] Finalizado e integrado ao backend
* [x] Documentado e funcional no Dashboard
