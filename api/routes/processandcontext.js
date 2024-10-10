const express = require('express');
const router = express.Router();

// importar el modelo nota
const rulesTask =  require('../models/processandcontext');

// Obtener
router.get('/getprocessandcontext', async(req, res) => {
  try {
    const notaDB = await rulesTask.find();
    res.json(notaDB);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Agregar un nuevo
router.post('/postprocessandcontext', async(req, res) => {
  const body = req.body;  
  console.log(body);
  try {
    const notaDB = await rulesTask.create(body);
    res.status(200).json(notaDB); 
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Exportación de router
module.exports = router;