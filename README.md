# 🎬 YouTube Clone Backend (Node.js + Express + MongoDB)

Backend API for a full-featured **YouTube-like video platform**, built using **Node.js**, **Express.js**, **MongoDB**, and **Cloudinary**.
This backend powers functionalities such as authentication, channel management, video upload/streaming, posts, playlists, reactions (likes/dislikes), comments, and search — all with secure JWT authentication and strong validations.

---

## 🚀 Features

### ✅ **User Authentication & Authorization**

* Register, login, logout using JWT.
* Refresh token handled via secure cookies.
* Protected routes using `verifyJwt`.
* Upload user avatar & cover image.

---

### 🎥 **Video Management**

* Upload videos with thumbnail (Cloudinary support).
* Fetch, update, delete videos.
* Fetch videos by category.
* Change video thumbnail.
* Get all categories dynamically.

---

### 📺 **Channel Management**

* Create, edit, update, or delete channels.
* Avatar & banner upload for channels.
* Subscribe / unsubscribe to channels.
* Check if user is subscribed.
* Fetch channel details and owner channel.

---

### 💬 **Comments System**

* Add, edit, delete comments on:

  * Videos
  * Posts
  * Comments (nested comment support)
* Retrieve comments by parent type.

---

### ❤️ **Reaction System (Likes & Dislikes)**

* Toggle reaction on:

  * Videos
  * Posts
  * Comments
* Get reaction status for the logged-in user.

---

### 📝 **Posts System**

* Upload post images.
* Update and delete posts.
* Get all posts and post by ID.

---

### 📂 **Playlists**

* Create playlists.
* Add/remove videos from playlists.
* Delete playlist.
* Fetch playlists of a user.

---

### 🔍 **Search**

* Search videos dynamically using title, description, or category.

---

## 🏗️ Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Backend        | Node.js, Express.js               |
| Database       | MongoDB, Mongoose                 |
| Authentication | JWT                               |
| File Uploads   | Multer + Cloudinary               |
| Middleware     | Custom validators, error handlers |
| Logging        | Morgan                            |

---

## 📁 Folder Structure

```
youtube-backend/
│
├── public/
│   └── uploads/               # temporary file storage
│
├── src/
│   ├── controller/            # All route logic
│   │   ├── channel.controller.js
│   │   ├── comment.controller.js
│   │   ├── playlist.controller.js
│   │   ├── post.controller.js
│   │   ├── reaction.controller.js
│   │   ├── search.controller.js
│   │   ├── user.controller.js
│   │   └── video.controller.js
│   │
│   ├── db/
│   │   └── index.js           # Database connection
│   │
│   ├── middleware/            # Middlewares
│   │   ├── checkforfile.middleware.js
│   │   ├── checkParams.js
│   │   ├── error.middleware.js
│   │   ├── input.channelfields.verify.js
│   │   ├── input.userfields.verify.js
│   │   ├── multer.middleware.js
│   │   ├── verify.owner.js
│   │   ├── verifyChannel.js
│   │   └── verifyJwt.js
│   │
│   ├── model/                 # MongoDB models
│   │   ├── Category.model.js
│   │   ├── Channel.model.js
│   │   ├── Comment.model.js
│   │   ├── Playlist.model.js
│   │   ├── Post.model.js
│   │   ├── Reaction.model.js
│   │   ├── User.model.js
│   │   └── Video.model.js
│   │
│   ├── route/                 # Route definitions
│   │   ├── channel.route.js
│   │   ├── comment.route.js
│   │   ├── playlist.route.js
│   │   ├── post.route.js
│   │   ├── reaction.route.js
│   │   ├── search.route.js
│   │   ├── user.route.js
│   │   └── video.route.js
│   │
│   ├── util/
│   │   ├── APIerror.js
│   │   ├── APIresponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   │
│   ├── app.js                 # App configuration
│   └── index.js               # Server entry file
│
├── .env
├── package.json
└── package-lock.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```
PORT=5000
MONGODB_URI=your-mongodb-uri
ACCESS_TOKEN_SECRET=your-access-token
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-token
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000

CLOUDINARY_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

---

## 🧩 API Routes Overview

### 👤 **User Routes** (`/api/v1/user`)

| Method | Endpoint | Description             |
| ------ | -------- | ----------------------- |
| POST   | /create  | Register new user       |
| POST   | /login   | Login user              |
| POST   | /logout  | Logout user             |
| GET    | /        | Get logged-in user info |
| PUT    | /        | Update user info        |
| DELETE | /        | Delete user             |
| PUT    | /avatar  | Update avatar           |
| PUT    | /cover   | Update cover image      |

---

### 📺 **Channel Routes** (`/api/v1/channel`)

| Method | Endpoint          | Description        |
| ------ | ----------------- | ------------------ |
| GET    | /                 | Get own channel    |
| POST   | /                 | Create channel     |
| PUT    | /                 | Update channel     |
| DELETE | /                 | Delete channel     |
| GET    | /:id              | Get channel by ID  |
| POST   | /:id              | Subscribe          |
| DELETE | /:id              | Unsubscribe        |
| GET    | /subscription/:id | Check subscription |
| PUT    | /avatar           | Update avatar      |
| PUT    | /banner           | Update banner      |

---

### 🎥 **Video Routes** (`/api/v1/video`)

| Method | Endpoint       | Description            |
| ------ | -------------- | ---------------------- |
| GET    | /              | Get all videos         |
| POST   | /              | Upload video           |
| GET    | /category      | Get all categories     |
| GET    | /category/:id  | Get videos by category |
| PUT    | /thumbnail/:id | Update thumbnail       |
| GET    | /:id           | Get video by ID        |
| PUT    | /:id           | Update video           |
| DELETE | /:id           | Delete video           |

---

### 📝 **Post Routes** (`/api/v1/post`)

| Method | Endpoint | Description   |
| ------ | -------- | ------------- |
| GET    | /        | Get all posts |
| POST   | /        | Add post      |
| GET    | /:id     | Get post      |
| PUT    | /:id     | Update post   |
| DELETE | /:id     | Delete post   |

---

### 💬 **Comment Routes** (`/api/v1/comment`)

| Method | Endpoint     | Description          |
| ------ | ------------ | -------------------- |
| GET    | /video/:id   | Get comments (video) |
| POST   | /video/:id   | Add comment to video |
| GET    | /post/:id    | Get comments (post)  |
| POST   | /post/:id    | Comment on post      |
| GET    | /comment/:id | Get nested comments  |
| POST   | /comment/:id | Add nested comment   |
| PUT    | /:id         | Update comment       |
| DELETE | /:id         | Delete comment       |

---

### ❤️ **Reaction Routes** (`/api/v1/reaction`)

| Method | Endpoint   | Description     |
| ------ | ---------- | --------------- |
| GET    | /video/:id | Get reaction    |
| POST   | /video/:id | Like/dislike    |
| DELETE | /video/:id | Remove reaction |

*(Same for posts & comments)*

---

### 📂 **Playlist Routes** (`/api/v1/playlist`)

| Method | Endpoint    | Description           |
| ------ | ----------- | --------------------- |
| POST   | /           | Create playlist       |
| GET    | /:id        | Get user playlists    |
| PUT    | /:id        | Add video to playlist |
| DELETE | /:id        | Delete playlist       |
| PUT    | /remove/:id | Remove video          |

---

### 🔍 **Search Route** (`/api/v1/search`)

| Method | Endpoint | Description   |
| ------ | -------- | ------------- |
| GET    | /        | Search videos |

---

## 🛠️ Installation & Running

```bash
# Clone repository
git clone <your-repo-url>

# Move inside project
cd youtube-backend

# Install dependencies
npm install

# Create .env file
touch .env

# Run the server
npm run dev
```

Server runs on:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🧪 Testing (ThunderClient / Postman)

* Test user auth first (register/login)
* Test channel creation
* Upload videos with thumbnail
* Test reactions and comments
* Verify playlist operations
* Test search & filter
* Validate protected routes with JWT

---

## 🧑‍💻 Developer

**👤 Ashreek A R**
📧 [ashreekar767@gmail.com](mailto:ashreekar767@gmail.com)