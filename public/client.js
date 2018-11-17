const root = document.body
const m = window.m;

const main = [
  m("main", [
    m("h1", {class: "title"}, "My first app"),
    m("button", "A button"),
  ]),
];

m.render(root, main);