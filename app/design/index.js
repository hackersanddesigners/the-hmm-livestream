var gr8 = require('gr8')

var root = `
:root {
  --ft-ss: 'Arial', sans-serif;
  --ft-ms: 'Not Courier', monospace;
  --c-wh: #fff;
  --c-yl: #ff0;
  --c-bl: blue;
  --c-bk: #000;
}
`

var basic = gr8({
  spacing: [0, 0.15, 0.25, 0.5, 1, 4.5],
  fontSize: [0.8, 1, 1.3, 2],
  lineHeight: [1],
  zIndex: [1, 2],
  breakpoints: {
    md: 600,
    bg: 800,
    lg: 1024
  },
  breakpointSelector: 'class'
})

var color = {
  prop: {
    bgc: 'background-color',
    fc: 'color'
  },
  vals: [
    { wh: 'var(--c-wh)' },
    { yl: 'var(--c-yl)' },
    { bl: 'var(--c-bl)' },
    { bk: 'var(--c-bk)' }
  ],
  join: '-'
}

var column = {
  prop: {
    cx: 'width'
  },
  vals: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  unit: '%',
  transform: i => (i / 9) * 100

}

var size = {
  prop: [
    { w: 'width',
      h: 'height'
    }
  ],
  vals: [15, 35, 50, 90, 100],
  join: '-',
  unit: '%'
}

var border = {
  prop: ['border', 'border-top', 'border-right', 'border-bottom', 'border-left'],
  vals: [
    { n: 'none' },
    { wh: '1px solid var(--c-wh)' },
    { bk: '1px solid var(--c-bk)' }
  ],
  join: '-'
}

var utils = gr8({
  utils: [color, column, size, border],
  breakpoints: {
    md: 540,
    bg: 800,
    lg: 1024
  },
  breakpointSelector: 'class'
})

var utilcss = root + basic + utils

module.exports = utilcss
