import { createClient } from '@supabase/supabase-js';
import { createEmptyResume } from '../../src/lib/domain/resumeFactory';
import type { SupabaseClient } from '../../src/lib/domain/supabaseClientType';
import { SupabaseResumeStore } from '../../src/lib/mcp/store/supabaseStore';
import {
  getDefaultSupabaseAnonKey,
  getDefaultSupabaseUrl,
  loadConfigEnv,
} from '../src/config';
import { getAuthenticatedClient } from '../src/session';

const testPassword = `RlsTest!${Math.random().toString(36).slice(2, 12)}`;

const runSql = async (
  accessToken: string,
  projectRef: string,
  query: string
): Promise<void> => {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    throw new Error(`Management API SQL failed: ${await response.text()}`);
  }
};

const main = async (): Promise<void> => {
  loadConfigEnv();

  const supabaseUrl = getDefaultSupabaseUrl();
  const anonKey = getDefaultSupabaseAnonKey();
  const managementToken = process.env.SUPABASE_ACCESS_TOKEN || '';

  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase URL or anon key is not configured.');
  }
  if (!managementToken) {
    throw new Error('SUPABASE_ACCESS_TOKEN is required for the RLS test.');
  }

  const projectRef = supabaseUrl.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    throw new Error('Could not derive the Supabase project ref.');
  }

  const owner = await getAuthenticatedClient();
  const [ownerLocal, ownerDomain] = owner.email.split('@');
  if (!ownerLocal || !ownerDomain) {
    throw new Error('Could not derive a test email from the owner account.');
  }
  const testEmail = `${ownerLocal}+cevee-rls-${Date.now()}@${ownerDomain}`;

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const signUp = await authClient.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUp.error) {
    throw new Error(`Test user sign-up failed: ${signUp.error.message}`);
  }

  // Email confirmation is enabled on this project, so confirm the synthetic
  // test user before signing in. The test user is deleted in the finally block.
  await runSql(
    managementToken,
    projectRef,
    `update auth.users set email_confirmed_at = now() where email = '${testEmail}';`
  );

  const signIn = await authClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signIn.error || !signIn.data.session) {
    throw new Error(`Test user sign-in failed: ${signIn.error?.message || 'no session'}`);
  }

  const testUserId = signIn.data.session.user.id;
  const testDataClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${signIn.data.session.access_token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const testStore = new SupabaseResumeStore(
    testDataClient as unknown as SupabaseClient,
    testUserId
  );

  const ownerStore = new SupabaseResumeStore(owner.client, owner.userId);

  let testResumeId: string | null = null;
  let ownerResumeId: string | null = null;

  try {
    const testResume = await testStore.createResume(
      createEmptyResume({ title: 'RLS Test Resume (friend)' })
    );
    testResumeId = testResume.id;

    const ownerResume = await ownerStore.createResume(
      createEmptyResume({ title: 'RLS Test Resume (owner)' })
    );
    ownerResumeId = ownerResume.id;

    const ownerReadsTest = await ownerStore.getResume(testResumeId);
    const testReadsOwner = await testStore.getResume(ownerResumeId);
    const ownerList = await ownerStore.listResumes({ limit: 100 });
    const testList = await testStore.listResumes({ limit: 100 });
    const ownerUpdate = await ownerStore.updateResume(testResume, 1);

    const ownerListLeak = ownerList.some((resume) => resume.id === testResumeId);
    const testListLeak = testList.some((resume) => resume.id === ownerResumeId);

    console.log(`owner reads test resume: ${ownerReadsTest === null ? 'blocked' : 'LEAK'}`);
    console.log(`test reads owner resume: ${testReadsOwner === null ? 'blocked' : 'LEAK'}`);
    console.log(`owner list contains test resume: ${ownerListLeak}`);
    console.log(`test list contains owner resume: ${testListLeak}`);
    console.log(`owner update test resume: ${ownerUpdate.ok ? 'LEAK' : ownerUpdate.reason}`);

    if (
      ownerReadsTest !== null ||
      testReadsOwner !== null ||
      ownerListLeak ||
      testListLeak ||
      ownerUpdate.ok
    ) {
      throw new Error('RLS isolation failed.');
    }

    console.log('rls test: ok');
  } finally {
    if (testResumeId) {
      await testStore.deleteResume(testResumeId).catch(() => undefined);
    }
    if (ownerResumeId) {
      await ownerStore.deleteResume(ownerResumeId).catch(() => undefined);
    }
    await runSql(
      managementToken,
      projectRef,
      `delete from auth.users where email = '${testEmail}';`
    );
  }
};

main().catch((error: unknown) => {
  console.error(
    `rls test failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
});
