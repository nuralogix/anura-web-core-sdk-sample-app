import esbuild from 'rollup-plugin-esbuild';
import del from 'rollup-plugin-delete';
import html from '@rollup/plugin-html';
import postcss from 'rollup-plugin-postcss';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const isDevelopment = process.env.NODE_ENV === 'development';

const distFolder = 'dist';

const config = [
    {
        // input file
        input: './src/index.ts',
        // output file
        output: [
            {
                dir: `./${distFolder}`,
                format: 'es',
                sourcemap: isDevelopment,
                entryFileNames: 'bundle-[hash].mjs',
            },
        ],
        plugins: [
            // delete dist folder before building
            del({ targets: 'dist/*' }),
            // resolve node modules
            nodeResolve(),
            // transpile typescript to javascript
            esbuild({
                target: 'ES2022',
                minify: process.env.NODE_ENV === 'production',
            }),
            // extract CSS to separate file
            postcss({ extract: true }),
            // generate index.html file and add it to dist folder
            html({
                fileName: 'index.html',
                template: ({ bundle, files  }) => {
                    return getHtmlTemplate(Object.keys(bundle)[0], files.css[0].fileName);
               }
            })
        ]
    }
];

// generate html template
const getHtmlTemplate = (bundleFileName, cssfileName) => {
return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="${cssfileName}">
    <title>Anura Web Core SDK - Typescript</title>
</head>
<body>
    <div id="app" class="is-hidden">
        <section>
            <div class="logo-container">
                <div>
                    <img src="anura-web-core-sdk.svg" alt="SVG Image" width="112" height="112">
                </div>
                <div class="header">
                    Anura Web Core SDK
                </div>
            </div>
            <hr>
            <div>
                <div>
                    <select title="camera-select" id="camera-list"></select>
                </div>
                <button type="button" id="toggle-camera" disabled>Open</button>
                <button type="button" id="toggle-measurement" disabled>Start Measurement</button>
            </div>
        </section>
        <div class="measurement-container">
            <div id="measurement"></div>
        </div>
    </div>
    <div id="progress-container">
        <div id="progress-bar"></div>
    </div>
    <script type="module" src="${bundleFileName}"></script>
</body>
</html>`;    
};

export default config;