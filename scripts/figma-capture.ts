import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL = 'https://ocftwwotizzopooxwgyi.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const CAPTURE_ID = process.argv[2];
const PAGE_PATH = process.argv[3] || '/login';
const NEEDS_AUTH = process.argv[4] === 'true';

if (!CAPTURE_ID) {
  console.error('Usage: npx tsx scripts/figma-capture.ts <captureId> <path> <needsAuth>');
  process.exit(1);
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  if (NEEDS_AUTH) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const testEmail = 'figma-capture@storyteller.test';
    const testPassword = 'capture-test-123';

    await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { name: 'Figma Capture' },
    }).catch(() => {});

    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInData?.session) {
      // Set origin first
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 15000 });

      const storageKey = 'sb-ocftwwotizzopooxwgyi-auth-token';
      const sessionData = JSON.stringify({
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        expires_at: signInData.session.expires_at,
        expires_in: signInData.session.expires_in,
        token_type: 'bearer',
        user: signInData.session.user,
      });
      await page.evaluate((key: string, data: string) => localStorage.setItem(key, data), storageKey, sessionData);
    }
  }

  const captureUrl = `${BASE_URL}${PAGE_PATH}#figmacapture=${CAPTURE_ID}&figmaendpoint=${encodeURIComponent(`https://mcp.figma.com/mcp/capture/${CAPTURE_ID}/submit`)}&figmadelay=3000`;

  console.log(`Opening ${PAGE_PATH} with capture ID ${CAPTURE_ID}...`);
  await page.goto(captureUrl, { waitUntil: 'networkidle0', timeout: 20000 });

  // Wait for capture script + delay
  await new Promise((r) => setTimeout(r, 8000));

  console.log(`Capture submitted for ${PAGE_PATH}`);
  await browser.close();
}

main().catch(console.error);
