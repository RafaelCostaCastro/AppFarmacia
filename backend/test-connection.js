const mongoose = require('mongoose');

// String de conexão MongoDB
const mongoURI = 'mongodb+srv://rafaelcastro2_db_user:XmIMc1GCg0gWNAZ3@farmacia.6y8ri0b.mongodb.net/farmacia?appName=farmacia';

console.log('🔌 Testando conexão com MongoDB...');
console.log('📍 URI:', mongoURI.replace(/:[^:@]+@/, ':****@')); // Oculta a senha no log

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('✅ MongoDB conectado com sucesso!');
    
    // Testa se consegue listar os bancos de dados
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('📊 Bancos de dados disponíveis:', dbs.databases.map(db => db.name).join(', '));
    
    // Verifica se o banco 'farmacia' existe
    const farmaciaExists = dbs.databases.some(db => db.name === 'farmacia');
    if (farmaciaExists) {
      console.log('✅ Banco de dados "farmacia" encontrado!');
    } else {
      console.log('⚠️  Banco de dados "farmacia" não encontrado (será criado automaticamente na primeira operação)');
    }
    
    // Testa as coleções
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📁 Coleções existentes:', collections.length > 0 ? collections.map(c => c.name).join(', ') : 'Nenhuma');
    
    // Testa criar um modelo e fazer uma operação simples
    const TestSchema = new mongoose.Schema({
      test: String,
      timestamp: { type: Date, default: Date.now }
    });
    const Test = mongoose.model('Test', TestSchema);
    
    // Testa inserção
    const testDoc = new Test({ test: 'conexao_teste' });
    await testDoc.save();
    console.log('✅ Teste de inserção: OK');
    
    // Testa leitura
    const found = await Test.findOne({ test: 'conexao_teste' });
    if (found) {
      console.log('✅ Teste de leitura: OK');
    }
    
    // Testa atualização
    await Test.updateOne({ test: 'conexao_teste' }, { test: 'conexao_teste_atualizado' });
    console.log('✅ Teste de atualização: OK');
    
    // Limpa o documento de teste
    await Test.deleteOne({ test: 'conexao_teste_atualizado' });
    console.log('✅ Teste de exclusão: OK');
    
    // Testa os modelos do projeto
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
    
    const medicamentoCount = await Medicamento.countDocuments();
    const clienteCount = await Cliente.countDocuments();
    
    console.log('📊 Estatísticas:');
    console.log(`   - Medicamentos: ${medicamentoCount}`);
    console.log(`   - Clientes: ${clienteCount}`);
    
    console.log('\n🎉 Todos os testes de conexão passaram!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erro ao conectar com MongoDB:', err.message);
    if (err.message.includes('authentication failed')) {
      console.error('💡 Verifique se o usuário e senha estão corretos');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('💡 Verifique sua conexão com a internet');
    } else if (err.message.includes('timeout')) {
      console.error('💡 O servidor MongoDB pode estar inacessível ou o IP não está na whitelist');
    }
    process.exit(1);
  });

// Timeout de segurança
setTimeout(() => {
  console.error('❌ Timeout: A conexão demorou mais de 10 segundos');
  process.exit(1);
}, 10000);
