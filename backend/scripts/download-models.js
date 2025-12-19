const https = require('https');
const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, '..', 'models');
const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const models = [
  // SSD MobileNet V1
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  
  // Face Landmark 68
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  
  // Face Recognition
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
];

// Crear directorio de modelos
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
  console.log('✅ Directorio de modelos creado');
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Error al descargar: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Eliminar archivo incompleto
      reject(err);
    });
  });
}

async function downloadModels() {
  console.log('========================================');
  console.log('DESCARGANDO MODELOS DE FACE-API');
  console.log('========================================\n');
  
  for (let i = 0; i < models.length; i++) {
    const modelFile = models[i];
    const url = `${BASE_URL}/${modelFile}`;
    const dest = path.join(MODELS_DIR, modelFile);
    
    console.log(`[${i + 1}/${models.length}] Descargando ${modelFile}...`);
    
    try {
      await downloadFile(url, dest);
      console.log(`✅ ${modelFile} descargado\n`);
    } catch (error) {
      console.error(`❌ Error descargando ${modelFile}:`, error.message);
      process.exit(1);
    }
  }
  
  console.log('========================================');
  console.log('✅ TODOS LOS MODELOS DESCARGADOS');
  console.log('========================================');
}

downloadModels().catch(console.error);