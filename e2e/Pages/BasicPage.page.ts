import { test, expect, type Locator, type Page, type APIRequestContext } from '@playwright/test'
import config from '../../config'
const fs = require('fs')
const path = require('path')

export class BasicPage {
  readonly page: Page
  readonly request: APIRequestContext
  readonly button: Locator
  readonly hElement: (value: number) => Locator
  readonly toDoHeader: Locator
  readonly spinner: Locator
  readonly spinnerMessage: (text: string) => Locator
  readonly alertMessage: Locator
  readonly adminButton: Locator
  protected userStorage: object[]

  constructor(page: Page, request: APIRequestContext, userpath: string = '../playwright/.auth/admin.json') {
    this.page = page
    this.request = request
    this.takeUserStorage(userpath)
    this.button = this.page.getByRole('button')
    this.hElement = (value: number) => {
      return this.page.locator(`h${value}`)
    }
    this.toDoHeader = this.hElement(1).filter({ hasText: 'TODOs' })
    this.spinner = this.page.locator('.spinner-content')
    this.spinnerMessage = (text: string) => {
      return this.page.locator('.spinner-message', { hasText: text })
    }
    this.alertMessage = this.page.locator('.text-danger')
    this.adminButton = this.page.locator('.btn-success', { hasText: 'Admin' })
  }

  /**
  * @stepName take userStorage from {userPath} path
  * @param userPath - Path to the authentication file for the user.
  */
  async takeUserStorage(userPath: string): Promise<void> {
    await test.step(`take userStorage from "${userPath}" path`, async () => {
      if (!userPath.includes('unauthenticated')) {
        this.userStorage = await fs.promises.readFile(`${__dirname}/../${userPath}`, 'utf8')
          .then((userInfo: string) => {
            const userRegex = /\.auth\/(.*)\.json$/
            const user = userPath.match(userRegex)![1]
            const userJSON = JSON.parse(JSON.parse(userInfo).origins[0].localStorage[0].value)
            const accessToken = userJSON['auth']['accessToken']
            const userRole = userJSON['user']['role']

            return {
              user,
              userRole,
              accessToken
            }
          })
      }
    })
  }

  /**
   * @stepName the user clicks on a button with the "${buttonTitle}" text
   * @param buttonTitle - The title of the clickable button.
   * @example SomePageInstance.clickButton('Login')
   */
  async clickButton(buttonTitle: string) {
    await test.step(`the user clicks on a button with the "${buttonTitle}" text`, async () => {
      const button = this.button.filter({ hasText: buttonTitle })
      await expect(button).toBeVisible()
      await expect(button).toBeEnabled()
      await button.click()
    })
  }

  /**
   * @stepName the user press on Enter key
   */
  async pressEnter() {
    await test.step(`the user press on Enter key`, async () => {
      await this.page.keyboard.press('Enter')
    })
  }

  /**
   * @stepName the user sees the element with "${elementText}" text
   * @param elementText - Element text.
   * @example SomePageInstance.elementWithTextDisplayed('TODOs')
   */
  async elementWithTextDisplayed(elementText: string) {
    await test.step(`the user sees the element with "${elementText}" text`, async () => {
      const element = this.page.getByText(elementText)
      await expect(element).toBeVisible()
    })
  }

  /**
   * @stepName the user sees the element with "${elementText}" name
   * @param elementName - Element name.
   * @example SomePageInstance.elementWithNameDisplayed('adminButton')
   */
  async elementWithNameDisplayed(elementName: string) {
    await test.step(`the user sees the element with "${elementName}" name`, async () => {
      const element = await this[elementName]
      await expect(element).toBeVisible()
    })
  }

  /**
   * @stepName the user sees the element with "${elementText}" text
   * @param elementText - Element text.
   * @example SomePageInstance.elementWithTextDisplayed('TODOs')
   */
  async alertIsDisplayed(alertText: string) {
    await test.step(`the user sees the alert with "${alertText}" text`, async () => {
      const element = this.alertMessage.filter({ hasText: alertText })
      await expect(element).toBeVisible()
    })
  }

  /**
   * @stepName the user does not see the spinner with ${spinnerMessage} text
   * @param spinnerStatus - Spinner message. Can be `Logging in` or `Processing`.
   * @example SomePageInstance.spinnerIsDisappeared('Processing')
   */
  async spinnerIsDisappeared(spinnerMessage: 'Logging in' | 'Processing') {
    await test.step(`the user does not see the spinner with "${spinnerMessage}" text`, async () => {
      await expect(this.spinner).not.toBeVisible()
      await expect(this.spinnerMessage(spinnerMessage)).not.toBeVisible()
    })
  }

  /**
   * @stepName the user goes to the "${pageName}" page
   * @param pageName - Page name.
   * @example SomePageInstance.spinnerIsDisappeared('Processing')
   */
  async goToPage(pageName: string) {
    await test.step(`the user goes to the "${pageName}" page`, async () => {
      const pageUrl = config.pages[pageName].url
      const successElement = config.pages[pageName].successElement
      await this.page.goto(pageUrl)
      expect(this.page.url()).toContain(pageUrl)
      // expect(this[successElement]).toBeVisible()
    })
  }

  /**
   * @stepName the user is on the "${pageName}" page
   * @param pageName - Page name.
   * @example SomePageInstance.userOnPage('login')
   */
  async userOnPage(pageName: string) {
    await test.step(`the user is on the "${pageName}" page`, async () => {
      const pageUrl = config.pages[pageName].url
      expect(this.page.url()).toContain(pageUrl)
    })
  }

  /**
    * @stepName take user token
    * @param userName - User name.
    * @example BasicPage.takeUserToken('admin')
    */
  static async takeUserToken(userName: string) {
    const userPath = `../../playwright/.auth/${userName}.json`
    return fs.promises.readFile(path.join(__dirname, userPath), 'utf8')
      .then((userInfo: string) => {
        const userData = JSON.parse(JSON.parse(userInfo).origins[0].localStorage[0].value)
        const userToken = userData['auth']['accessToken']
        return userToken
      })
  }
}
