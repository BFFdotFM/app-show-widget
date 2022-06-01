(function () {
  // Configuration
  const DEFAULT_IMAGE = 'https://aw.bff.fm/assets/art/pattern-grey/9d57e2497e07595604bbd02239b15048a321b29c.png';
  const DEFAULT_COVERART = 'https://aw.bff.fm/assets/art/album-art-placeholder/a79c786a182e064925a69b40d69f20abc670e924.svg';
  const DEFAULT_TITLE = 'BFF.fm';

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

  // Data Fetch
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

  function fetchSchedule() {
    return window.fetch(`${HOST}/api/data/shows/next.json`, {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit',
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    })
      .then(response => response.json())
      .catch(error => {
        console.error('HTTP error fetching Next Show info', error);
        return false;
      });
  }

  // Fastly Image Generation
  function fastlySizeImage(url, size) {
    return `${url}?width=${size}&height${size}&fit=crop`;
  }

  function fastlySrcSet(url) {
    return [100, 300, 500, 1000]
      .map(size => `${fastlySizeImage(url, size)} ${size}w`)
      .join(',');
  }

  // Utils
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

  function setVisibility(nowPlayingInfo) {
    const show = document.querySelector('#current-show');
    const track = document.querySelector('#track');
    const upcoming = document.querySelector('#next-show');

    // Expand the current track when an image is available, other wise expand
    // the current show
    show.classList.toggle('is-expanded', !nowPlayingInfo.image);
    track.classList.toggle('is-expanded', !!nowPlayingInfo.image);

    // Hide track data in favour of upcoming show when there is no 'previous track' data
    track.classList.toggle('is-hidden', !nowPlayingInfo.title && !previousTrackInfo);
    upcoming.classList.toggle('is-hidden', nowPlayingInfo.title || previousTrackInfo);
  }

  function updateShow(nowPlayingInfo) {
    let widget = document.querySelector('#current-show');
    let title = widget.querySelector('.ScheduleContent-show');
    let host = widget.querySelector('.ScheduleContent-host');
    let image = widget.querySelector('.MetadataInfo-image');

    if (nowPlayingInfo == false) {
      debug('No show info returned; reverting to defaults');
      title.textContent = DEFAULT_TITLE;
      image.srcset = '';
      image.src = DEFAULT_IMAGE;
      return;
    }

    title.textContent = nowPlayingInfo.program;
    host.textContent = nowPlayingInfo.presenter;

    if (nowPlayingInfo.program_image) {
      image.srcset = fastlySrcSet(nowPlayingInfo.program_image);
      image.src = fastlySizeImage(nowPlayingInfo.program_image, 300);
      debug('Generated image URLs', image.src, image.srcsrc);
    } else {
      debug('No image in response; reverting to default image');
      image.srcset = '';
      image.src = DEFAULT_IMAGE;
    }
  }

  function updateTrack(nowPlayingInfo) {
    let widget = document.querySelector('#track');
    let title = widget.querySelector('.TrackContent-title');
    let artist = widget.querySelector('.TrackContent-artist');
    let release = widget.querySelector('.TrackContent-release');
    let image = widget.querySelector('.MetadataInfo-image');

    if (nowPlayingInfo == false) {
      nowPlayingInfo = previousTrackInfo;
    }

    if (nowPlayingInfo == false) {
      debug('No track info returned; reverting to defaults');
      title.textContent = '';
      artist.textContent = '';
      release.textContent = '';
      image.srcset = '';
      image.src = DEFAULT_COVERART;
      return;
    }

    artist.textContent = nowPlayingInfo.artist;
    title.textContent = nowPlayingInfo.title;
    release.textContent = nowPlayingInfo.album;

    if (nowPlayingInfo.image) {
      image.srcset = fastlySrcSet(nowPlayingInfo.image);
      image.src = fastlySizeImage(nowPlayingInfo.image, 300);
      debug('Generated image URLs', image.src, image.srcsrc);
    } else {
      debug('No image in response; reverting to default image');
      image.srcset = '';
      image.src = DEFAULT_COVERART;
    }
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
