---
layout: article
title: Melhorando a Segurança Residencial usando IA
translation_key: improving-home-security-using-ai
key: melhorando-a-seguranca-residencial-com-ia-pt
cover: /assets/images/improving-home-security-using-ai.jpeg
show_excerpt: false
mode: immersive
header:
  theme: dark
article_header:
  type: overlay
  theme: dark
  background_color: '#203028'
  background_image:
    gradient: 'linear-gradient(135deg, rgba(7, 44, 24, 0.69), rgba(38, 3, 38, 0.64))'
    src: /assets/images/improving-home-security-using-ai.jpeg
---

Como configurei a Detecção de Objetos para melhorar meu CCTV/NVR residencial personalizado.

<!--more-->

No meu [post anterior](#todo) falei sobre como melhorei a confiabilidade e a cobertura das câmeras na propriedade rural dos meus pais usando hardware barato. Se você está buscando informações sobre a configuração de rede e quais câmeras estou usando, confira aquele post.

Neste post, vou compartilhar como configurei um software chamado [Frigate NVR](https://frigate.video/) para usar modelos de IA de detecção de objetos, gravando eventos apenas quando há movimento de pessoas, carros e outras categorias de objetos nas minhas câmeras, economizando bastante armazenamento e mantendo no meu arquivo apenas o que realmente importa.

# O Software - Frigate NVR

Existem muitas soluções gratuitas de NVR por aí, algumas até oferecendo recursos de IA, mas escolhi o Frigate porque era fácil de implantar usando [docker](https://www.docker.com/) (poupando o trabalho de resolver possíveis problemas de instalação e sendo agnóstico quanto ao sistema operacional), fácil de integrar com o Home Assistant e por ter uma documentação razoavelmente boa.

Para começar a instalação, precisei escolher em qual hardware iria rodar o Frigate, e decidi testar o [Radxa-X2L](https://radxa.com/products/x/x2l/), um Single Board Computer (SoC) x86 com um Intel J4125 de 4 núcleos e 4GB de RAM LPDDR4. Esse SoC é ótimo porque, sendo x86, posso rodar qualquer sistema operacional sem me preocupar com compatibilidade, além de ser bem potente e ter muito suporte.

O sistema operacional que escolhi foi o derivado do Debian mais leve que conheço: o [DietPi](https://dietpi.com/). Com o DietPi, consegui instalar uma imagem compatível com computadores x86 que tem o menor número de processos que conheço em estado ocioso e na configuração padrão. Além disso, tem ótimo suporte e documentação e é bem simples de gerenciar e instalar outros softwares (como o Docker).

## Instalando/Rodando o Frigate

Como eu disse antes, você não precisa instalar o Frigate, já que ele roda em um container docker: para executá-lo, é preciso iniciar um container com um comando docker run ou um arquivo docker compose. Abaixo você pode ver o meu arquivo (você também pode obtê-lo no [meu GitHub](https://github.com/vcasadei/Frigate-Configuration)):

### docker-compose.yml
{% highlight docker linenos mark_lines="11 13"%}
version: "3.9"

services:
  frigate:
    container_name: frigate
    image: ghcr.io/blakeblackshear/frigate:stable
    privileged: true
    cap_add:
      - CAP_PERFMON
    restart: unless-stopped
    shm_size: "2g" # adjust based on the number of cameras and resolution
    volumes:
      - /dev/apex_0:/dev/apex_0
      - /etc/localtime:/etc/localtime:ro
      - /DATA/AppData/frigate/config:/config
      - /DATA/AppData/frigate/media:/media
    ports:
      - "80:5000" # Web UI
      - "8554:8554" # RTSP feeds
      - "8555:8555/tcp" # WebRTC over tcp
      - "8555:8555/udp" # WebRTC over udp
    environment:
      - FRIGATE_RTSP_PASSWORD="password"
      - LIBVA_DRIVER_NAME=i965
{% endhighlight %}

Algumas considerações importantes: o `shm size` precisa ser calculado com base no número de câmeras que você tem ([confira a documentação](https://docs.frigate.video/frigate/installation#calculating-required-shm-size)). Além disso, em devices (`/dev/apex_0:/dev/apex_0`), você pode notar que estou usando uma placa [Google Coral TPU](https://s.click.aliexpress.com/e/_DEaAT0J); essa é uma placa adicional conectada na conexão M.2-E do Radxa-X2L, onde normalmente ficaria um cartão WiFi. A placa Coral é quem vai rodar os modelos de IA, em vez de usar o processador Intel embutido.

É possível usar o processador Intel embutido, e eu até comecei usando ele, quando tinha apenas 3 câmeras configuradas, mas era processamento demais e o processador ficava sempre em 100% de utilização e esquentando bastante, mesmo com o cooler oficial. Então segui a recomendação do Frigate e comprei uma placa Coral TPU. Agora, todo o processamento de IA roda na TPU, tenho 7 câmeras e ainda tem espaço para mais!

Por fim, quero chamar sua atenção para o arquivo de configuração listado no compose. O meu pode ser visto na próxima seção, mas você vai precisar de um arquivo com pelo menos uma câmera configurada para o Frigate iniciar.

Você também pode querer mudar suas portas e outras configurações, e para isso recomendo a [documentação oficial](https://docs.frigate.video/).

Com o seu arquivo `docker-compose.yml` pronto, basta rodar o seguinte comando para iniciar o servidor (supondo que você já tenha o Docker instalado e configurado):

```
docker compose up
```

## Configurando o Frigate

Com o Frigate rodando, você tem muitas opções e configurações para escolher, e embora a documentação seja bastante completa, ainda acho que faltam alguns vídeos mostrando como as coisas funcionam. Dito isso, não sou um especialista em Frigate, longe disso. Então vou compartilhar minha configuração e tentar explicar tudo o que fiz.

No trecho de código abaixo você verá parte do meu arquivo de configuração, já que tenho várias câmeras e muitas coisas se repetem entre elas. Confira o [meu GitHub](https://github.com/vcasadei/Frigate-Configuration) para o arquivo completo.

{% highlight conf linenos mark_lines="7 11 15"%}
mqtt:
  enabled: false
birdseye:
  enabled: true
  mode: continuous
  quality: 10
objects:
  track:
  - person
  - car
detectors:
  coral:
    type: edgetpu
    device: pci
cameras:
  Entrada:
    birdseye:
      enabled: true
    enabled: true
    ffmpeg:
      input_args: preset-rtsp-udp
      inputs:
      - path: rtsp://admin:admin@192.168.1.11:554/onvif1
        input_args: preset-rtsp-udp
        roles:
        - detect
        - record
    detect:
      width: 1280
      height: 720
      fps: 15
    record:
      enabled: true
      events:
        required_zones:
        - entrada_portao
        - portao_rua
      retain:
        days: 30
        mode: motion
    zones:
      entrada_portao:
        inertia: 1
        coordinates: 868,221,866,127,1280,50,1280,720,447,720,359,720,296,419
        objects:
        - person
        - car
      portao_rua:
        coordinates: 341,566,838,399,786,180,283,303
        objects:
        - person
...
{% endhighlight %}

Neste arquivo de configuração há algumas coisas interessantes. Primeiro, fica claro que não estou usando mqtt, já que não está habilitado. Além disso, não uso muito o Birdseye; ele está habilitado, mas configurei apenas uma câmera para isso. Na **linha 7** estou habilitando o rastreamento das categorias *person* e *car* (há uma lista de objetos que podem ser rastreados na [documentação](https://docs.frigate.video/configuration/objects/) - também é possível adicionar ainda mais com modelos personalizados). Na **linha 11** configurei o uso da minha placa Coral TPU para as tarefas de IA, e então na **linha 15** começo a adicionar as câmeras.

Para a câmera *"Entrada"*, estou configurando uma URL de entrada que usa o protocolo RTSP e informando que esse feed deve ser usado para detectar e gravar. Também configurei a largura e altura para rodar o modelo de IA de detecção de objetos. É importante notar que eu poderia usar uma resolução menor e também reduzir o fps para a detecção de objetos, mas, por enquanto, está funcionando bem.

Também configurei duas zonas: a primeira, *"entrada_portao"*, tem suas coordenadas e vai verificar e gravar apenas quando detectar um carro ou uma pessoa. A segunda, *"portao_rua"*, só vai gravar quando uma pessoa for detectada. Fiz isso porque a segunda zona contém parte da rua e não quero gravações de carros aleatórios passando na rua. Essa é uma grande vantagem de flexibilidade desse tipo de gravação em NVR.

Além disso, tenho outras câmeras mais internas na propriedade, e como tenho 3 cachorros e 1 gato, não quero que as câmeras gerem eventos toda vez que meus bichos de estimação se movem, então configurei a IA para não procurar por eles.

Também há outras coisas interessantes que podem ser feitas, como configurar zonas com objetos estacionários que devem ser ignorados (por exemplo, um carro estacionado na sua vaga), e eu uso várias dessas configurações; você pode conferir na [configuração completa](https://github.com/vcasadei/Frigate-Configuration/blob/main/config.json) ou também na documentação do Frigate.

## Uso de Hardware e outras métricas

Na animação abaixo, compartilho o uso de hardware do SBC rodando esta instância do Frigate. Como você pode ver, a CPU fica bem ocupada com o processamento e gravação de vídeos via ffmpeg. Mas também dá para ver, nos processos, que o detector do frigate está usando a Coral TPU. Além disso, estou usando quase toda a memória e atualmente tenho um SSD de 1TB que está quase todo ocupado armazenando arquivos (configurei para os arquivos serem preservados por 1 mês).

<div>{%- include extensions/youtube.html id='TLV8--Vk9do' -%}</div>

Como você pode ver, o computador fica bem ocupado, porém eu poderia mudar algumas configurações, como reduzir o fps ou a resolução das câmeras, para conseguir adicionar ainda mais.

Para quem tiver curiosidade de ver mais, também estou adicionando algumas capturas de tela com métricas de Sistema e Armazenamento, além de uma visão simples dos eventos e câmeras.

| ![Imagem](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/home-security-ai/1.jpg "Imagem 1"){:.rounded} | ![Imagem](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/home-security-ai/2.jpg "Imagem 2"){:.rounded} |
| ![Imagem](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/home-security-ai/3.png "Imagem 3"){:.rounded} | ![Imagem](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/home-security-ai/4.png "Imagem 4"){:.rounded} |

# Monitor de CFTV em Tempo Real

Por fim, com o Frigate configurado e rodando, agora tenho uma implementação de DVR inteligente na qual posso confiar que só vai gravar o que é importante. Agora, outra funcionalidade importante que eu precisava resolver é o monitoramento ao vivo das câmeras, não todas, mas principalmente aquelas que mostram a rua e o acesso principal à propriedade, já que a casa em si fica a uns 150m do portão, e é útil ver quem está no portão antes de atender.

Nós temos uma campainha inteligente: uma [Intelbras Allo w3+](https://loja.intelbras.com.br/videoporteiro-allo-w3mais/p). Ela já está meio velha e só funciona com conexão WiFi, funcionando bem na maior parte do tempo. É boa para mostrar no celular quando alguém aperta a campainha, mas a transmissão ao vivo não é estável e o ângulo da câmera também não é bom. Por isso, é necessária uma outra forma de ver o portão.

Para isso, comprei um [monitor barato de 11"](https://s.click.aliexpress.com/e/_DeaNa9d) com resolução de 1366x768px. Não é muita coisa, mas vai ficar na sala, do lado da TV, para que meus pais possam monitorar com facilidade enquanto relaxam e/ou assistem TV.

Além disso, eu queria ter um layout personalizado, com uma câmera principal e outras câmeras em seções menores, como na imagem abaixo. Isso me levou a uma verdadeira jornada tentando encontrar o software perfeito que rodasse em uma [Raspberry Pi 3B+](https://s.click.aliexpress.com/e/_DDs3cCb) que eu tinha guardada e que exibisse streams RTSP com diferentes codificações.

![Imagem](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/home-security-ai\camera-grid.png "Grade para 5 câmeras"){:.rounded}

Acabei testando várias opções (VLC, Moonfire NVR, RPISurv, CamPlayer, Motion, Frigate Birdseye, Camera.ui e mais), porém, ou elas não ofereciam a opção de rodar o layout que eu queria, ou rodavam em uma versão mais antiga do Debian, ou não eram otimizadas o suficiente para rodar vários streams em uma Pi 3B+.

Por fim, a solução veio com um software chamado Agent DVR. Essa solução tem a possibilidade de gravar e visualizar câmeras ao vivo, e até tem alguns recursos de IA, porém desabilitei tudo, exceto a visualização ao vivo, e ela me permitiu criar um layout personalizado e rodar 5 câmeras na Pi.

![Imagem](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/home-security-ai\cctv-grid.jpeg "Interface do Agent DVR com feeds de câmeras em uma grade de 5 câmeras"){:.rounded}

No final, a Pi consegue rodar os 5 feeds, mas só isso. Cheguei a tentar 6, mas começava a perder frames ou streams. Mas estou satisfeito com apenas 5 feeds, e se algum dia eu quiser mais, posso simplesmente usar uma Pi 4 ou 5.

# Conclusões

No final, consegui tudo o que queria, e esse sistema já está rodando há cerca de um mês sem problemas (ou com problemas mínimos). Neste post, tentei mostrar como podemos usar IA para ajudar no monitoramento de segurança em streams de vídeo em um cenário real, sem conhecimento específico sobre IA e com software de código aberto e/ou gratuito.

Se você tiver alguma dúvida sobre a configuração, por favor, deixe um comentário que vou tentar ajudar.
