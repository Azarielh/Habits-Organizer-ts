# Déployer sur Replit

Guide rapide pour exposer ce backend via Replit (public et stable) :

1. Crée un nouveau Repl -> choisis "Node.js".
2. Upload le contenu du dossier `backend` ou connecte ton dépôt GitHub contenant ce dossier.
3. Dans Settings -> Secrets, ajoute `BACKEND_API_KEY` (optionnel) pour protéger l'API.
4. Dans Shell, exécute :

```bash
npm install
npm start
```

5. Replit fournit une URL publique, par ex `https://your-repl.repl.co`. Teste :

```bash
curl -H "x-api-key: YOUR_KEY" https://your-repl.repl.co/api/habits
```

Astuce : tu peux personnaliser le run command en créant un fichier `.replit` (inclus ici).
