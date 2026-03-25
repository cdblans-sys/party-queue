export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Spotify credentials not configured' });
  }

  // Get a client credentials token (no user needed, for search only)
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return res.status(500).json({ error: 'Could not get Spotify token' });
  }

  const searchRes = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=6`,
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );

  const data = await searchRes.json();
  return res.json(data);
}
