# materials-backend
📝 Node.js server supporting "material" - a knowledge database platform.

## Start on local machine
Clone repository
```bash
git clone https://github.com/vladislavkn/materials-backend.git
cd materials-backend
```
Install dependencies & compile source code
```bash
npm i
npm run build
```
Build docker container with database
```bash
docker-compose up --build db
```
Run the server
```bash
npm run start
```

## ENV variables

| Name          | Default value                          |
|---------------|----------------------------------------|
| PORT          | 3000                                   |
| DB_PORT       | 5432                                   |
| DB_USERNAME   | root                                   |
| DB_PASSWORD   | root                                   |
| DB_NAME       | root                                   |
| DB_HOST       | localhost                              |
| DB_TYPE       | postgres                               |
| IS_PRODUCTION | process.env.NODE_ENV  ==  "production" |
