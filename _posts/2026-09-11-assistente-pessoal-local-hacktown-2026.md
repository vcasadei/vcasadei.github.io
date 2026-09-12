---
layout: article
title: Criando um Assistente Pessoal com IA Local e Independente
key: assistente-pessoal-local-hacktown-2026
cover: /assets/images/local-personal-assistant-hacktown-2026/local-personal-assistant-hacktown-2026.jpeg
show_excerpt: false
mode: immersive
header:
  theme: dark
article_header:
  type: overlay
  theme: dark
  background_color: '#203028'
  background_image:
    gradient: 'linear-gradient(135deg, rgba(97, 4, 109, 0.69), rgba(98, 3, 3, 0.64))'
    src: /assets/images/local-personal-assistant-hacktown-2026/local-personal-assistant-hacktown-2026.jpeg
---

Continuando o assunto da palestra do HackTown 2026.

<!--more-->

🇺🇸 *Este artigo também está disponível em [inglês](/2026/09/11/local-personal-assistant-hacktown-2026.html).*

Este artigo busca trazer um relato sincero sobre a minha experiência pessoal e sobre os meus esforços práticos para a criação de uma pipeline de assistente pessoal com IA local e independente — algo que venho desenvolvendo e refinando nos últimos anos, tanto para o meu fluxo de trabalho cotidiano quanto para a minha vida profissional.

![Imagem](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/local-personal-assistant-hacktown-2026/hacktown-2026-logo-10anos-branco.png "10 anos do Hacktown"){:.rounded}

Recentemente, estive em Santa Rita do Sapucaí para o [HackTown 2026](https://hacktown.com.br/). Foi uma edição marcante: o evento comemorou 10 anos de história, e foi o meu 8º ano consecutivo palestrando por lá. Nos anos anteriores sempre tive salas cheias e discussões ricas, mas desta vez foi algo especial. Minha fala foi agendada para uma sexta-feira antes do feriado de 7 de setembro, às 13h — um dia e horário que costumam ter menos movimento, já que o pico tradicional do festival é no sábado. Ainda assim, a sala lotou completamente, com pessoas em pé prestando atenção, dezenas de perguntas excelentes e, infelizmente, muita gente que não conseguiu entrar e acabou ficando do lado de fora.

Se você quiser conferir os slides que usei, pode navegar por eles aqui:

<div class="extensions extensions--slide">
  <iframe src="/assets/pdf/local-personal-assistant-hacktown-2026/slides_ia_local_hacktown.pdf"
    width="100%" height="600" frameborder="0" style="border:1px solid #CCC;">
  </iframe>
</div>

Você também pode [baixar os slides](/assets/pdf/local-personal-assistant-hacktown-2026/slides_ia_local_hacktown.pdf) se preferir vê-los offline.

Este artigo nasce como uma documentação de referência para quem esteve lá dentro e queria os detalhes na ponta dos dedos, mas também como uma forma de atender e compartilhar esse conhecimento com todos que não conseguiram entrar na sala.

Antes de entrarmos nos comandos e arquitetura, vale contar a história de como cheguei até aqui e por que cada uma dessas ferramentas entrou na minha rotina.

# Como cheguei nisso

Tudo começou quando tentei resolver um problema chato e crônico: a gestão das minhas anotações diárias de reuniões e tarefas de trabalho.

Eu usava bastante o Microsoft OneNote e o Obsidian. O OneNote, em especial, costuma ser subestimado, mas é uma ferramenta formidável para anotação livre: eu podia rabiscar no iPad com a caneta, digitar no computador com Windows, abrir no celular. O problema começava na hora de recuperar a informação. Era muito difícil pesquisar o que eu tinha registrado; muitas vezes eu precisava exportar páginas manualmente para tentar carregar em algum motor de busca, sem contar que imagens coladas ou diagramas simplesmente não eram lidos direito. Com o volume de reuniões crescendo, o fluxo ficou insustentável.

Além disso, havia um atrito de comportamento. Anotar freneticamente durante uma reunião divide a atenção e drena o foco da discussão. No modelo de trabalho remoto, a coisa piora: digitar enquanto outra pessoa fala não é elegante e muitas vezes gera a impressão de que você não está prestando atenção no que ela diz.

Eu precisava de transcrição automatizada. Isso foi bem antes de Google Meet e Zoom sonharem em ter botões nativos de transcrição. Naquela época, comecei rodando modelos Whisper crus direto no terminal do meu computador. Quebrava um galho, mas era longe do ideal: não tinha otimização, consumia toda a GPU da máquina, travava em termos técnicos e se perdia facilmente quando a conversa misturava português e termos em inglês.

Mais tarde, o Meet e o Zoom lançaram seus recursos próprios, mas com gargalos que persistem até hoje. No início, o suporte ao português era fraco. Além disso, existe o clássico problema do acesso: se o assistente da plataforma gravou, você precisa pedir acesso à ata para o organizador depois — algo que raramente é liberado de prontidão. Sem falar em outros cenários essenciais do meu dia a dia:
1. Extrair transcrições e resumos de vídeos longos do YouTube que uso para estudo;
2. Gravar reuniões presenciais em que eu só queria deixar o gravador capturando o áudio discretamente para ter o registro sem perder o olho no olho.

Comecei até a rascunhar uma ferramenta própria, mas parei assim que descobri o [**Meetily**](https://github.com/Zackriya-Solutions/meetily). Ele resolveu a transcrição local com louvor. Porém, quando precisei dar o passo seguinte — gerar resumos inteligentes, customizar os prompts dessas atas e orquestrar tarefas com modelos adequados ao meu computador —, precisei ir além.

Essa jornada evolutiva segue cinco passos práticos:
* **[Parte 1 — Meetily](#parte-1--meetily):** transcrição pura, leve e 100% local.
* **[Parte 2 — Ollama](#parte-2--ollama):** o motor de inferência para rodar qualquer modelo na sua máquina.
* **[Parte 3 — AnythingLLM](#parte-3--anythingllm):** a central com interface amigável, RAG, tarefas agendadas e assistente de reunião nativo.
* **[Parte 4 — ODS](#parte-4--ods-osmantic-deployment-system):** um ecossistema completo e conteinerizado em um só comando.
* **[Parte 5 — OpenClaw](#parte-5--openclaw):** a fronteira da autonomia com acesso a canais reais e controle do sistema operacional.

# Parte 1 — Meetily

**O que é:** um assistente de reuniões 100% local. Grava, transcreve e resume sem que nenhum byte saia da sua máquina. É open source (licença MIT), leve e com código aberto no GitHub. Repositório: [github.com/Zackriya-Solutions/meetily](https://github.com/Zackriya-Solutions/meetily) · site: [meetily.ai](https://meetily.ai).

## Como instalar

**Windows:**
1. Baixe o instalador `meetily-frontend_x64-setup.exe` na página de releases do repositório no GitHub.
2. Execute o arquivo e siga o fluxo padrão de instalação na tela.
3. Ao abrir pela primeira vez, escolha o motor de transcrição desejado (Parakeet ou Whisper).

**macOS (via Homebrew):**
```bash
brew tap zackriya-solutions/meetily
brew install --cask meetily
meetily-server --language en --model medium
```
Depois, abra o app diretamente pela pasta Applications.

**Linux:**
Ainda não conta com instalador binário único. O caminho mais estável é via Docker:
```bash
# Dentro da pasta backend do repositório clonado
./build-docker.sh cpu
./run-docker.sh start --interactive
```
Para compilar a aplicação completa (frontend + backend) nativamente com aceleração de hardware, siga as instruções em `docs/building_in_linux.md` do repositório (requer Rust e Node.js).

<div>{%- include extensions/youtube.html id='oUVnE5lhEcs' -%}</div>

## Onde ele brilha (e onde tropeça)

O Meetily é fantástico se o seu objetivo for estritamente a transcrição de áudio:
* **Seleção de motores:** oferece o **Parakeet** (extremamente rápido para quem tem pressa) e o **Whisper** (mais robusto, preciso e com suporte multilíngue impecável).
* **Flexibilidade de arquivos:** além de gravar o microfone/áudio do sistema em tempo real, ele permite subir arquivos de áudio externos — perfeito para transcrever reuniões presenciais gravadas no celular ou palestras gravadas em gravador portátil.
* **Leveza:** roda em CPU puro tranquilamente com cerca de 8 GB de RAM, sem exigir placas de vídeo dedicadas. Minha recomendação prática é testar os diferentes tamanhos de modelo do Whisper (tiny, base, small, medium) até encontrar a relação ideal entre velocidade e fidelidade para o seu computador.

Até hoje mantenho o Meetily instalado para transcrições diretas. Mas ele tem dois gargalos claros:
1. **Engessamento dos resumos:** a versão gratuita vem com 3 ou 4 prompts fixos. Se você quiser editar a estrutura do resumo ou direcionar a síntese para a sua realidade de negócios, a ferramenta bloqueia a edição na versão free.
2. **Modelos de linguagem fixos:** as LLMs embutidas para gerar esses resumos são poucas e rígidas. No meu caso, rodando em um processador AMD Ryzen com GPU integrada RDNA 2, os modelos padrão do Meetily não tinham suporte de aceleração para essa iGPU. O resultado era que a transcrição voava no Whisper, mas o resumo caía para inferência lenta em CPU.

Se você só quer a transcrição, pare aqui. Mas se você quer que a máquina leia essa transcrição com um modelo calibrado especificamente para o seu hardware e com os prompts que você quiser, você precisa de um motor de inferência dedicado: o [**Ollama**](https://ollama.com/).

---

# Parte 2 — Ollama

O [Ollama](https://ollama.com/) é o alicerce de praticamente tudo no universo de IA local. Ele funciona como um pequeno servidor em segundo plano: você baixa o modelo aberto que quiser do repositório e ele expõe uma API local rápida e padronizada.

O terminal assusta quem não é da área, mas aqui a linha de comando só é usada uma única vez para mandar baixar o modelo (`pull`). Depois disso, o serviço fica rodando silencioso. E o melhor: ele gerencia memória com muita eficiência — não consome quase nada de CPU, GPU ou RAM enquanto está ocioso, alocando recursos apenas no exato instante em que você faz uma pergunta.

<div>{%- include extensions/youtube.html id='CZaYkPxgAzM' -%}</div>

## Escolhendo o modelo para o seu hardware

Nenhuma etapa deste guia exige GPU de data center ou placa gráfica monstruosa. Todo notebook moderno possui uma GPU integrada (iGPU) que passa 90% do tempo sem fazer nada. É nela que podemos alocar as camadas da rede neural, aliviando a CPU para o restante do sistema operacional.

A máquina que usei na minha palestra no HackTown é o meu computador portátil de uso diário: um **GPD Win Max 2 (2023)**. Ele é quase um netbook de 10 polegadas, equipado com processador AMD Ryzen 7, GPU integrada Radeon 680M e 16 GB de memória RAM. Não é uma estação de trabalho gigante; é um dispositivo ultracompacto que roda tudo localmente com estabilidade.

A tabela abaixo resume como calibrar a escolha do modelo com a sua máquina:

| Perfil de hardware | RAM / GPU | Modelo sugerido | Comando de instalação | Desempenho aproximado |
|---|---|---|---|---|
| **Mínimo** — notebook antigo, mini PC de escritório | 4–8 GB RAM, CPU apenas | Phi-4-mini ou Llama 3.2 3B | `ollama pull llama3.2` | ~15–25 tokens/s |
| **Básico com GPU integrada** — AMD Radeon 680M/780M, Intel Iris Xe | 8–16 GB RAM | Llama 3.1 8B ou Mistral 7B | `ollama pull llama3.1:8b` | ~20–35 tokens/s |
| **Intermediário** — GPU dedicada de entrada | 16 GB RAM + 6–8 GB VRAM (ex.: RTX 3060/4060) | Llama 3.1 8B ou Qwen 2.5 7B | `ollama pull llama3.1:8b` | 40+ tokens/s |
| **Avançado** — GPU com folga de VRAM | 16–24 GB VRAM (ex.: RTX 4060 Ti 16GB, RTX 4070) | gpt-oss:20b ou glm-4.7-flash | `ollama pull gpt-oss:20b` | Rápido, contexto longo |
| **Entusiasta** — Desktop parrudo | 24 GB+ VRAM (RTX 3090/4090) | Qwen2.5-coder:32b ou DeepSeek-R1:32b | `ollama pull qwen2.5-coder:32b` | Raciocínio avançado |

**Regras práticas:**
* **Tamanho seguro:** para máquinas com 16 GB de RAM e GPU integrada, recomendo focar em modelos entre **3 e 8 bilhões de parâmetros (3B a 8B)**. Modelos de 3B voam; modelos de 7B/8B oferecem o melhor equilíbrio entre inteligência e fluidez.
* **Quantização:** o padrão `Q4_K_M` adotado pelo Ollama preserva a inteligência do modelo original com uma fração do consumo de memória.
* **Apple Silicon:** Macs com M1/M2/M3/M4 usam memória unificada. Uma máquina com 16 GB roda modelos de 8B com folga expressiva.
* **Biblioteca atualizada:** surgem modelos novos semanalmente. Consulte o catálogo completo em [ollama.com/library](https://ollama.com/library).
* **Baixe antes:** se for apresentar ou usar em trânsito, baixe os pesos dos modelos em casa. Confiar no Wi-Fi de auditório ou de hotel para baixar 4 GB de arquivo é garantia de frustração.

## Instalando o Ollama

O instalador é direto para cada plataforma:

* **Windows:** baixe o executável em [ollama.com/download/windows](https://ollama.com/download/windows) e instale normalmente.
* **macOS:** baixe o instalador `.dmg` em [ollama.com](https://ollama.com) ou instale via Homebrew com `brew install ollama`.
* **Linux:** rode no terminal:
  ```bash
  curl -fsSL https://ollama.ai/install.sh | sh
  ollama serve
  ```

Após a instalação, abra uma janela de terminal qualquer e baixe o modelo que você escolheu:
```bash
ollama pull llama3.2
```

Para verificar se o servidor está ativo, abra `http://localhost:11434` no navegador. A página exibirá: *"Ollama is running"*.

O Ollama resolveu a camada de inteligência. Mas conversar com ele pelo terminal não é prático: não dá para arrastar PDFs, não há leitura visual fluida de anexos nem histórico estruturado. Para isso, precisamos de uma interface rica: o **AnythingLLM**.

---

# Parte 3 — AnythingLLM

**O que é:** uma aplicação desktop completa que funciona como uma espécie de "NotebookLM e ChatGPT privados", rodando direto da sua área de trabalho e conectado ao seu Ollama local. É a peça central que atende cerca de **95% do meu uso diário**. Site: [anythingllm.com](https://anythingllm.com) · documentação: [docs.anythingllm.com](https://docs.anythingllm.com).

<div>{%- include extensions/youtube.html id='NPvivci4smI' -%}</div>

## Principais recursos no fluxo diário

* **Instalação autocontida:** nada de subir contêineres Docker complexos se você não quiser; é um aplicativo desktop tradicional para Windows, macOS e Linux com instalador duplo clique.
* **RAG local (Retrieval-Augmented Generation):** você cria "workspaces" temáticos, arrasta PDFs, planilhas, transcrições de reuniões ou links de sites, e o modelo responde estritamente baseado nesses materiais, com citação das fontes.
* **Meeting Assistant nativo:** grava reuniões do microfone ou áudio interno, transcreve e resume localmente. Se você não quiser rodar o Meetily separadamente, o próprio AnythingLLM resolve tudo no mesmo lugar (recurso disponível nas versões Desktop para Windows e macOS).
* **Integração nativa com Gmail e Google Calendar:** conecta diretamente aos serviços Google via OAuth. Na demonstração ao vivo que fiz no HackTown, pedi ao assistente em linguagem natural para redigir e enviar um e-mail para um participante na plateia e marcar um evento no meu calendário com data e hora combinadas — tudo executado sem sair da tela.
* **Arquitetura híbrida (Local + Nuvem):** você não é obrigado a escolher entre ser 100% local ou 100% nuvem. No meu fluxo, uso o Ollama local para 95% das tarefas rotineiras, notas e resumos curtos. Quando surge uma demanda atípica e pesada — como cruzar dados de 100 arquivos extensos simultaneamente —, chaveio temporariamente dentro do workspace para a API da Anthropic (Claude) ou OpenAI e depois retorno para o motor local.

## Instalação e uso

1. Baixe o instalador desktop no site oficial ([anythingllm.com](https://anythingllm.com)).
2. Na inicialização, selecione **Ollama** como provedor de inferência e aponte para `http://127.0.0.1:11434`.
3. Escolha o modelo que você já baixou anteriormente (ex.: `llama3.1:8b` ou `llama3.2`).

*(Nota: para ambientes corporativos que precisam de múltiplos usuários compartilhando uma mesma base de conhecimento, o AnythingLLM também oferece versão via Docker em `mintplexlabs/anythingllm`).*

## Limitações honestas

Embora cubra a imensa maioria dos casos de uso, ele tem fronteiras:
* Não foi desenhado como um copiloto para desenvolvimento de software pesado (code assistant no editor de código).
* Ele gera imagens caso configurado com extensões, mas não produz vídeos.
* Não funciona como um gateway de mensageria nativo: ele não fica escutando mensagens para responder sozinho dentro do seu WhatsApp; se você quiser integrações externas, precisará configurar chamadas via protocolo MCP (*Model Context Protocol*), onde o AnythingLLM consome ferramentas externas sob demanda.

Para quem busca uma central de produtividade local com privacidade rígida, o AnythingLLM combinado ao Ollama é o ponto ideal da curva.

---

# Parte 4 — ODS (Osmantic Deployment System)

**O que é:** um instalador orquestrado que provisiona, em um único comando, uma suíte completa de inteligência artificial de código aberto. Repositório: [github.com/Osmantic/ODS](https://github.com/Osmantic/ODS).

Se o AnythingLLM é um programa desktop focado no usuário final, o ODS é uma infraestrutura completa de serviços de backend. Ele sobe em contêineres:
* Um motor de inferência local;
* **Open WebUI** (interface de chat completa e colaborativa);
* **n8n** (automação de fluxos e nós de integração);
* **SearXNG + Perplexica/Vane** (mecanismo de busca web privada que agrega fontes sem rastreamento);
* **ComfyUI** (geração e manipulação avançada de imagens por nós).

<div>{%- include extensions/youtube.html id='D5kTcjr_bWQ' -%}</div>

## Como instalar

O pré-requisito obrigatório é ter o **Docker** rodando na máquina (no Windows, o Docker Desktop integrado ao backend WSL2).

**Linux ou macOS:**
```bash
curl -fsSL https://install.osmantic.com/ods.sh | bash
```

**Windows (PowerShell comum, sem necessidade de privilégios de Administrador):**
```powershell
$ProgressPreference = "SilentlyContinue"
$odsSrc = Join-Path $env:TEMP ("ods-install-" + [guid]::NewGuid().ToString("N"))
$odsZip = Join-Path $odsSrc "ods-main.zip"
New-Item -ItemType Directory -Path $odsSrc | Out-Null
Invoke-WebRequest "https://github.com/Osmantic/ODS/archive/refs/heads/main.zip" -OutFile $odsZip
Expand-Archive -LiteralPath $odsZip -DestinationPath $odsSrc -Force
cd (Get-ChildItem -LiteralPath $odsSrc -Directory | Select-Object -First 1).FullName
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\install.ps1
```

O instalador detecta automaticamente a aceleração disponível no seu hardware. Para quem prefere usar apenas serviços remotos para poupar hardware, ele possui a flag `--cloud`:
```bash
./install.sh --cloud
```

Após subir o ambiente, você acessa os painéis via navegador em `http://localhost:3000`.

## Comandos de gerenciamento diário:
```bash
ods status        # diagnóstico de integridade e uso da GPU
ods list          # relação de serviços conteinerizados ativos
ods model swap T2 # alternar o perfil de hardware e peso dos modelos
ods enable n8n    # inicializar nós de automação opcionais
```

## O que considerar antes de ir por aqui

O ODS entrega aquela última milha de integração para times ou usuários avançados, mas cobra seu preço em consumo e complexidade:
* **Recursos de máquina:** rodar múltiplos contêineres pesados simultaneamente (especialmente ComfyUI e pipelines de busca) exige mais memória e aquecimento de hardware do que um aplicativo único como o AnythingLLM.
* **Curva de aprendizado:** você não opera apenas uma tela de conversa; você precisa entender o funcionamento de pipelines no n8n, a lógica de workspaces do Open WebUI e os grafos do ComfyUI.
* **Falta de transcrição nativa:** ele não vem com uma ferramenta de captura e transcrição de reuniões pronta como o Meetily.

O ODS é incrível para quem quer estudar a fundo o ecossistema open source ou precisa de um servidor centralizado para vários usuários em rede local.

---

# Parte 5 — OpenClaw

**O que é:** a ferramenta mais avançada da jornada — e a que exige maior responsabilidade. O OpenClaw é um ecossistema autônomo projetado para executar ações de fato no seu sistema operacional e operar em canais reais de mensageria (WhatsApp, Telegram, Discord, Slack). Site: [openclaw.ai](https://openclaw.ai) · documentação: [clawdocs.org](https://clawdocs.org).

Costumo usar uma analogia direta: **instalar o OpenClaw é como dar a chave da sua casa para um estagiário extremamente brilhante, proativo e incansável — mas que continua sendo um estagiário.** Se você não supervisionar ou der ordens ambíguas, ele pode causar estragos consideráveis.

<div>{%- include extensions/youtube.html id='TSsEA2cYYkI' -%}</div>

## Como instalar

Requer Node.js moderno instalado (o próprio instalador tenta resolver as dependências):

**Windows (PowerShell):**
```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

**macOS / Linux:**
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Depois de instalado, configure o motor apontando para o seu Ollama local:
```bash
openclaw onboard
openclaw models set ollama/llama3.1:8b
```
O painel de controle fica acessível em `http://127.0.0.1:18789`.

Para conectar canais reais de comunicação:
```bash
openclaw channel add whatsapp
openclaw channel add telegram
openclaw channel status whatsapp
```
A conexão com o WhatsApp exibe um QR Code no terminal para emparelhamento; o Telegram solicita o token gerado via BotFather.

## O potencial (e o perigo) da autonomia total

Diferente de assistentes convencionais que apenas sugerem comandos, o OpenClaw tem permissão de execução:
* **Alterações no sistema operacional:** você pode pedir para ele alterar o papel de parede, acionar rotinas de desligamento de tela de madrugada, colocar o sistema em modo foco e alternar o status do seu Slack institucional para "Indisponível".
* **Manipulação visual do sistema de arquivos:** você pode apontar para uma pasta com centenas de fotos soltas e mandar: *"analise o conteúdo visual de cada imagem e renomeie o arquivo descrevendo sucintamente o que há na cena"*. Ele abre, interpreta via modelo de visão e renomeia tudo.
* **Assistente de bolso via mensageria:** rodando no seu computador (ou hospedado numa VPS), você manda mensagens pelo Telegram ou WhatsApp na rua e ele consulta arquivos, lê dados ou executa scripts no seu servidor em casa.

**Onde mora o perigo:**
LLMs interpretam ordens de forma estritamente literal. Há casos conhecidos de usuários que deram comandos genéricos como *"organize e limpe a minha caixa de entrada que está com milhares de e-mails antigos"* e o agente simplesmente disparou um comando de deleção permanente em massa.

**Como operar com segurança:**
1. Use com parcimônia e supervisão ativa.
2. Não desative o sistema de confirmação de permissões de comando. Por padrão, ele pergunta no terminal ou no chat se você autoriza executar aquela ação destrutiva. Só dê permissão de execução livre para um script ou tarefa depois que você viu o agente realizá-la com sucesso por três ou quatro vezes seguidas.
3. Utilize números secundários de WhatsApp para testes. Projetos baseados em conexões de web scraping correm riscos constantes de bloqueio pela plataforma.
4. O OpenClaw não possui gravação de reunião nativa; porém, por ter controle do sistema operacional, você pode criar uma rotina para ele abrir o Meetily, inicializar a gravação e depois processar o arquivo de saída.

---

# Qual caminho escolher?

Durante a palestra no HackTown, recebi uma pergunta essencial da plateia: **"Se eu consigo rodar modelos locais, por que diabos eu ainda precisaria de modelos na nuvem?"**

A resposta está na diferença de escala cognitiva e na tolerância à ambiguidade.

Modelos de linguagem menores (3B a 8B parâmetros) são impressionantemente inteligentes, mas exigem uma **engenharia de instrução muito mais literal**. Se você abrir o chat do AnythingLLM local e digitar de forma vaga: *"Dê uma olhada na minha pasta de downloads e apague os arquivos ISO maiores de 500 MB"*, dependendo do modelo ele responderá com a clássica alucinação: *"Desculpe, sou apenas um modelo de linguagem e não tenho acesso aos seus arquivos"*.

Para o modelo local funcionar com ferramentas (*tool calling*), você precisa conduzi-lo pela mão:
> *"Você tem acesso à ferramenta de sistema de arquivos. Acesse o caminho C:\Users\nome\Downloads. Liste todos os arquivos terminados em .iso. Verifique o tamanho de cada um. Para aqueles que forem maiores de 500 MB, execute a remoção."*

Modelos gigantescos em data centers (como Gemini Pro/Ultra ou Claude Sonnet) têm centenas de bilhões de parâmetros. Eles conseguem deduzir a intenção por trás de frases incompletas e orquestram etapas intermediárias com muito menos atrito.

O modelo local chega praticamente aos mesmos resultados práticos dos modelos de nuvem, mas demanda que você entenda as limitações dele e calibre como pedir. É um aprendizado rápido de adaptação.

## Árvore de decisão rápida

* **Cenário 1 — Você só quer transcrever reuniões e aulas:**
  Vá de **Meetily**. É leve, roda em qualquer computador comum, salva seus áudios, transcreve com Whisper local e não te expõe a cobranças. Se você já tem Gemini, ChatGPT ou NotebookLM corporativo fornecido pela empresa e não tem restrições de privacidade com atas, basta jogar a transcrição do Meetily para eles resumirem.
* **Cenário 2 — Você quer privacidade total, resumos sob medida, base de conhecimento (RAG) e rotinas:**
  Instale o **Ollama** e use o **AnythingLLM**. É a combinação padrão ouro. Resolve 95% do dia a dia da maioria das pessoas, grava reuniões, conversa com seus documentos, integra com e-mail e calendário do Google e oferece uma interface limpa sem dores de cabeça com terminal.
  *(Dica: ao configurar o Ollama, monitore pelo Gerenciador de Tarefas se as camadas estão sendo descarregadas na sua GPU integrada. Se cair para a CPU e ficar lento, peça ajuda para o próprio Gemini ou Copilot com a saída do seu comando `ollama ps` para ajustar as variáveis de ambiente).*
* **Cenário 3 — Você quer estudar arquitetura, orquestrar fluxos no n8n e integrar múltiplos serviços abertos:**
  Vá de **ODS**. É um laboratório completo de código aberto para rodar em servidores locais ou máquinas com boa capacidade de memória.
* **Cenário 4 — Você quer automação real no sistema operacional e controle remoto via WhatsApp/Telegram:**
  Vá de **OpenClaw**, mantendo sempre a supervisão estrita e validando as tarefas repetidamente antes de soltar o agente sem confirmação de passos.

---

# Bônus — Outras ferramentas úteis no radar

No caminho de experimentação antes de consolidar a suíte principal, algumas ferramentas avulsas de código aberto se mostraram úteis e merecem menção:

## Busca web privada — Vane (ex-Perplexica) + SearXNG
Para quem quer uma experiência similar ao Perplexity (busca na internet com citações diretas), mas 100% privada e agregando fontes pelo SearXNG sem rastreamento de anúncios:
```bash
docker run -d -p 3001:3000 -v vane-data:/home/vane/data --name vane itzcrazykns1337/vane:latest
```
Na configuração em `http://localhost:3001`, aponte para o Ollama usando `http://host.docker.internal:11434` (para o contêiner enxergar o host).

## Apresentações automatizadas com IA — Presenton
Gera decks de slides inteiros a partir de um resumo ou prompt, exportando em formatos editáveis (`.pptx` e PDF), com licença Apache 2.0:
```bash
docker run -d --name presenton -p 5001:80 -v ./app_data:/app_data ghcr.io/presenton/presenton:latest
```
*(No Windows PowerShell, substitua `./app_data` por `${PWD}\app_data`).*

---

# Um aviso sobre modelos e bom senso

Modelos de linguagem erram. Humanos erram o tempo todo, mas LLMs erram com uma convicção impressionante. Elas não têm senso de autopreservação nem noções implícitas de perigo.

Supervisione o que você entrega nas mãos de agentes. Não queremos ler notícias sobre mais alguém que executou um script sem validar e deletou o próprio ambiente de trabalho. Usem com consciência, testem em ambientes controlados e, acima de tudo, explorem o hardware que vocês já têm em cima da mesa.

Muitas vezes nos deixamos levar pela narrativa de que precisamos assinar planos caros em dólar de Big Techs para ter produtividade de ponta. A realidade é que o seu notebook atual, com modelos abertos bem escolhidos e ferramentas bem orquestradas, resolve a esmagadora maioria das dores com soberania e custo zero de assinatura.

Inclusive, essa filosofia de aplicar IA no hardware próprio é a mesma que detalhei em outro artigo aqui no meu site, onde mostro como montei um sistema de visão computacional local para câmeras de segurança: a IA analisa as imagens na ponta, reconhece carros e pessoas em tempo real e só dispara gravações de vídeo e alertas quando uma categoria previamente configurada de fato entra no perímetro. O princípio é exatamente o mesmo: inteligência útil, local e sem depender de nuvem de terceiros.

---

# Referências e links úteis

* **Meetily** — [meetily.ai](https://meetily.ai) · [github.com/Zackriya-Solutions/meetily](https://github.com/Zackriya-Solutions/meetily)
* **Ollama** — [ollama.com](https://ollama.com) · [Biblioteca de Modelos](https://ollama.com/library)
* **AnythingLLM** — [anythingllm.com](https://anythingllm.com) · [Documentação](https://docs.anythingllm.com)
* **ODS (Osmantic Deployment System)** — [github.com/Osmantic/ODS](https://github.com/Osmantic/ODS)
* **OpenClaw** — [openclaw.ai](https://openclaw.ai) · [Documentação de Canais](https://clawdocs.org/guides/channels)
* **Vane (ex-Perplexica)** — [github.com/ItzCrazyKns/Vane](https://github.com/ItzCrazyKns/Vane)
* **Presenton** — [presenton.ai](https://presenton.ai)

---

Se este guia te ajudou a montar o seu próprio assistente ou destravou algum fluxo por aí, me dê um alô no LinkedIn ([linkedin.com/in/vcasadei](https://linkedin.com/in/vcasadei)) ou acompanhe outros projetos e reflexões que publico em [vcasadei.com](https://vcasadei.com).
