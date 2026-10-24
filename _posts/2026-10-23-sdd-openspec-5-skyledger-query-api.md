---
layout: article
title: "SDD with OpenSpec, Part 5: SkyLedger's Flight Query API"
date: 2026-10-23 13:00:00 -0300
key: sdd-openspec-5-skyledger-query-api
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

The last cycle of the series: a flight query API and a search screen, a request of mine that the data could not support, and an agent that needed a nudge.

<!--more-->

This is the fifth and final post of a **series that teaches Spec-Driven Development (SDD) with [OpenSpec](https://github.com/Fission-AI/OpenSpec)**, building SkyLedger BR from scratch: a project that loads and queries the open flight data published by ANAC, Brazil's civil aviation agency.

**The series:**
1. [SDD with OpenSpec, Part 1: OpenSpec, the casadei Schema and Claude Code](/2026/10/16/sdd-openspec-1-openspec-casadei-schema.html)
2. [SDD with OpenSpec, Part 2: SkyLedger BR and the Local Infrastructure](/2026/10/18/sdd-openspec-2-skyledger-local-infra.html)
3. [SDD with OpenSpec, Part 3: SkyLedger's Spring Boot Skeleton](/2026/10/19/sdd-openspec-3-skyledger-spring-boot-skeleton.html)
4. [SDD with OpenSpec, Part 4: Ingesting ANAC's Open Data into SkyLedger](/2026/10/21/sdd-openspec-4-skyledger-anac-ingestion.html)
5. **SDD with OpenSpec, Part 5: SkyLedger's Flight Query API** (you are here)

In the [previous post](/2026/10/21/sdd-openspec-4-skyledger-anac-ingestion.html), the 252,725 flights from VRA (*Voo Regular Ativo*, ANAC's active scheduled flights dataset) landed in Postgres. But so far you could only see them with SQL. That was on purpose: ingestion and querying are different responsibilities, so they became different changes, each with its own spec. Now comes the query side, the `add-flight-query-api` change: a read-only `GET /flights` endpoint with filters, pagination, sorting, standardized errors and OpenAPI documentation, plus a React search screen.

This is the change I enjoy showing the most, because nothing went entirely smoothly. I deliberately asked for something the data did not support, and I added a screen that my original plan left out. During apply, the front-end build got slow and the agent stopped to wait instead of investigating. These are the moments where the process proves its worth: the imperfect request turns into a question, the deviation turns into a record in the design, and the human knows exactly where to step in.

Since this is the last post, at the end I close the series: I recap the cycle, show how the project's specs grew across the four changes, list the lessons that stuck, and suggest how you can keep practicing.

As in the previous posts, the videos are sped up during the waits.

<style>
.sdd-wrap{white-space:pre-wrap !important;word-break:break-word;overflow:visible !important;max-height:none !important}
</style>

![The cycle of each change: /opsx:propose produces proposal, specs, design and tasks; you review before any code; /opsx:apply implements with tests; /opsx:archive turns the spec into official documentation](/assets/images/sdd-openspec-5/ciclo-change-en.webp)

Each phase has a branch on GitHub, so you can compare or check it out:

| Phase | Branch |
|-------|--------|
| Propose | [`feat/add-flight-query-api/1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/1-propose) |
| Apply | [`feat/add-flight-query-api/2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/2-apply) |
| Archive | [`feat/add-flight-query-api/3-archive`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/3-archive) |

The [repository](https://github.com/vcasadei/skyledger-br)'s `main` is the project's final state, identical to this change's `3-archive`.

A note on language: the project and the whole conversation with the agent were in Portuguese. I quote prompts, artifacts and agent messages in the original and translate them right after, when it helps.

---

# Part 1 — Propose: an imperfect request, on purpose

There was no `/opsx:explore` this time. The need for querying came up at the end of the ingestion work, and the conversation about it happened right there: before the previous archive, Claude handed me a ready-made draft for the proposal, with the airport in ICAO format (`SBGR`), which is what ANAC's data carries.

## The prompt

I pasted that draft and edited two things before sending it. This is exactly what I sent:

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

In short: query already-ingested flights by airport through a public REST endpoint; the `airport` parameter uses the **3-letter IATA code, "unlike how it is in the database"**; `direction` (`DEPARTURE`, `ARRIVAL`, `BOTH` by default); optional `from`/`to` dates applied to the scheduled departure, or the actual one when there is no scheduled time; optional `status` (`REALIZADO`/`CANCELADO`, completed/cancelled); mandatory pagination with a maximum size, sorted by departure; each flight with airline, number, origin, destination, scheduled and actual times, status and departure delay in minutes (null when it cannot be computed); times exactly as stored, with no time zone conversion, and documented; 400 and 404 errors as `application/problem+json`; full OpenAPI docs and tests against the isolated test schema; **read-only, no changes to existing tables or ingestion**; and, finally, **a simple search screen with filters and a results table, with pagination and sorting**.

The two edits:

1. **IATA instead of ICAO.** The draft said `SBGR`. I changed it to `GRU`, the code users actually know, and wrote "unlike how it is in the database". I knew the database only has ICAO and asked for IATA anyway. This happens all the time in real life: requests arrive in the language of the business, not of the database. The question is: will the agent implement it blindly, make up a mapping, or stop and ask?
2. **The search screen**, on the last line. My plan left the screen as an extra, because of the stack jump (Node, npm, a bundler, a UI framework) and the risk of the front-end build being slow in this environment. I included it anyway, to see how the process handles scope growth.

And keep one sentence from the rest of the prompt in mind: **"Read-only: does not change the existing tables or ingestion."** It directly conflicts with IATA, because storing IATA codes would require a schema change.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.1-00.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.1-00.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 37 s (video sped up).*

Claude's first step was to **check the premise**. It wrote: *"The request uses GRU, but the database and the VRA and registry files only carry ICAO (SBGR)."* And it ran a command that reads the header of `Dados_Estatisticos.csv` in [anac-data](https://github.com/vcasadei/anac-data) and searches the files for "iata". Note that it had already told me this before the previous archive. Even so, faced with an explicit request, it checked the source again. And note what it did **not** do: it did not make up an IATA table from memory. That would be unsourced data entering the system, with no owner and no updates. Worse than nothing.

## First round of questions

Before writing any artifact, it opened a form with four tabs. Each tab maps to a real tension in my request.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.1-01.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.1-01.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 25 s (video sped up).*

| Tab | Options offered | What I chose |
|-----|-----------------|--------------|
| **IATA source** | OurAirports, a public-domain `airports.csv` ingested as a third dataset (recommended, but "new non-ANAC source"); a curated file in the repo, with about 289 airports maintained by hand; also accept ICAO | Free-text answer: **"Change the spec and accept ICAO only"** |
| **Schema** | A V2 migration with an `airport.iata_code` column and a unique index, changing ingestion (recommended, but "against the 'read-only'"); or map in memory | I ticked the recommended one, **"Yes, V2 + ingestion"** |
| **Screen** | Static HTML + JS served by Spring Boot, "no build, no new dependency" (recommended); Thymeleaf (new dependency); a React + Vite SPA, "more scope and a new toolchain" | **SPA** |
| **Sorting** | A `sort` parameter in the API (recommended); or re-sort only the loaded page, which "can be confusing: it does not sort the whole set" | **`sort` parameter** |

A few observations. The agent did not resolve any tension on its own: it spelled out the cost of each path, marked a recommendation and left the decision to me. In the Schema tab, it quoted my own prompt against the recommended option. And in two tabs I disagreed with the recommendation. **A recommendation is not an order**; the form exists so I can disagree in an informed way.

On the IATA source, I did not want to inflate a change that should be read-only with a new data source, which deserves its own change. On the Screen, I picked the SPA because I wanted to see the schema cover a full front-end stack too, knowing the cost. And on Sorting, sorting only the current page gives a wrong answer that looks right.

Now look at the four answers together. Do you see the combination that makes no sense?

## Second round: the contradiction I created

I answered "ICAO only" in the first tab and "Yes, V2 + ingestion" in the second. I answered tab by tab, without cross-checking. With ICAO only, there is no IATA to store, and the migration has no purpose.

Claude noticed and, instead of picking on its own which answer counted, opened a second round. Between the rounds, it checked the installed Node and npm, the latest version of each front-end package on the npm registry, and the `frontend-maven-plugin` version on Maven Central. That is why the dependency question already came with versions.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.1-02.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.1-02.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 20 s (video sped up).*

* **Schema:** *"With 'ICAO only', the V2 migration (iata_code column) no longer has a purpose. Do you confirm the change stays read-only, without changing the schema or ingestion?"* The alternative, keeping V2, would create an empty column with no source to fill it. I chose **"Yes, read-only"**: structure built for an uncertain future is speculation.
* **SPA delivery:** build embedded in the JAR with `frontend-maven-plugin` 2.0.2, *"a single artifact, same origin (no CORS), ./mvnw verify covers everything"*, with the Vite dev server proxying to 8080 during development. The alternative was a separate front end, with CORS and a second process. I chose **embedded**.
* **Front-end dependencies:** `react` and `react-dom` 19.3, `vite` 8.3 with `@vitejs/plugin-react` 6.1, `typescript` 7.0, `vitest` 5.0 and `@testing-library/react` 16.3 with `jsdom`. No component library: the table and pagination are hand-written. I picked the recommended option.

For me, the first tab is the most instructive moment of this change. Contradictory answers happen, especially when you fill in a four-tab form in a hurry. An agent that silently picked which one counted would be deciding for me without telling me. The contradiction was resolved in seconds, before a single line of code existed. After apply, it would have been a migration to undo.

The other two tabs show something else: choosing a technology pulls in delivery and dependency decisions, and the [casadei](https://github.com/vcasadei/openspec-casadei) schema does not accept a new dependency without a name, a version and an approval.

## Measure before deciding, and only then write

With the decisions made, Claude worked alone for a few minutes. The screen only shows status indicators; I describe what happened behind the scenes from the session transcript.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.1-03.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.1-03.mp4" type="video/mp4"></video>
*⏱ Real time: 5 min 13 s (video sped up).*

Before writing, it **measured**. It ran `EXPLAIN ANALYZE` on the real database with the paginated `SBGR` query over the three months, without an index. The first number was 215 ms, and it was the first to distrust it: *"it may be inflated by a cold cache"*. It repeated the run three times with a warm cache, using `OFFSET 70000`, the worst case of deep pagination. Result: 87 to 128 ms per page. That is where the decision to **not create an index** in this change came from, and the under-500 ms target became an acceptance criterion. Performance became a verifiable requirement, not an impression.

Then it created the structure with `openspec new change add-flight-query-api`, re-read the `flight-data-ingestion` and `application-runtime` specs (which the query builds on) and wrote, in order: `proposal.md`, the `flight-query-api` spec, the `flight-search-ui` spec, `design.md` with 10 decisions, and `tasks.md` with 32 tasks in 7 groups. It validated everything with `openspec validate --strict` and committed to the `1-propose` branch.

Note two things. **One change, two capabilities**: the API and the screen became separate specs, because they are different responsibilities with different consumers. A future front-end technology swap would touch `flight-search-ui` without touching the API contract. And **not a single line of Java or React** was written: propose only plans.

## The summary: "Your request changed in one point"

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.1-04.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.1-04.mp4" type="video/mp4"></video>
*⏱ Real time: 20 s (video sped up).*

This is perhaps the most important sentence of the propose phase (translated):

> **Your request changed in one point.** The text asked for `airport=GRU` (IATA), but no available source has IATA codes: VRA, the registry and Dados Estatísticos only use ICAO. Per your choice, the API accepts **ICAO only** (`airport=SBGR`). `GRU` gets a 400, with a message explaining that ICAO is expected. We also confirmed the change is truly **read-only**: no migration, no index and no changes to ingestion.

An agent that delivered an ICAO-only API without saying anything would leave my prompt (which asks for GRU) and the spec (which says ICAO) silently contradicting each other. Here the divergence is recorded in the summary and in the artifacts, with the reason.

The summary also separates what **I** decided (ICAO only, read-only, embedded SPA) from what **it** decided within those boundaries, in a section called *"Decisions I made that deserve your review"*:

* Default `size` 20, maximum 100; default sort `departure,asc`, and `sort` accepts `departure`, `arrival`, `airline`, `flightNumber` and `delay`.
* **Reference departure:** the scheduled time or, when missing, the actual one. That way the 7,125 completed flights without a scheduled time are included in filters and sorting.
* **The delay can be negative** (early departure) and is null without both times. That is a business rule someone from the domain needs to confirm.
* **No index**, based on the measurement above.
* Times are shown on screen as text, without `new Date()`, because the browser's `Date` would apply the local time zone, and the data has no time zone.
* **The `/flights` path, without `/api`:** it used exactly what I asked for, but recorded the inconsistency with `/api/ingestions` as a risk, because standardizing later would be BREAKING.

And the risks: TypeScript 7 is very recent (plan B: fall back to 6.x) and the build now needs network access the first time. In practice, this summary is the agenda for a fifteen-minute review before apply.

## The artifacts

`proposal.md` makes the ICAO decision explicit, right in the first item (in short: `airport` is a mandatory 4-character **ICAO** code, as stored in the database; IATA codes like `GRU` are **not** accepted in this change because no available source carries IATA; a 3-letter code gets a 400 explaining that ICAO is expected):

```markdown
- **Endpoint `GET /flights`** (somente leitura), com estes parâmetros:
  - `airport` (obrigatório): código **ICAO** de 4 caracteres, como está no
    banco (ex.: `SBGR` para Guarulhos). Códigos IATA (`GRU`) **não** são
    aceitos nesta mudança, porque nenhuma fonte disponível traz IATA. Um
    código de 3 letras recebe 400 com uma mensagem que explica que o esperado
    é ICAO.
```

And the modified capabilities section is empty, with a comment explaining why (`flight-data-ingestion` is only read; `application-runtime` does not change, since the build still only needs JDK 21 because the plugin downloads Node):

```markdown
### Modified Capabilities
<!-- Nenhuma. flight-data-ingestion só é lido (tabelas flight e airport);
     application-runtime não muda: o build continua exigindo só o JDK 21,
     porque o plugin baixa o Node. -->
```

In the `flight-query-api` spec, the IATA request became a failure scenario, in the `AS A / WHEN / THEN` format the casadei schema requires ("IATA code rejected": as an API consumer, when I send `GET /flights?airport=GRU`, then I get HTTP 400 with `application/problem+json` whose `detail` mentions `airport` and says a 4-character ICAO code is expected):

```markdown
#### Scenario: Código IATA recusado
- **AS A** consumidor da API
- **WHEN** envio `GET /flights?airport=GRU`
- **THEN** recebo HTTP 400 com `application/problem+json` cujo `detail` cita `airport` e informa que o esperado é um código ICAO de 4 caracteres
```

The detail about flights whose origin equals their destination, which affects the `BOTH` total, also became a scenario ("Default direction": `totalElements` equals the sum of the `DEPARTURE` and `ARRIVAL` totals, minus flights with origin equal to destination):

```markdown
#### Scenario: Sentido padrão
- **AS A** consumidor da API
- **WHEN** envio `GET /flights?airport=SBGR` sem `direction`
- **THEN** `content` traz voos com `origin` ou `destination` igual a `SBGR`
- **AND** `totalElements` é igual à soma dos totais de `DEPARTURE` e `ARRIVAL`, menos os voos com origem igual ao destino
```

`design.md` has decisions worth reading in full. D2, for example, describes how to build dynamic SQL without opening the door to injection: the query is built from fixed fragments, every value goes through a named parameter, and the sort expression comes from an allowlist inside an enum. `tasks.md` has 7 groups: parameters; query and endpoint; documentation; front-end build in Maven; the screen; acceptance with real data; and quality gates. Two tasks stand out to me:

```markdown
- [ ] 6.3 Abrir `http://localhost:8080/` no navegador, buscar `SBGR` e exercitar os filtros, a paginação, a ordenação por atraso e a mensagem de erro com `GRU`, e seguir `docs/consulta-voos.md` do zero, exatamente como escrito (verificação no navegador feita pelo desenvolvedor)
```

```markdown
- [ ] 7.4 Somente leitura confirmado: `git diff --stat feat/add-flight-data-ingestion/3-archive -- src/main/resources/db src/main/java/br/com/skyledger/ingestion` vazio. E nenhum segredo nem `.env` rastreado: `git ls-files | grep -x '.env'` vazio
```

Task 6.3 is a **human** check, explicitly assigned to me: open the screen in the browser, search `SBGR`, exercise filters, pagination, delay sorting and the `GRU` error, and follow the docs from scratch, exactly as written ("browser check performed by the developer"). Task 7.4 turns the prompt's "read-only" into a verifiable command: an empty diff on migrations and ingestion code, and no `.env` tracked.

---

# Part 2 — Apply: the plan, the deviations and a nudge

All I typed was:

```
/opsx:apply
```

In this apply, Claude did not ask a single multiple-choice question. Everything had already been decided in propose, and that is a sign of a well-done propose.

## Preparation and group 1

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-00.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-00.mp4" type="video/mp4"></video>
*⏱ Real time: 5 min 50 s (video sped up).*

The first line was *"Using change: add-flight-query-api"*: it figured out on its own which change to apply, because it was the only active one. Then it ran a check-up: the change's progress (0 of 32), Postgres up, the flight count in the database. And it found an application process running on port 8080:

> There is 1 application process running. I'll check what that process is before continuing, since a forgotten instance already caused a false 404 earlier.

It remembered an earlier problem from this same session. It looked at the process start time and concluded it had started after it stopped the application, so it was probably mine. **It did not kill a process that was not its own**: the integration tests use a random port, so there was no conflict.

In group 1, it created the `Direction` and `SortField` enums, the `FlightQuery` record and the validation in `FlightQueryParameters`. `SortField` is the design's security decision turned into code:

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

The `sort` parameter only picks a constant; it never goes into the SQL. That closes the door to SQL injection. The group 1 unit tests are named after the spec scenarios ("IATA code rejected", "Inverted period", "Malformed date"...). That is traceability for free: you can go from the requirement to the test that proves it. Result: `Tests run: 10, Failures: 0`.

Group 2 brought the first deviation, and it said so:

> I added a small FlightQueryService, not foreseen in the original design, to check the airport, count and fetch the page, keeping the controller lean and the 404 rule testable.

It is a good yardstick to tell good separation from premature abstraction: does the split solve a real problem? Here it does. And, more importantly, it **said** it had stepped outside the design. In SDD, the agent does not add things silently. It also moved the database cleanup helper, `truncateAll`, into a shared class, `TestDatabase`.

## Integration, OpenAPI, docs and the start of the front end

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-01.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-01.mp4" type="video/mp4"></video>
*⏱ Real time: 4 min 50 s (video sped up).*

The integration test data was designed for the hard cases: a delayed flight, an early flight, a cancellation near midnight, a completed flight with no scheduled time, a flight whose origin equals its destination, and 250 flights generated with `generate_series` for pagination. `Tests run: 14` for the query, and the 6 ingestion tests still passed after the helper moved. The tests confirmed that Jackson 3 serializes `LocalDateTime` without an offset: the "no time zone conversion" requirement became a test.

Then came OpenAPI, with a test that checks the generated specification at `/v3/api-docs`: *"The OpenAPI documents the 8 parameters, the enums, the maximum of 100, the 4 responses and the two schemas."* Testing the documentation is not overkill: OpenAPI is a contract with whoever consumes the API, and a test makes sure that contract does not vanish in a refactor. Next, `docs/consulta-voos.md`, with a parameter table, fields, errors and an example, linked from the README.

Two casadei schema rules show up here without me asking: **each task group delivers its own tests and docs**, instead of a loose testing group at the end, and **no dependency gets in without approval**. That is why `jest-dom` and `user-event`, common in React projects, were left out.

Before writing `package.json`, it queried the npm registry to check each package's version and dependencies. No guessing. It set up `frontend/` by hand, installed 95 packages, and the first build broke:

> TypeScript 7 works, but `import './styles.css'` breaks because `noUncheckedSideEffectImports` is now on by default.

The fix was a `vite-env.d.ts` file with Vite's types. And then the sentence that closed a propose risk: *"The build with TypeScript 7 works, so plan B was not needed."* The risk was written down, with a plan B; when it was tested, the answer was clear.

## The front-end build gets slow

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-02.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-02.mp4" type="video/mp4"></video>
*⏱ Real time: 14 min 10 s (video sped up).*

Now the front end would be wired into Maven: `frontend-maven-plugin` downloads its own Node, installs the dependencies, builds the screen and runs the front-end tests alongside the Java ones. Claude kicked off `./mvnw package` and the screen froze. This part of the video is heavily sped up: a few still seconds correspond to several real minutes.

The command hit the 10-minute limit and moved to the background. Claude noticed, inspected the output and the directories, saw that *"frontend/node only has a tmp"*, concluded the Node download had finished but extraction was slow in this environment, and made a good call: **use the wait** to write the screen code (group 5), since editing sources does not interfere with the install. Out came the types mirroring the API contract, formatting, the API client, the form, the table, pagination, tests with Vitest and Testing Library, and the documentation sections.

So far, great. But at the end it wrote:

> The documentation is ready. `./mvnw package` is still in `npm ci` in the background. I'll get a notification when it finishes.

And it stopped. It assumed the build was just slow, without checking whether it was actually making progress. Anyone looking at the screen saw an idle agent with a sixteen-minute process hanging.

## "Are you waiting?"

This was the only message I wrote during the whole apply, apart from `/opsx:apply` itself:

```
você está esperando? Não tem nada o que fazer?
```

("Are you waiting? Don't you have anything to do?") Note that I **did not give the solution**. I did not say where the problem was, did not tell it to cancel the build, did not suggest any change. I only questioned the waiting. An open question hands the responsibility to investigate back to the agent, and the agent is the one with the tools to do it.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-03.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-03.mp4" type="video/mp4"></video>
*⏱ Real time: 8 min 05 s (video sped up).*

The answer began with *"You're right: I shouldn't have stopped without checking."* And then came a diagnosis with evidence, not a guess:

1. The process tree showed Maven running for over 16 minutes **with no child processes**: no `npm` or `node`. So either Java itself was busy, or it was stuck.
2. With `jstack`, which shows what each Java thread is doing, the main thread was in `UnixFileSystem.canonicalize`, working on files.
3. Conclusion: *"The process isn't stuck — it's just slowly copying thousands of files from the extracted Node."* The repository lived on a Windows disk accessed through WSL, where thousands of small files are expensive.

The fix was to install Node outside the project, in `${user.home}/.cache/skyledger/node`. And it warned that this diverged from design decision D8, *"which I'll record in the design"*. It killed the old build, deleted `frontend/node`, changed the directory in `pom.xml`, removed `frontend/node/` from `.gitignore` (no longer needed) and re-ran the package:

> Without Node inside the project, the full package dropped to 1 min (it used to take over 16).

In `pom.xml` it looks like this, with a comment explaining why (outside the project, because copying the Node distribution, thousands of files, to a slow disk like `/mnt/c` on WSL takes several minutes):

```xml
<configuration>
    <workingDirectory>frontend</workingDirectory>
    <!-- Fora do projeto: copiar a distribuição do Node (milhares de arquivos)
         para um disco lento, como /mnt/c no WSL, leva vários minutos. -->
    <installDirectory>${user.home}/.cache/skyledger/node</installDirectory>
    <nodeVersion>${node.version}</nodeVersion>
</configuration>
```

![./mvnw package triggers frontend-maven-plugin, which downloads its own Node, runs npm ci, builds the screen with Vite and runs the front-end tests with Vitest; the result is a single JAR serving GET /flights and the search screen on the same origin. Node moved from frontend/node/, inside the project on /mnt/c (over 16 minutes), to ~/.cache/skyledger/node (package in about 1 minute), a deviation recorded in D8](/assets/images/sdd-openspec-5/build-front-en.webp)

The 18 front-end tests passed, and `SearchScreenTest` confirmed the "Open the screen" scenario: `GET /` returns the HTML and the referenced script is served too.

And here is, for me, the most important SDD lesson in this whole post: **the implementation diverged from a design decision, and the design was updated in the same apply, with the reason**. This is the passage added to D8:

```markdown
*Mudança no apply:* o Node é instalado em `${user.home}/.cache/skyledger/node`,
e não em `frontend/node/`. Com o repositório em `/mnt/c` (WSL), o plugin
levou mais de 16 minutos copiando a distribuição do Node, que tem milhares
de arquivos, para dentro do projeto. Fora dele, o `package` completo leva
cerca de 1 minuto. O cache por usuário funciona igual em qualquer sistema e
dispensa a entrada no `.gitignore`.
```

("Change during apply: Node is installed in the per-user cache, not in `frontend/node/`. With the repository on `/mnt/c` (WSL), the plugin spent over 16 minutes copying the Node distribution into the project. Outside it, the full package takes about 1 minute. The per-user cache works the same on any system and removes the `.gitignore` entry.")

It also recorded in D7 that TypeScript 7.0.2 worked, which adjustments were made, and that `jest-dom` and `user-event` were left out because they had not been approved. If `design.md` still said `frontend/node/`, it would describe a system that does not exist. Once the change is archived, the design becomes the record of how the system was built; six months from now, someone will read why Node lives outside the project without having to ask anyone. You can see exactly what changed by comparing `design.md` on the [`1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/1-propose) and [`2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/2-apply) branches.

About the nudge: an agent in autonomous mode sometimes confuses waiting for a process with finishing the work. The supervisor's job is not to micromanage; it is to notice when the agent stopped making progress and ask the right question. If I had dictated the fix, I might even have been right, but we would have skipped the diagnosis.

## Acceptance with real data and quality gates

With everything green, Claude started the application on port **8081**, *"avoiding a conflict with the process already on 8080"*, and moved on to group 6: checking the API against the real database.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-04.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-04.mp4" type="video/mp4"></video>
*⏱ Real time: 19 min 10 s (video sped up).*

* **6.1:** `BOTH` returns 75,062 records for `SBGR` (37,591 departures + 37,620 arrivals − 149 flights whose origin equals their destination), validated with SQL, and every request under 500 ms.
* **6.2:** `sort=delay,desc` matches the SQL maximum (3,894 minutes for UAE 9941, from `SBGR` to `SAEZ`), and flight AAL 0962 has the same delay (−10 min) on both sides. One positive and one negative extreme: that is where sign or formula errors show up.

A test with synthetic data proves the code does what the test expects. Acceptance with real data proves the test expects the right thing. It also replaced the illustrative example in the docs with a real API response:

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

The quality gates surfaced one more environment problem: `./mvnw verify` hit `BUILD FAILURE` at `repackage`. The diagnosis: the JAR was in use by the instance it had started on 8081 itself, and Windows does not allow overwriting a file in use. The fix: stop the instance and, from then on, run the application from a **copy** of the JAR. On the second run:

> `./mvnw verify` passed: 99 Java tests and 18 front-end tests, BUILD SUCCESS, and the dev public schema is intact.

`npm audit` found 0 vulnerabilities, and task 7.4 confirmed nothing changed in the migrations or the ingestion code, no `.env` is tracked and no `node_modules` is in git. Gates are the objective definition of done.

## The summary: 31 of 32

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-05.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-05.mp4" type="video/mp4"></video>
*⏱ Real time: 2 min 07 s (video sped up).*

Before my manual test, Claude made the commits (only the right files, checking that no `node_modules` or `.env` got in) and pushed them. Two commits: `feat(flights): add flight query API and search screen` with the implementation, and another with the OpenSpec artifacts recording what the implementation discovered. That way the work is saved even if the session drops.

The final summary opens like this: the implementation is done, with **31 of 32 tasks**. Only 6.3 remains, the browser check of the screen, *"which is yours"*. And it gave me a script of what to test: search `SBGR`, the filters, pagination, delay sorting and the error message with `GRU`. About the port:

> I used port 8081 because there was another instance on **8080**. It started at 14:32, after the last time I stopped the application, so I assume it's yours. I didn't touch it.

And the section *"What changed relative to the plan (recorded in the design)"* lists Node outside the project, with the admission *"At first I left that build running on its own in the background instead of investigating; thanks for the nudge"*, TypeScript 7 without plan B, `FlightQueryService` and `TestDatabase`. Plus an operational warning: running the application from the JAR in `target/` locks the next build on this disk.

Note two signs of an agent that respects the limits of what was delegated: it **did not tick 6.3 by itself** (instead of declaring 32 of 32 without anyone having opened the screen) and it **did not kill a process that was not its own**. And an honest report includes its own mistakes.

## Task 6.3: the screen in the browser

The human part of the verification, in Chrome, at `localhost:8081`. The screen is served by the JAR itself, with no separate front-end server.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.2-06.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.2-06.mp4" type="video/mp4"></video>
*⏱ Real time: 59 s (video sped up).*

Look for the propose decisions on the screen:

* The hint under the field: *"4-letter ICAO code (SBGR = Guarulhos); IATA such as GRU is not accepted."* The ICAO decision, visible to the user.
* `SBGR`, from June 2026, status Completed: **49,755 flights**, page 1 of 2,488, and the sentence *"Times as published by ANAC, without time zone conversion."*
* Negative delays, like GLO 9603's −13, are early departures. LAN Z1990, with no scheduled departure, shows a dash for the delay.
* Moving the start to April: 73,534 flights. Clicking the "Scheduled departure" header reverses the order and jumps back to page 1. Clicking again, ascending order: QTR 0779 and LAN Z1992, with no scheduled departure, are placed by their actual departure, the "scheduled, or actual when there is no scheduled time" rule from `SortField`.

This is where the spec becomes a product. Every detail on that screen was decided in propose, written in the spec, tested in apply, and now shows up in front of the user. (A side note: the date picker shows month/day/year, which is Chrome's default date field format for the configured language.)

---

# Part 3 — Archive: two new specs, none modified

After the test, I replied:

```
ficou perfeito. Funcionou, testei e está ok. Pode parar 8080 e 8081.
```

("Perfect. It works, I tested it and it's fine. You can stop 8080 and 8081.") "I tested it and it's fine" is the evidence task 6.3 requires; without it, Claude would have no basis to tick it. And "you can stop 8080" is an explicit authorization: 8080 was mine, a `spring-boot:run` I had started while checking the ingestion, still running old code.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.3-00.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.3-00.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 03 s (video sped up).*

It listed what was listening on both ports, stopped both processes and ticked 6.3 with a script that only works if it finds the `- [ ] 6.3` line still open. The count showed 32 of 32. But the first command had reported 1 remaining process, so it checked again: *"8080/8081 free"*. It was just a process finishing its shutdown. The usual pattern: do not trust your own command, check its effect. It also deleted the JAR copy and left the Docker environment running.

Then:

```
/opsx:archive
```

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.3-01.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.3-01.mp4" type="video/mp4"></video>
*⏱ Real time: 45 s (video sped up).*

Claude ran the same preparation command as in the previous archives: archive instructions, artifact status, task count, the list of main specs and each delta's headers. And summarized: *"I confirmed the 4 artifacts are done with all 32 tasks completed, and both deltas only have ADDED, with no main spec yet."*

Then came the same question as in every archive: *"The two new capabilities are not in the main specs yet. How should I proceed?"* **Sync now** creates both files in `openspec/specs`, verifies and archives. **Archive without syncing** just moves the change, and *"the API and the screen won't appear in the main specs"*: they would exist in the code but be invisible to whoever plans the next change. I chose Sync now.

Compare with the ingestion archive in the previous post: there was a RENAMED and two MODIFIED in `application-runtime`, because ingestion changed an existing promise of the system. Here there is **only ADDED**. That is no accident: it is the prompt's "read-only", confirmed in propose's second round, showing up in the structure of the deltas. The shape of a delta is already a risk indicator.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.3-02.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.3-02.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 24 s (video sped up).*

Even in a sync that just copies new requirements, it checked three things: validity (`--strict`), counts, and a body identical to the delta.

```
rules: 3
Specification 'flight-query-api' is valid
flight-query-api: 6/6 requisitos, 22/22 cenários, corpo idêntico
```

(6/6 requirements, 22/22 scenarios, identical body.) `flight-search-ui` came out with 6 requirements and 10 scenarios, also identical. And with `git diff`, it confirmed that the three existing specs (`local-dev-environment`, `application-runtime` and `flight-data-ingestion`) were unchanged. That last check is the most interesting: it does not test what changed, it tests **what should not have changed**. It is what proves "read-only" at the spec level. Checks like these are simple enough to become a pipeline step.

Finally, a `git mv` of the change to `openspec/changes/archive/2026-10-01-add-flight-query-api/`, preserving history, and the commit on the `3-archive` branch.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-5/2.2.3-03.jpg"><source src="/assets/videos/sdd-openspec-5/2.2.3-03.mp4" type="video/mp4"></video>
*⏱ Real time: 14 s (video sped up).*

The final summary shows the table of the project's five capabilities: `local-dev-environment` with 9 requirements, `application-runtime` with 7, `flight-data-ingestion` with 8, `flight-query-api` with 6 and `flight-search-ui` with 6. No active changes.

---

# Closing the series

## The full cycle

Across the five posts, SkyLedger BR went through the same cycle four times:

| Change | Post | What it delivered | Main specs after archive |
|--------|------|-------------------|--------------------------|
| `setup-local-infra` | [Part 2](/2026/10/18/sdd-openspec-2-skyledger-local-infra.html) | Docker Compose with Postgres, Redis and S3-compatible storage | created `local-dev-environment` |
| `bootstrap-project-skeleton` | [Part 3](/2026/10/19/sdd-openspec-3-skyledger-spring-boot-skeleton.html) | Spring Boot application, Flyway, health check, OpenAPI | created `application-runtime` |
| `add-flight-data-ingestion` | [Part 4](/2026/10/21/sdd-openspec-4-skyledger-anac-ingestion.html) | ingestion of VRA and the aerodrome registry | created `flight-data-ingestion`, modified `application-runtime` |
| `add-flight-query-api` | Part 5 | `GET /flights` and the search screen | created `flight-query-api` and `flight-search-ui` |

Always the same sequence: **propose** (questions, validated artifacts, no code), **human review**, **apply** (task by task, each group with tests and docs, deviations recorded in the design), **archive** (spec sync, verification, history with `git mv`). Infrastructure, skeleton, ingestion and query: the cycle does not change with the kind of work, and that is what makes it predictable.

## How the specs grew

This is how `openspec/specs/` evolved, measured on each archive branch (requirements / scenarios):

| Spec | after infra | after skeleton | after ingestion | after query |
|------|-------------|----------------|-----------------|-------------|
| `local-dev-environment` | 9 / 16 | 9 / 16 | 9 / 16 | 9 / 16 |
| `application-runtime` | | 7 / 17 | 7 / 20 | 7 / 20 |
| `flight-data-ingestion` | | | 8 / 34 | 8 / 34 |
| `flight-query-api` | | | | 6 / 22 |
| `flight-search-ui` | | | | 6 / 10 |
| **Total** | **9 / 16** | **16 / 33** | **24 / 70** | **36 / 102** |

![Scenarios in openspec/specs/ on each archive branch, stacked by spec: 9 requirements and 16 scenarios after infra, 16 and 33 after the skeleton, 24 and 70 after ingestion, 36 and 102 after the query change](/assets/images/sdd-openspec-5/crescimento-specs-en.webp)

Look at the `application-runtime` row: ingestion changed a promise of the application and its scenarios went from 17 to 20. The query change, on the other hand, did not touch a single line that existed before. Specs grow by addition and only change when behavior changes, and every modification has an archived change explaining why.

And this is the real `openspec/` tree on `main`:

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

(Each archived folder also has its own `.openspec.yaml`.) Two ways to read this tree: `specs/` answers **what the system does today**; `changes/archive/` answers **why it ended up this way**, change by change, with the proposal, design and tasks exactly as they were approved and adjusted. Whoever arrives later can read ingestion and query separately and understand each responsibility without guessing. To check from the terminal:

```bash
git clone https://github.com/vcasadei/skyledger-br.git
cd skyledger-br
openspec list --specs
```

## What I learned (and what sticks)

* **We agree on the what, the agent decides the how, and we check the result.** That is the whole series in one sentence.
* **Propose is the cheapest point to change your mind.** The impossible IATA and my own contradiction were resolved in seconds, before any code existed. After apply, they would have been a migration to undo.
* **A good agent checks the premise before accepting the request.** And it does not invent unsourced data to make the request fit.
* **A recommendation is not an order.** I disagreed with two recommendations in this change, in an informed way. That is what the form is for.
* **Measure before deciding.** "No index" came from numbers on the real database, with care about the cold cache, and the target became an acceptance criterion.
* **Deviations get recorded, not hidden.** `FlightQueryService`, Node outside the project and TypeScript 7 all ended up in the design and in the summary. A design that does not follow the implementation describes a system that does not exist.
* **Tests named after scenarios** give you traceability from requirement to test, for free.
* **Acceptance with real data, at the extremes.** The largest delay and a negative delay, checked against SQL.
* **The human stays in the loop.** The agent may wait when it should investigate. Supervising is not reviewing every line; it is noticing when it stopped and asking a short question. And some tasks, like looking at a screen, can only be ticked by a human.
* **Archive is a cheap habit, not a ceremony.** And the shape of the delta (only ADDED, or MODIFIED) already says a lot about a change's risk.

## Next steps to practice

The best way to make the cycle stick is to run it on your own. A few ideas, in increasing order of difficulty, all starting from SkyLedger's `main`:

1. **Read before writing.** Clone the repository, run `openspec list --specs` and read the five main specs. Then open an archived change and compare its `design.md` with the code.
2. **Propose a small, well-scoped change.** The project itself left two seeds recorded in this change's design: the indexes on `(origin_icao, COALESCE(scheduled_departure, actual_departure))`, which D3 left as a future evolution "in a change with a migration, if the volume grows", and standardizing the `/api` prefix, which D10 recorded as an inconsistency. Pick one and run `/opsx:propose`. For the `/api` one, pay attention: the delta should have a MODIFIED, and the proposal should flag the change as BREAKING.
3. **Solve IATA the right way.** The agent suggested OurAirports as a public-domain source. Propose a change just for that: ingest the source, store the IATA code and accept `GRU` in the API. See how many existing capabilities the delta modifies.
4. **SkyLedger's next business change:** punctuality and airport traffic analytics (busiest airports, punctuality by airline and route), cached in Redis. The five current specs are the foundation: the proposal should reference the `flight` entity instead of redefining it.
5. **Start a project of your own from scratch**, with `openspec init`, the [casadei schema](https://github.com/vcasadei/openspec-casadei) or OpenSpec's default one, and a first `/opsx:explore` before any change.

In all of them, do a real review between propose and apply: read the summary, disagree with some recommendation, edit the artifacts if needed. That is where the value lives.

## No paid tool? Practice for free

This whole series used Claude Code. If you do not have access to a paid tool, I wrote a guide to practice exactly the same flow with [opencode](https://opencode.ai) and free models: [Spec-Driven Development with opencode and InkStone's Free Models](/2026/10/15/sdd-opencode-inkstone-free-models.html). The method does not depend on the tool: the commands change from `/opsx:propose` to `/opsx-propose`, but the cycle, the artifacts and the schema are the same.

---

**Series navigation:** ← [Part 4: Ingesting ANAC's Open Data into SkyLedger](/2026/10/21/sdd-openspec-4-skyledger-anac-ingestion.html) · This is the last post. To start over: [Part 1: OpenSpec, the casadei Schema and Claude Code](/2026/10/16/sdd-openspec-1-openspec-casadei-schema.html)

---

# References

* **Spec-Driven Development**
  * [OpenSpec](https://github.com/Fission-AI/OpenSpec) · [Documentation](https://openspec.dev/docs)
  * [openspec-casadei](https://github.com/vcasadei/openspec-casadei), my public schema for OpenSpec
* **The project**
  * [skyledger-br](https://github.com/vcasadei/skyledger-br) (`main` is the final state)
  * This change's branches: [`1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/1-propose) · [`2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/2-apply) · [`3-archive`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-query-api/3-archive)
  * [anac-data](https://github.com/vcasadei/anac-data), the source files
  * [ANAC open data: Voo Regular Ativo (VRA)](https://www.anac.gov.br/acesso-a-informacao/dados-abertos/areas-de-atuacao/voos-e-operacoes-aereas/voo-regular-ativo-vra/62-voo-regular-ativo-vra)
* **Back end**
  * [Spring Boot](https://spring.io/projects/spring-boot) · [`JdbcClient`](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html#jdbc-JdbcClient) · [Problem Details (RFC 9457)](https://www.rfc-editor.org/rfc/rfc9457)
  * [springdoc-openapi](https://springdoc.org) · [OpenAPI](https://www.openapis.org)
  * [PostgreSQL: `EXPLAIN`](https://www.postgresql.org/docs/16/using-explain.html)
* **Front end and build**
  * [React](https://react.dev) · [Vite](https://vite.dev) · [TypeScript](https://www.typescriptlang.org)
  * [Vitest](https://vitest.dev) · [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
  * [frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin)
* **Airport data**
  * [OurAirports: open data](https://ourairports.com/data/)
* **Practice for free**
  * [Spec-Driven Development with opencode and InkStone's Free Models](/2026/10/15/sdd-opencode-inkstone-free-models.html)

---

If this series helped you understand or start practicing SDD, let me know on LinkedIn ([linkedin.com/in/vcasadei](https://linkedin.com/in/vcasadei)) or check out other projects and writing at [vcasadei.com](https://vcasadei.com).

<style>
.article__content pre, .article__content pre code{white-space:pre-wrap !important;word-wrap:break-word;overflow-wrap:anywhere}
.article__content div.highlight, .article__content pre{overflow-x:visible !important}
</style>
