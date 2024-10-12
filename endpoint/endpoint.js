import express from 'express';
import { exec } from 'child_process';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';

const app = express();
const port = 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Obtener la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para almacenar el archivo en la carpeta "ImportedFiles"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'InjectorInput')); // Usar __dirname con path.join
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Obtener la extensión original del archivo
    cb(null, `file${ext}`); // Guardar con el nombre "file" y su extensión original (por ejemplo, "file.bpmn")
  }
});

const upload = multer({ storage });

// Ruta para subir el archivo
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se subió ningún archivo.');
  }
  res.send('Archivo subido con éxito.');
});

// Ruta para ejecutar el archivo JAR
app.get('/run-jar', (req, res) => {
  // Comando corregido
  const command = 'java -jar injectorExtractor.jar "file.bpmn" "inyector"';

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el archivo .jar: ${error.message}`);
      return res.status(500).send(`Error: ${error.message}`);
    }

    if (stderr) {
      console.error(`Error en la ejecución: ${stderr}`);
      return res.status(500).send(`Error: ${stderr}`);
    }

    console.log(`Salida del comando: ${stdout}`);
    // Ruta al archivo XMI generado en la carpeta "InjectorOutput"
    const xmiPath = path.join(__dirname, 'InjectorOutput/file.xmi');

    // Leer el archivo XMI y enviarlo como respuesta
    fs.readFile(xmiPath, 'utf8', (readError, data) => {
      if (readError) {
        console.error(`Error al leer el archivo XMI: ${readError.message}`);
        return res.status(500).send(`Error al leer el archivo XMI: ${readError.message}`);
      }
      res.send(data); // Enviar el contenido del archivo XMI como string
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
