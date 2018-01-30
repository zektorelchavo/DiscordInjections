const ls = module.exports = window.localStorage
const setItem = ls.setItem.bind(ls)

ls.setItem = (key, value) => {
  if (ls[key] != value) {
    let mod = {}
    try {
      mod = JSON.parse(ls["DI-LastModified"])
    } catch (ex) {} // ignore exceptions
    mod[key] = Date.now()
    setItem("DI-LastModified", JSON.stringify(mod))
  }
  setItem(key, value)
}
