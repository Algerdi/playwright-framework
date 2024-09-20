import { test, type BrowserContext, type Page, type APIRequestContext } from '@playwright/test'
import { Logs } from '../Pages/Logs.page'
const adminPath = 'playwright/.auth/admin.json'
const janedPath = 'playwright/.auth/janed.json'

let LogsInstance: Logs

test.describe.configure({ mode: 'serial' })

test.describe('as admin user', () => {
    test.use({ storageState: adminPath })
    let context: BrowserContext
    let page: Page
    let request: APIRequestContext
    test.beforeAll(async ({ browser }) => {
        context = await browser.newContext()
        page = await context.newPage()
        request = page.request
        LogsInstance = new Logs(page, request, `../${adminPath}`)
    })

    test(`logs for task deletion in log-message-processor works as expected`, async () => {
        await LogsInstance.checkLogsTaskDeletion()
    })
})

test.describe('as janed user', () => {
    test.use({ storageState: janedPath })
    let context: BrowserContext
    let page: Page
    let request: APIRequestContext
    test.beforeAll(async ({ browser }) => {
        context = await browser.newContext()
        page = await context.newPage()
        request = page.request
        LogsInstance = new Logs(page, request, `../${janedPath}`)
    })

    test.afterEach(async () => {
        await LogsInstance.deleteTaskAfterCreationLogTest()
    })

    test(`logs for task creation in log-message-processor works as expected`, async () => {
        await LogsInstance.checkLogsTaskCreation()
    })
})



