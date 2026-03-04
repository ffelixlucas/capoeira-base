# Padrão de Logs e Execução (Backend)

## Objetivo
- Desenvolvimento: logs completos para diagnóstico.
- Produção: somente essencial (`warn` e `error`, com `info` configurável).

## Scripts
- `npm run dev`: watch TypeScript.
- `npm run build`: compila `src-ts` para `dist`.
- `npm run build:clean`: limpa `dist` e recompila.
- `npm run start:dev`: sobe backend com `NODE_ENV=development` e `LOG_LEVEL=debug`.
- `npm run start:prod`: sobe backend com `NODE_ENV=production` e `LOG_LEVEL=info`.
- `npm run dev:local`: build + start:dev.
- `npm run prod:local`: build + start:prod.

## Variáveis de ambiente
- `NODE_ENV=development|production`
- `LOG_LEVEL=debug|info|warn|error`

## Regras
1. Em produção, `console.log/info/debug` são silenciados no bootstrap.
2. Use `logger.debug/info/warn/error` ao invés de `console.*`.
3. Mensagens de ponte JS devem usar `logger.debug`.

## Recomendação de deploy
- `NODE_ENV=production`
- `LOG_LEVEL=info` (ou `warn` para ainda menos verbosidade)
