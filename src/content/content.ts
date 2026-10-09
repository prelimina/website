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
    slug: 'dam-break-validation',
    number: '02',
    title: 'Check a dam-break impact on a box against experiment.',
    category: 'Free-surface impact',
    type: 'tank',
    availability: 'in_development',
    description:
      'Release a column of water onto a box in a long tank and compare the impact pressure and water levels with measurements.',
    media: {
      kind: 'image',
      src: '/assets/showcases/dam-break-validation.webp',
      alt: 'Perspective view of a long tank. A column of water at the far end collapses, runs along the floor, slams into a small box and sprays over it, then sloshes back. Below it, the simulated pressure on the front of the box draws in step over the measured trace.',
      caption:
        'A repeat Prelimina run with the record settings, coloured by speed (0–4 m/s). The P1 trace draws in step with the view over the measured one. Development build 288a4f34, which gives the same P1 and P2 impulses as the run in the chart (+13 % and +4 %).',
      aspectRatio: '960 / 770',
      fit: 'contain',
    },
    chart: {
      kind: 'image',
      src: '/assets/showcases/dam-break-validation-chart.svg',
      alt: 'Two line charts over six seconds. Top: pressure at P1 on the front of the box; the Prelimina curve rises with the measured impact, peaks somewhat higher and then follows the measured decay and the returning wave. Bottom: water level near the reservoir end wall; the Prelimina curve follows the measured drawdown and the returning wave closely.',
      caption:
        'Pressure at P1 on the front of the box, 21 mm above the floor, and the water level 0.58 m from the reservoir end wall. Experiment: MARIN measurements distributed as SPHERIC benchmark Test 2 (Kleefsman et al. 2005); both pressure signals use a 10 ms moving average. Prelimina FLIP with density projection and two PBD iterations, 10 mm grid, CFL 0.4, open roof. Development build a96e149a.',
      aspectRatio: '460.8 / 403.2',
      fit: 'contain',
    },
    metricsHeading: 'Comparison with measurements',
    question:
      'Does the simulated impact load on an obstacle, and the water level that follows, match what was measured?',
    inputs:
      'A 3.22 m long, 1 m wide tank with a 0.55 m column of water at one end and a 0.16 × 0.16 × 0.40 m box on the floor in its path. Water properties and gravity. The column is released at t = 0.',
    variables:
      'Grid spacing (13.3, 10 and 8 mm) and the time-step limit (CFL 2 and 0.4).',
    controls:
      'The tank, box, water column and sensor positions of the MARIN experiment (SPHERIC benchmark Test 2): four pressure sensors on the front of the box, four on its top, and four water-level gauges along the tank.',
    outputs:
      'Pressure histories at the eight box sensors and four water-level histories, exported as CSV, and the live fluid view.',
    metrics:
      'Pressure impulse over the first second at the two lowest front sensors: +13 % (P1) and +4 % (P2) against the experiment. Mean pressure from 2 to 6 s, including the reflected waves, within 5 % on all four front sensors. The impact reaches P1 to P3 within 20 ms of the measurement. Water level near the reservoir end wall: median error 8 mm over 6 s; the returning wave arrives within 0.1 s. At the record settings the 10 and 8 mm grids give the same impulses, +13 % and +4 %; on 13.3, 10 and 8 mm grids at CFL 2 the P1 impulse stays between +8 % and +11 %.',
    assumptions:
      'A single liquid; the air is not simulated, so trapped air pockets close freely. The gate that holds the water in the experiment is not modelled: the column is released at once. Each pressure is the average over a small sphere of water in front of the sensor, not a flush wall transducer. The tank is open at the top, as in the experiment.',
    limitation:
      'One experiment. The two upper front sensors, P3 and P4, 0.10 and 0.14 m up and close to the top edge of the box, peak 30 % and 75 % below the measurement on every grid; the cause is not yet known. The sensors on top of the box show short spikes at about 1.5 s, up to 2.7 times the measured peak, that the experiment does not. The impact peaks sit 32 % (P1) and 17 % (P2) above the measurement on both record grids, and at CFL 2 they rise as the grid is refined, so impulses are compared rather than peaks.',
    nextAction: {
      label: 'Explore geometry capabilities',
      href: '/capabilities/#geometry',
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
  {
    slug: 'capillary-microgravity',
    number: '06',
    title: 'Wetting takes over in microgravity.',
    category: 'Microgravity',
    type: 'tank',
    availability: 'in_development',
    description:
      'Drop a half-filled spherical tank from 0.1 g to 0.001 g and watch surface tension and the wall contact angle reshape the liquid.',
    media: {
      kind: 'image',
      src: '/assets/showcases/capillary-microgravity.webp',
      alt: 'Two half-filled spherical tanks side by side. After gravity drops, the wetting liquid on the left climbs the wall and leaves a curved hollow; the non-wetting liquid on the right pulls away from the wall and rises into a dome.',
      caption:
        'Prelimina FLIP runs of a half-filled 62.5 mm sphere with a water-like liquid, surface tension 0.072 N/m, and a static contact angle of 30° (left) or 150° (right). Gravity steps from 0.1 g to 0.001 g at t = 1 s. Mid-plane section coloured by speed (0–0.1 m/s). Development build 389717f5.',
      aspectRatio: '1200 / 656',
      fit: 'contain',
    },
    question:
      'Where does the liquid go once surface tension and wetting outweigh gravity?',
    inputs:
      'Tank geometry, fill level, liquid properties, surface tension, a static contact angle, and a gravity history.',
    variables:
      'Contact angle or gravity level. Change one at a time.',
    controls:
      'Use the same geometry, fill, grid, numerical settings, and gravity history for every contact angle. A run without surface tension stays at rest.',
    outputs:
      'Live fluid views and particle exports for offline rendering.',
    metrics:
      'Meniscus height at the wall against the centre, and where the liquid sits in the tank.',
    assumptions:
      'A single liquid in a passive void, a static contact angle on a rigid wall, and a step change in gravity. The Bond number on the tank radius is 0.13 after the step.',
    limitation:
      'Software demonstration. At intermediate contact angles (about 60–120°) on curved walls the liquid still drifts around the tank at 0.001 g; a fix is in progress. Low viscosity keeps the liquid moving after 8 s. Gas, thermal, and propellant effects are not represented.',
    nextAction: {
      label: 'Explore motion capabilities',
      href: '/capabilities/#motion',
    },
  },
  {
    slug: 'rolling-tank-impact',
    number: '07',
    title: 'Check sloshing impacts in a rolling tank against a benchmark.',
    category: 'Tanks & prescribed motion',
    type: 'tank',
    availability: 'in_development',
    description:
      'Roll a shallow water tank with the measured motion of SPHERIC benchmark Test 10 and compare the wall pressure through four lateral impacts.',
    media: {
      kind: 'image',
      src: '/assets/showcases/spheric-t10-validation.webp',
      alt: 'Side view of a long, closed tank rolling a few degrees each way. The shallow water runs to one end and slams into the left wall, sending a sheet up the wall to the lid, then runs back; four times in all. Below it, the simulated pressure at the wall sensor S1 draws in step over the measured trace, each impact lining up with a measured one.',
      caption:
        'A Prelimina FLIP run with the record settings: the closed tank rolls in a still domain, driven by the measured roll history. Side view coloured by speed (0–1.5 m/s); isolated spray particles, about 0.5 % of the water, are not drawn. The pressure at S1 draws in step over the measured reference run; both use a 10 ms moving average. Development build 1b766fd6.',
      aspectRatio: '960 / 1012',
      fit: 'contain',
    },
    chart: {
      kind: 'image',
      src: '/assets/showcases/spheric-t10-validation-chart.svg',
      alt: 'Top: the pressure at S1 over 8.35 s. The Prelimina curve rises with each of the four measured impacts and then sits a few millibar above the measured pressure while the water stays against the wall. Bottom: four close-ups of the raw signals around each impact, with the spread of the peaks over 102 repeated experiments as a band. The first simulated impact shows a single tall spike; the later peaks fall near or above the band.',
      caption:
        'Pressure at sensor S1 on the left wall, at the still-water level. Top: both signals with a 10 ms moving average. Bottom: raw signals around each impact against the peak mean ± 1 standard deviation of 102 repeated runs. Experiment: SPHERIC benchmark Test 10 (Souto-Iglesias and Botia-Vera), lateral impact, water, 93 mm fill. Prelimina FLIP with density projection, no PBD and wall boundary damping one cell wide, 4 mm grid, CFL 0.4, closed tank. Development build 1b766fd6.',
      aspectRatio: '960 / 760',
      fit: 'contain',
    },
    metricsHeading: 'Comparison with measurements',
    question:
      'Does the simulated wall pressure follow a sequence of sloshing impacts in a rolling tank, and do the impacts arrive on time?',
    inputs:
      'A closed tank, 900 × 508 × 62 mm inside, with 93 mm of water, rolled about the centre of its floor by the measured roll history (±4°, period 1.63 s). Water properties and gravity.',
    variables:
      'Grid spacing (6, 4 and 3 mm), the time-step limit (CFL 2 and 0.4), and the particle-transfer settings.',
    controls:
      'The tank, fill, roll history and sensor position of SPHERIC benchmark Test 10: pressure sensor S1 on the left wall, at the still-water level.',
    outputs:
      'The S1 pressure history and the tank motion, exported as CSV, and the live fluid view.',
    metrics:
      'All four impacts reach S1 within 35 ms of the measurement. Pressure impulse at S1 over each impact, from 0.4 s before to 0.3 s after the measured peak, against the reference run: −2 % for the first impact, then +35 %, +47 % and +60 %. On 6, 4 and 3 mm grids the first impulse stays between −12 % and +2 %; the later three range from +29 % to +72 %, and two identical 4 mm runs differ by up to 25 percentage points.',
    assumptions:
      'A single liquid; the air is not simulated, so the air trapped at the impacts is absent and the water closes freely. Each pressure is the average over a 6 mm sphere of water at the sensor, not a flush wall transducer. The tank rolls as a rigid body in a still domain, driven by the measured roll rate.',
    limitation:
      'One sensor and one published experiment. The first impact gives a single-step pressure spike of up to 550 mbar against a measured 37 ± 7 mbar, and the spike grows as the grid is refined, so impulses are compared rather than peaks. From the second impact on, the pressure after each impact sits about 3 mbar above the measurement under every setting tried, so the later impulses come out 30–70 % high; the air that the experiment traps at these impacts, which is not simulated, is the leading candidate. From the second impact on, a few hundred particles hang as spray above the water.',
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
  title: 'Built by people who <em>write and use solvers.</em>',
  description:
    'Prelimina is developed by <em>PLASMICA Ltd.</em>, a spin-out from the University of Split, Croatia. Most of the team hold PhDs in fluid dynamics, numerical methods, engineering, and have spent their careers between university research and industrial applications, from deep sea to deep space.',
  facts: [
    {
      value: 'PhD',
      label: 'Research-trained core team',
      description:
        'Fluid dynamics, numerical analysis, HPC, and machine learning are the fields the team publishes and teaches in.',
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
        'Every solver in Prelimina is designed, implemented, and used by the people who answer your questions about it.',
    },
  ],
  link: { label: 'About the company', href: 'https://plasmica.com/' },
} as const;
