# Velora Beauty

Boutique vitrine de cosmétiques, 100 % statique (HTML / CSS / JS), responsive, déployable sur Vercel et migrable vers Shopify.

## Lancer en local

```bash
npx serve .
```

## Structure

- `index.html` : accueil + catalogue (filtres, tri, pastilles de teintes)
- `product.html?handle=…` : fiche produit (teintes, quantité, panier)
- `data/products.json` : **catalogue**, calqué sur le modèle Shopify (handle, title, vendor, type, tags, variantes/teintes, prix, prix barré)
- `js/art.js` : visuels produits en SVG (à remplacer par de vraies photos)
- `scripts/export-shopify.mjs` : génère l'import Shopify

## Passer sur Shopify

1. `node scripts/export-shopify.mjs https://url-de-vos-photos` génère `shopify/products.csv`
2. Shopify admin → Produits → Importer → choisir le CSV
3. Les visuels SVG ne sont pas acceptés par Shopify : ajoutez de vraies photos (nommées `<handle>.jpg`) puis relancez l'export avec leur URL de base, ou ajoutez-les à la main
4. Thème : partir de Dawn et reprendre `css/style.css` (couleurs dans `:root`) ; les sections (hero, USP, grille, bannière promo) correspondent à des sections de thème

## Déploiement

Push sur GitHub, import du dépôt dans Vercel (aucun build, dossier racine).
