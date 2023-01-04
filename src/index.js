const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => username === user.username);

  if (!user) {
    response.status(404).json({error: 'User not found'});
  }

  request.user = user;

  next();

}

function checksExistsTodo(request, response, next) {
  const { id } = request.params;
  
  const user = users.find(
    (user)=>{
      return user.todos.find(todo => todo.id == id)
    }
  )
    
  if (!user) {
    response.status(404).json({error: 'Todo not found'});
  }

  const todo = user.todos.find(todo => todo.id == id)

  request.todo = todo;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const userAlreadyExists = users.some(user => username === user.username);
  if (userAlreadyExists) {
    return response.status(400).json({error: 'Username already exists'})
  }
  
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);
  
  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTask = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(newTask);

  return response.status(201).json(newTask);
});

app.put('/todos/:id', checksExistsTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;
  console.log(todo);
  // const todos = user.todos.map((td) => {
  //   if (td.id === todo.id){
  //     td.title = title;
  //     td.deadline = new Date(deadline);
  //   }
  //   return td;
  // });
    
  todo.title = title;
  todo.deadline = deadline;
  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsTodo, (request, response) => {
  const { todo } = request;

  const user = users.find((user)=>{
    return user.todos.find(td => td.id == todo.id)
  })
  
  user.todos.splice(user.todos.findIndex(td => td.id === todo.id), 1);
  
  return response.status(204).json(user.todos);
});

module.exports = app;