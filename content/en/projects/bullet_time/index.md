---
title: "Bullet Time"
weight: 3
resources:
    - src: sfml.png
      params:
          weight: -100
---

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A 2D game I wrote in C++ using the SFML library. The project was a pretty iterative journey, from just getting a black screen to show up on my monitor, to being able to affect the timescale of the gameplay as you're dodging enemies. From the very beginning I tried to make the game fairly extendable, since I was unsure the direction I really wanted to go with the game. Each object that can eventually be drawn on screen in SFML inherits from a 'Drawable' parent, which let me be able to aggregate my different player and enemy types into a singular map of UUIDs and Drawable pointers. This let me easily manage specific objects in the game and let me split out concerns in the game engine. The engine then grew to be a very modular project, where the map of drawables was the critical shared data store. As I added more and more different objects to this map, the game really took a life of its own and developed its own personality. What I love about the SFML framework is how clean the abstractions are for interacting with the underlying graphics hardware. I was able to have all of nitty-gritty OS-level interactions handled by this single library, which let me just concentrate on the actual C++ game logic development. I'm still iterating on the game and making improvements fairly regularly, just because it's so easy to go from idea to implementation with the current setup.

