function getURLfromPost(posts) {
  const URLmatch = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+")
  const URLS = []

  posts.map(post => {
    return post.value.match(URLmatch)
  }).filter(item => {
    if (item !== null) {
      URLs.push(item[0])
    }
  })

  return URLs
}

module.exports = getURLfromPost
