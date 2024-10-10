const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notaSchema = new Schema({
  usuario: String,
  context: String,
  process: String
});

// Convertir a modelo
const Nota = mongoose.model('datafiles', notaSchema);
// Exportación de Nota
module.exports = Nota;