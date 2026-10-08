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

export const solverCards = [
  {
    name: 'FLIP',
    status: 'implemented',
    description:
      'The fastest ever, industry accurate Eulerian–Lagrangian hybrid for quick prototyping.',
  },
  {
    name: 'FVM',
    status: 'experimental',
    description:
      'The most flexible cut-cell finite-volume solver ever, with Eulerian conservation for cases where that is important.',
  },
  {
    name: 'FIRM',
    status: 'planned',
    description:
      'The most robust and accurate implicit pure Lagrangian method in the world, where everything easily moves and deforms.',
  },
] as const;

interface CapabilityGroup {
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
          'Prescribe inlet velocity or outlet pressure on domain faces, with availability determined by the selected method.',
      },
      {
        name: 'Mesh-surface inflow',
        status: 'development',
        description:
          'Prescribed discharge and particle emission exist in FLIP/FIRM; broader surface shapes, motion, and flow enforcement are being developed.',
      },
      {
        name: 'Finite mesh-surface outlets',
        status: 'planned',
        description:
          'Outflow through a bounded surface, with particle removal and independent discharge measurements.',
      },
    ],
  },
  {
    id: 'motion',
    title: 'Motion & free surfaces',
    icon: 'motion',
    summaryTitle: 'Unconstrained motion',
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
          'Model prescribed domain translation; rotating-frame forces are available in compatible FLIP and meshless configurations.',
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
          'Include capillary forces in the supported free-surface formulations.',
      },
      {
        name: 'Contact angles and wetting',
        status: 'experimental',
        description:
          'Static wetting, and selected dynamic or hysteretic models.',
      },
      {
        name: 'Wave-generation boundaries',
        status: 'development',
        description:
          'Analytical wave targets with direct and relaxation-zone wave generation.',
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
    ],
  },
  {
    id: 'multiphysics',
    title: 'Multiphysics',
    icon: 'nodes',
    summaryTitle: 'Multiphysics',
    summary:
      'Couple the liquid to free-moving bodies and structural solvers, add a resolved gas phase, and choose viscous or shear-dependent fluids. Heat transfer and viscoelasticity are on the roadmap.',
    description:
      'Fluid models, method choices, and coupling to bodies and other solvers.',
    features: [
      {
        name: 'Newtonian viscosity',
        status: 'implemented',
        description:
          'Set liquid density and viscosity across low- and high-viscosity Newtonian flow regimes, with implicit viscosity in supported configurations.',
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
          'Native coupling (through preCICE on Linux), including the CalculiX adapter, for force and motion exchange on fixed-topology surfaces.',
      },
      {
        name: 'Resolved liquid–gas flow',
        status: 'experimental',
        description:
          'Two-phase formulations, with configuration-specific density-ratio and interface behaviour.',
      },
      {
        name: 'Turbulence and wall treatment',
        status: 'experimental',
        description:
          'Finite-volume SST k–ω turbulence with resolved walls or a smooth-wall Spalding treatment.',
      },
      {
        name: 'Finite-volume and meshless methods',
        status: 'experimental',
        description:
          'Explore Cartesian finite volumes with cut cells, or a fully Lagrangian meshless particle formulation.',
      },
      {
        name: 'Non-Newtonian fluid models',
        status: 'development',
        description:
          'Add constitutive models for fluids whose viscosity changes with shear or deformation.',
      },
      {
        name: 'Viscoelasticity',
        status: 'planned',
        description:
          'Represent fluids with both viscous and elastic response through planned constitutive models.',
      },
      {
        name: 'Heat transfer',
        status: 'planned',
        description:
          'Transport temperature through the liquid and exchange heat with walls and bodies.',
      },
    ],
  },
  {
    id: 'optimisation',
    title: 'Automation & optimisation',
    icon: 'chart',
    summaryTitle: 'Built for optimisation',
    summary:
      'Dimensions, fill levels, motion, and fluid properties are all plain setup inputs. Run batches of variants from the command line, compare the results automatically, or drive the solver from your own optimisation loop.',
    description:
      'Run many variants, capture the quantities behind a design decision, and take them into your analysis tools.',
    features: [
      {
        name: 'Editable setup files',
        status: 'implemented',
        description:
          'Save and reload JSON setups, share common inputs through inheritance, and run the same setup from the command line.',
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
        name: 'VTK field and surface export',
        status: 'implemented',
        description:
          'Export supported particle fields, finite-volume grids, and reconstructed free surfaces for external post-processing.',
      },
      {
        name: 'Checkpoint and restart',
        status: 'implemented',
        description:
          'Save and resume supported FLIP and meshless configurations. Persistent finite-volume restart is not yet available.',
      },
      {
        name: 'Python runtime',
        status: 'experimental',
        description:
          'Configure, validate, and step simulations in-process from Python, for example inside an external optimisation loop. The initial package targets Linux x86_64 with Vulkan.',
      },
    ],
  },
  {
    id: 'ai',
    title: 'AI-ready setups',
    icon: 'sparkle',
    summaryTitle: 'AI-ready',
    summary:
      'Setups are plain, schema-validated files that AI agents can read, write, and check before a run. Next: an assistant that sets up a case, runs it, and summarises the results with you.',
    summaryStatus: 'development',
    description:
      'Setup documents that software can author and check, and the assistant being built on them.',
    features: [
      {
        name: 'Machine-readable setup schema',
        status: 'implemented',
        description:
          'A generated JSON schema describes the setup document, and setups and studies can be validated from the command line without starting a simulation.',
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
