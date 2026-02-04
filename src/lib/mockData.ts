// Centralized mock data for consistent experience across all pages

export interface MockProject {
    id: string;
    title: string;
    status: 'draft' | 'in_progress' | 'submitted' | 'awarded' | 'declined';
    grant_id: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
    grants?: {
        id: string;
        title: string;
        funder: string;
        deadline: string;
        amount_min: number;
        amount_max: number;
    };
}

export interface MockGrant {
    id: string;
    title: string;
    funder: string;
    deadline: string;
    amount_min: number;
    amount_max: number;
    description: string;
    eligibility: string;
    url: string;
    reasons?: string[];
}

// Generate consistent dates relative to current time
const daysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
};

// Mock Projects with varied statuses for realistic pipeline
export const MOCK_PROJECTS: MockProject[] = [
    {
        id: 'mock-proj-1',
        title: 'NSF CAREER: Faculty Early Career Development Program',
        status: 'in_progress',
        grant_id: 'mock-grant-1',
        owner_id: 'mock-user-1',
        created_at: daysFromNow(-45),
        updated_at: daysFromNow(-2),
        grants: {
            id: 'mock-grant-1',
            title: 'NSF CAREER: Faculty Early Career Development Program',
            funder: 'National Science Foundation',
            deadline: daysFromNow(42),
            amount_min: 400000,
            amount_max: 500000,
        },
    },
    {
        id: 'mock-proj-2',
        title: 'NIH R01: Precision Medicine Initiative',
        status: 'awarded',
        grant_id: 'mock-grant-2',
        owner_id: 'mock-user-1',
        created_at: daysFromNow(-12),
        updated_at: daysFromNow(-5),
        grants: {
            id: 'mock-grant-2',
            title: 'NIH R01 Research Project Grant',
            funder: 'National Institutes of Health',
            deadline: daysFromNow(68),
            amount_min: 1800000,
            amount_max: 750000,
        },
    },
    {
        id: 'mock-proj-3',
        title: 'DOE Early Career: Renewable Energy Systems',
        status: 'in_progress',
        grant_id: 'mock-grant-3',
        owner_id: 'mock-user-1',
        created_at: daysFromNow(-90),
        updated_at: daysFromNow(-1),
        grants: {
            id: 'mock-grant-3',
            title: 'DOE Office of Science: Early Career Research Program',
            funder: 'Department of Energy',
            deadline: daysFromNow(28),
            amount_min: 500000,
            amount_max: 750000,
        },
    },
    {
        id: 'mock-proj-4',
        title: 'NASA Astrobiology: Origins of Life',
        status: 'submitted',
        grant_id: 'mock-grant-4',
        owner_id: 'mock-user-1',
        created_at: daysFromNow(-120),
        updated_at: daysFromNow(-14),
        grants: {
            id: 'mock-grant-4',
            title: 'NASA Exobiology and Evolutionary Biology Program',
            funder: 'NASA',
            deadline: daysFromNow(-14), // already submitted
            amount_min: 300000,
            amount_max: 500000,
        },
    },
    {
        id: 'mock-proj-5',
        title: 'Sloan Foundation: Digital Economy Research',
        status: 'awarded',
        grant_id: 'mock-grant-5',
        owner_id: 'mock-user-1',
        created_at: daysFromNow(-180),
        updated_at: daysFromNow(-30),
        grants: {
            id: 'mock-grant-5',
            title: 'Alfred P. Sloan Foundation Research Fellowship',
            funder: 'Alfred P. Sloan Foundation',
            deadline: daysFromNow(-60), // past deadline
            amount_min: 750000,
            amount_max: 75000,
        },
    },
    {
        id: 'mock-proj-6',
        title: 'NSF IUCRC: Industry-University Collaboration',
        status: 'declined',
        grant_id: 'mock-grant-6',
        owner_id: 'mock-user-1',
        created_at: daysFromNow(-200),
        updated_at: daysFromNow(-45),
        grants: {
            id: 'mock-grant-6',
            title: 'NSF Industry-University Cooperative Research Centers',
            funder: 'National Science Foundation',
            deadline: daysFromNow(-90),
            amount_min: 150000,
            amount_max: 300000,
        },
    },
    {
        id: 'mock-proj-7',
        title: 'Gates Foundation: Global Health Innovation',
        status: 'in_progress',
        grant_id: 'mock-grant-7',
        owner_id: 'mock-user-1',
        created_at: daysFromNow(-30),
        updated_at: daysFromNow(-3),
        grants: {
            id: 'mock-grant-7',
            title: 'Bill & Melinda Gates Foundation Grand Challenges',
            funder: 'Bill & Melinda Gates Foundation',
            deadline: daysFromNow(55),
            amount_min: 100000,
            amount_max: 1000000,
        },
    },
    {
        id: 'mock-proj-8',
        title: 'DARPA: AI for Scientific Discovery',
        status: 'draft',
        grant_id: 'mock-grant-8',
        owner_id: 'mock-user-1',
        created_at: daysFromNow(-7),
        updated_at: daysFromNow(-1),
        grants: {
            id: 'mock-grant-8',
            title: 'DARPA Young Faculty Award',
            funder: 'Defense Advanced Research Projects Agency',
            deadline: daysFromNow(95),
            amount_min: 500000,
            amount_max: 500000,
        },
    },
];

// Mock Recommended Grants for dashboard
export const MOCK_RECOMMENDED_GRANTS: MockGrant[] = [
    {
        id: 'mock-rec-grant-1',
        title: 'NSF CAREER: Faculty Early Career Development Program',
        funder: 'National Science Foundation',
        deadline: daysFromNow(42),
        amount_min: 400000,
        amount_max: 800000,
        description: 'Supports early-career faculty who integrate research and education and show potential for academic leadership.',
        eligibility: 'Tenure-track assistant professor at a U.S. institution.',
        url: 'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=503214',
        reasons: [
            'Profile alignment with early-career criteria',
            'Strong education + research integration',
            'Timeline fits annual submission window',
        ],
    },
    {
        id: 'mock-rec-grant-2',
        title: 'DOE Office of Science Early Career Research Program',
        funder: 'U.S. Department of Energy Office of Science',
        deadline: daysFromNow(70),
        amount_min: 875000,
        amount_max: 2750000,
        description: 'Supports outstanding early-career scientists at U.S. universities, national labs, and user facilities.',
        eligibility: 'Early-career faculty within 10 years of PhD or eligible lab staff.',
        url: 'https://science.osti.gov/early-career',
        reasons: [
            'Research fit with Office of Science programs',
            'Early-career timeline fits eligibility window',
            'Strong institutional alignment',
        ],
    },
    {
        id: 'mock-rec-grant-3',
        title: 'NIH Pathway to Independence (K99/R00) - Parent',
        funder: 'National Institutes of Health',
        deadline: daysFromNow(90),
        amount_min: 150000,
        amount_max: 249000,
        description: 'Supports postdoctoral researchers transitioning to independent faculty positions.',
        eligibility: 'Postdoc with <=4 years experience in a mentored position.',
        url: 'https://grants.nih.gov/grants/guide/pa-files/PA-24-194.html',
        reasons: [
            'Career transition stage fits K99/R00',
            'Mentored training plan aligns with criteria',
            'Pipeline to independence highlighted',
        ],
    },
];

// Helper function to get status breakdown for analytics
export function getStatusBreakdown() {
    const breakdown: Record<string, number> = {};
    MOCK_PROJECTS.forEach((project) => {
        breakdown[project.status] = (breakdown[project.status] || 0) + 1;
    });
    return breakdown;
}

// Helper function to calculate total funding
export function getTotalFunding() {
    let requested = 0;
    let awarded = 0;

    MOCK_PROJECTS.forEach((project) => {
        if (project.grants) {
            const avgAmount = (project.grants.amount_min + project.grants.amount_max) / 2;
            requested += avgAmount;
            if (project.status === 'awarded') {
                awarded += avgAmount;
            }
        }
    });

    return { requested, awarded };
}

// Timeline data for analytics
export function getTimelineData() {
    // Generate 6 months of data
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    const timeline = months.map((month, i) => {
        // Count projects created in each month
        const monthProjects = MOCK_PROJECTS.filter((p) => {
            const created = new Date(p.created_at);
            const monthsAgo = -((6 - i) * 30);
            const targetDate = daysFromNow(monthsAgo);
            return created >= new Date(targetDate) && created < new Date(daysFromNow(monthsAgo + 30));
        });

        const awarded = monthProjects.filter((p) => p.status === 'awarded').length;

        return {
            month,
            proposals: monthProjects.length || (i === 5 ? 2 : Math.floor(Math.random() * 3) + 1),
            awarded: awarded || (i % 3 === 0 ? 1 : 0),
        };
    });

    return timeline;
}
