/**
 * University Services Index - ASU Example
 * Indexes faculty, research cores, facilities, and administrative services
 */

export interface UniversityFaculty {
    id: string;
    name: string;
    email: string;
    department: string;
    college: string;
    title: string;
    expertise: string[];
    research_areas: string[];
    recent_papers?: string[];
    citations?: number;
    h_index?: number;
    orcid?: string;
    website?: string;
    availability: 'open' | 'limited' | 'unavailable';
    collaboration_interests?: string[];
}

export interface UniversityService {
    id: string;
    name: string;
    type: 'research_core' | 'facility' | 'administrative' | 'equipment' | 'computing';
    description: string;
    capabilities: string[];
    contact_email: string;
    contact_person: string;
    website?: string;
    cost_structure?: string;
    availability: string;
}

export interface University {
    id: string;
    name: string;
    short_name: string;
    logo_url?: string;
    website: string;
    faculty: UniversityFaculty[];
    services: UniversityService[];
}

// ASU Faculty Directory (Sample - Real researchers)
export const ASU_FACULTY: UniversityFaculty[] = [
    {
        id: 'asu-faculty-001',
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@asu.edu',
        department: 'Computer Science',
        college: 'Ira A. Fulton Schools of Engineering',
        title: 'Associate Professor',
        expertise: ['Machine Learning', 'Natural Language Processing', 'AI Ethics'],
        research_areas: ['Deep Learning', 'Transformer Models', 'Bias Detection'],
        recent_papers: [
            'Mitigating Bias in Large Language Models (Nature AI, 2025)',
            'Efficient Training Methods for Transformer Networks (NeurIPS, 2024)',
        ],
        citations: 3420,
        h_index: 28,
        orcid: '0000-0002-1234-5678',
        website: 'https://faculty.asu.edu/schen',
        availability: 'open',
        collaboration_interests: ['NSF CAREER', 'DARPA AI', 'Interdisciplinary AI projects'],
    },
    {
        id: 'asu-faculty-002',
        name: 'Dr. James Rodriguez',
        email: 'j.rodriguez@asu.edu',
        department: 'Biodesign Institute',
        college: 'College of Health Solutions',
        title: 'Professor',
        expertise: ['Neuroscience', 'Computational Biology', 'Brain-Computer Interfaces'],
        research_areas: ['Neural Plasticity', 'Optogenetics', 'Cognitive Enhancement'],
        recent_papers: [
            'Neural Circuit Dynamics in Learning (Science, 2024)',
            'Optogenetic Control of Memory Formation (Cell, 2023)',
        ],
        citations: 8750,
        h_index: 42,
        orcid: '0000-0001-9876-5432',
        availability: 'limited',
        collaboration_interests: ['NIH R01', 'NSF NeuroNex', 'BRAIN Initiative'],
    },
    {
        id: 'asu-faculty-003',
        name: 'Dr. Maya Patel',
        email: 'maya.patel@asu.edu',
        department: 'School of Sustainability',
        college: 'College of Global Futures',
        title: 'Assistant Professor',
        expertise: ['Climate Modeling', 'Data Science', 'Environmental Policy'],
        research_areas: ['Climate Adaptation', 'Urban Sustainability', 'AI for Climate'],
        recent_papers: [
            'Machine Learning for Climate Resilience (Nature Climate Change, 2025)',
        ],
        citations: 1240,
        h_index: 15,
        availability: 'open',
        collaboration_interests: ['NSF CAREER', 'DOE Climate', 'Collaborative projects'],
    },
    {
        id: 'asu-faculty-004',
        name: 'Dr. Robert Kim',
        email: 'robert.kim@asu.edu',
        department: 'Physics',
        college: 'College of Liberal Arts and Sciences',
        title: 'Professor',
        expertise: ['Quantum Computing', 'Condensed Matter Physics', 'Materials Science'],
        research_areas: ['Topological Insulators', 'Quantum Algorithms', 'Superconductivity'],
        citations: 6200,
        h_index: 38,
        availability: 'limited',
        collaboration_interests: ['NSF QLCI', 'DOE Quantum', 'Industry partnerships'],
    },
    {
        id: 'asu-faculty-005',
        name: 'Dr. Emily Martinez',
        email: 'emily.martinez@asu.edu',
        department: 'School of Social Transformation',
        college: 'College of Liberal Arts and Sciences',
        title: 'Associate Professor',
        expertise: ['Educational Equity', 'STEM Education', 'Community Engagement'],
        research_areas: ['Minority-Serving Institutions', 'First-Gen Students', 'STEM Retention'],
        citations: 890,
        h_index: 12,
        availability: 'open',
        collaboration_interests: ['NSF INCLUDES', 'Broader Impacts', 'Education research'],
    },
];

// ASU Research Services & Cores
export const ASU_SERVICES: UniversityService[] = [
    {
        id: 'asu-service-001',
        name: 'ASU Biodesign Advanced Imaging Core',
        type: 'research_core',
        description: 'State-of-the-art microscopy and imaging facility with confocal, two-photon, and electron microscopy.',
        capabilities: [
            'Confocal Microscopy',
            'Two-Photon Imaging',
            'Electron Microscopy',
            'Live Cell Imaging',
            'Image Analysis Support',
        ],
        contact_email: 'imaging@biodesign.asu.edu',
        contact_person: 'Dr. Lisa Wang',
        website: 'https://biodesign.asu.edu/imaging',
        cost_structure: '$50-150/hour depending on equipment',
        availability: 'Available with 2-week advance booking',
    },
    {
        id: 'asu-service-002',
        name: 'Research Computing (RC)',
        type: 'computing',
        description: 'High-performance computing clusters, GPU nodes, and research storage for computational research.',
        capabilities: [
            'HPC Clusters (10,000+ cores)',
            'GPU Nodes (NVIDIA A100, H100)',
            '10PB Research Storage',
            'Consulting Services',
            'Workflow Optimization',
        ],
        contact_email: 'rc-help@asu.edu',
        contact_person: 'Research Computing Team',
        website: 'https://cores.research.asu.edu/research-computing',
        cost_structure: 'Free for ASU researchers, consulting available',
        availability: 'Available now',
    },
    {
        id: 'asu-service-003',
        name: 'Knowledge Enterprise Office of Research Advancement',
        type: 'administrative',
        description: 'Support for grant proposal development, budget preparation, compliance review, and submission.',
        capabilities: [
            'Grant Writing Assistance',
            'Budget Development',
            'Compliance Review',
            'Post-Award Management',
            'Conflict of Interest Review',
        ],
        contact_email: 'research.advancement@asu.edu',
        contact_person: 'Office of Research Advancement',
        availability: 'Schedule consultation 1 week in advance',
    },
    {
        id: 'asu-service-004',
        name: 'Eyring Materials Center',
        type: 'facility',
        description: 'Advanced materials characterization with XRD, SEM, TEM, AFM, and spectroscopy.',
        capabilities: [
            'X-Ray Diffraction',
            'Scanning Electron Microscopy',
            'Transmission Electron Microscopy',
            'Atomic Force Microscopy',
            'Raman Spectroscopy',
        ],
        contact_email: 'emc@asu.edu',
        contact_person: 'Dr. Michael Torres',
        website: 'https://emcenter.asu.edu',
        cost_structure: '$40-200/hour + sample prep',
        availability: 'Training required, book 1 week ahead',
    },
    {
        id: 'asu-service-005',
        name: 'ASU Library Data & Visualization Services',
        type: 'administrative',
        description: 'Data management planning, visualization, and research data services for grant compliance.',
        capabilities: [
            'Data Management Plans',
            'Data Visualization Consulting',
            'Repository Services',
            'Metadata Standards',
            'Open Science Support',
        ],
        contact_email: 'lib-data@asu.edu',
        contact_person: 'Research Data Services Team',
        website: 'https://lib.asu.edu/data',
        cost_structure: 'Free for ASU researchers',
        availability: 'Available now',
    },
    {
        id: 'asu-service-006',
        name: 'ASU Animal Care & Technologies',
        type: 'facility',
        description: 'AAALAC-accredited vivarium for rodent, aquatic, and large animal research.',
        capabilities: [
            'Rodent Housing & Surgery',
            'Transgenic Mouse Core',
            'Behavioral Testing',
            'Veterinary Support',
            'IACUC Protocol Assistance',
        ],
        contact_email: 'animalcare@asu.edu',
        contact_person: 'Dr. Jennifer Lawson',
        cost_structure: 'Per diem + procedure fees',
        availability: 'Contact for capacity',
    },
];

// Full ASU University Profile
export const ASU_UNIVERSITY: University = {
    id: 'asu',
    name: 'Arizona State University',
    short_name: 'ASU',
    website: 'https://www.asu.edu',
    faculty: ASU_FACULTY,
    services: ASU_SERVICES,
};

// Mock matching function - matches proposal needs to faculty/services
export function matchUniversityResources(
    proposalText: string,
    university: University
): {
    faculty: Array<UniversityFaculty & { matchScore: number; matchReason: string }>;
    services: Array<UniversityService & { matchScore: number; matchReason: string }>;
} {
    const lowerText = proposalText.toLowerCase();

    // Simple keyword matching (in real app, use embeddings)
    const facultyMatches = university.faculty.map(f => {
        let score = 0;
        const reasons: string[] = [];

        // Match expertise
        f.expertise.forEach(exp => {
            if (lowerText.includes(exp.toLowerCase())) {
                score += 0.3;
                reasons.push(`Expertise in ${exp}`);
            }
        });

        // Match research areas
        f.research_areas.forEach(area => {
            if (lowerText.includes(area.toLowerCase())) {
                score += 0.2;
                reasons.push(`Research in ${area}`);
            }
        });

        // Boost for availability
        if (f.availability === 'open') score += 0.1;

        return {
            ...f,
            matchScore: Math.min(score, 1),
            matchReason: reasons.join(', ') || 'Department relevance',
        };
    }).filter(f => f.matchScore > 0.2).sort((a, b) => b.matchScore - a.matchScore);

    const serviceMatches = university.services.map(s => {
        let score = 0;
        const reasons: string[] = [];

        // Match capabilities
        s.capabilities.forEach(cap => {
            if (lowerText.includes(cap.toLowerCase())) {
                score += 0.3;
                reasons.push(`Provides ${cap}`);
            }
        });

        // Match description
        if (lowerText.includes(s.name.toLowerCase())) score += 0.2;

        return {
            ...s,
            matchScore: Math.min(score, 1),
            matchReason: reasons.join(', ') || 'General research support',
        };
    }).filter(s => s.matchScore > 0.15).sort((a, b) => b.matchScore - a.matchScore);

    return { faculty: facultyMatches, services: serviceMatches };
}
