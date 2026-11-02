---
title: Prepare a run
summary: Set the grid and time step, choose particle settings, check memory, and test the numbers before you trust a long run.
---

The **Prepare** stage holds the numerical choices: how finely the flow is resolved and how the solver advances in time. These settings decide whether a result means anything, and the defaults of a new setup are not always safe. This chapter starts by correcting the tank from [The scene](/guide/scene/), then explains why each change matters.

All measurements here come from Prelimina 0.3.2 on that tank, with FLIP on an NVIDIA RTX 5080. They show how to test your own case. They are not general limits.

## Correct the tank

Open the tank you saved in the last chapter and make these changes.

1. Click **Prepare**. Open the list that shows **Resolution** and choose **Time stepping**.
2. Change the mode from **Fixed** to **Adaptive**, type `0.4` for **Target CFL** and press `Enter`.
3. Set **Maximum adaptive time step** to `0.0025` and press `Enter`.

![Adaptive time stepping. Hovering over a field shows its value, its default and its setting path.](/assets/guide/prepare-time-step.webp)

4. Move the slider at the top of the panel from **Basic** to **Advanced**, then choose **Transport & stabilization** in the list.
5. Set **PBD iterations before pressure projection** to `2` and press `Enter`.

![PBD iterations in the Advanced level. The arrow beside the field reverts this change.](/assets/guide/prepare-pbd.webp)

6. Set **Duration** in the time bar to `20`.
7. Click **Simulate**, then **Restart** if it is available, and **Run**.

The run takes 8,000 steps instead of 1,000, and 20 simulated seconds took about 100 s. From 12 s to the end, the probe swings between about 900 and 2,400 Pa, with some short spikes above that. Those spikes need care if you are interested in peak pressure.

![The corrected tank after 20 s, with the colour range fitted to the speed.](/assets/guide/prepare-result.webp)

The rest of this chapter explains these two changes, then shows how to check a setup of your own.

## Read the panel

The top of the panel shows **Solver** and **Variant**. This guide uses **FLIP** with **Single phase + void**, which simulates the liquid and treats the space above it as empty. Other solvers and variants are locked until you choose **Unlock beta features** in the settings menu, and this guide does not cover them.

The slider sets how much is shown, and the list below it selects a section.

| Level | What it shows |
| --- | --- |
| Basic | Grid cell size and time stepping only |
| Advanced | The settings you are most likely to change, such as particle capacity and PBD |
| Expert | Everything in the section. Most of it should stay at the default. |
| Search | Finds a setting by name in every section and level |

| Section | What it holds |
| --- | --- |
| Resolution | Grid cell size and particle sampling |
| Time stepping | Step size and its limits |
| Pressure & convergence | The pressure solver and when it stops |
| Transport & stabilization | How velocities move between particles and grid, PBD and density projection |
| Interfaces & boundaries | Surface reconstruction and solid walls |
| Performance & diagnostics | Particle and grid capacity, extra diagnostics |
| Coupling | Links to external solvers, in Expert only |

Dimmed text in a field means the solver chooses the value. Normal text means your setup specifies it. The bin icon removes your value and returns to the default, and the arrow icon reverts a recent change. Hover over a field to see its **Setup value**, **Default value** and **Prepared value**, which is what the solver will actually use. The **Setting path** names the same setting in the setup file.

## Grid cell size

**Grid cell size** is the most important setting, and it applies in all three directions. Halving it gives eight times the cells and particles. A new setup starts at 0.1 m, so you will nearly always need to change it.

The grid has to fit the smallest thing you care about, such as the liquid depth, a gap, a baffle or a wave. In the tank, these were the results over the 0.2 m depth with the liquid at rest:

| Cell size | Cells over the depth | Particles | Result |
| --- | --- | --- | --- |
| 0.04 m | 5 | 7,500 | Level rose by 18 mm within 2.5 s, at every time step tried |
| 0.02 m | 10 | 60,000 | Level held at the right step size |
| 0.01 m | 20 | 480,000 | Level held at the right step size |

In the moving tank, the finer grid changed the result. The filtered probe swing from 12 to 20 s was about 900 to 2,400 Pa at 0.02 m, and about 500 to 2,900 Pa at 0.01 m, which is 60 % larger. So 0.02 m is enough to learn how this tank behaves, but not to quote a peak pressure. That needs at least one more refinement, and the two results must then agree well enough for your purpose.

The finer run took about 6 minutes against 100 s. It has eight times the particles and, with the step reduced in proportion, twice the steps.

### Particles

By default each grid cell starts with 2 particles along each axis, so 8 per cell. This is set under **Particle sampling** in **Resolution** at the **Advanced** level, and you rarely need to change it. Density projection needs an even sampling of 2 or 3 per axis.

**Particle capacity** is a separate upper limit, under **Performance & diagnostics**. A new setup allows 1,000,000. If the initial liquid needs more, the run stops at the start and names the setting:

```
FLIP initialization emits 3840000 particles, exceeding the particle capacity of 1000000 (flip.particles.max_particles)
```

To estimate the count before you run, divide the liquid volume by the cell volume and multiply by 8.

## Time stepping

The time step is the setting most likely to spoil a result without any warning. The **Time stepping** list has three modes:

| Mode | What it does |
| --- | --- |
| Default | Lets the solver decide |
| Fixed | Uses the same **Fixed time step** throughout. New setups use this, with 0.01 s. |
| Adaptive | Changes the step during the run to hold a **Target CFL**, up to a **Maximum adaptive time step** |

The CFL number is speed × time step ÷ cell size. It tells you what fraction of a cell the fastest flow crosses in one step. At a target of 0.4, the step shrinks as the flow speeds up.

> **CFL does nothing in calm liquid.** If the flow is slow, the step grows until it reaches the maximum. So **Maximum adaptive time step** is the limit that protects a resting or slowly moving surface. It shows 0 until you set it, so always enter a value.

### How long a step is too long

This test used the tank with no motion, so the correct answer is known: a flat surface and a steady hydrostatic pressure of 1,471.5 Pa at the probe.

![The same still tank at t = 10 s. Left, the default fixed step of 0.01 s. Right, a step of 0.002 s.](/assets/guide/prepare-still-water.webp)

| Cell size | Time step | Over 30 s |
| --- | --- | --- |
| 0.02 m | 0.01 s, 0.005 s | Flat for about 5 s, then rough, with the level about 10 mm too high |
| 0.02 m | 0.0025 s, 0.002 s | Flat throughout, and the probe reads 1,471 Pa |
| 0.01 m | 0.01 s, 0.005 s, 0.0025 s | Flat for about 10 s, then rough, with the level about 5 mm too high |
| 0.01 m | 0.00125 s | Flat throughout, and the probe reads 1,471 Pa |

Adaptive stepping with a target of 0.4 and a maximum of 0.01 s failed in the same way as a fixed 0.01 s, because the liquid never moves fast enough for the CFL limit to act.

The surface stayed flat when the step was no more than one eighth of the cell size, taking metres and seconds. This gives a starting point:

> **Maximum step in seconds ≈ cell size in metres ÷ 8.** That is 0.0025 s for a 0.02 m cell and 0.00125 s for a 0.01 m cell. It comes from these tests on one tank, so check it on your own case.

The instability does not show at first, so a short run can look perfectly clean. Run the check for as long as your real simulation.

### A smaller step is not always better

A very small step causes its own trouble. In the moving tank at 0.02 m with no PBD, the liquid at 0.0025 s began to sink after about 15 s. At 0.001 s it had collapsed to half its depth by 20 s, in both of two runs. The step of 0.002 s came through, so this behaviour is erratic and you should not rely on a lucky value. In every collapsed run the simulation still reported success.

**PBD iterations** prevents this. PBD spreads out particles that have become too crowded, before the pressure step. With 2 iterations, as in the tutorial, the moving tank stayed stable at every step tried, on both grids. These are the 0.02 m results:

| Moving tank, 0.02 m, 20 s | PBD 0 (new setups) | PBD 2 |
| --- | --- | --- |
| Step 0.005 s | Stable | Stable |
| Step 0.0025 s | Sinking after 15 s | Stable |
| Step 0.001 s | Collapsed | Stable |

PBD has a price. In the still tank with 2 iterations, the level stayed within 2 mm at a step of 0.0025 s, but the probe read 1,566 Pa at 0.02 m, which is 6 % high. At 0.01 m it read 4 % high at 0.0025 s, and correctly at 0.00125 s. So allow for an error of this size in mean pressure.

**Implicit density projection (IDP)**, just below it, keeps the liquid at its correct density. It is on **Automatic** by default, and this is the right choice. With it off, at the default step, the level in the still tank fell by 8 % within 10 s. The Prelimina documentation recommends using it with 2 PBD iterations.

### Recommended starting point

| Setting | Closed tank, moving liquid | Inlets and outlets |
| --- | --- | --- |
| Time stepping | Adaptive | Adaptive |
| Target CFL | 0.4 | 0.4 |
| Maximum adaptive time step | Cell size ÷ 8 | Cell size ÷ 8 |
| PBD iterations | 2 | 0 |
| Implicit density projection | Automatic | Automatic |

Inlets are the exception on PBD. With these settings and no PBD, a 1 × 0.6 × 0.3 m channel ran 10 s cleanly at inflows of both 1 m/s and 0.2 m/s, with speeds of 3 to 4 m/s, about what water reaches falling through the channel height. With PBD at 2, speeds jumped to between 8 and 18 m/s. With the default fixed step of 0.01 s, both inflows stopped with this error in the Log, after speeds of 28 m/s:

```
FLIP density projection candidate validation failed before commit
```

Turning off density projection stops that error, but the speeds stay at 28 m/s, so the run is still wrong. Reduce the step instead.

## Pressure and transport

Leave these at their defaults unless you have a specific reason.

**Pressure & convergence** controls how accurately each step enforces incompressibility. The solver is **PCG**, with a limit of 60 iterations. To see how it is doing, open the **Residuals** tab during a run. **Pressure solve residual** should sit below its **Target** line. It stayed below it in the corrected tank.

**Transport & stabilization** has **PIC–FLIP blend**, 0.97 by default. A higher value keeps more detail in the flow and a lower value adds numerical damping. Do not use it to tune a result to a measurement.

## Check the memory

The line below the viewport predicts the peak GPU memory for the run:

```
Predicted peak 1.29 GiB memory (available 13.44 GiB)
```

**Available** leaves a margin for the driver and other programs, so it is less than the memory on the card. Here it is 13.44 GiB on a 16 GB card. The line is green when there is room, amber when the margin is small or the memory cannot be read, and red when the run will not fit.

> **The prediction follows the capacity, not your liquid.** It is calculated from **Particle capacity**, plus the grid if the domain has a fixed size. The tank has no fixed domain size, so the line stayed at 1.29 GiB from a 0.02 m cell to a 0.005 m cell, although the finer grid needs 64 times the particles and cannot start at the default capacity. A green line is a check on the capacity you set, not proof that the run will work. Keep **Particle capacity** close to what you need.

## Check a setup before a long run

A run that finishes is not a run that is right. Prelimina reported success for every collapsed tank above. Before you trust a result, work through these checks.

1. **Rest test.** Save a copy of the setup and stop the motion, for example by setting **Amplitude** to `0`. Run it for the full duration. The surface should stay flat, and a probe should read density × gravity × depth.
2. **Compare the level.** Look at the liquid at the start and end of the real run. If it has clearly sunk or swollen, stop and change the settings.
3. **Check the speeds.** In the **Flow** tab, look at **Maximum velocity**. Estimate a realistic value first. Water falling through a height H reaches about √(2·g·H), which is 3.4 m/s for 0.6 m. Far higher speeds that persist mean a numerical problem, not physics.
4. **Halve the time step.** The result you care about should not change much. Keep PBD on for this, or a small step may fail as described above.
5. **Halve the cell size and the step together.** If the result moves more than you can accept, the coarser grid was not fine enough.

> **The volume graph cannot see this.** **Relative volume conservation error** in the **Flow** tab counts particles and multiplies by their fixed volume. It stayed at zero while the liquid collapsed to half its depth. Use the rest test and the level check instead.

For work you will rely on, compare with a measured or analytical case first. [Applications](/showcases/) shows how this looks.

## Next steps

- Read and save the results in [Run and read the results](/guide/simulate/).
- See which features are ready for use in [Capabilities](/capabilities/).
