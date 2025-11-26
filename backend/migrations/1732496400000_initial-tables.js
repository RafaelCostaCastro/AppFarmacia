/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Criar tabela medicamentos
  pgm.createTable('medicamentos', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    nome: {
      type: 'varchar(255)',
      notNull: true,
    },
    descricao: {
      type: 'text',
    },
    preco: {
      type: 'numeric(10, 2)',
      notNull: true,
      default: 0,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Criar tabela clientes
  pgm.createTable('clientes', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    nome: {
      type: 'varchar(255)',
      notNull: true,
    },
    telefone: {
      type: 'varchar(50)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Criar índices para melhorar performance
  pgm.createIndex('medicamentos', 'nome');
  pgm.createIndex('clientes', 'nome');
  pgm.createIndex('clientes', 'telefone');
};

exports.down = pgm => {
  pgm.dropTable('clientes');
  pgm.dropTable('medicamentos');
};
