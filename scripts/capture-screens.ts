import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL = 'https://ocftwwotizzopooxwgyi.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const PAGES = [
  { path: '/login', name: 'login', needsAuth: false },
  { path: '/register', name: 'register', needsAuth: false },
  { path: '/dashboard', name: 'dashboard', needsAuth: true },
  { path: '/tracks', name: 'tracks', needsAuth: true },
  { path: '/stories', name: 'stories', needsAuth: true },
  { path: '/notifications', name: 'notifications', needsAuth: true },
  { path: '/admin/moderation', name: 'admin-moderation', needsAuth: true },
  { path: '/admin/partners', name: 'admin-partners', needsAuth: true },
];

async function main() {
  // Create a test user in Supabase for screenshot capture
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const testEmail = 'screenshot-bot@storyteller.test';
  const testPassword = 'screenshot-test-123';

  // Create user (ignore if exists)
  await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { name: 'Screenshot Bot' },
  });

  // Get session token
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError || !signInData.session) {
    console.error('Failed to sign in:', signInError);
    return;
  }

  console.log('Authenticated as screenshot bot');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Set Supabase session in localStorage before navigating
  const sessionData = JSON.stringify({
    access_token: signInData.session.access_token,
    refresh_token: signInData.session.refresh_token,
    expires_at: signInData.session.expires_at,
    expires_in: signInData.session.expires_in,
    token_type: 'bearer',
    user: signInData.session.user,
  });

  // Navigate to login first to set the origin
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 15000 });

  // Inject Supabase session into localStorage
  const storageKey = `sb-ocftwwotizzopooxwgyi-auth-token`;
  await page.evaluate(
    (key: string, data: string) => {
      localStorage.setItem(key, data);
    },
    storageKey,
    sessionData,
  );

  console.log('Session injected into localStorage');

  // Capture each page
  for (const { path, name, needsAuth } of PAGES) {
    console.log(`Capturing ${path}...`);

    if (!needsAuth) {
      // For auth pages, open in incognito-like state
      const authPage = await browser.newPage();
      await authPage.setViewport({ width: 1440, height: 900 });
      await authPage.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle0', timeout: 15000 });
      await authPage.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
      await authPage.close();
    } else {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise((r) => setTimeout(r, 3000)); // Wait for data to load
      await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
    }

    console.log(`  Saved screenshots/${name}.png`);
  }

  await browser.close();

  // Cleanup test user
  const { data: users } = await supabase.auth.admin.listUsers();
  const botUser = users?.users?.find((u) => u.email === testEmail);
  if (botUser) {
    await supabase.auth.admin.deleteUser(botUser.id);
    console.log('Cleaned up screenshot bot user');
  }

  console.log('\nAll screenshots saved to screenshots/ directory');
}

main().catch(console.error);
