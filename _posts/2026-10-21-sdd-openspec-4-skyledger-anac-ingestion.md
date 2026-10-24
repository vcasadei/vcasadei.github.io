---
layout: article
title: "SDD with OpenSpec, Part 4: Ingesting ANAC's Open Data into SkyLedger"
date: 2026-10-21 12:00:00 -0300
key: sdd-openspec-4-skyledger-anac-ingestion
translation_key: sdd-openspec-4
cover: /assets/images/sdd-openspec-4/sdd-openspec-4.jpeg
tags: [SDD, OpenSpec, Claude Code, Spring Boot, Flyway, PostgreSQL, ANAC, Open Data]
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
    src: /assets/images/sdd-openspec-4/sdd-openspec-4.jpeg
---

SkyLedger's first real feature: loading ANAC's flights into PostgreSQL, measuring the data before deciding anything.

<!--more-->

This article is part of a **series of posts that teaches Spec-Driven Development with [OpenSpec](https://github.com/Fission-AI/OpenSpec)** from scratch, using a real project: SkyLedger BR, a Spring Boot application built on the open civil-aviation data published by ANAC, Brazil's civil aviation authority. Each post covers one complete *change*, from explore to archive, with the real prompts, the questions the agent asked and the decisions I made.

1. [SDD with OpenSpec, Part 1: OpenSpec, the casadei Schema and Claude Code](/2026/10/16/sdd-openspec-1-openspec-casadei-schema.html)
2. [SDD with OpenSpec, Part 2: SkyLedger BR and the Local Infrastructure](/2026/10/18/sdd-openspec-2-skyledger-local-infra.html)
3. [SDD with OpenSpec, Part 3: SkyLedger's Spring Boot Skeleton](/2026/10/19/sdd-openspec-3-skyledger-spring-boot-skeleton.html)
4. **SDD with OpenSpec, Part 4: Ingesting ANAC's Open Data into SkyLedger** (you are here)
5. [SDD with OpenSpec, Part 5: SkyLedger's Flight Query API](/2026/10/23/sdd-openspec-5-skyledger-query-api.html)

So far, SkyLedger has a local environment with Docker Compose (Part 2) and a Spring Boot application that starts, connects to PostgreSQL and answers the health check (Part 3). Each of those changes left its spec archived in `openspec/specs`. There is still **not a single table in the database**, and no business rule.

This is the densest post in the series, because **real data has traps**. The first line of each file is not the header. Some flights that actually operated come with the scheduled time as the word `null`. And the key I had in mind to identify a flight was wrong. All of that only surfaced because we measured the files before writing the spec.

As in the other posts, I recorded everything, in VS Code with Claude Code and the [openspec-casadei](https://github.com/vcasadei/openspec-casadei) schema. The videos are sped up during waits and typing. The prompts and the agent's answers are in Portuguese; I translate the relevant parts here.

<style>
.sdd-wrap{white-space:pre-wrap !important;word-break:break-word;overflow:visible !important;max-height:none !important}
</style>

![The add-flight-data-ingestion change: explore measures the data, propose produces the proposal, specs, design and tasks, apply implements and runs acceptance on real data, you check with your own commands, and archive turns the deltas into main specs](/assets/images/sdd-openspec-4/fluxo-change-en.webp)

---

# Where the Data Comes From: ANAC and the anac-data Repository

## The official source

ANAC publishes its open data at [sistemas.anac.gov.br/dadosabertos](https://sistemas.anac.gov.br/dadosabertos/). Do not expect a friendly catalog: it is a raw directory listing. The two datasets that matter here are:

* **VRA (Voo Regular Ativo, "active regular flights")**, under *Voos e operações aéreas → Voo Regular Ativo (VRA) → year → month*. One file per month, one row per flight leg: airline, flight number, origin and destination as ICAO codes, scheduled and actual departure and arrival, and the status (`REALIZADO`, operated, or `CANCELADO`, cancelled). Delays and cancellations come straight out of it.
* **Aeródromos Públicos (public aerodromes)**, under *Aerodromos → Aeródromos Públicos → Lista de aeródromos públicos*. The registry that turns `SBRJ` into "Santos Dumont, Rio de Janeiro, RJ", with municipality, state, coordinates and altitude.

## Why there is a repository just for the data

Downloading straight from the portal is not trivial. ANAC creates the folders for months that have not been published yet (and those empty folders carry *newer* modification dates than the ones that hold data), and it has changed its file-naming convention more than once. So that SkyLedger would not depend on a manual download, I built a separate repository: [anac-data](https://github.com/vcasadei/anac-data).

It does three things:

* **Downloads reproducibly.** A Python tool, standard library only (no `pip`), reads the portal's listings, picks the N most recent months that **actually contain a file**, and performs resumable, verified downloads. No filename is hardcoded: everything follows the links in the listing itself.
* **Keeps the data in git.** Clone it and the CSVs are there: three VRA months (May to July 2026) and the aerodrome registry. An optional statistical file, too large for git, ships as compressed chunks with rebuild scripts.
* **Records provenance.** `data/raw/anac/manifest.json` stores, per file, the source URL, size, SHA-256, `ETag` and the "Atualizado em" (updated on) date.

```bash
git clone https://github.com/vcasadei/anac-data.git
cd anac-data
PYTHONPATH=src python3 -m anac_data fetch --dry-run   # show what would be downloaded, without downloading
PYTHONPATH=src python3 -m anac_data inspect           # measure delimiter, encoding and header line
```

The anac-data README has a section I consider the most important one in the repository: **"Reading the CSVs (do this before writing a parser)"**. It lists facts measured from the bytes, not assumed: `;` delimiter, VRA in UTF-8 with BOM, the registry in Latin-1 (ISO-8859-1), the header on **line 2**, and the literal `null` in the time columns. Those facts are the starting point of this post.

In SkyLedger, anac-data is cloned next to the project, and the application points to it through the variable `ANAC_DATA_PATH=../anac-data`.

---

# Part 1 — Explore: Measure Before Choosing the Key

## First, look at the real file

Before asking Claude anything, I open the actual data. In the terminal, with the three repositories side by side (`anac-data`, `openspec-casadei` and `skyledger-br`), I go into anac-data and print only the first three lines of the July file:

```bash
cd anac-data
sed -n '1,3p' data/raw/anac/vra/VRA_20267.csv
```

Line 1 is `Atualizado em: 2026-08-28`: metadata, not a header. Line 2 is the real header, with 12 quoted fields separated by semicolons. Line 3 is already a flight: GLO 1015, from SBRJ to SBSP, scheduled departure at 10:30, actual at 10:24, REALIZADO.

A parser that reads line 1 as the header produces a single junk column and **raises no error at all**. It is the kind of silent defect that only shows up when someone looks at the numbers at the end.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.1-00.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.1-00.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 28 s (video sped up).*

## The explore prompt

`/opsx:explore` is the think-together mode: it creates no change, writes no proposal and touches no code. That makes it the right place for open questions. This is what I sent (in Portuguese, typos included), translated:

<div class="language-plaintext highlighter-rouge"><div class="highlight"><pre class="highlight sdd-wrap"><code>/opsx:explore now I want to ingest the CSV files of ANAC's VRA (Voo Regular Ativo) into the database. There are 3 monthly files, one per month. Facts measured on them, not assumptions: delimiter ";", encoding UTF-8 with BOM, and line 1 of each file is metadata ("Atualizado em :..."). The header is on line 2. The columns have origin/destination airport (ICAO code), scheduled and actual departure/arrival times and flight status, which can be REALIZADO or CANCELADO.
One detail: there may be REALIZADO rows with "Partida Prevista" as a literal string "null"; those are flights that operated with no scheduled time recorded, they are not cancellations. I need to populate airport, airline and flight tables, without duplicating records if the same file is processed again (some end-of-month flights also show up in the next month's file).
Before proposing the change: how would you handle the literal "null" rows, how would you structure the parser given the header on line 2, and what would the natural key be to avoid duplicating an already imported flight?</code></pre></div></div>

Notice the structure: **facts** I saw in the terminal, **the trap** I know about (the `null` that is not a cancellation), **what I need** (three tables, no duplicates) and **three open questions**. There is no implementation verb. If I had sent a ready-made solution, say "use flight number plus date as the key", Claude would probably have followed it, and I would have lost the chance for it to measure the data and contradict me.

A behind-the-scenes detail: I kept using the same Claude Code session from Parts 2 and 3, idle for almost a day. Claude Code warned that the prompt cache had expired and that the next message would re-cache about 305k tokens. The upside is that it still remembered earlier decisions; the cost was the session usage meter jumping from 0% to 14% right after sending. A fresh session is cheaper, but it requires the decisions to be written down somewhere. It is a trade-off worth knowing.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.1-01.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.1-01.mp4" type="video/mp4"></video>
*⏱ Real time: 4 min 27 s (video sped up).*

## Claude measures before answering

Its first sentence already shows the right attitude: *"Before answering, I'll check whether anac-data is accessible. That way I answer with the real columns, without assuming."* Then comes a series of commands, **all read-only**: locate anac-data, run `openspec list` (no active change), read the README, check the first three bytes (`efbbbf`, the UTF-8 BOM) and the metadata line.

Next come profiling scripts over the three complete files: how many `null`s per column and per status, whether the `null`s travel together, whether any field has an embedded `;` or quote, and, most importantly, **how many collisions each candidate key produces**. This is the output that decides the key:

```
k1 emp+num+orig+coalesce(PP,PR): chaves com linhas DIFERENTES dentro do arquivo: 15
k2 emp+num+orig+PP+PR: ... 0
```

(`k1`, airline + number + origin + coalesce(scheduled, actual): 15 keys with *different* rows inside the same file; `k2`, with both scheduled and actual departure: 0.) With the actual departure inside the key, collisions drop to zero. Nothing was created in `openspec/changes`: explore is still just a conversation.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.1-02.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.1-02.mp4" type="video/mp4"></video>
*⏱ Real time: 4 min 05 s (video sped up).*

## What the data showed (and the assumption that did not hold)

The answer opens like this: *"I measured the three real files in anac-data (252,756 rows in total). The numbers confirm the facts you brought, but they change two assumptions and add details the parser has to handle."*

* **The `null` always comes in pairs.** Scheduled departure and arrival are null together, in 7,127 `REALIZADO` rows.
* **The `null` changes meaning.** In the 8,004 `CANCELADO` rows, the `null` is in the Actual columns, never in the Scheduled ones. *"The same literal means something else depending on the status."*
* **Fractional seconds in the timestamps.** 39,792 values with `.100000000`, which would break a rigid parser on 8% of the rows.
* **The flight number is text**, because of values like `Z9672` and `0073`.
* **Regular format:** CRLF, 12 fields always quoted, no `;` or quote inside a value.

And the corrected assumption. I had written that end-of-month flights reappear in the next file. It measured: only **2** rows repeat between May and June, and **none** between June and July. The real risk was inside each file: **29 byte-for-byte duplicate rows** and **15 pairs** with the same scheduled flight and two different actual times, like ACA 0091 from SBGR to CYYZ. *"These are inconsistencies in ANAC's own data."* With my assumption, deduplication would have been designed for the wrong case.

For the `null`, it proposes a table that crosses status and nulls: `REALIZADO` with null scheduled times is a flight that operated without a recorded schedule (counts as operated, delay undefined); `CANCELADO` has null actual times; any other combination is a rejected and reported row. For the parser, simple stages: strip the BOM, validate the metadata line, map the header **by name**, read line by line and write in batches. Since the format is regular, a small strict parser does the job *"with no new dependency"*; a CSV library *"would need approval"*. That is the casadei schema's rule about new dependencies showing up already in explore.

![The same null with two meanings: in REALIZADO rows, a null Scheduled time means a flight with no recorded schedule (7,127 rows); in CANCELADO rows, the null sits in the Actual columns (8,004 rows); any other combination is rejected](/assets/images/sdd-openspec-4/nulos-por-situacao-en.webp)

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.1-03.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.1-03.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 40 s (video sped up).*

## The natural key: A or B?

This is the part I most want you to take away. Claude tested the keys against the data and presented the choice as a trade-off:

| | Option A | Option B |
|---|---|---|
| Key | airline, number, origin, `COALESCE(scheduled, actual)` | airline, number, origin, scheduled, actual, with `NULLS NOT DISTINCT` |
| Semantics | "one scheduled flight = one row" | each published operation = one row |
| Pro | the same row can be updated if ANAC fixes a time | zero loss; reprocessing is idempotent |
| Con | in the 15 diverging pairs, one operation is dropped or overwritten | a correction to an actual time would come in as a new flight |

Plus a technical detail I would not have remembered on my own: *"in PostgreSQL, NULL does not collide in a regular UNIQUE"*. Without handling that, the cancelled flights and the ones with no scheduled time would be duplicated on every reprocessing. The `UNIQUE NULLS NOT DISTINCT` clause has been available since PostgreSQL 15, *"and we have 16"*.

Its recommendation was B: the weak spot does not show up in the data (all three files have the same "Atualizado em: 2026-08-28"), and if it ever does, the batch table shows which file brought each row. Before the final question, it also listed the **points that would come up in propose**: the migration tool (the skeleton had left Flyway out, and *"Flyway or Liquibase would be a new dependency that needs your approval"*), whether airports would be just the VRA codes or enriched with the registry, airlines with only the ICAO code, time zone (store as published), and how to trigger the ingestion.

The conversation ends with the question open: *"do you go with option B (scheduled + actual, NULLS NOT DISTINCT) or do you prefer option A's 'one scheduled flight = one row' semantics?"*. The answer defines the unique constraint, the reprocessing behavior in the spec and the test scenarios.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.1-04.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.1-04.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 09 s (video sped up).*

I went with B. It does literally what I asked for: reprocessing does not duplicate, and nothing is lost or made up. I accepted a hypothetical risk (a retroactive correction) to avoid a real, measured loss (15 pairs). It is also worth noting how this differed from my plan: I had imagined a key like "flight number, date and origin airport". The data showed that is not enough, and only measuring could reveal it.

---

# Part 2 — Propose: From Conversation to Artifacts

Branch to check out: [`feat/add-flight-data-ingestion/1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-data-ingestion/1-propose).

## The decision goes into the prompt

The explore conversation writes nothing to disk. That is why the decision goes explicitly into the propose prompt. What I sent, typos included ("opcao", "contrua"):

```
/opsx:propose add-flight-data-ingestion
seguindo o que foi discutido, vou seguir com a opcao B. Com essas informações, contrua a proposta
```

("following what we discussed, I'll go with option B. With this information, build the proposal.") The first line carries the change name in kebab-case, which becomes the folder in `openspec/changes`. The second carries the decision. To be honest: writing just "option B" worked because it was the same session and the option was right above. In a new session, "option B" would mean nothing. **The safest move is to spell the decision out**: the key is airline, number, origin, scheduled departure and actual departure, with `UNIQUE NULLS NOT DISTINCT`, plus the reason.

The reply: *"Option B recorded."* It then says it will ask about the decisions we left open, *"because they change scope, dependencies and contract"*. Before that, it checks the repository state and peeks at `AerodromosPublicos.csv`, already bringing a new fact: the registry uses ISO-8859-1, unquoted fields and coordinates with a decimal comma, *"which would require a second parser and increase the scope"*. The cost of an option arrived before I decided.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.2-00.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.2-00.mp4" type="video/mp4"></video>
*⏱ Real time: 2 min 06 s (video sped up).*

## Four decisions before writing

Claude opens a form with four tabs, exactly the points listed at the end of explore. Each option comes with its cost written next to it:

| Question | Options | My choice |
|---|---|---|
| Migrations (new dependency) | **Flyway** (recommended): plain SQL, version managed by Spring Boot, no "undo" in the free edition · Liquibase: declarative rollback, more verbose | Flyway |
| Airports | **VRA codes only** (recommended): smaller scope · Enrich with the registry: name, municipality, state and coordinates of the 496 aerodromes, at the cost of a second parser | **Enrich** |
| Trigger | **REST endpoint** (recommended), with a per-file report · command at startup · both | REST endpoint |
| Parser | **Own strict parser** (recommended) · Apache Commons CSV, more tolerant but a new dependency | Own parser |

Two casadei schema rules show up together here. A new dependency has to be named and approved, which is why Flyway, Liquibase and Commons CSV became questions rather than silent decisions. And the question comes **before** the artifact: if I disagree, nobody has to rewrite a proposal.

On airports I deliberately went against the recommendation. An airport that is just "SBGR" is of little use for the analyses that come later; I want name, city and state. The cost was written down, and I accepted it. A recommendation is input, not an order.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.2-01.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.2-01.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 14 s (video sped up).*

## Measuring the aerodrome registry

My choice brought into scope a file that had not been measured. Claude measures the registry as rigorously as the VRA: no BOM, does not decode as UTF-8, another metadata line (`Atualizado em: 2026-09-15`), unquoted fields, different decimal separators for coordinates and altitude, state names spelled out, 31 closed aerodromes.

And here it **gets a count wrong and notices**: *"when reading in text mode, Python converts \r\n into \n, so my split('\r\n') left the registry set empty. Redoing it"*. Re-reading in binary mode, the correct result:

```
cadastro 496 | VRA 289 | em ambos 153 | fora: brasileiros 6 estrangeiros 130 | cadastro sem voo no VRA: 343
```

In other words: of the 289 airports in the VRA, 153 are in the registry, 130 are foreign and 6 are Brazilian airports outside the registry, so the airport table has to accept an airport with only its code. A measurement error that gets admitted is great; a silent one is what turns into a wrong spec.

Only after measuring does it create the change, with `openspec new change add-flight-data-ingestion`, and check on Maven Central that `spring-boot-starter-flyway` exists for the project's Spring Boot version.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.2-02.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.2-02.mp4" type="video/mp4"></video>
*⏱ Real time: 2 min 20 s (video sped up).*

## The conflict with an existing spec

This is the stretch that best shows why living specs pay off. In Part 3, the skeleton left the `application-runtime` spec archived, and it guarantees that the application **starts even with PostgreSQL down**. Flyway, by default, applies migrations on startup, and without a database the application does not start. Claude read the spec before proposing and stopped:

> The application-runtime spec guarantees the app starts with PostgreSQL down, but default Flyway migrates on startup and fails without a database. How do we resolve this?

* **Migrate on startup, change the spec** (recommended): fail fast, schema always ready; the startup requirement gets a `MODIFIED`, and only Redis stays optional.
* **Keep the spec, migrate later**: the application starts without a database and migrates in the background, with retries, and ingestion returns 503 until the schema is ready. Cost: *"custom orchestration code and more scenarios"*.

I picked the first. For an application whose reason to exist is the database, starting without a schema is worse than not starting. But what matters most is not which option I picked: it is that **the choice was not silent**. Without the archived spec, Flyway would have come in, the application would have stopped starting without a database, and someone would have found out later, thinking it was a bug.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.2-03.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.2-03.mp4" type="video/mp4"></video>
*⏱ Real time: 50 s (video sped up).*

## Writing and validating the artifacts

With everything decided, Claude writes in OpenSpec order: proposal, specs, design and tasks. Two details stand out.

**The acceptance numbers are computed before they are written.** Using key B, May should insert 82,102 flights (18 duplicates), June 81,117 (2) and July 89,506 (11): *"with key B there are 252,725 distinct flights in total"*. Then 87 airlines and 632 airports (496 from the registry and 136 from the VRA only). Even the column types come from measurement: latitude with up to 9 decimal places leads to `NUMERIC(12,9)`.

**The strict validator catches an error.** In the `application-runtime` delta, `openspec validate --strict` complains that the `MODIFIED` requirement *"omits scenario(s) the current spec still has"*: the changed requirement forgot a scenario that the current spec has. It fixes this by keeping the scenario and rewriting only its outcome, then revalidates: `Change 'add-flight-data-ingestion' is valid`. A `MODIFIED` that accidentally drops a scenario would be a silent loss of contract.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.2-04.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.2-04.mp4" type="video/mp4"></video>
*⏱ Real time: 7 min 05 s (video sped up).*

## What got written down

The artifacts are in Portuguese. The proposal summarizes the scope and flags the breaking change (translated excerpt):

```markdown
- **Flight natural key:** (airline, flight number, origin airport,
  scheduled departure, actual departure), with missing values treated as equal
  to each other. Exact duplicates within a file, reprocessing and the overlap
  between months create no new record.
- **`POST /api/ingestions` endpoint**: processes the registry and then the
  VRA files from `anac-data`, and returns a per-file report (rows read,
  inserted, duplicates and rejected).
- **BREAKING** (startup behavior, `application-runtime` capability): the
  application now applies migrations on startup and **no longer starts with
  PostgreSQL unavailable** ...
```

The new spec, `flight-data-ingestion`, has 8 requirements. Scenarios follow the `AS A / WHEN / THEN / AND` format that the casadei schema requires, failure scenarios included (original text):

```markdown
### Requirement: Voo sem duplicação pela chave natural
Cada voo SHALL ser identificado pela chave natural (empresa, número do voo,
aeroporto de origem, partida prevista, partida real), em que valores ausentes
são considerados iguais entre si. ...

#### Scenario: Reprocessamento do mesmo arquivo
- **AS A** operador que já ingeriu todos os arquivos
- **WHEN** envio `POST /api/ingestions` de novo
- **THEN** cada arquivo do VRA reporta `inserted` `0` e `duplicates` igual a `rowsRead`
- **AND** o número de voos no banco continua 252725
```

(Requirement "No flight duplication by natural key"; scenario "Reprocessing the same file": as an operator who has already ingested every file, when I send `POST /api/ingestions` again, then each VRA file reports `inserted` 0 and `duplicates` equal to `rowsRead`, and the flight count stays at 252725.)

The `application-runtime` delta starts with a `RENAMED`, because the old name would no longer be true ("Startup independent of dependency availability" becomes "Startup with migrated schema and optional Redis"):

```markdown
## RENAMED Requirements

- FROM: `### Requirement: Inicialização independente da disponibilidade das dependências`
- TO: `### Requirement: Inicialização com esquema migrado e Redis opcional`
```

The design has 10 decisions, the full DDL and the migration plan with rollback. There are 39 tasks in 8 groups, each with its own verification. One from the acceptance group, translated:

```markdown
- [ ] 7.1 With `ANAC_DATA_PATH=../anac-data`, database recreated (`docker compose down -v` and `up`)
  and the application running, `POST /api/ingestions` returns 200 with the registry `inserted` 496
  and the VRA `inserted`/`duplicates` = 82102/18, 81117/2 and 89506/11, `rejected` 0 for all,
  in under 2 minutes
```

## Review before applying

The final propose summary is organized the way I would like to see any delivery: the artifacts, **my decisions and how they went in**, the **"technical decisions worth your review"** (the ones it made on its own) and the **"points left as risks in the design"**. Among its decisions: counts done by the database (staging and `INSERT ... SELECT ... ON CONFLICT DO NOTHING`), rollback outside Flyway in a tested `db/rollback/V1__down.sql`, and **tests in a separate schema, `skyledger_test`**. Among the risks: synchronous ingestion with a target of under 2 minutes, and `hikari.schema` not yet verified with the Docker Compose connection.

This is where I made my mistake in this change. The text does not say **where** the test PostgreSQL runs. I had the question written down: is it an isolated container, with [Testcontainers](https://testcontainers.com/), or the same Docker Compose instance used day to day? I did not ask, and moved on to apply. Keep that in mind: the consequence shows up at the end of apply.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.2-05.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.2-05.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 20 s (video sped up).*

---

# Part 3 — Apply: Implementation with Real Acceptance

Branch to check out: [`feat/add-flight-data-ingestion/2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-data-ingestion/2-apply).

```
/opsx:apply
```

No argument at all. It is worth watching this step with one question in mind: **what happens when reality disagrees with the plan?** Because it will, more than once.

## Group 1: Flyway, migration and rollback

*"Using change: add-flight-data-ingestion"*: it figures out which change to apply on its own, since it is the only active one, and checks the state (0 of 39 tasks, PostgreSQL healthy). Then it:

* adds Flyway to `pom.xml` (*"Flyway 12.4.0 is in"*);
* writes the `V1__create_ingestion_schema.sql` migration with the five tables, plus the script that undoes it, `db/rollback/V1__down.sql`;
* configures the tests to use the `skyledger_test` schema, with a comment explaining that without it the tests *"would write fixtures into the public schema of the development database"*;
* closes the risk that had been left open: `current_schema()` returned `skyledger_test`, so `hikari.schema` works with the Docker Compose connection;
* tests the rollback in a throwaway schema: migrate, undo, migrate again;
* adjusts the old tests that simulate a database outage (they now need to turn Flyway off) and creates a new one: without PostgreSQL, startup fails;
* updates `docs/aplicacao.md` to say that PostgreSQL must be up before the application.

The heart of the migration is the constraint that came out of explore:

```sql
-- NULLS NOT DISTINCT: cancelled flights (no actual departure) and operated flights
-- with no scheduled departure must not repeat on every reprocessing either.
CONSTRAINT flight_natural_key UNIQUE NULLS NOT DISTINCT
    (airline_icao, flight_number, origin_icao, scheduled_departure, actual_departure),
```

The casadei schema requires a rollback plan for every migration, and here it is not a comment: it is a script with an automated test. It also requires tests and documentation in each group, before moving to the next. There is no "document at the end" phase.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.3-00.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.3-00.mp4" type="video/mp4"></video>
*⏱ Real time: 5 min 35 s (video sped up).*

## Groups 2 to 4: configurable source and strict parsers

The file path becomes configuration: `skyledger.anac-data.path`, fed by the `ANAC_DATA_PATH` variable, with no default in the code. The resolution tests use a temporary directory, no real file.

Along the way, small self-corrections: a record named `Files` clashed with Java's `Files` class and became `SourceFiles`; both parsers repeated the same internal exception, which became a shared `InvalidValueException`. And one **declared** addition: *"I added a validation not in the plan: since flight_number is varchar(10) in the database, the parser rejects rows with longer flight numbers, so this doesn't bring down the whole file on insert."*

The parser tests use in-memory content, because the project rule forbids real data paths in automated tests. But a strict parser is only proven against real data. So it runs both parsers against the anac-data files *"via a throwaway jshell script in the scratchpad, to confirm 0 rejections without exposing real paths in the tests"*. First result: `VRA_20265` with 82,120 valid rows and 0 rejected.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.3-01.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.3-01.mp4" type="video/mp4"></video>
*⏱ Real time: 6 min 05 s (video sped up).*

## Real data contradicts the spec

The VRA came through clean. The registry did not:

> The real VRA passed with no rejections, but the registry had line 109 rejected because Altitude came as ',0', contradicting the number 496 used in the spec. I'll inspect that line before deciding how to proceed.

It is the SBMI airport, in Maricá, with altitude `,0`. It searches the whole file (`altitudes sem parte inteira: [',0'] | zero explícito: []`, meaning altitudes without an integer part: one; explicit zeros: none): a single case, and no zero written the normal way anywhere. It reads the `,0` as *"missing data badly exported rather than 0.0 m"* and, instead of working around it in code, asks: *"Since this affects the spec and the acceptance criteria, I need you to decide how to handle this case"*.

* **Store without altitude** (recommended): invents nothing, keeps name and coordinates and the 496 acceptance number.
* **Interpret as 0.0**: simplest, but stores a value that is probably wrong. A wrong value is worse than a missing one, because nobody suspects it later.
* **Reject the row**: consistent with the existing rule, but throws away an entire airport over one field and changes the acceptance number to 495.

I chose to store it without altitude. It is the same principle as the VRA `null`: missing is missing, not zero. And note the value of an acceptance criterion with an exact number: "load the registry" would have caught nothing; "496 aerodromes" did.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.3-02.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.3-02.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 55 s (video sped up).*

## The decision goes into the spec; then persistence and the endpoint

*"Decided: store without altitude. The rule becomes 'empty altitude or altitude without an integer part = missing'. I'm updating the parser, the test, the spec (requirement text and a new scenario) and the design."* Four places, not one. The spec gained a scenario:

```markdown
#### Scenario: Altitude sem parte inteira
- **AS A** operador
- **WHEN** a ingestão processa o aeródromo `SBMI`, com `Altitude` igual a `,0`
- **THEN** o aeroporto é gravado com nome, município, UF e coordenadas, e sem altitude
```

("Altitude without an integer part": when ingestion processes SBMI with Altitude `,0`, the airport is stored with name, municipality, state and coordinates, and no altitude.) The change is validated again, and the real registry passes with `validas=496 rejeitadas=0`.

Groups 5 and 6 bring the JDBC repositories, the `FileIngestor` (file hash, staging table, 1,000-row blocks, one transaction per file), the `IngestionService` (a lock against concurrent runs and the file order), the controller and error handling with `ProblemDetail`. Moments worth noting:

* **Design self-correction:** *"I noticed I left mutable state (a sequence) in a singleton repository"*. It replaces the counter with the file's physical line number, which is already unique and increasing.
* **Fixtures with the right bytes:** the test registry in ISO-8859-1 with CRLF, the VRA in UTF-8 with BOM, and a `.gitattributes` so git does not convert those bytes on checkout.
* **A bug in the test, not the code:** 11 tests, 2 errors, because `singleValue()` does not accept a null result, and null was exactly what it wanted to assert. It fixes the test.
* **"0 tests" is not success:** with `@Nested`, the outer class reports 0 tests, and it goes to the reports to confirm the nested classes actually ran.
* **Documentation in the same group:** a test of the generated OpenAPI, `docs/ingestao.md`, `docs/aplicacao.md` and the README.

![Ingestion flow: POST /api/ingestions reads anac-data, runs the strict parsers, loads staging in 1,000-row blocks and runs INSERT with ON CONFLICT DO NOTHING on the natural key, one transaction per file, into the PostgreSQL tables](/assets/images/sdd-openspec-4/fluxo-ingestao-en.webp)

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.3-03.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.3-03.mp4" type="video/mp4"></video>
*⏱ Real time: 12 min 05 s (video sped up).*

## Acceptance on real data

Group 7 asks for acceptance on the real files, so Claude itself starts the application and calls the endpoint. It announces two choices: it will not run `docker compose down -v` (which would wipe the volumes), because the `public` schema is already empty, and it will pass `ANAC_DATA_PATH` on the command line without touching `.env`.

The first `POST /api/ingestions` returns **404**. The reaction: *"The endpoint returned 404 even though the tests pass. Before assuming anything, I'll look at the response body and at which process is on port 8080"*. The cause: an old process, from earlier manual tests, stuck on port 8080 running outdated code. It kills it and tries again.

> Confirmed step 7.1: the numbers match the explore data (496; 82102/18; 81117/2; 89506/11; 0 rejections), completed in 26.8 s, well within the 2-minute target.

The second run confirms idempotency: reprocessing inserts nothing. But task 7.2 did not match: it expected 7,127 flights with no scheduled time and 8,004 cancelled. It recounts straight from the files, distinct flights by key only (`distintos: 252725 | sem prevista: 7125 | cancelados: 8000`), and concludes that **the task was wrong**: the planning numbers were raw rows, duplicates included. It fixes the task text instead of bending the measurement to fit:

```markdown
- [x] 7.2 Check in the database: 252725 flights, 87 airlines, 632 airports (496 with `in_public_registry`),
  7125 `REALIZADO` flights with no scheduled departure and 8000 `CANCELADO` (fixed during apply: the
  planning 7127/8004 were raw rows, with duplicates; over distinct flights by key, the recount gives 7125/8000)
```

In task 7.4 it follows `docs/ingestao.md` the way a user would, including adding `ANAC_DATA_PATH` to the local `.env`, and runs the documented SQL queries with a real batch id.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.3-04.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.3-04.mp4" type="video/mp4"></video>
*⏱ Real time: 5 min 50 s (video sped up).*

## Verify fails, and the leak shows up

Last gate: prove that the tests do not touch development data. Instead of recreating the database with `down -v`, which *"would wipe the real ingestion done in public"*, it compares the `public` counts before and after `./mvnw verify`. `public` was untouched, **but verify failed**: `SchemaMigrationTest` and `StartupWithoutDatabaseTest`.

The second failure was an overly narrow assertion (the direct cause of the exception changed because of bean creation order). The first was serious. The rollback test switched the connection's schema with a SQL command and then undid it with `RESET`. But `RESET` goes back to the server default, which is `public`. Result: **the connection pool got back a connection pointing at the development schema**. The fix: `Connection.setSchema(...)`, which the pool knows how to restore, plus a guard in every test `TRUNCATE` routine that fails if the connection's schema is not `skyledger_test`. The finding was recorded in the design.

*"./mvnw verify passed with 73 tests and 0 failures."* It also checks that there is no hardcoded data path in the code and no tracked `.env`, scans for secrets before committing, makes two commits (implementation and OpenSpec artifacts) and checks that the remote ended up on the same hash as the local branch.

Now connect this back to propose. The Testcontainers question was never asked, the answer turned out to be "same Compose instance, different schema", and the risk materialized. Nothing was lost, because the gate existed. But a one-minute question in propose became a fix at the end of apply.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.3-05.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.3-05.mp4" type="video/mp4"></video>
*⏱ Real time: 4 min 30 s (video sped up).*

## The delivery report

The final apply summary is an acceptance record:

| File | Read | Inserted | Duplicates | Rejected |
|---|---:|---:|---:|---:|
| `AerodromosPublicos.csv` | 496 | 496 | 0 | 0 |
| `VRA_20265.csv` | 82,120 | 82,102 | 18 | 0 |
| `VRA_20266.csv` | 81,119 | 81,117 | 2 | 0 |
| `VRA_20267.csv` | 89,517 | 89,506 | 11 | 0 |

In the database: **252,725 flights, 87 airlines and 632 airports**, in 26.8 s. 39 of 39 tasks, `./mvnw verify` with 73 tests.

And three sections I now expect from any delivery:

* **"What the implementation corrected in the plan"**, each item recorded in the design or the tasks: SBMI without altitude, the 7.2 numbers, the schema leak and the confirmed `hikari.schema`.
* **"Small additions outside the task text"**: the 10-character limit on the flight number, the problem-details setting for the 405 error and the fixtures' `.gitattributes`.
* **"What you should know about your environment"**: it did not run `down -v`; the dev `public` schema now holds the real data; it added `ANAC_DATA_PATH=../anac-data` to `.env` (local, outside git); it killed the old instance on port 8080, *"That was what caused a false 404"*.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.3-06.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.3-06.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 47 s (video sped up).*

---

# Part 4 — Checking with My Own Commands

An agent's report is not proof. Proof is the number in my terminal matching what was promised. So, without asking Claude anything, I check.

I start by rereading the end of the report and opening the generated migration. Next to `db/migration` sits the `rollback` folder. In the middle of the file, the `ingestion_batch` table (dataset, file, `sha256`, counts): the provenance of every ingested file, ready to answer "which file did this flight come from, and when was it loaded".

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.4-00.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.4-00.mp4" type="video/mp4"></video>
*⏱ Real time: 30 s.*

## Migrations and the test suite

```bash
ls src/main/resources/db/migration/
./mvnw -q test
```

One change, one migration: `V1__create_ingestion_schema.sql`. In the suite, the log shows `BeanCreationException` and "Error starting ApplicationContext" in the middle. Do not panic: those are the failure-path tests, where the application **must** refuse to start (without credentials, for instance). The casadei schema requires at least one failure scenario per requirement, and that is what shows in the log. The line that matters is Flyway reporting that the `skyledger_test` schema is up to date: the tests run isolated from the development schema. With `-q`, silence at the end means success.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.4-01.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.4-01.mp4" type="video/mp4"></video>
*⏱ Real time: 2 min 22 s (video sped up).*

## Starting the application

```bash
./mvnw spring-boot:run
```

(In the recording I typed `sprint-` before fixing it. Mistakes happen live, too.) The banner shows Spring Boot 4.1.1 on Java 21, Flyway applies the migration to the development database and Tomcat comes up on 8080: *"Started SkyledgerApplication in 16.56 seconds"*. Right below, two SpringDoc warnings point out that `/v3/api-docs` and `/swagger-ui.html` are enabled by default and should be turned off in production. That is an item to decide before the first deploy.

A green test is not the same as the application starting: actually starting validates the `.env`, the connection to the Compose Postgres and the new `application-runtime` requirement, which now demands a migrated schema.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.4-02.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.4-02.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 08 s (video sped up).*

## Counting in the database, and the intentional 404

```bash
docker compose exec postgres psql -U skyledger -d skyledger -c "SELECT count(*) FROM flight;"
docker compose exec postgres psql -U skyledger -d skyledger -c "SELECT * FROM airport LIMIT 5;"
```

**252725.** It matches the report and the number computed during propose exactly. The airports show up with ICAO code, CIAD, municipality, state name, coordinates, altitude and the status "Cadastrado" (registered): ANAC's registry, now inside the database.

Then I deliberately do what I wanted as a user: see the flights from Guarulhos over HTTP.

```bash
curl -s "http://localhost:8080/flights?airport=GRU" | jq .
```

Status 404, `"detail": "No static resource flights."`, in `problem+json` format. **It is not a bug.** This change only loads data; querying was never in the proposal or the spec. Someone who knows the scope reads the 404 as "this has not been agreed on yet". Someone who does not thinks something broke. That is the difference a spec makes.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.4-03.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.4-03.mp4" type="video/mp4"></video>
*⏱ Real time: 35 s (video sped up).*

## Swagger shows only what was promised

At `http://localhost:8080/swagger-ui.html`, two sections: **Ingestão** (ingestion), with `POST /api/ingestions`, and **Actuator**, with the health check. The POST description, in Portuguese, without me asking again during apply:

> Processa AerodromosPublicos.csv e depois cada VRA_.csv em ordem cronológica, um por transação. Idempotente: reprocessar não duplica registros (contados em duplicates).

("Processes AerodromosPublicos.csv and then each VRA_.csv in chronological order, one per transaction. Idempotent: reprocessing does not duplicate records (counted in duplicates).") Every sentence maps to a decision from explore or propose. The 409 response, "an ingestion is already running", is documented too. And there is no `/flights`: the documentation confirms what curl showed. The data is in the database, checked and documented, but nobody outside can see it without an open `psql`. That gap is the motivation for the next change.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.4-04.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.4-04.mp4" type="video/mp4"></video>
*⏱ Real time: 31 s.*

---

# Part 5 — Archive

Branch to check out: [`feat/add-flight-data-ingestion/3-archive`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-data-ingestion/3-archive).

## An out-of-scope request

Before archiving, I ask Claude the question any business person would ask, informally and without the right vocabulary:

```
nesse propose foi feito só a inserção dos dados? eu gostaria por exemplo da criação de um endpoint http://localhost:8080/flights?airport=GRU onde eu poderia ver os voos desse aeroporto
```

("did this propose only insert the data? I'd like, for example, an endpoint http://localhost:8080/flights?airport=GRU where I could see that airport's flights.") The easy path would be to squeeze a controller into the same delivery. It does the opposite. It explains that the change *"only covered loading the data"* and that `/flights` *"would return 404 today. That is intentional given the scope we defined"*. And it points out the detail that changes the design: **"GRU is an IATA code, and our data only has ICAO"**. The VRA and the registry use `SBGR`. Querying by ICAO needs no new data; by IATA, it would need a new mapping source, with its own ingestion and approval.

It also anticipates the decisions of the next change (pagination, since Guarulhos has tens of thousands of flights; direction, departures, arrivals or both; delay only when both times exist) and recommends **archiving the ingestion first**, so the query is built on top of synced specs. It closes with a reminder: *"Explore mode and propose only plan; nothing is implemented until /opsx:apply."*

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.5-00.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.5-00.mp4" type="video/mp4"></video>
*⏱ Real time: 45 s (video sped up).*

## The text of the next proposal

Instead of answering the ICAO question, I ask for a draft:

```
ok, vou rodar o archive, me dê o texto para essa nova proposal.
```

("ok, I'll run the archive, give me the text for this new proposal.") What comes back is a ready-to-paste `/opsx:propose add-flight-query-api`: `GET /flights?airport=SBGR` by ICAO (with the IATA alternative marked "do not include in this change"), `direction` (`DEPARTURE`, `ARRIVAL` or `BOTH`), a period with `from` and `to`, a status filter, mandatory pagination with a maximum page size, delay in minutes, times without time-zone conversion, 400 and 404 errors in `problem+json`, OpenAPI, tests in the isolated schema and, at the end, *"Read-only: does not change the existing tables or ingestion."*

My vague request, "I want to see GRU's flights", became a list of verifiable requirements. It is a technique I recommend: let the agent, which already knows the database, the specs and the data traps, draft the request, and review it before sending. That text is the starting point of Part 5.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.5-01.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.5-01.mp4" type="video/mp4"></video>
*⏱ Real time: 45 s (video sped up).*

## /opsx:archive and the state check

```
/opsx:archive
```

*"Using change: add-flight-data-ingestion (to archive a different one, run /opsx:archive <other>)."* Before moving any file, it runs a single command that gathers the archive instructions from the schema, the artifact status, the task count, the list of main specs and the headers of both deltas. All four artifacts are `done` and all 39 tasks complete. Check before moving: archiving with an open task would declare in the main specs something that was never delivered.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.5-02.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.5-02.mp4" type="video/mp4"></video>
*⏱ Real time: 37 s (video sped up).*

## Sync now, this time changing an existing spec

The question every archive asks, with one difference: **this is the first time in the project that sync changes a spec that already existed**, instead of only creating a new one.

* **Sync now** (recommended): creates `flight-data-ingestion` and applies the `RENAMED` and both `MODIFIED` requirements to `application-runtime`.
* **Archive without syncing**: only moves the change. The warning itself states the consequence: `application-runtime` *"would keep promising to start without PostgreSQL"*.

I picked Sync now. A spec that promises something the code does not do is worse than no spec, because it misleads with authority.

What impressed me was the verification after the merge script. Claude does not trust its own script: it checks that the 8 `ADDED` requirements (34 scenarios) are identical to the delta, that the requirement's old name no longer appears, that both `MODIFIED` requirements are identical to the delta, and that the other 5 `application-runtime` requirements did not change from the previous version of the file. Only then does it move the change to `openspec/changes/archive/2026-10-01-add-flight-data-ingestion` and commit.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.5-03.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.5-03.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 33 s (video sped up).*

## The final state of the specs

The final summary contains the sentence that justifies the whole archive:

> With this, the spec no longer promises that the application starts without PostgreSQL.

The main specs are now three, all valid under `validate --strict`: `local-dev-environment` (9 requirements), `application-runtime` (7) and `flight-data-ingestion` (8). The change was moved with `git mv`, so file history stays visible, and there is no active change. To check in your clone:

```bash
git checkout feat/add-flight-data-ingestion/3-archive
ls openspec/specs
ls openspec/changes/archive
openspec list --specs
```

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-4/2.1.5-04.jpg"><source src="/assets/videos/sdd-openspec-4/2.1.5-04.mp4" type="video/mp4"></video>
*⏱ Real time: 21 s (video sped up).*

---

# Takeaways

* **Measure before you specify.** Asking "what does the data show?" knocked down my assumption about the month overlap and the key I had in mind. The natural key defines the database constraint, the reprocessing behavior and the test scenarios. Getting it wrong costs a lot later.
* **Explore is a conversation; the decision has to land on disk.** Spell the decision out in the propose prompt, not "option B".
* **New dependencies and behavior changes become questions.** Flyway, Commons CSV and the `application-runtime` break were decided by me, with the cost written next to each option.
* **Archived specs are a contract.** It was the Part 3 spec that made the Flyway conflict surface during propose, and not in some random environment.
* **Acceptance criteria with exact numbers catch deviations.** 496 caught SBMI; 252,725 made a number-to-number check possible.
* **When data contradicts an artifact, fix the artifact, in writing.** SBMI in the spec, 7.2 in the tasks, the schema leak in the design.
* **Actually review the proposal.** The Testcontainers question I skipped came back as a fix at the end of apply. Next time, I would ask it up front.

In the next post, Part 5, the flights finally leave `psql`: the query API, starting from the text Claude drafted here, with two changes of my own.

---

**Series navigation:** ← [Part 3: SkyLedger's Spring Boot Skeleton](/2026/10/19/sdd-openspec-3-skyledger-spring-boot-skeleton.html) · [Part 5: SkyLedger's Flight Query API](/2026/10/23/sdd-openspec-5-skyledger-query-api.html) →

---

# References and Useful Links

* **Spec-Driven Development**
  * [OpenSpec](https://github.com/Fission-AI/OpenSpec) · [Documentation](https://openspec.dev/docs)
  * [openspec-casadei](https://github.com/vcasadei/openspec-casadei), my public schema for OpenSpec
  * [SDD with opencode and InkStone's free models](/2026/10/15/sdd-opencode-inkstone-free-models.html), if you want to practice without a paid tool
* **SkyLedger BR**
  * [Repository](https://github.com/vcasadei/skyledger-br)
  * Branches for this change: [`1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-data-ingestion/1-propose) · [`2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-data-ingestion/2-apply) · [`3-archive`](https://github.com/vcasadei/skyledger-br/tree/feat/add-flight-data-ingestion/3-archive)
* **Data**
  * [ANAC open data portal](https://sistemas.anac.gov.br/dadosabertos/)
  * [anac-data](https://github.com/vcasadei/anac-data), the repository that downloads and versions the data reproducibly
* **Technologies**
  * [Spring Boot](https://spring.io/projects/spring-boot) · [Flyway migrations in Spring Boot](https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.migration-tool.flyway)
  * [Flyway](https://documentation.red-gate.com/flyway)
  * [PostgreSQL: `UNIQUE NULLS NOT DISTINCT`](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS)
  * [Docker Compose](https://docs.docker.com/compose/) · [Testcontainers](https://testcontainers.com/)
  * [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457) · [springdoc-openapi](https://springdoc.org/)

---

If this post helped you see how SDD behaves with real data, let me know on LinkedIn ([linkedin.com/in/vcasadei](https://linkedin.com/in/vcasadei)) or check out other projects and writing I publish at [vcasadei.com](https://vcasadei.com).

<style>
.article__content pre, .article__content pre code{white-space:pre-wrap !important;word-wrap:break-word;overflow-wrap:anywhere}
.article__content div.highlight, .article__content pre{overflow-x:visible !important}
</style>
