La P'tite Crêperie — Site statique

Instructions rapides:

1) Tester en local

```powershell
cd "C:\Users\PC\Downloads\la-ptite-creperie"
# with Node (recommended)
npx http-server
# or with Python
python -m http.server 8080
```

2) Initialiser le dépôt Git local

```bash
git init
git add .
git commit -m "Initial commit: site La P'tite Crêperie"
```

3) Créer un repo GitHub et pousser

- Crée un repo sur GitHub (via l'interface)
- Puis:

```bash
git remote add origin git@github.com:TON_UTILISATEUR/NOM_REPO.git
git branch -M main
git push -u origin main
```

4) Déployer sur Vercel

- Connecte ton compte Vercel à GitHub (tu as dit qu'ils sont liés)
- Dans Vercel, importe le repo et clique sur "Deploy"
- Par défaut, Vercel détecte un site statique et déploie automatiquement

5) Remarques

- Utilise HTTPS pour que les APIs de partage fonctionnent pleinement sur mobile.
- Vérifie les images et droits d'utilisation.
