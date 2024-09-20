import { test as setup, expect } from '@playwright/test'
import config from '../../config'
const usersJson = require('../../fixtures/users')

async function authenticate (page, rawUserName) {
  const {
    data: {
      username,
      password
    }
  } = usersJson.data[rawUserName] || {}

  const loginPageForm = await page.locator('[role="form"]')
  const loginFormHeader = loginPageForm.locator('h2', { hasText: 'Please Login' })
  const usernameField = loginPageForm.locator('[name="username"]')
  const passwordField = loginPageForm.locator('[name="password"]')
  const loginButton = await page.getByRole('button', { name: 'Login' })
  const toDoHeader = await page.locator('h1', { hastext: 'TODOs' })

  const loginPageUrl = config.pages['login'].url
  await page.goto(loginPageUrl)
  expect(page.url()).toContain(loginPageUrl)
  
  await loginPageForm.waitFor({ state: 'visible' })
  expect(loginFormHeader).toBeVisible()

  await usernameField.fill(username)
  await passwordField.fill(password)
  await loginButton.click()

  await toDoHeader.waitFor({ state: 'visible' })
  await page.context().storageState({ path: `playwright/.auth/${rawUserName}.json` })
}

const defaultUsers = ['admin', 'johnd', 'janed']
for (const rawUserName of defaultUsers) {
  setup(`authenticate as "${rawUserName}" user`, async ({ page }) => {
    await authenticate(page, rawUserName)
  })
}

setup('authenticate as "unauthenticated"', async ({ page }) => {
  await page.context().storageState({ path: 'playwright/.auth/unauthenticated.json' })
})
