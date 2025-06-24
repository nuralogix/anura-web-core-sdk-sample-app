[Back to Main README](../README.md)

# Anura Web Core SDK - React Sample Application

## Create environment variables

Create two env files. One for production and one for development.

.prod.env

```
NODE_ENV=production
API_URL=api.deepaffex.ai
STUDY_ID=
LICENSE_KEY=
```

.dev.env

```
NODE_ENV=development
API_URL=api.deepaffex.ai
STUDY_ID=
LICENSE_KEY=
```

## Install dependencies

```bash
yarn
```

## Run in development mode

```bash
yarn watch
yarn serve:dev
```

## Run in production mode

```bash
yarn build
yarn serve:prod
```

