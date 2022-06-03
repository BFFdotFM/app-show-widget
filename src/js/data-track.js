// const HOST = 'http:localhost:8090';
const HOST = 'https://bff.fm';

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
    showInfo.image
  ].join(':');
}

export default function refresh() {
  fetchOnAir().then(function onAirResponse(data) {

    if (!data) {
      document.dispatchEvent(new CustomEvent('data:nowplaying:track:cleared', { bubbles: false }));
      document.dispatchEvent(new CustomEvent('data:nowplaying:show:cleared', { bubbles: false }));
      return;
    }

    let trackHash = hashTrack(data);
    let showHash = hashShow(data);

    // If the track data is the same, let it be
    if (trackHash !== lastTrackHash) {
      lastTrackHash = trackHash;
      document.dispatchEvent(new CustomEvent('data:nowplaying:track:changed', {
        bubbles: false,
        detail: data
      }));
    }

    if (showHash !== lastShowHash) {
      lastShowHash = showHash;
      document.dispatchEvent(new CustomEvent('data:nowplaying:show:changed', {
        bubbles: false,
        detail: data
      }));
    }
  });
}
