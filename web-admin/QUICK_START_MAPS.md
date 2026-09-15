# 🗺️ Démarrage Rapide - Google Maps

## ✅ Vérification rapide

Exécutez cette commande pour vérifier si votre clé API est configurée:

```bash
npm run check:maps
```

## 🚀 Configuration en 3 étapes

### 1️⃣ Obtenir la clé API (2 minutes)

1. Allez sur: **https://console.cloud.google.com/google/maps-apis/credentials**
2. Créez un projet (ou utilisez un existant)
3. Activez **"Maps JavaScript API"**
4. Créez une **"Clé API"**
5. **Copiez la clé**

### 2️⃣ Ajouter la clé dans le projet

1. Ouvrez le fichier: `rest-webs/.env`
2. Trouvez cette ligne:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```
3. Remplacez `your_google_maps_api_key_here` par votre clé (sans espaces)

### 3️⃣ Redémarrer le serveur

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer:
npm run dev
```

## ✅ Vérification

Après redémarrage, allez sur la page **"Carte"** - la carte devrait s'afficher! 🎉

## 🔍 Dépannage

### La carte ne s'affiche pas?

1. **Vérifiez la console du navigateur** (F12) pour voir les erreurs
2. **Vérifiez que la clé est correcte**: `npm run check:maps`
3. **Vérifiez que "Maps JavaScript API" est activée** dans Google Cloud Console
4. **Vérifiez les restrictions** de la clé (doit inclure `localhost:5174`)

### Erreur "API key not valid"?

- Vérifiez que la clé est correctement copiée (sans espaces)
- Vérifiez que "Maps JavaScript API" est activée
- Attendez quelques minutes (la clé peut prendre du temps à être activée)

## 📚 Documentation complète

- **Français**: `GOOGLE_MAPS_SETUP.md`
- **العربية**: `GOOGLE_MAPS_SETUP_AR.md`

## 💰 Coût

**Gratuit**: $200 de crédit par mois (28,000 chargements de carte)

---

**Besoin d'aide?** Vérifiez les fichiers de documentation ou la console du navigateur pour plus de détails.

