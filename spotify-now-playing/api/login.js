// Paso 1 del proceso de un solo uso: te redirige a Spotify para autorizar.
// Visita https://TU-PROYECTO.vercel.app/api/login una vez montado el proyecto.
export default function handler(req, res) {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const redirect_uri = `https://${req.headers.host}/api/callback`;
  const scope = "user-read-currently-playing user-read-playback-state";

  const params = new URLSearchParams({
    response_type: "code",
    client_id,
    scope,
    redirect_uri,
  });

  res.writeHead(302, {
    Location: `https://accounts.spotify.com/authorize?${params.toString()}`,
  });
  res.end();
}
