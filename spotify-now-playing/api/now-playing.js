// Endpoint que consulta tu widget en Framer cada pocos segundos.
// Devuelve JSON con la canción que estás escuchando ahora mismo.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
      }),
    });
    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      res.status(200).json({ isPlaying: false });
      return;
    }

    const nowRes = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (nowRes.status === 204 || nowRes.status >= 400) {
      res.status(200).json({ isPlaying: false });
      return;
    }

    const song = await nowRes.json();

    if (!song || !song.item) {
      res.status(200).json({ isPlaying: false });
      return;
    }

    res.status(200).json({
      isPlaying: song.is_playing,
      title: song.item.name,
      artist: song.item.artists.map((a) => a.name).join(", "),
      albumImage: song.item.album.images[0]?.url || null,
    });
  } catch (e) {
    res.status(200).json({ isPlaying: false, error: String(e) });
  }
}
