import refreshNowPlaying from './data-track.js';
import refreshNextShow from './data-show.js';
import * as Fastly from './fastly.js';

const DEFAULT_IMAGE = 'https://aw.bff.fm/assets/art/pattern-grey/9d57e2497e07595604bbd02239b15048a321b29c.png';
const DEFAULT_COVERART = 'https://aw.bff.fm/assets/art/album-art-placeholder/a79c786a182e064925a69b40d69f20abc670e924.svg';
const DEFAULT_TITLE = 'BFF.fm';

const TRACK_UPDATE_FREQ = 10000; // 10 seconds
const SHOW_UPDATE_FREQ = 300000; // 5 minutes

export default function run() {

  document.addEventListener('data:nextshow:changed', function (e) {
    updateNextShow(e.detail);
    setVisibility();
  });
  document.addEventListener('data:nextshow:cleared', function() {
    clearNextShow();
    setVisibility();
  });
  document.addEventListener('data:nowplaying:track:changed', function (e) {
    updateNowPlayingTrack(e.detail);
    setVisibility();
  });
  document.addEventListener('data:nowplaying:track:cleared', function () {
    clearNowPlayingTrack();
    setVisibility();
  });
  document.addEventListener('data:nowplaying:show:changed', function (e) {
    updateCurrentShow(e.detail);
    refreshNextShow();
    setVisibility();
  });
  document.addEventListener('data:nowplaying:show:cleared', function () {
    clearCurrentShow();
    refreshNextShow();
    setVisibility();
  });

  window.setInterval(refreshNowPlaying, TRACK_UPDATE_FREQ);
  window.setInterval(refreshNextShow, SHOW_UPDATE_FREQ);

  refreshNowPlaying();
  refreshNextShow();
}

function updateNowPlayingTrack(nowPlayingInfo) {
  const widget = document.querySelector('#track');
  const title = widget.querySelector('.TrackContent-title');
  const artist = widget.querySelector('.TrackContent-artist');
  const release = widget.querySelector('.TrackContent-release');
  const image = widget.querySelector('.MetadataInfo-image');

  artist.textContent = nowPlayingInfo.artist;
  title.textContent = nowPlayingInfo.title;
  release.textContent = nowPlayingInfo.album;

  if (nowPlayingInfo.image) {
    widget.setAttribute('data-cover', '1');
    image.srcset = Fastly.srcSet(nowPlayingInfo.image);
    image.src = Fastly.sizeImage(nowPlayingInfo.image, 300);
  } else {
    widget.setAttribute('data-cover', '0');
    image.srcset = '';
    image.src = DEFAULT_COVERART;
  }

  widget.setAttribute('data-hydrated', '1');
}

function clearNowPlayingTrack() {
  let widget = document.querySelector('#track');
  let title = widget.querySelector('.TrackContent-title');
  let artist = widget.querySelector('.TrackContent-artist');
  let release = widget.querySelector('.TrackContent-release');
  let image = widget.querySelector('.MetadataInfo-image');

  widget.setAttribute('data-hydrated', '0');
  widget.setAttribute('data-cover', '0');
  title.textContent = '';
  artist.textContent = '';
  release.textContent = '';
  image.srcset = '';
  image.src = DEFAULT_COVERART;
}

function updateCurrentShow(nowPlayingInfo) {
  const widget = document.querySelector('#current-show');
  const title = widget.querySelector('.ScheduleContent-show');
  const host = widget.querySelector('.ScheduleContent-host');
  const image = widget.querySelector('.MetadataInfo-image');

  title.textContent = nowPlayingInfo.program;
  host.textContent = nowPlayingInfo.presenter;

  if (nowPlayingInfo.program_image) {
    widget.setAttribute('data-cover', '1');
    image.srcset = Fastly.srcSet(nowPlayingInfo.program_image);
    image.src = Fastly.sizeImage(nowPlayingInfo.program_image, 300);
  } else {
    widget.setAttribute('data-cover', '0');
    image.srcset = '';
    image.src = DEFAULT_IMAGE;
  }
  widget.setAttribute('data-hydrated', '1');
}

function clearCurrentShow() {
  const widget = document.querySelector('#current-show');
  const title = widget.querySelector('.ScheduleContent-show');
  const host = widget.querySelector('.ScheduleContent-host');
  const image = widget.querySelector('.MetadataInfo-image');

  widget.setAttribute('data-hydrated', '0');
  widget.setAttribute('data-cover', '0');
  title.textContent = DEFAULT_TITLE;
  host.textContetn = '';
  image.srcset = '';
  image.src = DEFAULT_IMAGE;
}

function updateNextShow(showInfo) {
  const widget = document.querySelector('#next-show');
  const title = widget.querySelector('.ScheduleContent-show');
  const host = widget.querySelector('.ScheduleContent-host');
  const time = widget.querySelector('.ScheduleContent-time');
  const image = widget.querySelector('.MetadataInfo-image');

  title.textContent = showInfo.show;
  host.textContent = showInfo.host;
  time.textContent = new Date(showInfo.start).toLocaleTimeString('en-us', {
    hour: 'numeric', minute: '2-digit'
  });

  if (showInfo.image) {
    widget.setAttribute('data-cover', '1');
    image.srcset = Fastly.srcSet(showInfo.image);
    image.src = Fastly.sizeImage(showInfo.image, 300);
  } else {
    widget.setAttribute('data-cover', '0');
    image.srcset = '';
    image.src = DEFAULT_IMAGE;
  }
  widget.setAttribute('data-hydrated', '1');
}

function clearNextShow() {
  const widget = document.querySelector('#next-show');
  const title = widget.querySelector('.ScheduleContent-show');
  const host = widget.querySelector('.ScheduleContent-host');
  const time = widget.querySelector('.ScheduleContent-time');
  const image = widget.querySelector('.MetadataInfo-image');

  widget.setAttribute('data-hydrated', '0');
  widget.setAttribute('data-cover', '0');
  title.textContent = '';
  host.textContent = '';
  time.textContent = '';
  image.srcset = '';
  image.src = DEFAULT_IMAGE;
}


function setVisibility() {
  const track = document.querySelector('#track');
  const show = document.querySelector('#current-show');
  const upcoming = document.querySelector('#next-show');

  // Determining factors for layout

  // TODO: Support timing out old tracks; reducing previous track when nolonger playing

  const trackHydrated = !!track.getAttribute('data-hydrated');
  const upcomingHydrated = !!upcoming.getAttribute('data-hydrated');
  const trackArt = trackHydrated && !!track.getAttribute('data-cover');
  const showArt = !!show.getAttribute('data-hydrated') && !!show.getAttribute('data-cover');

  // Expand the current track when an image is available, other wise expand
  // the current show
  show.classList.toggle('is-expanded', !trackArt);
  track.classList.toggle('is-expanded', trackArt);

  // Hide track data in favour of upcoming show when there is no 'previous track' data displayed
  track.classList.toggle('is-hidden', !trackHydrated);
  upcoming.classList.toggle('is-hidden', trackHydrated || !upcomingHydrated);
}

run();
