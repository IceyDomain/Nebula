# GitHub Codespaces ♥️ React

Welcome to your shiny new Codespace running React! We've got everything fired up and running for you to explore React.

You've got a blank canvas to work on from a git perspective as well. There's a single initial commit with the what you're seeing right now - where you go from here is up to you!

Everything you do here is contained within this one codespace. There is no repository on GitHub yet. If and when you’re ready you can click "Publish Branch" and we’ll create your repository and push up your project. If you were just exploring then and have no further need for this code then you can simply delete your codespace and it's gone forever.

This project was bootstrapped for you with [Vite](https://vitejs.dev/).

## Available Scripts

In the project directory, you can run:

### `npm start`

We've already run this for you in the `Codespaces: server` terminal window below. If you need to stop the server for any reason you can just run `npm start` again to bring it back online.

Runs the app in the development mode.\
Open [http://localhost:3000/](http://localhost:3000/) in the built-in Simple Browser (`Cmd/Ctrl + Shift + P > Simple Browser: Show`) to view your running application.

The page will reload automatically when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Google sign-in

Create a Google OAuth 2.0 **Web application** client ID in Google Cloud Console and add the app's origin (for local development, `http://localhost:3000`) to its authorized JavaScript origins. Set the client ID in the environment before starting Vite:

```sh
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com npm run dev
```

Google sign-in creates or reuses a regular local Nebula account. This prototype stores its users and active session in browser `localStorage`; it does not have a backend to verify Google ID tokens. Do not use this client-only authentication flow to protect production data or privileged operations.

## Profiles and store

The dashboard profile menu links to profile settings, where users can equip purchased avatar frames. The store supports background purchases, membership upgrades, avatar frames, and document templates. Tier discounts are shown in store prices and applied to the charge. Purchased document templates are available in Notes & Docs.

Profile data, purchases, documents, and schedules use browser `localStorage` and are not synced across devices. Community topics and replies use the Cloudflare D1 API: personal accounts share one forum and each configured organization has its own forum. The current browser-only sign-in is not verified by the API, and organization membership is not enforced server-side; treat names and forum contents as public and unverified.

Publishing costs 10 credits per started block of 2,000 letters and digits in the content (spaces and punctuation are not counted), before tier discounts. Publishing a document sends its plain text and formatted document HTML to the matching community forum; document HTML is sanitized before it is rendered.

## Site phase

The current phase is set in `src/sitePhase.js`. `testing` adds 1,000 credits to each locally stored account once per UTC day. Change it to `demo` to stop the daily credits and clear saved account lists the next time each browser loads the site after the phase switch. Demo mode does not add the built-in sample accounts.

Accounts are browser-local, so a phase switch cannot remotely clear accounts in other browsers or devices. This reset only removes account/session records; it does not clear other saved local data or server-side community posts.

## Unexpected application error codes

The app-wide error screen shows a stable code that users can share with support:

| Code | Meaning |
| --- | --- |
| `NEB-PAGE-001` | The For Schools page is currently unavailable. |
| `NEB-UI-001` | A page failed while rendering. |
| `NEB-JS-001` | An uncaught browser JavaScript error occurred. |
| `NEB-ASYNC-001` | A promise rejection was not handled. |
| `NEB-UNKNOWN-001` | Fallback code for an unclassified unexpected error. |

The catalog is maintained in `src/utils/errorCodes.js`. Expected form, network, and API failures continue to use their existing inline messages.

## Shared community database

The community API is served by the Cloudflare Worker configured in `wrangler.jsonc`. Before local or production use, create a D1 database and replace the placeholder `database_id` in that file with the UUID returned by Cloudflare:

```sh
npx wrangler d1 create nebula-community
```

Run `npm run dev:cloudflare` to build the site and start the Worker with a local D1 database. Local migrations are in `migrations/`. For a one-time automatic deployment setup, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository Actions secrets. The token must be allowed to deploy Workers and manage D1 migrations for this account. After that, pushes to `main` run tests and deploy the Worker and assets automatically; the workflow can also be started manually from the Actions tab.

To deploy manually, authenticate Wrangler with the Cloudflare account that owns the site and run:

```sh
npm run deploy
```

The deploy script applies D1 migrations remotely before deploying the Worker and static assets. Community data is not shared until the Worker is deployed with a real D1 database ID. The API currently accepts browser-supplied poster names and organization scopes because account authentication is client-side only; it does not verify identities or school membership. Do not treat those names as verified identities or post private information.

Community documents require migration `0002_document_html.sql`, which adds the `document_html` column. The regular deploy command and automatic deployment workflow apply it before deploying the Worker.

If the forum reports that its API returned HTML or a non-JSON response, the host is serving the single-page app fallback for `/api/community/...` instead of forwarding that path to the Worker. Deploy the site and Worker together with `npm run deploy`, and make sure the public site domain points to that Worker deployment. A static-only hosting deployment will not provide the community API.

## Remaining integrations

- Connect school announcements and activity feeds to a shared backend.
- Integrate Google Classroom data; the current dashboard link only opens Classroom.
- Add backend account storage and server-side Google credential verification before using this prototype with real user data.
- The older `PersonalTimetable` component is not routed in the app; its desktop notification option is not available in the active timetable screen.

## Learn More

You can learn more in the [Vite documentation](https://vitejs.dev/guide/).

To learn Vitest, a Vite-native testing framework, go to [Vitest documentation](https://vitest.dev/guide/)

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://sambitsahoo.com/blog/vite-code-splitting-that-works.html](https://sambitsahoo.com/blog/vite-code-splitting-that-works.html)

### Analyzing the Bundle Size

This section has moved here: [https://github.com/btd/rollup-plugin-visualizer#rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer#rollup-plugin-visualizer)

### Making a Progressive Web App

This section has moved here: [https://dev.to/hamdankhan364/simplifying-progressive-web-app-pwa-development-with-vite-a-beginners-guide-38cf](https://dev.to/hamdankhan364/simplifying-progressive-web-app-pwa-development-with-vite-a-beginners-guide-38cf)

### Advanced Configuration

This section has moved here: [https://vitejs.dev/guide/build.html#advanced-base-options](https://vitejs.dev/guide/build.html#advanced-base-options)

### Deployment

This section has moved here: [https://vitejs.dev/guide/build.html](https://vitejs.dev/guide/build.html)

### Troubleshooting

This section has moved here: [https://vitejs.dev/guide/troubleshooting.html](https://vitejs.dev/guide/troubleshooting.html)
