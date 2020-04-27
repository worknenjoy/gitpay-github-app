const readFileSync = require('fs').readFileSync
const rp = require('request-promise-native')

const tpl = (str, data) => {
  return str.replace(/\{\{(.+?)\}\}/g, function (match) {
    return data.shift() || match
  })
}

module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')
  app.on('issues.opened', async context => {
    try {
      const payload = context.payload
      const options = {
        method: 'POST',
        uri: 'webhooks/github',
        baseUrl: 'https://gitpay.me/',
        body: payload,
        simple: true,
        resolveWithFullResponse: true,
        followRedirect: false,
        followAllRedirects: false,
        json: true, // Automatically stringifies the body to JSON
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TOKEN}`
        }
      }
      const request = await rp(options)
      const bodyJSON = request.body
      const taskData = bodyJSON.task
      const template = readFileSync('./first-comment.md', 'utf8')
      const commentContent = template.toString()
      const parsedCommentContent = tpl(commentContent, [taskData.url, taskData.url])
      console.log(parsedCommentContent)
      const issueComment = context.issue({ body: parsedCommentContent })
      return context.github.issues.createComment(issueComment)
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  })

  app.on('issues.labeled', async context => {
    try {
      const payload = context.payload
      console.log(context.payload)

      const options = {
        method: 'POST',
        uri: 'webhooks/github',
        baseUrl: 'https://gitpay.me/',
        body: payload,
        simple: true,
        resolveWithFullResponse: true,
        followRedirect: false,
        followAllRedirects: false,
        json: true, // Automatically stringifies the body to JSON
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TOKEN}`
        }
      }
      const request = await rp(options)
      const bodyJSON = request.body
      const taskData = bodyJSON.task
      const template = readFileSync('./notify-comment.md', 'utf8')
      const commentContent = template.toString()
      const parsedCommentContent = tpl(commentContent, [taskData.url])
      const issueComment = context.issue({ body: parsedCommentContent })
      return context.github.issues.createComment(issueComment)
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
