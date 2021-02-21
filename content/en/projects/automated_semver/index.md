---
title: "Automated Semver"
weight: 3
resources:
    - src: semver.png
      params:
          weight: -100
---

Automated Semver is a [Rust](https://www.rust-lang.org/) project used to generate correct package and application versions without
having to manually parse through merged commits. As part of getting more familiar with Rust and GitLab I wanted to create this project
to leverage both GitLab's [CI/CD](https://docs.gitlab.com/ee/ci/) and also get experience with how command line utilities work in Rust.
One of the cool things about this project is that it functions as a sort of [quine](https://en.wikipedia.org/wiki/Quine_(computing)),
where the project versions itself as well. I was able to get this project to a 1.0.0 version and the image of the executable can be found on
[DockerHub](https://hub.docker.com/r/skirkr/automated-semver). I also wrote a blog post detailing how this project can be used to
automate the versioning of other repositories, which can be found [here]({{< relref "blog/gitlab-releases" >}}), with a more detailed how-to
in the README of the repository on [GitLab](https://gitlab.com/scott-kirk/automated-semver).
