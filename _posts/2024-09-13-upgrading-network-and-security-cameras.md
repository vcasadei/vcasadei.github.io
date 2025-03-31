---
layout: article
title: Upgrading Network and Security Cameras on a Rural Property (on a budget)
key: upgrading-network-and-security-cameras
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

Sharing my experience upgrading the Local Wired and Wireless Network and Security Cameras and systems in a 6.000m<sup>2</sup> rural property

<!--more-->

My parents live in a rural property in the countryside in Brazil. It’s a big property, however, the “main area” comes about to 6.000m<sup>2</sup> and the last time I had installed cameras and messed with the Ethernet was about 6 years ago. So this year I took some days off work and decided to do things properly, on a budget.

# The situation Before
Before I started doing anything, I had a main [Ubiquiti EdgeRouter ER-X Router](https://s.click.aliexpress.com/e/_DBNZbiF) that was responsible (and still is) for all the routing and DHCP. As it does not have WiFi, I also have a [WavLink AC1200 Dual Band WiFi Router](https://s.click.aliexpress.com/e/_DFqhaIB) (working as AP - Access Point) that is dual band (2.4GHz and 5GHz) and water/weather resistant, so that it is located outside the house. This is the only piece of Network Equipment that was physically connected through CAT6 Ethernet cable.

Also, in the upper part of the property, closer to the street and about 60 meters from the first WavLink Router, I had a second water/weather resistant router, this time a slower [WavLink AC300 2.4GHz Router](https://s.click.aliexpress.com/e/_DFqhaIB) (this time working as a WiFi Repeater, capturing WiFi signal from the first WavLink router and enhancing it).

Finally, I had 3 generic Chinese [IP WiFi HD 5MP Camera with Yoosee app](https://pt.aliexpress.com/item/1005005787945844.html). I know these are not the best cameras and not even the most cost effective for most people, however, where I live, in Brazil, I paid about R$80 (US$15) each and they are weather resistant, offer me a free app in which I can see and control the cameras from anywhere, using any mobile connection and even have a basic motion-activated recording of events on an local SDCard. Also, they work well though WiFi and I only needed to supply power.

You can see the general disposition of the cameras, router and repeaters on a Google Maps screenshot:

![Image](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/d1d3b31f-67a9-4bfd-9a4d-a00463d7fbe5_813x1902.webp "Aerial view with the previous setup")

This setup was cheap and worked reliably enough for years (in the last 6 years I had to replace some things, mainly one or two cameras and SDCards that went bad or became faulty. Also, we could monitor the house when we were away and were also able to record some events and checkout later.

However, there were problems, a lot of problems: when it rained, the WiFi would suffer and the WiFi Repeater would loose connection and with it, the Camera 3; with some frequency, the cameras would loose connection and needed to be power cycled to come back online and we had many blind spots that I whish we had eyes on. But mainly I can categorize the problems as **Signal Strength/Availability** and **too few cameras**. Also I wanted a way to live view the cameras on local network in a monitor and have a more advanced motion capture with object detection.

# The situation After
To fix the first problem all I needed to do was route a whole lot of Ethernet cable through the property and connect all cameras and repeaters with wired Ethernet. That’s easier said than done as the are is big, it involved laying cables though the roof, underground, protect the cables from the elements and much more. However, it needed to be done.

I basically bought a box (300 meters) of CAT6 cable, quality RJ-45 connectors (I had bough cheap ones and they were trash - I think I will talk about them in another post, maybe), a couple [TP-Link Gigabit TL-SG1005D Switches](https://s.click.aliexpress.com/e/_DDMGKy7), a [TP-Link AC1200 Wireless Router](https://s.click.aliexpress.com/e/_DBXc8cT) and 4 more Chinese [IP WiFi HD 5MP Cameras](https://pt.aliexpress.com/item/1005005787945844.html) with wired Ethernet.

In the end, I used about 70% of the cable I had and the biggest cable run took about 60 meters alone (as you can see on the image below). The final network configuration consists of my old [Ubiquiti EdgeRouter ER-X Router](https://s.click.aliexpress.com/e/_DBNZbiF) as a main DHCP server, the [WavLink AC1200 Dual Band WiFi Router](https://s.click.aliexpress.com/e/_DFqhaIB), [WavLink AC300 2.4GHz Router](https://s.click.aliexpress.com/e/_DFqhaIB) and [TP-Link AC1200 Wireless Router](https://s.click.aliexpress.com/e/_DBXc8cT) working as Access Points (APs - without DHCP), two [TP-Link Gigabit TL-SG1005D Switches](https://s.click.aliexpress.com/e/_DDMGKy7) and 7 Cameras (6 connected via wired Ethernet and 1 on WiFi).

Now, I have more cameras, they are extremely reliable, I also have good WiFi anywhere in the property and could easily add more Cameras if I wanted to. Also, I decided to use the same Chinese cheap cameras because they are cheap, the quality is good enough and they have ONVIF local connection.

I also have gone one step further and added a Frigate server to record events based on Object Detection. I will talk about this in a next post though.

![Image](https://raw.githubusercontent.com/vcasadei/vcasadei.github.io/refs/heads/master/assets/images/e176889e-6c2a-43f5-94a7-f250ea22f3aa_840x1896.webp "Aerial view with the new setup")

If you have any questions or suggestions, please, leave a comment below.