import { NextResponse } from 'next/server';
import { ASU_UNIVERSITY, matchUniversityResources } from '@/data/university-index';

export async function POST(request: Request) {
    try {
        const { proposalText, universityId } = await request.json();

        if (!proposalText) {
            return NextResponse.json({ error: 'Proposal text required' }, { status: 400 });
        }

        // For now, only ASU is indexed
        // In production, fetch university by ID from database
        const university = ASU_UNIVERSITY;

        if (universityId && universityId !== 'asu') {
            return NextResponse.json({
                error: 'University not indexed yet',
                message: 'Currently only ASU is available in the directory'
            }, { status: 404 });
        }

        // Match proposal needs to university resources
        const matches = matchUniversityResources(proposalText, university);

        return NextResponse.json({
            university: {
                id: university.id,
                name: university.name,
                short_name: university.short_name,
            },
            suggestions: {
                faculty: matches.faculty.slice(0, 5), // Top 5 faculty
                services: matches.services.slice(0, 5), // Top 5 services
            },
            total_matches: {
                faculty: matches.faculty.length,
                services: matches.services.length,
            },
        });
    } catch (error: any) {
        console.error('University resource matching error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
