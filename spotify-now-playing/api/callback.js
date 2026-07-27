// Paso 2 del proceso de un solo uso: Spotify te redirige aquí con un "code".
// Esta función lo cambia por un refresh_token, que es lo único que
// necesitas copiar y guardar como variable de entorno (una sola vez).
export default async function handler(req, res) {
  const { code, error } = req.query;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirect_uri = `https://${req.headers.host}/api/callback`;

  if (error) {
    res.status(400).send(`Spotify devolvió un error: ${error}`);
    return;
  }
  if (!code) {
    res.status(400).send('Falta el parámetro "code". Empieza de nuevo visitando /api/login');
    return;
  }

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri,
    }),
  });

  const data = await tokenRes.json();

  if (data.refresh_token) {
    res.status(200).send(`
      <html><body style="font-family:sans-serif;max-width:600px;margin:60px auto;">
        <h2>&#9989; &iexcl;Listo!</h2>
        <p>Copia este <b>refresh token</b> completo y guárdalo en Vercel como la variable de entorno
        <code>SPOTIFY_REFRESH_TOKEN</code> (Project &rarr; Settings &rarr; Environment Variables),
        luego pulsa "Redeploy".</p>
        <textarea style="width:100%;height:100px;font-size:14px;padding:10px;">${data.refresh_token}</textarea>
        <p>Después de guardarlo y volver a desplegar, ya puedes borrar esta página / no volver a usarla.</p>
      </body></html>
    `);
  } else {
    res.status(400).json(data);
  }
}
