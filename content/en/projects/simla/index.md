---
title: "Simla"
weight: 3
resources:
    - src: sfml.png
      params:
          weight: -100
---

Simla is a ["falling-sand"](https://en.wikipedia.org/wiki/Falling-sand_game) game, which is a genre of games characterized
by simulating 2D particles. I wanted to get more familiar with Rust, so I decided to built out the simulation all in the language,
powered by the wgpu library. Most of my low-level game development experience had been in C++ before this, so it was refreshing being
able to still use a low-level language but with a lot of modern syntactical sugar. I also wanted to create a dev environment that was
easy to move between workstations and that also supported cross-platform development and distribution, hence the wgpu backend. Using
external libraries with C++ had always been a sore spot for me, so being able to leverage cargo was a real breath of fresh air for game
development. Through just following the [Rust book](https://doc.rust-lang.org/book/) I was able to get up and running with creating a
simple control loop that provided the mechanism for the simulation engine. To get prototypes of the game out faster I decided to also
leverage the [Pixels engine](https://github.com/parasyte/pixels) which exposed a very simple way of manipulating buffers of pixels that
would be drawn. Right now the simulation supports sand, stone, and water, but I've been working on adding a few more particle types and
optimizing the overall simulation. The project can be found on GitLab [here](https://gitlab.com/scott-kirk/simla).
