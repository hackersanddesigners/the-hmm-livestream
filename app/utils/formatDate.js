function formatDate(ts) {
  const t = new Date(ts).toLocaleString('nl-NL')
  const tsp = t.split(' ')
  const dt_sp = tsp[0].split('-')
  const tt_sp = tsp[1].split(':')

  const date = `${dt_sp[2]}.${dt_sp[1]}.${dt_sp[0]} ${tt_sp[0]}:${tt_sp[1]}`
  const iso = `${dt_sp[2]}.${dt_sp[1]}.${dt_sp[0]}T${tt_sp[0]}:${tt_sp[1]}`

  return {
    iso: iso,
    date: date
  }
}

module.exports = formatDate
