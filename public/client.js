const root = document.body
const m = window.m;

const App = {
  view: function() {
    return [
      m('header', [
        m('h1', 'Tubelet'),
      ]),
      m("main", [
        m("h1", {class: "title"}, "My first app"),
        m("button", "A button"),
      ]),
    ];
  }
};

m.mount(root, App);