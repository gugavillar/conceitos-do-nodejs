const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const isExists = users.some(user => user.username === username);

  if (!isExists) {
    return response.status(404).json({ error: 'User not exists' });
  }
  request.username = username;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const isExists = users.some(user => user.username === username);
  if (isExists) {
    return response.status(400).json({ error: 'User already exists' });
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const todosUser = users.find(user => user.username === username);
  return response.json(todosUser.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const todosUser = users.find(user => user.username === username);
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };
  todosUser.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  const findUser = users.find(user => user.username === username);
  const findTodo = findUser.todos.find(todo => todo.id === id);
  if (!findTodo) {
    return response.status(404).json({ error: 'Not found' });
  }
  findTodo.title = title;
  findTodo.deadline = new Date(deadline);
  return response.status(201).json(findTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const findUser = users.find(user => user.username === username);
  const findTodo = findUser.todos.find(todo => todo.id === id);
  if (!findTodo) {
    return response.status(404).json({ error: 'Not found' });
  }
  findTodo.done = true;
  return response.status(201).json(findTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const findUser = users.find(user => user.username === username);
  const findTodo = findUser.todos.find(todo => todo.id === id);
  if (!findTodo) {
    return response.status(404).json({ error: 'Not found' });
  }
  findUser.todos.splice(findTodo, 1);
  return response.status(204).send();
});

module.exports = app;