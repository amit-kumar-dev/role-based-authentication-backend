# role-based-authentication-backend
Music &amp; Album Management Backend

A Node.js + Express backend for managing music uploads and album creation, supporting:
Single music uploads
Creating albums from existing music
Creating albums while uploading multiple new tracks
MinIO (S3‑compatible) storage
JWT‑based authentication

#🚀 Features
✅ Upload single music tracks
✅ Create albums using existing uploaded music IDs
✅ Create albums while uploading multiple new tracks
✅ Store files in MinIO (S3 compatible)
✅ Role‑based authentication (Artist only)
✅ MongoDB for metadata storage

#🛠️ Tech Stack
Node.js
Express.js
MongoDB + Mongoose
Multer (multipart/form‑data handling)
MinIO (S3 compatible object storage)
AWS SDK v3 (MinIO client)
JWT Authentication

📁 Project Structure
src/
├── controllers/
│   ├── music.controller.js
│   └── album.controller.js
├── models/
│   ├── music.model.js
│   └── album.model.js
├── routes/
│   └── music.route.js
├── middlewares/
│   ├── upload.middleware.js
│   └── auth.middleware.js
├── services/
│   └── storage.service.js
├── config/
│   └── minio.js
└── server.js

#⚙️ Environment Variables
Create a .env file in the root directory:

PORT=3000

MONGO_URI=mongodb://localhost:27017/music-db

JWT_SECRET=your_jwt_secret

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=images
MINIO_PUBLIC_URL=http://localhost:9000
MAX_FILE_SIZE=104857600

#▶️ Run the Project
Shellnpm installnpm run devShow more lines
Server will start at:
http://localhost:3000

