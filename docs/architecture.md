# Arquitetura de Frontend - Hub Games

## Objetivo

Padronizar desenvolvimento React Native/Expo para:

1. reduzir acoplamento;
2. acelerar manutenção;
3. facilitar evolução visual sem quebrar lógica;
4. permitir trabalho paralelo por feature.

## Princípios

1. **Feature-first**: cada domínio (catalog, lobby, sintonia, impostor) organiza seus próprios componentes/hooks/services.
2. **Container vs Presentation**: separar tela que orquestra de componente que renderiza.
3. **Single responsibility**: cada arquivo tem um motivo claro para mudar.
4. **Design system primeiro**: UI reutilizável em `src/ui/atoms` antes de criar novo componente.
5. **Migração incremental**: extrair por camadas, sem big-bang.

## Estrutura recomendada

```text
app/
  lobby.tsx                       # rota leve, delega para feature
  game/[gameId].tsx               # rota leve, delega para feature

src/
  features/
    lobby/
      screens/
        LobbyScreen.tsx
      components/
        LobbyHeader.tsx
        LobbyRoomCode.tsx
        LobbyPlayerCard.tsx
        LobbyAddPlayerCard.tsx
        LobbyStatusPills.tsx
        index.ts
      hooks/
        useLobbyScreen.ts
      services/
        lobbyRealtimeService.ts
      styles/
        lobbyStyles.ts
      types/
        lobby.types.ts
      constants/
        lobby.constants.ts
      utils/
        lobby.utils.ts
```

## Contrato por camada

### 1. `app/*.tsx` (rota)

Responsável por:

1. receber params da navegação;
2. renderizar `<FeatureScreen />`;
3. zero lógica de negócio complexa.

### 2. `screens/*Screen.tsx`

Responsável por:

1. compor layout da tela;
2. usar hooks da feature;
3. passar props para componentes.

Não deve:

1. chamar Firebase diretamente;
2. concentrar styles longos;
3. ter mais de um bloco grande de regras de domínio.

### 3. `components/*`

Responsável por:

1. render puro e interações locais;
2. receber props tipadas;
3. ser reutilizável dentro da feature.

### 4. `hooks/*`

Responsável por:

1. estado da tela;
2. handlers;
3. derivação de dados.

### 5. `services/*`

Responsável por:

1. I/O (Firebase, AsyncStorage, APIs);
2. mapeamento de erros;
3. retries/timeouts quando aplicável.

## Convenções de nomes

1. Componentes: `PascalCase.tsx` (`LobbyPlayerCard.tsx`).
2. Hook: `useXxx.ts` (`useLobbyScreen.ts`).
3. Styles: `xxxStyles.ts`.
4. Tipos: `xxx.types.ts`.
5. Constantes: `xxx.constants.ts`.

## Limites de arquivo

1. Rota: recomendado até `200`, máximo `280` linhas.
2. Componente: recomendado até `180`, máximo `250` linhas.
3. Hook/service: recomendado até `220`, máximo `320` linhas.

Ao ultrapassar o recomendado, extrair imediatamente.

## UI e Design System

1. Reutilizar `src/ui/atoms`.
2. Tokens visuais via tema (`theme.semantic.*`) e `tailwind.config.js`.
3. NativeWind para layout; `StyleSheet` para sombras/efeitos avançados.
4. Evitar hardcode repetido de cores e medidas.

## Padrão de refatoração de telas grandes

### Passo 1 - Estabilizar

1. congelar comportamento atual;
2. garantir `npx tsc --noEmit` verde.

### Passo 2 - Extrair visual

1. mover blocos visuais para `components`;
2. mover styles para `styles/lobbyStyles.ts`.

### Passo 3 - Extrair lógica

1. mover handlers/derivações para `hooks/useLobbyScreen.ts`;
2. manter side effects remotos em `services`.

### Passo 4 - Revisão

1. validar comportamento;
2. validar performance;
3. revisar aderência ao design system.

## Checklist de PR

1. Arquitetura respeitada?
2. Arquivos dentro dos limites?
3. Sem lógica de negócio no JSX?
4. Tokens de tema usados corretamente?
5. Build TS verde?
6. Fluxos principais testados manualmente?

