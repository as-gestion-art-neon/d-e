# D&E – Site vitrine

Site statique (HTML/CSS/JS, sans dépendance) servi par Nginx dans un conteneur Docker.
Trois sections — **Démoussage**, **Élagage**, **Désinsectisation** — chacune avec son propre carrousel de photos (défilement automatique, flèches, points, clavier, swipe mobile).

```
.
├── docker-compose.yml   # stack à déployer dans Portainer
├── Dockerfile           # image nginx:alpine + site
├── nginx.conf           # gzip, cache, en-têtes, /health
└── site/
    ├── index.html
    ├── css/style.css
    ├── js/main.js
    └── img/             # logo + photos du carrousel
```

## Tester en local

```bash
docker compose up -d --build
# -> http://localhost:8080
```

## 1. Publier sur GitHub

```bash
git init
git add .
git commit -m "Site vitrine D&E"
git branch -M main
git remote add origin https://github.com/<votre-compte>/de-vitrine.git
git push -u origin main
```

## 2. Déployer avec Portainer

1. **Stacks → Add stack**
2. Nom : `de-vitrine`
3. Build method : **Repository**
4. Repository URL : `https://github.com/<votre-compte>/de-vitrine`
5. Repository reference : `refs/heads/main`
6. Compose path : `docker-compose.yml`
7. Dépôt privé : activer **Authentication** (utilisateur GitHub + *Personal Access Token* avec droit `repo` en lecture).
8. (Optionnel) **Environment variables** : `SITE_PORT` = port exposé sur l'hôte (défaut `8080`).
9. (Optionnel) **GitOps updates** : activer *Automatic updates* (polling, ex. `5m`) et cocher *Re-pull image / Force redeployment* pour reconstruire à chaque push.
10. **Deploy the stack**

Le site est alors disponible sur `http://<ip-du-serveur>:8080`.

### Derrière un reverse proxy (Traefik, Nginx Proxy Manager…)

Supprimez la section `ports` et rattachez le service au réseau du proxy, par exemple pour Traefik :

```yaml
services:
  site:
    build: .
    restart: unless-stopped
    networks: [proxy]
    labels:
      - traefik.enable=true
      - traefik.http.routers.de.rule=Host(`www.votre-domaine.fr`)
      - traefik.http.routers.de.entrypoints=websecure
      - traefik.http.routers.de.tls.certresolver=letsencrypt
      - traefik.http.services.de.loadbalancer.server.port=80
networks:
  proxy:
    external: true
```

## Modifier le contenu

- **Photos d'un carrousel** : déposer l'image dans `site/img/` puis ajouter un bloc dans le `.carousel__track` de la section voulue de `index.html` (`#demoussage`, `#elagage` ou `#desinsectisation`) :
  ```html
  <figure class="slide" data-caption="Légende affichée">
    <img src="img/ma-photo.jpg" alt="Description" loading="lazy">
  </figure>
  ```
  Conseil : largeur max ~1600 px, JPEG qualité 80.
- **Téléphone / e-mail** : rechercher `0646926988` / `valentinligaud@gmail.com` dans `index.html`.
- **Couleurs** : variables en haut de `site/css/style.css`.
- **Frelon animé** : `site/js/critters.js` (`CATCH_AFTER` = délai avant capture en secondes, `BEES` = nombre d'abeilles). Pour le désactiver, retirer la ligne `<script src="js/critters.js" defer></script>` de `index.html`. L'animation est automatiquement coupée pour les visiteurs ayant activé « réduire les animations ».

Après un `git push`, redéployez la stack dans Portainer (*Pull and redeploy*) ou laissez la mise à jour automatique GitOps s'en charger.
