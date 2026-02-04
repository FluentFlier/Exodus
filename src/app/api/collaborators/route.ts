import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

export async function GET() {
  try {
    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    });

    const { data: profileData, error } = await insforge.database
      .from('profiles')
      .select('id, full_name, institution, tags, methods, collab_roles, availability, headline, bio')
      .eq('collab_open', true)
      .limit(200);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch collaborators' }, { status: 500 });
    }

    const { data: directoryData } = await insforge.database
      .from('collaborator_directory')
      .select('id, full_name, institution, tags, methods, collab_roles, availability, headline, bio, source')
      .limit(400);

    const profiles = (profileData || []).map((profile: any) => ({
      ...profile,
      source: 'Exodus',
    }));

    const directory = (directoryData || []).map((entry: any) => ({
      ...entry,
      source: entry.source || 'Public',
    }));

    const combined = [...profiles, ...directory];
    return NextResponse.json({ profiles: combined });
  } catch (error: any) {
    console.error('Collaborators GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
