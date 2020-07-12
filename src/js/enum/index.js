import httpError from './httpError'

let obj = Object.assign(
  {},
  httpError
)

function enumerate () {
  let ENUM = []
  for (let k in obj) {
    ENUM[k] = obj[k]
    obj[k].forEach(item => {
      ENUM[k][item.key] = item
    })
  }
  return ENUM
}

export default enumerate()
