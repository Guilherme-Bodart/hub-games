# Refactor Migration Plan - Shared Status (branch `new-style`)

Last update: 2026-03-25
Owners: Agent 1 + Agent 2

## Objetivo

Manter uma fonte unica de verdade sobre o estado real das etapas para evitar retrabalho.
Este arquivo descreve o que ja foi feito, o que falta e quem pode alterar cada area.

## Snapshot validado do branch

- Branch atual: `new-style`.
- `npx tsc --noEmit`: OK.
- `npm test -- --watchAll=false`: FALHANDO em snapshot por `react-native-worklets` via mock de reanimated.

## Ownership (travado)

- Agent 1:
- `src/features/catalog/**`
- `src/features/settings/**`
- `src/features/lobby/**`

- Agent 2:
- `src/features/games/sintonia/**`
- `src/features/games/impostor/**`
- `src/ui/atoms/**`
- `src/theme/**` (somente tema/tokens/design-base)
- Jest/snapshot setup

- Regra de conflito:
- Agent 2 nao altera `src/features/lobby/store*` nem `src/features/lobby/firebaseRealtime*`.
- Agent 1 nao altera `src/ui/atoms/*` nem `jest.setup.ts` sem alinhamento.

## Status por etapa (real)

### Etapa 1 - Catalog + Settings (Agent 1)
Status: Em progresso (parcial)

Concluido:
- Rota leve em `app/(tabs)/index.tsx` delegando para `CatalogScreen`.
- Card duplicado de teste removido no catalogo.
- Modal de codigo migrado de estilo hibrido para `Modal` do DS.
- `app/modal.tsx` delegando para `SettingsScreen`.

Pendente para fechar:
- Extrair `useCatalogScreen.ts`.
- Extrair `catalog.constants.ts`, `catalog.utils.ts`, `catalog.types.ts`.
- Extrair `useSettingsScreen.ts`.
- Reduzir tamanho de `CatalogScreen.tsx` para limite recomendado.

### Etapa 2 - DS base + Jest (Agent 2)
Status: Em progresso (parcial)  <- corrigido (nao esta pendente)

Concluido:
- Houve alteracoes de base em `src/ui/atoms/*`.
- Houve alteracoes no tema base (`ThemeName` novo + alias legado).

Pendente para fechar:
- Corrigir teste snapshot/Jest (`react-native-worklets`).
- Fechar consolidacao de atomos sem regressao visual.
- Validar `npm test -- --watchAll=false` verde.

### Etapa 3 - Lobby container/presentation (Agent 1)
Status: Em progresso (parcial)

Concluido:
- Add player via modal de confirmacao.
- Ajuste inicial de responsividade do grid.
- Ajustes de modal de saida.

Pendente para fechar:
- Extrair `useLobbyScreen.ts`.
- Extrair `LobbyLeaveConfirmModal.tsx`, `LobbyAddPlayerModal.tsx`, `LobbyStartDock.tsx`.
- Reduzir `LobbyScreen.tsx` (ainda monolitico).

### Etapa 4 - Store/Realtime do lobby por camadas (Agent 1)
Status: Em progresso (parcial)

Concluido:
- Ordenacao remota host-first + ordem de entrada.
- `lastActivityAt` espalhado nas mutacoes.
- Preparacao para expiracao por inatividade.

Pendente para fechar:
- Split formal em `lobbySessionStore.ts`, `lobbyRealtimeService.ts`, `lobbyPersistenceService.ts`.
- Extrair `lobbyRetry.ts` e `lobbyErrorMap.ts`.
- Manter API publica estavel em `src/features/lobby/index.ts`.

### Etapa 5 - Sintonia modular (Agent 2)
Status: Pendente

Observacao:
- Ajustes minimos de compatibilidade nao contam como modularizacao.

### Etapa 6 - Impostor modular (Agent 2)
Status: Pendente

Observacao:
- Ajustes minimos de compatibilidade nao contam como modularizacao.

### Etapa 7 - Consistencia visual final (Agent 2)
Status: Em progresso (pre-work), bloqueada para fechamento ate Etapas 5/6

Concluido:
- Nome de temas normalizado para `coralPop`, `mintJam`, `blueberrySky`.
- Alias legado para nomes antigos (`neonParty`, `sunsetPulse`, `arcadeIce`).

Pendente para fechar:
- Auditoria completa de hardcodes nas features.
- Introduzir `featureColorTokens.ts` e migrar referencias.
- Fechar pass visual apos modularizacao de jogos.

### Etapa 8 - Integracao final, testes e docs (Ambos)
Status: Pendente

## Ordem de execucao recomendada

- Etapas 1 e 2 em paralelo.
- Etapa 3 depois de consolidar Etapa 1.
- Etapa 4 depois de consolidar Etapa 3.
- Etapas 5 e 6 em paralelo (prioridade alta).
- Etapa 7 fecha depois de 5 e 6.
- Etapa 8 fecha integracao final.

## Regras para evitar retrabalho agora

- Nao refazer no Agent 2:
- fluxo de add player por modal no Lobby
- ordenacao host-first no realtime do Lobby
- setup de header nativo em Settings

- Nao iniciar no Agent 1:
- modularizacao de Sintonia/Impostor
- refactor em `src/ui/atoms/*`
- fix de jest/worklets

## Checklist rapido de handoff

- Confirmar branch antes de iniciar.
- Confirmar ownership da etapa.
- Rodar `npx tsc --noEmit` ao final de cada bloco.
- Rodar `npm test -- --watchAll=false` ao final de blocos que tocam UI/test setup.
- Atualizar este arquivo ao fechar cada subetapa.
