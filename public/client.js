const root = document.body
const m = window.m;

const App = {
  count: 0,
  dreams: [],
  getDreams: () => {
    m.request({
      method: "GET",
      url: "/getDreams",
    })
    .then(function(result) {
      App.dreams = result;
    })
  },
  view: function() {
    return [
      m('header', [
        m('h1', 'Tubelet'),
      ]),
      m("main", [
        m("h1", {class: "title"}, `Num: ${App.count}`),
        m("button", { onclick: App.getDreams }, "Get Dreams"),
        m("button", { onclick: () => (App.count = App.count + 1) }, "A button"),
      ]),
    ];
  }
};

m.mount(root, App);