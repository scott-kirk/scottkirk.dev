---
title: "The Unexpected Consequences of Single-use Kafka Producers"
date: 2020-12-18T10:15:00-05:00
---

Kafka is fast. It's also pretty lean in production too, taking up very little heap space and CPU.
As an administrator of thousands of Kafka clusters, it's gotten to a point where the behavior
of the brokers are fairly known and there's not really any major changes in resource usage patterns
over time, even with new applications leveraging Kafka for their data. But there's always outliers.
One new feature relying on Kafka managed to bring a canary cluster to its knees, taking out the entire
set of brokers deployed there. There was an insidious memory growth over the weeks after the new
application was deployed, slowly pushing all the brokers to their maximum heap, until over the weekend
where they suddenly started triggering alerts and then crashed from running out of memory. The root cause?
Closing and recreating the Kafka producer between pushes of data.

## How it Happened

### Problem 1
When your current thread has finished using a resource, it's often best practice to close the resource,
whether it be file handles or network connections. This pattern has become pretty ingrained in many
developers minds, so it was not a major surprise to see an application that would close it's Kafka
producer when it was done sending its batch of data. A common practice for Kafka applications is to
have a singleton producer that's only closed when the application itself is shutting down, but this
is usually for performance reasons. When a Kafka producer boots up it has to query the metadata of
the cluster in order to know where to send its data when its told to produce to a topic which can be
a pretty slow process, thus Kafka producers are best created at startup and then used throughout
the lifetime of the application.

This application didn't really require high performance though, so no performance issues were detected
when the producer was instead recreated every time the application decided to push data to Kafka. Even
when this inefficiency was noticed it was just another thing put on the backlog since it had no user impact.
Unfortunately trying to save time by ignoring this ended up causing weeks of headaches and the
reprioritization of the backlog of the team who built the application.

The crash of the canary cluster wasn't *really* caused by just reopening a producer repeatedly. As with most
complex incidents, it was a perfect culmination of decisions that led to the crash. There were four isolated
decisions that all intertwined to create this storm. One was obvious, **the recreating of the producer**. The others,
not so much.

### Problem 2
Another common pattern that's used when creating data with Kafka is idempotence. An idempotent producer guarantees
exactly once delivery of data, thus simplifying data processing downstream since consumers never have to
deal with duplicate messages. It's a simple flag on the producer configuration, so not much
thought has to be put into enabling it. There is one important detail to keep in mind though, and that's that
at the end of the day somehow the Kafka brokers have to keep track of what the producer is sending so that it can do any
necessary deduping. This tracking is stored on the heap in order to keep some semblance of performance while the
producers are pushing their data. Basically the broker keeps tracks of each unique idempotent producer id and
the metadata of the last batch that it sent, to ensure no data is accidentally persisted more than once. This
metadata is then stored until the data that was persisted is no longer retained. While this has a performance impact,
again, this application wasn't really geared towards performance, so **idempotency was enabled**. The opportunity for
unbounded memory growth in the brokers is already starting to present itself.

### Problem 3
A lot of the data that flows through Kafka can be pretty short-lived. One of the most powerful use cases of Kafka
is leveraging it as a buffer between separate data processors. An important difference with how this application
used Kafka was how it actually **leveraged Kafka for long-term storage of data**. The data the application was generating
was expected to hang around for potentially even years. Kafka can handle basically any size of a topic though due
to how it internally splits up a topic into separate partitions which are then split up even more into separate segments
on disk. It wasn't really a red flag to hear that this application would not be aging off its data and that it'd store
it until some user event.

### Problem 4
The final nail in the coffin was the fact that the application **did not use a consistent producer id** during its
lifetime. This meant that the brokers weren't having to keep track of just one idempotent producer, but potentially
thousands upon thousands over time.

### The Storm
These four horsemen all worked together to create the Kafkapocalypse for our canary. In a quick summation, if you have
unique idempotent producers being repeatedly created that are producing long-term data, your brokers will quickly
and permanently run out of memory. Since the brokers keep track of unique idempotent producers for as long as their
data is retained, it's a simple but dangerous recipe to accidentally follow.

Now getting to this root cause was the interesting bit. While the problem itself was simple, finding it from just
"The Kafka brokers have run out of memory" was not.

## The Investigation
The first step I always take in these scenarios is a quick look at some nice Grafana dashboards. The panels we had set up tracked request and network thread utilization, as well as some per-topic-partition health metrics. What was a wrinkle was that everything was green across the board, not a single issue according to the Kafka health dashboard.

Without the aid of the dashboards, the next plan of action was to determine "what's changed in the software between last week and this week", with a focus on Kafka interactions. Thankfully the dashboards still had _some_ usefulness to them, as by increasing the timescale of the partition health panels we could see that the amount of tracked partitions had changed.

Armed with the knowledge that the number of partitions had changed, the question was then "what were those new partitions, and could they be the root cause?". After sshing into the affected servers we were able to list out all the current topics in the cluster and noticed a new set of topics that corresponded to an experimental feature another team was developing. In parallel to this investigation, a heap dump was also performed on the Kafka brokers, revealing that the majority of the memory was from a list of idempotent producer ids.

These two bits of information in hand led us to the producer code of the new experimental feature. From there we found that every single new producer record would spawn a new idempotent producer, and never close the previous. At this point we had enough information to try to reproduce this internally and prove the issue was the producer lifecycle.

Sure enough, the two experiments that ran showed memory growth only when the idempotent producer was created per record. The fix was then trivial for the product code, the idempotent producer had to simply be a singleton that persisted between record produces. Interestingly, this change did _nothing_ to the memory usage of the Kafka brokers. With the help of the experiments it was actually shown that each new producer id is written to disk, like a data record would be. When a Kafka broker booted up it would then load the list of persisted producer ids into memory, thus inflating the broker memory usage once more.

To actually lower the memory usage of the brokers the topics had to be manually trimmed, eliminating the data and producer ids from when there was a producer created per record. Finally with these two solutions, the singleton producer and topic trim, memory usage plummeted and then stabilized.

## Lessons Learned
The severity of the incident led to a fair amount of preventative actions ranging from development safeguards to additional deployment monitoring and alerting. The Kafka brokers were changed to perform an automatic heap dump upon exceeding their memory limits, and alerts were implements to more closely monitor their memory usage.

Kafka topic counts were then also alerted on, since the Kafka ops team was caught off guard by the additional topics. This was simply done by alerting if the number of managed Kafka topics exceeded a constant baked into the alert definition. Furthermore, to better aid teams using Kafka for their features a new feature quality gate was added, which was a document designed to guide teams in their usage of Kafka.

These changes served to better equip not just the Kafka team, but any team wanting to leverage Kafka. Everyone wants to write good software, and as owners of a service you have to provide the tools that will best empower others to use your service.
