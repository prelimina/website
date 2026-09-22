export const workflow = [
  {
    title: 'Define',
    text: 'Start with a question. Set your geometry, materials, and the conditions that matter.',
    detail: 'Give your design question a shape.',
  },
  {
    title: 'Preview',
    text: 'Explore how fluid moves. Look for behaviour that deserves a closer look.',
    detail: 'Make the behaviour easier to see.',
  },
  {
    title: 'Compare',
    text: 'Change one variable. Keep assumptions consistent as you explore alternatives.',
    detail: 'Put your next design choice in perspective.',
  },
  {
    title: 'Refine & export',
    text: 'Carry what you learn into your next analysis, design iteration, or physical prototype.',
    detail: 'Take a more informed next step.',
  },
] as const;

export const showcases = [
  {
    slug: 'baffle-design',
    number: '01',
    title: 'A small change. A different flow.',
    category: 'Baffles & internal geometry',
    type: 'baffle',
    description:
      'How could a different baffle arrangement change the motion of liquid in a tank?',
    question:
      'Which baffle arrangement is worth taking into a more detailed analysis?',
    variables: 'Baffle position, height, and arrangement.',
    assumptions:
      'A defined tank, liquid properties, fill level, and prescribed motion. Keep the forcing and comparison interval consistent.',
    metric:
      'A candidate comparison could examine free-surface response and loads on selected surfaces.',
    limitation:
      'No public comparison dataset or validated application record is available for this candidate.',
  },
  {
    slug: 'tank-motion',
    number: '02',
    title: 'Understand what moves within.',
    category: 'Tanks & prescribed motion',
    type: 'tank',
    description:
      'Explore the design questions behind a moving tank and a shifting free surface.',
    question: 'How does a prescribed tank motion affect the liquid response?',
    variables: 'Fill level, motion amplitude, and motion frequency.',
    assumptions:
      'Prescribed vessel motion with explicit liquid properties and a documented time window.',
    metric:
      'A candidate study could examine free-surface response and the time history of resultant loads.',
    limitation:
      'Motion and load capabilities require case-specific verification. No performance or accuracy claim is made here.',
  },
  {
    slug: 'liquid-handling',
    number: '03',
    title: 'Follow the fluid. Find the question.',
    category: 'Liquid handling',
    type: 'pipe',
    description:
      'Frame an early-stage study around an inlet, an outlet, and the geometry in between.',
    question:
      'Which geometry or operating condition should the next experiment focus on?',
    variables: 'Geometry, inlet conditions, and fluid properties.',
    assumptions:
      'A solver-appropriate setup with explicit boundary conditions, units, and model scope.',
    metric:
      'Define the decision metric before running the study; document its extraction and limitations.',
    limitation:
      'This is an exploration theme, not a released or validated liquid-handling application.',
  },
] as const;

export const faqs = [
  {
    question: 'What is Prelimina designed for?',
    answer:
      'Early-stage fluid-design exploration: understanding behaviour, framing comparisons, and deciding what to investigate next. The product is in development, and suitability must be assessed for each case.',
  },
  {
    question: 'Does it run in my browser?',
    answer:
      'Prelimina is a native desktop product. This website introduces the workflow; the interactive illustration is a schematic, not a simulation running in your browser.',
  },
  {
    question: 'Which GPUs and operating systems are supported?',
    answer:
      'A qualified public platform and GPU matrix has not been published yet. Build availability alone is not a support guarantee. Requirements will accompany each approved release.',
  },
  {
    question: 'Can I use it for commercial work?',
    answer:
      'Commercial access is by agreement. Approved licensing terms and release eligibility will be published before a public download is offered.',
  },
  {
    question: 'Are these validated results?',
    answer:
      'The illustrations on this site are workflow schematics. Candidate showcases are questions we can explore, not validation records. Public evidence will identify the method, version, assumptions, and limits of each case.',
  },
] as const;

export const nav = [
  { label: 'Product', href: '/#product' },
  { label: 'Showcases', href: '/showcases/' },
  { label: 'Downloads', href: '/download/' },
  { label: 'Docs', href: '/docs/' },
  { label: 'Support', href: '/support/' },
];
