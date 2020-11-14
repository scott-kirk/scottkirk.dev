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
and then bumping the release version accordingly, something easily automatable.

Before diving into how to version releases, a
versioning scheme has to be agreed upon. [Semantic Versioning](https://semver.org/) has
become an incredibly popular standard for software versioning, and for good reason.
Modern software has become a web of dependencies, and keeping track of how your product
is affected by new releases of those dependencies is a nightmare, but Semantic
Versioning brings order to the chaos through very clearly stating how software
may change based on its new version. In short, the versioning scheme is
`Major.Minor.Patch`, where `Major` bumps are API changes, `Minor` bumps are new
features, and `Patch` bumps are bug fixes. All changes to released software
that is released should fall into those 3 different buckets, and thus the
version of a release is strictly tied to the actual changes being released.
<br/><br/>
The most important takeaway is that by having the versioning scheme be strictly
tied to actual code changes, the version itself can then be automatically generated
by analyzing those past changes.

With the above context out of the way, we can now
jump into what it looks like to implement automated versioning in a git project. The
convention I decided to go with for my commit labeling was `major`, `minor`, `patch`,
and `infra`. While not all encompassing, I felt these labels were a good enough
starting point for organizing the types of commits being created. The `infra` label
refers to changes to that do not directly affect the product code, thus they have
no impact on the versioning of a release. Some examples of the formatting are below:
```
JIRA-1201 Fixed that bug

patch
```
```
JIRA-001 Optimized compilation of submodule

infra
```

If the two commits above came after a release with the version `2.4.1`, then the commit
parser would be able to see that only a patch and infrastructure change merged, thus
it would set the next version to be `2.4.2`, as that corresponds to a patch release.
If there were only infrastructure changes found then the release would not take place.
Where this really comes in handy is when you have an automated CI/CD pipeline that
preps a potential software release, as now the only human interaction is a once-over
of the proposed new version and changelog, and then a confirmation of the new deployment.

I've recently become quite enamored with GitLab's built-in
[CI/CD pipelines](https://docs.gitlab.com/ee/ci/README.html), so the example implementation
will be in `.gitlab-ci.yml` format.
