const nock = require('nock')
// Requiring our app implementation
const myProbotApp = require('..')
const { Probot } = require('probot')
// Requiring our fixtures
const payloadIssueOpened = require('./fixtures/issues.opened')
const payloadIssueLabeled = require('./fixtures/issues.labeled')

nock.disableNetConnect()

describe('My Probot app', () => {
  let probot

  beforeEach(() => {
    probot = new Probot({})
    // Load our app into probot
    const app = probot.load(myProbotApp)

    // just return a test token
    app.app = () => 'test'
  })

  test('creates a comment when an issue is opened', async () => {
    // Test that we correctly return a test token
    nock('https://api.github.com')
      .post('/app/installations/23013/access_tokens')
      .reply(200, { token: 'test' })

    // Test that a comment is posted
    nock('https://api.github.com')
      .post('/repos/alexanmtz/test-repo-gitpay-github-app/issues/1/comments', (body) => {
        expect(body).toBeDefined()
        return true
      })
      .reply(200)

    // Test a call to webhook on the application
    nock('https://gitpay.me')
      .post('/webhooks/github', (body) => {
        expect(body).toBeDefined()
        return true
      })
      .reply(200, {
        "task": {
          "url": "https://example.com"
        }
      })

    // Receive a webhook event
    await probot.receive({ name: 'issues', payload: payloadIssueOpened })
  })

  test('nofity community when a label is set to notify', async () => {
    // Test that we correctly return a test token
    nock('https://api.github.com')
      .post('/app/installations/23013/access_tokens')
      .reply(200, { token: 'test' })

    // Test that a comment is posted
    nock('https://api.github.com')
      .post('/repos/alexanmtz/test-repo-gitpay-github-app/issues/1/labels', (body) => {
        expect(body).toBeDefined()
        return true
      })
      .reply(200)

    // Test a call to webhook on the application
    nock('https://gitpay.me')
      .post('/webhooks/github', (body) => {
        expect(body).toBeDefined()
        return true
      })
      .reply(200, {
        "task": {
          "url": "https://example.com"
        }
      })

    // Receive a webhook event
    await probot.receive({ name: 'labeled', payload: payloadIssueLabeled })
  })

})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock
