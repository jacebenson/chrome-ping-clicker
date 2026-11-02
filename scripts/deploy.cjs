const { createHmac } = require('node:crypto');

async function main() {
  const sha = process.env.DEPLOY_SHA;
  if (process.env.DEPLOY_REF !== 'refs/heads/main') throw new Error('Only main may deploy.');
  if (!/^[a-f0-9]{40}$/.test(sha || '')) throw new Error('Missing tested commit.');
  const secret = process.env.COOLIFY_WEBHOOK_SECRET;
  if (!secret) throw new Error('Missing deployment credential.');
  const server = process.env.FORGEJO_SERVER_URL || process.env.GITHUB_SERVER_URL;
  if (!server) throw new Error('Missing forge URL.');
  const current = await fetch(`${server.replace(/\/$/, '')}/api/v1/repos/jace/chrome-ping-clicker/branches/main`, {
    headers: { Authorization: `token ${process.env.FORGEJO_TOKEN}` },
  });
  if (!current.ok) throw new Error(`Cannot verify branch: HTTP ${current.status}`);
  if ((await current.json()).commit.id !== sha) {
    console.log('A newer commit is on main; skipping this stale deployment.');
    return;
  }
  const body = JSON.stringify({
    ref: 'refs/heads/main', after: sha,
    repository: { full_name: 'jace/chrome-ping-clicker' },
    commits: [{ id: sha, message: 'CI checks passed', modified: ['.forgejo/workflows/ci.yml'] }],
  });
  const signature = createHmac('sha256', secret).update(body).digest('hex');
  const response = await fetch('https://coolify.jace.pro/webhooks/source/gitea/events/manual', {
    method: 'POST', body,
    headers: {
      'Content-Type': 'application/json', 'X-Gitea-Event': 'push',
      'X-Hub-Signature-256': `sha256=${signature}`,
    },
  });
  if (!response.ok) throw new Error(`Deployment request failed: HTTP ${response.status}`);
  const results = await response.json();
  if (!Array.isArray(results) || !results.some((r) => r.status === 'success' || r.status === 'queued')) {
    throw new Error('Coolify did not confirm that a deployment was queued.');
  }
  console.log('Coolify accepted deployment of the tested commit.');
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
