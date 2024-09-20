import { test } from '@playwright/test'
import { TodoPage } from '../Pages/TodoPage.page'

let TodoPageInstance: TodoPage

for (const user of ['johnd', 'admin']) {
  test.describe.serial(`as ${user} user`, () => {
    test.use({ storageState: `playwright/.auth/${user}.json` })

    test.beforeAll(async () => {
      await TodoPage.deleteDefaultTasksByUser(user)
    })

    test.beforeEach(async ({ page, request }) => {
      TodoPageInstance = new TodoPage(page, request, `../playwright/.auth/${user}.json`)
    })

    test(`can create and delete tasks`, async () => {
      await TodoPageInstance.goToPage('todos')

      await TodoPageInstance.enterTaskTitle('String from Add button')

      await TodoPageInstance.clickButton('Add todo')

      await TodoPageInstance.newlyCreatedTaskExist('String from Add button')

      await TodoPageInstance.correctNumberOfTasksInTable()

      await TodoPageInstance.enterTaskTitle('String from Enter key')

      await TodoPageInstance.pressEnter()

      await TodoPageInstance.newlyCreatedTaskExist('String from Enter key')

      await TodoPageInstance.correctNumberOfTasksInTable()

      // need to reload the page because tasks appear after they are deleted
      await TodoPageInstance.page.reload()

      await TodoPageInstance.deleteTaskByTitle('String from Add button')

      await TodoPageInstance.correctNumberOfTasksInTable()

      await TodoPageInstance.deleteTaskByTitle('String from Enter key')

      await TodoPageInstance.correctNumberOfTasksInTable()
    })

    test(`cannot add a task without a title`, async () => {
      await TodoPageInstance.goToPage('todos')

      await TodoPageInstance.clickButton('Add todo')

      await TodoPageInstance.numberOfTasksExist(0)
    })
  })
}
