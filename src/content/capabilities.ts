// Editorial feature catalogue checked against the current product contracts.
// Source references and the meaning of maturity labels are recorded in README.md.
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

// Ordered from Eulerian to fully Lagrangian; schematics are drawn at build
// time by SolverSchematic.astro.
export const solverCards = [
  {
    name: 'FVM',
    status: 'experimental',
    schematic: 'fvm',
    kind: 'Cut-cell Eulerian',
    schematicLabel:
      'A fixed Cartesian grid cut by a curved wall; cells the wall crosses are shaded, and the liquid surface is one straight piece per cell.',
    legend: [
      { key: 'cut-cell', text: 'Cells the wall cuts' },
      { key: 'plic', text: 'PLIC interface, one piece per cell' },
    ],
    description:
      'PISO finite volumes on a Cartesian grid that the CAD walls cut through. Tiny cut cells merge with a neighbour instead of shrinking the time step, and a multigrid-preconditioned pressure solve keeps mass conserved cell by cell.',
    bestFor:
      'internal flow, pressure loss, heat transfer, liquid–gas interfaces.',
  },
  {
    name: 'FLIP',
    status: 'implemented',
    schematic: 'flip',
    kind: 'Particles on a cut-face grid',
    schematicLabel:
      'Particles fill the liquid over a sparse grid; the open parts of grid faces crossed by the curved wall are highlighted.',
    legend: [
      { key: 'particle', text: 'Particles carry the liquid' },
      { key: 'grid', text: 'Sparse grid solves pressure' },
      { key: 'cut-face', text: 'Open fraction of cut faces' },
    ],
    description:
      'Particles carry the liquid and its velocity; a sparse GPU grid, allocated only around the liquid, enforces incompressibility with walls entering through the open fraction of each cut face. Splashes, break-up, and reconnection need no interface surgery.',
    bestFor:
      'sloshing, splashing, filling, moving and fluid-driven bodies, wetting.',
  },
  {
    name: 'FIRM',
    status: 'experimental',
    schematic: 'firm',
    kind: 'Fully Lagrangian, implicit',
    schematicLabel:
      'Particles only, with no grid; one particle’s support circle is cut by the curved wall, its neighbours are tinted, and the wall facets inside it are highlighted.',
    legend: [
      { key: 'support', text: 'Renormalised support and neighbours' },
      { key: 'wall-patch', text: 'Wall condition on the CAD facets' },
    ],
    description:
      'The particles are the discretisation. Pressure and viscosity are solved implicitly on renormalised meshless operators, with wall, free-surface, inlet, and outlet conditions built into the operators instead of layers of dummy particles. Body loads are integrated over the wetted CAD triangles, and the time step follows the flow, not an artificial sound speed.',
    bestFor:
      'large deformation, prescribed moving parts, long restartable runs.',
  },
] as const;

export const solverShared =
  'CAD-surface import · moving reference frames · probes, forces, and moments · CSV and VTK export · one JSON setup schema · one GPU runtime.';

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
      'Turn surfaces, liquid regions, and boundary conditions into a simulation setup.',
    features: [
      {
        name: 'Surface-mesh import',
        status: 'implemented',
        description:
          'Load STL, OBJ, PLY, glTF, and GLB geometry from your modelling tools.',
      },
      {
        name: 'Immersed geometry',
        status: 'implemented',
        description:
          'Represent vessel walls and internal surfaces within the solver’s particle or Cartesian-grid discretisation.',
      },
      {
        name: 'Initial liquid regions',
        status: 'implemented',
        description:
          'Define the initial liquid with surfaces and fluid seeds, and inspect the fill preview in the scene.',
      },
      {
        name: 'Visual scene authoring',
        status: 'implemented',
        description:
          'Edit geometry, materials, initial liquid, prescribed motion, and measurement regions in contextual inspectors.',
      },
      {
        name: 'Periodic boundaries',
        status: 'implemented',
        description:
          'Use periodic domain axes in compatible solver configurations.',
      },
      {
        name: 'Domain inlets and pressure outlets',
        status: 'experimental',
        description:
          'Prescribe inlet velocity or outlet pressure on domain faces, with availability determined by the selected method, including liquid–gas PF-FLIP. Pressure outlets can use a hydrostatic reference level to help keep water at rest under gravity.',
      },
      {
        name: 'Mesh-surface inflow',
        status: 'experimental',
        description:
          'Emit liquid from a triangulated surface with a prescribed discharge or velocity profile. FLIP inlets can be curved, closed, moving, or rocking, such as a sweeping nozzle; FIRM emits particles from inlet meshes, and finite-volume inlets cap a passage at a domain face.',
      },
      {
        name: 'Finite mesh-surface outlets',
        status: 'development',
        description:
          'FLIP removes particles that cross a static surface mesh. Pressure conditions and independent discharge measurements on such outlets are being developed.',
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
      'Prescribe how the geometry moves and follow the free surface it drives.',
    features: [
      {
        name: 'Incompressible free-surface flow',
        status: 'implemented',
        description:
          'Single-liquid simulation with particles tracking the moving liquid and a grid solving pressure.',
      },
      {
        name: 'Prescribed rigid-body motion',
        status: 'implemented',
        description:
          'Author translations and rotations with keyframes and time-dependent motion sources.',
      },
      {
        name: 'Animation timeline and preview',
        status: 'implemented',
        description:
          'Edit keyframes and preview the body motion before running the fluid simulation.',
      },
      {
        name: 'Moving reference frames',
        status: 'implemented',
        description:
          'Model prescribed domain translation and rotation; rotating-frame forces are available in compatible FLIP, finite-volume, and meshless configurations.',
      },
      {
        name: 'Adaptive time stepping',
        status: 'implemented',
        description:
          'Use CFL-based time-step control with a maximum step, or select a fixed step for a controlled study.',
      },
      {
        name: 'Surface tension',
        status: 'experimental',
        description:
          'Include capillary forces in FLIP, finite-volume, and meshless free-surface formulations. FLIP uses sharp interfaces with carried curvature, and an optional semi-implicit treatment runs free drops stably at several times the explicit capillary time-step limit.',
      },
      {
        name: 'Contact angles and wetting',
        status: 'experimental',
        description:
          'Static, dynamic (Cox–Voinov), and hysteretic contact angles. FLIP fits the near-wall level set to the prescribed angle, finite volumes impose it on height functions, and the meshless solver supports dynamic angles with hysteresis.',
      },
      {
        name: 'Wave-generation boundaries',
        status: 'development',
        description:
          'Analytical wave targets with direct and relaxation-zone wave generation.',
      },
      {
        name: 'Calm exterior water for moving domains',
        status: 'experimental',
        description:
          'Keep the surrounding water still in world coordinates while the computational domain travels with a moving body, so open boundaries and numerical beaches connect to a calm basin.',
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
      'A native compute pipeline built around GPU execution, with a live view of the run.',
    features: [
      {
        name: 'GPU-native simulation',
        status: 'implemented',
        description:
          'Fluid kernels, intermediate fields, and reductions execute on the GPU, with compact measurements returned to the application.',
      },
      {
        name: 'Vulkan backend',
        status: 'implemented',
        description:
          'The Windows and Linux package configuration uses Vulkan with a compatible GPU and vendor driver.',
      },
      {
        name: 'Sparse FLIP grids',
        status: 'implemented',
        description:
          'Use sparse tiled grids around the active liquid for the particle/grid solver.',
      },
      {
        name: 'Multigrid pressure solves',
        status: 'implemented',
        description:
          'Geometric-multigrid preconditioning for the pressure equation, selected automatically for large FLIP grids and used by the finite-volume solver.',
      },
      {
        name: 'Live 3D visualisation',
        status: 'implemented',
        description:
          'Inspect the evolving liquid, geometry, and supported scalar-field colouring while a simulation runs.',
      },
      {
        name: 'Cutting planes',
        status: 'implemented',
        description:
          'Use an interactive slice plane to inspect the interior of the displayed model.',
      },
      {
        name: 'Run controls and diagnostics',
        status: 'implemented',
        description:
          'Start, pause, step, or reset a simulation and follow numerical diagnostics, measurement graphs, and logs.',
      },
      {
        name: 'CUDA backend',
        status: 'experimental',
        description:
          'An optional NVIDIA compute path in development builds, separate from the Vulkan download configuration.',
      },
      {
        name: 'Metal backend for macOS',
        status: 'experimental',
        description:
          'The solvers and the native viewer run on Apple GPUs through Metal. macOS packages are built locally and are not yet part of the download.',
      },
    ],
  },
  {
    id: 'multiphysics',
    title: 'Coupled physics',
    icon: 'nodes',
    summaryTitle: 'Coupled physics',
    summary:
      'Simulate liquid and gas together. Couple the liquid to free-moving bodies and structural solvers. Choose yield-stress, shear-thinning, or viscoelastic fluids. Transfer heat, and boil off a cryogenic tank through its vent.',
    description:
      'Fluid models, method choices, and coupling to bodies and other solvers.',
    features: [
      {
        name: 'Newtonian viscosity',
        status: 'implemented',
        description:
          'Vary density and viscosity across Newtonian flow regimes, with implicit viscosity solver support.',
      },
      {
        name: 'Fluid-driven rigid bodies',
        status: 'experimental',
        description:
          'Six-degree-of-freedom (6-DOF) either imposed or reactive body coupling.',
      },
      {
        name: 'External structural coupling',
        status: 'experimental',
        description:
          'Native coupling through preCICE on Linux, including the CalculiX adapter, for force and motion exchange on fixed-topology surfaces. Explicit and implicit (sub-iterated) coupling for FLIP and single-liquid finite volumes.',
      },
      {
        name: 'Resolved liquid–gas flow',
        status: 'experimental',
        description:
          'Simulate liquid and gas together, with configuration-specific density-ratio and interface behaviour. PF-FLIP can use volume correction to limit liquid-volume drift during expansion; gas is incompressible by default.',
      },
      {
        name: 'Compressible air in closed tanks',
        status: 'experimental',
        description:
          'An optional compressible gas for closed PF-FLIP tanks, including rotating frames and pressurised ullage; off by default.',
      },
      {
        name: 'Turbulence and wall treatment',
        status: 'experimental',
        description:
          'Finite-volume SST k–ω turbulence with resolved walls or a smooth-wall Spalding treatment, on uniform grids for single-fluid flow.',
      },
      {
        name: 'Non-Newtonian models',
        status: 'implemented',
        description:
          'Bingham, power-law, Casson, Herschel–Bulkley, and Carreau–Yasuda fluids in FLIP and finite volumes. FLIP also offers experimental unregularised yield-stress laws, so plugs genuinely stop.',
      },
      {
        name: 'Viscoelasticity models',
        status: 'implemented',
        description:
          'Oldroyd-B, Giesekus, and linear PTT fluids in FLIP and finite volumes, with configuration limits stated by each solver.',
      },
      {
        name: 'Heat transfer',
        status: 'experimental',
        description:
          'Transport temperature with buoyancy and exchange heat with walls and bodies at a set temperature, a set heat flux, or through a surface film. Liquid and gas in PF-FLIP and finite volumes; liquid only in the meshless solver.',
      },
      {
        name: 'Phase change and tank pressurisation',
        status: 'experimental',
        description:
          'Evaporation and condensation at the PF-FLIP liquid–vapour interface of a sealed tank, or a lumped vapour ullage with relief vent, regulated pressurant, and liquid ports on keyframed set points. Nucleate wall boiling is planned.',
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
      'Run many variants, capture the quantities behind a design decision, and take them into your analysis tools.',
    features: [
      {
        name: 'Easy setup files',
        status: 'implemented',
        description:
          'Save and reload JSON setups, share common inputs through inheritance, and run the same setup from the command line. The setup format is versioned at 1.0, and older setups migrate offline.',
      },
      {
        name: 'Study comparisons and automation',
        status: 'implemented',
        description:
          'Run multi-case studies from the command line and write comparisons as JSON, CSV, and Markdown.',
      },
      {
        name: 'Numerical controls',
        status: 'implemented',
        description:
          'Choose resolution, time stepping, and solver settings. FLIP offers Basic, Advanced, Expert, and Search views.',
      },
      {
        name: 'Pressure and velocity probes',
        status: 'implemented',
        description:
          'Sample selected regions and display time histories. Pressure probes measure fluid regions rather than wall-pressure taps.',
      },
      {
        name: 'Automatic measurement CSV',
        status: 'implemented',
        description:
          'Record configured probes and body measurements during the run, with separate files for successive runs.',
      },
      {
        name: 'Body motion, forces, and moments',
        status: 'implemented',
        description:
          'Track named bodies and export motion or integrated loads where the selected method provides them.',
      },
      {
        name: 'Wall shear stress',
        status: 'experimental',
        description:
          'Export wall shear stress on wetted body walls and colour bodies by pressure or shear in the viewer. Finite volumes also accumulate time-averaged shear and the oscillatory shear index.',
      },
      {
        name: 'Passive tracers',
        status: 'implemented',
        description:
          'Release tracer particles from the Probes tree, watch their paths live, and export them with FLIP and finite-volume results.',
      },
      {
        name: 'VTK field and surface export',
        status: 'implemented',
        description:
          'Export supported particle fields, finite-volume grids, and reconstructed free surfaces for external post-processing.',
      },
      {
        name: 'Checkpoint and restart',
        status: 'implemented',
        description:
          'Resume supported FLIP and meshless runs after reopening a desktop document, or configure checkpoints in CLI setups. Restart begins at time zero; persistent finite-volume restart is not yet available.',
      },
      {
        name: 'Python runtime',
        status: 'experimental',
        description:
          'Configure, validate, and step simulations in-process from Python, for example inside an external optimisation loop, or drive a tank’s motion through a Gymnasium-style reset/step environment for control and reinforcement learning. The initial package targets Linux x86_64 with Vulkan.',
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
      'Machine-readable setup documents and packaged tools that software can use to validate and run CFD tasks.',
    features: [
      {
        name: 'Machine-readable setup schema',
        status: 'implemented',
        description:
          'A generated JSON schema describes the setup document, and setups and studies can be validated from the command line without starting a simulation.',
      },
      {
        name: 'Agent Pack CLI and MCP tools',
        status: 'implemented',
        description:
          'Windows and Linux desktop packages include tools to validate setups and run task-based CFD workflows from the command line or through MCP.',
      },
      {
        name: 'Local setup assistant',
        status: 'experimental',
        description:
          'A prototype that runs locally and turns a short English description of a partially filled tank under sinusoidal motion into a reviewable setup. Running the simulation stays a separate step.',
      },
      {
        name: 'Assistant-guided studies',
        status: 'planned',
        description:
          'Set up, run, and summarise a study together with an assistant inside the workspace.',
      },
    ],
  },
] as const satisfies readonly CapabilityGroup[];
