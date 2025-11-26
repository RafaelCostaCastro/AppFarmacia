import React, { useEffect, useCallback, useContext, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import db from './db';
import { apiMedicamentos } from './api';
import { DataContext } from './store/DataContext';

export default function MedicamentoScreen({ dbType, voltar }) {
  const { medicamentos, setMedicamentos, fetchMedicamentos } = useContext(DataContext);
  const [lista, setLista] = useState(medicamentos || []);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');

  // when context medicamentos change, mirror to local state for rendering
  useEffect(() => {
    setLista(medicamentos || []);
  }, [medicamentos]);

  // Carregar medicamentos do Neon via API
  useEffect(() => {
    const loadData = async () => {
      console.log('[Medicamento] Carregando dados do Neon via API...');
      try {
        const items = await apiMedicamentos.list();
        console.log('[Medicamento] Neon retornou:', items.length, 'itens');
        setMedicamentos(items);
      } catch (error) {
        console.error('[Medicamento] Erro ao carregar do Neon:', error.message);
        setMedicamentos([]);
      }
    };

    loadData();
  }, []);

  const addItem = () => {
    console.log('[Medicamento] addItem called', { nome, descricao, preco });
    if (!nome.trim()) return alert('Nome obrigatório');
    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum < 0) return alert('Preço inválido');

    // Atualiza UI imediatamente
    const newItem = { id: Date.now(), nome, descricao, preco: precoNum };
    setMedicamentos(prev => [...(prev || []), newItem]);
    
    const nomeToSave = nome;
    const descricaoToSave = descricao;
    const precoToSave = precoNum;
    
    setNome('');
    setDescricao('');
    setPreco('');

    // SINCRONIZAÇÃO DUPLA: Salvar em AMBOS os bancos
    console.log('[Medicamento] Sincronizando em SQLite e PostgreSQL/Neon...');
    
    // 1. Salvar no SQLite local
    console.log('[Medicamento] Iniciando salvamento no SQLite...');
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO medicamentos (nome, descricao, preco) VALUES (?, ?, ?);',
        [nomeToSave, descricaoToSave, precoToSave],
        () => {
          console.log('[Medicamento] ✅ Salvo no SQLite local');
        },
        (_, error) => {
          console.error('[Medicamento] ❌ Erro no SQLite:', error);
        }
      );
    });

    // 2. Salvar no PostgreSQL/Neon via API
    console.log('[Medicamento] Iniciando salvamento no PostgreSQL/Neon via API...');
    console.log('[Medicamento] Dados a enviar:', { nome: nomeToSave, descricao: descricaoToSave, preco: precoToSave });
    
    apiMedicamentos.add({ nome: nomeToSave, descricao: descricaoToSave, preco: precoToSave })
      .then((response) => {
        console.log('[Medicamento] ✅ Salvo no PostgreSQL/Neon');
        console.log('[Medicamento] Resposta da API:', response);
      })
      .catch(error => {
        console.error('[Medicamento] ❌ Erro no PostgreSQL/Neon:', error);
        console.error('[Medicamento] Detalhes do erro:', error.message);
        if (error.response) {
          console.error('[Medicamento] Response status:', error.response.status);
          console.error('[Medicamento] Response data:', error.response.data);
        }
      });
  };

  // fetchMedicamentos is handled by DataProvider; no local fetch needed here

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Medicamento</Text>
      <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={styles.input} />
      <TextInput placeholder="Descrição" value={descricao} onChangeText={setDescricao} style={styles.input} />
      <TextInput placeholder="Preço" value={preco} onChangeText={setPreco} style={styles.input} keyboardType="decimal-pad" />
      <Button title="Adicionar" onPress={addItem} />
      <Text style={styles.title}>Lista de Medicamentos</Text>
      <FlatList
        data={lista}
        keyExtractor={item => String(item.id || item._id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nome}>
              {item.nome} - R$ {item.preco ? Number(item.preco).toFixed(2) : '0.00'}
            </Text>
            <Text>{item.descricao || ''}</Text>
          </View>
        )}
      />
      <View style={styles.bottomButton}>
        <TouchableOpacity style={styles.voltarButton} onPress={voltar}>
          <Text style={styles.voltarButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, flex: 1 },
  title: { fontWeight: 'bold', marginVertical: 10, fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#aaa', marginBottom: 10, padding: 8, borderRadius: 4 },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  nome: { fontWeight: 'bold' },
  bottomButton: { paddingVertical: 15, marginTop: 10 },
  voltarButton: { 
    backgroundColor: '#90EE90', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  voltarButtonText: { 
    color: '#000', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});
