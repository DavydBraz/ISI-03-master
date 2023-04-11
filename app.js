const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const methodOverride = require('method-override')
const app = express();
const cors = require('cors');


// Configuração do servidor
app.use(cors({
  origin: '*',
  methods: 'GET,PUT,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization'
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // adicionado para aceitar requisições no formato JSON
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'))

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).send({ message: 'JSON inválido' });
  }
  next();
});

// Configuração do servidor
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'))

// Configuração do banco de dados
const pool = new Pool({
  user: 'postgres',
  password: 'De1a8',
  host: 'localhost',
  database: 'celulares',
  port: 5432,
});

// Rota principal
app.get('/', (req, res) => {
  pool.query('SELECT * FROM celulares', (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(results.rows);
  });
});

// Rota para atualizar um celular existente
app.put('/celulares/:id', (req, res, next) => {
  const id = req.params.id;
  const celular = req.body;
  const sql = 'UPDATE celulares SET nome = $1, valor = $2, imagem =$3, especificacao = $4 WHERE id = $5';
  const values = [celular.nome, celular.valor, celular.imagem, celular.especificacao, id]
  console.log(sql, values); // imprime a consulta e os valores
  pool.query(sql, values, (error, results) => {
    if (error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(200).json({ message: `Celular com id ${id} atualizado com sucesso` });
    }
  });
});

// Rota para excluir um celular
app.delete('/celulares/:id', (req, res, next) => {
  const id = req.params.id;
  pool.query('DELETE FROM celulares WHERE id = $1', [id], (error, results) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({ message: `Celular com id ${id} excluído com sucesso.` });
    }
  });
});

// Rota para adicionar um novo celular
app.post('/celulares', (req, res, next) => {
  const celular = req.body;
  if (!celular.nome || !celular.valor || !celular.imagem || !celular.especificacao) {
    res.status(400).json({ message: 'Os campos nome, valor, imagem e especificação são obrigatórios' });
    return;
  }
  const sql = 'INSERT INTO celulares (nome, valor, imagem, especificacao) VALUES ($1, $2, $3, $4)';
  const values = [celular.nome, celular.valor, celular.imagem, celular.especificacao];
  pool.query(sql, values, (error, results) => {
    if (error) {
      next(error);
    } else {
      res.status(201).json({ message: `Celular adicionado com sucesso.` });
    }
  });
});
  
  // Middleware para lidar com erros
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor' });
  });
  
  // Inicia o servidor
  app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
  });
