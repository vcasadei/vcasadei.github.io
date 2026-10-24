---
layout: article
title: "SDD com OpenSpec, parte 5: a API de consulta de voos do SkyLedger"
date: 2026-10-23 13:00:00 -0300
key: sdd-openspec-5-skyledger-api-de-consulta
translation_key: sdd-openspec-5
cover: /assets/images/sdd-openspec-5/sdd-openspec-5.jpeg
tags: [SDD, OpenSpec, Claude Code, Spring Boot, React, Vite, OpenAPI, ANAC]
show_excerpt: false
mode: immersive
header:
  theme: dark
article_header:
  type: overlay
  theme: dark
  background_color: '#0b1020'
  background_image:
    gradient: 'linear-gradient(135deg, rgba(11, 16, 32, 0.93), rgba(80, 30, 12, 0.80))'
    src: /assets/images/sdd-openspec-5/sdd-openspec-5.jpeg
---

O último ciclo da série: uma API de consulta de voos e uma tela de busca, um pedido meu que os dados não sustentavam e um agente que precisou de um empurrão.

<!--more-->

Este é o quinto e último post de uma **série para ensinar Spec-Driven Development (SDD) com o [OpenSpec](https://github.com/Fission-AI/OpenSpec)**, construindo do zero o SkyLedger BR, um projeto que carrega e consulta os dados abertos de voos da ANAC.

**A série:**
1. [SDD com OpenSpec, parte 1: OpenSpec, schema casadei e Claude Code](/pt/2026/10/16/sdd-openspec-1-openspec-schema-casadei.html)
2. [SDD com OpenSpec, parte 2: SkyLedger BR e a infraestrutura local](/pt/2026/10/18/sdd-openspec-2-skyledger-infra-local.html)
3. [SDD com OpenSpec, parte 3: o esqueleto Spring Boot do SkyLedger](/pt/2026/10/19/sdd-openspec-3-skyledger-esqueleto-spring-boot.html)
4. [SDD com OpenSpec, parte 4: ingestão dos dados abertos da ANAC no SkyLedger](/pt/2026/10/21/sdd-openspec-4-skyledger-ingestao-anac.html)
5. **SDD com OpenSpec, parte 5: a API de consulta de voos do SkyLedger** (você está aqui)

No [post anterior](/pt/2026/10/21/sdd-openspec-4-skyledger-ingestao-anac.html), os 252.725 voos do VRA (Voo Regular Ativo) entraram no Postgres. Mas, até aqui, só dava para vê-los com SQL. Isso foi de propósito: ingestão e consulta são responsabilidades diferentes, então viram changes diferentes, cada uma com a sua spec. Agora vem a consulta, a change `add-flight-query-api`: um endpoint `GET /flights` somente leitura, com filtros, paginação, ordenação, erros padronizados e documentação OpenAPI, mais uma tela de busca em React.

Esta change é a que eu mais gosto de mostrar, porque nada saiu 100% redondo. Eu pedi, de propósito, algo que os dados não sustentavam, e acrescentei uma tela que o meu roteiro original deixava de fora. No apply, o build do front ficou lento e o agente parou para esperar em vez de investigar. É nesses momentos que o processo mostra o seu valor: o pedido imperfeito vira pergunta, o desvio vira registro no design e o humano sabe exatamente onde intervir.

Como é o último post, no final eu fecho a série: recapitulo o ciclo, mostro como as specs do projeto cresceram ao longo das quatro changes, listo as lições que ficaram e sugiro como você pode continuar praticando.

Como nos posts anteriores, os vídeos estão acelerados nos trechos de espera.

<style>
.sdd-wrap{white-space:pre-wrap !important;word-break:break-word;overflow:visible !important;max-height:none !important}
</style>

![O ciclo de cada change: /opsx:propose gera proposta, specs, design e tarefas; você revisa antes de qualquer código; /opsx:apply implementa com testes; /opsx:archive transforma a spec em documentação oficial](/assets/images/sdd-openspec-5/ciclo-change-pt.webp)

Cada fase tem uma branch no GitHub, para você comparar ou fazer checkout:

| Fase | Branch |
|------|--------|
| Propose | [`feat/add-flight-query-api/1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/1-propose) |
| Apply | [`feat/add-flight-query-api/2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/2-apply) |
| Archive | [`feat/add-flight-query-api/3-archive`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/3-archive) |

A `main` do [repositório](https://github.com/vcasadei/skyledger-br) é o estado final do projeto, idêntico à `3-archive` desta change.

---

# Parte 1 — Propose: um pedido imperfeito, de propósito

Desta vez não houve `/opsx:explore`. A necessidade da consulta surgiu no fim da ingestão, e a conversa sobre ela aconteceu ali mesmo: antes do archive anterior, o Claude me entregou um rascunho pronto para a proposta, com o aeroporto no formato ICAO (`SBGR`), que é o que os dados da ANAC trazem.

## O prompt

Eu colei esse rascunho e editei duas coisas antes de enviar. Este é o texto que foi, exatamente como enviei:

<div class="language-plaintext highlighter-rouge"><div class="highlight"><pre class="highlight sdd-wrap"><code>/opsx:propose add-flight-query-api

Quero consultar os voos já ingeridos por aeroporto, via um endpoint REST público:
GET /flights?airport=GRU

- O parâmetro airport usa o código IATA de 3 caracteres, diferentemente de como está no banco
- Parâmetro direction: DEPARTURE (voos que saem), ARRIVAL (voos que chegam) ou BOTH (padrão).
- Filtro opcional de período, from e to (datas AAAA-MM-DD), aplicado à partida prevista, ou à partida real quando a prevista não existir.
- Filtro opcional status: REALIZADO ou CANCELADO.
- Paginação obrigatória (page e size, com size máximo definido), ordenada por horário de partida.
- Cada voo na resposta traz: companhia, número do voo, origem, destino, partida e chegada previstas e reais, situação e atraso de partida em minutos (só quando houver horário previsto e real; nulo caso contrário).
- Os horários saem como estão no banco, sem conversão de fuso, e isso precisa estar documentado.
- Erros: 400 para parâmetro inválido (código fora do formato, data mal formada, size acima do máximo) e 404 quando o aeroporto não existe na tabela airport; corpo application/problem+json.
- Documentação OpenAPI completa e testes contra o schema isolado de testes.
- Somente leitura: não altera as tabelas nem a ingestão existentes.
- Quero também a construção de uma tela simples de busca com filtros e uma tabela de saída, com paginação e possibilidade de ordenação.</code></pre></div></div>

As duas edições:

1. **IATA no lugar de ICAO.** No rascunho estava `SBGR`. Eu troquei para `GRU`, o código que o usuário conhece, e escrevi "diferentemente de como está no banco". Eu sabia que o banco só tem ICAO e pedi IATA mesmo assim. No mundo real isso acontece o tempo todo: o pedido chega na linguagem do negócio, não na do banco. A pergunta é: o agente vai implementar cegamente, inventar um mapeamento ou parar e perguntar?
2. **A tela de busca**, na última linha. O meu roteiro deixava a tela como extra, por causa do salto de stack (Node, npm, bundler, framework de interface) e do risco de o build do front ficar lento no ambiente. Eu incluí mesmo assim, para ver como o processo lida com aumento de escopo.

E guarde uma frase do resto do prompt: **"Somente leitura: não altera as tabelas nem a ingestão existentes."** Ela entra em conflito direto com o IATA, porque guardar IATA exigiria mudar o esquema.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.1-00.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.1-00.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 37 s (vídeo acelerado).*

O primeiro passo do Claude foi **verificar a premissa**. Ele escreveu: *"O pedido usa GRU, mas o banco e os arquivos do VRA e do cadastro só trazem ICAO (SBGR)."* E rodou um comando que lê o cabeçalho do `Dados_Estatisticos.csv` do [anac-data](https://github.com/vcasadei/anac-data) e procura "iata" nos arquivos. Repare que ele já tinha me dito isso antes do archive anterior. Mesmo assim, diante de um pedido explícito, conferiu de novo na fonte. E repare no que ele **não** fez: não inventou uma tabela de IATA de memória. Isso seria um dado sem procedência entrando no sistema, sem dono e sem atualização. Pior que não ter.

## Primeira rodada de perguntas

Antes de escrever qualquer artefato, ele abriu um formulário com quatro abas. Cada aba corresponde a uma tensão real do meu pedido.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.1-01.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.1-01.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 25 s (vídeo acelerado).*

| Aba | Opções oferecidas | O que eu escolhi |
|-----|-------------------|------------------|
| **Fonte IATA** | OurAirports, um `airports.csv` de domínio público, ingerido como terceiro dataset (recomendada, mas "Fonte nova não-ANAC"); arquivo curado no repositório, com cerca de 289 aeroportos mantidos à mão; aceitar ICAO também | Resposta livre: **"Mudar a spec e aceitar somente ICAO"** |
| **Esquema** | Migração V2 com a coluna `airport.iata_code` e índice único, mudando a ingestão (recomendada, mas "contra o 'somente leitura'"); ou mapear em memória | Marquei a recomendada, **"Sim, V2 + ingestão"** |
| **Tela** | HTML + JS estático servido pelo Spring Boot, "sem build, sem dependência nova" (recomendada); Thymeleaf (dependência nova); SPA com React e Vite, "Mais escopo e toolchain novo" | **SPA** |
| **Ordenação** | Parâmetro `sort` na API (recomendada); ou reordenar só a página carregada, que "pode confundir: não ordena o conjunto todo" | **Parâmetro `sort`** |

Algumas observações. O agente não resolveu nenhuma tensão sozinho: explicitou o custo de cada caminho, marcou uma recomendação e deixou a decisão comigo. Na aba Esquema, ele citou a minha própria frase do prompt contra a opção recomendada. E em duas abas eu discordei da recomendação. **Recomendação não é ordem**; o formulário existe para que eu possa discordar de forma informada.

Na Fonte IATA, eu não quis inflar uma change que deveria ser só leitura com uma fonte de dados nova, que merece uma change própria. Na Tela, escolhi a SPA porque queria ver o schema cobrir também uma stack de front completa, sabendo do custo. E na Ordenação, ordenar só a página dá uma resposta errada com cara de certa.

Agora olhe as quatro respostas juntas. Percebeu a combinação que não faz sentido?

## Segunda rodada: a contradição que eu criei

Eu respondi "somente ICAO" na primeira aba e "Sim, V2 + ingestão" na segunda. Respondi aba por aba, sem cruzar as respostas. Com só ICAO, não há IATA para guardar, e a migração não tem propósito.

O Claude percebeu e, em vez de escolher sozinho qual resposta valia, abriu uma segunda rodada. Entre as rodadas, ele conferiu o Node e o npm instalados, a versão mais recente de cada pacote de front no registro do npm e a do `frontend-maven-plugin` no Maven Central. Por isso a pergunta de dependências já veio com versões.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.1-02.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.1-02.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 20 s (vídeo acelerado).*

* **Esquema:** *"Com 'somente ICAO', a migração V2 (coluna iata_code) não tem mais propósito. Confirma que a change fica só leitura, sem alterar esquema nem ingestão?"* A alternativa, manter a V2, criaria uma coluna vazia sem fonte para preenchê-la. Escolhi **"Sim, só leitura"**: estrutura criada para um futuro incerto é especulação.
* **Entrega da SPA:** build embutido no JAR com o `frontend-maven-plugin` 2.0.2, *"um só artefato, mesma origem (sem CORS), ./mvnw verify cobre tudo"*, com o servidor do Vite e proxy para a 8080 em desenvolvimento. A alternativa era um front separado, com CORS e um segundo processo. Escolhi o **embutido**.
* **Dependências do front:** `react` e `react-dom` 19.3, `vite` 8.3 com `@vitejs/plugin-react` 6.1, `typescript` 7.0, `vitest` 5.0 e `@testing-library/react` 16.3 com `jsdom`. Sem biblioteca de componentes: tabela e paginação feitas à mão. Marquei a recomendada.

Para mim, a primeira aba é o momento mais didático desta change. Respostas contraditórias acontecem, principalmente quando se responde um formulário de quatro abas com pressa. Um agente que escolhesse sozinho qual delas vale estaria decidindo por mim sem avisar. A contradição foi resolvida em segundos, antes de existir uma linha de código. Depois do apply, seria uma migração a desfazer.

As outras duas abas mostram outra coisa: escolher uma tecnologia puxa decisões de entrega e de dependências, e o schema [casadei](https://github.com/vcasadei/openspec-casadei) não aceita dependência nova sem nome, versão e aprovação.

## Medir antes de decidir, e só então escrever

Com as decisões tomadas, o Claude trabalhou sozinho por alguns minutos. Na tela só aparecem os indicadores de status; o que aconteceu por trás eu conto pela transcrição da sessão.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.1-03.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.1-03.mp4" type="video/mp4"></video>
*⏱ Tempo real: 5 min 13 s (vídeo acelerado).*

Antes de escrever, ele **mediu**. Rodou um `EXPLAIN ANALYZE` no banco real com a consulta paginada de `SBGR` nos três meses, sem índice. O primeiro número foi 215 ms, e ele mesmo desconfiou: *"pode estar inflado por cache frio"*. Repetiu três vezes com o cache aquecido, com `OFFSET 70000`, o pior caso de uma paginação profunda. Resultado: de 87 a 128 ms por página. Daí saiu a decisão de **não criar índice** nesta change, e a meta de menos de 500 ms entrou como critério de aceite. Desempenho virou requisito verificável, não impressão.

Depois ele criou a estrutura com `openspec new change add-flight-query-api`, releu os specs de `flight-data-ingestion` e `application-runtime` (em que a consulta vai se apoiar) e escreveu, na ordem: `proposal.md`, o spec `flight-query-api`, o spec `flight-search-ui`, o `design.md` com 10 decisões e o `tasks.md` com 32 tasks em 7 grupos. Validou tudo com `openspec validate --strict` e fez o commit na branch `1-propose`.

Repare em duas coisas. **Uma change, duas capabilities**: a API e a tela viraram specs separados, porque são responsabilidades diferentes, com consumidores diferentes. Uma futura troca de tecnologia de front mexeria em `flight-search-ui` sem tocar no contrato da API. E **nenhuma linha de Java ou de React** foi escrita: o propose só planeja.

## O resumo: "Seu pedido mudou em um ponto"

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.1-04.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.1-04.mp4" type="video/mp4"></video>
*⏱ Tempo real: 20 s (vídeo acelerado).*

Esta talvez seja a frase mais importante do propose:

> **Seu pedido mudou em um ponto.** O texto pedia `airport=GRU` (IATA), mas nenhuma fonte disponível tem código IATA: o VRA, o cadastro e o Dados Estatísticos usam só ICAO. Pela sua escolha, a API aceita **somente ICAO** (`airport=SBGR`). `GRU` recebe 400, com uma mensagem que explica que o esperado é ICAO. Também confirmamos que a change fica realmente **só leitura**: sem migração, sem índice e sem tocar na ingestão.

Um agente que entregasse uma API só ICAO sem dizer nada deixaria o meu prompt (que pede GRU) e o spec (que diz ICAO) se contradizendo em silêncio. Aqui a divergência fica registrada no resumo e nos artefatos, com o motivo.

O resumo também separa o que **eu** decidi (só ICAO, só leitura, SPA embutida) do que **ele** decidiu dentro dessas fronteiras, em uma seção chamada *"Decisões que tomei e que valem sua revisão"*:

* `size` padrão 20, máximo 100; ordenação padrão `departure,asc`, e `sort` aceita `departure`, `arrival`, `airline`, `flightNumber` e `delay`.
* **Partida de referência:** o horário previsto ou, quando falta, o real. Assim os 7.125 voos realizados sem horário previsto entram nos filtros e na ordenação.
* **O atraso pode ser negativo** (voo adiantado) e é nulo sem os dois horários. É uma regra de negócio que alguém da área precisa confirmar.
* **Sem índice**, pela medição acima.
* Os horários aparecem na tela como texto, sem `new Date()`, porque o `Date` do navegador aplicaria o fuso, e os dados estão sem fuso.
* **Caminho `/flights`, sem `/api`:** ele usou exatamente o que eu pedi, mas registrou a inconsistência com `/api/ingestions` como risco, porque padronizar depois seria BREAKING.

E os riscos: o TypeScript 7 é recente (plano B: voltar para a 6.x) e o build passa a precisar de rede na primeira vez. Este resumo é, na prática, a pauta de uma revisão de quinze minutos antes do apply.

## Os artefatos

A `proposal.md` deixa a decisão do ICAO explícita, logo no primeiro item:

```markdown
- **Endpoint `GET /flights`** (somente leitura), com estes parâmetros:
  - `airport` (obrigatório): código **ICAO** de 4 caracteres, como está no
    banco (ex.: `SBGR` para Guarulhos). Códigos IATA (`GRU`) **não** são
    aceitos nesta mudança, porque nenhuma fonte disponível traz IATA. Um
    código de 3 letras recebe 400 com uma mensagem que explica que o esperado
    é ICAO.
```

E a seção de capabilities modificadas está vazia, com um comentário que explica o porquê:

```markdown
### Modified Capabilities
<!-- Nenhuma. flight-data-ingestion só é lido (tabelas flight e airport);
     application-runtime não muda: o build continua exigindo só o JDK 21,
     porque o plugin baixa o Node. -->
```

No spec `flight-query-api`, o pedido de IATA virou um cenário de falha, no formato `AS A / WHEN / THEN` que o schema casadei exige:

```markdown
#### Scenario: Código IATA recusado
- **AS A** consumidor da API
- **WHEN** envio `GET /flights?airport=GRU`
- **THEN** recebo HTTP 400 com `application/problem+json` cujo `detail` cita `airport` e informa que o esperado é um código ICAO de 4 caracteres
```

E o detalhe do voo com origem igual ao destino, que aparece no total de `BOTH`, também virou cenário:

```markdown
#### Scenario: Sentido padrão
- **AS A** consumidor da API
- **WHEN** envio `GET /flights?airport=SBGR` sem `direction`
- **THEN** `content` traz voos com `origin` ou `destination` igual a `SBGR`
- **AND** `totalElements` é igual à soma dos totais de `DEPARTURE` e `ARRIVAL`, menos os voos com origem igual ao destino
```

O `design.md` tem decisões que valem a leitura inteira. A D2, por exemplo, descreve como montar SQL dinâmico sem abrir porta para injeção: a consulta é feita de fragmentos fixos, todos os valores vão por parâmetro nomeado, e a expressão de ordenação vem de uma lista branca num enum. O `tasks.md` tem 7 grupos: parâmetros; consulta e endpoint; documentação; build do front no Maven; tela; aceite com dados reais; e quality gates. Duas tasks me chamam a atenção:

```markdown
- [ ] 6.3 Abrir `http://localhost:8080/` no navegador, buscar `SBGR` e exercitar os filtros, a paginação, a ordenação por atraso e a mensagem de erro com `GRU`, e seguir `docs/consulta-voos.md` do zero, exatamente como escrito (verificação no navegador feita pelo desenvolvedor)
```

```markdown
- [ ] 7.4 Somente leitura confirmado: `git diff --stat feat/add-flight-data-ingestion/3-archive -- src/main/resources/db src/main/java/br/com/skyledger/ingestion` vazio. E nenhum segredo nem `.env` rastreado: `git ls-files | grep -x '.env'` vazio
```

A 6.3 é uma verificação **humana**, explicitamente atribuída a mim. A 7.4 transforma o "somente leitura" do prompt num comando verificável.

---

# Parte 2 — Apply: o plano, os desvios e um empurrão

Eu digitei só:

```
/opsx:apply
```

Neste apply o Claude não fez nenhuma pergunta de múltipla escolha. Tudo já tinha sido decidido no propose, e isso é sinal de um propose bem feito.

## Preparação e grupo 1

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-00.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-00.mp4" type="video/mp4"></video>
*⏱ Tempo real: 5 min 50 s (vídeo acelerado).*

A primeira frase foi *"Using change: add-flight-query-api"*: ele identificou sozinho qual change aplicar, porque era a única ativa. Depois fez um check-up: progresso da change (0 de 32), Postgres de pé, contagem de voos no banco. E encontrou um processo da aplicação rodando na 8080:

> Há 1 processo da aplicação rodando. Vou verificar o que é esse processo antes de continuar, já que uma instância esquecida já causou um 404 falso antes.

Ele lembrou de um problema anterior desta mesma sessão. Olhou o horário de início do processo e concluiu que tinha começado depois que ele parou a aplicação, então provavelmente era meu. **Não matou um processo que não era dele**: os testes de integração usam porta aleatória, então não havia conflito.

No grupo 1, ele criou os enums `Direction` e `SortField`, o record `FlightQuery` e a validação em `FlightQueryParameters`. O `SortField` é a decisão de segurança do design virando código:

```java
public enum SortField {
    /** Partida de referência: prevista, ou real quando não houver prevista. */
    DEPARTURE("departure", "COALESCE(f.scheduled_departure, f.actual_departure)"),
    /** Chegada de referência: prevista, ou real quando não houver prevista. */
    ARRIVAL("arrival", "COALESCE(f.scheduled_arrival, f.actual_arrival)"),
    /** Código da companhia. */
    AIRLINE("airline", "f.airline_icao"),
    /** Número do voo, como texto. */
    FLIGHT_NUMBER("flightNumber", "f.flight_number"),
    /** Atraso de partida em minutos. */
    DELAY("delay", "(EXTRACT(EPOCH FROM f.actual_departure - f.scheduled_departure) / 60)::integer");
```

O parâmetro `sort` só escolhe uma constante; ele nunca entra no SQL. Os testes unitários do grupo 1 têm o nome dos cenários do spec ("Código IATA recusado", "Período invertido", "Data mal formada"...). Isso é rastreabilidade de graça: dá para ir do requisito ao teste que o prova. Resultado: `Tests run: 10, Failures: 0`.

No grupo 2 apareceu o primeiro desvio, e ele avisou:

> Adicionei um FlightQueryService pequeno, não previsto no design original, para verificar o aeroporto, contar e buscar a página, mantendo o controller enxuto e a regra do 404 testável.

É uma boa régua para distinguir boa separação de abstração prematura: a divisão resolve um problema real? Aqui resolve. E, mais importante, ele **avisou** que saiu do design. Em SDD, o agente não acrescenta coisas em silêncio. Ele também moveu o helper de limpeza de banco, o `truncateAll`, para uma classe compartilhada, `TestDatabase`.

## Integração, OpenAPI, documentação e o começo do front

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-01.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-01.mp4" type="video/mp4"></video>
*⏱ Tempo real: 4 min 50 s (vídeo acelerado).*

A massa do teste de integração foi pensada para os casos difíceis: voo atrasado, voo adiantado, cancelamento perto da meia-noite, voo realizado sem horário previsto, voo com origem igual ao destino e 250 voos gerados com `generate_series` para a paginação. `Tests run: 14` na consulta, e os 6 da ingestão continuaram passando depois que o helper mudou de lugar. Os testes confirmaram que o Jackson 3 serializa `LocalDateTime` sem offset: o requisito "horários sem conversão de fuso" virou teste.

Depois veio a OpenAPI, com um teste que verifica a especificação gerada em `/v3/api-docs`: *"A OpenAPI documenta os 8 parâmetros, os enums, o máximo de 100, as 4 respostas e os dois schemas."* Testar a documentação não é exagero: a OpenAPI é um contrato com quem consome a API, e um teste garante que esse contrato não some numa refatoração. Em seguida, o `docs/consulta-voos.md`, com tabela de parâmetros, campos, erros e exemplo, ligado no README.

Duas regras do schema casadei aparecem aqui sem eu pedir: **cada grupo de tarefas entrega os seus próprios testes e docs**, em vez de um grupo de testes solto no fim, e **nenhuma dependência entra sem aprovação**. Por isso `jest-dom` e `user-event`, comuns em projetos React, ficaram de fora.

Antes de escrever o `package.json`, ele consultou o registro do npm para conferir a versão e as dependências de cada pacote. Não chutou versão. Montou o `frontend/` à mão, instalou 95 pacotes, e o primeiro build quebrou:

> TypeScript 7 funciona, mas o `import './styles.css'` quebra porque `noUncheckedSideEffectImports` agora vem ligado por padrão.

A correção foi um arquivo `vite-env.d.ts` com os tipos do Vite. E veio a frase que fecha um risco do propose: *"O build com TypeScript 7 funciona, então o plano B não foi necessário."* O risco estava escrito, com plano B; quando foi testado, a resposta veio clara.

## O build do front fica lento

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-02.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-02.mp4" type="video/mp4"></video>
*⏱ Tempo real: 14 min 10 s (vídeo acelerado).*

Agora o front seria plugado no Maven: o `frontend-maven-plugin` baixa um Node próprio, instala as dependências, compila a tela e roda os testes do front junto com os do Java. O Claude disparou um `./mvnw package` e a tela parou. Este trecho do vídeo está muito acelerado: alguns segundos parados correspondem a vários minutos reais.

O comando estourou o limite de 10 minutos e foi para segundo plano. O Claude percebeu, inspecionou a saída e os diretórios, viu que *"o frontend/node só tem um tmp"*, concluiu que o download do Node tinha terminado mas a extração estava lenta neste ambiente, e tomou uma boa decisão: **aproveitar a espera** para escrever o código da tela (grupo 5), porque mexer nos fontes não interfere na instalação. Saíram os tipos que espelham o contrato da API, a formatação, o cliente da API, o formulário, a tabela, a paginação, os testes com Vitest e Testing Library e as seções de documentação.

Até aí, tudo ótimo. Mas no fim ele escreveu:

> A documentação está pronta. O `./mvnw package` continua no `npm ci` em segundo plano. Vou receber uma notificação quando ele terminar.

E parou. Supôs que o build estava só lento, sem verificar se estava de fato progredindo. Quem olhasse a tela via um agente ocioso com um processo de dezesseis minutos pendurado.

## "Você está esperando?"

Esta foi a única mensagem que eu escrevi durante todo o apply, fora o próprio `/opsx:apply`:

```
você está esperando? Não tem nada o que fazer?
```

Repare que eu **não dei a solução**. Não disse onde estava o problema, não mandei cancelar o build, não sugeri mudar nada. Só questionei a espera. A pergunta aberta devolve ao agente a responsabilidade de investigar, e é ele que tem as ferramentas para isso.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-03.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-03.mp4" type="video/mp4"></video>
*⏱ Tempo real: 8 min 05 s (vídeo acelerado).*

A resposta começou com *"Você tem razão: eu não deveria ter parado sem verificar."* E veio um diagnóstico com evidência, não um palpite:

1. A árvore de processos mostrou o Maven rodando havia mais de 16 minutos, **sem nenhum processo filho**: nenhum `npm` ou `node`. Então ou o Java estava ocupado, ou travado.
2. Com o `jstack`, que mostra o que cada thread do Java está fazendo, a thread principal estava em `UnixFileSystem.canonicalize`, mexendo em arquivos.
3. Conclusão: *"O processo não travou — só está copiando milhares de arquivos do Node extraído lentamente."* O repositório estava num disco do Windows acessado pela WSL, onde milhares de arquivos pequenos custam caro.

A correção foi instalar o Node fora do projeto, em `${user.home}/.cache/skyledger/node`. E ele avisou que isso divergia da decisão D8 do design, *"que vou registrar no design"*. Encerrou o build antigo, apagou o `frontend/node`, trocou o diretório no `pom.xml`, tirou `frontend/node/` do `.gitignore` (que deixou de ser necessário) e refez o package:

> Sem o Node no projeto, o package completo caiu para 1 min (antes passava de 16).

No `pom.xml` ficou assim, com o comentário explicando o porquê:

```xml
<configuration>
    <workingDirectory>frontend</workingDirectory>
    <!-- Fora do projeto: copiar a distribuição do Node (milhares de arquivos)
         para um disco lento, como /mnt/c no WSL, leva vários minutos. -->
    <installDirectory>${user.home}/.cache/skyledger/node</installDirectory>
    <nodeVersion>${node.version}</nodeVersion>
</configuration>
```

![O ./mvnw package aciona o frontend-maven-plugin, que baixa um Node próprio, roda npm ci, compila a tela com o Vite e roda os testes do front com o Vitest; o resultado é um só JAR com GET /flights e a tela de busca na mesma origem. O Node passou de frontend/node/, dentro do projeto em /mnt/c (mais de 16 minutos), para ~/.cache/skyledger/node (package em cerca de 1 minuto), desvio registrado na D8](/assets/images/sdd-openspec-5/build-front-pt.webp)

Os 18 testes do front passaram, e o `SearchScreenTest` confirmou o cenário "Abrir a tela": `GET /` devolve o HTML e o script referenciado também é servido.

E aqui está, para mim, a lição mais importante de SDD em todo este post: **a implementação divergiu de uma decisão do design, e o design foi atualizado no mesmo apply, com o motivo**. Este é o trecho acrescentado à D8:

```markdown
*Mudança no apply:* o Node é instalado em `${user.home}/.cache/skyledger/node`,
e não em `frontend/node/`. Com o repositório em `/mnt/c` (WSL), o plugin
levou mais de 16 minutos copiando a distribuição do Node, que tem milhares
de arquivos, para dentro do projeto. Fora dele, o `package` completo leva
cerca de 1 minuto. O cache por usuário funciona igual em qualquer sistema e
dispensa a entrada no `.gitignore`.
```

Ele também registrou na D7 que o TypeScript 7.0.2 funcionou, quais ajustes foram feitos e que `jest-dom` e `user-event` ficaram de fora por não terem sido aprovados. Se o `design.md` continuasse dizendo `frontend/node/`, ele descreveria um sistema que não existe. Quando a change for arquivada, o design vira o registro de como o sistema foi construído; daqui a seis meses, alguém vai ler por que o Node fica fora do projeto sem precisar perguntar a ninguém. Você pode ver exatamente o que mudou comparando o `design.md` das branches [`1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/1-propose) e [`2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/2-apply).

Sobre o empurrão: um agente em modo autônomo às vezes confunde esperar um processo com terminar o trabalho. O papel de quem supervisiona não é microgerenciar, é perceber quando ele parou de avançar e fazer a pergunta certa. Se eu tivesse ditado a correção, poderia até acertar, mas teria pulado o diagnóstico.

## Aceite com dados reais e quality gates

Com tudo verde, o Claude subiu a aplicação na porta **8081**, *"evitando conflito com o processo que já ocupa a 8080"*, e partiu para o grupo 6: conferir a API contra o banco real.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-04.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-04.mp4" type="video/mp4"></video>
*⏱ Tempo real: 19 min 10 s (vídeo acelerado).*

* **6.1:** `BOTH` retorna 75.062 registros para `SBGR` (37.591 saídas + 37.620 chegadas − 149 voos com origem igual ao destino), validado por SQL, e todas as requisições abaixo de 500 ms.
* **6.2:** o `sort=delay,desc` bate com o máximo do SQL (3.894 minutos para o UAE 9941, de `SBGR` para `SAEZ`), e o voo AAL 0962 tem o mesmo atraso (−10 min) nos dois lados. Um extremo positivo e um negativo: é ali que erro de sinal ou de fórmula aparece.

Teste com massa sintética prova que o código faz o que o teste espera. Aceite com dado real prova que o teste espera a coisa certa. Ele ainda trocou o exemplo ilustrativo da documentação por uma resposta real da API:

```bash
curl -s 'http://localhost:8080/flights?airport=SBGR&direction=DEPARTURE&from=2026-05-11&to=2026-05-11&sort=airline&size=1'
```

```json
{
  "content": [
    {
      "airline": "AAL",
      "flightNumber": "0962",
      "origin": "SBGR",
      "destination": "KDFW",
      "scheduledDeparture": "2026-05-11T22:00:00",
      "actualDeparture": "2026-05-11T21:50:00",
      "scheduledArrival": "2026-05-12T08:30:00",
      "actualArrival": "2026-05-12T09:15:00",
      "status": "REALIZADO",
      "departureDelayMinutes": -10
    }
  ],
  "page": 0, "size": 1, "totalElements": 394, "totalPages": 394, "sort": "airline,asc"
}
```

Nos quality gates apareceu mais um problema de ambiente: o `./mvnw verify` deu `BUILD FAILURE` no `repackage`. O diagnóstico: o JAR estava em uso pela instância que ele mesmo tinha subido na 8081, e o Windows não deixa sobrescrever arquivo em uso. A solução: parar a instância e, dali em diante, rodar a aplicação a partir de uma **cópia** do JAR. Na segunda rodada:

> `./mvnw verify` passou: 99 testes Java e 18 do front, BUILD SUCCESS, e o public de dev está intacto.

O `npm audit` encontrou 0 vulnerabilidades, e a task 7.4 confirmou que nada mudou nas migrações nem no código da ingestão, que não há `.env` rastreado e que não há `node_modules` no git. Gates são o critério objetivo de pronto.

## O resumo: 31 de 32

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-05.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-05.mp4" type="video/mp4"></video>
*⏱ Tempo real: 2 min 07 s (vídeo acelerado).*

Antes do meu teste manual, o Claude fez os commits (só os arquivos certos, conferindo que nenhum `node_modules` ou `.env` entrou) e fez o push. Dois commits: `feat(flights): add flight query API and search screen` com a implementação, e outro com os artefatos do OpenSpec registrando o que a implementação descobriu. Assim o trabalho fica salvo mesmo que a sessão caia.

O resumo final abre assim: a implementação está feita, com **31 de 32 tasks**. Falta só a 6.3, a verificação da tela no navegador, *"que é sua"*. E ele me deu um roteiro do que testar: buscar `SBGR`, os filtros, a paginação, a ordenação por atraso e a mensagem de erro com `GRU`. Sobre a porta:

> Usei a porta 8081 porque havia outra instância na **8080**. Ela começou às 14:32, depois da última vez que eu parei a aplicação, então imagino que seja sua. Não mexi nela.

E a seção *"O que mudou em relação ao plano (registrado no design)"* lista o Node fora do projeto, com a admissão *"No começo eu deixei esse build rodando sozinho em segundo plano em vez de investigar; obrigado pelo empurrão"*, o TypeScript 7 sem plano B, o `FlightQueryService` e o `TestDatabase`. Mais um aviso de operação: quem roda a aplicação a partir do JAR em `target/` trava o próximo build neste disco.

Repare em dois sinais de um agente que respeita os limites do que foi delegado: ele **não marcou a 6.3 sozinho** (em vez de declarar 32 de 32 sem ninguém ter aberto a tela) e **não matou um processo que não era dele**. E um relatório honesto inclui os próprios erros.

## Task 6.3: a tela no navegador

A parte humana da verificação, no Chrome, em `localhost:8081`. A tela é servida pelo próprio JAR, sem servidor de front separado.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-06.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-06.mp4" type="video/mp4"></video>
*⏱ Tempo real: 59 s (vídeo acelerado).*

Procure na tela as decisões do propose:

* A dica embaixo do campo: *"Código ICAO de 4 letras (SBGR = Guarulhos); IATA como GRU não é aceito."* A decisão do ICAO, visível para o usuário.
* `SBGR`, a partir de junho de 2026, situação Realizado: **49.755 voos**, página 1 de 2.488, e a frase *"Horários como publicados pela ANAC, sem conversão de fuso."*
* Atrasos negativos, como o −13 do GLO 9603, são voos adiantados. O LAN Z1990, sem partida prevista, aparece com traço no atraso.
* Mudando o início para abril: 73.534 voos. Clicando no cabeçalho "Partida prevista", a ordem inverte e volta para a página 1. Clicando de novo, ordem crescente: o QTR 0779 e o LAN Z1992, sem partida prevista, entram pela partida real, a regra "prevista, ou real quando não houver prevista" do `SortField`.

É aqui que a spec vira produto. Cada detalhe da tela foi decidido no propose, escrito no spec, testado no apply e agora aparece na frente do usuário. (Um detalhe: o seletor de data mostra mês/dia/ano, que é o padrão do campo de data do Chrome no idioma configurado.)

---

# Parte 3 — Archive: dois specs novos, nenhum modificado

Depois do teste, respondi:

```
ficou perfeito. Funcionou, testei e está ok. Pode parar 8080 e 8081.
```

"Testei e está ok" é a evidência que a task 6.3 exige; sem ela, o Claude não teria base para marcá-la. E "pode parar 8080" é uma autorização explícita: a 8080 era a minha, um `spring-boot:run` que eu tinha subido na conferência da ingestão, ainda com código antigo.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.3-00.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.3-00.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 03 s (vídeo acelerado).*

Ele listou quem escutava nas duas portas, encerrou os dois processos e marcou a 6.3 com um script que só funciona se encontrar a linha `- [ ] 6.3` ainda aberta. A contagem mostrou 32 de 32. Mas o primeiro comando tinha indicado 1 processo restante, então ele conferiu de novo: *"8080/8081 livres"*. Era só um processo terminando de encerrar. O padrão de sempre: não confiar no próprio comando, conferir o efeito. Ele também apagou a cópia do JAR e deixou o ambiente Docker de pé.

Então:

```
/opsx:archive
```

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.3-01.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.3-01.mp4" type="video/mp4"></video>
*⏱ Tempo real: 45 s (vídeo acelerado).*

O Claude rodou o mesmo comando de preparação dos archives anteriores: instruções do archive, status dos artefatos, contagem de tasks, lista de specs principais e os cabeçalhos de cada delta. E resumiu: *"Confirmei que os 4 artefatos estão done com as 32 tasks concluídas, e os dois deltas só têm ADDED, sem spec principal ainda."*

Veio a mesma pergunta de todo archive: *"Os dois capabilities novos ainda não estão nos specs principais. Como seguir?"* **Sync now** cria os dois arquivos em `openspec/specs`, verifica e arquiva. **Archive without syncing** só move a change, e *"a API e a tela não passam a constar nos specs principais"*: existiriam no código, mas seriam invisíveis para quem planeja a próxima change. Escolhi Sync now.

Compare com o archive da ingestão, no post anterior: lá havia um RENAMED e dois MODIFIED no `application-runtime`, porque a ingestão mudou uma promessa antiga do sistema. Aqui **só há ADDED**. Não é acaso: é o "somente leitura" do prompt, confirmado na segunda rodada do propose, aparecendo na estrutura dos deltas. A estrutura do delta já é um indicador de risco.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.3-02.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.3-02.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 24 s (vídeo acelerado).*

Mesmo num sync que é só copiar requisitos novos, ele verificou três coisas: validade (`--strict`), contagem e corpo idêntico ao delta.

```
rules: 3
Specification 'flight-query-api' is valid
flight-query-api: 6/6 requisitos, 22/22 cenários, corpo idêntico
```

O `flight-search-ui` saiu com 6 requisitos e 10 cenários, também idêntico. E, com `git diff`, ele conferiu que os três specs existentes (`local-dev-environment`, `application-runtime` e `flight-data-ingestion`) ficaram inalterados. Essa última checagem é a mais interessante: ela não testa o que mudou, testa **o que não deveria ter mudado**. É ela que comprova o "somente leitura" no nível dos specs. Comparações assim são simples o bastante para virar um passo de pipeline.

Por fim, `git mv` da change para `openspec/changes/archive/2026-10-01-add-flight-query-api/`, preservando o histórico, e o commit na branch `3-archive`.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.3-03.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.3-03.mp4" type="video/mp4"></video>
*⏱ Tempo real: 14 s (vídeo acelerado).*

O resumo final traz a tabela das cinco capabilities do projeto: `local-dev-environment` com 9 requisitos, `application-runtime` com 7, `flight-data-ingestion` com 8, `flight-query-api` com 6 e `flight-search-ui` com 6. Nenhuma change ativa.

---

# Fechando a série

## O ciclo completo

Ao longo dos cinco posts, o SkyLedger BR passou quatro vezes pelo mesmo ciclo:

| Change | Post | O que entregou | Specs principais depois do archive |
|--------|------|----------------|------------------------------------|
| `setup-local-infra` | [parte 2](/pt/2026/10/18/sdd-openspec-2-skyledger-infra-local.html) | Docker Compose com Postgres, Redis e armazenamento S3 | criou `local-dev-environment` |
| `bootstrap-project-skeleton` | [parte 3](/pt/2026/10/19/sdd-openspec-3-skyledger-esqueleto-spring-boot.html) | aplicação Spring Boot, Flyway, health-check, OpenAPI | criou `application-runtime` |
| `add-flight-data-ingestion` | [parte 4](/pt/2026/10/21/sdd-openspec-4-skyledger-ingestao-anac.html) | ingestão do VRA e do cadastro de aeródromos | criou `flight-data-ingestion`, modificou `application-runtime` |
| `add-flight-query-api` | parte 5 | `GET /flights` e a tela de busca | criou `flight-query-api` e `flight-search-ui` |

Sempre a mesma sequência: **propose** (perguntas, artefatos validados, nenhum código), **revisão humana**, **apply** (task por task, cada grupo com testes e docs, desvios registrados no design), **archive** (sync das specs, verificação, histórico com `git mv`). Infraestrutura, esqueleto, ingestão e consulta: o ciclo não muda conforme o tipo de trabalho, e é isso que o torna previsível.

## Como as specs cresceram

Esta é a evolução de `openspec/specs/`, medida em cada branch de archive (requisitos / cenários):

| Spec | após infra | após esqueleto | após ingestão | após consulta |
|------|-----------|----------------|---------------|---------------|
| `local-dev-environment` | 9 / 16 | 9 / 16 | 9 / 16 | 9 / 16 |
| `application-runtime` | | 7 / 17 | 7 / 20 | 7 / 20 |
| `flight-data-ingestion` | | | 8 / 34 | 8 / 34 |
| `flight-query-api` | | | | 6 / 22 |
| `flight-search-ui` | | | | 6 / 10 |
| **Total** | **9 / 16** | **16 / 33** | **24 / 70** | **36 / 102** |

![Cenários em openspec/specs/ por branch de archive, empilhados por spec: 9 requisitos e 16 cenários após a infra, 16 e 33 após o esqueleto, 24 e 70 após a ingestão, 36 e 102 após a consulta](/assets/images/sdd-openspec-5/crescimento-specs-pt.webp)

Repare na linha do `application-runtime`: a ingestão mudou uma promessa da aplicação e os cenários passaram de 17 para 20. Já a consulta não tocou em nenhuma linha que existia antes. As specs crescem por acréscimo e só mudam quando o comportamento muda, e cada mudança tem uma change arquivada explicando o porquê.

E esta é a árvore real de `openspec/` na `main`:

```
openspec/
├── config.yaml
├── schemas/
│   └── casadei/
│       ├── schema.yaml
│       └── templates/
│           ├── design.md
│           ├── proposal.md
│           ├── spec.md
│           └── tasks.md
├── specs/
│   ├── application-runtime/spec.md
│   ├── flight-data-ingestion/spec.md
│   ├── flight-query-api/spec.md
│   ├── flight-search-ui/spec.md
│   └── local-dev-environment/spec.md
└── changes/
    └── archive/
        ├── 2026-09-29-setup-local-infra/
        │   ├── proposal.md, design.md, tasks.md
        │   └── specs/local-dev-environment/spec.md
        ├── 2026-09-30-bootstrap-project-skeleton/
        │   ├── proposal.md, design.md, tasks.md
        │   └── specs/application-runtime/spec.md
        ├── 2026-10-01-add-flight-data-ingestion/
        │   ├── proposal.md, design.md, tasks.md
        │   └── specs/
        │       ├── application-runtime/spec.md
        │       └── flight-data-ingestion/spec.md
        └── 2026-10-01-add-flight-query-api/
            ├── proposal.md, design.md, tasks.md
            └── specs/
                ├── flight-query-api/spec.md
                └── flight-search-ui/spec.md
```

(Cada pasta arquivada também tem o seu `.openspec.yaml`.) Duas leituras desta árvore: `specs/` responde **o que o sistema faz hoje**; `changes/archive/` responde **por que ele ficou assim**, change por change, com a proposta, o design e as tasks exatamente como foram aprovados e ajustados. Quem chegar depois consegue ler a ingestão e a consulta separadamente e entender cada responsabilidade sem precisar adivinhar. Para conferir pelo terminal:

```bash
git clone https://github.com/vcasadei/skyledger-br.git
cd skyledger-br
openspec list --specs
```

## O que eu aprendi (e o que fica)

* **Combinamos o quê, o agente decide o como, e a gente confere o resultado.** É o resumo de toda a série.
* **O propose é o ponto mais barato para mudar de ideia.** O IATA impossível e a minha contradição foram resolvidos em segundos, antes de existir código. Depois do apply, seriam uma migração a desfazer.
* **Um bom agente verifica a premissa antes de aceitar o pedido.** E não inventa dado sem procedência para fazer o pedido caber.
* **Recomendação não é ordem.** Discordei de duas recomendações nesta change, de forma informada. O formulário existe para isso.
* **Medir antes de decidir.** O "sem índice" saiu de números do banco real, com cuidado com o cache frio, e a meta virou critério de aceite.
* **Desvio se registra, não se esconde.** O `FlightQueryService`, o Node fora do projeto e o TypeScript 7 foram parar no design e no resumo. Um design que não acompanha a implementação descreve um sistema que não existe.
* **Testes com o nome dos cenários** dão rastreabilidade do requisito ao teste, de graça.
* **Aceite com dado real, nos extremos.** O maior atraso e um atraso negativo, conferidos contra SQL.
* **O humano continua no loop.** O agente pode ficar esperando quando deveria investigar. Supervisionar não é revisar cada linha; é perceber quando ele parou e fazer uma pergunta curta. E certas tasks, como olhar uma tela, só um humano pode marcar.
* **O archive é um hábito barato, não uma cerimônia.** E a estrutura do delta (só ADDED, ou MODIFIED) já diz muito sobre o risco de uma change.

## Próximos passos para praticar

A melhor forma de fixar o ciclo é rodá-lo sozinho. Algumas ideias, em ordem crescente de dificuldade, todas partindo da `main` do SkyLedger:

1. **Leia antes de escrever.** Clone o repositório, rode `openspec list --specs` e leia os cinco specs principais. Depois abra uma change arquivada e compare o `design.md` com o código.
2. **Proponha uma change pequena e bem delimitada.** O próprio projeto deixou duas sementes registradas no design desta change: os índices em `(origin_icao, COALESCE(scheduled_departure, actual_departure))`, que o D3 deixou como evolução "numa mudança com migração, se o volume crescer", e a padronização do prefixo `/api`, que o D10 registrou como inconsistência. Escolha uma e rode `/opsx:propose`. Na do `/api`, preste atenção: o delta vai ter MODIFIED, e a proposta deveria marcar a mudança como BREAKING.
3. **Resolva o IATA do jeito certo.** O agente sugeriu o OurAirports como fonte de domínio público. Proponha uma change só para isso: ingerir a fonte, guardar o código IATA e aceitar `GRU` na API. Veja quantas capabilities existentes o delta modifica.
4. **A próxima change de negócio do SkyLedger:** analytics de pontualidade e tráfego de aeroportos (os aeroportos mais movimentados, a pontualidade por companhia e rota), com cache no Redis. Os cinco specs atuais são a base: a proposta deveria referenciar a entidade `flight` em vez de redefini-la.
5. **Comece um projeto seu do zero**, com `openspec init`, o [schema casadei](https://github.com/vcasadei/openspec-casadei) ou o padrão do OpenSpec, e um primeiro `/opsx:explore` antes de qualquer change.

Em todos eles, faça a revisão de verdade entre o propose e o apply: leia o resumo, discorde de alguma recomendação, edite os artefatos se precisar. É aí que mora o valor.

## Sem ferramenta paga? Pratique de graça

Toda esta série usou o Claude Code. Se você não tem acesso a uma ferramenta paga, escrevi um guia para praticar exatamente o mesmo fluxo com o [opencode](https://opencode.ai) e modelos gratuitos: [Spec-Driven Development com opencode e modelos gratuitos do InkStone](/pt/2026/10/15/sdd-opencode-modelos-gratuitos-inkstone.html). O método não depende da ferramenta: os comandos mudam de `/opsx:propose` para `/opsx-propose`, mas o ciclo, os artefatos e o schema são os mesmos.

---

**Navegação da série:** ← [Parte 4: ingestão dos dados abertos da ANAC no SkyLedger](/pt/2026/10/21/sdd-openspec-4-skyledger-ingestao-anac.html) · Este é o último post. Para recomeçar: [Parte 1: OpenSpec, schema casadei e Claude Code](/pt/2026/10/16/sdd-openspec-1-openspec-schema-casadei.html)

---

# Referências

* **Spec-Driven Development**
  * [OpenSpec](https://github.com/Fission-AI/OpenSpec) · [Documentação](https://openspec.dev/docs)
  * [openspec-casadei](https://github.com/vcasadei/openspec-casadei), o meu schema público para o OpenSpec
* **O projeto**
  * [skyledger-br](https://github.com/vcasadei/skyledger-br) (a `main` é o estado final)
  * Branches desta change: [`1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/1-propose) · [`2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/2-apply) · [`3-archive`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/3-archive)
  * [anac-data](https://github.com/vcasadei/anac-data), os arquivos de origem
  * [Dados abertos da ANAC: Voo Regular Ativo (VRA)](https://www.anac.gov.br/acesso-a-informacao/dados-abertos/areas-de-atuacao/voos-e-operacoes-aereas/voo-regular-ativo-vra/62-voo-regular-ativo-vra)
* **Back-end**
  * [Spring Boot](https://spring.io/projects/spring-boot) · [`JdbcClient`](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html#jdbc-JdbcClient) · [Problem Details (RFC 9457)](https://www.rfc-editor.org/rfc/rfc9457)
  * [springdoc-openapi](https://springdoc.org) · [OpenAPI](https://www.openapis.org)
  * [PostgreSQL: `EXPLAIN`](https://www.postgresql.org/docs/16/using-explain.html)
* **Front-end e build**
  * [React](https://react.dev) · [Vite](https://vite.dev) · [TypeScript](https://www.typescriptlang.org)
  * [Vitest](https://vitest.dev) · [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
  * [frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin)
* **Dados de aeroportos**
  * [OurAirports: dados abertos](https://ourairports.com/data/)
* **Para praticar de graça**
  * [Spec-Driven Development com opencode e modelos gratuitos do InkStone](/pt/2026/10/15/sdd-opencode-modelos-gratuitos-inkstone.html)

---

Se esta série te ajudou a entender ou a começar a praticar SDD, me conta no LinkedIn ([linkedin.com/in/vcasadei](https://linkedin.com/in/vcasadei)) ou confira outros projetos e textos que publico em [vcasadei.com](https://vcasadei.com).

<style>
.article__content pre, .article__content pre code{white-space:pre-wrap !important;word-wrap:break-word;overflow-wrap:anywhere}
.article__content div.highlight, .article__content pre{overflow-x:visible !important}
</style>
