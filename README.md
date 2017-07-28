# Hawkular UI

## Hakwular Metrics UI

This repo contains the embedded UI of [Hawkular Metrics](http://www.hawkular.org/) ([github](https://github.com/hawkular/hawkular-metrics))

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.1.3.

## Development server

From `metrics` directory, Run `ng serve --base-href="/"` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

You need to have a running Hawkular Metrics server on `http://localhost:8080` to allow server communciation. Eventually you can configure it in `src/environments/environment.ts`.

Note that in release builds (ie. with -prod flag), the prod environment is loaded, url becomes relative to serving host and base-href is `/hawkular/metrics/ui/`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Testing dev changes within Hawkular Metrics

Hawkular Metrics pulls the `dist` directory of hawkular-ui from github. To test UI changes within metrics:

- Checkout the `release` branch and merge your work in. Unlike other remote branches, `release` contains the `dist` directory. Or alternatively you can remove `dist` from `.gitignore` and commit, but make sure you won't send a pull request with that commit.
- Build this project `ng build -prod --aot=false` (the -prod flag is important as `prod` environment is configured to use the hosting server for metrics url)
- Open the `pom.xml` of `hawkular-metrics-api-jaxrs` and edit properties:
  - `hawkular-ui.git.repo` to your GIT repo (example for hawkular-ui cloned in `/work` of local filesystem: `scm:git:/work/hawkular-ui/.git`)
  - `hawkular-ui.git.branch` to your local branch that contains `dist`
- Rebuild Hawkular Metrics, enjoy.

## Release (prod) build

- Switch to the `release` branch and merge `master` in (be sure to fetch/rebase upstream first).
- Run `ng build -prod`
- Commit and push to upstream's release

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

