import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK;

  if (!deployHookUrl) {
    return res.status(500).json({ error: 'VERCEL_DEPLOY_HOOK env var is not set' });
  }

  const response = await fetch(deployHookUrl, { method: 'POST' });

  if (!response.ok) {
    return res.status(500).json({ error: 'Failed to trigger deploy' });
  }

  return res.status(200).json({ ok: true, triggered: new Date().toISOString() });
}
