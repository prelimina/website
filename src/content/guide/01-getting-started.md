---
title: Getting started
summary: Install Prelimina, run a first simulation from a bundled example, and find your results.
---

This chapter takes you from nothing to a finished simulation. You will open a bundled sloshing tank, run it, look at the flow, and change one setting. It takes about 15 minutes.

> **Prelimina is in development.** It is useful for exploring ideas, but it is not yet ready for production use. Back up your projects and keep them outside the installation folder.

## Choose how to run Prelimina

Prelimina runs as a desktop application or in your browser. The interface is the same in both.

| | Browser | Desktop |
| --- | --- | --- |
| Install | None. Open [prelimina.com/app](https://prelimina.com/app/) | Windows or Linux installer |
| Graphics | WebGPU in Chrome or Edge 137 or later | Vulkan 1.3 GPU with a recent driver |
| Solvers | FLIP, single phase | FLIP, single phase. FVM, FIRM and the two-phase variants are locked beta features. |
| Results | View only, no results folder | Saved to disk and exported as VTK |
| Examples | One dam break | Four, listed below |

The browser version is the quickest way to see Prelimina. Use the desktop application for your own work. The rest of this chapter follows the desktop application, and the steps are the same in the browser unless a note says otherwise.

> **In the browser.** Firefox and Safari cannot run Prelimina yet. If Chrome reports WebGPU as off or falls back to a software renderer, open `chrome://gpu` and check that it shows **WebGPU: Hardware accelerated**. On a software renderer the simulation stops during initialisation with an error about storage buffers.

## Check your computer

| | Windows | Linux |
| --- | --- | --- |
| System | Windows 10 22H2 (64-bit) or newer | 64-bit x86 Linux, glibc 2.28 or newer |
| GPU | From 2015 onwards, Vulkan 1.3, recent driver | The same |
| RAM | 8 GB minimum | The same |
| GPU memory | 4 GB for small scenes, 6–8 GB preferred, 8–12 GB or more for larger work | The same |
| Other | | FUSE 2 to mount the AppImage |

These are provisional targets while Prelimina is in development. The [Download section](/#download) always has the current list. macOS is not available yet.

## Install the desktop application

### Windows

1. Download the Windows installer from the [Download section](/#download).
2. Run `Prelimina-0.3.2-win-x64-Setup.exe`. The installer is not code-signed yet, so Windows may warn you before it runs.
3. Start **Prelimina**.

### Linux

1. Download the AppImage from the [Download section](/#download).
2. Keep it in a folder you can write to, so that it can update itself.
3. Make it executable and start it:

```
chmod +x Prelimina-0.3.2-linux-x64.AppImage
./Prelimina-0.3.2-linux-x64.AppImage
```

If your system has no FUSE 2, start it with `APPIMAGE_EXTRACT_AND_RUN=1` set in the environment.

> **Licence.** Prelimina is free for noncommercial use. Commercial use, including business evaluation, needs a paid licence before the work begins. See the [licence agreement](/legal/licence/).

## Run your first simulation

Prelimina organises work into three stages, shown as tabs at the top of the window:

- **Scene** holds the physical problem: geometry, fluids, initial state, motion and duration.
- **Prepare** holds the numerical choices: solver, grid size and time-step controls.
- **Simulate** runs the solver and shows the results.

When you start Prelimina it opens an empty, untitled scene in the **Scene** stage.

![Prelimina on first launch. The Scene stage is open, with an empty domain.](/assets/guide/first-launch.webp)

### Open the example

1. Click **Open**, the folder icon at the top left, or press `Ctrl+O`. On a new installation the dialog starts in the examples folder.
2. Open the `sloshing_tank` folder and choose `sloshing_tank.json`.

Prelimina copies the example into `Documents/Prelimina/Examples` and opens the copy. Your edits and results stay there, and the original stays unchanged. Opening the same example again makes a new numbered copy.

> **Can't find the examples?** Windows may open the dialog in the last folder you used instead. The examples are in the `examples` folder beside the Prelimina program, by default `%LocalAppData%\Prelimina\current\examples`.

The tank appears in the viewport. It is 1 m long, 0.6 m high and 0.1 m wide, and closed on all sides. The liquid starts about 0.3 m deep with its surface tilted by 10°. When the simulation starts, gravity pulls that surface flat and the liquid sloshes from side to side.

![The example open in Scene. The blue volume is the liquid, tilted at the start of the simulation.](/assets/guide/example-scene.webp)

A banner offers to show what this setup changes from the defaults. Click **Not now** for this first run. You can start the tour later with **Explore setup** in the settings menu.

### Look at the settings

Click **Prepare**. This example uses the **FLIP** solver with the **Single phase + void** variant, which simulates the liquid and treats the space above it as empty. **Grid cell size** is 0.02 m.

Below the viewport, Prelimina predicts the peak memory for the run and compares it with what your GPU has available. Check this line before you start a large run.

![The Prepare stage with the solver, grid cell size and predicted peak memory.](/assets/guide/prepare.webp)

### Run it

1. Click **Simulate**. The panel shows **Simulation not initialized**, because nothing has been sent to the GPU yet.
2. Click **Run** at the bottom left.

The first run on a computer shows **Optimizing the simulation for your device**. This can take a minute, and later runs start faster. In the browser the first visit can take several minutes.

The liquid then starts to move, and the bar at the bottom shows the simulated time. This example simulates 10 s, which took a little over a minute on an NVIDIA RTX 5080.

![The running simulation, coloured by speed.](/assets/guide/simulate-running.webp)

Press `Space` or click **Pause** to stop and continue. **Step** advances one time step while paused. When the bar shows **Simulation finished**, click **Restart** to run again from the start.

### Look around

These controls work in every stage while the pointer is over the viewport:

| Action | Control |
| --- | --- |
| Orbit | Left-drag |
| Pan | Right-drag |
| Zoom | Mouse wheel or middle-drag |
| Focus on a point | Double-click it |
| Show everything | **Frame all**, the house icon at the top right |
| Switch between perspective and parallel view | `O` |

The small axis gizmo at the top right shows the orientation. Click an axis to look along it.

### Read the results

The panel on the left controls what you see. **Field** selects the quantity. **Min** and **Max** set the colour range, and **Fit now** fits the range to the current values. In this example the speed goes above the default maximum of 1 m/s, so the fastest flow shows as solid dark red until you change the range.

Click the graph icon at the top right to open the live diagnostics. **Infos** shows the size and speed of the run. **Log** shows solver messages, and it is the first place to look if something goes wrong.

![The Infos tab during the run on an RTX 5080.](/assets/guide/infos-panel.webp)

## Find your results

The **Output path** in **Infos** shows where this run writes its files. By default this is a `results` folder beside the setup file.

Four icons at the top left of the **Simulate** stage handle results:

| Icon | What it does |
| --- | --- |
| Write results | Pauses and writes the current state as VTK XML, which you can open in ParaView |
| Screenshot | Saves the viewport as a PNG image |
| Copy image | Copies the viewport image to the clipboard |
| Open results folder | Opens the folder in your file manager |

The browser version cannot write results to disk.

## Change something and run again

CFD work is a loop of changing a setting and comparing runs. Try it with the grid:

1. Click **Prepare**, set **Grid cell size** to `0.01` and press `Enter`. The predicted memory rises from 0.93 GiB to 1.14 GiB. A `*` after the file name in the title bar marks unsaved changes.
2. Click **Simulate**. **Restart** has turned amber, which means the simulation on screen still uses the old setting.
3. Click **Restart**, then **Run** if the simulation is paused.

The new run has 240,018 particles, eight times as many as before, because halving the cell size doubles the cells in each direction. The time step also gets smaller. The 10 s run now takes about three minutes on the same GPU, against a little over one before.

Compare the two runs before you trust either. If the result you care about changes with the grid, the coarser grid was not fine enough.

An amber note may appear about secondary phase properties. It tells you that this variant keeps the air properties in the setup but does not simulate the air.

To keep your change, go back to **Scene** or **Prepare** and click **Save** or press `Ctrl+S`.

## Keep Prelimina up to date

Click the gear icon at the top left and choose **Update**. A coloured **Update available** entry appears in the same menu when a new version is out. The same menu has **Contact support**, which starts an email containing your system details, and **About**, which shows the version, changelog and licences.

## What to try next

- Open the other examples. `drop_in_tank` is a small quick case, and `dam_break_marin` is a 3.22 m dam break with an obstacle. `sloshing_kishev` reproduces a published experiment at a fine grid, so expect a much longer run.
- See how similar cases compare with measurements in [Applications](/showcases/).
- See what each feature can do today in [Capabilities](/capabilities/).
