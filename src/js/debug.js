
const MOCKS = {
  "empty": {},
  "track-full": {
    "title": "High and Dry",
    "artist": "Radiohead",
    "album": "The Bends",
    "label": "XL",
    "image": "https:\/\/a.bff.fm\/image\/original\/1652951598hctxbXiV-cover-art.jpg",
    "url": "https:\/\/bff.fm\/now\/20220615120139",
    "program": "Trap and Noise at Noon",
    "presenter": "Lonald J Bandz, Kenny Davis",
    "program_image": "https:\/\/a.bff.fm\/image\/original\/1635980283bOzJbOBg-tnn_logo.png"
  },
  "track-no-art": {
    "title": "No Surprises",
    "artist": "Radiohead",
    "album": "OK Computer",
    "label": "XL",
    "image": null,
    "url": "https:\/\/bff.fm\/now\/20220615120139",
    "program": "Trap and Noise at Noon",
    "presenter": "Lonald J Bandz, Kenny Davis",
    "program_image": "https:\/\/a.bff.fm\/image\/original\/1635980283bOzJbOBg-tnn_logo.png"
  },
  "show-full": {
    "title": null,
    "artist": null,
    "album": null,
    "label": null,
    "image": null,
    "url": "https:\/\/bff.fm\/now\/20220615120139",
    "program": "Trap and Noise at Noon",
    "presenter": "Lonald J Bandz, Kenny Davis",
    "program_image": "https:\/\/a.bff.fm\/image\/original\/1635980283bOzJbOBg-tnn_logo.png"
  },
  "show-no-art": {
    "title": null,
    "artist": null,
    "album": null,
    "label": null,
    "image": null,
    "url": "https:\/\/bff.fm\/now\/20220615120139",
    "program": "No Magic",
    "presenter": "Ben Ward",
    "program_image": null
  },
  "next-show-full": {
    "show": "G's Chill Lounge\u00ae",
    "host": "Gina Alexander",
    "url": "https:\/\/bff.fm\/shows\/gs-chill-lounge",
    "start": "2022-06-15T14:00:00-07:00",
    "end": "2022-06-15T16:00:00-07:00",
    "image": "https:\/\/a.bff.fm\/image\/original\/image_3__2.jpg"
  },
  "next-show-no-art": {
    "show": "G's Chill Lounge\u00ae",
    "host": "Gina Alexander",
    "url": "https:\/\/bff.fm\/shows\/gs-chill-lounge",
    "start": "2022-06-15T14:00:00-07:00",
    "end": "2022-06-15T16:00:00-07:00",
    "image": null
  }
};

export default function init() {
  if (!document.querySelector('html.debug')) {
    return;
  }

  document.addEventListener('click', function (e) {
    if (!e.target.classList.contains('Debug-button')) {
      return;
    }

    const event = e.target.getAttribute('data-debug-event');
    const mockName = e.target.getAttribute('data-debug-mock');

    document.dispatchEvent(new CustomEvent(event, {
      bubbles: false,
      detail: MOCKS[mockName]
    }));
  });
}
