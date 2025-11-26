import React, { useEffect, useCallback, useContext, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import db from './db';
import { apiClientes } from './api';
import { DataContext } from './store/DataContext';

export default function ClienteScreen({ dbType, voltar }) {
  const { clientes, setClientes, fetchClientes } = useContext(DataContext);
  const [lista, setLista] = useState(clientes || []);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  // mirror context changes into local state for rendering
  useEffect(() => {
    setLista(clientes || []);
  }, [clientes]);

  // Carregar clientes do Neon via API
  useEffect(() => {
    const loadData = async () => {
      console.log('[Cliente] Carregando dados do Neon via API...');
      try {
        const items = await apiClientes.list();
        console.log('[Cliente] Neon retornou:', items.length, 'itens');
        setClientes(items);
      } catch (error) {
        console.error('[Cliente] Erro ao carregar do Neon:', error.message);
        setClientes([]);
      }
    };

    loadData();
  }, []);

  const addItem = () => {
    console.log('[Cliente] addItem called', { nome, telefone });
    if (!nome.trim()) return alert('Nome obrigatório');
    if (!telefone.trim()) return alert('Telefone obrigatório');

    // Atualiza UI imediatamente
    const newItem = { id: Date.now(), nome, telefone };
    setClientes(prev => [...(prev || []), newItem]);
    
    const nomeToSave = nome;
    const telefoneToSave = telefone;
    
    setNome('');
    setTelefone('');

    // SINCRONIZAÇÃO DUPLA: Salvar em AMBOS os bancos
    console.log('[Cliente] Sincronizando em SQLite e PostgreSQL/Neon...');
    
    // 1. Salvar no SQLite local
    console.log('[Cliente] Iniciando salvamento no SQLite...');
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO clientes (nome, telefone) VALUES (?, ?);',
        [nomeToSave, telefoneToSave],
        () => {
          console.log('[Cliente] ✅ Salvo no SQLite local');
        },
        (_, error) => {
          console.error('[Cliente] ❌ Erro no SQLite:', error);
        }
      );
    });

    // 2. Salvar no PostgreSQL/Neon via API
    console.log('[Cliente] Iniciando salvamento no PostgreSQL/Neon via API...');
    console.log('[Cliente] Dados a enviar:', { nome: nomeToSave, telefone: telefoneToSave });
    
    apiClientes.add({ nome: nomeToSave, telefone: telefoneToSave })
      .then((response) => {
        console.log('[Cliente] ✅ Salvo no PostgreSQL/Neon');
        console.log('[Cliente] Resposta da API:', response);
      })
      .catch(error => {
        console.error('[Cliente] ❌ Erro no PostgreSQL/Neon:', error);
        console.error('[Cliente] Detalhes do erro:', error.message);
        if (error.response) {
          console.error('[Cliente] Response status:', error.response.status);
          console.error('[Cliente] Response data:', error.response.data);
        }
      });
  };

  useEffect(() => {
    // initial fetch handled in context provider; keep here if want to force
    // fetchClientes();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Cliente</Text>
      <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={styles.input} />
      <TextInput placeholder="Telefone" value={telefone} onChangeText={setTelefone} style={styles.input} keyboardType="phone-pad" />
      <Button title="Adicionar" onPress={addItem} />
      <Text style={styles.title}>Lista de Clientes</Text>
      <FlatList
        data={lista}
        keyExtractor={item => String(item.id || item._id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text>{item.telefone}</Text>
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
