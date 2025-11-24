import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import db from './db';
import { apiMedicamentos } from './api';

export default function MedicamentoScreen({ dbType, voltar }) {
  const [lista, setLista] = useState([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');

  const fetchData = useCallback(() => {
    if (dbType === 'mongodb') {
      apiMedicamentos.list()
        .then(setLista)
        .catch(error => {
          console.error('Erro ao buscar medicamentos:', error);
          alert('Erro ao buscar medicamentos: ' + error.message);
        });
    } else {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM medicamentos;',
          [],
          (_, { rows: { _array } }) => setLista(_array),
          (_, error) => {
            console.error('Erro ao buscar medicamentos:', error);
            alert('Erro ao buscar medicamentos do banco local');
          }
        );
      });
    }
  }, [dbType]);

  const addItem = () => {
    if (!nome.trim()) return alert('Nome obrigatório');
    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum < 0) return alert('Preço inválido');

    if (dbType === 'mongodb') {
      apiMedicamentos.add({ nome, descricao, preco: precoNum })
        .then(() => {
          fetchData();
          setNome('');
          setDescricao('');
          setPreco('');
        })
        .catch(error => {
          console.error('Erro ao adicionar medicamento:', error);
          alert('Erro ao adicionar medicamento: ' + error.message);
        });
    } else {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO medicamentos (nome, descricao, preco) VALUES (?, ?, ?);',
          [nome, descricao, precoNum],
          () => {
            fetchData();
            setNome('');
            setDescricao('');
            setPreco('');
          },
          (_, error) => {
            console.error('Erro ao adicionar medicamento:', error);
            alert('Erro ao adicionar medicamento ao banco local');
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
