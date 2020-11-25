---
title: "Automating GitLab Releases Start to Finish"
date: 2020-11-12T18:20:00-05:00
---

Releasing software is difficult, and determining
the version of it is just one more thing that can go wrong. I've found that
shifting the 'things that can go wrong' to the left as much as possible
promotes quicker feedback and a better understanding of whatever change is
being made. By capturing the significance of a code change in the commit itself,
versioning a software release becomes a matter of simply scanning the commit
history, finding the most significant change based off of the commit message,
and then bumping the release version accordingly, something easily automated.

Before diving into how to version releases, a
versioning scheme has to be agreed upon. [Semantic Versioning](https://semver.org/) has
become an incredibly popular standard for software versioning and for good reason.
Modern software has become a web of dependencies, and keeping track of how your product
is affected by new releases of those dependencies is a nightmare, but Semantic
Versioning brings order to the chaos through very clearly stating how software
may change based on its new version. In short, the versioning scheme is
`Major.Minor.Patch`, where `Major` bumps are API changes, `Minor` bumps are new
features, and `Patch` bumps are bug fixes. All changes to released software
should fall into those 3 different buckets, and thus this versioning scheme
ensures that the released version is strictly tied to the actual changes being released.

The most important takeaway is that by having the versioning scheme be rigidly
tied to actual code changes, the version itself can then be automatically generated
by simply analyzing those past changes.

With the above context out of the way, we can now
jump into what it looks like to implement automated versioning in a git project. The
convention I decided to go with for my commit labeling was `major`, `minor`, `patch`,
and `infra`. While not all encompassing, I felt these labels were a good enough
starting point for organizing the types of commits being created. The `infra` label
refers to changes to that do not directly affect the product code, thus they have
no impact on the versioning of a release. Some examples of the formatting are below:

>JIRA-1201 Fixed that bug
>
>patch

>JIRA-001 Optimized compilation of module
>
>infra

If the two commits above came after a release with the version `2.4.1`, then the commit
parser would be able to see that only a patch and infrastructure change merged, thus
it would set the next version to be `2.4.2`, as that corresponds to a patch release.
If there were only infrastructure changes found, then the release would not take place.
Where this really comes in handy is when you have an automated CI/CD pipeline that
can prep a potential software release, as now the only human interaction is a once-over
of the proposed new version and changelog, and then a confirmation of the new release.

I've recently become quite fond of GitLab's built-in
[CI/CD pipelines](https://docs.gitlab.com/ee/ci/README.html), so the example implementation
will be in `.gitlab-ci.yml` format. One of the great benefits of using GitLab's pipeline
infrastructure is that there's a lot of ready built CLI tools for interacting with the
GitLab API, as well as a number of builtin environment variables. I've found that splitting
up the project's pipeline into two separate flows is really conducive for this method
of versioning, one flow for building and testing, and then another flow for actually doing
a release. My projects usually follow this stage setup:
```
stages:
  - build
  - generate_ver
  - tag
  - publish
```
The `build`, `generate_ver`, and `tag` stages all only run on regular pushes and merges and
not tags. This behavior is from adding the following yaml to those stages:
```
rules:
    - if: $CI_COMMIT_BRANCH
```
The final stage of the pipeline, `publish`, runs exclusively when tags are pushed, accomplished
by adding this rule:
```
rules:
    - if: $CI_COMMIT_TAG
```

The stage that actually does the automated versioning is the `generate_ver` stage. This stage
leverages a simple Rust program that will iterate over the commit history until the latest
version tag and determines the highest version bump that should occur. All this stage does is
execute that program and pipes the new version to the next stage, `tag`. A nice benefit of
using the GitLab API in the pipeline is that all the credentials are baked into the job runner,
so performing the GitLab release, which adds the tag to the repo, is as simple as this:
```
Tag Release:
  stage: tag
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  rules:
    - if: $CI_COMMIT_BRANCH
      when: manual
      allow_failure: true
  script:
    - >
      release-cli create --name $NEW_VERSION --description automated-release
      --tag-name $NEW_VERSION --ref $CI_COMMIT_SHA
```

The following stage, `publish`, then simply publishes the project artifacts with the given tag.
An added benefit of setting up the `publish` stage to always run on tags is that you can then
also do releases from the UI of GitLab for specific version overrides.

And that's pretty much it! With this pipeline setup, all that has to be done to do a release
is a single click of `run` on the manual tag job and it'll all be versioned properly without any human
intervention. Furthermore, by having each commit labeled with the change, the automated-semver
program could even auto-generate changelogs with all the changes correctly categorized. At the
end of the day, the crucial thing here is how important it is to add enough information to
your commit messages in order for something _or someone_ to make sense of the impact of a commit.

With that, I leave you with some links to the example source code and the image I created
to do the commit message parsing.
* The entire pipeline description can be found [here](https://gitlab.com/scott-kirk/automated-semver/-/blob/master/.gitlab-ci.yml)
* The GitLab project also publishes the Rust program as an image on [docker hub](https://hub.docker.com/r/skirkr/automated-semver)
* The source code for the automated-semver Rust program is [here](https://gitlab.com/scott-kirk/automated-semver/-/blob/master/src/main.rs)
