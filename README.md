# grocery-api



## Description of Variables

| Variable            | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `MONGO_URL`         | MongoDB connection string to access the grocery database.                   |
| `JWT_SCRET`         | Secret key used for signing JWT tokens. *(Note: `JWT_SECRET` may be intended)* |
| `JWT_EXPIRES_IN`    | Duration for which a JWT token remains valid (e.g., `7d`, `1h`).            |
| `GOOGLE_CLIENT_ID`  | OAuth 2.0 Client ID for enabling Google Sign-In.                            |

## Security Notice

Make sure not to expose this `.env` file or its contents in any public repositories. Add `.env` to your `.gitignore` file to avoid accidental commits:

