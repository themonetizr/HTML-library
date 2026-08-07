# Public ad viewer

Standalone, public preview application and starting point for the remake of
`../makeswift-mockup-builder.html`.

The interface is defined in `index.html` and controlled by regular browser
JavaScript in `ad-viewer.js`. It has no framework, build step,
authentication, remote upload service, or private backend dependency.

Supported backgrounds:

- preset game screenshots loaded from a public CDN, with Landslice first;
- local JPEG, PNG, or animated GIF up to 10 MB;
- required square JPEG or PNG logo for the on-screen reward button;
- required public video URL or local video file up to 10 MB.

The reward button mirrors the structure used in the Makeswift mockup builder.
It displays the selected logo over the game background and starts the prepared
video when clicked. The button can be dragged with a mouse or touch and remains
inside the visible device viewport when repositioned, resized, or rotated.
