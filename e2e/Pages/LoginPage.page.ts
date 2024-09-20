import { test, expect, type Page, type APIRequestContext, type Locator } from '@playwright/test'
import { BasicPage } from './BasicPage.page'

export class LoginPage extends BasicPage {
  readonly loginPageForm: Locator
  readonly fieldNameString: (fieldName: string) => string
  readonly loginPageDataField: (fieldName: string) => Locator
  readonly invalidField: (fieldName: string) => Locator
  readonly loginButton: Locator
  readonly loginFormHeader: Locator

  constructor(page: Page, request: APIRequestContext, userpath: string = '../playwright/.auth/admin.json') {
    super(page, request, userpath)
    this.loginPageForm = this.page.locator('[role="form"]')
    this.fieldNameString = (fieldName: string) => `[name="${fieldName}"]`
    this.loginPageDataField = (fieldName: string) => this.loginPageForm.locator(this.fieldNameString(fieldName))
    this.invalidField = (fieldName: string) => this.loginPageForm.locator(`${this.fieldNameString(fieldName)}:invalid`)
    this.loginButton = this.button.filter({ hasText: 'Login' })
    this.loginFormHeader = this.hElement(2).filter({ hasText: 'Please Login' })
  }

  /**
   * @stepName the user enters data into the "${fieldName}" field
   * @param fieldName - Input field. Can be `username` or `password`.
   * @param fieldName - Input data.
   * @example SomePageInstance.enterDataInLoginField('username', 'testuser')
   */
  async enterDataInLoginField(fieldName: 'username' | 'password', data: string) {
    await test.step(`the user enters data into the "${fieldName}" field`, async () => {
      const field = this.loginPageDataField(fieldName)
      await expect(field).toBeVisible()
      await expect(field).toBeEnabled()
      await field.fill(data)
      const inputValue = await field.inputValue()
      expect(inputValue).toBe(data)
    })
  }

  /**
   * @stepName the user sees the "${fieldName}" field that has not passed validation
   * @param fieldName - Input field. Can be `username` or `password`.
   * @example SomePageInstance.fieldNotValidated('username')
   */
  async fieldNotValidated(fieldName: 'username' | 'password') {
    await test.step(`the user sees the "${fieldName}" field that has not passed validation`, async () => {
      const invalidFieldNamed = {
        username: 'password',
        password: 'username'
      }
      const invalidField = this.page.locator(`${this.fieldNameString(invalidFieldNamed[fieldName])}:invalid`)
      await expect(invalidField).toBeVisible()
    })
  }
}