# EVO BLOG API

This API is used for [evo blog](https://github.com/gorgila/evo-blog).


## Usage

Before starting, please make sure **MySQL** and **NodeJS** are installed on your local machine.

Install the required node modules
```sh
$ npm install
```

#### Database Setup

Create a local MySQL database on your computer and modify the **mysql.js** configuration file to match.  For example:

```javascript
mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'username',
    password: 'password',
    database: 'databasename',
    multipleStatements: true,
    debug: false
})
```

#### Run Server

Run the API server using
```sh
$ npm run server
```

#### Create Administrator

Before create an administrator user, please ensure your project root folder **does not** contain a `admin.lock` file.

Open the backend in a browser at `http://localhost:2048/api/backend` and create a new administrator.

------------
#### ACKNOWLEDGEMENTS

This backend is based on [lincenying's project](https://github.com/lincenying/mmf-blog-api-v2) (as of October 2017).  Major changes to the project include:
- Switched the entire project from MongoDB to MySQL.
- Made various bug fixes to the existing code base.

------------
#### LICENSE

MIT