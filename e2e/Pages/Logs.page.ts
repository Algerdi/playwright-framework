import { test, expect, type Page, type APIRequestContext, type Locator } from '@playwright/test'
import { BasicPage } from './BasicPage.page'
import { getLogs } from '../helpers/dockerFunctions'
import { formLogRow } from '../helpers/formLogRow'
import { findMatchingLog } from '../helpers/findMatchingLog'
const Docker = require('dockerode')
const dockerInstance = new Docker()

export class Logs extends BasicPage {

  constructor(page: Page, request: APIRequestContext, userpath: string = '../playwright/.auth/admin.json') {
    super(page, request, userpath)
  }

  /**
   * @stepName check the logs for the task deletion
   */
  async checkLogsTaskDeletion() {
    await test.step(`check the logs for the task deletion`, async () => {
      const todoIdFromRequest = 7
      await this.page.waitForTimeout(500)
      const usernameFromStorage = await this.userStorage['user']
      const requestTime = new Date()

      await this.request.delete(`/todos/${todoIdFromRequest}`, {
        headers: { authorization: `Bearer ${this.userStorage['accessToken']}` },
      })

      // waiting for the logs to appear in the log service
      await this.page.waitForTimeout(7000)

      // get logs from container
      const last20Logs = await getLogs(dockerInstance)

      const logRows = formLogRow(last20Logs)
      const matchingLog = findMatchingLog(logRows, todoIdFromRequest, usernameFromStorage, 'DELETE', requestTime)
      expect(matchingLog).toBeTruthy()
    })
  }

  /**
   * @stepName check the logs for the task deletion
   */
  async checkLogsTaskCreation() {
    await test.step(`check the logs for the task creation`, async () => {
      const usernameFromStorage = await this.userStorage['user']
      const requestTime = new Date()

      const todoIdFromRequest = await this.request.post(`/todos`, {
        headers: { authorization: `Bearer ${this.userStorage['accessToken']}` },
        data: {
          content: 'new task from API'
        }
      }).then(async (response) => (await response.json())['id'])

      // waiting for the logs to appear in the log service
      await this.page.waitForTimeout(5000)

      // get logs from container
      const last10Logs = await getLogs(dockerInstance)

      const logRows = formLogRow(last10Logs)
      const matchingLog = findMatchingLog(logRows, todoIdFromRequest, usernameFromStorage, 'CREATE', requestTime)
      expect(matchingLog).toBeTruthy()
    })
  }

  /**
   * @stepName deleteTaskAfterCreationLogTest
   */
  async deleteTaskAfterCreationLogTest() {
    await test.step(`the hook deletes task after cretion log test with api request`, async () => {
      await this.request.delete(`/todos/${await this.userStorage['todoId']}`, {
        headers: { authorization: `Bearer ${this.userStorage['accessToken']}` },
      })
    })
  }
}