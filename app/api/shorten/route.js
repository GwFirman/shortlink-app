// pages/api/shorten.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Untuk Neon dan Supabase
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const slug = Math.random().toString(36).substring(2, 8); // Slug acak
    try {
      const query = 'INSERT INTO short_links (slug, original_url) VALUES ($1, $2) RETURNING slug';
      const result = await pool.query(query, [slug, url]);
      res.status(201).json({ shortUrl: `${process.env.BASE_URL}/${result.rows[0].slug}` });
    } catch (err) {
      res.status(500).json({ error: 'Something went wrong' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
