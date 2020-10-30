# with-me-srv

[![generator-api](https://img.shields.io/badge/built%20with-generator--api-green.svg)](https://github.com/ndelvalle/generator-api)

Backend Server for WithMeApp

Controller:
HTTP layer, in this instance you can manage express request, response and next. In lib/controller are the basic RESTful methods find, findOne, findById, create, update and remove. Because this class is extending from there, you got that solved. You can overwrite extended methods or create custom ones here.

Facade:
This layer works as a simplified interface of mongoose and as business model layer, in this instance you can manage your business logic. Here are some use case examples:

Validate collection x before creating collection y
Create collection x before creating collection y
In lib/facade you have the basic support for RESTful methods. Because this class is extending from there, you got that solved. You can overwrite extended methods or create custom ones here. Also you can support more mongoose functionality like skip, sort etc.



## dependencies

node 6.3.x or later and mongodb

## developing

node --inspect index.js

run mongodd on a separated terminal instance:

```
mongod
```

run the app:

```bash
npm run dev
```

the app runs on `localhost:8080`

## production

_you'll likely be consuming mongodb as a service, so make sure you set the env var to connect to it._

```bash
npm start
```






--------------------------------------------------------------------------------
