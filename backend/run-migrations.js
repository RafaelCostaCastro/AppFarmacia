const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_KIqoXtZw4C6m@ep-ancient-dust-ah02ye3d-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migrations...');
    
    // Criar tabela medicamentos
    await client.query(`
      CREATE TABLE IF NOT EXISTS medicamentos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        preco NUMERIC(10, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela medicamentos criada');
    
    // Criar tabela clientes
    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        telefone VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela clientes criada');
    
    // Criar índices
    await client.query('CREATE INDEX IF NOT EXISTS idx_medicamentos_nome ON medicamentos(nome)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone)');
    console.log('✅ Índices criados');
    
    console.log('\n🎉 Migrations executadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
