---
title: The workspace
summary: Find your way around the window, the three stages, setup files, the view tools, the simulation preview and the setup tour.
---

This chapter explains what is on screen and how the parts work together. To follow along, open the `sloshing_tank` example from [Getting started](/guide/#getting-started).

## The main window

The window has the same layout in every stage: tools along the top, settings on the left, the 3D view in the middle and a time bar along the bottom.

![The main window in the Scene stage, with the domain selected.](/assets/guide/workspace-overview.webp)

| | Area | What it does |
| --- | --- | --- |
| 1 | File tools | New, Open, Save, Save As and Restore. In Simulate these are replaced by the result tools. |
| 2 | Settings menu | Application settings, updates, support and version details. |
| 3 | Stage tabs | Switch between Scene, Prepare and Simulate. |
| 4 | View tools | Interface theme, camera framing, view options and extra panels. |
| 5 | Scene tree | Everything in the setup, grouped by type. |
| 6 | Properties | Settings for whatever is selected in the tree. |
| 7 | Viewport | The 3D view of the setup or the results. |
| 8 | Time bar | Time, duration and playback controls. |
| 9 | View gizmo | Shows the orientation. Click an axis to look along it. |

The green arrow at the top left of the viewport shows the direction and size of gravity.

## The three stages

Each stage changes the left panel and the tools around it.

| Stage | Left panel | Top-left tools | Time bar |
| --- | --- | --- | --- |
| Scene | Scene tree and Properties | File tools | Scrubs and plays the preview |
| Prepare | Solver and numerical settings | File tools | Scrubs and plays the preview |
| Simulate | Display settings | Result tools | Runs the simulation |

You can change stage at any time, and doing so never starts, stops or resets a simulation. A run keeps going while you work in **Scene** or **Prepare**, and a pulsing green dot on the **Simulate** tab shows that it is running. A grey dot shows that it has finished.

Changes in **Scene** and **Prepare** do not affect a simulation that has already started. They edit the setup, and an amber marker on the **Simulate** tab and on **Restart** tells you the running simulation uses an earlier version. Click **Restart** to apply your changes. The simulation then starts again from t = 0.

## Setup files

A setup file is a JSON file that holds everything in **Scene** and **Prepare**. It does not hold results. These go in a `results` folder beside the setup file.

| Tool | Shortcut | What it does |
| --- | --- | --- |
| New | `Ctrl+N` | Starts an empty setup |
| Open | `Ctrl+O` | Opens a setup file |
| Save | `Ctrl+S` | Saves to the current file |
| Save As | `Ctrl+Shift+S` | Saves to a new file. Available once the setup has a file. |
| Restore | | Goes back to the last applied setup |

A dot on the **Save** icon and a `*` in the title bar mean there are unsaved changes. Prelimina asks whether to save them before it replaces the open setup. The **Save** tools appear only in **Scene** and **Prepare**.

Keep meshes and motion files with your setup file. Paths inside a setup are relative to that file, so the folder can be moved as a whole.

> **There is no undo.** Save before a large change. **Restore** returns to the setup used for the latest simulation start or restart, or to the setup from New or Open if nothing has run yet. It asks first, and it leaves the saved file unchanged. Saving does not move this restore point. In **Prepare**, a changed setting also has a small revert button beside it.

## Select and edit

The Scene tree has one group for each kind of item: **Domain**, **Fluids**, **Initial interfaces**, **Fill points**, **Bodies**, **Inlets**, **Outlets** and **Probes**. Click **+** beside a group to add an item.

Click a row to select it, or click an object in the viewport while in **Scene**. **Properties** then shows its settings, and the object is outlined in the viewport. Most sections of **Properties** have a **?** button with a short explanation.

To move a selected object in the viewport, choose a manipulation mode from the toolbar or with a key:

| Key | Mode |
| --- | --- |
| `Q` | Select |
| `W` | Move |
| `E` | Rotate |
| `R` | Scale |

Fill points and probes can only be moved. Keys do nothing while you are typing in a field.

## View tools

The tools at the top right depend on the stage.

| Tool | Stages | What it does |
| --- | --- | --- |
| Explore setup (compass) | Scene, Prepare | Starts the setup tour |
| Interface theme (half disc) | All | Switches between the light and dark interface |
| Frame (house) | All | Frames the selection, or everything if nothing is selected |
| View options (eye) | All | Opens the list below |
| Manipulation mode | Scene | Selects Select, Move, Rotate or Scale |
| Motion Inspector | Scene | Shows or hides the Motion Inspector panel |
| Timeline Editor | Scene | Shows or hides the Timeline Editor |
| Live diagnostics (graph) | Simulate | Shows or hides the Log, Infos and graph tabs |

A coloured dot on the diagnostics tool means the log has an unread warning or error.

**View options** controls what the viewport draws. None of these settings changes the physics.

| Option | What it does |
| --- | --- |
| Filled volume | In Scene and Prepare, previews where the fluid starts: blue for liquid, amber for gas, red for conflicting assignments. This is a coarse preview. |
| Objects | Draws objects hidden, as edges, transparent or opaque |
| Particles, Free surface | In Simulate, shows or hides these layers |
| Sky, Grid | Sets the background. The grid can be hidden, Cartesian or polar. |
| Cut away all objects | Hides the near faces of obstacles as well as containers |
| View gizmo | Shows or hides the gizmo |
| Rotate around picked point | Orbits around the surface under the pointer |
| Rotate horizon with domain | Turns the horizon with a moving domain |
| Orthographic | Uses a parallel view. The `O` key does the same. |

Boundaries have their own colours: grey for walls, violet for symmetry, green for inlets and red for outlets.

## Simulation preview

While you work in **Scene** and **Prepare**, Prelimina runs a coarse FLIP simulation of your setup in the background. Grey hatching on the time bar shows how far it has got. Use **Play** or drag the time bar to watch it.

![The preview at t = 8.3 s in Scene. It updates as you change the setup.](/assets/guide/simulation-preview.webp)

The preview shows quickly whether a setup behaves as you intended, for example whether the liquid starts in the right place or a body moves the right way. It restarts when you change something it depends on. Nothing from it is saved, and **Simulate** does not use it.

> **Don't take numbers from the preview.** It always uses FLIP, even if your setup uses another solver, and it runs with its own coarse settings. Thin sheets and splash volume in particular are only indicative. Use **Simulate** for results.

A simulation and the preview cannot share the GPU. Once a simulation has started, the preview pauses and the time bar offers **Release run…**. That stops the simulation and frees its memory so the preview can continue. Any results you have not exported are discarded, and the next **Run** starts from t = 0.

To turn the preview off, clear **Compute simulation preview** in the settings menu. This is worth doing on a GPU with little memory.

## Explore a setup

The tour shows what a setup changes from the solver defaults, which is the quickest way to understand a file from someone else. It takes you through these settings in steps, such as domain and boundaries, then fluids, then solver method. Everything else is dimmed.

![The tour on the first of 11 steps. The domain faces are highlighted and the rest of the window is dimmed.](/assets/guide/setup-tour.webp)

Start the tour in one of three ways:

- Click **Explore setup** in the banner that appears when you open a file.
- Click the compass icon in the view tools.
- Choose **Explore setup** in the settings menu.

The tour moves on by itself. Its controls sit in the toolbar: pause or play, next step, the step counter, and a close button. `Esc` also ends the tour. Hover over the step title to see a table of the changed settings, and over a highlighted row to see its default.

You can keep editing during the tour, and editing pauses it. The tour is available in **Scene** and **Prepare**, and going to **Simulate** ends it.

## Settings menu

Click the gear icon to open this menu.

| Item | What it does |
| --- | --- |
| Compute backend | Shows the compute backend. Released builds use Vulkan. |
| Explore setup | Starts the setup tour, in Scene and Prepare |
| Dark interface | Switches the interface theme |
| Compute simulation preview | Turns the preview on or off |
| Unlock beta features | Enables features that are not ready for general use, including the FVM and FIRM solvers and the two-phase variants. You don't need it for this guide. |
| Update | Checks for a new version |
| Contact support | Starts an email containing your system details |
| About | Shows the version, system details, changelog and licences |

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `Ctrl+N` | New setup |
| `Ctrl+O` | Open a setup |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save As |
| `Space` | Run or pause in Simulate, play or pause the preview in Scene and Prepare |
| `Home` | Frame the selection, or everything if nothing is selected |
| `Shift+Home` | Frame everything |
| `O` | Switch between perspective and parallel view |
| `Q`, `W`, `E`, `R` | Select, Move, Rotate, Scale, in Scene |
| `Esc` | Close the tour or cancel the current placement or transform |

When the time bar in **Scene** or **Prepare** has focus, the arrow keys step through time, and `Home` and `End` jump to the start and end.
