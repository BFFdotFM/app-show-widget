// const HOST = 'http:localhost:8090';
const HOST = 'https://bff.fm';
const EVENT_DELAY = 10000; // how long to delay events to better sync with the stream

let firstRequest = true;
let lastTrackHash = null;
let lastShowHash = null;

function fetchOnAir() {
  return window.fetch(`${HOST}/api/data/onair/now.json`, {
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'omit',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  })
    .then(response => response.json())
    .catch(error => {
      console.error('HTTP error fetching Now Playing info', error);
      return false;
    });
}

/**
 * Create a comparable representation of the track data in order to see whether it
 * has meaningfully changed.
 */
function hashTrack(trackInfo) {
  if (!trackInfo.title) {
    return null;
  }
  return [
    trackInfo.title,
    trackInfo.artist,
    trackInfo.album,
    trackInfo.image
  ].join(':');
}

function hashShow(showInfo) {
  if (!showInfo.program) {
    return null;
  }
  return [
    showInfo.program,
    showInfo.presenter,
    showInfo.program_image
  ].join(':');
}

function preloadImage(url) {
  if (!url) {
    return;
  }

  let img = new Image();
  img.src = url;
}

export default function refresh() {
  fetchOnAir().then(function scheduleOnAirResponse(data) {

    if (!data || !data.title) {
      window.setTimeout(function triggerClearOnAir() {
        document.dispatchEvent(new CustomEvent('data:nowplaying:track:cleared', { bubbles: false }));
        document.dispatchEvent(new CustomEvent('data:nowplaying:show:cleared', { bubbles: false }));
      }, firstRequest ? 1 : EVENT_DELAY);
      return;
    }

    let trackHash = hashTrack(data);
    let showHash = hashShow(data);

    // If the track data is the same, let it be
    if (trackHash !== lastTrackHash) {
      lastTrackHash = trackHash;

      preloadImage(data.image);

      window.setTimeout(function triggerTrackChange() {
        document.dispatchEvent(new CustomEvent('data:nowplaying:track:changed', {
          bubbles: false,
          detail: data
        }));
      }, firstRequest ? 1 : EVENT_DELAY);
    }

    if (showHash !== lastShowHash) {
      lastShowHash = showHash;

      preloadImage(data.program_image);

      window.setTimeout(function triggerTrackChange() {
        document.dispatchEvent(new CustomEvent('data:nowplaying:show:changed', {
          bubbles: false,
          detail: data
        }));
      }, firstRequest ? 1 : EVENT_DELAY);
    }

    firstRequest = false;
  });
}
