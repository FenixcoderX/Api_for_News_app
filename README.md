# API for News app

A RESTful API has been developed to support a "News" app. 

- **Authentication:** The API handles the registration and authentication process using JSON Web Tokens (JWT).
- **Endpoints and Models:** It provides required endpoints and models for users, news, notifications, files upload.
- **CRUD Operations:** It contains handlers for all necessary CRUD operations using the MongoDB database.
- **Security:** Specific endpoints are secured to prevent unauthorized access.
- **Real-Time Updates:** Websocket (socket.io) are used to send notifications about creating, updating or deleting news.

## Instructions

### 1. **ENV**

In repo, you will see a `.env-example` file. Rename the file to `.env`. 

To work with the database, you will need to register on the MongoDB website and create a new database. 

After creating the database, copy its connection string and paste it into the `.env` file, assigning it to the `MONGO` variable.

```env
MONGO=your_mongodb_connection_string
```

### 2. **Install the dependencies**

```bash
  npm install
```

### 3. **Now you can start the API**

```bash
  npm run watch
```


## API Endpoints

### News

| Function | Description | Method | Endpoint | Token required| 
| - | - | - | - | - |
| getAll | show all news | GET | /news/allnews | No |
| getAllPublished | show all published news | GET | /news/allpublishednews | No |
| create | create a new news item | POST | /news/create | Yes |
| update | update a news item | PUT | /news/update/:id | Yes |
| delete | delete a news item | DELETE | /news/delete/:id| Yes |

### Auth

| Function | Description | Method | Endpoint | Token required| 
| - | - | - | - | - |
| signup | register a new user | POST | /auth/signup | No |
| login | authenticate a user | POST | /auth/login | No |
| logout | log out a user | POST | /auth/logout | Yes |

### File Upload

| Function | Description | Method | Endpoint | Token required| 
| - | - | - | - | - |
| uploadFiles | upload files to the server | POST | /files/upload | Yes |

## Models

### News


| title | images | content | files| author| publishDate |status|
| - | - | - | - | - | - | - |
| String | [String] | String | [String] | mongoose.Schema.Types.ObjectId | Date| String|

### User

| email | password | name |
| - | - | - |
| String | String | String |

### NotificationNews

| user_id | author | type | news_id | message | date | read |
| - | - | - | - | - | - | - |
| mongoose.Schema.Types.ObjectId | mongoose.Schema.Types.ObjectId | String | mongoose.Schema.Types.ObjectId | String | Date | Boolean |