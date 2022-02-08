# BFF.fm App Show Widget

Standalone HTML widget for displaying the current on air BFF.fm content from our Creek CMS. Renders a bare UI component for displaying the current on-air track, show and upcoming schedule.

## Behaviour

Refreshes the data at a configured interval, designed to be embedded inside an app or webpage.

When a track with artwork is loaded, it will be the primary widget. When a track has no artwork, the show will take prominence, if no track is playing then the next show in the schedule will be displayed.

The widget will attempt to scale artwork to fill all available vertical space. Small layout alterations occur at tablet dimensions.

## Usage

* `npm install` to load dependences with node@16+
` npm scripr run build` to build HTML, CSS and JavaScript.
* Deploy or embed the html, css and js code from `/dist` to a web server or locally within an app.
* Note that external data requests to the station domains are required to load the font stylesheet, and to request the now playing data.

## Usage

* Deploy or embed the html, css and js code from `/src` to a web server or locally within an app.
* Note that external data requests to the station domains are required to load the font stylesheet, and to request the now playing data.

## Credits

* Author: Ben Ward [ben@bff.fm](ben@bff.fm), 2022.
