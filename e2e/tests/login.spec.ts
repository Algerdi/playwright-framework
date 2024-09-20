import { test } from '@playwright/test'
import { LoginPage } from '../Pages/LoginPage.page'
import { transformUsersJson } from '../helpers/transformUsersJson'
const unauthenticatedPath = 'playwright/.auth/unauthenticated.json'
const usersJson = require('../../fixtures/users')

let LoginPageInstance: LoginPage

const {
  data: {
    username: adminUsername,
    password: adminPassword
  }
} = usersJson.data['admin'] || {}

test.use({ storageState: unauthenticatedPath })

test.beforeEach(async ({ page, request }) => {
  LoginPageInstance = new LoginPage(page, request, `../${unauthenticatedPath}`)
})

for (const [userName, userData] of Object.entries(transformUsersJson(usersJson))) {
  test(`the "${userName}" user "${userData.status}" log in with the "${userData.status === 'can' ? 'correct' : 'incorrect'}" credentials`, async () => {
    await LoginPageInstance.goToPage('login')

    await LoginPageInstance.enterDataInLoginField('username', userData.username)

    await LoginPageInstance.enterDataInLoginField('password', userData.password)

    await LoginPageInstance.clickButton('Login')

    await LoginPageInstance.spinnerIsDisappeared('Logging in')

    if (userData.status === 'can') {
      await LoginPageInstance.spinnerIsDisappeared('Processing')

      await LoginPageInstance.userOnPage('todosAfterLoggin')

      await LoginPageInstance.elementWithTextDisplayed('TODOs')

      if (userName === 'admin') {
        await LoginPageInstance.elementWithNameDisplayed('adminButton')
      }

    } else {
      await LoginPageInstance.userOnPage('login')

      await LoginPageInstance.elementWithTextDisplayed('something went wrong, please try again later')
    }
  })
}

test.describe('the user cannot log in because not all fields are filled in', () => {
  for (const field of ['username', 'password', 'both'] as const) {
    test(`${field === 'both' ? 'all fields are empty' : `only "${field}" field is filled`}`, async () => {
      await LoginPageInstance.goToPage('login')
      switch (field) {
        case 'both':
          await LoginPageInstance.clickButton('Login')

          await LoginPageInstance.fieldNotValidated('username')

          await LoginPageInstance.fieldNotValidated('password')
          break
        case 'username':
        case 'password':
          await LoginPageInstance.enterDataInLoginField(field, field)

          await LoginPageInstance.clickButton('Login')

          await LoginPageInstance.fieldNotValidated(field)
      }

      await LoginPageInstance.userOnPage('login')
    })
  }
})

test(`user can logout`, async () => {
  await LoginPageInstance.goToPage('login')

  await LoginPageInstance.enterDataInLoginField('username', adminUsername)

  await LoginPageInstance.enterDataInLoginField('password', adminPassword)

  await LoginPageInstance.clickButton('Login')

  await LoginPageInstance.userOnPage('todosAfterLoggin')

  await LoginPageInstance.elementWithTextDisplayed('TODOs')

  await LoginPageInstance.clickButton('Logout')

  await LoginPageInstance.userOnPage('login')
})
