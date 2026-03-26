# Padrão Obrigatório de Arquitetura (Hub Games)

Este arquivo define como o agente deve estruturar código neste repositório.
Objetivo: manter clareza, escalabilidade e velocidade de entrega sem criar arquivos monolíticos.

## Regras de ouro

1. `app/*.tsx` é camada de rota/composição, não de implementação pesada.
2. Componentes de tela devem ser separados por feature (`src/features/<feature>/...`).
3. Lógica de negócio não fica em componente visual.
4. Estilos de tela não devem ficar todos no arquivo de rota.
5. Mudanças novas devem seguir o padrão; não adicionar dívida técnica nova.

## Limites de tamanho (obrigatórios)

1. Arquivo de rota (`app/...`): máximo recomendado `200` linhas, máximo absoluto `280`.
2. Componente visual: máximo recomendado `180` linhas, máximo absoluto `250`.
3. Hooks/services: máximo recomendado `220` linhas, máximo absoluto `320`.
4. Se estourar limite: extrair imediatamente.

## Estrutura alvo por feature

Use sempre este formato:

```text
src/features/<feature>/
  screens/
    <Feature>Screen.tsx          # composição da tela
  components/
    <Feature>Header.tsx
    <Feature>Card.tsx
    <Feature>List.tsx
    index.ts
  hooks/
    use<Feature>Screen.ts
  services/
    <feature>Service.ts
  styles/
    <feature>Styles.ts           # StyleSheet ou classes utilitárias
  types/
    <feature>.types.ts
  constants/
    <feature>.constants.ts
  utils/
    <feature>.utils.ts
```

## Padrão para telas (container/presentation)

1. Rota (`app/...`) delega para `src/features/.../screens/...`.
2. `Screen` compõe layout e chama hooks.
3. `components` recebem props já preparadas.
4. `hooks` concentram estado, derivação e handlers.
5. `services` concentram I/O (Firebase, storage, rede).

## Design System e UI

1. Reutilizar `src/ui/atoms` primeiro; só criar componente novo se necessário.
2. Tema e cores via tokens (`theme.semantic.*` ou tokens definidos), nunca hardcode solto espalhado.
3. NativeWind é permitido para layout rápido; para componentes críticos usar composição clara e previsível.
4. Se combinar NativeWind + `StyleSheet`, manter regra:
   - `className`: estrutura/layout simples
   - `StyleSheet`: animação, sombra complexa, estados visuais.

## Anti-padrões proibidos

1. Arquivo único gigante com lógica + UI + styles + chamadas remotas.
2. Duplicar lógica entre features sem util/hook compartilhado.
3. Criar novas variações de botão/card ignorando o design system existente.
4. Misturar decisões de domínio no JSX (if complexos repetidos).

## Checklist obrigatório antes de finalizar qualquer task

1. Arquivo final respeita limites de tamanho?
2. Rota está leve e delegando para feature?
3. Lógica de negócio está fora da view?
4. Estilos estão separados do fluxo principal?
5. `npx tsc --noEmit` passou?
6. Não quebrou comportamento existente?

## Regra de migração incremental

Quando tocar em arquivo legado grande:

1. Não reescrever tudo de uma vez sem necessidade.
2. Extrair primeiro: `components` e `styles`.
3. Depois extrair: `hooks`/`services`.
4. Manter comportamento, depois polir visual.

