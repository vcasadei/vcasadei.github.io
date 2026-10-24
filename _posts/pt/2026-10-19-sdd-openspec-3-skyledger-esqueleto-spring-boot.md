---
layout: article
title: "SDD com OpenSpec, parte 3: o esqueleto Spring Boot do SkyLedger"
date: 2026-10-19 11:00:00 -0300
key: sdd-openspec-3-skyledger-esqueleto-spring-boot
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

A segunda change do SkyLedger BR: um esqueleto Spring Boot que se apoia na infraestrutura já especificada, em vez de reinventá-la.

<!--more-->

Este é o terceiro post de uma **série para ensinar Spec-Driven Development (SDD) com o [OpenSpec](https://github.com/Fission-AI/OpenSpec)**, do zero, construindo um projeto de verdade: o SkyLedger BR, que vai ler os dados abertos de voos da ANAC e expor uma API de consulta.

**A série:**

1. [SDD com OpenSpec, parte 1: OpenSpec, schema casadei e Claude Code](/pt/2026/10/16/sdd-openspec-1-openspec-schema-casadei.html)
2. [SDD com OpenSpec, parte 2: SkyLedger BR e a infraestrutura local](/pt/2026/10/18/sdd-openspec-2-skyledger-infra-local.html)
3. **SDD com OpenSpec, parte 3: o esqueleto Spring Boot do SkyLedger** (você está aqui)
4. [SDD com OpenSpec, parte 4: ingestão dos dados abertos da ANAC no SkyLedger](/pt/2026/10/21/sdd-openspec-4-skyledger-ingestao-anac.html)
5. [SDD com OpenSpec, parte 5: a API de consulta de voos do SkyLedger](/pt/2026/10/23/sdd-openspec-5-skyledger-api-de-consulta.html)

No post anterior, a primeira change do projeto, a `setup-local-infra`, foi proposta, implementada e arquivada. Ela deixou duas coisas que importam agora: o `compose.yaml` com PostgreSQL, Redis e SeaweedFS, e o spec `local-dev-environment`, com 9 requisitos, guardado em `openspec/specs/`. Esse spec é a descrição oficial de como o ambiente local funciona hoje.

Agora vem a segunda change, a `bootstrap-project-skeleton`: o esqueleto da aplicação Spring Boot que vai se conectar a essa infraestrutura. A classe principal, um health-check, a configuração de banco e cache e a documentação da API. Parece pouco, e é de propósito. O que eu quero mostrar aqui é o histórico jogando a nosso favor: pela primeira vez já existe uma spec arquivada, e o agente vai **ler o que foi decidido e referenciar**, em vez de redefinir portas e credenciais do zero.

![A change setup-local-infra, arquivada, gerou o spec local-dev-environment (9 requisitos); a bootstrap-project-skeleton o referencia e, ao ser arquivada, gera o spec application-runtime (7 requisitos), que a próxima change, a ingestão da ANAC, vai ler](/assets/images/sdd-openspec-3/changes-encadeadas-pt.webp)

Como no resto da série, uso o Claude Code com o meu schema [openspec-casadei](https://github.com/vcasadei/openspec-casadei) (se você ainda não tem o ambiente montado, comece pela [parte 1](/pt/2026/10/16/sdd-openspec-1-openspec-schema-casadei.html); se quiser praticar sem custo, o [post sobre opencode e modelos gratuitos](/pt/2026/10/15/sdd-opencode-modelos-gratuitos-inkstone.html) mostra o mesmo fluxo com outra ferramenta). Eu gravei as três fases. **Os vídeos estão acelerados nas esperas**, então não se assuste com a velocidade dos comandos passando.

Desta vez não teve `/opsx:explore`: o que precisava ser discutido sobre o esqueleto já tinha saído da conversa inicial sobre o projeto inteiro. O ciclo é o de sempre:

<style>
.sdd-wrap{white-space:pre-wrap !important;word-break:break-word;overflow:visible !important;max-height:none !important}
</style>

![Ciclo da change em cinco passos: /opsx:propose gera proposta, delta spec, design e tasks; você revisa as decisões e incertezas; /opsx:apply implementa, verifica e corrige o plano; você fecha a task que só um humano confere; /opsx:archive transforma o delta em spec principal](/assets/images/sdd-openspec-3/ciclo-change-pt.webp)

Cada fase tem uma branch pública no repositório, para você comparar ou fazer checkout:

* Propose: [`feat/bootstrap-project-skeleton/1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/bootstrap-project-skeleton/1-propose)
* Apply: [`feat/bootstrap-project-skeleton/2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/bootstrap-project-skeleton/2-apply)
* Archive: [`feat/bootstrap-project-skeleton/3-archive`](https://github.com/vcasadei/skyledger-br/tree/feat/bootstrap-project-skeleton/3-archive)

---

# Parte 1 — Propose

## O pedido

Este é o texto que eu enviei, exatamente como saiu, com os erros de digitação ("sirva com ponto", "primcipal", o espaço duplo em "Spring  Boot"):

<div class="language-plaintext highlighter-rouge"><div class="highlight"><pre class="highlight sdd-wrap"><code>/opsx:propose bootstrap-project-skeleton

Preciso agora do esqueleto de uma aplicação Spring  Boot (Maven, Java 21) que sirva com ponto de partida do projeto: a classe primcipal, um endpoint de health-check simples, e configuração de conexão com o Postgres e Redis que já foram definidos anteriormente - não redefina a infraestrutura, referencie o que já existe</code></pre></div></div>

Deixei assim de propósito: o prompt não precisa ser perfeito. O que precisa ser claro é a intenção e as restrições. Três pontos nesse texto:

* **O nome da change vem colado ao comando:** `bootstrap-project-skeleton`. É ele que vira a pasta em `openspec/changes/`.
* **O escopo é pequeno e explícito:** classe principal, um health-check simples e a conexão com Postgres e Redis. O que não foi pedido (JPA, Flyway, segurança) deve ficar de fora, e vamos conferir isso no resumo.
* **A frase mais importante é a última:** "não redefina a infraestrutura, referencie o que já existe". O `compose.yaml` e o spec `local-dev-environment` já são a fonte de verdade de portas, usuário e senha. Se o agente reinventar esses valores, nasce uma segunda verdade, que mais cedo ou mais tarde vai divergir da primeira.

E teve uma coisa que eu **não** escrevi: que o JDK 21 e o Maven estavam instalados. Eu omiti de propósito, e de fato não havia JDK na máquina. Daqui a pouco o Claude pergunta exatamente sobre isso.

Um detalhe que aparece logo no começo da gravação: a linha cinza "Idle 11h 40m. The prompt cache has likely expired". Eu retomei a sessão no dia seguinte ao archive da primeira change, e a mensagem seguinte recarregou cerca de 179 mil tokens de contexto. Sessões longas têm esse custo, e vale saber que ele existe.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.1-00.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.1-00.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 50 s (vídeo acelerado).*

## Investigar antes de propor

Antes de escrever qualquer documento, o Claude olhou o repositório. A primeira frase dele foi "Vou começar pelo estado do repositório. A branch de propose precisa partir de onde a infraestrutura já existe." Isso é importante: como a primeira change ainda não tinha ido para o `main`, ele criou a branch `1-propose` a partir da `feat/setup-local-infra/3-archive`, a única que tinha o `compose.yaml` e o spec que eu pedi para referenciar.

Depois, num comando só, ele carregou o contexto do OpenSpec e conferiu o ambiente:

```bash
openspec context --json
openspec list --json
openspec list --specs
openspec show local-dev-environment --type spec
which java mvn
```

O `openspec context` devolve o contexto do projeto, o `openspec list` mostra se há outra change em andamento e o `openspec show local-dev-environment` traz o spec que ele vai referenciar. O resultado da última verificação veio na mensagem dele: "Encontrei um bloqueio de toolchain: não há `java` nem `mvn` no host." Em vez de resolver sozinho, ele foi conferir as versões das bibliotecas, "porque elas decidem o que dá para propor".

E aqui está um comportamento que eu gosto muito: **em vez de escolher versões de memória, ele consultou o Maven Central**. Spring Boot, springdoc (a biblioteca que gera a documentação OpenAPI) e Maven Wrapper. A versão mais recente publicada do Spring Boot era a 4.2.0-M2, uma pré-versão (milestone). Ele ficou na linha 4.1, estável, que é a que o nosso `openspec/config.yaml` declara: "Confirmei que o Spring Boot 4.1.1 já existe e o springdoc 3.x tem suporte para ele." E fechou com a régua que usa para decidir quando perguntar: "Antes de codificar, vou perguntar quatro decisões relacionadas que afetam o contrato ou as dependências."

Quem já recebeu de um assistente de código uma versão de biblioteca que não existia sabe o valor disso.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.1-01.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.1-01.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 19 s (vídeo acelerado).*

## As quatro perguntas

O Claude abriu um questionário com quatro abas: Health, OpenAPI, Toolchain e Pacote. Três vieram com uma opção recomendada; a quarta, não.

**1. Health: como deve ser o endpoint de health-check, e o que ele reporta sobre Postgres e Redis?**

* *Actuator, Redis não derruba (recomendada):* `GET /actuator/health`, do Spring Boot Actuator. Postgres fora resulta em `DOWN` e 503; o Redis aparece como componente, mas não derruba o status geral.
* *Actuator, ambos derrubam:* mais simples, mas, nas palavras dele, "Redis indisponível tira a app do ar para orquestradores".
* *Endpoint próprio simples:* `{"status":"UP"}` sempre que a aplicação responde, sem checar dependência nenhuma.

Fiquei com a recomendada. No SkyLedger o Redis é só cache: sem ele a aplicação fica mais lenta, mas funciona. Sem Postgres, não funciona. Um cache fora do ar não pode virar uma queda do sistema, e um health-check que responde `UP` com o banco fora não serve para monitoramento.

![Contrato do health-check: GET /actuator/health agrega os componentes db e redis; PostgreSQL fora do ar resulta em DOWN e HTTP 503; Redis fora do ar aparece como DEGRADED e o status geral continua UP com HTTP 200](/assets/images/sdd-openspec-3/health-check-pt.webp)

**2. OpenAPI: "A convenção exige OpenAPI em todo endpoint REST público, o que pede uma dependência nova (springdoc-openapi 3.x). Aprova incluí-la já nesta mudança?"**

Esta pergunta é o melhor exemplo de regras em camadas. O `config.yaml` do projeto diz o que o projeto exige:

```yaml
  Convenções do projeto:
  ...
  - Todo endpoint REST público tem documentação OpenAPI.
```

E o schema casadei diz como o agente deve se comportar: nenhuma dependência nova sem aprovação explícita. Quando as duas regras se encontraram, o Claude perguntou. Respondi "Sim, springdoc agora". Regra que começa com exceção perde força, e documentação de contrato desde o primeiro endpoint é rastreabilidade de graça.

**3. Toolchain: "Esta máquina não tem JDK nem Maven. Como o build (`./mvnw verify`) deve rodar?"**

As opções eram instalar um JDK 21 local (recomendada) ou rodar o build num container `eclipse-temurin:21`. A opção Docker já vinha com o próprio custo descrito: "exige um script/alias e deixa a IDE sem JDK". Escolhi instalar o JDK 21. Para trabalho interativo, a velocidade do ciclo editar-compilar-testar pesa mais, e a reprodutibilidade continua garantida pelo Maven Wrapper e pela versão fixada no `pom.xml`.

**4. Pacote: qual groupId e pacote base Java usar?**

Esta veio sem recomendação: o Claude não tinha base para escolher, e deixou as opções no mesmo nível. Escolhi **`br.com.skyledger`**, o nome próprio do produto, independente de quem o mantém. Pacote Java é caro de trocar depois, então vale decidir agora.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.1-02.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.1-02.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 06 s (vídeo acelerado).*

Cada uma dessas respostas vai aparecer nos documentos e no resumo final. E elas voltam a pesar no apply: quando faltar o JDK lá, o Claude vai lembrar que a opção Docker foi descartada aqui.

## Os artefatos e a validação

Com as respostas, o Claude criou a change e escreveu os documentos na ordem que o schema exige: primeiro a proposta, depois o spec e o design, por último as tasks. O padrão que se repete é o mais interessante: **antes de cada arquivo, ele pergunta ao próprio OpenSpec onde gravar e quais regras valem**.

```bash
openspec new change "bootstrap-project-skeleton"
openspec status --change bootstrap-project-skeleton --json
openspec instructions proposal --change bootstrap-project-skeleton --json
openspec instructions specs --change bootstrap-project-skeleton --json
openspec instructions design --change bootstrap-project-skeleton --json
openspec instructions tasks --change bootstrap-project-skeleton --json
openspec validate bootstrap-project-skeleton --strict
```

O `openspec status` mostra o grafo de documentos: no início, a proposta está pronta para ser escrita e spec, design e tasks estão bloqueados esperando por ela. O `openspec instructions` devolve o caminho do arquivo, o modelo do schema casadei e as regras do nosso `config.yaml` para aquele documento. É assim que as convenções do projeto chegam ao texto gerado sem que eu precise repeti-las no prompt.

No meio do caminho, mais duas verificações contra o Maven Central: se cada módulo do Spring Boot 4.1.1 que ele pretendia usar existia, e a compatibilidade do springdoc. Os achados: "O springdoc 3.1.1 foi compilado contra o Boot 4.1.0, então é compatível. O `starter-web` está depreciado em favor do `starter-webmvc`, e uso este."

Antes de escrever o design, ele anotou três armadilhas que viraram decisões: o timeout padrão do Hikari (o pool de conexões) travaria o health-check em quedas do banco; o Spring pode aceitar um placeholder de senha não resolvido como texto literal; e, nos testes, o service connection do Docker Compose sobrescreve as propriedades de conexão. São problemas de operação, não de código, do tipo que normalmente só aparece em produção ou no pipeline.

O `openspec validate --strict` passou: "Change 'bootstrap-project-skeleton' is valid". Mesmo assim, ele percebeu um problema: "Na task 6.4 ficou um `<base>` genérico." Uma task com um marcador desses não é verificável, e justo essa é a task que prova que a infraestrutura não mudou. Ele trocou o marcador pela branch real e validou de novo:

```bash
sed -i 's|git diff --stat <base> -- compose.yaml|git diff --stat feat/setup-local-infra/3-archive -- compose.yaml|' openspec/changes/bootstrap-project-skeleton/tasks.md
openspec validate bootstrap-project-skeleton --strict
```

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.1-03.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.1-03.mp4" type="video/mp4"></video>
*⏱ Tempo real: 5 min 17 s (vídeo acelerado).*

### O que ficou escrito

A **proposta** começa pelo porquê:

> O ambiente local (PostgreSQL, Redis e SeaweedFS, capability `local-dev-environment`) já existe, mas ainda não há aplicação que o use. As próximas mudanças (ingestão da ANAC, analytics com cache) precisam de um ponto de partida comum [...]. Sem isso, cada mudança teria que montar a base por conta própria.

E o "referencie o que já existe" aparece literalmente no *What Changes*:

> - Configura a conexão com o PostgreSQL e o Redis **do ambiente local já existente**, sem redefinir nenhuma infraestrutura:
>   - os padrões de host, porta, banco e usuário apontam para os serviços do `compose.yaml` e podem ser sobrescritos por variável de ambiente;
>   - a senha do PostgreSQL não tem valor padrão no código. Ela vem de `POSTGRES_PASSWORD`, a mesma variável que o `compose.yaml` usa, lida do ambiente ou do `.env` local.

A seção *Impact*, no formato do casadei, lista os endpoints públicos (por causa de uma regra do `config.yaml`), as dependências e o que a mudança **não** toca. Gosto em especial destas duas linhas:

> - **PostgreSQL / esquema de banco**: só a conexão (pool). Nenhuma tabela nem migração é criada.
> - **Dados pessoais (LGPD), filas, valores monetários, anac-data**: não se aplica.

O **delta spec** cria uma capability nova, a `application-runtime`, com 7 requisitos: build reproduzível, conexão com PostgreSQL, conexão com Redis, inicialização independente das dependências, health-check, documentação OpenAPI e credenciais fora dos logs. O requisito de health-check traz o contrato em tabela:

| `db` | `redis` | `status` geral | HTTP |
|------|---------|----------------|------|
| `UP` | `UP` | `UP` | 200 |
| `UP` | `DEGRADED` | `UP` | 200 |
| `DOWN` | qualquer | `DOWN` | 503 |


Repare que o contrato também especifica 404 para outros endpoints do Actuator e 405 para métodos diferentes de `GET`, embora eu só tenha pedido "um health-check simples". É a regra do `config.yaml` que exige o contrato completo de todo endpoint REST público, com códigos de erro, agindo sem que eu precise pedir. E cada cenário segue o formato do casadei, com `AS A` e pelo menos um caminho de falha:

```markdown
#### Scenario: Senha ausente
- **AS A** desenvolvedor sem `.env` e sem `POSTGRES_PASSWORD` no ambiente
- **WHEN** inicio a aplicação
- **THEN** a inicialização falha com código de saída diferente de zero
- **AND** a mensagem de erro cita `POSTGRES_PASSWORD`
```

O **design** tem 9 decisões (D1 a D9) e uma tabela de estratégia de testes. As **tasks** são 34, em 6 grupos: projeto Maven, configuração de conexão, health-check, OpenAPI, verificação manual e quality gates. Um exemplo de task, com o comando de verificação embutido:

```markdown
- [ ] 2.1 Criar `src/main/resources/application.yaml` com o import de `.env`, datasource, Redis e timeouts da D3, sem nenhum valor de senha. Verificar com `grep -n password src/main/resources/application.yaml`, que deve mostrar só `${POSTGRES_PASSWORD}`
```

## O resumo para revisão

O fim do propose é um resumo pensado para revisão humana, com a mesma estrutura de uma boa revisão de código: o que foi feito, o que veio de mim, o que o agente decidiu sozinho e o que ainda é incerto.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.1-04.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.1-04.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 16 s (vídeo acelerado).*

A parte que mais merece leitura com calma é "Decisões que tomei e que valem sua revisão":

* **Sem senha no código.** A aplicação lê o mesmo `POSTGRES_PASSWORD` do Compose, do ambiente ou do `.env`. Sem ele, falha na inicialização. É consequência direta do "referencie o que já existe": uma fonte só.
* **Timeouts curtos de conexão** (3s no Hikari, 2s no Redis). Com os padrões, o health-check travaria de 30 a 60 segundos quando uma dependência cai.
* **Os testes de integração usam o `spring-boot-docker-compose`** com o `compose.yaml` existente. Consequência: `./mvnw verify` exige Docker em execução, o que afeta quem roda o build e onde, inclusive no pipeline.
* **Ficaram fora:** JPA, Flyway, Spring Security e ferramentas de cobertura e lint. As duas últimas seriam dependências não aprovadas, então o gate de análise estática virou o próprio compilador com `-Xlint:all -Werror`: qualquer aviso vira erro.

E, por fim, "Dois pontos para confirmar no apply": o nome da classe do indicador de Redis no Boot 4.1, que agora é modularizado, e se o Spring já falha sozinho quando falta o `POSTGRES_PASSWORD`, o que tornaria dispensável o bean de validação da D4.

Um agente que declara a própria incerteza é muito mais fácil de revisar do que um que entrega tudo com o mesmo tom de certeza. Cada item dessa lista é algo que dá para aceitar, recusar ou ajustar antes de gastar tempo de implementação.

Um detalhe para os mais atentos: o resumo fala em "6 grupos com 30 tasks", mas o `tasks.md` tem 34, e é esse número que o OpenSpec mostra no apply. Não investiguei a diferença na hora. A fonte de verdade é o próprio arquivo, não o resumo.

---

# Parte 2 — Apply

O apply começa com um comando sem argumentos:

```
/opsx:apply
```

O Claude escolheu sozinho a única change ativa ("Using change: bootstrap-project-skeleton"), criou a branch `2-apply` a partir da `1-propose` e foi direto para a tarefa 1.1, que é justamente confirmar o JDK 21.

## Bloqueado na tarefa 1.1

Um único comando procurou um JDK de todas as formas: `java` no PATH, `JAVA_HOME`, a pasta padrão `/usr/lib/jvm` e uma instalação via SDKMAN. Nada. A resposta foi um "Implementação pausada", com progresso 0 de 34:

> A task 1.1 falha: não existe JDK nesta máquina. [...] Sem um JDK 21, nenhuma task a partir da 1.2 pode ser verificada. Nem o `./mvnw` roda, porque o wrapper baixa o Maven mas precisa de um JDK.

E as opções, escritas em texto:

1. **Eu instalo pelo apt** (`sudo apt install openjdk-21-jdk`): "Precisa de `sudo`, que eu não tenho. É o caminho que combinamos no propose, e a IDE também passa a enxergar o JDK."
2. **O Claude instala um Eclipse Temurin 21 só no meu usuário, sem sudo:** mais rápido, mas "é um software instalado na sua máquina por mim, então preciso do seu ok explícito".
3. **Build via Docker:** "você descartou essa opção no propose. Escolhê-la agora exigiria atualizar o design e as tasks."

Duas coisas me chamam a atenção. O agente conhece o próprio limite de permissão e não tenta contorná-lo. E ele trata o propose como um acordo: não apresenta o Docker como ideia nova, lembra que ela foi descartada e diz o custo de reabri-la.

No terminal integrado, conferi a infraestrutura (que eu tinha subido logo antes, porque é pré-condição do apply) e instalei o JDK:

```bash
docker compose ps
sudo apt install openjdk-21-jdk
```

O `docker compose ps` mostrou postgres 16.15, redis 8.10 e seaweedfs, todos `healthy` e com as portas expostas só em `127.0.0.1`. Depois, respondi só "1, java instalado". Curto, porque a decisão já estava tomada.

Parar na tarefa 1.1 custou dois minutos. Seguir sem JDK teria produzido dezenas de arquivos que ninguém compilou.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.2-00.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.2-00.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 22 s (vídeo acelerado).*

## Grupos 1 e 2: build e configuração

Com o JDK instalado, o trabalho de verdade começa, sempre no mesmo ritmo: implementa, verifica, marca. Primeiro ele conferiu a minha resposta com `java -version` e `javac -version`. Sem Maven na máquina, consultou o repositório oficial para achar a versão 3.9 mais recente e escreveu que "o mais canônico é gerar o wrapper com o próprio plugin": baixou o Maven 3.9.16 numa pasta temporária, **conferiu o checksum SHA-512** e só então usou para gerar o Maven Wrapper 3.3.4. Daí em diante, tudo roda pelo `./mvnw`.

O `pom.xml` usa o `spring-boot-starter-parent` 4.1.1 e o `maven-enforcer-plugin` exigindo Java 21. A classe principal, `br.com.skyledger.SkyledgerApplication`, foi conferida no manifesto do JAR (`Start-Class`). A tarefa 1.5 é o caminho negativo, e é um bom exemplo de Docker como ferramenta de teste, não como forma de build:

```bash
docker run --rm -v "$PWD":/w -w /w eclipse-temurin:17 ./mvnw -q validate
```

Com JDK 17, o build falha no enforcer, antes de compilar, pedindo Java 21. O grupo 1 fechou com a documentação inicial em `docs/aplicacao.md`, porque o schema casadei exige documentação dentro de cada grupo, não no fim.

O grupo 2 começou pelo `application.yaml`, com a senha sem valor padrão. Aqui o apply encontrou **o primeiro erro do próprio plano**. Para responder à dúvida do propose ("o Spring falha sozinho sem a senha?"), ele subiu a aplicação sem a variável. E escreveu: "O teste revelou outro problema, antes da senha". A propriedade `hikari.connection-timeout` só aceita milissegundos: o `3s` do design quebrava a inicialização. Virou `3000`, e ele repetiu o experimento.

O segundo achado respondeu à dúvida: **a aplicação inicia normalmente sem a senha**, com o placeholder `${POSTGRES_PASSWORD}` mantido como texto literal. Ou seja, o bean de validação da D4 era necessário. Antes de escrevê-lo, ele inspecionou as próprias bibliotecas do Spring Boot com `javap` para achar os nomes exatos das classes. O resultado é pequeno e direto:

```java
public DatabaseCredentialsCheck(JdbcConnectionDetails connectionDetails) {
    String password = connectionDetails.getPassword();
    if (password == null || password.isBlank() || password.startsWith("${")) {
        throw new IllegalStateException(MISSING_PASSWORD_MESSAGE);
    }
}
```

Sem senha, a inicialização termina com código 1 e a mensagem "POSTGRES_PASSWORD não definida: exporte a variável ou crie o .env a partir de .env.example".

Depois vieram os testes do grupo 2, e um deles falhou: justamente o de senha fora dos logs. A reação dele foi a que eu quero de qualquer pessoa no time: antes de mexer no teste, ele precisava saber "se a senha realmente vazou". Não tinha vazado. O problema era o texto que o teste esperava no log para saber que a aplicação tinha subido. Ele trocou o marcador e os 4 testes passaram. Por fim, atualizou o `.env.example`, a documentação e **a nota da D4 no design**.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.2-01.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.2-01.mp4" type="video/mp4"></video>
*⏱ Tempo real: 8 min 38 s (vídeo acelerado).*

## Grupos 3 e 4: health-check e OpenAPI

O grupo 3 é o centro da change. A configuração do Actuator ficou assim no design (D5):

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

O `probes.enabled: false` não estava no plano: no Boot 4.1 as probes de liveness e readiness vêm ativas por padrão e exporiam `/actuator/health/liveness` e `/readiness`, contrariando o requisito de expor só `/actuator/health`. Ele desligou e registrou o motivo no design.

O `RedisDegradableHealthIndicator` reaproveita o indicador de Redis do próprio Spring Boot (cujo nome real, `DataRedisHealthIndicator`, fechou a outra incerteza do propose) e só troca `DOWN` por `DEGRADED`:

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

Como `DEGRADED` vem depois de `UP` no `status.order`, a agregação resulta em `UP`, e como `DEGRADED` não está no mapeamento para 503, a resposta é 200.

Os testes de integração tiveram as falhas mais instrutivas do apply:

* **"No default constructor found":** com dois construtores (um para injeção, outro para o teste unitário), o Spring não sabia qual usar. A correção foi marcar o construtor público com `@Autowired`.
* **Redis indisponível:** ele disse "vou à causa raiz". O mock de `RedisConnectionFactory` não atendia a uma segunda interface que a auto-configuração reativa do Redis exige. A correção foi mockar o `LettuceConnectionFactory`, a classe concreta que a aplicação usa de verdade, e documentar o motivo no próprio teste e no design.

Em nenhum momento ele apagou um teste ou afrouxou uma verificação para ficar verde. Teste vermelho é informação.

No grupo 4, OpenAPI, apareceu a diferença entre ter a biblioteca no projeto e cumprir a regra. Com `springdoc.show-actuator: true`, o health entra na especificação, mas "só a resposta 200 aparece, sem schema de corpo". A regra pede os códigos de erro documentados, então ele criou o `HealthOpenApiCustomizer`, com resumo, respostas 200 e 503 e o schema `HealthResponse`. Ainda achou outro desvio: a página de links em `/actuator` estava exposta. Desligou com `discovery.enabled: false` e criou um teste que espera 404 nela.

E o `-Werror` mostrou serviço: o compilador pegou uma chamada sem tipo no customizer. Ele corrigiu montando o schema numa variável tipada, em vez de suprimir o aviso. "Os 17 testes passaram."

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.2-02.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.2-02.mp4" type="video/mp4"></video>
*⏱ Tempo real: 10 min 40 s (vídeo acelerado).*

## Grupos 5 e 6: verificações manuais e gates

O grupo 5 são verificações manuais descritas no próprio `tasks.md`, e o Claude executou as que conseguia executar sozinho, com a aplicação rodando via `./mvnw spring-boot:run`:

```bash
POSTGRES_PASSWORD=errada ./mvnw spring-boot:run   # 503, db DOWN
docker compose stop postgres                      # sobe a app: 503
docker compose start postgres                     # volta a 200 sem reiniciar
REDIS_PORT=6390 ./mvnw spring-boot:run            # 200, redis DEGRADED
```

"Confirmei que senha errada, PostgreSQL indisponível e Redis em porta errada geraram os comportamentos esperados (503, 503→200, 200 com DEGRADED)". O 503→200 é o requisito "Inicialização independente da disponibilidade das dependências": com o PostgreSQL fora, a aplicação sobe e responde 503, e volta a 200 sem reiniciar quando o banco volta. O meu roteiro original dizia que o Spring nem subiria sem PostgreSQL. O spec desta change exigiu o contrário, e é o spec que vale.

O grupo 6 são os quality gates, checagens que passam ou falham:

```bash
./mvnw verify
git ls-files | grep -x '.env'
git grep -nE 'password\s*[:=]\s*[^$ ]' -- src
git diff --stat feat/setup-local-infra/3-archive -- compose.yaml openspec/specs/local-dev-environment
./scripts/verify-local-env.sh
```

`./mvnw verify` passou com 17 testes e sem warnings. O `.env` não é rastreado. E a comparação com a versão arquivada da infraestrutura não mostrou diferença nenhuma no `compose.yaml` nem no spec `local-dev-environment`, com o `verify-local-env.sh` da change anterior passando. É a frase do meu prompt, "não redefina a infraestrutura", virando uma verificação que passa ou falha.

A tarefa 5.4 ficou aberta: "exige verificação manual do Swagger UI num navegador, o que não posso fazer". Antes do commit, ele varreu o diff em busca de segredos ("Nenhum segredo e nenhum `.env` no stage") e registrou o trabalho em dois commits: um com o código da aplicação e outro com os artefatos do OpenSpec atualizados. Separar os dois deixa o histórico legível para quem revisar.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.2-03.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.2-03.mp4" type="video/mp4"></video>
*⏱ Tempo real: 7 min 05 s (vídeo acelerado).*

## O relatório: 33 de 34

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.2-04.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.2-04.mp4" type="video/mp4"></video>
*⏱ Tempo real: 51 s (vídeo acelerado).*

O relatório de fechamento começa com um número honesto: **33 de 34 tasks**. É melhor do que um 34 de 34 em que uma tarefa foi marcada sem ser verificada. Depois vem o que a verificação cobriu (testes automatizados, verificações manuais e infraestrutura intacta) e a parte que eu considero a mais importante, "O que a implementação corrigiu no plano (tudo registrado no design)":

| O plano dizia | O que a implementação mostrou |
|---|---|
| Talvez o Spring falhe sozinho sem `POSTGRES_PASSWORD` | Não falha: a aplicação subia. O `DatabaseCredentialsCheck` encerra com código 1 |
| `hikari.connection-timeout: 3s` | A propriedade é em milissegundos; `3s` quebrava a inicialização. Ficou `3000` |
| Só `/actuator/health` exposto | O padrão do Boot 4.1 expunha probes e a página de links; foram desligadas |
| springdoc documenta o health | Gerava só a 200; o `HealthOpenApiCustomizer` acrescenta a 503 e o schema |
| Mock de `RedisConnectionFactory` | Precisou ser o `LettuceConnectionFactory` por causa da auto-configuração reativa |

O terceiro item é o spec protegendo o sistema: sem o requisito explícito, ninguém teria notado os dois endpoints a mais. E a frase "tudo registrado no design" é o ponto central do SDD para mim. **A especificação não precisa acertar tudo, precisa ser mantida.** Quando esta change for arquivada, o design vai descrever o que foi de fato construído, e é isso que a próxima change vai ler.

Nas notas, ainda uma autocrítica: o `git grep` da tarefa 6.3 lista 5 linhas, nenhuma com senha literal, porque "o regex da task é mais amplo que a intenção dela". Ele reporta em vez de esconder. E fecha com um pedido específico: abrir `http://localhost:8080/swagger-ui.html` com a aplicação rodando e dizer se `GET /actuator/health` aparece. Ou, se eu preferisse, arquivar antes com a tarefa em aberto.

## Conferindo no navegador

Agora quem verifica sou eu, fora do agente, como um revisor faria. No terminal, `java -version` mostrou o OpenJDK 21 e o `docker compose ps` os três serviços `healthy`. Minha primeira tentativa foi `mvn sprint-boot:run`, com erro de digitação e, pior, com `mvn`: o terminal respondeu "Command 'mvn' not found". Não existe Maven instalado; o projeto usa o wrapper:

```bash
./mvnw spring-boot:run
```

No log, "Started SkyledgerApplication in 12.746 seconds". No navegador, o Swagger UI lista `GET /actuator/health` com o resumo "Health-check da aplicação", a descrição escrita pelo `HealthOpenApiCustomizer` e o schema `HealthResponse`. Cliquei em *Execute*: 200, com `db`, `diskSpace`, `ping`, `redis` e `ssl`, todos `UP`. Conferi também pelo terminal, depois de instalar o `jq` para formatar o JSON:

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

E em `/v3/api-docs`, a especificação crua, as respostas 200 e 503 apontando para `HealthResponse`, com `DEGRADED` na lista de status. A regra de OpenAPI que eu escrevi no `config.yaml` passou pela pergunta do propose, virou requisito, virou tarefa, virou código e agora está visível no navegador.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.2-05.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.2-05.mp4" type="video/mp4"></video>
*⏱ Tempo real: 2 min 59 s (vídeo acelerado).*

---

# Parte 3 — Archive

## A tarefa 5.4, fechada por uma pessoa

Antes do archive, mandei a mensagem mais curta da série:

```
abri o navegador e testei o swagger. Funcionou
```

Eu não disse qual task era nem pedi para registrar nada. O Claude já sabia que a 5.4 era a única aberta: marcou no `tasks.md`, pediu ao OpenSpec a contagem (34 de 34) e fez o commit, com a minha frase virando evidência registrada na mensagem: "Task 5.4 verified by opening /swagger-ui.html in the browser: GET /actuator/health is listed."

Aqui teve um detalhe bonito. O filtro de texto que ele usou para resumir a saída do push falhou e escondeu o resultado. Em vez de declarar sucesso, ele escreveu: "O commit foi feito, mas meu filtro do `grep` falhou e escondeu o resultado do push. Confiro direto no remoto". E comparou o hash do servidor com o local:

```bash
git ls-remote origin refs/heads/feat/bootstrap-project-skeleton/2-apply
git rev-parse HEAD
```

Por que não arquivar com a 5.4 aberta? Porque o cenário do spec "WHEN abro `/swagger-ui.html` THEN a interface carrega e lista a operação `GET /actuator/health`" ficaria sem ninguém ter conferido. Esse cenário depende de um olho humano. Em SDD, quem fecha o contrato não é o agente sozinho: a pessoa assina a parte que só ela consegue verificar. É a diferença entre "o agente disse que funciona" e "alguém conferiu e está registrado".

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.3-00.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.3-00.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 25 s (vídeo acelerado).*

## /opsx:archive e a pergunta do sync

```
/opsx:archive
```

Só o comando, sem nome de change. O autocomplete mostra os comandos do OpenSpec instalados no Claude Code (apply, archive, explore, propose, sync e update); existe um `/opsx:sync` separado, mas o archive faz o sync no meio do caminho. O Claude respondeu "Using change: bootstrap-project-skeleton", criou a branch `3-archive` a partir da `2-apply` e, num comando só, reuniu o que precisava: status dos quatro documentos (todos `done`), contagem de tasks, o que já existe em `openspec/specs/` e os requisitos do delta.

Então veio a mesma pergunta do primeiro archive, agora sobre outro spec:

* **"O delta spec application-runtime ainda não está nos specs principais (openspec/specs/). Como seguir?"**
  * *Sync now (recomendada):* cria `openspec/specs/application-runtime/spec.md` com o Purpose e os 7 requisitos, verifica e então arquiva.
  * *Archive without syncing:* só move a change para o archive; a capability não passa a constar nos specs principais.

Escolhi **Sync now**, igual ao primeiro archive, e a consistência é proposital. O esqueleto foi implementado, testado e verificado por mim; não há motivo para deixar a fonte de verdade desatualizada. A próxima change, a ingestão dos dados da ANAC, vai encontrar esse spec para referenciar. O "sem sync" faz sentido quando a change foi abandonada, substituída ou ainda precisa de revisão antes de virar comportamento oficial. É como a diferença entre fazer merge de um pull request aprovado e fechá-lo sem merge.

Mesmo com uma opção claramente recomendada, o Claude não respondeu por mim. Mexer na fonte de verdade é decisão minha.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.3-01.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.3-01.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 05 s (vídeo acelerado).*

## Sync, validação e git mv

"Busco as regras de spec e faço o sync inline, do mesmo jeito da change anterior". Inline quer dizer que ele mesmo fez o sync dentro do archive, com um pequeno script em Python: copiou o Purpose do delta e trocou o título `## ADDED Requirements` por `## Requirements`, porque no spec principal não existe mais "adicionado", é simplesmente o que o sistema faz. Depois validou e comparou os dois:

```bash
openspec validate application-runtime --type spec --strict
```

"Specification 'application-runtime' is valid", com um aviso informativo: "Requirement text is very long (>500 characters)". A contagem saiu como "7/7 requisitos, 16/16 cenários" (guarde esse 16).

Só depois de validar ele arquivou. Montou o destino com a data, testou que ele ainda não existia (para não sobrescrever nada) e usou `git mv`:

```bash
T="openspec/changes/archive/$(date +%F)-bootstrap-project-skeleton" && test ! -e "$T" && git mv openspec/changes/bootstrap-project-skeleton "$T"
```

A ordem importa: se a validação falhasse, nada teria sido movido. E o `git mv`, em vez de copiar e apagar, faz o git registrar os arquivos como renomeados, então dá para seguir o histórico de cada documento até o propose.

O resumo final:

* change arquivada em `openspec/changes/archive/2026-09-30-bootstrap-project-skeleton/`, com o `.openspec.yaml` junto;
* spec principal `application-runtime` com 7 requisitos e 17 cenários, idênticos ao delta, passando no `validate --strict`;
* 4 artefatos completos, 34 tasks concluídas e nenhuma change ativa;
* specs principais agora são dois: `local-dev-environment` (9 requisitos) e `application-runtime` (7).

E a correção que eu pedi para você guardar: "antes eu escrevi 16 cenários, mas a contagem certa é 17." Prefiro um agente que corrige o próprio número em público a um que esconde. Sobre os dois requisitos longos, a sugestão dele foi dividi-los quando uma change futura mexer neles, e não agora, num spec que acabou de ser aprovado. Fica registrado como dívida técnica.

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.3-02.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.3-02.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 15 s (vídeo acelerado).*

## O que fica arquivado

Para fechar, abri a pasta arquivada no explorador do VS Code. Em `openspec/changes/archive/` estão as duas changes concluídas, cada uma com a data na frente do nome, que ordena o histórico.

O `design.md` arquivado não é o do propose: ele foi atualizado com o que o apply aprendeu. Por exemplo:

> `hikari.connection-timeout` é ligado a `long` em milissegundos: `3s` falha na inicialização (verificado no apply). Por isso o valor é `3000`.

E as alternativas descartadas ficam registradas, como o perfil local com senha padrão, "descartado por colocar credencial em arquivo versionado". Daqui a seis meses, quem perguntar "por que o timeout é 3000?" ou "por que não tem perfil local com senha?" encontra a resposta aqui, e não na memória de alguém.

Também passei pela tabela de estratégia de testes da D6, pelo *Impact* da proposta (guarde a frase "Nenhuma tabela nem migração é criada": ela volta quando o projeto precisar criar as primeiras tabelas), pelo grupo 4 do `tasks.md`, em que a 4.4 diz que "o carregamento no navegador fica para a 5.4", e pelo delta spec, com seus `SHALL`, `MUST` e `SHALL NOT` e o cenário de falha "PostgreSQL fora na inicialização e depois recuperado".

<video controls preload="none" width="100%" poster="/assets/videos/sdd-openspec-3/1.3.3-03.jpg"><source src="/assets/videos/sdd-openspec-3/1.3.3-03.mp4" type="video/mp4"></video>
*⏱ Tempo real: 1 min 19 s.*

---

# Para reproduzir

Se você clonou o repositório e quer ver o resultado desta change rodando:

```bash
git clone https://github.com/vcasadei/skyledger-br.git
cd skyledger-br
git checkout feat/bootstrap-project-skeleton/3-archive
java -version                   # precisa ser 21
cp .env.example .env            # a aplicação exige POSTGRES_PASSWORD
docker compose up -d --wait     # PostgreSQL, Redis e SeaweedFS
./mvnw verify                   # 17 testes; exige Docker em execução
./mvnw spring-boot:run          # sempre a partir da raiz
curl -s localhost:8080/actuator/health
```

Depois, abra `http://localhost:8080/swagger-ui.html`. Para ver o comportamento degradado, rode com `REDIS_PORT=6390 ./mvnw spring-boot:run`: o health continua 200, com `redis` em `DEGRADED`. E para ver como o plano evoluiu, compare o `design.md` da branch `1-propose` com o arquivado na `3-archive`.

---

# O que eu levo desta change

* **Mudanças se apoiam em mudanças.** O spec da primeira change virou insumo da segunda. "Referencie, não redefina" começou como uma frase no prompt e terminou como um `git diff` vazio num quality gate.
* **O agente pergunta o que é decisão, investiga o que é fato.** Versões de biblioteca ele conferiu no Maven Central; formato do health-check, dependência nova, toolchain e pacote ele devolveu para mim. A régua dele, "afeta o contrato ou as dependências", é uma boa régua para usar na revisão.
* **Regras em camadas funcionam.** O `config.yaml` diz o que o projeto exige; o schema diz como o agente se comporta. Quando as duas se encontraram, na dependência do springdoc, o resultado foi uma pergunta, não uma decisão silenciosa.
* **O plano erra, e tudo bem.** Cinco pontos do design estavam errados ou incompletos. Todos foram descobertos com experimento ou teste, corrigidos no código e registrados no design. Especificação boa não é a que acerta tudo; é a que é mantida.
* **Humano fecha o que só humano verifica.** 33 de 34 com uma tarefa aberta e explicada vale mais do que 34 de 34 com uma marcada às cegas.

No próximo post, o SkyLedger ganha a primeira funcionalidade de negócio: a ingestão dos dados reais de voos da ANAC, e com ela as primeiras tabelas do banco.

**Navegação da série:** ← [Parte 2: SkyLedger BR e a infraestrutura local](/pt/2026/10/18/sdd-openspec-2-skyledger-infra-local.html) · [Parte 4: ingestão dos dados abertos da ANAC no SkyLedger](/pt/2026/10/21/sdd-openspec-4-skyledger-ingestao-anac.html) →

---

# Referências

* **Spec-Driven Development**
  * [OpenSpec](https://github.com/Fission-AI/OpenSpec) · [Documentação](https://openspec.dev/docs)
  * [openspec-casadei](https://github.com/vcasadei/openspec-casadei), o meu schema público para o OpenSpec
* **O projeto**
  * [skyledger-br](https://github.com/vcasadei/skyledger-br) (a branch `main` tem o estado final)
  * Branches desta change: [`1-propose`](https://github.com/vcasadei/skyledger-br/tree/feat/bootstrap-project-skeleton/1-propose) · [`2-apply`](https://github.com/vcasadei/skyledger-br/tree/feat/bootstrap-project-skeleton/2-apply) · [`3-archive`](https://github.com/vcasadei/skyledger-br/tree/feat/bootstrap-project-skeleton/3-archive)
  * [anac-data](https://github.com/vcasadei/anac-data), os dados de origem que entram na próxima change
* **Tecnologias**
  * [Spring Boot](https://spring.io/projects/spring-boot) · [Spring Boot Actuator: endpoints e health](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html)
  * [Suporte a Docker Compose no Spring Boot](https://docs.spring.io/spring-boot/reference/features/dev-services.html)
  * [springdoc-openapi](https://springdoc.org/) · [Especificação OpenAPI](https://spec.openapis.org/oas/latest.html)
  * [Maven Wrapper](https://maven.apache.org/tools/wrapper/) · [Maven Enforcer: requireJavaVersion](https://maven.apache.org/enforcer/enforcer-rules/requireJavaVersion.html)
  * [HikariCP](https://github.com/brettwooldridge/HikariCP) · [Lettuce](https://lettuce.io/)
  * [Eclipse Temurin](https://adoptium.net/) · [Docker Compose](https://docs.docker.com/compose/)
* **Outros posts**
  * [Spec-Driven Development com opencode e modelos gratuitos do InkStone](/pt/2026/10/15/sdd-opencode-modelos-gratuitos-inkstone.html)

---

Se você está acompanhando a série e reproduzindo o SkyLedger, me conta no LinkedIn ([linkedin.com/in/vcasadei](https://linkedin.com/in/vcasadei)) como foi o seu esqueleto, ou confira outros projetos e textos em [vcasadei.com](https://vcasadei.com).

<style>
.article__content pre, .article__content pre code{white-space:pre-wrap !important;word-wrap:break-word;overflow-wrap:anywhere}
.article__content div.highlight, .article__content pre{overflow-x:visible !important}
</style>
