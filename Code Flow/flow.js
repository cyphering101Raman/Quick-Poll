/*

BACKEND/
├── node_modules/           ← npm dependencies
├── Notes/                  ← your custom notes (like notes.js)
├── src/
│   ├── db/
│   │   └── index.js        ← MongoDB connection logic
│   ├── app.js              ← Express app (routes, middleware)
│   ├── constants.js        ← Global constants like DB_NAME
│   └── index.js            ← Main entry point (calls connectDB, starts server)
├── .env                    ← Secrets & config (PORT, MONGODB_URI, etc.)
├── .gitignore              ← To exclude node_modules, .env, etc.
├── package-lock.json       ← npm lock file
├── package.json            ← Project metadata and dependencies

*/