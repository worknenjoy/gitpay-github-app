const readFileSync = require('fs').readFileSync
const rp = require('request-promise-native')

const tpl = (str, data) => {
  return str.replace(/\{\{(.+?)\}\}/g, function (match) {
    return data.shift() || match;
  })
}

module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')
  app.on('issues.opened', async context => {
    const payload = context.payload
    const options = {
      method: 'POST',
        uri: 'webhooks/github',
        baseUrl: 'https://gitpay.me/',
        body: payload,
        simple: false,
        resolveWithFullResponse: true,
        followRedirect: false,
        followAllRedirects: false,
        json: true, // Automatically stringifies the body to JSON
        headers: {
          'Content-Type': 'application/json'
        }
    }
    try {
      const request = await rp(options)
      // console.log('request response', request)
      console.log('request body', request.request.body)
      console.log('request json', JSON.parse(request.request.body))
      const bodyJSON = JSON.parse(request.request.body)
      console.log('task', bodyJSON.task)
      const taskData = bodyJSON.task
      const template = readFileSync('./first-comment.md', 'utf8')
      const commentContent = template.toString()
      console.log('task data', taskData)
      const parsedCommentContent = tpl(commentContent, [taskData.url, taskData.url])
      console.log(parsedCommentContent)
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
