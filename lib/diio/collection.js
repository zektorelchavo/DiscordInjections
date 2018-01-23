module.exports = class Collection {
  constructor(client, baseClass, data = []) {
    this.client = client
    this._data = data
    this._loadedData = new Map()
    this._notFound = null
    this._found = null

    this.cls = baseClass
  }

  clear() {
    this._data = []
    this._loadedData.clear()
  }

  add(data, initialize = false) {
    if (data instanceof this.cls) {
      this._loadedData.set(data.id, data)
    } else if (initialize) {
      data = new this.cls(this.client, data)
      this._loadedData.set(data.id, data)
    } else {
      this._data = data
    }
  }

  addArray(arr) {
    this._data = this._data.concat(...arr)
  }

  get notFound() {
    return this._notFound || function() {}
  }

  set notFound(val) {
    this._notFound = val
  }

  get found() {
    return this._found || function() {}
  }

  set found(val) {
    this._found = val
  }

  get(id) {
    if (this._loadedData.has(id)) {
      return this._loadedData.get(id)
    }

    const set = this._data.find(r => r.id === id)
    if (!set) this.notFound(id)
    if (set) {
      this.found(set)
      const data = new this.cls(this.client, set)
      this._loadedData.set(data.id, data)
      this._data.splice(this._data.findIndex(r => r.id === id), 1)
      return data
    }

    return null
  }

  find(compare) {
    // this will be ugly af
    for (const res of this._loadedData.values()) {
      if (compare(res)) {
        return res
      }
    }

    // manually walk the tree
    let row
    while ((row = this._data.shift())) {
      const data = new this.cls(this.client, row)
      this.found(data)
      this._loadedData.set(data.id, data)

      if (compare(data)) {
        return data
      }
    }
  }
}
