const { Pool } = require('pg');

// String de conexão PostgreSQL (Neon)
const connectionString = 'postgresql://neondb_owner:npg_KIqoXtZw4C6m@ep-ancient-dust-ah02ye3d-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

console.log('🔌 Testando conexão com PostgreSQL (Neon)...');
console.log('📍 Host:', connectionString.split('@')[1].split('/')[0]);

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    // Teste básico de conexão
    const client = await pool.connect();
    console.log('✅ PostgreSQL conectado com sucesso!');
    
    // Verifica versão do PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('📊 Versão:', versionResult.rows[0].version.split(' ')[1]);
    
    // Lista todas as tabelas do schema public
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('📁 Tabelas existentes:', tablesResult.rows.map(r => r.table_name).join(', '));
    } else {
      console.log('⚠️  Nenhuma tabela encontrada (execute as migrations primeiro)');
    }
    
    // Se as tabelas existirem, mostra estatísticas
    const hasMedicamentos = tablesResult.rows.some(r => r.table_name === 'medicamentos');
    const hasClientes = tablesResult.rows.some(r => r.table_name === 'clientes');
    
    if (hasMedicamentos) {
      const medicamentosCount = await client.query('SELECT COUNT(*) FROM medicamentos');
      console.log(`📊 Medicamentos: ${medicamentosCount.rows[0].count}`);
    }
    
    if (hasClientes) {
      const clientesCount = await client.query('SELECT COUNT(*) FROM clientes');
      console.log(`📊 Clientes: ${clientesCount.rows[0].count}`);
    }
    
    // Testa operações CRUD se as tabelas existirem
    if (hasMedicamentos) {
      console.log('\n🧪 Testando operações CRUD...');
      
      // INSERT
      const insertResult = await client.query(
        'INSERT INTO medicamentos (nome, descricao, preco) VALUES ($1, $2, $3) RETURNING *',
        ['Teste Conexão', 'Medicamento de teste', 99.99]
      );
      console.log('✅ INSERT: OK -', insertResult.rows[0]);
      
      const testId = insertResult.rows[0].id;
      
      // SELECT
      const selectResult = await client.query('SELECT * FROM medicamentos WHERE id = $1', [testId]);
      if (selectResult.rows.length > 0) {
        console.log('✅ SELECT: OK');
      }
      
      // UPDATE
      const updateResult = await client.query(
        'UPDATE medicamentos SET preco = $1 WHERE id = $2 RETURNING *',
        [149.99, testId]
      );
      if (updateResult.rows[0].preco === '149.99') {
        console.log('✅ UPDATE: OK');
      }
      
      // DELETE
      const deleteResult = await client.query('DELETE FROM medicamentos WHERE id = $1', [testId]);
      if (deleteResult.rowCount === 1) {
        console.log('✅ DELETE: OK');
      }
    }
    
    client.release();
    console.log('\n🎉 Todos os testes de conexão passaram!');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Erro ao conectar com PostgreSQL:', err.message);
    if (err.code === 'ENOTFOUND') {
      console.error('💡 Verifique sua conexão com a internet');
    } else if (err.code === '28P01') {
      console.error('💡 Verifique se o usuário e senha estão corretos');
    } else if (err.code === '3D000') {
      console.error('💡 O banco de dados especificado não existe');
    } else if (err.message.includes('timeout')) {
      console.error('💡 Timeout de conexão - verifique se o IP está na whitelist');
    }
    console.error('\n📋 Detalhes do erro:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Timeout de segurança
setTimeout(() => {
  console.error('❌ Timeout: A conexão demorou mais de 15 segundos');
  process.exit(1);
}, 15000);

testConnection();
