# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Development

To run the app locally for development, use the following command:

```bash
npm run dev
```

## Deployment

This application is configured for **Firebase App Hosting**. To deploy it, you will need to have the [Firebase CLI](https://firebase.google.com/docs/cli) installed.

1.  **Install Firebase CLI** (if you haven't already):
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Firebase**:
    ```bash
    firebase login
    ```

3.  **Initialize Firebase in your project** (only needs to be done once):
    If you haven't already associated this project with a Firebase project, run:
    ```bash
    firebase init apphosting
    ```
    Follow the prompts to select your Firebase project.

4.  **Deploy your application**:
    Run the following command from your project's root directory:
    ```bash
    firebase deploy
    ```

After the command completes, the CLI will output the URL of your live application.
