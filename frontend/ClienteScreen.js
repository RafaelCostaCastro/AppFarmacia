import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import db from './db';
import { apiClientes } from './api';

export default function ClienteScreen({ dbType, voltar }) {
  const [lista, setLista] = useState([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  const fetchData = useCallback(() => {
    if (dbType === 'mongodb') {
      apiClientes.list()
        .then(setLista)
        .catch(error => {
          console.error('Erro ao buscar clientes:', error);
          alert('Erro ao buscar clientes: ' + error.message);
        });
    } else {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM clientes;',
          [],
          (_, { rows: { _array } }) => setLista(_array),
          (_, error) => {
            console.error('Erro ao buscar clientes:', error);
            alert('Erro ao buscar clientes do banco local');
          }
        );
      });
    }
  }, [dbType]);

  const addItem = () => {
    if (!nome.trim()) return alert('Nome obrigatório');
    if (!telefone.trim()) return alert('Telefone obrigatório');

    if (dbType === 'mongodb') {
      apiClientes.add({ nome, telefone })
        .then(() => {
          fetchData();
          setNome('');
          setTelefone('');
        })
        .catch(error => {
          console.error('Erro ao adicionar cliente:', error);
          alert('Erro ao adicionar cliente: ' + error.message);
        });
    } else {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO clientes (nome, telefone) VALUES (?, ?);',
          [nome, telefone],
          () => {
            fetchData();
            setNome('');
            setTelefone('');
          },
          (_, error) => {
            console.error('Erro ao adicionar cliente:', error);
            alert('Erro ao adicionar cliente ao banco local');
          }
        );
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <View style={styles.container}>
      <Button title="Voltar" onPress={voltar} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, flex: 1 },
  title: { fontWeight: 'bold', marginVertical: 10, fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#aaa', marginBottom: 10, padding: 8, borderRadius: 4 },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  nome: { fontWeight: 'bold' },
});
