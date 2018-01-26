const e = window.React.createElement
const { dialog } = require("electron").remote

module.exports = class SettingsPage extends window.React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      styles: props.plugin.settings.stylesheets
    }
  }

  createStyleRows(plugin) {
    const sheets = this.state.styles
    const indexes = Object.keys(sheets)
    if (!indexes.length) {
      return e(
        "tr",
        {},
        e("td", { colspan: 2 }, e("i", {}, "No custom styles and themes added"))
      )
    }

    return indexes.map(idx =>
      e("tr", {}, e("td", {}, idx), e("td", {}, "actions lols"))
    )
  }

  refreshOrder() {}
  moveStyleUp(id) {}
  moveStyleDown(id) {}

  addLocal() {
    const fname = dialog
      .showOpenDialog({
        title: "Select a css file or theme package",
        properties: ["openFile"],
        filters: [{ name: "Theme files", extensions: ["asar", "css", "json"] }]
      })
      .pop()

    this.props.plugin.addUserStyle(fname)
    this.setState({
      styles: this.props.plugin.settings.stylesheets
    })
  }

  addRemote() {}

  render() {
    return e(
      "div",
      {},
      e(
        "table",
        { style: { width: "100%" } },
        e(
          "thead",
          {},
          e(
            "tr",
            {},
            e("th", { style: { textAlign: "left" } }, "Style"),
            e("th", { style: { textAlign: "right", width: "15%" } }, "Actions")
          )
        ),
        e("tbody", {}, this.createStyleRows(this.props.plugin))
      ),
      e(
        "div",
        { className: "DI-buttonBar" },
        e("button", { onClick: () => this.addLocal() }, "Add local CSS file"),
        e(
          "button",
          { onClick: () => this.addRemote() },
          "Find styles and themes"
        )
      )
    )
  }
}
