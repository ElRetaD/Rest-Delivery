// Script pour vérifier la configuration de Google Maps API Key
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const envPath = join(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  
  const apiKeyMatch = envContent.match(/VITE_GOOGLE_MAPS_API_KEY=(.+)/);
  
  if (apiKeyMatch) {
    const apiKey = apiKeyMatch[1].trim();
    
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      console.log('❌ Google Maps API Key non configurée');
      console.log('\n📋 Pour configurer:');
      console.log('1. Obtenez votre clé depuis: https://console.cloud.google.com/google/maps-apis/credentials');
      console.log('2. Ouvrez rest-webs/.env');
      console.log('3. Remplacez "your_google_maps_api_key_here" par votre clé');
      console.log('4. Redémarrez le serveur (npm run dev)');
      process.exit(1);
    } else {
      console.log('✅ Google Maps API Key configurée');
      console.log(`   Clé: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 4)}`);
      console.log('\n💡 Si la carte ne s\'affiche pas:');
      console.log('   - Vérifiez que la clé est valide');
      console.log('   - Vérifiez que "Maps JavaScript API" est activée');
      console.log('   - Redémarrez le serveur après modification');
    }
  } else {
    console.log('❌ VITE_GOOGLE_MAPS_API_KEY non trouvée dans .env');
    process.exit(1);
  }
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('❌ Fichier .env non trouvé');
    console.log('\n📋 Pour créer le fichier:');
    console.log('1. Copiez env.example vers .env');
    console.log('2. Ajoutez votre clé API Google Maps');
  } else {
    console.error('❌ Erreur:', error.message);
  }
  process.exit(1);
}

