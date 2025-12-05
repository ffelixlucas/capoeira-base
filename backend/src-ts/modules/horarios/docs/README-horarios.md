# Módulo de Horários

Gerencia os dias e horários de cada turma.

## Estrutura

- Cada turma pode ter 1 ou vários horários.
- Cada horário pertence a uma organização.
- O responsável do horário pode ser diferente do professor da turma.

## Endpoints

### POST /api/horarios
Cria um novo horário.

### GET /api/horarios/turma/:turmaId
Lista os horários da turma.

### DELETE /api/horarios/:id
Remove um horário.

## Relacionamentos

turmas (1) ---- (N) horarios_aula
