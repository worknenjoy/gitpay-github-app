const readFileSync = require('fs').readFileSync

module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')
  
  app.on('issues.opened', async context => {
    const template = readFileSync('./first-comment.md', 'utf8')
    const commentContent = template.toString()
    const issueComment = context.issue({ body: commentContent })
    return context.github.issues.createComment(issueComment)
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
