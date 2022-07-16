# materials-backend

📝 Node.js server supporting "material" - a knowledge database platform.

## Start on local machine

```bash
# Clone repository
git clone https://github.com/vladislavkn/materials-backend.git
cd materials-backend
```

```bash
# Install dependencies & compile source code
npm i
npm run build
```

```bash
# Build docker container with database
docker-compose up --build db
```

```bash
# Run the server
npm run start
```

## ENV variables

| Name          | Default value                        |
| ------------- | ------------------------------------ |
| PORT          | 3000                                 |
| DB_PORT       | 5432                                 |
| DB_USERNAME   | root                                 |
| DB_PASSWORD   | root                                 |
| DB_NAME       | root                                 |
| DB_HOST       | localhost                            |
| DB_TYPE       | postgres                             |
| IS_PRODUCTION | process.env.NODE_ENV == "production" |
| ORIGIN        | http://localhost:3000                |
