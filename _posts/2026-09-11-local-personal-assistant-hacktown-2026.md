---
layout: article
title: Building a Personal Assistant with Local, Independent AI
key: local-personal-assistant-hacktown-2026
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

Continuing the Discussion from the HackTown 2026 Talk.

<!--more-->

🇧🇷 *This article is also available in [Portuguese](/2026/09/11/assistente-pessoal-local-hacktown-2026.html).*

This article aims to provide a candid account of my personal experience and practical efforts in creating a personal assistant pipeline powered by local, independent AI—something I have been developing and refining over the past few years for both my daily workflow and professional life.

![Image](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/local-personal-assistant-hacktown-2026/hacktown-2026-logo-10anos-branco.png "Hacktown 10 years"){:.rounded}

Recently, I was in Santa Rita do Sapucaí for [HackTown 2026](https://hacktown.com.br/). It was a milestone edition: the event celebrated its 10th anniversary, and it marked my 8th consecutive year speaking there. In previous years, I always had full rooms and rich discussions, but this time was truly special. My talk was scheduled for a Friday before the September 7th holiday at 1:00 PM—a day and time that usually sees lighter foot traffic, given that the festival's traditional peak is on Saturday. Even so, the room was completely packed, with people standing up to pay attention, dozens of great questions, and, unfortunately, many people who couldn't get in and were left outside.

If you want to check out the slides I used, you can browse them right here:

<div class="extensions extensions--slide">
  <iframe src="/assets/pdf/local-personal-assistant-hacktown-2026/slides_ia_local_hacktown.pdf"
    width="100%" height="600" frameborder="0" style="border:1px solid #CCC;">
  </iframe>
</div>

You can also [download the slides](/assets/pdf/local-personal-assistant-hacktown-2026/slides_ia_local_hacktown.pdf) if you'd rather view them offline.

This article was born as a reference guide for those who were inside and wanted the details at their fingertips, but also as a way to address and share this knowledge with everyone who couldn't make it into the room.

Before diving into commands and architecture, it's worth sharing the story of how I got here and why each of these tools became part of my routine.

# How I Got Here

It all started when I tried to solve an annoying, chronic problem: managing my daily meeting notes and work tasks.

I used Microsoft OneNote and Obsidian heavily. OneNote, in particular, tends to be underrated, but it is a formidable tool for freeform note-taking: I could scribble on the iPad with the stylus, type on a Windows PC, and open it on my phone. The trouble began when it was time to retrieve information. Searching through what I had logged was extremely difficult; I often had to export pages manually to feed them into a search engine, not to mention that pasted images or diagrams simply weren't indexed properly. As the volume of meetings grew, the workflow became unsustainable.

On top of that, there was a behavioral friction. Frantically taking notes during a meeting splits your attention and drains focus from the discussion. In remote work, it gets even worse: typing while someone else is speaking is poor etiquette and often gives the impression that you aren't paying attention to what they're saying.

I needed automated transcription. This was well before Google Meet and Zoom even dreamed of having native transcription buttons. Back then, I started running raw Whisper models directly in my computer's terminal. It was a decent stopgap, but far from ideal: it lacked optimization, hogged the machine's entire GPU, choked on technical terminology, and easily lost its footing whenever the conversation mixed Portuguese and English terms.

Later, Meet and Zoom rolled out their own features, but with bottlenecks that persist to this day. Initially, Portuguese support was weak. Moreover, there is the classic access hurdle: if the platform assistant recorded the meeting, you have to request access to the transcript from the host afterward—something rarely granted promptly. That's not to mention other essential scenarios in my daily routine:
1. Extracting transcripts and summaries from long YouTube videos I use for study;
2. Recording in-person meetings where I just wanted to leave a recorder running quietly to capture the audio without losing eye contact.

I even started drafting my own tool, but shelved it as soon as I discovered [**Meetily**](https://github.com/Zackriya-Solutions/meetily). It handled local transcription with flying colors. However, when I needed to take the next step—generating intelligent summaries, customizing meeting minutes prompts, and orchestrating tasks with models tailored to my computer—I had to go further.

This evolutionary journey follows five practical steps:
* **[Part 1 — Meetily](#part-1--meetily):** pure, lightweight, and 100% local transcription.
* **[Part 2 — Ollama](#part-2--ollama):** the inference engine to run any model on your machine.
* **[Part 3 — AnythingLLM](#part-3--anythingllm):** the hub with a user-friendly GUI, RAG, scheduled tasks, and a native meeting assistant.
* **[Part 4 — ODS](#part-4--ods-osmantic-deployment-system):** a complete, containerized ecosystem in a single command.
* **[Part 5 — OpenClaw](#part-5--openclaw):** the frontier of autonomy with access to real communication channels and operating system control.

# Part 1 — Meetily

**What it is:** A 100% local meeting assistant. It records, transcribes, and summarizes without a single byte leaving your machine. It is open-source (MIT license), lightweight, and hosted on GitHub. Repository: [github.com/Zackriya-Solutions/meetily](https://github.com/Zackriya-Solutions/meetily) · Website: [meetily.ai](https://meetily.ai).

## How to Install

**Windows:**
1. Download the `meetily-frontend_x64-setup.exe` installer from the releases page on the GitHub repository.
2. Run the file and follow the standard on-screen installation flow.
3. Upon opening it for the first time, choose your desired transcription engine (Parakeet or Whisper).

**macOS (via Homebrew):**
```bash
brew tap zackriya-solutions/meetily
brew install --cask meetily
meetily-server --language en --model medium
```
Then, open the app directly from your Applications folder.

**Linux:**
It does not yet have a single binary installer. The most stable route is via Docker:
```bash
# Inside the backend folder of the cloned repository
./build-docker.sh cpu
./run-docker.sh start --interactive
```
To build the complete application (frontend + backend) natively with hardware acceleration, follow the instructions in `docs/building_in_linux.md` within the repository (requires Rust and Node.js).

<div>{%- include extensions/youtube.html id='oUVnE5lhEcs' -%}</div>

## Where It Shines (and Where It Stumbles)

Meetily is fantastic if your goal is strictly audio transcription:
* **Engine selection:** Offers **Parakeet** (extremely fast for when you're in a hurry) and **Whisper** (more robust, accurate, and with impeccable multilingual support).
* **File flexibility:** In addition to recording microphone/system audio in real time, it allows you to upload external audio files—perfect for transcribing in-person meetings recorded on your phone or lectures captured on a portable recorder.
* **Lightweight:** Runs smoothly on pure CPU with around 8 GB of RAM, without requiring a dedicated graphics card. My practical recommendation is to test the various Whisper model sizes (tiny, base, small, medium) until you find the sweet spot between speed and accuracy for your computer.

I still keep Meetily installed today for direct transcriptions. But it has two clear bottlenecks:
1. **Rigid summaries:** The free version comes with 3 or 4 hardcoded prompts. If you want to customize the summary structure or tailor the synthesis to your business needs, the tool restricts prompt editing in the free tier.
2. **Fixed language models:** The built-in LLMs used to generate these summaries are few and inflexible. In my case, running on an AMD Ryzen processor with an integrated RDNA 2 GPU, Meetily's default models lacked acceleration support for that iGPU. As a result, transcription flew on Whisper, but summarization dropped down to sluggish CPU inference.

If all you want is transcription, stop here. But if you want your machine to read that transcript using a model calibrated specifically for your hardware and driven by your own custom prompts, you need a dedicated inference engine: [**Ollama**](https://ollama.com/).

---

# Part 2 — Ollama

[Ollama](https://ollama.com/) is the bedrock of virtually everything in the local AI landscape. It acts as a lightweight background server: you pull whatever open-weight model you want from the repository, and it exposes a fast, standardized local API.

The terminal can be intimidating for non-technical users, but here the command line is used just once to pull the model (`pull`). After that, the service runs silently in the background. Best of all: it manages memory very efficiently—consuming virtually no CPU, GPU, or RAM while idle, allocating resources only at the exact moment you submit a prompt.

<div>{%- include extensions/youtube.html id='CZaYkPxgAzM' -%}</div>

## Choosing the Right Model for Your Hardware

None of the steps in this guide require a data center GPU or a monster graphics card. Every modern laptop features an integrated GPU (iGPU) that spends 90% of its time sitting idle. That's where we can offload neural network layers, freeing up the CPU for the rest of the operating system.

The machine I used during my HackTown talk is my daily-driver portable computer: a **GPD Win Max 2 (2023)**. It is essentially a 10-inch netbook, powered by an AMD Ryzen 7 processor, a Radeon 680M integrated GPU, and 16 GB of RAM. It is not a massive workstation; it is an ultra-compact device that runs everything locally with rock-solid stability.

The table below outlines how to match model selection with your hardware:

| Hardware Profile | RAM / GPU | Suggested Model | Installation Command | Approximate Performance |
|---|---|---|---|---|
| **Minimum** — older laptop, office mini-PC | 4–8 GB RAM, CPU only | Phi-4-mini or Llama 3.2 3B | `ollama pull llama3.2` | ~15–25 tokens/s |
| **Basic with Integrated GPU** — AMD Radeon 680M/780M, Intel Iris Xe | 8–16 GB RAM | Llama 3.1 8B or Mistral 7B | `ollama pull llama3.1:8b` | ~20–35 tokens/s |
| **Intermediate** — Entry-level dedicated GPU | 16 GB RAM + 6–8 GB VRAM (e.g., RTX 3060/4060) | Llama 3.1 8B or Qwen 2.5 7B | `ollama pull llama3.1:8b` | 40+ tokens/s |
| **Advanced** — GPU with ample VRAM headroom | 16–24 GB VRAM (e.g., RTX 4060 Ti 16GB, RTX 4070) | gpt-oss:20b or glm-4.7-flash | `ollama pull gpt-oss:20b` | Fast, long context |
| **Enthusiast** — Heavy-duty desktop | 24 GB+ VRAM (RTX 3090/4090) | Qwen2.5-coder:32b or DeepSeek-R1:32b | `ollama pull qwen2.5-coder:32b` | Advanced reasoning |

**Practical Rules of Thumb:**
* **Safe sweet spot:** For machines with 16 GB of RAM and an integrated GPU, I recommend focusing on models between **3 and 8 billion parameters (3B to 8B)**. 3B models fly; 7B/8B models offer the ideal balance between intelligence and speed.
* **Quantization:** The `Q4_K_M` default adopted by Ollama preserves original model intelligence at a fraction of the memory footprint.
* **Apple Silicon:** Macs with M1/M2/M3/M4 utilize unified memory. A 16 GB machine runs 8B models with plenty of breathing room.
* **Evolving library:** New models drop weekly. Check out the complete catalog at [ollama.com/library](https://ollama.com/library).
* **Download in advance:** If you plan to present or use your setup on the go, download the model weights at home. Relying on auditorium or hotel Wi-Fi to pull a 4 GB file is a recipe for frustration.

## Installing Ollama

The installer is straightforward on every platform:

* **Windows:** Download the executable from [ollama.com/download/windows](https://ollama.com/download/windows) and install normally.
* **macOS:** Download the `.dmg` installer from [ollama.com](https://ollama.com) or install via Homebrew with `brew install ollama`.
* **Linux:** Run the following in your terminal:
  ```bash
  curl -fsSL https://ollama.ai/install.sh | sh
  ollama serve
  ```

Once installed, open any terminal window and download your chosen model:
```bash
ollama pull llama3.2
```

To confirm the server is active, navigate to `http://localhost:11434` in your browser. The page will display: *"Ollama is running"*.

Ollama solves the intelligence layer. However, interacting with it through the terminal isn't practical: you can't drag and drop PDFs, there is no smooth visual reading of attachments, and there is no structured history. For that, we need a rich graphical interface: **AnythingLLM**.

---

# Part 3 — AnythingLLM

**What it is:** A full-featured desktop application that works like a private "NotebookLM and ChatGPT," running directly on your desktop and connected to your local Ollama instance. It is the core workhorse that handles roughly **95% of my daily use**. Website: [anythingllm.com](https://anythingllm.com) · Documentation: [docs.anythingllm.com](https://docs.anythingllm.com).

<div>{%- include extensions/youtube.html id='NPvivci4smI' -%}</div>

## Key Features in the Daily Workflow

* **Self-contained installation:** No need to spin up complex Docker containers unless you want to; it's a standard desktop app for Windows, macOS, and Linux with a double-click installer.
* **Local RAG (Retrieval-Augmented Generation):** You create thematic "workspaces," drag and drop PDFs, spreadsheets, meeting transcripts, or website links, and the model answers strictly based on those materials, complete with source citations.
* **Native Meeting Assistant:** Records meetings via microphone or system audio, then transcribes and summarizes them locally. If you don't want to run Meetily separately, AnythingLLM handles everything under one roof (available in the Desktop versions for Windows and macOS).
* **Native Gmail and Google Calendar integration:** Connects directly to Google services via OAuth. In the live demo I gave at HackTown, I asked the assistant in plain natural language to draft and send an email to an audience member and schedule an event on my calendar with the agreed date and time—all executed without ever leaving the screen.
* **Hybrid Architecture (Local + Cloud):** You aren't forced to choose between being 100% local or 100% cloud. In my workflow, I use local Ollama for 95% of routine tasks, notes, and short summaries. When an atypical, heavy demand arises—such as cross-referencing data across 100 extensive files simultaneously—I temporarily toggle within the workspace to the Anthropic (Claude) or OpenAI API, and then switch back to the local engine.

## Installation and Setup

1. Download the desktop installer from the official website ([anythingllm.com](https://anythingllm.com)).
2. On initial launch, select **Ollama** as your inference provider and point it to `http://127.0.0.1:11434`.
3. Choose the model you downloaded earlier (e.g., `llama3.1:8b` or `llama3.2`).

*(Note: For enterprise environments requiring multiple users sharing a unified knowledge base, AnythingLLM also offers a Docker version at `mintplexlabs/anythingllm`).*

## Honest Limitations

While it covers the vast majority of use cases, it has clear boundaries:
* It was not designed as a heavy software development copilot (an in-editor coding assistant).
* It can generate images if configured with extensions, but it does not produce video.
* It does not act as a native messaging gateway: it won't listen for incoming messages to reply on your behalf inside WhatsApp; if you need external integrations, you must configure calls via the MCP (*Model Context Protocol*) framework, where AnythingLLM invokes external tools on demand.

For anyone seeking a private, local productivity command center, AnythingLLM paired with Ollama hits the sweet spot.

---

# Part 4 — ODS (Osmantic Deployment System)

**What it is:** An orchestrated installer that provisions, in a single command, a comprehensive open-source artificial intelligence suite. Repository: [github.com/Osmantic/ODS](https://github.com/Osmantic/ODS).

If AnythingLLM is an end-user desktop app, ODS is a full-fledged backend services infrastructure. It spins up in containers:
* A local inference engine;
* **Open WebUI** (a full-featured, collaborative chat interface);
* **n8n** (workflow automation and integration nodes);
* **SearXNG + Perplexica/Vane** (private web search engine aggregating sources without tracking);
* **ComfyUI** (advanced node-based image generation and manipulation).

<div>{%- include extensions/youtube.html id='D5kTcjr_bWQ' -%}</div>

## How to Install

The mandatory prerequisite is having **Docker** running on your system (on Windows, Docker Desktop integrated with the WSL2 backend).

**Linux or macOS:**
```bash
curl -fsSL https://install.osmantic.com/ods.sh | bash
```

**Windows (Standard PowerShell, no Administrator privileges required):**
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

The installer automatically detects hardware acceleration available on your system. If you prefer to rely solely on remote services to conserve hardware resources, it includes a `--cloud` flag:
```bash
./install.sh --cloud
```

Once the environment is running, access the web dashboards in your browser at `http://localhost:3000`.

## Daily Management Commands:
```bash
ods status        # System health and GPU utilization diagnostics
ods list          # List active containerized services
ods model swap T2 # Switch hardware tier profile and model weights
ods enable n8n    # Spin up optional automation nodes
```

## Things to Consider Before Taking This Route

ODS delivers that critical last mile of integration for teams or advanced power users, but it comes at the cost of resource consumption and complexity:
* **System resources:** Running multiple heavy containers concurrently (especially ComfyUI and search pipelines) demands significantly more memory and generates more thermal load than a standalone app like AnythingLLM.
* **Learning curve:** You aren't just operating a chat window; you need to understand n8n pipeline logic, Open WebUI workspace workflows, and ComfyUI node graphs.
* **No out-of-the-box transcription:** It does not bundle a turnkey meeting recording and transcription tool like Meetily.

ODS is exceptional for anyone wanting to dive deep into the open-source ecosystem or needing a centralized server for multiple users over a local network.

---

# Part 5 — OpenClaw

**What it is:** The most advanced tool in this journey—and the one that demands the highest degree of responsibility. OpenClaw is an autonomous ecosystem designed to execute real actions on your operating system and interact across real messaging channels (WhatsApp, Telegram, Discord, Slack). Website: [openclaw.ai](https://openclaw.ai) · Documentation: [clawdocs.org](https://clawdocs.org).

I often use a direct analogy: **installing OpenClaw is like handing your house keys to an exceptionally brilliant, proactive, and tireless intern—who is still an intern.** If you don't supervise them or if you provide ambiguous instructions, they can cause serious collateral damage.

<div>{%- include extensions/youtube.html id='TSsEA2cYYkI' -%}</div>

## How to Install

Requires a modern installation of Node.js (the installer attempts to resolve dependencies automatically):

**Windows (PowerShell):**
```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

**macOS / Linux:**
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Once installed, configure the engine to point to your local Ollama instance:
```bash
openclaw onboard
openclaw models set ollama/llama3.1:8b
```
The control dashboard is accessible at `http://127.0.0.1:18789`.

To connect real messaging channels:
```bash
openclaw channel add whatsapp
openclaw channel add telegram
openclaw channel status whatsapp
```
Connecting WhatsApp generates a QR code in the terminal for device pairing; Telegram prompts for the bot token created via BotFather.

## The Power (and Peril) of Full Autonomy

Unlike traditional assistants that only suggest terminal commands, OpenClaw has real execution permissions:
* **Operating system adjustments:** You can ask it to change your desktop wallpaper, trigger late-night display sleep routines, toggle Focus Mode, and update your corporate Slack status to "Away."
* **Visual filesystem operations:** You can point it to a folder containing hundreds of unorganized photos and instruct: *"Analyze the visual content of each image and rename the file with a succinct description of the scene."* It opens, inspects via a vision model, and renames everything.
* **Pocket assistant via messaging:** Running on your desktop (or hosted on a VPS), you can message it on Telegram or WhatsApp while on the go, and it will search files, read local data, or execute scripts on your home machine.

**Where the danger lies:**
LLMs interpret instructions strictly literally. There are well-documented cases of users issuing vague commands like *"clean up and organize my inbox with thousands of old emails"*, only for the agent to trigger a permanent, bulk deletion command.

**How to operate safely:**
1. Use with caution and maintain active supervision.
2. Never disable the permission confirmation prompt. By default, it asks in the terminal or chat whether you authorize destructive actions. Only grant automated execution permissions to a script or task after you have seen the agent execute it successfully three or four times in a row.
3. Use secondary WhatsApp numbers for testing. Projects relying on web-scraping or unofficial connections face ongoing risks of account bans by the platform.
4. OpenClaw does not have native meeting recording capabilities; however, because it possesses OS-level control, you can script a routine where it launches Meetily, starts recording, and subsequently ingests the output file.

---

# Which Path Should You Choose?

During the HackTown talk, an audience member asked an essential question: **"If I can run local models, why on earth would I still need cloud models?"**

The answer comes down to cognitive scale and tolerance for ambiguity.

Smaller language models (3B to 8B parameters) are remarkably capable, but they require **far more literal prompt engineering**. If you open your local AnythingLLM chat and vaguely type: *"Take a look at my downloads folder and delete ISO files larger than 500 MB,"* depending on the model, it might hallucinate the classic response: *"I'm sorry, as an AI language model, I don't have access to your local files."*

To make a local model work reliably with tools (*tool calling*), you need to guide it step by step:
> *"You have access to the filesystem tool. Navigate to C:\Users\name\Downloads. List all files ending in .iso. Check the file size of each. For any files larger than 500 MB, delete them."*

Massive frontier models in cloud data centers (like Gemini Pro/Ultra or Claude Sonnet) boast hundreds of billions of parameters. They can infer user intent from partial sentences and orchestrate intermediate tool steps with far less friction.

A local model can achieve virtually identical practical results, but it requires you to understand its boundaries and calibrate how you frame requests. It's a quick learning curve.

## Quick Decision Tree

* **Scenario 1 — You only want to transcribe meetings and lectures:**
  Go with **Meetily**. It is lightweight, runs on any standard PC, stores your audio locally, transcribes using Whisper on-device, and incurs zero fees. If your employer provides Gemini, ChatGPT, or NotebookLM and you don't face privacy restrictions regarding transcripts, you can simply feed Meetily's transcripts to them for summarization.
* **Scenario 2 — You want full privacy, tailored summaries, a knowledge base (RAG), and automation routines:**
  Install **Ollama** and pair it with **AnythingLLM**. This is the gold-standard setup. It solves 95% of daily workflows for most users: records meetings, talks to documents, integrates with Google Mail and Calendar, and delivers a polished interface without terminal hassles.
  *(Tip: When configuring Ollama, check Task Manager to confirm layers are actually offloaded to your integrated GPU. If it drops to CPU and runs slow, feed your `ollama ps` output to Gemini or Copilot to fine-tune your environment variables).*
* **Scenario 3 — You want to study AI architecture, build n8n workflows, and orchestrate open-source stacks:**
  Choose **ODS**. It's a full-fledged open-source playground designed for local homelabs or machines with substantial memory headroom.
* **Scenario 4 — You want genuine OS automation and remote command via WhatsApp/Telegram:**
  Go with **OpenClaw**, while keeping strict human-in-the-loop controls and verifying tasks multiple times before allowing unconfirmed execution.

---

# Bonus — Other Useful Tools on the Radar

During the experimentation phase prior to consolidating my core stack, several standalone open-source tools proved valuable and deserve a shoutout:

## Private Web Search — Vane (formerly Perplexica) + SearXNG
For those who want an experience similar to Perplexity (web search with direct source citations), but 100% private and aggregating sources via SearXNG without ad tracking:
```bash
docker run -d -p 3001:3000 -v vane-data:/home/vane/data --name vane itzcrazykns1337/vane:latest
```
In the setup screen at `http://localhost:3001`, point to Ollama using `http://host.docker.internal:11434` (enabling the container to communicate with the host).

## Automated AI Slide Presentations — Presenton
Generates complete slide decks from a summary or prompt, exporting to editable formats (`.pptx` and PDF) under the Apache 2.0 license:
```bash
docker run -d --name presenton -p 5001:80 -v ./app_data:/app_data ghcr.io/presenton/presenton:latest
```
*(On Windows PowerShell, replace `./app_data` with `${PWD}\app_data`).*

---

# A Note on Models and Common Sense

Language models make mistakes. Humans make mistakes all the time, but LLMs make mistakes with staggering conviction. They possess neither a sense of self-preservation nor an innate concept of danger.

Always supervise what you place into the hands of autonomous agents. Nobody wants to see another headline about someone running an unchecked script that wiped their own workspace. Exercise caution, test inside sandboxed environments, and above all, unlock the potential of the hardware already sitting on your desk.

We often get swept up in the narrative that we must subscribe to costly monthly Big Tech cloud plans in US dollars to unlock cutting-edge productivity. The reality is that your current laptop, powered by carefully chosen open models and well-orchestrated tools, can solve the vast majority of bottlenecks with total data sovereignty and zero recurring costs.

In fact, this philosophy of running AI locally on owned hardware is the exact same one I detailed in another article on my site, where I documented building a local computer vision pipeline for security cameras: the AI analyzes footage directly on the edge, recognizes cars and people in real time, and only triggers video recordings and alerts when a pre-configured category enters the perimeter. The principle is identical: practical, local intelligence without relying on third-party cloud infrastructure.

---

# References and Useful Links

* **Meetily** — [meetily.ai](https://meetily.ai) · [github.com/Zackriya-Solutions/meetily](https://github.com/Zackriya-Solutions/meetily)
* **Ollama** — [ollama.com](https://ollama.com) · [Model Library](https://ollama.com/library)
* **AnythingLLM** — [anythingllm.com](https://anythingllm.com) · [Documentation](https://docs.anythingllm.com)
* **ODS (Osmantic Deployment System)** — [github.com/Osmantic/ODS](https://github.com/Osmantic/ODS)
* **OpenClaw** — [openclaw.ai](https://openclaw.ai) · [Channel Setup Guide](https://clawdocs.org/guides/channels)
* **Vane (formerly Perplexica)** — [github.com/ItzCrazyKns/Vane](https://github.com/ItzCrazyKns/Vane)
* **Presenton** — [presenton.ai](https://presenton.ai)

---

If this guide helped you set up your own personal assistant or unblocked a workflow, drop me a note on LinkedIn ([linkedin.com/in/vcasadei](https://linkedin.com/in/vcasadei)) or check out other projects and essays I publish at [vcasadei.com](https://vcasadei.com).