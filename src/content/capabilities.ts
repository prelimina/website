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
      'Working functionality that needs broader testing and qualification.',
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

interface CapabilityGroup {
  id: string;
  title: string;
  icon: string;
  summaryTitle: string;
  summary: string;
  description: string;
  features: readonly {
    name: string;
    status: keyof typeof maturity;
    description: string;
  }[];
}

export const capabilityGroups = [
  {
    id: 'fluid-flow',
    title: 'Fluid flow',
    icon: 'waves',
    summaryTitle: 'Follow the liquid.',
    summary:
      'Explore sloshing, splashing, and free-surface motion. See how the liquid responds when you change a tank, a baffle, or the way it moves.',
    description: 'From a single moving liquid to more specialised flow models.',
    features: [
      {
        name: 'Incompressible free-surface flow',
        status: 'implemented',
        description:
          'Single-liquid FLIP/APIC simulation with particles tracking the moving liquid and a grid solving pressure.',
      },
      {
        name: 'Newtonian viscosity',
        status: 'implemented',
        description:
          'Set liquid density and viscosity for laminar flow, with implicit viscosity in supported configurations.',
      },
      {
        name: 'Surface tension',
        status: 'implemented',
        description:
          'Include capillary forces in the supported free-surface formulations.',
      },
      {
        name: 'Adaptive time stepping',
        status: 'implemented',
        description:
          'Use CFL-based time-step control with a maximum step, or select a fixed step for a controlled study.',
      },
      {
        name: 'Finite-volume and meshless methods',
        status: 'experimental',
        description:
          'Explore Cartesian finite volumes with cut cells, or a fully Lagrangian meshless particle formulation.',
      },
      {
        name: 'Resolved liquid–gas flow',
        status: 'experimental',
        description:
          'Two-phase FLIP and finite-volume formulations, with configuration-specific density-ratio and interface behaviour.',
      },
      {
        name: 'Contact angles and wetting',
        status: 'experimental',
        description:
          'Static wetting and selected dynamic or hysteretic models in FLIP/FVM; meshless wetting currently covers a static angle.',
      },
      {
        name: 'Turbulence and wall treatment',
        status: 'experimental',
        description:
          'Finite-volume SST k–ω turbulence with resolved walls or a smooth-wall Spalding treatment.',
      },
    ],
  },
  {
    id: 'geometry',
    title: 'Geometry & boundaries',
    icon: 'layers',
    summaryTitle: 'Start with your geometry.',
    summary:
      'Bring surfaces from your existing CAD tools. Define the liquid and choose a resolution, without building a body-fitted volume mesh.',
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
        name: 'Initial liquid regions',
        status: 'implemented',
        description:
          'Define the initial liquid with surfaces and fluid seeds, and inspect the fill preview in the scene.',
      },
      {
        name: 'Immersed geometry',
        status: 'implemented',
        description:
          'Represent vessel walls and internal surfaces within the solver’s particle or Cartesian-grid discretisation.',
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
    title: 'Motion & coupling',
    icon: 'motion',
    summaryTitle: 'Put motion into the model.',
    summary:
      'Translate a vessel, rotate a component, or prescribe an oscillation. Use motion as a design input and examine the fluid response.',
    description:
      'Prescribe the experiment’s motion or explore coupled response.',
    features: [
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
        name: 'Fluid-driven rigid bodies',
        status: 'experimental',
        description:
          'Six-degree-of-freedom response and pressure–body coupling for selected solver and phase configurations.',
      },
      {
        name: 'External structural coupling',
        status: 'experimental',
        description:
          'Native Linux coupling through preCICE, including the CalculiX adapter, for force and motion exchange on fixed-topology surfaces.',
      },
      {
        name: 'Wave-generation boundaries',
        status: 'development',
        description:
          'Analytical Airy-wave targets are implemented; direct and relaxation-zone wave generation are still in development.',
      },
    ],
  },
  {
    id: 'compute',
    title: 'GPU computing',
    icon: 'chip',
    summaryTitle: 'Put your GPU to work.',
    summary:
      'Run fluid studies on your desktop GPU. Sparse grids allocate simulation data around the active liquid, helping you make use of available GPU memory.',
    description: 'A native compute pipeline built around GPU execution.',
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
        name: 'CUDA backend',
        status: 'experimental',
        description:
          'An optional NVIDIA compute path in development builds, separate from the Vulkan download configuration.',
      },
    ],
  },
  {
    id: 'workspace',
    title: 'Desktop workspace',
    icon: 'desktop',
    summaryTitle: 'Build, run, and inspect.',
    summary:
      'Keep geometry, physical setup, numerical controls, and the live fluid view in one native workspace. Change an input and explore the next design.',
    description:
      'A visual workspace with direct access to the simulation setup.',
    features: [
      {
        name: 'Visual scene authoring',
        status: 'implemented',
        description:
          'Edit geometry, materials, initial liquid, prescribed motion, and measurement regions in contextual inspectors.',
      },
      {
        name: 'Numerical controls',
        status: 'implemented',
        description:
          'Choose resolution, time stepping, and solver settings. FLIP offers Basic, Advanced, Expert, and Search views.',
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
        name: 'Editable setup files',
        status: 'implemented',
        description:
          'Save and reload JSON setups, share common inputs through inheritance, and run the same setup from the command line.',
      },
    ],
  },
  {
    id: 'measurements',
    title: 'Measurements & output',
    icon: 'chart',
    summaryTitle: 'Take insight beyond the image.',
    summary:
      'Follow pressure and velocity probes, review supported body loads, and export CSV measurements and VTK fields for your next comparison.',
    description:
      'Capture the quantities behind a design decision and take them into your analysis tools.',
    features: [
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
        name: 'Study comparisons and automation',
        status: 'implemented',
        description:
          'Run multi-case studies from the command line and write comparisons as JSON, CSV, and Markdown.',
      },
      {
        name: 'Checkpoint and restart',
        status: 'implemented',
        description:
          'Save and resume supported FLIP and meshless configurations. Persistent finite-volume restart is not yet available.',
      },
    ],
  },
] as const satisfies readonly CapabilityGroup[];
