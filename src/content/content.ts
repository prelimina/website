import site from './site.json';
import { getInquiryState, inquiryHref } from './inquiry.mjs';

export const productActionConfig = {
  label: 'Download now',
  href: '/#download',
};
export function createProductAction(
  currentRelease: { downloads?: readonly unknown[] } | null,
) {
  const available = Boolean(currentRelease?.downloads?.length);
  return {
    ...productActionConfig,
    available,
  };
}
export const inquiryAction = getInquiryState(site.contactEmail);
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

// Frames from Prelimina FLIP runs of the Hu, Kashiwagi & Kishev (2004) tank (T = 1.3 s, 6 cm fill,
// amplitude reduced from 0.06 to 0.015 m), side view over two forcing periods (3T-5T); the source cases live in prelimina-cases/showcase/kishev_workflow.
export const workflowIllustration = [
  {
    id: 'set-up',
    title: 'Set up',
    illustration: 'Define a tank, its fill level, and the motion.',
    media: {
      src: '/assets/workflow/set-up.webp',
      still: '/assets/workflow/set-up.webp',
      alt: 'Side view of a rectangular tank with a shallow layer of water at rest.',
    },
  },
  {
    id: 'simulate',
    title: 'Simulate',
    illustration: 'Inspect fluid motion.',
    media: {
      src: '/assets/workflow/simulate.webp',
      still: '/assets/workflow/simulate-still.webp',
      alt: 'Prelimina simulation of the tank shaken side to side: a wave travels back and forth and runs up each end wall.',
    },
  },
  {
    id: 'iterate',
    title: 'Iterate',
    illustration: 'Add a baffle, rerun, and compare.',
    media: {
      src: '/assets/workflow/iterate.webp',
      still: '/assets/workflow/iterate-still.webp',
      alt: 'The same tank and motion with a floor baffle at mid-length.',
    },
  },
] as const;

export const availabilityLabels = {
  released: 'Released',
  in_development: 'In development',
  planned: 'Planned',
} as const;

export interface ShowcaseMediaConfig {
  kind: 'image' | 'video';
  src: string;
  alt?: string;
  caption?: string;
  aspectRatio?: string;
  fit?: 'contain' | 'cover';
  poster?: string;
  controls?: boolean;
}

export type ShowcaseIllustrationType = 'baffle' | 'tank' | 'pipe';

interface Application {
  slug: string;
  number: string;
  title: string;
  category: string;
  type: ShowcaseIllustrationType;
  availability: keyof typeof availabilityLabels;
  description: string;
  media?: ShowcaseMediaConfig;
  chart?: ShowcaseMediaConfig;
  metricsHeading?: string;
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

export const showcases: readonly Application[] = [
  {
    slug: 'sloshing-validation',
    number: '01',
    title: 'Check sloshing wall pressure against experiment.',
    category: 'Tanks & prescribed motion',
    type: 'tank',
    availability: 'in_development',
    description:
      'Shake a shallow tank side to side and compare the wall-pressure history with published measurements.',
    media: {
      kind: 'image',
      src: '/assets/showcases/sloshing-validation.webp',
      alt: 'Side view of the tank as the water sloshes and slams into the end wall, coloured by speed. Below it, the simulated pressure at the wall probe P1 draws in step with the motion over the measured trace; each impact spike lines up with a measured one.',
      caption:
        'A repeat Prelimina run of the same set-up over the last five forcing periods (its impulse: −0.3 %). The P1 trace draws in step with the tank-fixed view, coloured by speed (0–2 m/s). The measured trace is placed by the same cross-correlation phase shift; simulated impact spikes above 3500 Pa run off the top. Development build 80e942f6.',
      aspectRatio: '960 / 900',
      fit: 'contain',
    },
    chart: {
      kind: 'image',
      src: '/assets/showcases/sloshing-validation-chart.svg',
      alt: 'Line chart of phase-averaged wall pressure over one forcing period. The Prelimina curve follows the measured double-humped impact peak; the published CIP-CSL3 simulation reaches a lower peak.',
      caption:
        'Pressure at P1, 5 cm above the floor on the end wall, averaged over five forcing periods once the motion is steady. Experiment and CIP-CSL3 from Hu, Kashiwagi and Kishev (2004), Fig. 3; impulse is integrated over the plotted range, clipped at 2500 Pa where the printed figure ends. Prelimina FLIP with density projection and two PBD iterations, 3 mm grid, CFL 0.4. Development build 80e942f6.',
      aspectRatio: '460.8 / 280.8',
      fit: 'contain',
    },
    metricsHeading: 'Comparison with measurements',
    question:
      'Does the simulated pressure on the tank wall match what was measured?',
    inputs:
      'A 0.6 m long tank with 6 cm of water, moved sideways with a 6 cm amplitude at a 1.3 s period, close to the first sloshing mode. Water properties and gravity.',
    variables:
      'Forcing period and amplitude, fill depth, and grid spacing. The published experiment also covers 0.8 s and 1.7 s periods.',
    controls:
      'The same tank, fill, motion, and probe position as the experiment. The motion is ramped in over the first three periods and the comparison uses periods 13 to 18.',
    outputs:
      'A pressure history at the wall probe, exported as CSV, and the live fluid view.',
    metrics:
      'Pressure impulse per period: −2.4 % against the experiment (the published CIP-CSL3 simulation: −28 %). RMS difference of the phase-averaged curves: 121 Pa (CIP-CSL3: 165 Pa). A repeat run of the same set-up gave −0.3 % and 130 Pa, so run-to-run spread is about 2 %. A 4, 3 and 2 mm grid study on an earlier build stayed within ±3 % in impulse.',
    assumptions:
      'The tank motion is imposed, applied as an acceleration of the tank frame. The water is a single liquid; the air above it is not simulated. The model is a 6 cm wide slice between walls, 20 cells across, so the flow is close to two-dimensional.',
    limitation:
      'One forcing period and one probe from a single published experiment. The experiment does not state its time origin, so the curves are aligned in phase by cross-correlation before comparison; peaks above 2500 Pa are clipped, so impact maxima are not compared. Individual simulated impact peaks vary from period to period and reach well above the printed range.',
    nextAction: {
      label: 'Explore motion capabilities',
      href: '/capabilities/#motion',
    },
  },
  {
    slug: 'tank-motion',
    number: '02',
    title: 'Watch water respond to prescribed roll.',
    category: 'Tanks & prescribed motion',
    type: 'tank',
    availability: 'in_development',
    description:
      'Roll a partially filled tank near its sloshing period and watch the response build.',
    media: {
      kind: 'image',
      src: '/assets/showcases/roll-tank.webp',
      alt: 'Side cutaway of a rectangular tank rolling two degrees each way. The water lags the roll and its swing grows with each period until it runs high up the end walls.',
      caption:
        'Prelimina FLIP run of a 2 m tank with 0.4 m of water rolling ±2° at 2.15 s, near its first sloshing period. Side cutaway coloured by speed (0–1.6 m/s). Development build 482769ac.',
      aspectRatio: '960 / 652',
      fit: 'contain',
    },
    question: 'How does the water’s timing change through successive rolls?',
    inputs:
      'Tank geometry, water depth, liquid properties, gravity, and a prescribed roll history with a defined axis, amplitude, period, and ramp.',
    variables:
      'Roll amplitude or period, and the water depth. Hold the others fixed while changing one.',
    controls:
      'Use the same geometry, numerical settings, initial level, ramp, and observation interval.',
    outputs:
      'A live fluid view and particle exports for offline rendering.',
    metrics:
      'Free-surface run-up at the end walls and the phase between roll and water motion.',
    assumptions:
      'The tank follows an imposed roll about a fixed axis; the ship does not respond to the water. A single liquid without air entrainment.',
    limitation:
      'Near resonance the response keeps growing, and the clip stops before the water spills over the walls.',
    nextAction: {
      label: 'Explore motion capabilities',
      href: '/capabilities/#motion',
    },
  },
  {
    slug: 'liquid-handling',
    number: '03',
    title: 'Follow water through two outlets.',
    category: 'Liquid handling',
    type: 'pipe',
    availability: 'in_development',
    description:
      'Watch a tank drain through two pipes at different heights as the water level falls.',
    media: {
      kind: 'image',
      src: '/assets/showcases/two-outlet-tank.webp',
      alt: 'Side cutaway of a tank draining through two horizontal pipes. Both jets run at first; the upper jet thins and stops once the level falls below its pipe, while the lower jet keeps flowing.',
      caption:
        'Prelimina FLIP run of a 4 m tank draining through two 0.75 m square pipes, side cutaway coloured by speed (0–10 m/s). Development build 482769ac.',
      aspectRatio: '960 / 764',
      fit: 'contain',
    },
    question:
      'How does the discharge pattern change as the water level falls past each outlet?',
    inputs:
      'Tank and pipe geometry, an initial water level, liquid properties, gravity, and open outlets at the domain boundary.',
    variables:
      'Outlet heights, pipe size, and the initial level. Change one at a time.',
    controls:
      'Keep the grid, numerical settings, initial level, and observation interval the same between variants.',
    outputs:
      'A live fluid view coloured by speed and particle exports for offline rendering.',
    metrics:
      'Time until the upper jet stops, and the remaining level.',
    assumptions:
      'A finite store with no inflow, fixed geometry, and a single liquid without air entrainment. The jets leave through open boundaries.',
    limitation:
      'Pressure outlets are applied at the domain faces; general finite outlet surfaces are not yet supported.',
    nextAction: {
      label: 'Explore geometry and boundaries',
      href: '/capabilities/#geometry',
    },
  },
  {
    slug: 'spillway-gates',
    number: '04',
    title: 'Watch a gated spillway release.',
    category: 'Hydraulic structures',
    type: 'pipe',
    availability: 'in_development',
    description:
      'Lift the gates on a labyrinth spillway and follow the released water over the crest and down the chute.',
    media: {
      kind: 'image',
      src: '/assets/showcases/labyrinth-spillway.webp',
      alt: 'The labyrinth spillway set up in the Prelimina interface, followed by an orbit around the exported flow: water released through two gates runs down the chute, coloured by speed.',
      caption:
        'Set-up and run in the Prelimina interface, then the exported particles rendered in ParaView. Development build 482769ac.',
      aspectRatio: '16 / 9',
      fit: 'contain',
    },
    question:
      'How does the released water spread over the crest and through the chute as the gates open?',
    inputs:
      'Spillway and gate geometry, an initial upstream store, liquid properties, gravity, and a prescribed gate motion.',
    variables:
      'Gate opening history, upstream level, and crest or chute geometry. Change one at a time.',
    controls:
      'Keep the grid, numerical settings, initial store, and observation interval the same between variants.',
    outputs:
      'A live fluid view coloured by speed and particle exports for offline rendering.',
    metrics:
      'Time for the front to reach the chute, wetted extent, and discharge over the crest.',
    assumptions:
      'A finite upstream store with no inflow, rigid gates on a prescribed lift, and a single liquid without air entrainment.',
    limitation:
      'Moving gates need flush contact with the structure and walls at least three cells thick. The geometry resembles a real structure but is not a model of it.',
    nextAction: {
      label: 'Explore geometry and boundaries',
      href: '/capabilities/#geometry',
    },
  },
  {
    slug: 'reduced-gravity',
    number: '05',
    title: 'Compare sloshing at reduced gravity.',
    category: 'Reduced gravity',
    type: 'tank',
    availability: 'in_development',
    description:
      'Shake the same tank the same way at 1 g and at 0.01 g and compare how the liquid moves.',
    media: {
      kind: 'image',
      src: '/assets/showcases/reduced-gravity.webp',
      alt: 'Two identical tanks shaken side to side. At 1 g a single wave travels the tank; at 0.01 g the liquid is thrown up the walls in thin sheets that arc slowly back down.',
      caption:
        'Prelimina FLIP runs of the same 0.6 m tank and motion at 1 g (top) and 0.01 g (bottom); surface tension off. Side view coloured by speed (0–0.8 m/s). Development build 482769ac.',
      aspectRatio: '960 / 1160',
      fit: 'contain',
    },
    question: 'How does the liquid’s motion change when gravity is reduced?',
    inputs:
      'Tank geometry, fill level, liquid properties, a gravity value, and a prescribed motion history.',
    variables:
      'Gravity level, or the amplitude and period of the motion. Change one at a time.',
    controls:
      'Use the same geometry, fill, motion, numerical settings, and observation interval for every gravity level.',
    outputs:
      'Live fluid views and particle exports for offline rendering.',
    metrics:
      'Wall run-up and how long liquid stays off the floor.',
    assumptions:
      'A single liquid in a passive void, constant reduced gravity, and an imposed tank motion. Surface tension and wetting are switched off.',
    limitation:
      'At very low gravity surface tension and wetting dominate real liquid behaviour; they are switched off here, so this is reduced-gravity sloshing, not capillary microgravity behaviour. Gas, thermal, and propellant effects are not represented.',
    nextAction: {
      label: 'Explore motion capabilities',
      href: '/capabilities/#motion',
    },
  },
] as const satisfies readonly Application[];

// Provisional targets from the 24 September 2026 runtime assessment, with Linux
// packaging requirements retained. These are not qualified release minimums.
export const downloadPlatforms = [
  {
    id: 'windows',
    name: 'Windows',
    icon: 'windows',
    status: 'In development',
    requirements: [
      ['System', 'Windows 10 22H2 (64-bit) or newer.'],
      [
        'GPU',
        'GPUs from 2015 onward that support Vulkan 1.3, with recent drivers.',
      ],
      ['RAM', '8 GB minimum.'],
      [
        'VRAM',
        '4 GB estimated small-scene floor; 6–8 GB preferred. Larger workloads: 8–12 GB or more.',
      ],
    ],
  },
  {
    id: 'linux',
    name: 'Linux',
    icon: 'linux',
    status: 'In development',
    requirements: [
      ['System', '64-bit Linux (x86-64), glibc 2.28 (2018) or newer.'],
      [
        'GPU',
        'GPUs from 2015 onward that support Vulkan 1.3, with recent drivers.',
      ],
      ['RAM', '8 GB minimum.'],
      [
        'VRAM',
        '4 GB estimated small-scene floor; 6–8 GB preferred. Larger workloads: 8–12 GB or more.',
      ],
      ['Runtime', 'FUSE 2 for AppImage mounting.'],
    ],
  },
  {
    id: 'macos',
    name: 'macOS',
    icon: 'apple',
    status: 'Not available yet',
    requirements: [
      ['System', 'Supported macOS versions to be announced.'],
      ['GPU', 'Graphics support to be confirmed.'],
      ['Memory', 'RAM minimum to be confirmed.'],
    ],
  },
] as const;

export const faqs = [
  {
    question: 'Is Prelimina free?',
    answer:
      'Yes, during the development phase; for lawful noncommercial use: personal projects, learning, teaching, and research without a commercial purpose. No purchase, subscription, academic affiliation, or separate permission is required.',
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
    question: 'What is Prelimina for?',
    answer:
      'Practical early-stage fluid-design work, initially focused on sloshing, baffle arrangements, and free-surface motion. It is being developed for engineering teams, equipment designers, consultants, laboratories, and educators who want to understand a response before the next design iteration.',
  },
  {
    question: 'Can I download Prelimina today?',
    answer:
      'Yes, you can download the desktop application. But note that Prelimina is in development, and the application is not yet ready for production use.',
  },
  {
    question: 'Which GPUs and operating systems are supported?',
    answer:
      'The Download section lists Windows and Linux requirements. We have tested the application on Windows 10 22H2 and 11, Linuxes since 2020, and various GPUs from 2015 onwards.',
  },
  {
    question: 'Does it run in my browser?',
    answer:
      'The browser version of Prelimina is currently in development and coming soon. It will run natively in your browser. The interactive workflow illustration on this website explains an engineering task; it does not run a fluid simulation.',
  },
] as const;

export const nav = [
  { label: 'Applications', href: '/#applications' },
  { label: 'Capabilities', href: '/capabilities/' },
  { label: 'About', href: '/#team' },
];

export const team = {
  title: 'Built by people who <em>write solvers.</em>',
  description:
    'Prelimina is developed by PLASMICA, a spin-out from the University of Split. Most of the team hold PhDs in computational fluid dynamics, numerical methods, or engineering, and have spent their careers between university research and industrial projects, from launcher propellant tanks to marine hydrodynamics.',
  facts: [
    {
      value: 'PhD',
      label: 'Research-trained core team',
      description:
        'Fluid dynamics, numerical analysis, and GPU computing are the fields the team publishes and teaches in.',
    },
    {
      value: '100+',
      label: 'Years of combined experience',
      description:
        'Across academic research and engineering work for industrial clients in aerospace, marine, and manufacturing.',
    },
    {
      value: 'In-house',
      label: 'Methods written by the team',
      description:
        'Every solver in Prelimina is designed and implemented by the people who answer your questions about it.',
    },
  ],
  link: { label: 'About PLASMICA', href: 'https://plasmica.com/' },
} as const;
