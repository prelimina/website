import site from './site.json';
import { getInquiryState, inquiryHref } from './inquiry.mjs';

export const access = getInquiryState(site.contactEmail);
export const licence = {
  ...site.licence,
  dateLabel: new Date(site.licence.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }),
};
export const licensingAction = {
  label: 'Ask about licensing',
  href: inquiryHref(
    licence.email,
    'My intended use:\n\nMy licensing question:',
    'Prelimina — licensing enquiry',
  ),
};

export const workflow = [
  {
    id: 'scene',
    title: 'Scene',
    detail: 'Set up the physical experiment.',
    text: 'Bring in supported geometry, define the initial liquid and material properties, and set boundaries and prescribed motion for the chosen method.',
    illustration: 'Define a tank, its fill level, and the baffle geometry.',
  },
  {
    id: 'prepare',
    title: 'Prepare',
    detail: 'Choose the numerical detail.',
    text: 'Set resolution, time-step controls, and numerical settings. Start with the basic controls, then review the choices that matter for your question.',
    illustration:
      'Choose the resolution needed to represent the baffle and liquid.',
  },
  {
    id: 'simulate',
    title: 'Simulate',
    detail: 'Run, inspect, and measure.',
    text: 'Inspect the live fluid view and diagnostics, track supported pressure or velocity probes, and export measurements or simulation fields for review.',
    illustration:
      'Inspect liquid motion and choose where to sample the response.',
  },
] as const;

export const iteration = {
  title: 'Then iterate on the design.',
  text: 'Change an input, rerun, and compare relevant results with consistent assumptions. Use exported measurements for your comparison and make geometry changes in your existing tools.',
};

export const workflowIllustration = [
  ...workflow
    .filter((step) => step.id !== 'prepare')
    .map((step) =>
      step.id === 'scene' ? { ...step, id: 'setup', title: 'Setup' } : step,
    ),
  {
    id: 'optimize',
    title: 'Optimize',
    illustration:
      'Refine the baffle layout in your geometry tools, then rerun and compare.',
  },
] as const;

export const availabilityLabels = {
  released: 'Released',
  in_development: 'In development',
  planned: 'Planned',
} as const;
export const evidenceLabels = {
  illustration: 'Illustration',
  software_demonstration: 'Software demonstration',
  numerical_verification: 'Numerical verification',
  physical_validation: 'Physical validation',
} as const;

interface Application {
  slug: string;
  number: string;
  title: string;
  category: string;
  type: 'baffle' | 'tank' | 'pipe';
  availability: keyof typeof availabilityLabels;
  evidence: keyof typeof evidenceLabels;
  description: string;
  question: string;
  inputs: string;
  variables: string;
  controls: string;
  outputs: string;
  metrics: string;
  assumptions: string;
  limitation: string;
  nextAction: { label: string; href: string };
}

export const showcases = [
  {
    slug: 'baffle-design',
    number: '01',
    title: 'Compare baffle arrangements.',
    category: 'Baffles & internal geometry',
    type: 'baffle',
    availability: 'in_development',
    evidence: 'illustration',
    description:
      'Investigate how baffle position and geometry influence liquid motion in a tank.',
    question:
      'Which arrangement is worth taking into the next design iteration?',
    inputs:
      'Tank and baffle geometry, initial fill level, liquid properties, gravity, and a prescribed motion history.',
    variables:
      'Baffle position, height, shape, and spacing. Change one variable at a time to understand its influence.',
    controls:
      'Keep fill level, liquid properties, prescribed motion, numerical settings, and comparison interval consistent between arrangements.',
    outputs:
      'The development application provides a fluid view, diagnostics, and pressure or velocity probe histories with CSV output in supported configurations. Whole-body forces and moments depend on the selected method.',
    metrics:
      'Free-surface excursion and resultant tank or baffle loads are candidate comparison quantities. Their extraction, resolution sensitivity, and relevance to the design decision need qualification for the case; no reduction is established here.',
    assumptions:
      'A prescribed tank motion and rigid baffles, with the liquid model and treatment of the surrounding gas stated explicitly. The study isolates fluid response to the chosen geometry and forcing.',
    limitation:
      'Thin baffles, breaking surfaces, and local impacts can be sensitive to resolution and time step. A regional pressure probe samples fluid around it; it is not a wall-pressure tap. This candidate has no approved public comparison results.',
    nextAction: {
      label: 'Review measurements and their limits',
      href: '/docs/#measurements',
    },
  },
  {
    slug: 'tank-motion',
    number: '02',
    title: 'Explore liquid response to tank motion.',
    category: 'Tanks & prescribed motion',
    type: 'tank',
    availability: 'in_development',
    evidence: 'illustration',
    description:
      'Study how fill level and prescribed motion change the free-surface response.',
    question: 'How does the liquid respond when the tank’s motion changes?',
    inputs:
      'Vessel geometry, liquid properties, gravity, initial fill, and a motion history with a defined direction, amplitude, frequency, and duration.',
    variables:
      'Fill level or prescribed motion. For example, hold the tank and liquid fixed while changing the motion amplitude.',
    controls:
      'Use the same geometry, liquid model, numerical settings, initial conditions other than the chosen variable, and observation interval.',
    outputs:
      'Live fluid views and supported probe histories can help inspect the response. Body motion and load measurements are available only where the selected method supports them.',
    metrics:
      'A case could compare free-surface excursion and response timing over the same motion cycles. Load histories require a method with quantitative pressure and a separate check of their suitability.',
    assumptions:
      'The tank follows an imposed motion, as in a controlled moving-vessel experiment. Specify the motion frame and the gas treatment. Predicting a freely responding tank requires a different coupling setup.',
    limitation:
      'This scope does not qualify all translations, rotations, gas effects, or rigid-body coupling. Impact pressures and breaking waves need dedicated resolution, time-step, and reference checks. No approved public result is attached.',
    nextAction: { label: 'Explore the physical setup', href: '/docs/#scene' },
  },
  {
    slug: 'liquid-handling',
    number: '03',
    title: 'Investigate filling and overflow.',
    category: 'Liquid handling · candidate application',
    type: 'pipe',
    availability: 'planned',
    evidence: 'illustration',
    description:
      'Frame a study around where liquid enters, how it travels, and when it reaches an outlet or overflow.',
    question:
      'Which inlet condition or geometry should a filling experiment investigate next?',
    inputs:
      'A defined vessel, initial liquid, material properties, inlet location and flow history, and an outlet or overflow condition that the chosen method can represent.',
    variables:
      'Inlet location, prescribed flow, initial fill, and the flow path. Begin with a simple stationary configuration whose boundaries can be checked.',
    controls:
      'Keep fluid properties, geometry outside the chosen change, numerical settings, and the observation interval consistent. Account for liquid entering, remaining, and leaving.',
    outputs:
      'Selected development configurations implement prescribed inflow, inlet accounting, and domain pressure outlets. These components do not establish a complete filling-and-overflow workflow.',
    metrics:
      'Time to reach an overflow, retained volume, and independently measured discharge are candidate study quantities. General outlet measurements and a qualified extraction procedure remain prerequisites.',
    assumptions:
      'Start with a specified single liquid and fixed geometry. Inlet and outlet placement, orientation, and pressure treatment must fit the selected method’s supported boundary conditions.',
    limitation:
      'General inlet/outlet combinations, moving inlet surfaces, and finite outlet surfaces still have implementation or qualification gaps. This is a planned application, with no filling wizard or approved public validation record.',
    nextAction: {
      label: 'Review the boundary scope',
      href: '/docs/#boundaries',
    },
  },
] as const satisfies readonly Application[];

// Build targets from the native packaging contract; public releases will supply
// qualified requirements through the shared release manifest.
export const downloadPlatforms = [
  {
    id: 'windows',
    name: 'Windows',
    icon: 'windows',
    status: 'In development',
    requirements: [
      ['System', '64-bit Windows (x86-64). OS versions to be confirmed.'],
      ['GPU', 'Vulkan-capable GPU with a vendor driver.'],
      ['Memory', 'RAM and VRAM minimums to be confirmed.'],
    ],
  },
  {
    id: 'linux',
    name: 'Linux',
    icon: 'linux',
    status: 'In development',
    requirements: [
      ['System', '64-bit Linux (x86-64), glibc 2.28 or newer.'],
      ['GPU', 'Vulkan-capable GPU with a vendor driver.'],
      ['Memory', 'RAM and VRAM minimums to be confirmed.'],
      ['Runtime', 'FUSE 2 for AppImage mounting.'],
    ],
  },
  {
    id: 'macos',
    name: 'macOS',
    icon: 'apple',
    status: 'Not available yet',
    requirements: [
      ['System', 'Supported macOS versions and processors to be announced.'],
      ['GPU', 'Graphics support to be confirmed.'],
      ['Memory', 'RAM minimum to be confirmed.'],
    ],
  },
] as const;

export const licensingFaqs = [
  {
    question: 'Is Prelimina free?',
    answer:
      'Yes, for lawful noncommercial use: personal projects, learning, teaching, and research without a commercial purpose. No purchase, subscription, academic affiliation, or separate permission is required.',
  },
  {
    question: 'Can I use it for commercial work?',
    answer:
      'Yes, with a paid commercial licence or subscription before the work begins. This includes business evaluation, internal design work, and consulting. Eligibility depends on the purpose of the work, not your organisation’s status.',
  },
  {
    question: 'Are there limits on noncommercial use?',
    answer:
      'The licence places no limits on users, installations, computing capacity, simulation size, or duration of noncommercial use. Your hardware still determines which simulations you can run.',
  },
  {
    question: 'Do I keep my data and results?',
    answer:
      'Yes. You retain your rights in your data, designs, and results. The agreement gives PLASMICA no permission to publish them or use them to train AI models. Commercial use of results requires the appropriate entitlement.',
  },
  {
    question: 'Can I modify or share the software?',
    answer:
      'Yes, for noncommercial purposes. Include the agreement, retain the required notices, and identify your changes. Commercial redistribution needs express coverage in a separate agreement.',
  },
] as const;

export const faqs = [
  {
    question: 'What is Prelimina designed for?',
    answer:
      'Practical early-stage fluid-design work, initially focused on sloshing, baffle arrangements, and free-surface motion. It is being developed for engineering teams, equipment designers, consultants, laboratories, and educators who want to understand a response before the next design iteration.',
  },
  {
    question: 'Can I keep using my existing CAD tools?',
    answer:
      'Yes. Create and revise geometry in your existing tools, then bring supported mesh geometry into Prelimina. The development application imports STL, OBJ, PLY, glTF, and GLB files. Check geometry, units, and boundary assignments when preparing or revising a setup.',
  },
  {
    question: 'Can I download Prelimina today?',
    answer:
      'Prelimina is in development. No public installer or released application is available through this site. The application pages describe the initial focus and the scope still to qualify.',
  },
  {
    question: 'Which GPUs and operating systems are supported?',
    answer:
      'The Download section lists the current Windows and Linux build targets. Final operating system, GPU, driver, and memory requirements will accompany a public release. A macOS package is not available yet.',
  },
  {
    question: 'Does it run in my browser?',
    answer:
      'Prelimina is a native desktop product. The interactive workflow illustration on this website explains an engineering task; it does not run a fluid simulation. Browser execution is not offered here.',
  },
  {
    question: 'Are these validated results?',
    answer:
      'The images are workflow illustrations, not validated simulation results. The application pages describe engineering questions and their current scope. Results need independent verification and validation for your intended use.',
  },
] as const;

export const nav = [
  { label: 'Applications', href: '/#applications' },
  { label: 'Workflow', href: '/#workflow' },
  { label: 'Download', href: '/#download' },
];
