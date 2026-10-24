---
layout: article
title: "SDD with OpenSpec, Part 2: SkyLedger BR and the Local Infrastructure"
date: 2026-10-18 10:00:00 -0300
key: sdd-openspec-2-skyledger-local-infra
translation_key: sdd-openspec-2
cover: /assets/images/sdd-openspec-2/sdd-openspec-2.jpeg
tags: [SDD, OpenSpec, Claude Code, Docker Compose, PostgreSQL, Redis, SeaweedFS]
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
    src: /assets/images/sdd-openspec-2/sdd-openspec-2.jpeg
---

The first full OpenSpec cycle on a real project: thinking through the whole of SkyLedger BR with `/opsx:explore`, then proposing, implementing, archiving and testing the local infrastructure with Docker Compose.

<!--more-->

This post is part of a **series that teaches Spec-Driven Development (SDD) with [OpenSpec](https://github.com/Fission-AI/OpenSpec)** from scratch, using a real project as the common thread.

<div class="sdd-series" markdown="1">
**Series "SDD with OpenSpec"**

1. [SDD with OpenSpec, Part 1: OpenSpec, the casadei Schema and Claude Code](/2026/10/16/sdd-openspec-1-openspec-casadei-schema.html)
2. **SDD with OpenSpec, Part 2: SkyLedger BR and the Local Infrastructure** (you are here)
3. [SDD with OpenSpec, Part 3: SkyLedger's Spring Boot Skeleton](/2026/10/19/sdd-openspec-3-skyledger-spring-boot-skeleton.html)
4. [SDD with OpenSpec, Part 4: Ingesting ANAC's Open Data into SkyLedger](/2026/10/21/sdd-openspec-4-skyledger-anac-ingestion.html)
5. [SDD with OpenSpec, Part 5: SkyLedger's Flight Query API](/2026/10/23/sdd-openspec-5-skyledger-query-api.html)
</div>

# What SkyLedger BR Is

If you landed here directly: **SkyLedger BR** is the project I use throughout this series to practice SDD end to end. It is a Java platform built with Spring Boot that uses the [open data published by ANAC](https://www.gov.br/anac/pt-br/assuntos/dados-e-estatisticas), Brazil's civil aviation agency (flights and airports), to estimate delay risk and to simulate how much a "flight delay reimbursement" credit card benefit would cost a bank.

The stack is fixed from day one: Java 21, Spring Boot 4.1 with Maven, PostgreSQL 16, Redis 8 and SeaweedFS 4.40 or later as S3-compatible object storage. The code is public at [github.com/vcasadei/skyledger-br](https://github.com/vcasadei/skyledger-br), with one branch per phase of each change, and the data lives in a separate repository, [anac-data](https://github.com/vcasadei/anac-data).

**Prerequisite:** this post starts from a project that already has OpenSpec installed, my [openspec-casadei](https://github.com/vcasadei/openspec-casadei) schema configured and Claude Code ready in VS Code. All of that is in [Part 1 of the series](/2026/10/16/sdd-openspec-1-openspec-casadei-schema.html). If you would rather practice without spending anything, with an open-source agent and free models, see also my [post on opencode and InkStone](/2026/10/15/sdd-opencode-inkstone-free-models.html).

# What We Do in This Post

This is the project's first change, and on purpose it is **not application code**: it is the local infrastructure SkyLedger needs, with PostgreSQL, Redis and SeaweedFS running on Docker Compose. I chose to start here to show something I consider central: the OpenSpec cycle is not only for Java code. It is for anything that enters the repository, configuration included. I am not going to hand over a ready-made `docker-compose.yml`; I will describe what I need in plain Portuguese and let the agent propose.

Before the first change, though, come two steps: telling OpenSpec what is true about SkyLedger BR, in `config.yaml`, and `/opsx:explore`, a file-free conversation to think through the whole project.

<style>
.sdd-wrap{white-space:pre-wrap !important;word-break:break-word;overflow:visible !important;max-height:none !important}
</style>

![This change's cycle: explore, propose, human review, apply, archive and a hands-on test of the environment](/assets/images/sdd-openspec-2/ciclo-change-en.webp)

Everything was done in VS Code with the Claude Code extension (Opus 5.5 model, medium effort). I recorded every step; **the videos are sped up while the agent works on its own**, and the text explains what happens in each one.

A note for English readers: the prompts and the agent's answers were in Portuguese. I quote them translated below; the artifacts in the repository are in Portuguese.

---

# First Step: the Project Context in config.yaml

`openspec init` and the casadei schema gave the project OpenSpec's structure, but OpenSpec still knows nothing **about SkyLedger BR**: the stack, the domain rules and where the data comes from. That goes into `context` and `rules` in `openspec/config.yaml`. The schema carries the rules that apply to any project of mine; `config.yaml` carries the ones that apply only to this one. That split is what keeps `config.yaml` short and stops the two sources from drifting apart over time.

## Writing the project context

Instead of writing the YAML by hand, I told Claude what is true about the project. Note: **there is no `/opsx` here.** `/opsx:propose` is for changes to the product; here I am configuring the tool itself, so a plain message is enough. This is the text exactly as I sent it, in Portuguese, typos included:

```text
Nosso projeto usa Java 21, Spring Boot 4.1, Maven, Postgresql 16, resis 7 e seaweedFS (pode sugerir atualizações caso veja problemas de segurança ou end of life). Valores monetários são sempre BigDecimal, numca double/float, isso é uma regra, não está no schema padrão. Todo endpoint REST público precisa de documentação OPENAPI. Os dados vem do repositório anac-data, e o caminho para eles deve ser configurável, não hard coded.

Atualize o openspec/config.yaml (schema: casadei) com esse contexto e adicione regras equivalentes para os artefatos proposal, specs e tasks, sem repetir o que já está coberto pelo schema casadei.
```

In English: *"Our project uses Java 21, Spring Boot 4.1, Maven, PostgreSQL 16, Redis 7 and SeaweedFS (feel free to suggest upgrades if you see security or end-of-life issues). Monetary values are always BigDecimal, never double/float; this is a rule, it is not in the default schema. Every public REST endpoint needs OpenAPI documentation. The data comes from the anac-data repository, and the path to it must be configurable, not hard-coded. Update openspec/config.yaml (schema: casadei) with this context and add equivalent rules for the proposal, specs and tasks artifacts, without repeating what the casadei schema already covers."*

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.1-part1-03.jpg"><source src="/assets/videos/sdd-openspec-2/1.1-part1-03.mp4" type="video/mp4"></video>
*⏱ Real time: 3 min 02 s (video sped up).*

A few deliberate choices in that prompt:

* **Facts, not YAML.** I say what is true and let Claude structure the file in the format OpenSpec expects (`context` and `rules`). I am only responsible for the content, which is what I actually know.
* **"This is a rule, it is not in the default schema".** I say explicitly what is project-specific.
* **"Configurable, not hard-coded".** The data path has to come from configuration, so the same code runs on my machine, in a pipeline and on a server.
* **"Without repeating what the casadei schema already covers".** I did not list what the schema covers. Claude had to read the schema to find out.
* **The parenthesis about security and end of life** I added on the spot, and it is what changed the result, as you will see.

Three domain rules are enough here: exact money (`BigDecimal`, never `double` or `float`, which produce rounding errors), an API contract documented with OpenAPI, and configurable external data. They are exactly the ones the schema has no way of knowing.

## Claude reads, researches and only then writes

Pay attention to the order of its actions. Its first command (`ls` and `cat` on `openspec/config.yaml`) failed, because the folder open in VS Code is the working folder, not the project. It did not keep hammering at the error: it ran a `find`, realized there were two repos side by side, went into `skyledger-br` and read `config.yaml`, `CLAUDE.md`, `schema.yaml` and the openspec-casadei docs on `context` and `rules`. It learned the format before writing.

Then came the line (translated): *"I've read the casadei schema; I'll quickly check the support status of the stack versions before writing the config."* And, since I am in Manual mode, the permission prompt: **"Allow searching for this query?"**, with the options *Yes*, *Yes, allow WebSearch for this project* and *No*. I chose **Yes** for each of the three searches (end of support for Redis 7.2 and 7.4, Spring Boot 4.1 support, and SeaweedFS CVEs in 2026). Allowing one search at a time is consistent with Manual mode: in this first session I want to see every action.

Only then did it write `config.yaml` (37 lines) and ask permission to validate its own work: a `python3` one-liner that loads the YAML and counts the rules, plus an `openspec instructions proposal`. The output: `['schema', 'context', 'rules']` and `{'proposal': 4, 'specs': 3, 'tasks': 4}`. It did not trust what it wrote; it checked.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.1-part1-04.jpg"><source src="/assets/videos/sdd-openspec-2/1.1-part1-04.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 51 s (video sped up).*

## The summary: rules, choices and warnings

The answer is long and worth reading slowly. It has three parts.

**What it wrote.** The YAML is valid and has `context` and `rules` for proposal, specs and tasks. Plus an honest note: it could not see the rules injected by `openspec instructions`, because that command needs an existing change and the project has none yet. The detail I liked most is in the specs (translated): *"the schema forbids naming frameworks in specs, so I wrote the rules as a contract, without mentioning BigDecimal or OpenAPI tooling"*. The `BigDecimal` rule became a contract: scale, currency, rounding and exact decimal representation. The schema and the context combining, without me asking. And it deliberately left out what the schema already covers: approval of new dependencies, tests and docs inside each group, `/docs` in Portuguese, secrets, LGPD, idempotency and expand-and-contract migrations.

**Its own choices.** It flagged two decisions as its own, for me to review: it did not name the property for the anac-data path ("that's your decision"), and it assumed the project will use the Maven Wrapper, which is why the Quality Gates mention `./mvnw verify`. An agent that states its assumptions makes review targeted: I know exactly what to check.

**The version warnings**, with the caveat "I didn't touch the recorded stack; these are only suggestions":

| Component | Warning |
|---|---|
| SeaweedFS | Urgent: several critical CVEs in 2026, including a CVSS 10 path traversal and an authentication bypass. Use at least 4.40 |
| Redis 7 | 7.2 no longer gets patches. Move to Redis 8.x or Valkey 8; "since it involves licensing, the decision is yours" |
| Spring Boot 4.1 | OSS support until 2027-07-31; plan for 4.2 or 4.3 |
| Java 21 and PostgreSQL 16 | No action |

And the closing note: it could not verify some third-party sources, and recommended confirming the fixed versions in the official release notes before upgrading.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.1-part1-05.jpg"><source src="/assets/videos/sdd-openspec-2/1.1-part1-05.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 16 s (video sped up).*

## The tweak: Redis 8 and SeaweedFS 4.40

I decided to accept two suggestions. For SeaweedFS, recording the minimum version costs almost nothing and the risk was high. For Redis, moving was necessary, and I picked Redis 8 to stay on the same product; the licensing question (Redis 8 offers three: RSALv2, SSPLv1 or AGPLv3) was recorded as an open point. The message was short, exactly this (in Portuguese: "update the seaweedfs version in the config. And change redis to 8"):

```text
atualize a versão do seaweedfs no config. E redis mude para 8
```

I did not say which SeaweedFS version: the recommendation was already in the previous answer, and the `config.yaml` open in the editor was attached to the message as context. The edit was surgical: only two stack lines changed, with the reason recorded right there. And Claude made a point of warning that this only changes what the artifacts will assume as the stack; the real upgrade (Docker images, compose) still has to be done. Changing text in `config.yaml` does not upgrade any container, and it did not pretend it had.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.1-part1-06.jpg"><source src="/assets/videos/sdd-openspec-2/1.1-part1-06.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 10 s (video sped up).*

The final `config.yaml` is this one, as committed in the [repository's first commit](https://github.com/vcasadei/skyledger-br/commit/740286e04df781580fa106a2f980b95a372a3a06) (excerpt; the content is in Portuguese because that is how the project was configured):

```yaml
schema: casadei

# Project context: shown to the AI when creating every artifact.
context: |
  Stack:
  - Java 21 (LTS), Spring Boot 4.1, build com Maven
  - PostgreSQL 16 (banco relacional principal)
  - Redis 8 (cache)
  - SeaweedFS 4.40 ou superior (armazenamento de objetos/arquivos) - versões
    anteriores têm CVEs críticos (path traversal, SSRF, bypass de IAM)

  Convenções do projeto:
  - Valores monetários são SEMPRE BigDecimal - nunca double, float nem outro
    tipo de ponto flutuante binário, em nenhuma camada (domínio, DTO,
    persistência, testes). No PostgreSQL, colunas monetárias usam NUMERIC com
    precisão e escala explícitas.
  - Todo endpoint REST público tem documentação OpenAPI.
  - Os dados de origem vêm do repositório anac-data. O caminho até ele é
    configuração externa (propriedade Spring sobrescrevível por variável de
    ambiente), nunca um caminho fixo no código, em testes ou em fixtures.

# Per-artifact rules: only what the casadei schema does not already cover.
rules:
  proposal:
    - Quando a mudança envolver valores monetários, liste em Impact cada campo monetário afetado (entrada, saída, persistência) para que specs e tasks tratem precisão e arredondamento.
    - Quando a mudança criar ou alterar endpoints REST públicos, liste-os em Impact (método e caminho) - cada um exige documentação OpenAPI.
    # ... two more rules (anac-data, Redis/SeaweedFS)
  specs:
    - Todo requisito sobre valor monetário SHALL declarar escala (casas decimais), moeda e regra de arredondamento, e o contrato SHALL exigir representação decimal exata - valores não trafegam como número de ponto flutuante. Inclua um cenário que exercite o arredondamento.
    # ... two more rules (full endpoint contract, anac-data path scenarios)
  tasks:
    # ... three rules (OpenAPI, scale/rounding tests, path property)
    - Quality Gates usam os comandos Maven do projeto (Maven Wrapper `./mvnw` quando existir), por exemplo `./mvnw verify`, em vez de descrições genéricas.
```

In short: the context lists the stack (Redis 8, SeaweedFS 4.40 or later with the reason) and three conventions: money is always `BigDecimal` with `NUMERIC` columns of explicit precision and scale; every public REST endpoint has OpenAPI docs; and the anac-data path is external configuration (a Spring property overridable by an environment variable), never hard-coded. Read it looking for what is **not** there: no LGPD, no BDD format, no expand-and-contract, no AI co-authorship, no `/docs`. All of that comes from the schema. A short `config.yaml` is a sign the schema is doing its job. And from now on, every SkyLedger BR proposal, spec and task list is born with this context: a decision made once applies to every change that follows.

In the Explorer, `skyledger-br` now has `.claude/`, `openspec/` (with `changes`, `schemas` and `specs`), `config.yaml` and `CLAUDE.md`. That starting state became the commit `chore: bootstrap OpenSpec workflow with casadei schema`.

---

# Part 0: Explore, Thinking the Project Through Before the First Change

## Opening the Right Project

The first move is trivial, but it defines what the agent sees: open **only the `skyledger-br` folder** in VS Code, not a parent folder with other repositories. OpenSpec looks for the `openspec/` folder at the workspace root, and `config.yaml` is the project's fixed context. Anything in there the agent does not need to ask; anything missing, it will have to ask about or assume.

The `config.yaml` we just wrote is open in the editor. In the corner of the Claude Code panel, the permission mode is **Manual**: every command and every file will ask for my approval.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.1-00.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.1-00.mp4" type="video/mp4"></video>
*⏱ Real time: 36 s (video sped up).*

## The Explore Prompt

`/opsx:explore` creates no files. It is a conversation: I think out loud with the agent about the whole project, and it thinks while looking at the real repository, before we commit to anything. This is what I sent (translated; the original had a few typos, which made no difference):

<div class="language-plaintext highlighter-rouge"><div class="highlight"><pre class="highlight sdd-wrap"><code>/opsx:explore I want to start the Skyledger BR project: a Java (Spring Boot) platform that uses ANAC open data (flights, airports) to calculate delay risk and simulate the financial exposure of a credit card benefit (flight delay reimbursement)

Over the next few weeks I plan to build, in this order:
1. Local infrastructure (Postgres, Redis, SeaweedFS) via docker Compose
2. A basic Spring Boot skeleton
3. Ingestion of ANAC flight data
4. On-time performance and airport traffic analytics with Redis cache
5. As an optional extension, cold storage of the raw files and a financial risk simulator

Before I start proposing formal changes, I want to think out loud with you: given this plan, is there any dependency between these parts I should know about before starting? Any architecture decision worth locking in early, so I don't have to undo it later? Help me think and plan.</code></pre></div></div>

The prompt has three parts: what the product is, the steps in the order I intend to build them, and the request. Note what is **not** there: I ask for no files, no code and no proposal, and no list of technologies (`config.yaml` already fixed that). I ask about relationships between the steps and decisions that are expensive to reverse. I also describe my order without claiming it is right, which leaves room for the agent to disagree.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.1-01.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.1-01.mp4" type="video/mp4"></video>
*⏱ Real time: 4 min 04 s (video sped up).*

## Before Giving an Opinion, It Looks at the Repository

The first line of the answer is "Let me take a look at what already exists in the repository before we think together." And it runs read-only commands:

```bash
openspec list --json; echo ---; openspec list --specs --json; echo ---; ls -la openspec; cat openspec/config.yaml
```

In other words: which changes exist, which specs exist, and what the project's fixed context is. In a second command it looks for the `anac-data` repository, which nobody asked it to look for. It went looking because `config.yaml` says the data comes from there. Since the repository was not reachable at that moment, it said so openly instead of making up the contents of the files. The practical lesson: if you want explore to reason against real data, make the data reachable from the workspace.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.1-02.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.1-02.mp4" type="video/mp4"></video>
*⏱ Real time: 52 s (video sped up).*

## The Real Dependencies Don't Follow the List

The answer opens with a diagnosis ("OpenSpec is configured (schema `casadei`), and there are no changes or specs yet") and moves on to an observation I was hoping for, and that made the conversation worth it: my working order is fine, but the dependencies are not linear. Two things that looked "optional" in step 5 depend on decisions made in steps 2 and 3. It drew the diagram as text; here it is redrawn (labels translated):

![Dependencies between the steps: 1 Infra, 2 Skeleton, 3 Ingestion and 4 Analytics in sequence; cold storage (5a) depends on ingestion recording every file, and the simulator (5b) depends on ingestion and on the definition of delay used in analytics](/assets/images/sdd-openspec-2/dependencias-changes-en.webp)

The first decision, which it flagged itself as the most important: **ingestion records every source file** in a batch table, something like `source_file`, with path, content hash, dataset, period, status and ingestion date, and every flight points to the batch it came from. That buys idempotency (reprocessing the same file does not duplicate flights), makes cold storage trivial ("upload the file with key = hash") and gives you a data version for cache invalidation for free.

It is a data modeling decision in ingestion that solves problems that only show up in analytics and in the optional extension. Without this conversation we would find out late and have to refactor ingestion.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.1-03.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.1-03.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 33 s (video sped up).*

## Seven Decisions to Lock In Early

The rest of the answer lists six more decisions. Summing up all seven:

| # | Decision | Why |
|---|---|---|
| 1 | Batch table (`source_file`) from ingestion onward | idempotency, cheap cold storage, data version for the cache |
| 2 | Store delay in minutes and pick the threshold at query time | ANAC uses 15 or 30 min; the card benefit usually uses hours |
| 3 | `timestamptz` plus a spike on the real files to confirm the time zone | "I wouldn't claim that without looking at the data." |
| 4 | No rigid FK from flights to the Brazilian airport list | flights include foreign airports missing from the registry |
| 5 | Skeleton born with Flyway (no `ddl-auto`), Testcontainers and packages by domain | changing that later hurts |
| 6 | Redis only as a cache, fail-open | if Redis goes down, the query goes straight to Postgres |
| 7 | SeaweedFS only through the S3 API with the AWS SDK, behind a Compose `profile` | the code is not tied to the product |

Two things caught my attention. The first is a business question raised right away: "**do cancellations count for the benefit?**" If they do, the flight status and the justification have to be preserved from ingestion onward. The second is honesty: it questioned the Redis I had put in the plan myself ("at ANAC volume [...] Postgres with pre-computed aggregates per airport and day is probably enough. Redis is worth more as an exercise than as a necessity") and refused to state the data's time zone without seeing it. An assistant that only agrees with you is useless for planning.

It closed with a slightly adjusted sequence, with a single new item, the spike on the real files:

```
1. Infra (SeaweedFS in an optional profile)
2. Skeleton: Flyway + Testcontainers + config for the anac-data path
3a. Spike: look at the real files (columns, time zone, encoding, separator)
3b. Ingestion: airports + flights + batch registry
4. Analytics (delay in minutes, threshold as a parameter) + versioned cache
5a. Cold storage   5b. Simulator (independent of each other)
```

And with the question that unblocks step 3: "What exactly will be in `anac-data`? I couldn't find that repository on the machine." Which datasets, in what format and how many years, because that decides the shape of the flights table.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.1-04.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.1-04.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 28 s (video sped up).*

None of these decisions became a file, and that is fine: that is what explore is for. Changing an architecture decision is cheap while it is only conversation and expensive once it has become tables, migrations and code. Their value is that they become **review criteria** for the next proposals. You will see several of them come back in the next posts.

---

# Part 1: Proposing the Local Infrastructure

Branch for this phase: [`feat/setup-local-infra/1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/setup-local-infra/1-propose).

## The Request, in Plain Language

I stayed **in the same conversation as the explore**, so the agent still had all that context. The request (translated):

<div class="language-plaintext highlighter-rouge"><div class="highlight"><pre class="highlight sdd-wrap"><code>/opsx:propose setup-local-infra

I need a local development environment with docker compose with the essential services to get started.
- PostgreSQL 16, database "skyledger", user and password "skyledger", exposed on port 5432, with a named volume to persist data across container restarts.
- Redis 8 exposed on port 6379, no password (it's only for local development for now)
- SeaweedFS, S3-compatible, with a bucket created on container startup and a named volume.

This is exclusively for local development, none of this should be treated as production configuration.</code></pre></div></div>

The name right after the command, `setup-local-infra`, becomes the change folder in `openspec/changes/`. The request describes the expected outcome, not the solution. And it deliberately leaves several things about SeaweedFS out: the bucket name, the S3 port, and whether access requires credentials. That is a good test for the schema: the agent should ask or state its assumptions, not fill the gaps silently. I also do not ask for the SeaweedFS `profile` that explore itself suggested.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.2-00.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.2-00.mp4" type="video/mp4"></video>
*⏱ Real time: 2 min 50 s (video sped up).*

## Questions Before Writing

The order is what the workflow asks for: consult OpenSpec first, then ask, and only then write.

```bash
openspec context --json && openspec new change "setup-local-infra" && openspec status --change "setup-local-infra" --json
openspec instructions proposal --change "setup-local-infra" --json
```

`openspec new change` creates the change folder, `status` says in which order the artifacts must be written, and `instructions proposal` returns the casadei schema's instruction for the proposal. It does not write from memory; it follows the schema's rulebook. And then it stopped: "Before writing the proposal, two SeaweedFS points change the acceptance criteria and how the application will connect later."

* **What should the bucket be called?** `skyledger-raw` (recommended, it already says what it is for: raw ANAC files) or `skyledger` (generic). I picked **`skyledger-raw`**: it ties directly into the cold storage from explore, and a name that describes the content helps whoever operates and audits it.
* **Should the S3 endpoint require credentials?** "Yes, dev credentials" (recommended: "the application is born using the authenticated flow the AWS SDK expects, avoiding a code change later") or anonymous access (simpler, consistent with a password-less Redis, but the client would have to change later). I picked **dev credentials**. My reasoning: the local environment should behave like the real one wherever it affects the code.

These are not form-filling questions. Each answer changes an acceptance criterion: with credentials, the spec gets a requirement for authenticated S3 and another for overriding credentials via environment variables; with a named bucket, the "bucket created on startup" scenario becomes testable.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.2-01.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.2-01.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 02 s (video sped up).*

An honest note: I expected a third question, whether this change should have a spec at all or declare `skip_specs`, treating the environment as tooling rather than product behavior. It never came; the agent went straight to creating the `local-dev-environment` spec. Looking at the result, it was a good call: the spec has verifiable requirements (single-command startup, persistence, idempotent bucket, local-only access), and those are exactly the scenarios the apply will automate as tests.

## Proposal, Spec and Design

With the answers in, it writes the artifacts, always with the same rhythm: ask OpenSpec for the artifact's instruction and template, then write. Since I was in Manual mode, every write asked for approval:

* **`proposal.md`** (71 lines), starting with `## Why`: motivation and scope.
* **`specs/local-dev-environment/spec.md`** (150 lines), a *delta spec*: the list of what this change adds to the system's behavior. Everything here is `ADDED`, since no spec exists yet.
* **`design.md`** (161 lines), starting with `## Context`: the technical decisions and the reason for each one.

When it got to the tasks, the schema's instruction warned: "Before writing tasks, check design.md for Open Questions." And the agent corrected itself: "Tasks are still missing. First, I'll fix where the documentation goes in the design: the schema's standard asks for `/docs/`, not the README." Its design contradicted a written rule, and it caught that on its own. Without a schema, that kind of compliance depends on someone remembering during review.

On one of those edit prompts I chose "Yes, allow all edits this session", and the mode switched to *Edit automatically*. That makes sense when the pattern is clear and the edits are to artifacts I am still going to review: they remain visible as diffs.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.2-02.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.2-02.mp4" type="video/mp4"></video>
*⏱ Real time: 3 min 18 s (video sped up).*

## Tasks, Validate and the Summary

Before the tasks, it goes back to the proposal and adds three things I had not explicitly asked for: the `.gitignore`, an environment smoke test script and documentation under `docs/`, while keeping the sentence "No Java code is created in this change." It does that because the schema requires every change to ship tests and documentation. Then comes `tasks.md`: **7 groups**, each with its own tests and docs (no loose "tests" group at the end). And validation:

```bash
openspec status --change "setup-local-infra" && openspec validate "setup-local-infra" --strict
```

The final summary is, for me, the most valuable part of the propose, because it separates what came from my request from what was assumed:

> **Things I added or assumed, for you to review:**
> - **Ports bound to `127.0.0.1` only.** [...] a password-less Redis and trivial credentials should not be open on the LAN. If you need access from another machine, that changes the spec.
> - **S3 port 8333**, SeaweedFS's default, since you did not specify one.
> - **Redis without persistence**, because it is only a cache and you did not ask for a volume.
> - **SeaweedFS always on.** I followed your request and dropped my earlier suggestion of putting it behind a `profile`.
> - **Documentation in `docs/ambiente-local.md`** [...]
> - **Tests via a smoke test script** (`scripts/verify-local-env.sh`, using `curl --aws-sigv4` for S3), since there is no Maven build yet.

It closes with **two points to confirm during implementation, both with a plan B in the design**: whether `docker compose up --wait` copes with a *one-shot* service that creates the bucket and exits, and whether Compose's `configs.content` (which requires v2.23.1+) is available. Keep those two in mind.

`validate --strict` is the mechanical gate: it checks structure, scenarios and format. But it does not know whether port 8333 is what you want. That judgment is ours, and the agent makes it easier by keeping its assumptions visible.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.2-03.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.2-03.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 40 s (video sped up).*

## Reviewing the Artifacts on Disk

Before the apply, I leave the chat and open the files. A real excerpt of the spec, in the casadei schema format (`AS A / WHEN / THEN / AND`, with a failure scenario), translated:

```markdown
### Requirement: Environment startup with a single command
The repository SHALL contain, at its root, a Docker Compose file that brings up
PostgreSQL, Redis and SeaweedFS with a single command, without any environment
variables file. Each service MUST expose a healthcheck, so that
`docker compose up --wait` only returns successfully when all three services
are ready to accept connections and the S3 bucket is provisioned.

#### Scenario: Host port already in use
- **AS A** developer who already has another service listening on port 5432, 6379 or 8333
- **WHEN** I run `docker compose up -d --wait`
- **THEN** the command fails stating which port is in conflict
- **AND** the existing named volumes are neither removed nor changed
```

In `design.md`, the **Non-Goals** protect the scope: Spring Boot integration is left to the skeleton change, Redis persistence is not a goal, and there is no high availability, TLS or any other production hardening. I never asked to keep the application out of scope; it wrote that down on its own. The design has 10 decisions (D1 to D10), including pinned image tags, never `latest` (D2), S3 credentials generated by Compose through `configs.content` (D4), the bucket created by a one-shot service (D5) and ports bound only to `127.0.0.1` (D7).

The proposal's impact section names the three development secrets (`POSTGRES_PASSWORD`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`), all with trivial, overridable defaults, says no database schema is created ("tables will come from versioned migrations in the skeleton") and warns about possible port conflicts. And every task ends with a concrete check, like this one (translated):

```markdown
- [ ] 5.2 Confirm that `docker compose up -d --wait` only returns after `seaweedfs-init`
  finishes successfully (D6). If Compose treats the one-shot's exit as a failure, apply
  plan B from Risks (a `seaweedfs` healthcheck that requires the bucket) and record it in
  `design.md`. Verify with `docker compose up -d --wait` returning 0 right after a `down -v`
```

Notice how explore shows up here: the raw-files bucket, the authenticated S3 API, Spring Boot integration pushed to the next change. Reviewing now is cheap: if the port, the bucket or a non-goal is wrong, you fix a paragraph, not a running compose stack.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.2-04.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.2-04.mp4" type="video/mp4"></video>
*⏱ Real time: 59 s (video sped up).*

---

# Part 2: Apply

Branch for this phase: [`feat/setup-local-infra/2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/setup-local-infra/2-apply). Compare it with `1-propose` to see what changed in the plan during implementation.

## Kicking It Off, and Checking Assumptions

The whole request was:

```
/opsx:apply
```

I explained nothing new, because everything it needs is in the artifacts. If I had to repeat the request here, the propose would have failed. Since there was only one active change, it answered "Using change: `setup-local-infra`".

Its first action was not writing configuration: it read the schema's apply instructions ("Read context files, work through pending tasks, mark complete as you go. Pause if you hit blockers or need clarification.") and checked the Docker, Compose and curl versions, precisely the points the design had left open. Result: "The environment confirms support for `configs.content` and `--aws-sigv4` (Docker 29.8, Compose v5.5, curl 8.18)." One of the two risks settled before a single file existed.

It also asked how the project tracks work, to decide the branch name; I answered "None, simple branch". Then it checked that ports 5432, 6379 and 8333 were free, looked up the current tags on Docker Hub and decided: "I'll use `postgres:16.15`, `redis:8.10` and `chrislusf/seaweedfs:4.48`." I asked for "PostgreSQL 16" and it pinned 16.15: a pinned tag is a reproducible environment.

Meanwhile I switched the permission mode to **Auto**, which approves on its own the actions that pass a safety check and pauses on the ones that look risky. On an apply that runs dozens of Docker commands, that saves approving each one by hand.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.3-00.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.3-00.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 38 s (video sped up).*

## Groups 1 to 3: Base, PostgreSQL and Redis

From here on the rhythm repeats for each group: implement, test, document, tick the checkbox, and only then move on.

* **Group 1:** `.gitignore` (confirmed with `git check-ignore .env`), `.env.example` with the three secrets, a `compose.yaml` with no services yet but already carrying the "LOCAL DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION" banner at the top, and `docs/ambiente-local.md` with a README pointing to it.
* **Group 2, PostgreSQL:** image 16.15, port bound to `127.0.0.1` only, named volume and a `pg_isready` healthcheck. This is where a gem showed up: "I noticed the official PostgreSQL image trusts local connections [...] so the wrong-password test has to go through the port published on the host." Testing from inside the container, the wrong password would be accepted and the test would prove nothing. Through the host port, the right password returns 16.15 and the wrong one gives `password authentication failed`. And it used the `psql` that ships in the image, installing nothing on the machine.
* `scripts/verify-local-env.sh` is born, running in a **separate Compose project** (`skyledger-verify`) so the reset scenarios never wipe the development data.
* The password-override test explained a behavior that confuses a lot of people: with a fresh volume the new password applies; with an existing volume the old one keeps working, because the image only applies the password when initializing an empty volume. That went into a table in the docs.
* **Group 3, Redis:** 8.10, no persistence. Comparing the volume list before and after, it doubted its own text: "I'll confirm whether this is due to `--save ""` or to the image itself, so the comment doesn't claim something false." The inspection showed that `redis:8.10` does not declare `VOLUME /data`, so **the justification written in the design (D8) was wrong**. The configuration was right; the reason was not. It fixed the comment and the design.

Wrong documentation is a silent risk, and here it was treated as a defect.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.3-01.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.3-01.mp4" type="video/mp4"></video>
*⏱ Real time: 4 min 40 s (video sped up).*

## SeaweedFS and Plan B

This is the richest part of the apply. The `seaweedfs` service goes in with S3 enabled, a single identity mounted through `configs`, only port 8333 published, and a healthcheck. The authentication test with `curl --aws-sigv4` gives exactly what the spec asks for: anonymous, 403; wrong secret, 403; valid credentials, the bucket list. That scenario was born from my answer during the propose.

Then it added `seaweedfs-init`, the one-shot from the original plan, and brought everything up. First conclusion: "Compose v5.5 waits for the one-shot to exit with code 0 before `--wait` returns, so plan B wasn't needed." A conclusion drawn from a single test on a clean environment. The next step was to test the second startup, which is exactly the spec's "Startup with an existing bucket" scenario, and it returned 1, even though the log said "bucket skyledger-raw already exists". It reproduced it, measured it (five consecutive startups with the environment already up: `1 1 1 1 1`, five failures out of five) and only then decided: apply the plan B foreseen in task 5.2. The `seaweedfs` service itself now ensures the bucket, and its healthcheck only turns green once the bucket exists.

Along the way it tripped on its own work: the first rewrite produced a YAML error ("my script's cut matched `configs:` inside the service itself, not the top-level block"). It read the file, removed the duplicated chunk and validated again.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.3-02.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.3-02.mp4" type="video/mp4"></video>
*⏱ Real time: 3 min 39 s (video sped up).*

This is where spec-driven pays for itself. The risk had been written down in the propose, with a plan B and a criterion for triggering it. When the problem came, the agent did not have to improvise architecture or ask me anything: it measured, compared against the scenario and executed the alternative I had already reviewed.

## A Graceful Shutdown Nobody Asked For

With repeated startups now stable, the retest exposed another problem that was in no artifact: "the `stop` took 11s and ended with 137 (SIGKILL)". Docker waited its default 10 seconds and killed the process.

The method it followed is worth copying:

1. **Hypothesis:** the plan B startup script does not forward the signal to the server.
2. **Evidence:** the process tree was correct, with `weed` as a direct child of `sh`. Hypothesis discarded.
3. **Measurement:** on SIGTERM, `weed` itself took **26 s** to shut down safely.
4. **Fix:** `stop_grace_period: 40s`, with a comment explaining why.
5. **New measurement:** stop in 26 s, exit code 143 (normal, handled signal).

Nobody asked for this, and it was not in the design. It got there because the spec requires data to survive restarts, and a forced kill in the middle of a write puts exactly that at risk. And it did not pick 40 "just in case": it measured 26 and chose a margin.

Then came the S3 scenarios in the script (bucket created and empty on first startup, access with credentials, 403 for anonymous and wrong secret, an object surviving down and up, another startup with an existing bucket) and the full suite: **11 automated scenarios, all passing, in about 3 minutes**.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.3-03.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.3-03.mp4" type="video/mp4"></video>
*⏱ Real time: 6 min 02 s (video sped up).*

## Making the Artifacts Tell the Truth

The suite passed, and plenty of people would stop here. The agent went back to the artifacts. Design decision D5 became "Bucket ensured by the `seaweedfs` service itself (plan B applied)", with the evidence (translated):

```markdown
*Why not the originally planned `seaweedfs-init` one-shot:* during
implementation (Compose v5.5.1), `docker compose up -d --wait` returned 1 in
all 5 attempts to bring up again an environment that was already running
(`container ... seaweedfs-init-1 exited (0)`). That violates the "Startup with
an existing bucket" scenario. Only the first startup, on a clean environment, passed.
```

The risks were updated, task 5.1 was rewritten for the real mechanism, and the docs gained a usage table (start, status, stop, reset, logs), a warning that stopping takes about 25 seconds and `curl` examples. It even corrected a claim of its own: "I'm correcting my earlier statement about 'Docker Engine 24+', which I didn't actually verify." The docs now say "Verified with 29.8".

Group 6 is integrated verification, done the way a human would:

* **Port conflict (6.2):** it occupied 6379 on purpose. `up` failed and the volumes stayed intact, but "my grep matched 'portchk' and not the error message". It admitted it and repeated until it confirmed the message names `127.0.0.1:6379`.
* **Loopback only, and following the docs to the letter (6.3 and 6.4):** it brought the real environment up with the documented command, tried to connect through the machine's network IP (refused, as expected) and ran the docs' `curl` examples one by one. It found a mistake: the `ss -ltn` the docs suggested does not show the ports in this environment. The docs now use `docker compose ps` and the connection attempt instead.

It wraps up with the Quality Gates (valid Compose file, `bash -n` on the script, no tracked `.env`) and with OpenSpec itself confirming: 29 of 29 tasks, "Change 'setup-local-infra' is valid".

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.3-04.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.3-04.mp4" type="video/mp4"></video>
*⏱ Real time: 4 min 19 s (video sped up).*

If the design still said "`seaweedfs-init` one-shot", it would be misleading the next person to read it, including the agent itself in the next change. In OpenSpec, an artifact is not a throwaway draft.

## The Final Report

The apply report has the structure I expect from anyone finishing a task, human or agent:

* **Outcome:** 29 tasks, `validate --strict` passing, 11 scenarios in about 3 minutes, and "**I didn't commit**; all files are untracked, waiting for you".
* **Deliverables:** `compose.yaml`, `.env.example`, `.gitignore`, the isolated verification script, the docs and the README.
* **Deviations from the plan, already recorded in the design:** the one-shot replaced (with the 5 attempts as evidence), `stop_grace_period` with its cost stated ("In exchange, `docker compose down` now takes about 25s") and the two corrected claims.
* **What it could not verify:** Maven gates do not apply yet, and without `gitleaks` or `shellcheck` the script only passed `bash -n`. It does not pretend to coverage it does not have.
* **For you to decide:** SeaweedFS auto-creates buckets on a PUT from an admin identity (`-s3.autoCreateBucket=true`), which could hide a wrong bucket name in the application later. "I didn't touch it because it's outside the spec." And the development volumes already exist, created while following the docs.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.3-05.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.3-05.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 42 s (video sped up).*

That "I didn't touch it because it's outside the spec" is scope discipline. If the agent goes around fixing everything that looks odd to it, the change stops matching the proposal that was reviewed. The decision came back to me, which is where it belongs.

After the apply, I asked for the history to be organized with **one branch per phase** (`1-propose`, `2-apply`, `3-archive`), which are the branches you will find in the repository. `1-propose` holds the artifacts exactly as they were at the end of the propose, and `2-apply` has one commit with the implementation and another with the updated artifacts. That way, the diff between the two shows what changed in the plan during implementation.

---

# Part 3: Archive

Branch for this phase: [`feat/setup-local-infra/3-archive`](https://github.com/vcasadei/skyledger-br/tree/feat/setup-local-infra/3-archive).

## The Sync Question

```
/opsx:archive
```

Typing `/ops` shows the installed commands: apply, archive, explore, propose, sync and update. There is a separate `/opsx:sync`, and archive offers to sync as part of the process.

The agent checks the state (all four artifacts `done`), compares the delta spec with the main specs and sees that `local-dev-environment` does not exist in `openspec/specs/` yet. So it asks (translated):

> **The local-dev-environment delta spec is not in the main specs (openspec/specs/) yet. How should I proceed?**
> - *Sync now (Recommended)*: Creates openspec/specs/local-dev-environment/spec.md with the 9 ADDED requirements and the Purpose, verifies it, and then archives the change.
> - *Archive without syncing*: Only moves the change to the archive; the capability does not become part of the main specs.

It is worth understanding the two places a spec lives in OpenSpec. The **delta spec**, inside the change, is only the list of what changes, with `ADDED`, `MODIFIED`, `REMOVED` and `RENAMED` sections. The **main specs**, in `openspec/specs/`, describe how the system behaves today: they are the source of truth.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.4-00.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.4-00.mp4" type="video/mp4"></video>
*⏱ Real time: 45 s (video sped up).*

I chose **Sync now**, for three reasons. The environment we just built and tested is exactly what the spec describes. The next change, the Spring Boot skeleton, will reference `openspec/specs/` instead of redefining ports and credentials. And a future `MODIFIED` needs a base: you cannot modify a requirement that never made it into the main specs. The analogy I use: *Sync now* is merging an approved pull request; *Archive without syncing* is closing the PR without merging, which makes sense when the change was abandoned or superseded.

## Sync, Validation and Archiving

The execution follows an order I really like:

1. It fetches the project's spec rules (the three in `config.yaml`: money, REST and ANAC data) and concludes none applies to a development environment.
2. It creates the main spec. In the delta the section is called `ADDED Requirements`; in the main spec it becomes just `Requirements`. That is what applying a delta means: "what changes" becomes "what is".
3. It validates: "The main spec is valid: 9 of 9 requirements, 16 of 16 scenarios, and the body is identical to the delta." Promoting is not rewriting.
4. Only then does it move the change to `openspec/changes/archive/2026-09-29-setup-local-infra`, first checking that the destination does not exist, using `git mv` so git understands it is the same file in a new place and each artifact's history stays navigable.

![Archive with sync: the change's delta spec becomes the main spec in openspec/specs/local-dev-environment and only then is the whole change moved with git mv to changes/archive](/assets/images/sdd-openspec-2/archive-sync-en.webp)

Validate before the step that is hard to undo: the same logic as a well-run deploy.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.4-01.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.4-01.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 21 s (video sped up).*

## Checking With Your Own Eyes

Every agent report is a claim; the file on disk is the proof. In the Explorer, `openspec/changes/` now holds only the `archive` folder, with the dated change inside. The archived `tasks.md` is fully ticked, and task 5.1 records that "the planned `seaweedfs-init` one-shot was replaced by plan B from 5.2". The apply's deviation was not lost in the archive.

And the new file, the source of truth for the local environment from now on, is `openspec/specs/local-dev-environment/spec.md` (translated):

```markdown
## Purpose

Provides Skyledger BR developers with a reproducible local environment, with
PostgreSQL, Redis and S3-compatible object storage, brought up by a single
Docker Compose command and intended exclusively for development.

## Requirements

### Requirement: Environment startup with a single command
```

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.4-02.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.4-02.mp4" type="video/mp4"></video>
*⏱ Real time: 46 s (video sped up).*

`openspec/specs/` answers "how does the system behave today"; `openspec/changes/archive/` answers "when and why did that change". Six months from now, whoever asks why the bucket is created inside the service will find the answer, with evidence, in the archived design. A commit message rarely gives you that.

---

# Part 4: Testing It by Hand

The agent ran 11 scenarios and followed the docs to the letter. Even so, I want to see it working, typing it myself, no agent involved. Three commands in the integrated terminal:

```bash
docker compose config
docker compose up -d
docker compose ps
```

A confession about the order: the safest path is to validate and bring things up **before** archiving. If the test fails, the change is still open to fix; after the archive, the fix becomes a new change. I archived at night and tested the next morning. It worked because the apply had already proven the scenarios, but I recommend the safe order.

## Validating and Reading compose.yaml

`docker compose config` reads the file, resolves variables with their defaults and prints the final configuration without creating anything. With no `.env`, the S3 identities JSON comes out with `skyledger-dev` / `skyledger-dev-secret`. Then a read through the `compose.yaml` the apply produced. The SeaweedFS service, with plan B and the graceful shutdown (excerpt, comments in Portuguese as in the repository):

```yaml
  seaweedfs:
    # 4.40 é o piso de segurança do projeto (CVEs em versões anteriores).
    image: chrislusf/seaweedfs:4.48
    entrypoint: ["sh", "-c"]
    command:
      - |
        /entrypoint.sh server -s3 -s3.config=/etc/seaweedfs/s3.json &
        pid=$$!
        trap 'kill -TERM "$$pid"; wait "$$pid"; exit' TERM INT
        ...
        # s3.bucket.create falha com bucket existente: listar antes mantém a
        # subida idempotente.
        if shell "s3.bucket.list" | grep -qE '^[[:space:]]*skyledger-raw[[:space:]]'; then
          echo "bucket skyledger-raw já existe"
        else
          shell "s3.bucket.create -name skyledger-raw" || { kill -TERM "$$pid"; exit 1; }
        fi
        touch /tmp/bucket-ready
        wait "$$pid"
    # O weed server leva ~25s no shutdown gracioso; com o padrão de 10s o
    # Docker o mataria com SIGKILL no meio da gravação dos volumes.
    stop_grace_period: 40s
    ports:
      # Só a API S3; master (9333), volume (8080) e filer (8888) ficam internos.
      - "127.0.0.1:8333:8333"
    healthcheck:
      test: ["CMD-SHELL", "test -f /tmp/bucket-ready && wget -q -O /dev/null http://127.0.0.1:8333/healthz"]
```

Every line traces back to an artifact: the `127.0.0.1` ports were an assumption declared in the propose; the bucket inside the service is D5 as rewritten in the apply; `stop_grace_period` is the recorded deviation; the banner at the top satisfies a spec requirement. That is what makes the file reviewable by someone who was not in the session.

![The local environment: PostgreSQL 16.15, Redis 8.10 and SeaweedFS 4.48 in Docker Compose, with ports 5432, 6379 and 8333 published on 127.0.0.1 only, named volumes for Postgres and S3, and a SeaweedFS healthcheck that requires the bucket](/assets/images/sdd-openspec-2/ambiente-local-en.webp)

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.5-00.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.5-00.mp4" type="video/mp4"></video>
*⏱ Real time: 44 s.*

## Bringing It Up: "Running" Is Not "Ready"

`docker compose up -d` creates the network and the three containers in under a second each. But *Started* means the process began, not that the service is ready. Repeating `docker compose ps`:

* at 9 s, Postgres 16.15 and Redis 8.10 are already `healthy`, and SeaweedFS shows `health: starting`;
* at 18 s, still `starting`. In its ports column, 7333, 8080, 8888, 9333 and others show up as internal only; the single port published on the host is `127.0.0.1:8333`;
* at 29 s, all three are `healthy`.

And `healthy` here means S3 responds **and** the `skyledger-raw` bucket exists, because that is what the healthcheck requires (decision D6). Because of that, the command the docs recommend, `docker compose up -d --wait`, only returns when everything is truly ready, and a CI script can rely on it without fixed sleeps.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-2/1.2.5-01.jpg"><source src="/assets/videos/sdd-openspec-2/1.2.5-01.mp4" type="video/mp4"></video>
*⏱ Real time: 42 s (video sped up).*

If you are following along with the series, this is your checkpoint: run the same three commands in your clone and confirm all three `healthy`. The infrastructure has to be up for the next post, because Spring Boot tries to connect to Postgres right at startup.

---

# Lessons From This First Change

* **Explore is the cheap place to be wrong.** It created no files, but its decisions (raw-files bucket, authenticated S3, Flyway, batch table) run through the whole series.
* **A question beats an assumption, and a stated assumption beats silence.** The two propose questions changed acceptance criteria, and the summary separated what was mine from what was the agent's.
* **A risk written down with a plan B becomes a decision, not improvisation.** The one-shot failed exactly where the design said it might, and the way out had already been reviewed.
* **The spec drives decisions the prompt never mentioned.** `stop_grace_period` came from the persistence requirement, not from anything I asked.
* **An artifact that lies is a defect.** The apply fixed the design, the docs and even its own claims before declaring itself done.
* **Check on disk and with your own hands.** The report is a claim; `docker compose ps` is the proof.

And the main point: we used the full cycle for something that is not even application code. Nothing enters the project without an agreement reviewed beforehand, not even a configuration file.

---

# References

* **Spec-Driven Development**
  * [OpenSpec](https://github.com/Fission-AI/OpenSpec) · [Documentation](https://openspec.dev/docs)
  * [openspec-casadei](https://github.com/vcasadei/openspec-casadei), my public schema for OpenSpec
* **The project**
  * [skyledger-br](https://github.com/vcasadei/skyledger-br) · branches for this change: [`1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/setup-local-infra/1-propose), [`2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/setup-local-infra/2-apply), [`3-archive`](https://github.com/vcasadei/skyledger-br/tree/feat/setup-local-infra/3-archive)
  * [anac-data](https://github.com/vcasadei/anac-data) · [ANAC data and statistics](https://www.gov.br/anac/pt-br/assuntos/dados-e-estatisticas)
* **Tools**
  * [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview)
  * [Docker Compose](https://docs.docker.com/compose/) · [`configs`](https://docs.docker.com/reference/compose-file/configs/) · [`healthcheck`](https://docs.docker.com/reference/compose-file/services/#healthcheck) · [`stop_grace_period`](https://docs.docker.com/reference/compose-file/services/#stop_grace_period) · [`docker compose up --wait`](https://docs.docker.com/reference/cli/docker/compose/up/)
  * [PostgreSQL (official image)](https://hub.docker.com/_/postgres) · [Redis (official image)](https://hub.docker.com/_/redis) · [SeaweedFS](https://github.com/seaweedfs/seaweedfs) · [SeaweedFS: S3 API](https://github.com/seaweedfs/seaweedfs/wiki/Amazon-S3-API)
  * [curl `--aws-sigv4`](https://curl.se/docs/manpage.html#--aws-sigv4)
  * Mentioned in explore: [Flyway](https://documentation.red-gate.com/flyway) · [Testcontainers](https://testcontainers.com/) · [Spring Boot](https://spring.io/projects/spring-boot)

---

**Series navigation:** ← [Part 1: OpenSpec, the casadei Schema and Claude Code](/2026/10/16/sdd-openspec-1-openspec-casadei-schema.html) · [Part 3: SkyLedger's Spring Boot Skeleton](/2026/10/19/sdd-openspec-3-skyledger-spring-boot-skeleton.html) →

If this post helped you get through your first SDD cycle, let me know on LinkedIn ([linkedin.com/in/vcasadei](https://linkedin.com/in/vcasadei)) or check out more writing at [vcasadei.com](https://vcasadei.com).

<style>
.article__content pre, .article__content pre code{white-space:pre-wrap !important;word-wrap:break-word;overflow-wrap:anywhere}
.article__content div.highlight, .article__content pre{overflow-x:visible !important}
</style>
