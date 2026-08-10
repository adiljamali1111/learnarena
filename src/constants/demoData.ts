/* ============================
   Demo Data — "DNA Extraction & PCR"
   Fully populated mock dataset for all 7 cards + 6 Den tools.
   ============================ */

import type {
  DashboardData,
  ContextMap,
  CoreConcept,
  DiagnosticQuestion,
  MasteryProgress,
  ModuleSynthesis,
  Scenario,
  AudioOverviewData,
  MindMapData,
  PresentationData,
  RecallCardsData,
  VisualBreakdownData,
  StudyReportData,
} from '../types/dashboard';

/* ============================
   Module Synthesis
   ============================ */
export const DEMO_MODULE_SYNTHESIS: ModuleSynthesis = {
  summary:
    'DNA extraction is the fundamental first step in molecular biology, separating DNA from cellular components using detergent-based lysis, protease digestion, and alcohol precipitation. Polymerase Chain Reaction (PCR) then amplifies specific DNA sequences exponentially through thermocycling \u2014 denaturation, annealing, and extension \u2014 enabling detection, sequencing, and analysis from minute template quantities.',
  keyTakeaways: [
    'DNA extraction relies on three core steps: cell lysis (detergents + proteases), purification (organic extraction or silica columns), and precipitation (isopropanol/ethanol).',
    'PCR uses a thermostable DNA polymerase (Taq) to amplify a target region 10\u2079-fold in ~2 hours through 25\u201335 cycles of 94\u00b0C denaturation, 50\u201365\u00b0C annealing, and 72\u00b0C extension.',
    'Primer design is critical: 18\u201324 bp, 40\u201360% GC content, Tm of 55\u201365\u00b0C, and no complementary 3\u2032 ends to avoid primer-dimer artifacts.',
    'Real-time PCR (qPCR) adds fluorescent dyes or probes to quantify amplification in real time, enabling absolute and relative gene expression analysis.',
  ],
};

/* ============================
   Core Concepts (5 cards)
   ============================ */
export const DEMO_CORE_CONCEPTS: CoreConcept[] = [
  {
    id: 'cc-1',
    term: 'Cell Lysis',
    definition:
      'The process of breaking open the cell membrane and nuclear envelope to release cellular contents, including DNA. Typically achieved using a lysis buffer containing SDS (sodium dodecyl sulfate) detergent and proteinase K.',
    analogy:
      'Like breaking open a pi\u00f1ata \u2014 the detergent (SDS) dissolves the fatty membrane (the pi\u00f1ata shell), and proteinase K digests the histone proteins wrapping the DNA (the candy inside).',
    xp: 25,
  },
  {
    id: 'cc-2',
    term: 'Taq DNA Polymerase',
    definition:
      'A thermostable DNA polymerase isolated from Thermus aquaticus, a bacterium that lives in hot springs. It remains active at 94\u00b0C, making it ideal for PCR without needing fresh enzyme after each cycle.',
    analogy:
      'A heat-resistant chef who can keep cooking in a boiling kitchen \u2014 while normal enzymes would denature, Taq keeps adding nucleotides to the growing DNA strand even at near-boiling temperatures.',
    xp: 30,
  },
  {
    id: 'cc-3',
    term: 'Annealing Temperature (Tm)',
    definition:
      'The temperature at which primers specifically bind to the complementary template DNA sequence. Typically 3\u20135\u00b0C below the primer melting temperature, usually 50\u201365\u00b0C.',
    analogy:
      'Like the perfect temperature for Velcro to stick \u2014 too hot, the strips won\'t cling; too cold, they stick everywhere, including to the wrong places. The right Tm ensures primers bind only to their exact target.',
    xp: 20,
  },
  {
    id: 'cc-4',
    term: 'Exponential Amplification',
    definition:
      'During PCR, each cycle doubles the number of target DNA molecules because newly synthesized strands serve as templates in the next cycle, producing 2\u207f molecules after n cycles.',
    analogy:
      'Like a chain reaction of photocopies \u2014 each new copy becomes the original for the next batch, turning a single sheet into over a billion copies in just 30 rounds.',
    xp: 25,
  },
  {
    id: 'cc-5',
    term: 'Gel Electrophoresis',
    definition:
      'A technique that separates DNA fragments by size using an electric field applied across an agarose gel. Smaller fragments migrate faster toward the positive electrode.',
    analogy:
      'A molecular race through a jelly obstacle course \u2014 the smallest runners (short DNA fragments) zip through the gaps easily, while larger ones get tangled and lag behind.',
    xp: 20,
  },
];

/* ============================
   Context Map
   ============================ */
export const DEMO_CONTEXT_MAP: ContextMap = {
  topic: 'DNA Extraction & PCR Workflow',
  nodes: [
    // Level 0 \u2014 Root
    { id: 'root', label: 'DNA Analysis', description: 'The complete workflow from sample to analysis', category: 'root', importance: 5 },
    // Level 1 \u2014 Branches
    { id: 'branch-extraction', label: 'DNA Extraction', description: 'Isolating pure DNA from biological samples', category: 'concept', importance: 5 },
    { id: 'branch-pcr', label: 'PCR Amplification', description: 'Exponential amplification of target DNA sequences', category: 'concept', importance: 5 },
    { id: 'branch-analysis', label: 'Analysis', description: 'Visualizing and interpreting amplified DNA', category: 'concept', importance: 4 },
    // Level 2 \u2014 Subtopics
    { id: 'sub-lysis', label: 'Cell Lysis', description: 'Breaking cell membranes with detergents', category: 'subtopic', importance: 4 },
    { id: 'sub-purification', label: 'Purification', description: 'Removing proteins and contaminants', category: 'subtopic', importance: 4 },
    { id: 'sub-precipitation', label: 'Precipitation', description: 'Using alcohol to pellet DNA', category: 'subtopic', importance: 3 },
    { id: 'sub-denaturation', label: 'Denaturation (94\u00b0C)', description: 'Separating double-stranded DNA into single strands', category: 'subtopic', importance: 4 },
    { id: 'sub-annealing', label: 'Annealing (50\u201365\u00b0C)', description: 'Primers bind to complementary sequences', category: 'subtopic', importance: 4 },
    { id: 'sub-extension', label: 'Extension (72\u00b0C)', description: 'Taq polymerase synthesizes new DNA strand', category: 'subtopic', importance: 4 },
    { id: 'sub-electrophoresis', label: 'Gel Electrophoresis', description: 'Size-based separation in agarose gel', category: 'subtopic', importance: 3 },
    { id: 'sub-qpcr', label: 'Quantitative PCR', description: 'Real-time fluorescence monitoring', category: 'subtopic', importance: 3 },
  ],
  edges: [
    { source: 'root', target: 'branch-extraction', label: 'step 1' },
    { source: 'root', target: 'branch-pcr', label: 'step 2' },
    { source: 'root', target: 'branch-analysis', label: 'step 3' },
    { source: 'branch-extraction', target: 'sub-lysis', label: 'involves' },
    { source: 'branch-extraction', target: 'sub-purification', label: 'involves' },
    { source: 'branch-extraction', target: 'sub-precipitation', label: 'final step' },
    { source: 'branch-pcr', target: 'sub-denaturation', label: 'cycle step 1' },
    { source: 'branch-pcr', target: 'sub-annealing', label: 'cycle step 2' },
    { source: 'branch-pcr', target: 'sub-extension', label: 'cycle step 3' },
    { source: 'branch-analysis', target: 'sub-electrophoresis', label: 'method' },
    { source: 'branch-analysis', target: 'sub-qpcr', label: 'advanced' },
  ],
};

/* ============================
   Scenario Sandbox (multi-step lab diagnostic)
   ============================ */
export const DEMO_SCENARIO: Scenario = {
  title: 'Forensic DNA Fingerprinting',
  context:
    'You are a forensic biologist at a crime lab. A DNA sample from the crime scene has yielded only 5 ng of extracted DNA \u2014 barely enough for conventional analysis. The suspect\'s alibi depends on excluding their DNA from the evidence. You must decide the amplification and analysis strategy to maximize discriminatory power while avoiding contamination.',
  options: [
    {
      id: 'sc-opt-a',
      text: 'Run a standard 25-cycle PCR targeting a single STR locus, then visualize on a 2% agarose gel.',
      isCorrect: false,
      explanation:
        'Single-locus STR analysis with gel visualization has low discriminatory power. You\'d need multiple loci for forensic identification (typically 13\u201320 CODIS loci). Gel electrophoresis also lacks the resolution to distinguish alleles differing by a single repeat unit at low template concentrations.',
    },
    {
      id: 'sc-opt-b',
      text: 'Perform multiplex PCR targeting 16 STR loci simultaneously using fluorescent primers, followed by capillary electrophoresis with internal size standards.',
      isCorrect: true,
      explanation:
        'Multiplex PCR with fluorescent detection is the gold-standard forensic workflow. It amplifies multiple loci in one reaction (saving precious template), while capillary electrophoresis provides single-base resolution. The combined random match probability across 16 loci is typically < 10\u207b\u00b9\u2078 \u2014 extremely powerful for individual identification.',
    },
    {
      id: 'sc-opt-c',
      text: 'Skip PCR entirely and sequence the entire genome using next-generation sequencing to get the most information.',
      isCorrect: false,
      explanation:
        'While NGS provides massive data, 5 ng is far below the input requirement for most library preparation protocols (typically 10\u2013100 ng). You\'d risk library failure and lose the evidentiary sample. PCR-based STR analysis is far more sensitive (can work with as little as 100 pg) and is the established legal standard.',
    },
  ],
};

/* ============================
   Diagnostic Questions (5 MCQs)
   ============================ */
export const DEMO_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'dq-1',
    question: 'Why must the PCR reaction mixture contain Mg\u00b2\u207a ions?',
    options: [
      'Mg\u00b2\u207a acts as a cofactor for Taq DNA polymerase activity',
      'Mg\u00b2\u207a helps primers anneal by neutralizing DNA backbone charge',
      'Mg\u00b2\u207a prevents non-specific amplification by stabilizing secondary structures',
      'Mg\u00b2\u207a chelates EDTA from the extraction buffer',
    ],
    correctIndex: 0,
    explanation:
      'Mg\u00b2\u207a is an essential cofactor for all DNA polymerases, including Taq. It binds to the enzyme\'s active site and facilitates proper dNTP positioning. Too little Mg\u00b2\u207a reduces polymerase activity; too much promotes misincorporation errors.',
    distractorsExplanation:
      'Mg\u00b2\u207a does help reduce charge repulsion (option B is partially true), but its primary role is enzymatic cofactor \u2014 option A is the most complete answer. It does not prevent non-specific amplification (that\'s annealing temperature), and it does not chelate EDTA.',
    difficulty: 'medium',
    topic: 'PCR Chemistry',
  },
  {
    id: 'dq-2',
    question: 'A student performs a PCR with primers that have a calculated Tm of 48\u00b0C. At what annealing temperature should the thermocycler be set?',
    options: [
      '48\u00b0C',
      '50\u00b0C',
      '43\u201345\u00b0C',
      '55\u00b0C',
    ],
    correctIndex: 2,
    explanation:
      'The standard rule is to set the annealing temperature 3\u20135\u00b0C below the lowest primer Tm. For a 48\u00b0C Tm, an annealing temperature of 43\u201345\u00b0C gives optimal specificity. Setting it at 48\u00b0C (option A) may result in weak amplification, and temperatures above the Tm (options B and D) would prevent stable primer binding.',
    distractorsExplanation:
      'A common mistake is setting the anneal exactly at Tm (option A), but some primer-template hybridization requires slightly lower temperatures for stability. Option C follows the standard "Tm minus 3\u20135\u00b0C" guideline.',
    difficulty: 'easy',
    topic: 'Primer Design',
  },
  {
    id: 'dq-3',
    question: 'During DNA extraction with the organic method, which two immiscible phases form after adding the phenol:chloroform:isoamyl alcohol mixture?',
    options: [
      'Upper aqueous phase (DNA) and lower organic phase (proteins/lipids)',
      'Upper organic phase (DNA) and lower aqueous phase (proteins)',
      'DNA partitions to the interphase, proteins remain in both phases',
      'Both phases contain equal amounts of DNA',
    ],
    correctIndex: 0,
    explanation:
      'Phenol:chloroform:isoamyl alcohol (25:24:1) denatures and extracts proteins into the organic (lower) phase while DNA remains in the upper aqueous phase. The isoamyl alcohol reduces foaming at the interphase. After centrifugation, the aqueous phase is carefully pipetted off for ethanol precipitation.',
    distractorsExplanation:
      'DNA is hydrophilic and partitions into the aqueous phase, not the organic phase. Option A correctly describes the phase separation in organic extraction.',
    difficulty: 'medium',
    topic: 'DNA Extraction',
  },
  {
    id: 'dq-4',
    question: 'In quantitative real-time PCR (qPCR), the Cq (or Ct) value is defined as:',
    options: [
      'The cycle number at which fluorescence first exceeds the background threshold',
      'The temperature at which 50% of the DNA is denatured',
      'The concentration of template required to produce a visible band on a gel',
      'The number of cycles needed to reach the plateau phase',
    ],
    correctIndex: 0,
    explanation:
      'The quantification cycle (Cq) is the cycle number where the fluorescent signal crosses the threshold line set above background. It is inversely proportional to the initial target quantity \u2014 lower Cq = more starting template. This allows accurate quantification across a wide dynamic range (typically 7\u20138 log\u2081\u2080 orders).',
    distractorsExplanation:
      'The Tm (not Cq) is the temperature at which 50% of DNA denatures (option B). Option D describes the plateau but is not how Cq is defined.',
    difficulty: 'hard',
    topic: 'qPCR',
  },
  {
    id: 'dq-5',
    question: 'You see a smear instead of a distinct band when running your PCR product on an agarose gel. Which of the following is the MOST likely cause?',
    options: [
      'The annealing temperature was too high, preventing primer binding',
      'Non-specific amplification due to low annealing temperature or excess template',
      'The extension time was too short for the amplicon length',
      'Too few PCR cycles were performed',
    ],
    correctIndex: 1,
    explanation:
      'A smeared PCR product typically results from non-specific amplification \u2014 the polymerase amplifying multiple off-target sequences. Common causes: annealing temperature too low, too much template DNA, excessive Mg\u00b2\u207a, or degraded primers. Raising the annealing temperature in 2\u00b0C increments (touchdown PCR) often resolves smearing.',
    distractorsExplanation:
      'A high annealing temperature (option A) would produce weak or no product, not a smear. Short extension time (option C) and too few cycles (option D) would reduce yield but not necessarily cause smearing.',
    difficulty: 'hard',
    topic: 'PCR Troubleshooting',
  },
];

/* ============================
   Mastery Progress
   ============================ */
export const DEMO_MASTERY_PROGRESS: MasteryProgress = {
  totalXp: 210,
  level: 2,
  streak: 3,
  conceptsMastered: 12,
  quizzesPassed: 4,
};

/* ============================
   Leaderboard (CoWorking Arena)
   ============================ */
export interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  xp: number;
  streak: number;
  isOnline: boolean;
}

export const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Dr. Chen', initials: 'DC', xp: 4850, streak: 12, isOnline: false },
  { rank: 2, name: 'Maya Patel', initials: 'MP', xp: 3200, streak: 7, isOnline: true },
  { rank: 3, name: 'Alex Kim', initials: 'AK', xp: 2890, streak: 5, isOnline: true },
  { rank: 4, name: 'You', initials: 'YU', xp: 2100, streak: 3, isOnline: true },
  { rank: 5, name: 'Sam Rivera', initials: 'SR', xp: 1750, streak: 2, isOnline: false },
];

/* ============================
   Full DashboardData object
   ============================ */
export const DEMO_DASHBOARD_DATA: DashboardData = {
  moduleTitle: 'DNA Extraction & Polymerase Chain Reaction (PCR)',
  moduleSynthesis: DEMO_MODULE_SYNTHESIS,
  coreConcepts: DEMO_CORE_CONCEPTS,
  contextMap: DEMO_CONTEXT_MAP,
  scenario: DEMO_SCENARIO,
  diagnosticQuestions: DEMO_DIAGNOSTIC_QUESTIONS,
  masteryProgress: DEMO_MASTERY_PROGRESS,
};

/* ============================
   Den Tool \u2014 Recall Flashcards (10 cards)
   ============================ */
export const DEMO_RECALL_CARDS_DATA: RecallCardsData = {
  cards: [
    { front: 'What is the function of SDS in DNA extraction?', back: 'SDS (sodium dodecyl sulfate) is an anionic detergent that disrupts cell membranes by solubilizing phospholipids and denaturing proteins.', hint: 'Think about soap...' },
    { front: 'What does "Tm" stand for in PCR primer design?', back: 'Melting Temperature \u2014 the temperature at which 50% of the DNA duplex dissociates into single strands.', hint: 'Thermal...' },
    { front: 'What is the optimal extension temperature for Taq polymerase?', back: '72\u00b0C \u2014 Taq polymerase has maximum activity at this temperature, adding ~1,000 nucleotides per minute.', hint: 'Close to the optimal enzyme activity temperature.' },
    { front: 'Why is a "no-template control" (NTC) important in PCR?', back: 'An NTC detects contamination of master mix components with template DNA. If amplification occurs in the NTC, all results are invalid.', hint: 'It\'s a negative control...' },
    { front: 'What is the purpose of the initial 94\u00b0C hold (2\u20135 min) in PCR?', back: 'It ensures complete denaturation of genomic DNA and activation of hot-start Taq polymerase.', hint: 'Before the cycling begins...' },
    { front: 'How does ethanol precipitate DNA?', back: 'Ethanol dehydrates the DNA molecule and reduces the dielectric constant of the solution, allowing Na\u207a ions to neutralize the phosphate backbone and cause DNA to aggregate and precipitate.', hint: 'It\'s about solubility and charge.' },
    { front: 'What does "multiplex PCR" mean?', back: 'Multiplex PCR simultaneously amplifies multiple target sequences in a single reaction tube using multiple primer pairs.', hint: 'Multiple targets, one tube.' },
    { front: 'What is the function of DNA polymerase I in E. coli?', back: 'DNA polymerase I fills in gaps (nick translation) during DNA replication and removes RNA primers via its 5\u2032\u21923\u2032 exonuclease activity.', hint: 'It has both polymerase and exonuclease functions.' },
    { front: 'What is a "primer-dimer"?', back: 'A primer-dimer is a non-specific amplification product formed when primers hybridize to each other due to complementary 3\u2032 ends, creating a short, unwanted amplicon that competes with the target.', hint: 'Primers sticking to each other...' },
    { front: 'What is the key advantage of "hot-start" Taq polymerase?', back: 'Hot-start Taq is chemically modified or antibody-bound to remain inactive at low temperatures, preventing non-specific amplification during reaction setup and the initial heating ramp.', hint: 'Prevents early activity...' },
  ],
};

/* ============================
   Den Tool \u2014 Mind Map
   ============================ */
export const DEMO_MIND_MAP_DATA: MindMapData = {
  centralTopic: 'DNA Technology',
  branches: [
    {
      label: 'Extraction Methods',
      children: ['Organic (Phenol-Chloroform)', 'Silica Column-Based', 'Magnetic Bead', 'Chelex Resin', 'Salting Out'],
    },
    {
      label: 'PCR Variants',
      children: ['Standard PCR', 'Real-Time (qPCR)', 'Reverse-Transcriptase (RT-PCR)', 'Nested PCR', 'Touchdown PCR'],
    },
    {
      label: 'Applications',
      children: ['Forensic DNA Fingerprinting', 'Medical Diagnostics', 'Cloning & Sequencing', 'Environmental Metagenomics', 'Ancestry & Genealogy'],
    },
    {
      label: 'Quality Control',
      children: ['Gel Electrophoresis', 'Spectrophotometry (260/280)', 'Fluorometric Quantification', 'Bioanalyzer (Fragment Analysis)'],
    },
  ],
};

/* ============================
   Den Tool \u2014 Audio Overview Transcript
   ============================ */
export const DEMO_AUDIO_OVERVIEW_DATA: AudioOverviewData = {
  script:
    'Welcome to your audio overview of DNA Extraction and PCR. We\'ll walk through the essential techniques that form the backbone of modern molecular biology, from isolating DNA to amplifying it millions of times over.',
  segments: [
    {
      heading: 'What is DNA Extraction?',
      text: 'DNA extraction is the process of releasing DNA from cells and purifying it away from proteins, lipids, and other cellular components. The fundamental steps include cell lysis using detergents like SDS, protein digestion with proteinase K, organic extraction or column purification, and finally alcohol precipitation to pellet the pure DNA.',
    },
    {
      heading: 'The Chemistry of Lysis',
      text: 'The lysis buffer contains SDS detergent which disrupts the lipid bilayer of cell membranes. Proteinase K, a serine protease, digests histone proteins that DNA is tightly wound around. EDTA is often added to chelate Mg\u00b2\u207a ions, which inhibits DNases that would otherwise degrade your DNA.',
    },
    {
      heading: 'Purification Techniques',
      text: 'The classic organic method uses a phenol-chloroform-isoamyl alcohol mixture. After centrifugation, DNA remains in the upper aqueous phase while denatured proteins partition into the lower organic phase. Modern silica column methods bind DNA to a silica membrane in high-salt conditions, then elute it in low-salt buffer or water.',
    },
    {
      heading: 'PCR: The Copy Machine for DNA',
      text: 'PCR uses a thermostable DNA polymerase called Taq, isolated from Thermus aquaticus, a bacterium that lives in Yellowstone\'s hot springs. Each cycle has three temperature steps: 94\u00b0C to denature the double helix, 50\u201365\u00b0C for primers to anneal, and 72\u00b0C for Taq to extend new strands.',
    },
    {
      heading: 'Primer Design Rules',
      text: 'Good primers are 18 to 24 nucleotides long with a GC content between 40 and 60 percent. The melting temperatures of both primers should be within 2\u00b0C of each other. Avoid runs of four or more identical bases at the 3\' end, as these promote non-specific binding and primer-dimer formation.',
    },
    {
      heading: 'Real-Time PCR and Quantification',
      text: 'Quantitative PCR adds a fluorescent reporter \u2014 either SYBR Green dye that binds double-stranded DNA, or sequence-specific probes like TaqMan. A threshold cycle or Cq value is recorded when fluorescence crosses background, and this value is inversely proportional to the starting template quantity.',
    },
    {
      heading: 'Troubleshooting Common Problems',
      text: 'If you see no product, check your primers, template quality, and annealing temperature. A smear usually means non-specific amplification from low annealing temperature or excess template. Multiple bands suggest primer-dimer or genomic DNA contamination if no reverse transcriptase step was included.',
    },
  ],
};

/* ============================
   Den Tool \u2014 Presentation (5 slides)
   ============================ */
export const DEMO_PRESENTATION_DATA: PresentationData = {
  slides: [
    {
      title: 'DNA Extraction & PCR: An Overview',
      content:
        'A comprehensive introduction to the fundamental molecular biology techniques of DNA extraction and polymerase chain reaction, from basic principles to advanced applications.',
      bulletPoints: [
        'DNA extraction isolates pure genomic or plasmid DNA from cells',
        'PCR enables exponential amplification of specific DNA sequences',
        'Together they form the foundation of almost all molecular biology workflows',
        'Applications range from forensics to clinical diagnostics to research',
      ],
    },
    {
      title: 'Step 1: Cell Lysis',
      content:
        'The first and most critical step in DNA extraction \u2014 breaking open cells to release their contents while protecting DNA from degradation.',
      bulletPoints: [
        'SDS detergent solubilizes cell and nuclear membranes',
        'Proteinase K digests histones and other DNA-binding proteins',
        'EDTA chelates Mg\u00b2\u207a to inhibit DNase activity',
        'Incubation at 56\u00b0C optimizes proteinase K activity',
      ],
    },
    {
      title: 'Step 2: Purification & Precipitation',
      content:
        'Separating DNA from proteins, RNA, and other contaminants, then concentrating it for downstream applications.',
      bulletPoints: [
        'Organic extraction: phenol:chloroform partitions proteins away',
        'Silica columns: DNA binds to silica in high-salt, elutes in low-salt',
        'Ethanol/isopropanol precipitation with salt (Na\u207a or NH\u2084\u207a) pellets DNA',
        'Wash with 70% ethanol removes residual salts and organic solvents',
      ],
    },
    {
      title: 'PCR: The Three-Step Cycle',
      content:
        'Understanding the thermal cycling steps that drive exponential DNA amplification.',
      bulletPoints: [
        'Denaturation (94\u00b0C, 15\u201330s): Hydrogen bonds break, strands separate',
        'Annealing (50\u201365\u00b0C, 15\u201330s): Primers bind complementary template sequences',
        'Extension (72\u00b0C, 30s\u20131min/kb): Taq polymerase adds dNTPs from 3\' end',
        '25\u201335 cycles yield ~10\u2079-fold amplification of the target region',
      ],
    },
    {
      title: 'Analysis & Applications',
      content:
        'How amplified DNA is visualized and the real-world impact of these techniques.',
      bulletPoints: [
        'Gel electrophoresis separates PCR products by size for visualization',
        'qPCR monitors amplification in real-time for quantification',
        'Forensic STR typing uses multiplex PCR at 16+ loci for identification',
        'PCR-based diagnostics detect pathogens from SARS-CoV-2 to antibiotic resistance genes',
      ],
    },
  ],
};

/* ============================
   Den Tool \u2014 Visual Breakdown Infographic Stats
   ============================ */
export const DEMO_VISUAL_BREAKDOWN_DATA: VisualBreakdownData = {
  title: 'DNA Extraction & PCR at a Glance',
  sections: [
    {
      heading: 'Key Components',
      icon: '\ud83e\uddec',
      items: [
        'DNA Template \u2014 1\u2013100 ng per reaction',
        'Primers \u2014 0.1\u20131 \u00b5M each, 18\u201324 nt',
        'dNTPs \u2014 200 \u00b5M each',
        'Taq Polymerase \u2014 1\u20132.5 U per 50 \u00b5L reaction',
        'MgCl\u2082 \u2014 1.5\u20134 mM optimal concentration',
        'Buffer \u2014 10\u00d7 concentration, Tris-based pH 8.3',
      ],
      color: '#a855f7',
    },
    {
      heading: 'PCR Cycle Parameters',
      icon: '\ud83c\udf21\ufe0f',
      items: [
        'Initial Denaturation: 94\u00b0C, 2\u20135 min',
        'Denaturation: 94\u00b0C, 15\u201330 s',
        'Annealing: 50\u201365\u00b0C, 15\u201330 s (Tm \u2212 5\u00b0C)',
        'Extension: 72\u00b0C, 30 s \u2013 1 min per kb',
        'Final Extension: 72\u00b0C, 5\u201310 min',
        'Hold: 4\u00b0C indefinitely',
      ],
      color: '#00f0ff',
    },
    {
      heading: 'DNA Quality Metrics',
      icon: '\ud83d\udcca',
      items: [
        'A\u2082\u2086\u2080/A\u2082\u2088\u2080 Ratio: 1.8\u20132.0 = pure DNA',
        'A\u2082\u2086\u2080/A\u2082\u2083\u2080 Ratio: 2.0\u20132.2 = no organic contaminants',
        'Concentration (ng/\u00b5L) = A\u2082\u2086\u2080 \u00d7 50 \u00d7 dilution factor',
        'Integrity: High MW band > 20 kb on gel = intact genomic DNA',
      ],
      color: '#22c55e',
    },
    {
      heading: 'Common Troubleshooting',
      icon: '\ud83d\udd27',
      items: [
        'No product \u2192 bad primers, degraded template, or inhibitor carryover',
        'Smear \u2192 excess template, low anneal temp, or too many cycles',
        'Multiple bands \u2192 non-specific priming or genomic DNA contamination',
        'Primer-dimer \u2192 complementary 3\' ends or excess primers',
        'Weak bands \u2192 insufficient cycles or suboptimal Mg\u00b2\u207a concentration',
      ],
      color: '#f59e0b',
    },
  ],
};

/* ============================
   Den Tool \u2014 Study Report (Q&A + Glossary)
   ============================ */
export const DEMO_STUDY_REPORT_DATA: StudyReportData = {
  objectiveQuestions: [
    {
      question: 'Which enzyme is responsible for synthesizing new DNA strands during PCR?',
      options: ['DNA ligase', 'Taq DNA polymerase', 'Reverse transcriptase', 'RNA polymerase'],
      correctIndex: 1,
    },
    {
      question: 'What is the primary purpose of the annealing step in PCR?',
      options: ['Denature double-stranded DNA', 'Allow primers to bind template DNA', 'Synthesize new DNA strands', 'Remove primers from the reaction'],
      correctIndex: 1,
    },
    {
      question: 'Which substance is used to precipitate DNA after extraction?',
      options: ['SDS', 'Ethanol or isopropanol', 'Phenol', 'Agarose'],
      correctIndex: 1,
    },
    {
      question: 'What does the Cq value represent in qPCR?',
      options: ['The cycle at which amplification plateaus', 'The cycle where fluorescence exceeds background threshold', 'The melting temperature of the amplicon', 'The concentration of template in ng/\u00b5L'],
      correctIndex: 1,
    },
  ],
  subjectiveQuestions: [
    {
      question: 'Explain why Taq polymerase is used in PCR instead of E. coli DNA polymerase I. Include the key property that makes it suitable.',
      sampleAnswer:
        'Taq polymerase is isolated from Thermus aquaticus, a thermophilic bacterium that lives in hot springs. Unlike E. coli DNA polymerase I, Taq is thermostable and remains active at the 94\u00b0C denaturation temperature used in PCR cycling. This eliminates the need to add fresh enzyme after each cycle, allowing the reaction to be automated in a thermocycler.',
    },
    {
      question: 'Describe the principle behind gel electrophoresis and explain how it separates DNA fragments.',
      sampleAnswer:
        'Gel electrophoresis separates DNA fragments based on size by applying an electric field across an agarose gel submerged in buffer. DNA is negatively charged due to its phosphate backbone and migrates toward the positive electrode. Smaller fragments navigate through the gel matrix more easily and travel farther than larger ones. Fragment sizes are determined by comparison with a DNA ladder (size standard) run alongside the samples.',
    },
    {
      question: 'A colleague\'s PCR consistently produces no bands. List three potential causes and suggest how to troubleshoot each one.',
      sampleAnswer:
        '1) Degraded template: check DNA integrity on a gel or re-extract. 2) Inhibitors in the template: dilute the template 1:10 and 1:100, or re-purify using a cleanup column. 3) Incorrect annealing temperature: calculate primer Tm correctly and set anneal 3\u20135\u00b0C lower. Also verify the thermocycler is calibrated and the master mix hasn\'t expired.',
    },
  ],
  glossary: [
    { term: 'Annealing', definition: 'The step in PCR where primers bind to complementary sequences on the single-stranded template DNA, typically at 50\u201365\u00b0C.' },
    { term: 'Cq (Quantification Cycle)', definition: 'The PCR cycle number at which fluorescence from amplified DNA crosses the threshold, used for quantification in qPCR.' },
    { term: 'Denaturation', definition: 'The separation of double-stranded DNA into two single strands by breaking hydrogen bonds, achieved by heating to ~94\u00b0C.' },
    { term: 'dNTPs', definition: 'Deoxynucleotide triphosphates (dATP, dCTP, dGTP, dTTP) \u2014 the building blocks used by DNA polymerase to synthesize new DNA strands.' },
    { term: 'Extension', definition: 'The phase of PCR where Taq polymerase adds dNTPs to the 3\' end of the primer, synthesizing a complementary DNA strand at 72\u00b0C.' },
    { term: 'Gel Electrophoresis', definition: 'A technique that separates DNA fragments by size using an electric current through an agarose gel matrix.' },
    { term: 'Hot-Start PCR', definition: 'A PCR variant using chemically modified or antibody-bound Taq polymerase that activates only after the initial high-temperature step, reducing non-specific amplification.' },
    { term: 'Multiplex PCR', definition: 'A PCR technique that amplifies multiple target sequences simultaneously in a single reaction by including several primer pairs.' },
    { term: 'Primer-Dimer', definition: 'Non-specific PCR artifact formed when primers hybridize to each other due to complementary 3\' ends, producing a short unwanted amplicon that competes with the target.' },
    { term: 'Thermostable', definition: 'A property of enzymes (like Taq polymerase) that remain functional at high temperatures, typically above 90\u00b0C.' },
  ],
};

/* ============================
   Den Tool cache map \u2014 keyed by tool key
   Populated into localStorage by loadDemoData() so useDenTool
   serves the mock content without any API call.
   ============================ */
export const DEMO_DEN_TOOL_DATA: Record<string, unknown> = {
  audio: DEMO_AUDIO_OVERVIEW_DATA,
  mindmap: DEMO_MIND_MAP_DATA,
  presentation: DEMO_PRESENTATION_DATA,
  recall: DEMO_RECALL_CARDS_DATA,
  visual: DEMO_VISUAL_BREAKDOWN_DATA,
  report: DEMO_STUDY_REPORT_DATA,
};