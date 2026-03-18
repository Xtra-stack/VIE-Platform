import { env } from '../src/config/env.js';

const args = process.argv.slice(2);
const flags = new Map();

for (let i = 0; i < args.length; i += 1) {
  const raw = args[i];
  if (!raw.startsWith('--')) continue;

  const [key, inlineValue] = raw.slice(2).split('=');
  if (inlineValue !== undefined) {
    flags.set(key, inlineValue);
    continue;
  }

  const next = args[i + 1];
  if (next && !next.startsWith('--')) {
    flags.set(key, next);
    i += 1;
  } else {
    flags.set(key, true);
  }
}

const showHelp = flags.has('help') || flags.has('h');

if (showHelp) {
  console.log(`
VIE Auth Flow Test

Usage:
  node scripts/auth-flow-test.js [--baseUrl http://localhost:3000] [--username manager1] [--password manager123] [--admin]

Options:
  --baseUrl   API base URL (default: env.serverUrl or http://localhost:3000)
  --username  Username/email for login (default: AUTH_TEST_USERNAME or manager1)
  --password  Password for login (default: AUTH_TEST_PASSWORD or manager123)
  --admin     Use admin login endpoint
  --help      Show this help

Environment overrides:
  AUTH_TEST_BASE_URL
  AUTH_TEST_USERNAME
  AUTH_TEST_PASSWORD
`);
  process.exit(0);
}

const baseUrl = String(flags.get('baseUrl') || process.env.AUTH_TEST_BASE_URL || env.serverUrl || 'http://localhost:3000').replace(/\/$/, '');
const username = String(flags.get('username') || process.env.AUTH_TEST_USERNAME || 'manager1');
const password = String(flags.get('password') || process.env.AUTH_TEST_PASSWORD || 'manager123');
const useAdminLogin = Boolean(flags.get('admin'));

const authRoot = `${baseUrl}/api/auth`;
const loginPath = useAdminLogin ? '/admin/login' : '/login';

const log = (message) => console.log(`[AUTH-FLOW] ${message}`);

async function requestJson(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${authRoot}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

async function run() {
  log(`Base URL: ${baseUrl}`);
  log(`Login mode: ${useAdminLogin ? 'ADMIN' : 'STANDARD'}`);
  log(`User: ${username}`);

  const health = await fetch(`${baseUrl}/health`).catch(() => null);
  if (!health || !health.ok) {
    throw new Error('Backend health check failed. Start backend first (npm run dev in backend).');
  }
  log('Health check passed');

  const loginRes = await requestJson(loginPath, {
    method: 'POST',
    body: { username, password },
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed (${loginRes.status}): ${loginRes.data?.error || loginRes.data?.message || 'Unknown error'}`);
  }

  const accessToken = loginRes.data?.data?.token;
  const refreshToken = loginRes.data?.data?.refreshToken;

  if (!accessToken || !refreshToken) {
    throw new Error('Login response missing token/refreshToken');
  }

  log('Login passed (access + refresh token received)');

  const meRes = await requestJson('/me', {
    method: 'GET',
    token: accessToken,
  });

  if (!meRes.ok) {
    throw new Error(`GET /me failed (${meRes.status})`);
  }

  log(`Profile fetch passed (role: ${meRes.data?.data?.user?.role || 'N/A'})`);

  const refreshRes = await requestJson('/refresh', {
    method: 'POST',
    body: { refreshToken },
  });

  if (!refreshRes.ok) {
    throw new Error(`Refresh failed (${refreshRes.status}): ${refreshRes.data?.error || refreshRes.data?.message || 'Unknown error'}`);
  }

  const refreshedAccessToken = refreshRes.data?.data?.token;
  const rotatedRefreshToken = refreshRes.data?.data?.refreshToken;

  if (!refreshedAccessToken || !rotatedRefreshToken) {
    throw new Error('Refresh response missing token/refreshToken');
  }

  log('Refresh passed (new access + refresh token received)');

  const meWithRefreshedRes = await requestJson('/me', {
    method: 'GET',
    token: refreshedAccessToken,
  });

  if (!meWithRefreshedRes.ok) {
    throw new Error(`GET /me with refreshed token failed (${meWithRefreshedRes.status})`);
  }

  log('Refreshed access token validation passed');

  const logoutRes = await requestJson('/logout', {
    method: 'POST',
    token: refreshedAccessToken,
    body: {},
  });

  if (!logoutRes.ok) {
    throw new Error(`Logout failed (${logoutRes.status})`);
  }

  log('Logout passed');
  log('Auth flow test completed successfully ✅');
}

run().catch((error) => {
  console.error(`[AUTH-FLOW] FAILED: ${error.message}`);
  process.exit(1);
});
