---
title: "Kobuki Robot"
weight: 4
resources:
    - src: kobuki.png
      params:
          weight: -100
---

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A robotic device with a programmable
microcontroller, which was used to create a simple self-driving device that
responded to obstacles and bends in a road. This was developed with the
[LabVIEW](https://en.wikipedia.org/wiki/LabVIEW) visual programming language,
which is a data-driven language, versus the more traditional Imperative
languages. One of the most difficult aspects of the project was shifting my
approach on the programming to focus more on the data itself rather than just
the program control flow. The next significantly difficult hurdle was simply
developing the framework for handling the sensor input, as the sensors included
not just cameras, but also depth sensors underneath the Kobuki, and
microphones. Eventually, we settled on a state machine that would only
transition state based on if the input data passed certain numeric thresholds.
For example, the main state may be a trivial 'Drive Forward', where the wheels
would rotate at the same speed and thus propel the Kobuki forward. There would then be boolean connections to the next state that were driven by the sensor
input, such that if the depth sensor on the right side had a 30% delta in
voltage, then the machine would transition to the 'Steer Left' state. If the
depth sensor detected an even more extreme delta, it could transition to the
'Reverse' state for a certain time period, and then transition to the 'Steer
Left' state afterwards. Each state would be passed data on why the state
transition happened, so that the next decision could be made more intelligently.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;These states were built up more and more over
time, until the Kobuki could intelligently navigate an entire complex obstacle
course. The biggest trade-offs were between development time, execution time,
and reliability. You could very easily iterate on the state machine to
theoretically pass a given obstacle course, but it was most easily done through
extremely slow and careful driving. If an obstacle was detectected, the machine
could turn only 1 degree and attempt to travel again, and it could keep turning
1 degree at a time, until it was navigated. It would be much faster to have the
machine turn 25 degrees upon meeting an obstacle, but then you may turn too
much and hit another obstacle and thus get stuck in an infinite loop. Having
the software-implemented state machine run on hardware was the greatest test of
reliability of the code, as it felt like everything that could go wrong would
go wrong as soon as the machine was actually running on the track.
