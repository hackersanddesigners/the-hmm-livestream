function markdown (input) {
  const md = require('markdown-it')({
    breaks: true,
    typographer: true,
    linkify: true
  })

  // <https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer>

  // remember old renderer, if overridden, or proxy to default renderer
  var defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // check if link url is outgoing link
    if (tokens[idx].attrs[0][1].startsWith(window.location.origin)) {
      return defaultRender(tokens, idx, options, env, self)

    } else {
      // if you are sure other plugins can't add `target`, drop check below
      var aIndex = tokens[idx].attrIndex('target')

      if (aIndex < 0) {
        // add new attribute
        tokens[idx].attrPush(['target', '_blank']) 
      } else {
        // replace value of existing attr
        tokens[idx].attrs[aIndex][1] = '_blank' 
      }

      // pass token to default renderer
      return defaultRender(tokens, idx, options, env, self)

    }
  }

  return md.render(input)
}

module.exports = markdown
