const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const MedicamentoSchema = new mongoose.Schema({
  nome: String,
  descricao: String,
  preco: Number,
});
const ClienteSchema = new mongoose.Schema({
  nome: String,
  telefone: String,
});

const Medicamento = mongoose.model('Medicamento', MedicamentoSchema);
const Cliente = mongoose.model('Cliente', ClienteSchema);

app.get('/medicamentos', async (req, res) => {
  try {
    res.json(await Medicamento.find());
  } catch (error) {
    console.error('Erro ao buscar medicamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar medicamentos', error: error.message });
  }
});

app.post('/medicamento', async (req, res) => {
  try {
    const { nome, descricao, preco } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }
    if (preco === undefined || preco === null || isNaN(preco) || preco < 0) {
      return res.status(400).json({ message: 'Preço inválido' });
    }
    const novo = new Medicamento({ nome, descricao, preco: Number(preco) });
    await novo.save();
    res.json(novo);
  } catch (error) {
    console.error('Erro ao criar medicamento:', error);
    res.status(500).json({ message: 'Erro ao criar medicamento', error: error.message });
  }
});

app.put('/medicamento/:id', async (req, res) => {
  try {
    const { nome, descricao, preco } = req.body;
    if (preco !== undefined && (isNaN(preco) || preco < 0)) {
      return res.status(400).json({ message: 'Preço inválido' });
    }
    const atualizado = await Medicamento.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!atualizado) {
      return res.status(404).json({ message: 'Medicamento não encontrado' });
    }
    res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar medicamento:', error);
    res.status(500).json({ message: 'Erro ao atualizar medicamento', error: error.message });
  }
});

app.delete('/medicamento/:id', async (req, res) => {
  try {
    const deletado = await Medicamento.findByIdAndDelete(req.params.id);
    if (!deletado) {
      return res.status(404).json({ message: 'Medicamento não encontrado' });
    }
    res.json({ message: 'Medicamento deletado' });
  } catch (error) {
    console.error('Erro ao deletar medicamento:', error);
    res.status(500).json({ message: 'Erro ao deletar medicamento', error: error.message });
  }
});

app.get('/clientes', async (req, res) => {
  try {
    res.json(await Cliente.find());
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ message: 'Erro ao buscar clientes', error: error.message });
  }
});

app.post('/cliente', async (req, res) => {
  try {
    const { nome, telefone } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }
    if (!telefone || !telefone.trim()) {
      return res.status(400).json({ message: 'Telefone é obrigatório' });
    }
    const novo = new Cliente({ nome, telefone });
    await novo.save();
    res.json(novo);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro ao criar cliente', error: error.message });
  }
});

app.put('/cliente/:id', async (req, res) => {
  try {
    const atualizado = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!atualizado) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro ao atualizar cliente', error: error.message });
  }
});

app.delete('/cliente/:id', async (req, res) => {
  try {
    const deletado = await Cliente.findByIdAndDelete(req.params.id);
    if (!deletado) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json({ message: 'Cliente deletado' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ message: 'Erro ao deletar cliente', error: error.message });
  }
});

// String de conexão MongoDB com appName
const mongoURI = 'mongodb+srv://rafaelcastro2_db_user:XmIMc1GCg0gWNAZ3@farmacia.6y8ri0b.mongodb.net/farmacia?appName=farmacia';


mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(3000, () => console.log('Backend rodando na porta 3000'));
  })
  .catch(err => console.error('Erro no MongoDB:', err));
