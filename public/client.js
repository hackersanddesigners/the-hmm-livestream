const root = document.body
const m = window.m;

const App = {
  streams: [],
  createStream: () => {
    m.request({
      method: 'POST',
      url: '/streams'
    }).then((res) => {
      App.streams = [res, ...App.streams];
    });
  },
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
        m("button", { onclick: App.getStreams }, "Get Streams"),
        m("button", { onclick: App.createStream }, "Create Stream"),
        
        m("ol", App.streams.map(function(stream) {
            console.log(stream)
            return m("li.user-list-item", stream.status)
        })),
      ]),
    ];
  }
};

m.mount(root, App);