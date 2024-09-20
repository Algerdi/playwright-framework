export default {
  pages: {
    root: '/',
    login: {
      name: 'login',
      url: '/#/login',
      successElement: 'loginFormHeader'
    },
    todos: {
      name: 'todos',
      url: '/#/todos',
      successElement: 'toDoHeader'
    },
    todosAfterLoggin: {
      name: 'todos',
      url: '/#/',
      successElement: 'toDoHeader'
    }
  },
}
