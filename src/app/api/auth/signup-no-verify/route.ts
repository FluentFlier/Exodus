import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create InsForge client
    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    });

    // Sign up the user - InsForge should be configured to not require email verification
    const { data: authData, error: signUpError } = await insforge.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      // If user already exists, that's okay - they can just sign in
      if (signUpError.message?.includes('already registered')) {
        return NextResponse.json({
          success: true,
          message: 'User already exists. Please sign in.',
        });
      }

      return NextResponse.json(
        { error: signUpError.message || 'Signup failed' },
        { status: 400 }
      );
    }

    // Create a profile entry for the new user if signup succeeded
    if (authData?.user) {
      try {
        await insforge.database.from('profiles').insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: '',
          created_at: new Date().toISOString(),
        });
      } catch (profileError) {
        // Profile might already exist, that's okay
        console.log('Profile creation skipped:', profileError);
      }
    }

    return NextResponse.json({
      success: true,
      user: authData?.user,
      message: 'Account created successfully',
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
