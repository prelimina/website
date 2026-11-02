---
title: The scene
summary: Build a tank from an empty setup, then learn what each item in the Scene stage does, from the domain and fluids to motion and probes.
---

The **Scene** stage holds the physical problem. This chapter starts with a complete example that you build yourself, and then explains each part of the Scene tree.

| Item | What it holds | Status |
| --- | --- | --- |
| Domain | Face conditions, gravity and motion of the whole frame | Implemented |
| Fluids | Density, viscosity, surface tension and contact angle | Density and viscosity implemented, the rest experimental |
| Initial interfaces, Fill points | Where the liquid starts | Implemented |
| Bodies | Tanks, obstacles and imported geometry | Implemented |
| Inlets, Outlets | Flow through the boundary | Experimental on domain faces, in development on surfaces |
| Probes | Measurements recorded during the run | Implemented |

Status means the same as on the [Capabilities](/capabilities/) page. Experimental features work, but their interface and defaults may still change.

Prelimina uses SI units throughout: metres, seconds, kilograms and pascals. A new setup has gravity along −Y, so Y is up. You can point gravity in any direction, but this guide keeps the default.

## Build a sloshing tank

You will build a tank 1 m long, 0.6 m high and 0.3 m wide, fill it to 0.2 m, shake it from side to side and measure the pressure near one end. This takes about 10 minutes.

### Make the tank

1. Click **New** or press `Ctrl+N`.
2. Click **+** beside **Bodies** and choose **Box**. A new box is a 1 m cube centred on the origin.
3. In **Properties**, set **Body role** to **Container**, so that the fluid stays inside the box. Set **Name** to `Tank`.
4. Set **Position** Y to `0.3`. Press `Enter` after each value.
5. Set **Scale** to `1`, `0.6` and `0.3`.

The tank now runs from y = 0 to y = 0.6 m, with its floor on the ground grid. The near walls are cut away so that you can see inside.

![The new tank, with its role set to Container.](/assets/guide/scene-tank.webp)

### Add the liquid

1. Click **+** beside **Initial interfaces** and choose **plane**. A plane is the flat surface between liquid and empty space.
2. Set **Position** to `0`, `0.2` and `0`.

The plane starts at (0.5, 0.5, 0.5), which may be outside your geometry. That is why you move it first. If an error about `initial_candidate_unresolved` appears, the plane is not yet inside the tank.

**Fill volume** stays on **Automatic**, which fills the side of the plane that gravity points to. The liquid appears in blue, and the simulation preview starts in the background. The plane is drawn at a fixed size, but it separates the liquid across the whole tank.

![The plane at y = 0.2 m. The blue volume and the preview particles below it show where the liquid starts.](/assets/guide/scene-waterline.webp)

### Make it move

1. Select **Tank** in the Scene tree.
2. Scroll down in **Properties** and click **Add or edit motion…**. The Timeline Editor opens.
3. Expand **Harmonic Translation**. Its direction is already X.
4. Set **Amplitude** to `0.01` and **Frequency** to `0.66`.

The tank now moves ±10 mm along X. The panel shows the peak speed, 0.041 m/s, and the tree marks the tank as `(animated)`.

![Harmonic motion on the tank, with the signal drawn below the settings.](/assets/guide/scene-timeline.webp)

The value 0.66 Hz is close to the lowest natural sloshing frequency of this tank, so the waves should grow. For a tank of length L filled to depth h, that frequency is √(g·k·tanh(k·h)) / 2π, with k = π / L.

### Add a probe

1. Click **+** beside **Probes** and choose **Pressure probe**.
2. Set **Position** to `0.46`, `0.05` and `0`.
3. Click **Apply measurement**.

The probe samples a sphere of 0.02 m radius, close to the end wall and 0.05 m above the floor.

![The probe selected, near the floor at the right-hand end of the tank.](/assets/guide/scene-probe.webp)

### Save and run

1. Press `Ctrl+S` and save the setup in a new folder of your own. The results will go in a `results` folder beside it.
2. Click **Prepare** and set **Grid cell size** to `0.02`. New setups start at 0.1 m, which is too coarse for this tank.
3. Click **Simulate**, then **Run**.
4. Click the graph icon to open the diagnostics, then click **Flow**. Choose **Pressure / probe** to follow the measurement.

The run has 60,000 particles. It took under half a minute on an NVIDIA RTX 5080, at about 65 steps per second.

![The finished run. The pressure graph shows the sloshing period, and the colours show the speed.](/assets/guide/scene-result.webp)

The probe starts near the hydrostatic pressure of 1,470 Pa for 0.15 m of water. It then swings with a period of about 1.5 s, and between 8 and 10 s it ranges from about 1,000 to 2,400 Pa. The waves are still growing when the run ends, so run longer if you need the steady amplitude.

Prelimina writes the probe data to `results/probes/measurements.csv` without being asked. Each new run starts a new numbered file, so earlier runs are kept.

> **This is a first run, not a result.** A new setup uses a fixed time step of 0.01 s, which is too long for this tank. Even a still tank goes unstable after about 5 s at this step. [Prepare a run](/guide/prepare/) corrects it and shows how to check a setup.

## The domain

The domain is the region the solver works in. How you define it depends on your setup.

**Without a fixed size.** A new setup has none. The solver sizes its grid from the liquid and the geometry, which is what the tank above uses. The thin grey box in the viewport is a 1 m placeholder and limits nothing. Leave the face settings alone in this kind of setup, because they would attach to that placeholder.

**With a fixed size.** You need this for domain walls, inlets, outlets and periodic faces. Prelimina 0.3.2 has no field for the domain size, so you add it to the setup file with a text editor. Save and close the setup first, then add `lower` and `upper` to the existing `domain` block:

```
"domain": {
  "lower": [0, 0, 0],
  "upper": [1, 0.6, 0.3],
  ...
}
```

Open the file again. The domain box now has that size, and the six faces in **Properties** apply to it.

### Face conditions

Select **Domain** to set the condition on each face.

| Condition | What it does |
| --- | --- |
| Wall | Closed face. In FLIP the liquid slips along it freely. |
| Symmetry | Mirror plane. FLIP treats it approximately, as a wall. |
| Periodic | Connects this face to the opposite one |
| Inlet | Flow in through the whole face. See [Inlets and outlets](#inlets-and-outlets). |
| Open (pressure outlet) | Open face at a set pressure. See [Inlets and outlets](#inlets-and-outlets). |
| Solver default | No condition saved. The solver's default applies. |

A wall face also has **Edit prescribed velocity in Timeline…**. FLIP saves this velocity but does not apply it, and a warning says so. To move a wall, use a body or reference-frame motion.

### Gravity and duration

Gravity has three components in m/s². Each is a number or an expression in time `t`, or you can choose **Keyframed** in **Source** to draw a history. **Duration** in the time bar sets how long the simulation runs.

### Reference-frame motion

**Prescribed motion** under **Domain** moves the whole frame, including the grid, and the solver adds the matching inertial forces. It uses the same Timeline Editor as a body. The `sloshing_kishev` example uses it, with the tank's acceleration read from a CSV file.

With body motion the tank moves through a fixed grid. With reference-frame motion the tank stays still relative to the grid, which keeps the walls on the same cells throughout the run.

## Fluids

A new setup has two fluids, **water** and **air**. Click one to edit it, or click **+** to add a Water or Air preset.

| Setting | Meaning |
| --- | --- |
| Name | Letters, digits, dots, underscores and hyphens. References update when you rename. |
| Density | kg/m³, must be positive |
| Dynamic viscosity | Pa·s. Zero means inviscid. |
| Rheology | Newtonian, or a non-Newtonian model. Non-Newtonian models are in development. |

Click **Fluids** itself for the settings shared between them. **Primary phase** selects the liquid, and **Automatic** chooses the denser fluid. **Surface tension** and **Contact angle** are experimental.

> **Viscosity needs a solver setting.** FLIP ignores the viscosity here unless viscosity is enabled in **Prepare**, and the Log warns you about this. The default **Single phase + void** variant also leaves the air out of the simulation, although its properties stay in the setup.

## Bodies

Click **+** beside **Bodies** to add a **Box**, **Sphere** or **Cylinder**, or choose **Mesh file…** to import geometry.

Every body has a role:

| Role | Fluid is | Use it for |
| --- | --- | --- |
| Obstacle | Outside the surface | Baffles, hulls, gates and other objects in the flow |
| Container | Inside the surface | Tanks and vessels |

**Placement** sets the position, the rotation in degrees and the scale. You can also use the Move, Rotate and Scale tools described in [The workspace](/guide/workspace/). **Scale** works around the body's position, so a box stays centred where you put it.

### Import a mesh

Prelimina reads STL, OBJ, PLY, glTF and GLB files, and you do not need a volume mesh.

- Coordinates are read as metres. A mesh in millimetres needs a **Scale** of 0.001.
- The body keeps the coordinates in the file, so **Position** starts at 0.
- The view zooms in to the new body. Press `Shift+Home` to see everything again.
- Keep the file with your setup. **Advanced** has **Embed compressed fallback**, which stores a copy in the setup file.

**Geometry** in **Properties** reports what Prelimina found, for example `1 closed shell, 0 cavities, 0 open components`. A container should be closed. Prelimina corrects the direction of the faces, but it does not close cracks or weld nearby points, and it rejects non-manifold geometry.

### Bodies do not move together

Each body has its own motion, and one body cannot follow another. A baffle inside a moving tank needs the same motion as the tank. With reference-frame motion this problem does not arise, because everything moves with the frame.

Fluid-driven bodies, which the flow moves, are experimental. They have no controls in **Scene** yet, and this guide does not cover them.

## Initial liquid

Two kinds of item define where the liquid starts. **Initial interfaces** are surfaces that divide the space, and **Fill points** choose which of the divided regions hold liquid. Neither is a wall: an interface has no effect once the simulation starts.

### Initial interfaces

Click **+** beside **Initial interfaces** to add a **plane**, **sphere**, **box** or **expression**, or use **Import mesh...**. Rotate a plane to start with a tilted surface.

**Fill volume** chooses which side of the interface fills:

| Fill volume | Fills |
| --- | --- |
| Automatic | The inside of a closed shape, otherwise the side that gravity points to |
| Along gravity | The side that gravity points to |
| Side A, Side B | The side the arrow points to, or the other side |
| Custom direction | The side a direction you enter points to |
| None | Nothing. The interface only divides the space. |

With no interfaces and no fill points there is no initial liquid.

### Fill points

Use fill points when automatic filling cannot work out what you mean, for example with several compartments or nested shapes.

To add one, select an interface and click **Add fill point...** at the bottom of **Properties**. Under **Suggested position**, choose a side. Under **Pick on surface**, choose a side and click the surface in the viewport. You can also click **+** beside **Fill points**.

![A fill point below the waterline, in a domain with an imported block. Its name comes from the interface.](/assets/guide/scene-fill-point.webp)

A fill point marks a connected region of space, which then fills completely up to the nearest walls and interfaces.

> **One fill point replaces all automatic filling.** As soon as the scene has a fill point, only regions with fill points fill, so every compartment needs its own. Deleting the last fill point brings automatic filling back. Suggested positions are not checked against your geometry, so look at where the point lands.

### Check the fill

**Filled volume** in View options shows the result in **Scene** and **Prepare**: blue for liquid, amber for gas, and red where assignments conflict. It is a coarse preview, so it can differ from the real fill near curved walls and in narrow gaps. The preview particles are a useful second check.

## Motion

Select a body or **Domain**, then open the Timeline Editor with **Add or edit motion…**, **Edit timeline**, or the clock icon in the view tools. The Motion Inspector, next to the clock icon, lists the position, velocity and acceleration at the current time.

**Reference State** holds the starting pose. The motion sources add to it:

| Source | Use it for |
| --- | --- |
| Keyframes | Hand-drawn histories. Move the time bar, then click **Add Key**. Translation can use position, velocity or acceleration keys. |
| Expression | A formula in time `t` for position, rotation, velocity or acceleration |
| Harmonic Translation | Sinusoidal movement, with direction, amplitude, frequency and phase |
| Harmonic Rotation | Sinusoidal rotation about an axis |
| From file | A CSV file with time in the first column |

**Space** selects world axes or local axes, which rotate with the body. From a file, you can read a full transform, or one of position, rotation, velocity or acceleration. For a full transform, **CSV format** is `t,pos,quat` or `t,pos,euler`.

Click **Play** in **Scene** or **Prepare**, or drag the time bar, to check the motion before you run.

## Inlets and outlets

> **Experimental.** Face inlets and outlets need a [fixed domain size](#the-domain). Mesh-surface inlets (**Rectangle**, **Circle** and **Mesh file…**) are still in development. Start with short runs and read the Log.

To set up a face, select **Domain** and choose **Inlet** or **Open (pressure outlet)** in the list for that face. It then appears under **Inlets** or **Outlets**. You can also use **+** beside those groups.

![An inlet on X min and an outlet on X max, with the inlet velocity in the Timeline Editor.](/assets/guide/scene-domain-faces.webp)

A new inlet flows inward at 1 m/s. Change this in the Timeline Editor, as a number, an expression or keyframes. Inlets need a shorter time step than a new setup uses: at the default 0.01 s, inlet runs stopped with an error within 5 s. Use the [settings for inlets and outlets](/guide/prepare/#recommended-starting-point). Adding an inlet can bring back the **Optimizing the simulation for your device** message for that run.

An outlet has these settings:

| Setting | Meaning |
| --- | --- |
| Pressure | The pressure on the face, in Pa |
| Pressure type | Static, or Total to include the dynamic pressure |
| Backflow | Clamp reverse flow, or Allow exterior inflow |
| Exterior velocity | Velocity of the flow that comes back in when backflow is allowed |

The pressure is the same over the whole face, so an outlet below a free surface drains the liquid above it.

## Probes and measurements

Click **+** beside **Probes** to add a measurement. Everything here is recorded to CSV automatically, whether or not the diagnostics are open.

| Item | What it records |
| --- | --- |
| Pressure probe | Pressure in a small region of fluid |
| Velocity probe | Mean velocity in a small region of fluid |
| Tracer | The path of a point carried by the flow |
| Body measurements | The motion of a body, and optionally the fluid force and moment on it |

A probe can track pressure, velocity or both. **Coordinate frame** fixes it in the world or attaches it to a body so that it follows the motion. **Phase** limits it to liquid or gas, and **Pressure statistic** selects the mean, minimum or maximum.

Set the position in three ways: type it, drag it with the Move tool, or click **Pick position in viewport**. Click **Apply measurement** to confirm your changes.

> **A probe is not a wall sensor.** It averages the fluid around a point. To compare with a wall pressure tap, keep the probe in the liquid close to the wall, and check how much the result changes with its position and radius.

## Next steps

- Set the time step and grid properly in [Prepare a run](/guide/prepare/).
- See how a body, its motion and its probes are set up in a measured case in [Applications](/showcases/).
