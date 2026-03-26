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
Status: Concluida na branch `agent1/refactor-lobby-catalog-cleanup`

Concluido:
- Rota leve em `app/(tabs)/index.tsx` delegando para `CatalogScreen`.
- `app/modal.tsx` delegando para `SettingsScreen`.
- Catalog migrado para feature-first:
  - `src/features/catalog/screens/CatalogScreen.tsx`
  - `src/features/catalog/hooks/useCatalogScreen.ts`
  - `src/features/catalog/components/CatalogHeader.tsx`
  - `src/features/catalog/components/CatalogJoinCodeModal.tsx`
  - `src/features/catalog/catalog.constants.ts`
  - `src/features/catalog/catalog.utils.ts`
  - `src/features/catalog/catalog.types.ts`
  - `src/features/catalog/catalog.styles.ts`
- Settings migrado para feature-first:
  - `src/features/settings/screens/SettingsScreen.tsx`
  - `src/features/settings/hooks/useSettingsScreen.ts`
  - `src/features/settings/components/SettingsLanguageCard.tsx`
  - `src/features/settings/settings.constants.ts`
  - `src/features/settings/settings.styles.ts`
  - `src/features/settings/index.ts`
- `CatalogScreen.tsx` reduzido para 149 linhas.

Observacoes:
- Validacao de `tsc`/tests ainda depende de `node_modules` no worktree agent1.
- A etapa 1 foi fechada no escopo de refactor estrutural (sem alterar ownership de atomos/tema).

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
Status: Em progresso (forte avanco na branch `agent1/refactor-lobby-catalog-cleanup`)

Concluido:
- Rota leve em `app/lobby.tsx` delegando para `src/features/lobby/screens/LobbyScreen.tsx`.
- Estrutura inicial de components/hooks criada em `src/features/lobby`:
  - `components/LobbyLoadingState.tsx`
  - `components/LobbyAddPlayerModal.tsx`
  - `components/LobbyLeaveConfirmModal.tsx`
  - `components/LobbyStartDock.tsx`
  - `components/LobbyHeaderPanel.tsx`
  - `components/LobbyPlayersSection.tsx`
  - `components/LobbySettingsModal.tsx`
  - `hooks/useLobbyScreen.ts`
  - `lobby.constants.ts`
  - `lobby.utils.ts`
  - `lobby.styles.ts`
- Fluxo de add player migrado para modal dedicado (nome + validacao) no Lobby.
- Confirmacao de saida do lobby migrada para modal customizado (sem `Alert` nativo na navegacao mobile).
- Bottom dock de inicio extraido para componente `LobbyStartDock`.
- Estilos do lobby extraidos de `LobbyScreen.tsx` para `lobby.styles.ts`.
- `LobbyScreen.tsx` reduzido de ~1600 para ~600 linhas.
- `LobbyScreen.tsx` reduzido novamente para 103 linhas, com concentracao de efeitos/callbacks no hook.
- `hooks/useLobbyScreen.ts` passou a concentrar:
  - efeitos de navegacao (`header`, `beforeRemove`)
  - sincronizacao de countdown/start
  - fluxo de criar/entrar/sair/revelar codigo
  - montagem de props para `LobbyHeaderPanel`, `LobbyPlayersSection`, `LobbySettingsModal` e `LobbyStartDock`
- Extraido copy/view-model de apoio:
  - `src/features/lobby/lobby.copy.ts`
- Extraido sub-hook de estado derivado:
  - `src/features/lobby/hooks/useLobbyDerivedState.ts`
- Extraido sub-hook de modais/fluxo de add-player:
  - `src/features/lobby/hooks/useLobbyPlayerModals.ts`

Pendente para fechar:
- Revisar o tamanho do `useLobbyScreen.ts` e quebrar em sub-hooks (`useLobbyRealtimeFlow`, `useLobbyCountdown`) para manter legibilidade.
- Levar `PlayerAvatar` para componente isolado, caso o bloco de jogadores continue crescendo.

### Etapa 4 - Store/Realtime do lobby por camadas (Agent 1)
Status: Concluida (Agent 1)

Concluido:
- Ordenacao remota host-first + ordem de entrada.
- `lastActivityAt` espalhado nas mutacoes.
- Preparacao para expiracao por inatividade.
- Extracao inicial de infraestrutura do `store.ts`:
  - `src/features/lobby/lobbyErrorMap.ts`
  - `src/features/lobby/lobbyRetry.ts`
  - `src/features/lobby/lobbyPersistenceService.ts`
- `store.ts` passou a consumir os modulos acima e caiu para ~608 linhas (era ~805).
- Split inicial formal da store:
  - `src/features/lobby/lobbySessionStore.ts` agora concentra a implementacao.
  - `src/features/lobby/store.ts` virou facade de re-export (API publica preservada).
- Criado `src/features/lobby/lobbyRealtimeService.ts` para concentrar:
  - contexto remoto ativo
  - assinaturas de presence/lobby
  - execucao padronizada de acoes remotas com retry + mapeamento de erro
- Criado `src/features/lobby/lobbySessionUtils.ts` para reducers/helpers puros locais
  (`countPlayers`, `getMaxPlayersForLobby`, mutacoes locais de jogadores, etc).
- Criado `src/features/lobby/lobbySession.types.ts` para tipos da session store.
- Criado `src/features/lobby/lobbySessionSync.ts` para polling/sync e bind de subscriptions.
- Criado `src/features/lobby/lobbySessionRemoteFlows.ts` para fluxos remotos pesados
  (`restore/create/join/schedule/clear start`).
- Criado `src/features/lobby/lobbySessionActions.ts` como orquestrador das acoes da store.
- `src/features/lobby/lobbySessionStore.ts` reduzido para facade de bootstrap da zustand store.
- Tamanho dos modulos principais de infra do lobby agora abaixo do limite:
  - `lobbySessionStore.ts` ~23 linhas
  - `lobbySessionActions.ts` ~240 linhas
  - `lobbySessionRemoteFlows.ts` ~251 linhas
  - `lobbySessionSync.ts` ~60 linhas
  - `lobbyPersistenceService.ts` ~100 linhas
  - `lobbyRetry.ts` ~140 linhas
  - `lobbyRealtimeService.ts` ~70 linhas

Pendente para fechar:
- Nenhum item aberto do escopo Agent 1 para Etapa 4.

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
