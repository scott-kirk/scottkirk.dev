---
title: "Raspberry Pi"
weight: 3
resources:
    - src: pi.png
      params:
          weight: -100
---

This little circuit board is a self hosted Linux server that is powering the website you're
looking at right now. It runs all of my home services like a docker registry and file store.
Modern devops can feel a lot like 'plug and chug', in terms of how many Cloud services are available
at the click of a button, making it difficult to understand and control something
from the ground up. Building a home server with a Raspberry Pi gave me the opportunity
to build my own infrastructure with as much fine tuning as I wanted, at my own pace and for my
own learning. Over a few weeks I was able to build out a headless server that
would update public DNS records with its own dynamic IP in order to host my
personal web pages on the public web with TLS encryption and secure SSH access.
