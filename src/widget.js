(function () {
  // Configuration

  // const HOST = 'http:localhost:8090';
  const HOST = 'https://bff.fm';
  const UPDATE_FREQ = 10000; // 10 seconds
  const CLEAR_OLD_TRACK_TIME = 600000; // 10 minutes
  const DEBUG = true;

  var previousTrackInfo;
  var previousTrackHash;
  var previousTrackTimeout;

  function debug(...args) {
    if (DEBUG) {
      console.debug(...args);
    }
  }


  // Rendering
  function renderNowPlaying(nowPlayingInfo) {
    updateShow(nowPlayingInfo);
    updateTrack(nowPlayingInfo);

    const newTrackHash = hashTrack(nowPlayingInfo);
    if (newTrackHash && (newTrackHash != previousTrackHash)) {
      previousTrackHash = newTrackHash;
      previousTrackInfo = nowPlayingInfo;

      if (previousTrackTimeout) {
        window.clearTimeout(previousTrackTimeout);
        previousTrackTimeout = window.setTimeout(function () {
          previousTrackInfo = null;
          previousTrackHash = null;
        }, CLEAR_OLD_TRACK_TIME)
      }
    }

    setVisibility(nowPlayingInfo);
  }



  // Init
  function run() {
    debug('Running timed update...', UPDATE_FREQ);
    fetchOnAir()
      .then(renderNowPlaying)
      .finally(() => setTimeout(run, UPDATE_FREQ));
  }

  window.addEventListener('load', function () {
    document.querySelector('.debugButton').addEventListener('click', function () {
      document.querySelector('.TrackWidget').classList.toggle('is-default-cover');
      document.querySelector('.ShowWidget').classList.toggle('is-expanded');
    });
  });

  run();
})();
