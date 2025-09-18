# README-MATRICULA.md

## 📌 Módulo Matrícula Pública

### Objetivo
Permitir que responsáveis realizem a matrícula de alunos via página pública.

### Estrutura
- **Controller** → recebe requests e repassa ao service.
- **Service** → contém lógica de negócio (duplicidade CPF, cálculo de idade, atribuição automática de turma, status inicial pendente, envio de e-mails).
- **Repository** → queries SQL (SELECT, INSERT, validação de CPF, busca de turma por idade).
- **Routes** → define endpoints públicos.

### Endpoint
- `POST /public/matricula`  
  - Cria aluno com `status = pendente`.  
  - Valida duplicidade (CPF único).  
  - Calcula idade do aluno e procura uma turma cuja faixa etária (`idade_min` / `idade_max`) corresponda.  
  - Caso não encontre nenhuma turma compatível, aluno é atribuído à turma **"Sem turma"**.  
  - Dispara e-mail para responsável e admin.

### Banco de Dados
A tabela `turmas` deve possuir colunas `idade_min` e `idade_max`.  
Exemplo:
- **Turma Infantil** → `idade_min = 6`, `idade_max = 10`
- **Juvenil** → `idade_min = 11`, `idade_max = 15`
- **Adultos** → `idade_min = 16`, `idade_max = NULL`
- **Sem turma** → ambos `NULL` (usada apenas como fallback)

### Status
- [x] Estrutura criada  
- [x] Lógica implementada (dinâmica por faixa etária)  
- [ ] Testes realizados
