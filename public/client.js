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
  
  streams: [],
  getStreams: () => {
    m.request({
      method: "GET",
      url: "/streams",
    })
    .then(function(result) {
      App.streams = result;
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
        m("button", { onclick: App.getStreams }, "Get Streams"),
        m("button", { onclick: () => (App.count = App.count + 1) }, "A button"),
        m("ul", App.dreams.map(function(dream) {
            return m("li.user-list-item", dream.dream)
        })),
        
        m("ol", App.streams.map(function(stream) {
            console.log(stream)
            return m("li.user-list-item", stream.status)
        })),
      ]),
    ];
  }
};

m.mount(root, App);