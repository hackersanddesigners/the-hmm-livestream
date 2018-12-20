(function (root, m, Hls, io) {
  const socket = io();

  // Video Player Component
  const Video = {
    
    // Substitute the playbackID into the URL so we have a HLS playlist, and a
    // thumbnail URL we can use in the player.
    src: playbackId => `https://stream.mux.com/${playbackId}.m3u8`,
    poster: playbackId => `https://image.mux.com/${playbackId}/thumbnail.jpg`,

    oncreate: (vnode) => {
      const sourceUrl = Video.src(vnode.attrs.playbackId);
      const video = vnode.dom;
      
      // If HLS.js is supported on this platform
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.controls = true;
          video.play();
        });
        
      // If the player can support HLS natively
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', () => {
          video.controls = true;
          video.play();
        });
      }
    },

    // Initialise the player muted so that we can autoplay the Live Stream
    view: (vnode) => {
      return m('video#video', { controls: false, poster: Video.poster(vnode.attrs.playbackId), muted: true });
    }
  }

  // ArchivePreview Component
  const ArchivePreview = () => {
    let hovered = false;

    const onHover = () => { hovered = true };
    const offHover = () => { hovered = false };

    // When the mouse is hovered over the preview, flip to the animated gif!
    const src = (playbackId) =>
      hovered
      ? `https://image.mux.com/${playbackId}/animated.gif`
      : `https://image.mux.com/${playbackId}/thumbnail.jpg`;

    return {
      view: (vnode) => {
        return m('img.archivePreview', {
          onmouseover: onHover,
          onmouseout: offHover,
          src: src(vnode.attrs.playbackId)
        });
      }
    }
  }

  // Our Main Application Component
  const App = {
    
    stream: {}, // The public information about our stream will be stored here.
    recentStreams: [], // Recent streams are stored here
    
    oninit: async () => {
      
      // When our application starts, check if there's a stream happening.
      await App.getStream();
      App.getRecentStreams()
      
      // When we get a message about a stream going idle, we want to trigger an update
      // of the recent streams.  
      socket.on('stream_update', (stream) => {
        if (stream.status === 'idle') {
          App.getRecentStreams();
        }

        App.stream = stream;
        m.redraw();
      });
    },
    
    // Helper method for getting any active stream, used for bootstrapping
    getStream: () => {
      m.request({
        method: 'GET',
        url: '/stream',
      })
      .then((result) => {
        App.stream = result;
      })
    },
    
    // Helper method for getting recent streams and storing the result
    getRecentStreams: () => {
      m.request({
        method: 'GET',
        url: '/recent',
      })
      .then((result) => {
        App.recentStreams = result;
      })
    },

    // The main view
    view: () => {
      return [
        
        // Header
        m('header', [
          m('h1', '📺 Tubelet'),
        ]),
        
        // Main Stream - Show stream status
        m('main', [
          m('h2', {class: 'title'}, `Status: ${App.stream.status || 'loading...'}`),

          // If there's an active streeam, add a Video component
          App.stream.status === 'active'
            ? m(Video, { playbackId: App.stream.playbackId })
            : m('.placeholder', 'No active stream right now 😢'),

          // Recent Streams
          m('h3', 'Recent Streams'),
          m('ul.recentStreams', App.recentStreams.map((asset) => (
            m('li', [
              m('span.time', (new Date(asset.createdAt * 1000)).toDateString()),
              m(ArchivePreview, { playbackId: asset.playbackId })
            ])
          ))),
        ]),
        
        // Footer
        m('footer', [
          m('.glitchButton', { style: 'position:fixed;top:20px;right:20px;' }),
          m('p',
            'Made with ❤️ and ',
            m('a', { href: 'https://mux.com', target: 'blank' }, 'Mux Video'),
          ),
        ]),
      ];
    }
  };

  m.mount(root, App);
})(document.body, window.m, window.Hls, window.io);
