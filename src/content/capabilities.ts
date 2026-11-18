// Editorial feature catalogue checked against the current product contracts.
// Source references and the meaning of maturity labels are recorded in README.md.
// Copy is written for engineers new to CFD: say what a feature lets you do,
// not which algorithm does it.
export const maturity = {
  implemented: {
    label: 'Implemented',
    description: 'Working functionality in the current development build.',
  },
  experimental: {
    label: 'Experimental',
    description:
      'Working functionality whose interface and defaults may still change.',
  },
  development: {
    label: 'In development',
    description: 'Partly implemented; the complete workflow is being built.',
  },
  planned: {
    label: 'Planned',
    description: 'On the roadmap and not available yet.',
  },
} as const;

// Schematics are drawn at build time by SolverSchematic.astro.
export const solverCards = [
  {
    name: 'FLIP',
    status: 'implemented',
    schematic: 'flip',
    kind: 'Particles + GPU grid',
    schematicLabel:
      'Particles fill the liquid over a grid; where the curved wall crosses the grid, the open parts of the grid faces are highlighted.',
    legend: [
      { key: 'particle', text: 'Particles carry the liquid' },
      { key: 'grid', text: 'Grid keeps it incompressible' },
      { key: 'cut-face', text: 'Walls cut straight through' },
    ],
    description:
      'The everyday workhorse for liquids on the move. Sloshing, splashing, pouring, and floating bodies run on one workstation GPU, and you watch the result take shape while it computes. Bring the CAD, set the motion, press run.',
    bestFor:
      'sloshing, splashing, filling, wetting, and parts the liquid pushes around.',
  },
  {
    name: 'FVM',
    status: 'experimental',
    schematic: 'fvm',
    kind: 'Finite volumes, no meshing',
    schematicLabel:
      'A fixed grid cut by a curved wall; cells the wall crosses are shaded, and the liquid surface is drawn piece by piece in each cell.',
    legend: [
      { key: 'cut-cell', text: 'Cells the wall cuts' },
      { key: 'plic', text: 'Sharp liquid surface' },
    ],
    description:
      'Classic CFD for when the numbers have to add up: pressure drop, flow rates, heat transfer, and gas–liquid flow with mass conserved cell by cell. The CAD walls cut straight through a fixed grid, so the meshing week becomes a coffee break.',
    bestFor:
      'internal flow, pressure loss, heat transfer, liquid and gas together.',
  },
  {
    name: 'FIRM',
    status: 'experimental',
    schematic: 'firm',
    kind: 'Meshless particles',
    schematicLabel:
      'Particles only, with no grid; one particle’s neighbourhood is circled and tinted, and the stretch of wall it touches is highlighted.',
    legend: [
      { key: 'support', text: 'Each particle talks to its neighbours' },
      { key: 'wall-patch', text: 'Walls taken straight from CAD' },
    ],
    description:
      'No grid and no mesh: the particles are the simulation. Built for flows that fold, stretch, and tear apart, with a time step set by the flow itself, so long runs stay stable and affordable.',
    bestFor:
      'large deformation, moving parts, long runs you can pause and resume.',
  },
] as const;

export const solverShared =
  'CAD import · moving and rotating tanks · probes, forces, and moments · CSV and ParaView export · one setup file · one GPU engine.';

// Vulkan 1.3 is vendor-neutral; colours tint a generic GPU icon, not logos.
export const gpuVendors = [
  { name: 'NVIDIA', color: '#76b900' },
  { name: 'AMD', color: '#ed1c24' },
  { name: 'Intel', color: '#0071c5' },
] as const;

export interface CapabilityGroup {
  id: string;
  title: string;
  icon: string;
  summaryTitle: string;
  summary: string;
  summaryStatus?: keyof typeof maturity;
  description: string;
  features: readonly {
    name: string;
    status: keyof typeof maturity;
    description: string;
  }[];
}

export const capabilityGroups = [
  {
    id: 'geometry',
    title: 'Geometry without meshing',
    icon: 'layers',
    summaryTitle: 'No meshing',
    summary:
      'Bring triangulated surfaces straight from your CAD tools. Complex vessels, baffles, and internal parts work as they are, with no volume mesh to build.',
    description:
      'Bring your CAD surfaces, say where the liquid starts and where it comes in or goes out, and run. There is no volume mesh to build.',
    features: [
      {
        name: 'CAD surface import',
        status: 'implemented',
        description:
          'Load STL, OBJ, PLY, glTF, or GLB files exported from your modelling tool.',
      },
      {
        name: 'No volume meshing',
        status: 'implemented',
        description:
          'Tank walls, baffles, and internal parts go into the simulation as they are. There is no mesh to generate, repair, or refine.',
      },
      {
        name: 'Initial liquid fill',
        status: 'implemented',
        description:
          'Say where the liquid starts, with a surface or a fill point, and preview the fill before you run.',
      },
      {
        name: 'Visual scene editor',
        status: 'implemented',
        description:
          'Edit geometry, fluids, the initial liquid, motion, and measurement points in side panels, without touching a setup file.',
      },
      {
        name: 'Repeating boundaries',
        status: 'implemented',
        description:
          'Flow leaving one side of the domain comes back in on the opposite side, for repeating geometry such as a long channel.',
      },
      {
        name: 'Inflow and outflow at the domain sides',
        status: 'experimental',
        description:
          'Set the incoming flow speed, or the pressure where the flow leaves, on the sides of the simulation box. Outlets can keep still water at rest under gravity. What is available depends on the solver.',
      },
      {
        name: 'Pouring from any surface',
        status: 'experimental',
        description:
          'Let liquid flow in through a surface you draw, such as a nozzle, at a set flow rate. In FLIP the nozzle can move, sweep, or rock while it pours.',
      },
      {
        name: 'Outflow through a surface',
        status: 'development',
        description:
          'Liquid that reaches a chosen surface leaves the simulation (FLIP today). Pressure control and flow-rate measurement on these outlets are in progress.',
      },
    ],
  },
  {
    id: 'motion',
    title: 'Motion & free surfaces',
    icon: 'motion',
    summaryTitle: 'Moving geometry',
    summary:
      'Rotate, oscillate, shake, or accelerate the geometry. The liquid splashes, breaks up, and reconnects, keeping a sharp surface through impacts, with surface tension and wetting acting at the interface.',
    description:
      'Move the geometry the way it moves in service and watch the liquid respond.',
    features: [
      {
        name: 'Liquids with a free surface',
        status: 'implemented',
        description:
          'Waves, splashes, jets, and droplets: liquid with an open surface that can break up and merge again.',
      },
      {
        name: 'Prescribed motion',
        status: 'implemented',
        description:
          'Move, tilt, and spin parts with keyframes or with motion read from a file.',
      },
      {
        name: 'Motion timeline and preview',
        status: 'implemented',
        description:
          'Edit keyframes on a timeline and preview the motion before you simulate the liquid.',
      },
      {
        name: 'Moving and rotating tanks',
        status: 'implemented',
        description:
          'Simulate the liquid inside a tank that travels, accelerates, or spins, in all three solvers.',
      },
      {
        name: 'Automatic time step',
        status: 'implemented',
        description:
          'The solver picks a safe time step as the flow speeds up or calms down. Fix it yourself when you want a controlled comparison.',
      },
      {
        name: 'Surface tension',
        status: 'experimental',
        description:
          'Capture what matters at small scales and in low gravity: droplets, capillary rise, and curved liquid surfaces. Available in all three solvers.',
      },
      {
        name: 'Wetting and contact angles',
        status: 'experimental',
        description:
          'Set how readily the liquid wets each wall, including how the contact line sticks before it slides and how its angle changes while it moves.',
      },
      {
        name: 'Wave makers',
        status: 'development',
        description:
          'Generate regular waves at a boundary, or steer the flow toward a target wave.',
      },
      {
        name: 'Calm water around a moving body',
        status: 'experimental',
        description:
          'Keep the surrounding water still while the simulation box follows a moving hull or body.',
      },
    ],
  },
  {
    id: 'compute',
    title: 'GPU computing',
    icon: 'chip',
    summaryTitle: 'Runs on your GPU',
    summary:
      'Every simulation step runs on the graphics card in your workstation, and memory follows the liquid rather than the empty space around it. Watch the result take shape while it runs.',
    description:
      'Everything runs on the graphics card in your workstation. No cluster, no queue, and you watch the result while it computes.',
    features: [
      {
        name: 'Runs entirely on the GPU',
        status: 'implemented',
        description:
          'The whole simulation stays on the graphics card; only the numbers you asked for come back to the app.',
      },
      {
        name: 'Windows and Linux (Vulkan)',
        status: 'implemented',
        description:
          'The downloads run on a compatible GPU through Vulkan, the cross-vendor graphics standard, with the vendor’s driver.',
      },
      {
        name: 'Memory follows the liquid',
        status: 'implemented',
        description:
          'FLIP stores the grid only where the liquid is, so a large, mostly empty tank costs little memory.',
      },
      {
        name: 'Fast on large models',
        status: 'implemented',
        description:
          'A multi-level pressure solver keeps big simulations converging quickly. It switches on by itself when the model gets large.',
      },
      {
        name: 'Live 3D view',
        status: 'implemented',
        description:
          'Watch the liquid, the geometry, and colour-coded results while the simulation runs.',
      },
      {
        name: 'Cutting planes',
        status: 'implemented',
        description: 'Slice the model with an interactive plane to look inside.',
      },
      {
        name: 'Run controls and health checks',
        status: 'implemented',
        description:
          'Start, pause, step, or reset a run, and follow graphs, solver health, and logs as it goes.',
      },
      {
        name: 'NVIDIA CUDA',
        status: 'experimental',
        description:
          'An optional NVIDIA-only path in development builds. The downloads use Vulkan.',
      },
      {
        name: 'macOS (Metal)',
        status: 'experimental',
        description:
          'The simulation and viewer run on Apple GPUs. A macOS download is not available yet.',
      },
    ],
  },
  {
    id: 'multiphysics',
    title: 'Coupled physics',
    icon: 'nodes',
    summaryTitle: 'Coupled physics',
    summary:
      'Simulate liquid and gas together, parts the liquid pushes around, and coupling to structural solvers. Choose thick, pasty, or elastic fluids. Add heat, and follow the boil-off of a cryogenic tank.',
    description:
      'Go beyond plain water: gas, real-world fluids, heat, and parts the flow moves.',
    features: [
      {
        name: 'Viscous liquids',
        status: 'implemented',
        description:
          'Anything from water to thick oils, staying stable even when the liquid is very viscous.',
      },
      {
        name: 'Parts moved by the liquid',
        status: 'experimental',
        description:
          'Let floating or loose parts move freely under the liquid’s forces in all six directions of motion, or impose how they move.',
      },
      {
        name: 'Coupling to structural solvers',
        status: 'experimental',
        description:
          'Exchange forces and motion with a structural model, such as CalculiX, through preCICE on Linux. FLIP and FVM can repeat each step until both sides agree.',
      },
      {
        name: 'Liquid and gas together',
        status: 'experimental',
        description:
          'Simulate the air or vapour above the liquid as well, for bubbles, trapped gas pockets, and closed tanks.',
      },
      {
        name: 'Compressible gas in closed tanks',
        status: 'experimental',
        description:
          'Let the gas trapped in a sealed tank compress and expand as the liquid moves, including pressurised tanks. Off by default.',
      },
      {
        name: 'Turbulence',
        status: 'experimental',
        description:
          'The widely used SST k–ω turbulence model with wall functions, in FVM for single-fluid flow.',
      },
      {
        name: 'Non-Newtonian fluids',
        status: 'implemented',
        description:
          'Pastes, slurries, gels, and polymer solutions that get thinner or thicker as they flow, including fluids that stay put until pushed hard enough. FLIP and FVM.',
      },
      {
        name: 'Viscoelastic fluids',
        status: 'implemented',
        description:
          'Fluids with an elastic memory, such as polymer solutions, in FLIP and FVM.',
      },
      {
        name: 'Heat transfer',
        status: 'experimental',
        description:
          'Heat or cool the liquid through walls and parts, with warm fluid rising and cold fluid sinking. The gas is included in liquid–gas runs.',
      },
      {
        name: 'Boil-off and tank pressure',
        status: 'experimental',
        description:
          'Follow evaporation, condensation, and tank pressure in a sealed or vented tank, with relief valves and pressurant gas, for example in a cryogenic propellant tank (FLIP). Boiling at hot walls is planned.',
      },
    ],
  },
  {
    id: 'optimisation',
    title: 'Automation & optimisation',
    icon: 'chart',
    summaryTitle: 'Batch runs and optimisation',
    summary:
      'Dimensions, fill levels, motion, and fluid properties are all plain setup inputs. Run batches of variants from the command line, compare the results automatically, or drive the solver from your own optimisation loop.',
    description:
      'Turn one setup into a design study, and take the numbers into your own tools.',
    features: [
      {
        name: 'Plain setup files',
        status: 'implemented',
        description:
          'Every setup is a readable JSON file. Save it, share it, reuse common parts across variants, and run it from the command line. Setups from earlier versions can be upgraded with an included converter.',
      },
      {
        name: 'Batch studies and comparisons',
        status: 'implemented',
        description:
          'Run many variants from the command line and get comparison tables as JSON, CSV, and Markdown.',
      },
      {
        name: 'Settings for every level',
        status: 'implemented',
        description:
          'Choose resolution, time step, and solver settings. FLIP offers Basic, Advanced, and Expert views, plus search.',
      },
      {
        name: 'Pressure and velocity probes',
        status: 'implemented',
        description:
          'Place probes in the liquid and plot pressure or velocity over time. Probes measure a region of fluid, not a pressure tap on the wall.',
      },
      {
        name: 'Automatic CSV recording',
        status: 'implemented',
        description:
          'Probe and body measurements are written to CSV while the run proceeds, with separate files for each run.',
      },
      {
        name: 'Forces, moments, and body motion',
        status: 'implemented',
        description:
          'Track the loads on named parts and how they move, where the solver provides them.',
      },
      {
        name: 'Wall shear stress',
        status: 'experimental',
        description:
          'See where the flow scrubs the walls hardest. Export it, or colour parts by pressure or shear in the viewer.',
      },
      {
        name: 'Flow tracers',
        status: 'implemented',
        description:
          'Release tracer particles and watch their paths live to see where the liquid goes.',
      },
      {
        name: 'Export to ParaView',
        status: 'implemented',
        description:
          'Export particles, grid results, and the liquid surface as VTK files for ParaView and other post-processing tools.',
      },
      {
        name: 'Pause, close, and resume',
        status: 'implemented',
        description:
          'Continue FLIP and FIRM runs after reopening a document, or write checkpoints from the command line. FVM runs cannot be resumed yet.',
      },
      {
        name: 'Python control',
        status: 'experimental',
        description:
          'Set up, check, and step simulations from Python, for example inside an optimisation loop, or let your own controller move a tank step by step for control and reinforcement-learning studies. Linux with Vulkan for now.',
      },
    ],
  },
  {
    id: 'ai',
    title: 'Setups for AI agents',
    icon: 'sparkle',
    summaryTitle: 'Controllable by AI',
    summary:
      'Plain, schema-validated setup files and packaged CLI/MCP tools let AI agents check setups and run CFD tasks. A local setup assistant is experimental.',
    description:
      'Setup files and tools that AI assistants can read, check, and run.',
    features: [
      {
        name: 'Machine-readable setup format',
        status: 'implemented',
        description:
          'A published schema describes every setup option, so a setup can be checked from the command line without running it.',
      },
      {
        name: 'Agent Pack: command-line and MCP tools',
        status: 'implemented',
        description:
          'The Windows and Linux downloads include tools that let AI agents check setups and run CFD tasks, from the command line or through MCP.',
      },
      {
        name: 'Local setup assistant',
        status: 'experimental',
        description:
          'A prototype that runs on your own machine and turns a short English description of a partly filled tank shaken back and forth into a setup you can review. Running it stays a separate step.',
      },
      {
        name: 'Assistant-guided studies',
        status: 'planned',
        description:
          'Plan, run, and summarise a study together with an assistant inside the app.',
      },
    ],
  },
] as const satisfies readonly CapabilityGroup[];
