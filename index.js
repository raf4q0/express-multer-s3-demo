const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configura AWS IAM - Accesso Programitico
const s3Client = new S3Client({
  region: 'us-east-1', // Ejemplo: 'us-east-1'
  credentials: {
    accessKeyId: 'ACCESS_KEY_ID',
    secretAccessKey: 'SECRET_ACCESS_KEY'
  },
});

// Configura Multer para almacenar archivos en S3
const upload = multer({
  storage: multer.memoryStorage(),
});

const app = express();
const port = 3000;

// Ruta para subir archivos
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  // Configura la metadata, acl y otros detalles del objeto en S3
  const params = {
    Bucket: 'NOMBRE_BUCKET',
    Key: Date.now().toString() + '-' + file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private',
  };

  try {
    // Sube el archivo a S3
    await s3Client.send(new PutObjectCommand(params));

    // Construye la URL pública del archivo
    // const url = `https://${params.Bucket}.s3.${s3Client.config.region}.amazonaws.com/${params.Key}`;

    res.json({ message: 'Archivo se cargó correctamente' });
  } catch (error) {
    console.error('Error al subir el archivo a S3:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
