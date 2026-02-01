# Seeding Database

Run this command to seed the database with initial data:

```bash
npm run seed
```

This will create:
- 1 Company (Acme Corp)
- 3 Users:
  - **Manager**: manager1 / password123
  - **Senior**: senior1 / password123
  - **Junior**: junior1 / password123

The script is idempotent - safe to run multiple times without duplicating data.
