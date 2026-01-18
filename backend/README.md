# Backend (demo)

This is a minimal Express backend for the `habits-mobile` demo. It provides these endpoints:

- `GET /api/habits` — return habits array
- `POST /api/habits` — add a habit (body: `{ name, ... }`)
- `POST /api/toggle-habit` — toggle a habit (body: `{ name, done }`)
- `POST /api/delete-habit` — delete a habit (body: `{ name }`)

Quick local run:

```bash
cd backend
npm install
npm start
```

Deployment options (fastest for demo):

- Replit: create a new Replit, upload this folder, run `npm install` and `node index.js` — Replit gives a public URL.
- Vercel: you can deploy as a serverless function (requires small adjustments) or use a simple Node service on other hosts.
- Railway / Render: create a new Node service, push this repo; set `PORT` env if needed.

For a one-off demo I recommend Replit or a quick ngrok tunnel to a local server.

Déploiement rapide sur Replit

1. Crée un nouveau Repl (Node.js).  
2. Uploade le dossier `backend` (ou connecte ton dépôt GitHub).  
3. Dans l'onglet "Secrets" (Environment variables) ajoute `BACKEND_API_KEY` avec une clé simple (ex: `demo-key`) si tu veux protéger l'API.  
4. Lance `npm install` puis `npm start`. Replit utilisera `package.json` et démarrera `node index.js`.  
5. Utilise l'URL publique fournie par Replit, par ex `https://<your-repl>.repl.co/api/habits`.  

Tester l'API depuis ta machine :

```bash
curl -v https://<your-repl>.repl.co/api/habits
curl -v -H "x-api-key: demo-key" https://<your-repl>.repl.co/api/habits
```

Remarque : si tu veux éviter les pages de rappel de tunnel pour un test local, utilise un tunnel stable (Replit/Railway) ou envoie l'en‑tête `Bypass-Tunnel-Reminder: true` sur les requêtes vers certains services de tunnel.
