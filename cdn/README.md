[Back to Main README](../README.md)

# Anura Web Core SDK

<img src="../shared/anura-web-core-sdk.svg" width="128"/>

## Setup

1. Install Node.js v23.6.0 or higher.

2. Install the server packages:

```bash
cd server
yarn
cd ..
```

3. Update the environment variables:

Switch to the `cdn` folder and update the `.env` file with your `STUDY_ID` and
`LICENSE_KEY`.

4. Run the server:

```bash
yarn start
```

5. Open the browser and
    - a. Navigate to `http://localhost:7000` to test the SDK with a webcam
    - b. Navigate to `http://localhost:7000/video.html` to test the SDK with
    a video file


## Load from a CDN
You can use `Anura Web Core SDK` directly in the browser via a CDN such as
unpkg or jsDelivr.

### Using Import Maps

You can use [importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)
to reference the SDK:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anura Web Core SDK</title>
    <script type="importmap">
        {
          "imports": {
            "@nuralogix.ai/anura-web-core-sdk": "https://unpkg.com/@nuralogix.ai/anura-web-core-sdk",
            "@nuralogix.ai/anura-web-core-sdk/helpers": "https://unpkg.com/@nuralogix.ai/anura-web-core-sdk/lib/helpers/index.min.mjs",
            "@nuralogix.ai/anura-web-core-sdk/masks/vital": "https://unpkg.com/@nuralogix.ai/anura-web-core-sdk/lib/masks/vital/index.mjs"
          }
        }
    </script>
    <style>
        .measurement-container {width: 360px; height: 640px;}
    </style>
</head>
<body>
    <div class="measurement-container">
        <div id="measurement"></div>
    </div>
    <script type="module">
        import { Measurement, faceAttributeValue, faceTrackerState } from '@nuralogix.ai/anura-web-core-sdk';
        import helpers from "@nuralogix.ai/anura-web-core-sdk/helpers";
        import { VitalMask } from "@nuralogix.ai/anura-web-core-sdk/masks/vital";

        const { CameraController } = helpers;
        const camera = CameraController.init();

        const mediaElement = document.getElementById('measurement');
        if (mediaElement && mediaElement instanceof HTMLDivElement) {
            const settings = {
                mediaElement,
                assetFolder: 'https://unpkg.com/@nuralogix.ai/anura-web-core-sdk/lib/assets',
                apiUrl: 'api.deepaffex.ai',
                mirrorVideo: true,
                displayMediaStream: true,
                metrics: false
            };
            const measurement = await Measurement.init(settings);
            const mask = new VitalMask();
        }        
    </script>
  </body>
</html>        
```

### Using Direct ES Module Import
Alternatively, you can import the module directly from a CDN without using import maps:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anura Web Core SDK</title>
    <style>
        .measurement-container {width: 360px; height: 640px;}
    </style>
</head>
<body>
    <div class="measurement-container">
        <div id="measurement"></div>
    </div>
    <script type="module">
        import { Measurement, faceAttributeValue, faceTrackerState } from 'https://unpkg.com/@nuralogix.ai/anura-web-core-sdk/lib/index.min.mjs';
        import helpers from "https://unpkg.com/@nuralogix.ai/anura-web-core-sdk/lib/helpers/index.min.mjs";
        import { VitalMask } from "https://unpkg.com/@nuralogix.ai/anura-web-core-sdk/lib/masks/vital/index.mjs";

        const { CameraController } = helpers;
        const camera = CameraController.init();

        const mediaElement = document.getElementById('measurement');
        if (mediaElement && mediaElement instanceof HTMLDivElement) {
            const settings = {
                mediaElement,
                assetFolder: 'https://unpkg.com/@nuralogix.ai/anura-web-core-sdk/lib/assets',
                apiUrl: 'api.deepaffex.ai',
                mirrorVideo: true,
                displayMediaStream: true,
                metrics: false
            };
            const measurement = await Measurement.init(settings);
            const mask = new VitalMask();
        }        
    </script>
  </body>
</html>        
```