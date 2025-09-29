# 📋 README – Módulo Matrícula Pública

## 🎯 Objetivo
Permitir que responsáveis realizem a matrícula de alunos de forma **online** e **segura**, sem precisar de login no sistema.  
A matrícula entra como **pendente** e só aparece na lista principal após aprovação do admin.

---

## 🏗️ Estrutura

### Backend (já implementado)
- Endpoint: `POST /api/public/matricula`
- Funcionalidades:
  - Cria aluno com `status = pendente`.
  - Valida duplicidade de CPF.
  - Calcula idade do aluno e busca turma compatível pela faixa etária.
  - Cria matrícula inicial na tabela `matriculas` (`data_inicio = hoje`).
  - Dispara e-mails de confirmação (responsável e admin).

### Frontend (novo)
- Rota: `/public/matricula`
- Arquivo: `src/pages/public/MatriculaPublic.jsx`
- Estrutura:
  - **Header**: título e subtítulo explicativo.
  - **Formulário**: campos de dados do aluno e responsável.
  - **Feedback**: mensagem de sucesso ou erro após envio.

---

## 📌 Campos do Formulário
- Nome completo (aluno)
- Apelido (opcional)
- Data de nascimento
- CPF
- E-mail
- Nome do responsável
- Documento do responsável
- Parentesco do responsável
- Telefone do responsável
- Endereço
- Observações médicas
- Autorização de imagem (checkbox)
- Aceite LGPD (checkbox obrigatório)

---

## 🔄 Fluxo
1. Usuário acessa `/public/matricula`.
2. Preenche formulário e envia.
3. Sistema valida dados e salva matrícula como `pendente`.
4. Admin aprova ou rejeita pelo painel (`ModalPendentes`).

---

## 📂 Arquitetura Frontend
- **Service**: `services/public/matriculaPublicService.js`
- **Hook**: `hooks/public/useMatricula.js`
- **Página**: `pages/public/MatriculaPublic.jsx`
- **UI**: componentes reutilizáveis (`InputBase`, botões globais).

---

## ✅ Status
- [x] Backend pronto
- [x] Service e hook criados
- [x] Página pública implementada
- [x] Integração com logger
- [x] Feedback visual com toasts
- [ ] Melhorias futuras: upload de foto, validação automática para menor de idade

