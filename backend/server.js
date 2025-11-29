const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Configurar encoding UTF-8 para suporte a acentuação e caracteres especiais
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));
app.use(cors());

// Configuração do pool de conexões PostgreSQL (Neon)
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_KIqoXtZw4C6m@ep-ancient-dust-ah02ye3d-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  },
  // Garantir encoding UTF-8 para suporte a caracteres especiais
  client_encoding: 'UTF8'
});

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ PostgreSQL conectado (Neon)');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool PostgreSQL:', err);
});

app.get('/medicamentos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medicamentos ORDER BY id DESC');
    res.json(result.rows);
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
    const result = await pool.query(
      'INSERT INTO medicamentos (nome, descricao, preco) VALUES ($1, $2, $3) RETURNING *',
      [nome, descricao || '', Number(preco)]
    );
    res.json(result.rows[0]);
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
    const result = await pool.query(
      'UPDATE medicamentos SET nome = COALESCE($1, nome), descricao = COALESCE($2, descricao), preco = COALESCE($3, preco) WHERE id = $4 RETURNING *',
      [nome, descricao, preco !== undefined ? Number(preco) : null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medicamento não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar medicamento:', error);
    res.status(500).json({ message: 'Erro ao atualizar medicamento', error: error.message });
  }
});

app.delete('/medicamento/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM medicamentos WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
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
    const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(result.rows);
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
    const result = await pool.query(
      'INSERT INTO clientes (nome, telefone) VALUES ($1, $2) RETURNING *',
      [nome, telefone]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro ao criar cliente', error: error.message });
  }
});

app.put('/cliente/:id', async (req, res) => {
  try {
    const { nome, telefone } = req.body;
    const result = await pool.query(
      'UPDATE clientes SET nome = COALESCE($1, nome), telefone = COALESCE($2, telefone) WHERE id = $3 RETURNING *',
      [nome, telefone, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro ao atualizar cliente', error: error.message });
  }
});

app.delete('/cliente/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json({ message: 'Cliente deletado' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ message: 'Erro ao deletar cliente', error: error.message });
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
  console.log('Conectado ao PostgreSQL (Neon)');
});
