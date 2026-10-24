---
layout: article
title: "SDD with OpenSpec, Part 3: SkyLedger's Spring Boot Skeleton"
date: 2026-10-19 11:00:00 -0300
key: sdd-openspec-3-skyledger-spring-boot-skeleton
translation_key: sdd-openspec-3
cover: /assets/images/sdd-openspec-3/sdd-openspec-3.jpeg
tags: [SDD, OpenSpec, Claude Code, Spring Boot, Java, SkyLedger]
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
    src: /assets/images/sdd-openspec-3/sdd-openspec-3.jpeg
---

SkyLedger BR's second change: a Spring Boot skeleton that builds on the infrastructure already specified, instead of reinventing it.

<!--more-->

This is the third post in a **series that teaches Spec-Driven Development (SDD) with [OpenSpec](https://github.com/Fission-AI/OpenSpec)** from scratch, by building a real project: SkyLedger BR, which will read the Brazilian civil aviation agency's (ANAC) open flight data and expose a query API.

**The series:**

1. [SDD with OpenSpec, Part 1: OpenSpec, the casadei Schema and Claude Code](/2026/10/16/sdd-openspec-1-openspec-casadei-schema.html)
2. [SDD with OpenSpec, Part 2: SkyLedger BR and the Local Infrastructure](/2026/10/18/sdd-openspec-2-skyledger-local-infra.html)
3. **SDD with OpenSpec, Part 3: SkyLedger's Spring Boot Skeleton** (you are here)
4. [SDD with OpenSpec, Part 4: Ingesting ANAC's Open Data into SkyLedger](/2026/10/21/sdd-openspec-4-skyledger-anac-ingestion.html)
5. [SDD with OpenSpec, Part 5: SkyLedger's Flight Query API](/2026/10/23/sdd-openspec-5-skyledger-query-api.html)

In the previous post, the project's first change, `setup-local-infra`, was proposed, implemented and archived. It left behind two things that matter now: the `compose.yaml` with PostgreSQL, Redis and SeaweedFS, and the `local-dev-environment` spec, with 9 requirements, stored in `openspec/specs/`. That spec is the official description of how the local environment works today.

Now comes the second change, `bootstrap-project-skeleton`: the skeleton of the Spring Boot application that will connect to that infrastructure. The main class, a health check, the database and cache configuration and the API documentation. It looks small, and that's on purpose. What I want to show here is history working in our favor: for the first time there is an archived spec, and the agent will **read what was decided and reference it**, instead of redefining ports and credentials from scratch.

![The archived setup-local-infra change produced the local-dev-environment spec (9 requirements); bootstrap-project-skeleton references it and, once archived, produces the application-runtime spec (7 requirements), which the next change, ANAC ingestion, will read](/assets/images/sdd-openspec-3/changes-encadeadas-en.webp)

As in the rest of the series, I use Claude Code with my [openspec-casadei](https://github.com/vcasadei/openspec-casadei) schema (if your environment isn't set up yet, start with [Part 1](/2026/10/16/sdd-openspec-1-openspec-casadei-schema.html); if you want to practice for free, the [post on opencode and free models](/2026/10/15/sdd-opencode-inkstone-free-models.html) shows the same workflow with a different tool). I recorded all three phases. **The videos are sped up during the waits**, so don't be surprised by how fast the commands fly by.

There was no `/opsx:explore` this time: whatever needed discussing about the skeleton had already come up in the initial conversation about the whole project. The cycle is the usual one:

<style>
.sdd-wrap{white-space:pre-wrap !important;word-break:break-word;overflow:visible !important;max-height:none !important}
</style>

![The change's five-step cycle: /opsx:propose produces the proposal, delta spec, design and tasks; you review the decisions and uncertainties; /opsx:apply implements, verifies and corrects the plan; you close the task only a human can check; /opsx:archive turns the delta into a main spec](/assets/images/sdd-openspec-3/ciclo-change-en.webp)

Each phase has a public branch in the repository, so you can compare or check it out:

* Propose: [`feat/bootstrap-project-skeleton/1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/bootstrap-project-skeleton/1-propose)
* Apply: [`feat/bootstrap-project-skeleton/2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/bootstrap-project-skeleton/2-apply)
* Archive: [`feat/bootstrap-project-skeleton/3-archive`](https://github.com/vcasadei/skyledger-br/tree/feat/bootstrap-project-skeleton/3-archive)

The project's artifacts are written in Portuguese, so the excerpts below are quoted in Portuguese with a translation alongside.

---

# Part 1 — Propose

## The Request

This is the text I sent, exactly as it came out, typos and all (in Portuguese, "sirva com ponto" instead of "sirva como ponto", "primcipal", the double space in "Spring  Boot"):

<div class="language-plaintext highlighter-rouge"><div class="highlight"><pre class="highlight sdd-wrap"><code>/opsx:propose bootstrap-project-skeleton

Preciso agora do esqueleto de uma aplicação Spring  Boot (Maven, Java 21) que sirva com ponto de partida do projeto: a classe primcipal, um endpoint de health-check simples, e configuração de conexão com o Postgres e Redis que já foram definidos anteriormente - não redefina a infraestrutura, referencie o que já existe</code></pre></div></div>

In English: *"I now need the skeleton of a Spring Boot application (Maven, Java 21) to serve as the project's starting point: the main class, a simple health-check endpoint, and connection configuration for the Postgres and Redis that were already defined earlier - don't redefine the infrastructure, reference what already exists."*

I left it as is on purpose: the prompt doesn't have to be perfect. What has to be clear is the intent and the constraints. Three things about this text:

* **The change name comes right after the command:** `bootstrap-project-skeleton`. That becomes the folder in `openspec/changes/`.
* **The scope is small and explicit:** main class, a simple health check and the connection to Postgres and Redis. What wasn't asked for (JPA, Flyway, security) should stay out, and we'll check that in the summary.
* **The most important sentence is the last one:** "don't redefine the infrastructure, reference what already exists". The `compose.yaml` and the `local-dev-environment` spec are already the source of truth for ports, user and password. If the agent reinvents those values, a second truth is born, and sooner or later it will drift from the first.

And there was one thing I **didn't** write: that JDK 21 and Maven were installed. I left it out on purpose, and in fact there was no JDK on the machine. In a moment Claude asks exactly about that.

A detail that shows up at the very start of the recording: the gray line "Idle 11h 40m. The prompt cache has likely expired". I resumed the session the day after archiving the first change, and the next message reloaded about 179 thousand tokens of context. Long sessions carry that cost, and it's worth knowing it exists.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.1-00.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.1-00.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 50 s (video sped up).*

## Investigating Before Proposing

Before writing any document, Claude looked at the repository. Its first sentence was "I'll start with the state of the repository. The propose branch needs to start from where the infrastructure already exists." That matters: since the first change hadn't reached `main` yet, it created the `1-propose` branch from `feat/setup-local-infra/3-archive`, the only one that had the `compose.yaml` and the spec I asked it to reference.

Then, in a single command, it loaded the OpenSpec context and checked the environment:

```bash
openspec context --json
openspec list --json
openspec list --specs
openspec show local-dev-environment --type spec
which java mvn
```

`openspec context` returns the project context, `openspec list` shows whether another change is in progress, and `openspec show local-dev-environment` brings up the spec it is going to reference. The result of the last check came in its message: "I found a toolchain blocker: there is no `java` or `mvn` on the host." Instead of solving it on its own, it went to check the library versions, "because they decide what can be proposed".

And here is a behavior I really like: **instead of picking versions from memory, it queried Maven Central**. Spring Boot, springdoc (the library that generates the OpenAPI documentation) and the Maven Wrapper. The latest published Spring Boot was 4.2.0-M2, a pre-release (milestone). It stayed on the stable 4.1 line, which is what our `openspec/config.yaml` declares: "I confirmed Spring Boot 4.1.1 exists and springdoc 3.x supports it." And it closed with the yardstick it uses to decide when to ask: "Before coding, I'll ask you about four related decisions that affect the contract or the dependencies."

Anyone who's had a coding assistant hand them a library version that doesn't exist knows how valuable this is.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.1-01.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.1-01.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 19 s (video sped up).*

## The Four Questions

Claude opened a questionnaire with four tabs: Health, OpenAPI, Toolchain and Package. Three came with a recommended option; the fourth did not.

**1. Health: what should the health-check endpoint look like, and what does it report about Postgres and Redis?**

* *Actuator, Redis doesn't take it down (recommended):* `GET /actuator/health`, from Spring Boot Actuator. Postgres down means `DOWN` and 503; Redis shows up as a component but doesn't take down the overall status.
* *Actuator, both take it down:* simpler, but, in its own words, "Redis being unavailable takes the app down for orchestrators".
* *Simple custom endpoint:* `{"status":"UP"}` whenever the app responds, without checking any dependency.

I went with the recommended one. In SkyLedger, Redis is just a cache: without it the application is slower, but it works. Without Postgres, it doesn't. A cache outage can't turn into a system outage, and a health check that says `UP` with the database down is useless for monitoring.

![Health-check contract: GET /actuator/health aggregates the db and redis components; PostgreSQL down means DOWN and HTTP 503; Redis down shows up as DEGRADED and the overall status stays UP with HTTP 200](/assets/images/sdd-openspec-3/health-check-en.webp)

**2. OpenAPI: "The convention requires OpenAPI on every public REST endpoint, which calls for a new dependency (springdoc-openapi 3.x). Do you approve including it in this change?"**

This question is the best example of layered rules. The project's `config.yaml` says what the project requires:

```yaml
  Convenções do projeto:
  ...
  - Todo endpoint REST público tem documentação OpenAPI.
```

("Every public REST endpoint has OpenAPI documentation.") And the casadei schema says how the agent must behave: no new dependency without explicit approval. When the two rules met, Claude asked. I answered "Yes, springdoc now". A rule that starts with an exception loses its strength, and contract documentation from the first endpoint is free traceability.

**3. Toolchain: "This machine has no JDK or Maven. How should the build (`./mvnw verify`) run?"**

The options were installing JDK 21 locally (recommended) or running the build in an `eclipse-temurin:21` container. The Docker option already spelled out its own cost: "requires a script/alias and leaves the IDE without a JDK". I chose to install JDK 21. For interactive work, the speed of the edit-compile-test loop matters more, and reproducibility is still guaranteed by the Maven Wrapper and the version pinned in `pom.xml`.

**4. Package: which groupId and base Java package?**

This one came with no recommendation: Claude had no basis to choose, and left the options on equal footing. I chose **`br.com.skyledger`**, the product's own name, independent of who maintains it. A Java package is expensive to change later, so it's worth deciding now.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.1-02.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.1-02.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 06 s (video sped up).*

Each of these answers will show up in the documents and in the final summary. And they come back during apply: when the JDK is missing there, Claude will remember that the Docker option was ruled out here.

## Artifacts and Validation

With the answers in hand, Claude created the change and wrote the documents in the order the schema requires: first the proposal, then the spec and the design, finally the tasks. The repeating pattern is the most interesting part: **before each file, it asks OpenSpec itself where to write and which rules apply**.

```bash
openspec new change "bootstrap-project-skeleton"
openspec status --change bootstrap-project-skeleton --json
openspec instructions proposal --change bootstrap-project-skeleton --json
openspec instructions specs --change bootstrap-project-skeleton --json
openspec instructions design --change bootstrap-project-skeleton --json
openspec instructions tasks --change bootstrap-project-skeleton --json
openspec validate bootstrap-project-skeleton --strict
```

`openspec status` shows the document graph: at first, the proposal is ready to be written and spec, design and tasks are blocked waiting for it. `openspec instructions` returns the file path, the casadei schema template and our `config.yaml` rules for that document. That's how the project's conventions reach the generated text without me repeating them in the prompt.

Along the way, two more checks against Maven Central: whether each Spring Boot 4.1.1 module it planned to use existed, and springdoc compatibility. The findings: "springdoc 3.1.1 was compiled against Boot 4.1.0, so it's compatible. `starter-web` is deprecated in favor of `starter-webmvc`, and I use that one."

Before writing the design, it noted three pitfalls that became decisions: Hikari's (the connection pool) default timeout would hang the health check when the database goes down; Spring may accept an unresolved password placeholder as literal text; and, in tests, the Docker Compose service connection overrides the connection properties. These are operations problems, not code problems, the kind that usually only show up in production or in the pipeline.

`openspec validate --strict` passed: "Change 'bootstrap-project-skeleton' is valid". Even so, it noticed a problem: "Task 6.4 was left with a generic `<base>`." A task with a placeholder like that isn't verifiable, and that's precisely the task that proves the infrastructure didn't change. It replaced the placeholder with the real branch and validated again:

```bash
sed -i 's|git diff --stat <base> -- compose.yaml|git diff --stat feat/setup-local-infra/3-archive -- compose.yaml|' openspec/changes/bootstrap-project-skeleton/tasks.md
openspec validate bootstrap-project-skeleton --strict
```

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.1-03.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.1-03.mp4" type="video/mp4"></video>
*⏱ Real time: 5 min 17 s (video sped up).*

### What Got Written

The **proposal** starts with the why (translated):

> The local environment (PostgreSQL, Redis and SeaweedFS, capability `local-dev-environment`) already exists, but there is no application using it yet. The next changes (ANAC ingestion, analytics with cache) need a common starting point [...]. Without it, each change would have to build the base on its own.

And "reference what already exists" shows up literally in *What Changes*:

> - Configures the connection to the PostgreSQL and Redis **of the already existing local environment**, without redefining any infrastructure:
>   - the host, port, database and user defaults point to the `compose.yaml` services and can be overridden by environment variables;
>   - the PostgreSQL password has no default in the code. It comes from `POSTGRES_PASSWORD`, the same variable `compose.yaml` uses, read from the environment or the local `.env`.

The *Impact* section, in casadei format, lists the public endpoints (because of a `config.yaml` rule), the dependencies and what the change does **not** touch. I especially like these two lines:

> - **PostgreSQL / esquema de banco**: só a conexão (pool). Nenhuma tabela nem migração é criada.
> - **Dados pessoais (LGPD), filas, valores monetários, anac-data**: não se aplica.

That is: "PostgreSQL / database schema: only the connection (pool). No table or migration is created." and "Personal data (LGPD, Brazil's data protection law), queues, monetary values, anac-data: not applicable."

The **delta spec** creates a new capability, `application-runtime`, with 7 requirements: reproducible build, PostgreSQL connection, Redis connection, startup independent of dependency availability, health check, OpenAPI documentation and credentials kept out of logs. The health-check requirement carries the contract as a table:

| `db` | `redis` | overall `status` | HTTP |
|------|---------|----------------|------|
| `UP` | `UP` | `UP` | 200 |
| `UP` | `DEGRADED` | `UP` | 200 |
| `DOWN` | any | `DOWN` | 503 |


Note that the contract also specifies 404 for other Actuator endpoints and 405 for methods other than `GET`, even though I only asked for "a simple health check". That's the `config.yaml` rule requiring the full contract of every public REST endpoint, error codes included, kicking in without me asking. And every scenario follows the casadei format, with `AS A` and at least one failure path:

```markdown
#### Scenario: Senha ausente
- **AS A** desenvolvedor sem `.env` e sem `POSTGRES_PASSWORD` no ambiente
- **WHEN** inicio a aplicação
- **THEN** a inicialização falha com código de saída diferente de zero
- **AND** a mensagem de erro cita `POSTGRES_PASSWORD`
```

(*Missing password: as a developer with no `.env` and no `POSTGRES_PASSWORD` in the environment, when I start the application, then startup fails with a non-zero exit code, and the error message mentions `POSTGRES_PASSWORD`.*)

The **design** has 9 decisions (D1 to D9) and a testing-strategy table. The **tasks** are 34, in 6 groups: Maven project, connection configuration, health check, OpenAPI, manual verification and quality gates. An example task, with its verification command built in:

```markdown
- [ ] 2.1 Criar `src/main/resources/application.yaml` com o import de `.env`, datasource, Redis e timeouts da D3, sem nenhum valor de senha. Verificar com `grep -n password src/main/resources/application.yaml`, que deve mostrar só `${POSTGRES_PASSWORD}`
```

(*Create `application.yaml` with the `.env` import, datasource, Redis and the D3 timeouts, with no password value. Verify with `grep -n password ...`, which must show only `${POSTGRES_PASSWORD}`.*)

## The Summary for Review

The propose ends with a summary designed for human review, with the same structure as a good code review: what was done, what came from me, what the agent decided on its own and what is still uncertain.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.1-04.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.1-04.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 16 s (video sped up).*

The part that deserves a slow read is "Decisions I made that are worth your review":

* **No password in the code.** The application reads the same `POSTGRES_PASSWORD` as Compose, from the environment or from `.env`. Without it, startup fails. It's a direct consequence of "reference what already exists": a single source.
* **Short connection timeouts** (3s for Hikari, 2s for Redis). With the defaults, the health check would hang for 30 to 60 seconds when a dependency goes down.
* **Integration tests use `spring-boot-docker-compose`** with the existing `compose.yaml`. Consequence: `./mvnw verify` requires Docker running, which affects who runs the build and where, including the pipeline.
* **Left out:** JPA, Flyway, Spring Security, and coverage and lint tools. The last two would be unapproved dependencies, so the static-analysis gate became the compiler itself with `-Xlint:all -Werror`: any warning becomes an error.

And finally, "Two points to confirm during apply": the class name of the Redis health indicator in Boot 4.1, which is now modularized, and whether Spring already fails on its own when `POSTGRES_PASSWORD` is missing, which would make D4's validation bean unnecessary.

An agent that declares its own uncertainty is much easier to review than one that delivers everything in the same confident tone. Every item on that list is something you can accept, reject or adjust before spending implementation time.

A detail for the attentive reader: the summary says "6 groups with 30 tasks", but `tasks.md` has 34, and that's the number OpenSpec shows during apply. I didn't dig into the difference at the time. The source of truth is the file itself, not the summary.

---

# Part 2 — Apply

Apply starts with a command without arguments:

```
/opsx:apply
```

Claude picked the only active change on its own ("Using change: bootstrap-project-skeleton"), created the `2-apply` branch from `1-propose` and went straight to task 1.1, which is precisely confirming JDK 21.

## Blocked on Task 1.1

A single command looked for a JDK every possible way: `java` on the PATH, `JAVA_HOME`, the default `/usr/lib/jvm` folder and an SDKMAN install. Nothing. The answer was "Implementation paused", with progress at 0 of 34:

> Task 1.1 fails: there is no JDK on this machine. [...] Without JDK 21, no task from 1.2 onward can be verified. Not even `./mvnw` runs, because the wrapper downloads Maven but needs a JDK.

And the options, written as text:

1. **I install it with apt** (`sudo apt install openjdk-21-jdk`): "It needs `sudo`, which I don't have. It's the path we agreed on in propose, and the IDE also gets to see the JDK."
2. **Claude installs an Eclipse Temurin 21 just for my user, without sudo:** faster, but "it's software installed on your machine by me, so I need your explicit ok".
3. **Build via Docker:** "you ruled out this option in propose. Choosing it now would require updating the design and the tasks."

Two things stand out to me. The agent knows its own permission limits and doesn't try to work around them. And it treats the propose as an agreement: it doesn't present Docker as a new idea, it reminds me it was ruled out and states the cost of reopening it.

In the integrated terminal, I checked the infrastructure (which I had brought up right before, since it's a precondition for apply) and installed the JDK:

```bash
docker compose ps
sudo apt install openjdk-21-jdk
```

`docker compose ps` showed postgres 16.15, redis 8.10 and seaweedfs, all `healthy` and with ports bound to `127.0.0.1`. Then I simply replied "1, java instalado" ("1, java installed"). Short, because the decision had already been made.

Stopping at task 1.1 cost two minutes. Carrying on without a JDK would have produced dozens of files nobody had compiled.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.2-00.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.2-00.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 22 s (video sped up).*

## Groups 1 and 2: Build and Configuration

With the JDK installed, the real work begins, always with the same rhythm: implement, verify, check off. First it checked my answer with `java -version` and `javac -version`. With no Maven on the machine, it queried the official repository for the latest 3.9 version and wrote that "the most canonical way is to generate the wrapper with the plugin itself": it downloaded Maven 3.9.16 into a temporary folder, **verified the SHA-512 checksum** and only then used it to generate Maven Wrapper 3.3.4. From there on, everything runs through `./mvnw`.

The `pom.xml` uses `spring-boot-starter-parent` 4.1.1 and `maven-enforcer-plugin` requiring Java 21. The main class, `br.com.skyledger.SkyledgerApplication`, was checked in the JAR manifest (`Start-Class`). Task 1.5 is the negative path, and a good example of Docker as a testing tool, not as the way to build:

```bash
docker run --rm -v "$PWD":/w -w /w eclipse-temurin:17 ./mvnw -q validate
```

With JDK 17, the build fails in the enforcer, before compiling, asking for Java 21. Group 1 closed with the initial documentation in `docs/aplicacao.md`, because the casadei schema requires documentation inside each group, not at the end.

Group 2 started with `application.yaml`, with the password having no default. Here apply found **the first mistake in the plan itself**. To answer the question left open in propose ("does Spring fail on its own without the password?"), it started the application without the variable. And wrote: "The test revealed another problem, before the password". The `hikari.connection-timeout` property only accepts milliseconds: the design's `3s` broke startup. It became `3000`, and it repeated the experiment.

The second finding answered the question: **the application starts normally without the password**, with the `${POSTGRES_PASSWORD}` placeholder kept as literal text. In other words, D4's validation bean was needed. Before writing it, it inspected Spring Boot's own libraries with `javap` to find the exact class names. The result is small and direct:

```java
public DatabaseCredentialsCheck(JdbcConnectionDetails connectionDetails) {
    String password = connectionDetails.getPassword();
    if (password == null || password.isBlank() || password.startsWith("${")) {
        throw new IllegalStateException(MISSING_PASSWORD_MESSAGE);
    }
}
```

Without a password, startup ends with exit code 1 and the message "POSTGRES_PASSWORD não definida: exporte a variável ou crie o .env a partir de .env.example" ("POSTGRES_PASSWORD not set: export the variable or create .env from .env.example").

Then came group 2's tests, and one failed: precisely the one about the password staying out of the logs. Its reaction was what I'd want from anyone on a team: before touching the test, it needed to know "whether the password really leaked". It hadn't. The problem was the text the test expected in the log to know the application had started. It changed the marker and all 4 tests passed. Finally, it updated `.env.example`, the documentation and **D4's note in the design**.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.2-01.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.2-01.mp4" type="video/mp4"></video>
*⏱ Real time: 8 min 38 s (video sped up).*

## Groups 3 and 4: Health Check and OpenAPI

Group 3 is the heart of the change. The Actuator configuration ended up like this in the design (D5):

```yaml
management:
  endpoints.web.exposure.include: health
  endpoints.web.discovery.enabled: false
  endpoint.health:
    show-components: always
    show-details: never
    probes.enabled: false
    status.order: DOWN, OUT_OF_SERVICE, UP, DEGRADED, UNKNOWN
  health.redis.enabled: false
```

`probes.enabled: false` wasn't in the plan: in Boot 4.1 the liveness and readiness probes are on by default and would expose `/actuator/health/liveness` and `/readiness`, contradicting the requirement to expose only `/actuator/health`. It turned them off and recorded why in the design.

`RedisDegradableHealthIndicator` reuses Spring Boot's own Redis indicator (whose real name, `DataRedisHealthIndicator`, closed the other uncertainty from propose) and only swaps `DOWN` for `DEGRADED`:

```java
@Override
public Health health() {
    Health health;
    try {
        health = delegate.health();
    } catch (RuntimeException ex) {
        return Health.status(DEGRADED).build();
    }
    if (health == null || Status.DOWN.equals(health.getStatus())) {
        return Health.status(DEGRADED).build();
    }
    return Health.status(health.getStatus()).build();
}
```

Since `DEGRADED` comes after `UP` in `status.order`, aggregation results in `UP`, and since `DEGRADED` isn't in the 503 mapping, the response is 200.

The integration tests produced the most instructive failures of the apply:

* **"No default constructor found":** with two constructors (one for injection, one for the unit test), Spring didn't know which to use. The fix was marking the public one with `@Autowired`.
* **Redis unavailable:** it said "I'll go to the root cause". The `RedisConnectionFactory` mock didn't satisfy a second interface that Redis's reactive auto-configuration requires. The fix was to mock `LettuceConnectionFactory`, the concrete class the application actually uses, and document the reason in the test itself and in the design.

At no point did it delete a test or loosen a check to get to green. A red test is information.

In group 4, OpenAPI, the difference between having the library in the project and following the rule became clear. With `springdoc.show-actuator: true`, the health endpoint enters the specification, but "only the 200 response appears, with no body schema". The rule calls for error codes to be documented, so it created `HealthOpenApiCustomizer`, with a summary, 200 and 503 responses and the `HealthResponse` schema. It also found another deviation: the links page at `/actuator` was exposed. It turned it off with `discovery.enabled: false` and wrote a test expecting 404 there.

And `-Werror` earned its keep: the compiler caught an untyped call in the customizer. It fixed it by building the schema in a typed variable, instead of suppressing the warning. "All 17 tests passed."

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.2-02.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.2-02.mp4" type="video/mp4"></video>
*⏱ Real time: 10 min 40 s (video sped up).*

## Groups 5 and 6: Manual Checks and Gates

Group 5 consists of manual checks described in `tasks.md` itself, and Claude ran the ones it could run on its own, with the application running via `./mvnw spring-boot:run`:

```bash
POSTGRES_PASSWORD=errada ./mvnw spring-boot:run   # 503, db DOWN
docker compose stop postgres                      # start the app: 503
docker compose start postgres                     # back to 200 without restarting
REDIS_PORT=6390 ./mvnw spring-boot:run            # 200, redis DEGRADED
```

"I confirmed that wrong password, PostgreSQL unavailable and Redis on the wrong port produced the expected behaviors (503, 503→200, 200 with DEGRADED)". The 503→200 is the requirement "Startup independent of dependency availability": with PostgreSQL down, the application starts and answers 503, and goes back to 200 without restarting when the database returns. My original plan said Spring wouldn't even start without PostgreSQL. This change's spec required the opposite, and the spec is what counts.

Group 6 holds the quality gates, checks that pass or fail:

```bash
./mvnw verify
git ls-files | grep -x '.env'
git grep -nE 'password\s*[:=]\s*[^$ ]' -- src
git diff --stat feat/setup-local-infra/3-archive -- compose.yaml openspec/specs/local-dev-environment
./scripts/verify-local-env.sh
```

`./mvnw verify` passed with 17 tests and no warnings. `.env` isn't tracked. And the comparison with the archived version of the infrastructure showed no difference at all in `compose.yaml` or in the `local-dev-environment` spec, with the previous change's `verify-local-env.sh` still passing. That's my prompt's sentence, "don't redefine the infrastructure", turned into a check that passes or fails.

Task 5.4 stayed open: it "requires manual verification of Swagger UI in a browser, which I can't do". Before committing, it scanned the diff for secrets ("No secrets and no `.env` staged") and recorded the work in two commits: one with the application code and another with the updated OpenSpec artifacts. Keeping them apart makes the history readable for whoever reviews it.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.2-03.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.2-03.mp4" type="video/mp4"></video>
*⏱ Real time: 7 min 05 s (video sped up).*

## The Report: 33 of 34

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.2-04.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.2-04.mp4" type="video/mp4"></video>
*⏱ Real time: 51 s (video sped up).*

The closing report starts with an honest number: **33 of 34 tasks**. That beats a 34 of 34 where one task was checked off without being verified. Then comes what the verification covered (automated tests, manual checks and untouched infrastructure) and the part I consider the most important, "What the implementation corrected in the plan (all recorded in the design)":

| The plan said | What the implementation showed |
|---|---|
| Maybe Spring fails on its own without `POSTGRES_PASSWORD` | It doesn't: the app started. `DatabaseCredentialsCheck` exits with code 1 |
| `hikari.connection-timeout: 3s` | The property is in milliseconds; `3s` broke startup. It became `3000` |
| Only `/actuator/health` exposed | Boot 4.1's defaults exposed the probes and the links page; both were turned off |
| springdoc documents the health endpoint | It generated only the 200; `HealthOpenApiCustomizer` adds the 503 and the schema |
| Mock of `RedisConnectionFactory` | It had to be `LettuceConnectionFactory` because of the reactive auto-configuration |

The third item is the spec protecting the system: without the explicit requirement, nobody would have noticed the two extra endpoints. And the phrase "all recorded in the design" is, for me, the core of SDD. **The specification doesn't have to get everything right; it has to be maintained.** When this change is archived, the design will describe what was actually built, and that's what the next change will read.

In the notes, there was even some self-criticism: the `git grep` from task 6.3 lists 5 lines, none with a literal password, because "the task's regex is broader than its intent". It reports instead of hiding. And it closes with a specific request: open `http://localhost:8080/swagger-ui.html` with the application running and tell it whether `GET /actuator/health` shows up. Or, if I preferred, archive first with the task still open.

## Checking in the Browser

Now I'm the one verifying, outside the agent, as a reviewer would. In the terminal, `java -version` showed OpenJDK 21 and `docker compose ps` the three `healthy` services. My first attempt was `mvn sprint-boot:run`, with a typo and, worse, with `mvn`: the terminal replied "Command 'mvn' not found". There's no Maven installed; the project uses the wrapper:

```bash
./mvnw spring-boot:run
```

In the log, "Started SkyledgerApplication in 12.746 seconds". In the browser, Swagger UI lists `GET /actuator/health` with the summary "Health-check da aplicação", the description written by `HealthOpenApiCustomizer` and the `HealthResponse` schema. I clicked *Execute*: 200, with `db`, `diskSpace`, `ping`, `redis` and `ssl`, all `UP`. I also checked from the terminal, after installing `jq` to format the JSON:

```bash
curl -s localhost:8080/actuator/health | jq .
```

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" },
    "ping": { "status": "UP" },
    "redis": { "status": "UP" },
    "ssl": { "status": "UP" }
  }
}
```

And at `/v3/api-docs`, the raw specification, the 200 and 503 responses both point to `HealthResponse`, with `DEGRADED` in the status list. The OpenAPI rule I wrote in `config.yaml` went through the propose question, became a requirement, became a task, became code, and is now visible in the browser.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.2-05.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.2-05.mp4" type="video/mp4"></video>
*⏱ Real time: 2 min 59 s (video sped up).*

---

# Part 3 — Archive

## Task 5.4, Closed by a Person

Before archiving, I sent the shortest message of the series:

```
abri o navegador e testei o swagger. Funcionou
```

("I opened the browser and tested Swagger. It worked.") I didn't say which task it was or ask for anything to be recorded. Claude already knew 5.4 was the only one open: it checked it off in `tasks.md`, asked OpenSpec for the count (34 of 34) and committed, with my sentence becoming recorded evidence in the message: "Task 5.4 verified by opening /swagger-ui.html in the browser: GET /actuator/health is listed."

There was a nice detail here. The text filter it used to summarize the push output failed and hid the result. Instead of declaring success, it wrote: "The commit was made, but my `grep` filter failed and hid the push result. I'll check the remote directly". And it compared the server's hash with the local one:

```bash
git ls-remote origin refs/heads/feat/bootstrap-project-skeleton/2-apply
git rev-parse HEAD
```

Why not archive with 5.4 open? Because the spec scenario "WHEN I open `/swagger-ui.html` THEN the interface loads and lists the `GET /actuator/health` operation" would be left with nobody having checked it. That scenario depends on a human eye. In SDD, it's not the agent alone that closes the contract: the person signs off on the part only they can verify. It's the difference between "the agent said it works" and "someone checked and it's on record".

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.3-00.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.3-00.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 25 s (video sped up).*

## /opsx:archive and the Sync Question

```
/opsx:archive
```

Just the command, no change name. The autocomplete shows the OpenSpec commands installed in Claude Code (apply, archive, explore, propose, sync and update); there is a separate `/opsx:sync`, but archive does the sync along the way. Claude replied "Using change: bootstrap-project-skeleton", created the `3-archive` branch from `2-apply` and, in a single command, gathered what it needed: the status of the four documents (all `done`), the task count, what already exists in `openspec/specs/` and the delta's requirements.

Then came the same question as in the first archive, now about a different spec:

* **"The application-runtime delta spec is not in the main specs (openspec/specs/) yet. How should I proceed?"**
  * *Sync now (recommended):* creates `openspec/specs/application-runtime/spec.md` with the Purpose and the 7 requirements, verifies it and then archives.
  * *Archive without syncing:* just moves the change to the archive; the capability doesn't make it into the main specs.

I chose **Sync now**, same as the first archive, and the consistency is deliberate. The skeleton was implemented, tested and verified by me; there's no reason to leave the source of truth out of date. The next change, the ANAC data ingestion, will find this spec to reference. "Without sync" makes sense when the change was abandoned, superseded, or still needs review before becoming official behavior. It's like the difference between merging an approved pull request and closing it without merging.

Even with a clearly recommended option, Claude didn't answer for me. Touching the source of truth is my decision.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.3-01.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.3-01.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 05 s (video sped up).*

## Sync, Validation and git mv

"I'll fetch the spec rules and do the sync inline, the same way as the previous change". Inline means it did the sync itself within the archive, with a small Python script: it copied the Purpose from the delta and replaced the `## ADDED Requirements` heading with `## Requirements`, because in the main spec there's no "added" anymore, it's simply what the system does. Then it validated and compared the two:

```bash
openspec validate application-runtime --type spec --strict
```

"Specification 'application-runtime' is valid", with an informational warning: "Requirement text is very long (>500 characters)". The count came out as "7/7 requirements, 16/16 scenarios" (hold on to that 16).

Only after validating did it archive. It built the dated destination, checked that it didn't exist yet (so nothing gets overwritten) and used `git mv`:

```bash
T="openspec/changes/archive/$(date +%F)-bootstrap-project-skeleton" && test ! -e "$T" && git mv openspec/changes/bootstrap-project-skeleton "$T"
```

The order matters: if validation had failed, nothing would have been moved. And `git mv`, instead of copy-and-delete, makes git record the files as renamed, so you can follow each document's history back to the propose.

The final summary:

* change archived in `openspec/changes/archive/2026-09-30-bootstrap-project-skeleton/`, with the `.openspec.yaml` along with it;
* `application-runtime` main spec with 7 requirements and 17 scenarios, identical to the delta, passing `validate --strict`;
* 4 complete artifacts, 34 tasks done and no active change;
* there are now two main specs: `local-dev-environment` (9 requirements) and `application-runtime` (7).

And the correction I asked you to hold on to: "earlier I wrote 16 scenarios, but the right count is 17." I prefer an agent that corrects its own number in public to one that hides it. As for the two long requirements, its suggestion was to split them when a future change touches them, not now, in a spec that was just approved. It's logged as technical debt.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.3-02.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.3-02.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 15 s (video sped up).*

## What Gets Archived

To wrap up, I opened the archived folder in the VS Code explorer. In `openspec/changes/archive/` are the two completed changes, each with the date in front of its name, which keeps the history in order.

The archived `design.md` is not the one from propose: it was updated with what apply learned. For example (translated):

> `hikari.connection-timeout` is bound to a `long` in milliseconds: `3s` fails at startup (verified during apply). That's why the value is `3000`.

And the rejected alternatives stay on record, like the local profile with a default password, "discarded for putting a credential in a versioned file". Six months from now, whoever asks "why is the timeout 3000?" or "why isn't there a local profile with a password?" finds the answer here, not in someone's memory.

I also went through D6's testing-strategy table, the proposal's *Impact* (hold on to "No table or migration is created": it comes back when the project needs its first tables), group 4 of `tasks.md`, where 4.4 says "loading in the browser is left for 5.4", and the delta spec, with its `SHALL`, `MUST` and `SHALL NOT` and the failure scenario "PostgreSQL down at startup and later recovered".

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.3-03.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.3-03.mp4" type="video/mp4"></video>
*⏱ Real time: 1 min 19 s.*

---

# Reproducing It

If you cloned the repository and want to see the result of this change running:

```bash
git clone https://github.com/vcasadei/skyledger-br.git
cd skyledger-br
git checkout feat/bootstrap-project-skeleton/3-archive
java -version                   # must be 21
cp .env.example .env            # the app requires POSTGRES_PASSWORD
docker compose up -d --wait     # PostgreSQL, Redis and SeaweedFS
./mvnw verify                   # 17 tests; requires Docker running
./mvnw spring-boot:run          # always from the repository root
curl -s localhost:8080/actuator/health
```

Then open `http://localhost:8080/swagger-ui.html`. To see the degraded behavior, run with `REDIS_PORT=6390 ./mvnw spring-boot:run`: health stays at 200, with `redis` as `DEGRADED`. And to see how the plan evolved, compare the `design.md` on the `1-propose` branch with the archived one on `3-archive`.

---

# What I Take From This Change

* **Changes build on changes.** The first change's spec became input for the second. "Reference, don't redefine" started as a sentence in the prompt and ended as an empty `git diff` in a quality gate.
* **The agent asks about decisions and investigates facts.** Library versions it checked on Maven Central; health-check shape, new dependency, toolchain and package it handed back to me. Its yardstick, "affects the contract or the dependencies", is a good one to use during review.
* **Layered rules work.** `config.yaml` says what the project requires; the schema says how the agent behaves. When the two met, on the springdoc dependency, the result was a question, not a silent decision.
* **The plan is wrong sometimes, and that's fine.** Five points in the design were wrong or incomplete. All were discovered through an experiment or a test, fixed in the code and recorded in the design. A good specification isn't one that gets everything right; it's one that is maintained.
* **Humans close what only humans can verify.** 33 of 34 with one open, explained task is worth more than 34 of 34 with one checked off blindly.

In the next post, SkyLedger gets its first business feature: ingesting ANAC's real flight data, and with it the first database tables.

**Series navigation:** ← [Part 2: SkyLedger BR and the Local Infrastructure](/2026/10/18/sdd-openspec-2-skyledger-local-infra.html) · [Part 4: Ingesting ANAC's Open Data into SkyLedger](/2026/10/21/sdd-openspec-4-skyledger-anac-ingestion.html) →

---

# References

* **Spec-Driven Development**
  * [OpenSpec](https://github.com/Fission-AI/OpenSpec) · [Documentation](https://openspec.dev/docs)
  * [openspec-casadei](https://github.com/vcasadei/openspec-casadei), my public schema for OpenSpec
* **The project**
  * [skyledger-br](https://github.com/vcasadei/skyledger-br) (the `main` branch has the final state)
  * This change's branches: [`1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/bootstrap-project-skeleton/1-propose) · [`2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/bootstrap-project-skeleton/2-apply) · [`3-archive`](https://github.com/vcasadei/skyledger-br/tree/feat/bootstrap-project-skeleton/3-archive)
  * [anac-data](https://github.com/vcasadei/anac-data), the source data that comes in with the next change
* **Technologies**
  * [Spring Boot](https://spring.io/projects/spring-boot) · [Spring Boot Actuator: endpoints and health](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html)
  * [Docker Compose support in Spring Boot](https://docs.spring.io/spring-boot/reference/features/dev-services.html)
  * [springdoc-openapi](https://springdoc.org/) · [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
  * [Maven Wrapper](https://maven.apache.org/tools/wrapper/) · [Maven Enforcer: requireJavaVersion](https://maven.apache.org/enforcer/enforcer-rules/requireJavaVersion.html)
  * [HikariCP](https://github.com/brettwooldridge/HikariCP) · [Lettuce](https://lettuce.io/)
  * [Eclipse Temurin](https://adoptium.net/) · [Docker Compose](https://docs.docker.com/compose/)
* **Other posts**
  * [Spec-Driven Development with opencode and InkStone's Free Models](/2026/10/15/sdd-opencode-inkstone-free-models.html)

---

If you're following the series and rebuilding SkyLedger, tell me on LinkedIn ([linkedin.com/in/vcasadei](https://linkedin.com/in/vcasadei)) how your skeleton went, or check out other projects and writing at [vcasadei.com](https://vcasadei.com).

<style>
.article__content pre, .article__content pre code{white-space:pre-wrap !important;word-wrap:break-word;overflow-wrap:anywhere}
.article__content div.highlight, .article__content pre{overflow-x:visible !important}
</style>
