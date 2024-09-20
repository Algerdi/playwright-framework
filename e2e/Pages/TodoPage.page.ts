import { test, expect, type Page, type APIRequestContext, type Locator } from '@playwright/test'
import axios from 'axios'
import { BasicPage } from './BasicPage.page'
const config = require('config')

export class TodoPage extends BasicPage {
  readonly newTaskInputField: Locator
  readonly tasksTable: Locator
  readonly taskRow: Locator

  constructor(page: Page, request: APIRequestContext, userpath: string = '../playwright/.auth/admin.json') {
    super(page, request, userpath)
    this.newTaskInputField = this.page.locator('input[placeholder="New task"]')
    this.tasksTable = this.page.locator('ul.list-group')
    this.taskRow = this.tasksTable.locator('li.list-group-item')
  }

  /**
   * @stepName the user enters the "${taskTitle}" task name in the input field
   * @param taskTitle - Task title.
   * @example SomePageInstance.enterTaskTitle('hello')
   */
  async enterTaskTitle(taskTitle: string) {
    await test.step(`the user enters the "${taskTitle}" task name in the input field`, async () => {
      await expect(this.newTaskInputField).toBeVisible()
      await expect(this.newTaskInputField).toBeEnabled()
      await this.newTaskInputField.fill(taskTitle)
      // necessary to track changes in the number of tasks in the table
      this.userStorage['tasksAmount'] = await this.taskRow.count() + 1
    })
  }

  /**
   * @stepName the user sees the newly created "${taskTitle}" task in the list
   * @param taskTitle - Task title.
   * @example SomePageInstance.newlyCreatedTaskExist('hello')
   */
  async newlyCreatedTaskExist(taskTitle: string) {
    await test.step(`the user sees the newly created "${taskTitle}" task in the list`, async () => {
      const task = this.taskRow.filter({ hasText: taskTitle })
      await expect(task).toBeVisible()
    })
  }

  /**
   * @stepName the user sees correct number of tasks in the list
   */
  async correctNumberOfTasksInTable() {
    await test.step(`the user sees correct number of tasks in the list`, async () => {
      const tasksAmount = await this.taskRow.count()
      expect(tasksAmount).toBe(this.userStorage['tasksAmount'])
      const toDoHeaderText = await this.toDoHeader.innerText()
      if (tasksAmount !== 0) {
        const numberInToDoHeader = toDoHeaderText.match(/\((\d+)\)/)
        expect(tasksAmount).toBe(Number(numberInToDoHeader![1]))
      } else {
        expect(/^[A-Za-z\s]+$/.test(toDoHeaderText)).toBeTruthy()
      }
    })
  }

  /**
   * @stepName the user sees 5 tasks
   * @param tasksNumber - Number of tasks in table.
   * @example SomePageInstance.numberOfTasksExist(5)
   */
  async numberOfTasksExist(tasksNumber: number) {
    await test.step(`the user sees "${tasksNumber}" tasks`, async () => {
      const tasksAmount = await this.taskRow.count()
      expect(tasksAmount).toBe(tasksNumber)
      const toDoHeaderText = await this.toDoHeader.innerText()
      if (tasksAmount !== 0) {
        const numberInToDoHeader = toDoHeaderText.match(/\((\d+)\)/)
        expect(tasksAmount).toBe(Number(numberInToDoHeader![1]))
      } else {
        expect(/^[A-Za-z\s]+$/.test(toDoHeaderText)).toBeTruthy()
      }
    })
  }

  /**
   * @stepName the user deletes "${taskTitle}" task
   * @param taskTitle - Task title.
   * @example SomePageInstance.deleteTaskByTitle('hello')
   */
  async deleteTaskByTitle(taskTitle: string) {
    await test.step(`the user deletes "${taskTitle}" task`, async () => {
      const task = this.taskRow.filter({ hasText: taskTitle })
      const deleteButton = task.locator(this.button, { hasText: 'X' })
      await deleteButton.click()
      // necessary to wait for the table to be rerendered
      await this.page.waitForTimeout(100)
      // necessary to track changes in the number of tasks in the table
      this.userStorage['tasksAmount'] = await this.taskRow.count()
    })
  }

  /**
   * @stepName the "${userName}" user gets tasks with api request
   * @param userName - User name.
   * @example SomePageInstance.getTasks('admin')
   */
  static async getTasks(userName: string) {
    return await test.step(`the "${userName}" user gets tasks with api request`, async () => {
      const token = await TodoPage.takeUserToken(userName)
      return await axios
        .get(`${config.baseUrl}/todos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(response => response.data)
    })
  }

  /**
   * @stepName the user deletes default tasks with api request
   * @param userName - User name.
   * @example SomePageInstance.deleteDefaultTasksByUser('admin')
   */
  static async deleteDefaultTasksByUser(userName: string) {
    return await test.step(`the "${userName}" user deletes default tasks with api request`, async () => {
      const token = await TodoPage.takeUserToken(userName)
      const taskIds = await TodoPage.getTasks(userName)
      for (const taskId in taskIds) {
        await axios.delete(`${config.baseUrl}/todos/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(response => response.data)
      }
    })
  }
}