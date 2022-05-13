---
title: "Autoscale Server"
weight: 2
resources:
    - src: mc.png
      params:
          weight: -100
---

Over the holidays my friends and I started a [MineCraft](https://www.minecraft.net/en-us) server on my local computer. It worked perfectly fine while we were all in the same area with the same schedule and timezone, but when the holidays came to an end we all went back to our different homes and schedules. This made it much more difficult to keep a server running that'd be available for everyone at the different times they wanted to use it.

That was the main motivation for my [game-server](https://github.com/scott-kirk/game-server) project. I wanted to build infrastructure that anyone could deploy and easily interact with in the Cloud, with a focus on minimizing cost per month. With a server and world size that could accomodate about 7 players, the cost came to just under 3 dollars per month. The entire infrastructure is controllable with simple [Terraform](https://www.terraform.io/) commands and a [Discord bot](https://discord.com/developers/docs/intro).

The server infrastructure is deployed to [AWS](https://aws.amazon.com/) and consists of an ec2 autoscaling group, storage resources, and lambda functions. These all work together to expose an idempotent REST API for the [Rust-based](https://www.rust-lang.org/) Discord bot to interface with. One could schedule a server startup, schedule its shutdown, check how long until shutdown, and request server metrics backed by [Prometheus](https://prometheus.io/). This Discord bot made interacting with the server incredibly user friendly, as users would be able to modify the AWS resources through just chat messages, and access control could all be handled with the Discord APIs.
