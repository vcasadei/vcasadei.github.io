---
layout: article
title: Atualizando Rede e Câmeras de Segurança em uma Propriedade Rural (com orçamento reduzido)
translation_key: upgrading-network-and-security-cameras
key: atualizando-rede-e-cameras-de-seguranca-pt
cover: /assets/images/upgrade-network.jpeg
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
    src: /assets/images/upgrade-network.jpeg
---

Compartilhando minha experiência atualizando a Rede Local, com e sem fio, e as câmeras e sistemas de segurança em uma propriedade rural de 6.000m<sup>2</sup>

<!--more-->

Meus pais moram em uma propriedade rural no interior do Brasil. É uma propriedade grande, porém a "área principal" tem cerca de 6.000m<sup>2</sup>, e a última vez que instalei câmeras e mexi com a rede Ethernet foi há uns 6 anos. Então, neste ano, tirei alguns dias de folga do trabalho e decidi fazer as coisas direito, com um orçamento reduzido.

# A situação Antes
Antes de começar qualquer coisa, eu tinha um [Roteador Ubiquiti EdgeRouter ER-X](https://s.click.aliexpress.com/e/_DBNZbiF) principal, que era responsável (e ainda é) por todo o roteamento e DHCP. Como ele não tem WiFi, eu também tinha um [Roteador WiFi WavLink AC1200 Dual Band](https://s.click.aliexpress.com/e/_DFqhaIB) (funcionando como AP - Access Point) que é dual band (2.4GHz e 5GHz) e resistente à água/intempéries, de forma que fica instalado do lado de fora da casa. Este era o único equipamento de rede conectado fisicamente por cabo Ethernet CAT6.

Também, na parte de cima da propriedade, mais perto da rua e a cerca de 60 metros do primeiro roteador WavLink, eu tinha um segundo roteador resistente à água/intempéries, desta vez um [Roteador WavLink AC300 2.4GHz](https://s.click.aliexpress.com/e/_DFqhaIB) mais lento (funcionando como um Repetidor WiFi, captando o sinal WiFi do primeiro roteador WavLink e o amplificando).

Por fim, eu tinha 3 [Câmeras IP WiFi HD 5MP genéricas chinesas com o aplicativo Yoosee](https://pt.aliexpress.com/item/1005005787945844.html). Sei que essas não são as melhores câmeras e nem as mais custo-efetivas para a maioria das pessoas, porém, onde moro, no Brasil, paguei cerca de R$80 (US$15) em cada uma, e elas são resistentes às intempéries, oferecem um aplicativo gratuito no qual posso ver e controlar as câmeras de qualquer lugar, usando qualquer conexão móvel, e ainda têm uma gravação básica de eventos ativada por movimento em um cartão SD local. Além disso, funcionam bem via WiFi e eu só precisava fornecer energia.

Você pode ver a disposição geral das câmeras, roteador e repetidores em uma captura de tela do Google Maps:

![Imagem](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/d1d3b31f-67a9-4bfd-9a4d-a00463d7fbe5_813x1902.webp "Vista aérea com a configuração anterior")

Essa configuração era barata e funcionou de forma confiável por anos (nos últimos 6 anos precisei substituir algumas coisas, principalmente uma ou duas câmeras e cartões SD que deram defeito). Além disso, conseguíamos monitorar a casa quando estávamos fora e também gravar alguns eventos para conferir depois.

No entanto, havia problemas, muitos problemas: quando chovia, o WiFi sofria e o Repetidor WiFi perdia a conexão, e com ele, a Câmera 3; com certa frequência, as câmeras perdiam a conexão e precisavam ser reiniciadas para voltar a funcionar, e tínhamos muitos pontos cegos que eu gostaria que estivessem cobertos. Mas, principalmente, posso categorizar os problemas como **Força/Disponibilidade do Sinal** e **poucas câmeras**. Além disso, eu queria uma forma de visualizar as câmeras ao vivo na rede local em um monitor e ter uma captura de movimento mais avançada, com detecção de objetos.

# A situação Depois
Para resolver o primeiro problema, tudo que eu precisava fazer era passar bastante cabo Ethernet pela propriedade e conectar todas as câmeras e repetidores com Ethernet cabeada. Fácil de falar, difícil de fazer, já que a área é grande: envolveu passar cabos pelo telhado, no subsolo, proteger os cabos das intempéries e muito mais. Mas precisava ser feito.

Basicamente, comprei uma caixa (300 metros) de cabo CAT6, conectores RJ-45 de qualidade (eu tinha comprado uns baratos e eram um lixo - acho que vou falar sobre eles em outro post, talvez), alguns [Switches TP-Link Gigabit TL-SG1005D](https://s.click.aliexpress.com/e/_DDMGKy7), um [Roteador Wireless TP-Link AC1200](https://s.click.aliexpress.com/e/_DBXc8cT) e mais 4 [Câmeras IP WiFi HD 5MP chinesas](https://pt.aliexpress.com/item/1005005787945844.html) com Ethernet cabeada.

No final, usei cerca de 70% do cabo que tinha, e o maior trecho de cabo sozinho teve cerca de 60 metros (como você pode ver na imagem abaixo). A configuração final da rede consiste no meu antigo [Roteador Ubiquiti EdgeRouter ER-X](https://s.click.aliexpress.com/e/_DBNZbiF) como servidor DHCP principal, o [Roteador WiFi WavLink AC1200 Dual Band](https://s.click.aliexpress.com/e/_DFqhaIB), o [Roteador WavLink AC300 2.4GHz](https://s.click.aliexpress.com/e/_DFqhaIB) e o [Roteador Wireless TP-Link AC1200](https://s.click.aliexpress.com/e/_DBXc8cT) funcionando como Access Points (APs - sem DHCP), dois [Switches TP-Link Gigabit TL-SG1005D](https://s.click.aliexpress.com/e/_DDMGKy7) e 7 câmeras (6 conectadas via Ethernet cabeada e 1 via WiFi).

Agora, tenho mais câmeras, elas são extremamente confiáveis, também tenho bom WiFi em qualquer lugar da propriedade e poderia facilmente adicionar mais câmeras se quisesse. Além disso, decidi usar as mesmas câmeras chinesas baratas porque são baratas, a qualidade é boa o suficiente e elas têm conexão local ONVIF.

Também fui um passo além e adicionei um servidor Frigate para gravar eventos baseados em Detecção de Objetos. Vou falar sobre isso em um próximo post.

![Imagem](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/e176889e-6c2a-43f5-94a7-f250ea22f3aa_840x1896.webp "Vista aérea com a nova configuração")

Se você tiver alguma dúvida ou sugestão, por favor, deixe um comentário abaixo.
