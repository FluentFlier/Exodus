/**
 * Real NSF CAREER Award mock data for preview purposes
 * Source: NSF Program Solicitation 24-585
 */

export const CURATED_GRANTS = [
  {
    id: '8bcd9f38-9a3d-4d38-b1f1-6ef58a4b7c01',
    title: 'NSF CAREER: Faculty Early Career Development Program',
    description:
      'Supports early-career faculty who integrate research and education and show potential for academic leadership.',
    funder: 'National Science Foundation',
    deadline: '2026-07-22T17:00:00Z',
    deadline_display: 'July 22, 2026 (annual, fourth Wednesday in July)',
    amount_min: 400000,
    amount_max: 800000,
    eligibility_text:
      'Untenured tenure-track assistant professor at a U.S. institution; one proposal per PI per annual competition; no co-PIs.',
    eligibility: 'Eligible: tenure-track assistant professor',
    effort: 'High',
    collaborator_match_count: 4,
    requirements: [
      { label: 'Tenure-track assistant professor (U.S. institution)', status: 'yes' },
      { label: 'One proposal per PI per annual competition', status: 'yes' },
      { label: 'Co-PIs permitted', status: 'no' },
      { label: 'Integrated research + education plan', status: 'yes' },
    ],
    tags: ['early-career', 'NSF', 'STEM', 'education'],
    categories: ['faculty', 'research'],
    eligibility_json: {
      eligibility: 'Eligible: tenure-track assistant professor',
      effort: 'High',
      collaborator_match_count: 4,
      requirements: [
        { label: 'Tenure-track assistant professor (U.S. institution)', status: 'yes' },
        { label: 'One proposal per PI per annual competition', status: 'yes' },
        { label: 'Co-PIs permitted', status: 'no' },
        { label: 'Integrated research + education plan', status: 'yes' },
      ],
    },
    source_url: 'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=503214',
    source_name: 'Curated',
    source_identifier: 'nsf-career',
  },
  {
    id: '3f7d2d9b-6f24-4a84-9b0e-3b6a62cfe6b6',
    title: 'DOE Office of Science Early Career Research Program',
    description:
      'Supports outstanding early-career scientists at U.S. universities, national labs, and user facilities for five years.',
    funder: 'U.S. Department of Energy Office of Science',
    deadline: null,
    deadline_display: 'Annual: pre-app Feb, full Apr (check current FOA)',
    amount_min: 875000,
    amount_max: 2750000,
    eligibility_text:
      'Untenured, tenure-track assistant or associate professor within 10 years of PhD, or eligible national lab staff. U.S. institutions only.',
    eligibility: 'Eligible: early-career faculty or lab staff',
    effort: 'High',
    collaborator_match_count: 3,
    requirements: [
      { label: 'Within 10 years of PhD', status: 'yes' },
      { label: 'U.S. university or DOE lab/user facility', status: 'yes' },
      { label: 'Pre-application required', status: 'yes' },
      { label: 'Topic aligns with Office of Science programs', status: 'yes' },
    ],
    tags: ['early-career', 'DOE', 'energy', 'physical sciences'],
    categories: ['faculty', 'lab', 'research'],
    eligibility_json: {
      eligibility: 'Eligible: early-career faculty or lab staff',
      effort: 'High',
      collaborator_match_count: 3,
      requirements: [
        { label: 'Within 10 years of PhD', status: 'yes' },
        { label: 'U.S. university or DOE lab/user facility', status: 'yes' },
        { label: 'Pre-application required', status: 'yes' },
        { label: 'Topic aligns with Office of Science programs', status: 'yes' },
      ],
    },
    source_url: 'https://science.osti.gov/early-career',
    source_name: 'Curated',
    source_identifier: 'doe-early-career',
  },
  {
    id: 'c2c0b2db-5518-4b42-bb10-0c5831b6e0b4',
    title: 'NIH Pathway to Independence (K99/R00) - Parent',
    description:
      'Supports postdoctoral researchers transitioning to independent faculty positions with a mentored K99 phase and independent R00 phase.',
    funder: 'National Institutes of Health',
    deadline: '2026-02-12T17:00:00Z',
    deadline_display: 'Standard due dates: Feb 12 / Jun 12 / Oct 12',
    amount_min: 150000,
    amount_max: 249000,
    eligibility_text:
      'Postdoctoral researchers in mentored positions with no more than 4 years of postdoc experience; independent clinical trials as lead not allowed.',
    eligibility: 'Eligible: postdoc <=4 years',
    effort: 'High',
    collaborator_match_count: 2,
    requirements: [
      { label: 'Mentored postdoc position', status: 'yes' },
      { label: '<=4 years postdoc experience', status: 'yes' },
      { label: 'Independent clinical trial as lead', status: 'no' },
      { label: 'Plan to transition to tenure-track', status: 'yes' },
    ],
    tags: ['postdoc', 'career transition', 'NIH'],
    categories: ['postdoc', 'career development'],
    eligibility_json: {
      eligibility: 'Eligible: postdoc <=4 years',
      effort: 'High',
      collaborator_match_count: 2,
      requirements: [
        { label: 'Mentored postdoc position', status: 'yes' },
        { label: '<=4 years postdoc experience', status: 'yes' },
        { label: 'Independent clinical trial as lead', status: 'no' },
        { label: 'Plan to transition to tenure-track', status: 'yes' },
      ],
    },
    source_url: 'https://grants.nih.gov/grants/guide/pa-files/PA-24-194.html',
    source_name: 'Curated',
    source_identifier: 'nih-k99-r00',
  },
  {
    id: '5d6c3e6c-2a08-4f1c-9f63-7e6f0f5b6d5c',
    title: 'NIH F32 Postdoctoral NRSA Fellowship - Parent',
    description:
      'Provides postdoctoral research training to broaden scientific background and extend potential for research careers.',
    funder: 'National Institutes of Health',
    deadline: '2026-04-08T17:00:00Z',
    deadline_display: 'Standard due dates: Apr 8 / Aug 8 / Dec 8',
    amount_min: null,
    amount_max: null,
    amount_display: 'NRSA stipend + institutional allowance',
    eligibility_text:
      'U.S. citizen or permanent resident in a postdoctoral training position; research or clinical doctoral degree required.',
    eligibility: 'Eligible: postdoc (U.S. citizen/PR)',
    effort: 'Medium',
    collaborator_match_count: 2,
    requirements: [
      { label: 'U.S. citizen or permanent resident', status: 'yes' },
      { label: 'Postdoctoral training position', status: 'yes' },
      { label: 'At least 3 reference letters', status: 'yes' },
      { label: 'Independent clinical trial as lead', status: 'no' },
    ],
    tags: ['postdoc', 'training', 'NIH'],
    categories: ['postdoc', 'fellowship'],
    eligibility_json: {
      eligibility: 'Eligible: postdoc (U.S. citizen/PR)',
      effort: 'Medium',
      collaborator_match_count: 2,
      requirements: [
        { label: 'U.S. citizen or permanent resident', status: 'yes' },
        { label: 'Postdoctoral training position', status: 'yes' },
        { label: 'At least 3 reference letters', status: 'yes' },
        { label: 'Independent clinical trial as lead', status: 'no' },
      ],
    },
    source_url: 'https://researchtraining.nih.gov/programs/fellowships/F32',
    source_name: 'Curated',
    source_identifier: 'nih-f32',
  },
  {
    id: 'bca3c6a4-0a7a-4e2b-9c80-0f8a3b3f77d2',
    title: 'NIH Research Project Grant (Parent R01)',
    description:
      'Supports discrete research projects aligned with NIH Institute and Center missions; clinical trials not allowed under this parent.',
    funder: 'National Institutes of Health',
    deadline: '2026-02-05T17:00:00Z',
    deadline_display: 'Standard due dates: Feb 5 / Jun 5 / Oct 5',
    amount_min: null,
    amount_max: null,
    amount_display: 'Project-need based (up to 5 years)',
    eligibility_text:
      'Independent investigators at eligible organizations; foreign organizations are eligible for this parent.',
    eligibility: 'Eligible: independent investigator',
    effort: 'High',
    collaborator_match_count: 5,
    requirements: [
      { label: 'Independent investigator', status: 'yes' },
      { label: 'Clinical trials as lead', status: 'no' },
      { label: 'Project period up to 5 years', status: 'yes' },
      { label: 'IC mission alignment', status: 'yes' },
    ],
    tags: ['research', 'NIH', 'R01'],
    categories: ['faculty', 'research'],
    eligibility_json: {
      eligibility: 'Eligible: independent investigator',
      effort: 'High',
      collaborator_match_count: 5,
      requirements: [
        { label: 'Independent investigator', status: 'yes' },
        { label: 'Clinical trials as lead', status: 'no' },
        { label: 'Project period up to 5 years', status: 'yes' },
        { label: 'IC mission alignment', status: 'yes' },
      ],
    },
    source_url: 'https://grants.nih.gov/grants/guide/pa-files/PA-25-301.html',
    source_name: 'Curated',
    source_identifier: 'nih-r01-parent',
  },
  {
    id: '46b7a06c-5152-4a58-9d2d-64b8b7c6e5f4',
    title: 'NIH F31 Predoctoral NRSA Fellowship - Parent',
    description:
      'Provides predoctoral students with supervised research training leading toward a research doctorate (e.g., PhD).',
    funder: 'National Institutes of Health',
    deadline: '2026-04-08T17:00:00Z',
    deadline_display: 'Standard due dates: Apr 8 / Aug 8 / Dec 8',
    amount_min: null,
    amount_max: null,
    amount_display: 'NRSA stipend + institutional allowance',
    eligibility_text:
      'U.S. citizen or permanent resident enrolled in a research doctoral degree program; dissertation research required.',
    eligibility: 'Eligible: predoctoral (U.S. citizen/PR)',
    effort: 'Medium',
    collaborator_match_count: 3,
    requirements: [
      { label: 'U.S. citizen or permanent resident', status: 'yes' },
      { label: 'Enrolled in research doctoral program', status: 'yes' },
      { label: 'Dissertation research proposal', status: 'yes' },
      { label: 'At least 3 reference letters', status: 'yes' },
    ],
    tags: ['predoctoral', 'training', 'NIH'],
    categories: ['graduate', 'fellowship'],
    eligibility_json: {
      eligibility: 'Eligible: predoctoral (U.S. citizen/PR)',
      effort: 'Medium',
      collaborator_match_count: 3,
      requirements: [
        { label: 'U.S. citizen or permanent resident', status: 'yes' },
        { label: 'Enrolled in research doctoral program', status: 'yes' },
        { label: 'Dissertation research proposal', status: 'yes' },
        { label: 'At least 3 reference letters', status: 'yes' },
      ],
    },
    source_url: 'https://researchtraining.nih.gov/programs/fellowships/F31',
    source_name: 'Curated',
    source_identifier: 'nih-f31',
  },
  {
    id: 'bc7f85b6-9f1f-4b2f-8b03-5c2b0edc8cc2',
    title: 'NIH Research Scientist Development Award (K01) - Parent',
    description:
      'Provides protected time and supervised career development for early-career researchers transitioning to independence.',
    funder: 'National Institutes of Health',
    deadline: '2026-02-12T17:00:00Z',
    deadline_display: 'Standard due dates: Feb 12 / Jun 12 / Oct 12',
    amount_min: null,
    amount_max: null,
    amount_display: 'Varies by Institute (salary + research support)',
    eligibility_text:
      'U.S. citizen or permanent resident with research or clinical doctoral degree; early-career or postdoctoral stage.',
    eligibility: 'Eligible: early-career or postdoc (U.S. citizen/PR)',
    effort: 'High',
    collaborator_match_count: 2,
    requirements: [
      { label: 'U.S. citizen or permanent resident', status: 'yes' },
      { label: 'Research or clinical doctoral degree', status: 'yes' },
      { label: 'Mentored career development plan', status: 'yes' },
      { label: 'Protected research time', status: 'yes' },
    ],
    tags: ['career development', 'NIH', 'training'],
    categories: ['postdoc', 'career development'],
    eligibility_json: {
      eligibility: 'Eligible: early-career or postdoc (U.S. citizen/PR)',
      effort: 'High',
      collaborator_match_count: 2,
      requirements: [
        { label: 'U.S. citizen or permanent resident', status: 'yes' },
        { label: 'Research or clinical doctoral degree', status: 'yes' },
        { label: 'Mentored career development plan', status: 'yes' },
        { label: 'Protected research time', status: 'yes' },
      ],
    },
    source_url: 'https://researchtraining.nih.gov/programs/career-development/K01',
    source_name: 'Curated',
    source_identifier: 'nih-k01',
  },
  {
    id: '7d5b1aa1-6f0b-4c5f-8e38-2c1a9b6eaa0d',
    title: 'NSF Graduate Research Fellowship Program (GRFP)',
    description:
      'Supports outstanding graduate students in STEM fields, including STEM education, pursuing research-based masters or doctoral degrees.',
    funder: 'National Science Foundation',
    deadline: '2026-10-20T17:00:00Z',
    deadline_display: 'Annual: late Oct (field-specific deadlines)',
    amount_min: 37000,
    amount_max: 37000,
    amount_display: '$37,000 stipend + $16,000 cost of education',
    eligibility_text:
      'U.S. citizens, nationals, or permanent residents in eligible STEM graduate programs with limited prior graduate study.',
    eligibility: 'Eligible: graduate students (U.S. citizen/PR)',
    effort: 'Medium',
    collaborator_match_count: 4,
    requirements: [
      { label: 'U.S. citizen or permanent resident', status: 'yes' },
      { label: 'Enrolled in STEM graduate program', status: 'yes' },
      { label: 'Research-based MS/PhD track', status: 'yes' },
      { label: 'One application per annual competition', status: 'yes' },
    ],
    tags: ['graduate', 'NSF', 'fellowship', 'STEM'],
    categories: ['graduate', 'fellowship'],
    eligibility_json: {
      eligibility: 'Eligible: graduate students (U.S. citizen/PR)',
      effort: 'Medium',
      collaborator_match_count: 4,
      requirements: [
        { label: 'U.S. citizen or permanent resident', status: 'yes' },
        { label: 'Enrolled in STEM graduate program', status: 'yes' },
        { label: 'Research-based MS/PhD track', status: 'yes' },
        { label: 'One application per annual competition', status: 'yes' },
      ],
    },
    source_url: 'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=6201',
    source_name: 'Curated',
    source_identifier: 'nsf-grfp',
  },
];

export const NSF_CAREER_GRANT = {
  title: 'NSF CAREER: Faculty Early Career Development Program',
  funder: 'National Science Foundation',
  program_code: 'NSF 24-585',
  deadline: '2026-07-26T17:00:00Z',
  amount_range: '$400,000 - $600,000',
  duration: '5 years',

  overview: `The Faculty Early Career Development (CAREER) Program is a Foundation-wide activity that offers the National Science Foundation's most prestigious awards in support of early-career faculty who have the potential to serve as academic role models in research and education and to lead advances in the mission of their department or organization.`,

  eligibility: {
    required: [
      'Must have earned a doctoral degree or will have completed the degree by July 1, 2026',
      'Must be employed in a tenure-track (or equivalent) position as an assistant professor',
      'Must have not previously received a CAREER award',
      'Must be affiliated with a US institution eligible for NSF support',
      'Must not have more than 4 years in a tenure-track position at submission deadline',
    ],

    ineligible: [
      'Individuals in non-tenure-track positions',
      'Associate professors or full professors',
      'Previous CAREER award recipients',
      'Researchers at non-US institutions',
    ],
  },

  requirements: {
    proposal_sections: [
      {
        section: 'Project Summary',
        page_limit: 1,
        required: true,
        description: 'Must contain separate overview, intellectual merit, and broader impacts statements',
      },
      {
        section: 'Project Description',
        page_limit: 15,
        required: true,
        description: 'Must integrate research and education activities, describe career development plan',
      },
      {
        section: 'Education Plan',
        page_limit: 'Included in 15-page limit',
        required: true,
        description: 'Must be integrated with research plan, not an add-on',
      },
      {
        section: 'References Cited',
        page_limit: 'No limit',
        required: true,
        description: 'All cited references must be listed',
      },
      {
        section: 'Biographical Sketch',
        page_limit: 3,
        required: true,
        description: 'NSF format required, including synergistic activities',
      },
      {
        section: 'Budget and Budget Justification',
        page_limit: 'No limit',
        required: true,
        description: 'Must include summer salary, no overhead on first $25K of participant support',
      },
      {
        section: 'Current and Pending Support',
        page_limit: 'No limit',
        required: true,
        description: 'Must list all current and pending support for PI',
      },
      {
        section: 'Facilities, Equipment and Other Resources',
        page_limit: 'No limit',
        required: true,
        description: 'Describe available resources and institutional support',
      },
    ],

    formatting: [
      'Text must be in 11-point or larger font',
      'Times Roman, Palatino, Computer Modern, or similar font required',
      'No more than 6 lines of text per inch',
      'Margins must be at least 1 inch on all sides',
      'PDF format required for all documents',
    ],

    key_elements: [
      'Integration of research and education must be evident throughout',
      'Must demonstrate potential to be an academic role model',
      'Must show institutional commitment and support',
      'Must include education activities beyond teaching existing courses',
      'Must address both intellectual merit and broader impacts',
    ],
  },

  review_criteria: {
    intellectual_merit: {
      weight: 'Primary',
      considerations: [
        'How important is the proposed activity to advancing knowledge?',
        'To what extent do the proposed activities suggest original research?',
        'How well qualified is the proposer to conduct the project?',
        'To what extent does the plan contribute to development as an academic role model?',
        'How well conceived and organized is the proposed activity?',
      ],
    },
    broader_impacts: {
      weight: 'Primary',
      considerations: [
        'How well does the activity advance discovery while promoting teaching and learning?',
        'How well does the activity broaden participation of underrepresented groups?',
        'What are the benefits to society?',
        'Is there potential for broader dissemination to enhance scientific understanding?',
        'Does the proposed education plan integrate with and benefit from research?',
      ],
    },
    additional: {
      integration: 'Quality of integration between research and education activities',
      feasibility: 'Feasibility of proposed work within 5-year timeframe',
      institutional_support: 'Evidence of institutional commitment to PI career development',
      broader_reach: 'Potential to impact field beyond immediate research group',
    },
  },

  common_pitfalls: [
    'Education plan treated as an add-on rather than integrated component',
    'Insufficient evidence of institutional support',
    'Overly ambitious scope for 5-year timeframe',
    'Weak connection between proposed work and career development goals',
    'Generic education activities without clear innovation',
    'Budget not aligned with proposed activities',
    'Missing key required sections or exceeding page limits',
  ],
};

export const MOCK_COMPLIANCE_RESULT = {
  compliant: false,
  score: 78,
  issues: [
    {
      severity: 'critical' as const,
      requirement: 'Page Limit Violation',
      finding: 'Project Description appears to exceed the 15-page limit. Current length: ~17 pages.',
      suggestion: 'Reduce content in the Preliminary Studies section or move some material to Supplementary Documents.',
    },
    {
      severity: 'major' as const,
      requirement: 'Education-Research Integration',
      finding: 'Education plan reads as separate from research activities rather than fully integrated.',
      suggestion: 'Revise to show how education activities directly emerge from and feed back into research goals. Use concrete examples of student involvement in research.',
    },
    {
      severity: 'minor' as const,
      requirement: 'Font Size Compliance',
      finding: 'Some figure captions appear to use 9-point font, below the 10-point minimum.',
      suggestion: 'Increase all figure caption text to at least 10-point font size.',
    },
    {
      severity: 'minor' as const,
      requirement: 'Broader Impacts Statement',
      finding: 'Broader impacts could be more explicitly tied to specific project outcomes.',
      suggestion: 'Add measurable metrics for education outcomes (e.g., "train 10 undergraduates, including 5 from underrepresented groups").',
    },
  ],
  summary: 'Proposal shows strong research plan but needs revision to meet formatting requirements and strengthen education-research integration. Address critical page limit issue before submission.',
};

export const MOCK_REVIEW_RESULT = {
  overallScore: 4,
  overallImpact: 'High',
  criteria: {
    significance: {
      score: 3,
      strengths: [
        'Addresses important gap in understanding neural plasticity mechanisms',
        'Could lead to new therapeutic approaches for cognitive disorders',
        'Builds on PI\'s strong preliminary data showing feasibility',
      ],
      weaknesses: [
        'Significance somewhat overstated - incremental advance rather than paradigm shift',
        'Limited discussion of how findings will translate beyond model system',
      ],
    },
    innovation: {
      score: 4,
      strengths: [
        'Novel combination of optogenetics with in vivo calcium imaging',
        'Innovative education plan integrating VR technology for science communication',
        'Creative approach to studying circuit dynamics at multiple timescales',
      ],
      weaknesses: [
        'Some proposed methods are well-established in the field',
      ],
    },
    approach: {
      score: 5,
      strengths: [
        'Well-designed experiments with appropriate controls',
        'Strong preliminary data supporting feasibility',
        'Clear timeline and milestones for 5-year period',
        'Good integration of research and education activities',
      ],
      weaknesses: [
        'Statistical power analysis missing for some experiments',
        'Limited discussion of potential technical challenges',
        'Backup plans for Aim 3 are vague',
      ],
    },
    investigator: {
      score: 3,
      strengths: [
        'Strong publication record in relevant areas',
        'Excellent training environment and institutional support',
        'Clear trajectory toward independence',
      ],
      weaknesses: [
        'Limited experience with some proposed techniques (e.g., viral tracing)',
        'Collaborations not fully described - unclear level of PI independence',
      ],
    },
    environment: {
      score: 2,
      strengths: [
        'Excellent core facilities available',
        'Strong departmental support evident in letter',
        'Good access to required equipment and resources',
      ],
      weaknesses: [
        'No weaknesses noted',
      ],
    },
  },
  summary: 'This is a strong CAREER proposal with innovative approaches and good integration of research and education. The PI shows promise as an emerging leader. Main concerns are around approach feasibility and PI expertise in some techniques. Strengthening the preliminary data for Aim 3 and providing more detail on statistical analyses would improve competitiveness.',
  recommendations: [
    'Provide power analysis for key experiments to demonstrate adequate sample sizes',
    'Clarify PI independence from collaborators - specify exact division of labor',
    'Add specific backup strategies if primary viral tracing approaches fail',
    'Strengthen metrics for education outcomes and assessment plans',
    'Consider reducing scope of Aim 3 or extending timeline to increase feasibility',
  ],
};

export const MOCK_PROPOSAL_CONTENT = `
# NSF CAREER Proposal: Neural Circuit Mechanisms of Adaptive Learning

## Project Summary

### Overview
This CAREER project investigates how neural circuits in the prefrontal cortex dynamically reorganize to support adaptive learning across development. Using cutting-edge optogenetic and imaging techniques in mouse models, we will identify critical periods of plasticity and develop educational programs that translate these findings to improve STEM learning outcomes in underserved communities.

### Intellectual Merit
Our research addresses fundamental questions about how experience shapes neural circuit function during critical developmental windows. By combining in vivo calcium imaging with cell-type-specific manipulations, we will map the spatiotemporal dynamics of prefrontal circuits during learning. This work will advance understanding of cognitive development and may reveal new targets for treating learning disorders.

### Broader Impacts
This project will train 15+ undergraduate researchers, including students from underrepresented groups through partnerships with minority-serving institutions. We will develop an open-source neuroscience education platform using VR technology, making advanced neuroscience concepts accessible to K-12 students. Educational modules will reach 500+ students annually and will be freely distributed to schools in underserved areas.

## Research Plan

### Background and Significance
The prefrontal cortex (PFC) undergoes protracted development in mammals, with critical implications for cognitive function. While considerable evidence suggests that PFC circuits are refined through experience-dependent plasticity, the cellular mechanisms remain poorly understood. Our preliminary data demonstrate that specific interneuron populations show heightened plasticity during adolescence, suggesting a critical window for learning and intervention...

[Content continues for ~15 pages covering aims, methods, preliminary data, etc.]

## Education and Outreach Plan

### Integration with Research
The education plan is deeply integrated with the proposed research. Undergraduate researchers will participate in all aspects of the project, from experimental design to data analysis and manuscript preparation. Through this hands-on experience, students will learn cutting-edge neuroscience techniques while contributing to our understanding of learning mechanisms.

### Community Engagement
We will partner with three local high schools (65% minority enrollment) to develop a "Neuroscience of Learning" curriculum. Using our research findings, we will create interactive VR experiences that allow students to visualize neural circuit activity during learning...

[Continues with detailed education activities, assessment plans, etc.]
`;
