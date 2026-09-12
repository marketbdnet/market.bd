import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ status: 'ok', name: 'MarketBD.Net Production API' });
}
