---
title: Run and read the results
summary: Control a run, look inside the flow, compare with measured data, and save the numbers you need.
---

The **Simulate** stage runs the solver and shows the flow as it develops. This chapter uses the corrected tank from [Prepare a run](/guide/#prepare), paused at about 10.6 s.

Decide what you need to keep before you start a long run, because Prelimina saves much less than it shows.

| What | Where it goes | Kept after the run |
| --- | --- | --- |
| The picture in the viewport | Screen only | No, unless you save a screenshot |
| Graphs in the diagnostics | Screen only, about the last second | No |
| Probes | `results/probes` | Yes, written during the run for all of it |
| Flow fields at one moment | **Write results** | Yes, when you click it |
| Flow fields over time | Command line only | Yes |

> **There is no replay.** The time bar in **Simulate** shows progress, and you cannot drag it back. The flow on screen is the current state of the solver. To look at an earlier moment, restart and pause there, or save fields during the run.

## Control the run

| Control | What it does |
| --- | --- |
| Run, Pause | Starts or pauses the solver. `Space` does the same. |
| Step | Advances one time step while paused |
| Restart | Starts again from t = 0, using your latest changes |
| Duration | Sets the end time |
| ∞ | Runs with no end time until you pause. Click again to go back to the set duration. |

**Preview priority**, at the top of the panel, shares the GPU between the solver and the picture. **Solver first** favours speed, **Preview first** favours a smooth picture and **Balanced** sits between them. It does not change the results.

## Choose what to show

The panel on the left has one section for each layer of the picture.

![A slice through the tank at 10.6 s, coloured by speed. The Flow tab shows the probe pressure.](/assets/guide/simulate-slice.webp)

**Field** selects the quantity:

| Field | What it shows |
| --- | --- |
| Speed | Flow speed in m/s |
| Grid pressure | Pressure on the grid. See the warning below. |
| Liquid level-set approximation | Distance from the liquid surface, in metres, negative inside the liquid |
| Grid density | Density on the grid, in kg/m³ |
| Curvature | Curvature of the liquid surface, in 1/m |

**Min** and **Max** set the colour range. **Fit now** fits it to the current values. To compare two moments or two runs, type the same range for both, otherwise the same colour means different values. **Colormap** and **Color bands** change the colours, and bands make levels easier to read.

> **Don't read pressure from the Grid pressure colours.** In 0.3.2 the viewport shows this field too high by a large factor. In the tank at a 0.02 m cell size, it showed −16,462 to 128,224 Pa, while the exported field for the same moment ran from −329 to 2,564 Pa, a factor of exactly 50. The shape of the field is still useful. For values, use a probe, **Body surfaces** or exported results.

**Body surfaces** colours a body by the pressure of the fluid next to it. Choose **Pressure** in **Color by**. It has its own range controls, and areas with no fluid beside them stay grey. **Wall shear stress** was greyed out for the tank, which does not simulate viscosity.

| Section | Use it for |
| --- | --- |
| Free surface | Opacity of the liquid surface, and whether the field colours it. **Cut at solid** trims the surface at walls. |
| Volume & slice | Opacity of the field inside the liquid. **Liquid mask** limits it to the liquid. |
| Particles | Opacity and size of the particles |

Move any **Opacity** slider to zero to hide that layer.

## Look inside with a slice

1. Open **Volume & slice** and select **Clip & slice**. A coloured plane appears, and everything on one side of it is hidden.
2. Choose **X**, **Y**, **Z** or **Arbitrary** in **Plane**. **Arbitrary** adds a **Plane normal**.
3. Drag **Plane position**, from 0 to 1 across the flow.
4. Set **Contours** to draw lines of equal value on the slice.

Select **Plane handle** to move or rotate the plane in the viewport. The hidden side follows the camera, so orbit around to see the other side.

## Read the diagnostics

Click the graph icon at the top right to open these tabs. A coloured dot on the icon means the Log has a new warning or error.

| Tab | What it shows |
| --- | --- |
| Log | Solver messages, with a filter, a level list and **Copy** |
| Infos | Time, time step, size, speed and the output path |
| Residuals | How well each step was solved, against its target |
| Flow | Probe readings, kinetic energy and maximum velocity |
| Velocity monitor | Maximum and mean speed, and the count of invalid particles |

The graphs in **Residuals** and **Flow** cover about the last second of the run, so they suit checking the flow as it runs, not reading a history. For a full record, use the probe file below.

**Velocity monitor** only checks whether the speeds are finite numbers. As it says on screen, it does not show that the solution is sound. [Prepare a run](/guide/#check-a-setup-before-a-long-run) has the checks that do, and explains why **Relative volume conservation error** can stay at zero when the volume is wrong.

## Compare with a measurement

You can draw a measured curve over any graph in **Flow** or **Residuals**.

1. Select the graph, then click **Reference...** and choose a CSV file.
2. Give the file a header row. It needs a time column and a value column, with the values in the units shown on the graph.
3. Click **Align** if the curve needs adjusting.

![An invented sine curve in ref.csv, drawn over the probe pressure to show the overlay.](/assets/guide/simulate-reference.webp)

| Align setting | What it does |
| --- | --- |
| Time column, Value column | Selects the columns to use |
| Time scale | Seconds per unit of the time column, for example the period T for data in t/T |
| Time offset | Shifts the curve in time, to line up the phases |
| Repeat every | Repeats the curve with this period. 0 shows it once. |
| Value scale | Multiplies the values |

This is a quick visual check, and it only covers the last second of the run. For a real comparison, use the probe file and your own plotting tools. Note any offset you apply, because it is part of your result.

## Save the numbers

### Probes

Every probe writes to `results/probes` during the run, with no action from you. The first run writes `measurements.csv`, and later runs write `measurements-2.csv` and so on. A paused or stopped run keeps what it has written so far.

The file has one row per step for each series, so filter it by `series_id`. The tank probe has two series, the pressure and the number of particles it sampled.

| Column | Meaning |
| --- | --- |
| `frame`, `time_s`, `dt_s` | Step number, time and time step |
| `series_id` | Which measurement, for example `pressure_probe.probe.pressure_pa` |
| `value`, `units` | The reading and its units |
| `availability` | `available` when the value is valid |
| `sample_count` | Particles behind this reading |
| `x_m`, `y_m`, `z_m` | Where the probe was |

This Python script reads one series and prints its mean:

```
import csv

rows = [r for r in csv.DictReader(open("measurements.csv"))
        if r["series_id"] == "pressure_probe.probe.pressure_pa"
        and r["availability"] == "available"]
t = [float(r["time_s"]) for r in rows]
p = [float(r["value"]) for r in rows]
print(len(p), "samples, mean", sum(p) / len(p), "Pa")
```

The first sample of a run can be 0, because the probe has no pressure before the first step. Leave it out of averages.

### Fields at one moment

**Write results**, the first icon at the top left, saves the current state.

1. Click **Write results**. The run pauses.
2. Check the **Folder**, which is the `results` folder by default.
3. Click **Write now**, then **Close**.

Each click adds a `step_NNNNNN` folder and an entry in `results.vtm.series`. One frame of the tank took about 10 MB:

| File | What it holds |
| --- | --- |
| `particles.vtp` | Particle positions and velocities |
| `free_surface.vtp` | The liquid surface as a mesh |
| `grid/*.vti` | Grid fields, including `pressure` and `velocity` |
| `results.vtm.series` | The list of saved moments. Open this one. |

A folder can only take later moments of the same run. After a **Restart**, choose a new folder.

### Fields over time

The application saves fields only when you click. **Record results**, which saves them at regular intervals, is a locked beta feature in 0.3.2. To record a series without unlocking it, use `prelimina_cli`, which is beside the Prelimina program:

```
prelimina_cli tank.json --backend vulkan --output metrics.csv --vtk-dir fields --vtk-every-time 0.5 --vtk-product volume --vtk-field pressure --vtk-field velocity
```

This writes the grid fields every 0.5 s of simulated time, and `--duration` overrides the end time. Each run records one product, and FLIP has `volume`, `particles` and `free_surface`. Without `--vtk-product` you get particles and the free surface. Run the same setup again for another product.

The command line has no `results/probes` folder. Probe values are in `metrics.csv` instead, as `result_pressure_probe_...` columns, with `;` as the separator and several hundred columns in all.

Start small. The tank with particles and surface took about 1.4 MB per frame, and a fine grid or a short interval can fill a disk quickly.

### Pictures

Use **Screenshot** to save the viewport as a PNG, and **Copy image** to put it on the clipboard. Neither includes the panels. The folder icon opens the results folder.

## Open results in ParaView

1. In ParaView, choose **File > Open** and select `results.vtm.series`.
2. Click **Apply**. The time controls step through the saved moments.
3. Use the block list to choose particles, grid or free surface.

| Use this | Not this |
| --- | --- |
| Grid `pressure`, in Pa | Particle `pressure`, which is 0 in every particle in 0.3.2 |
| Grid `velocity`, where `velocity_valid` is 1 | Grid values outside the liquid |

Exported grid pressure is in Pa, and its maximum matched **Body surfaces** at the same moment, so ParaView is the place to measure a field.

## If a run stops

The bar shows **Initialization failed** or the run stops, and a message appears in the viewport and in the **Log**. Copy it with **Copy** if you need to contact support.

| Message contains | Cause | What to do |
| --- | --- | --- |
| `exceeding the particle capacity` | The initial liquid needs more particles than allowed | Raise **Particle capacity**. See [Particles](/guide/#particles). |
| `density projection candidate validation failed` | Usually a time step that is too long | Use the [recommended settings](/guide/#recommended-starting-point) |

A run that finishes can still be wrong, so a clean Log is not enough. See [Check a setup before a long run](/guide/#check-a-setup-before-a-long-run).

## Next steps

- See measured cases in [Applications](/showcases/).
- See what each feature can do today in [Capabilities](/capabilities/).
