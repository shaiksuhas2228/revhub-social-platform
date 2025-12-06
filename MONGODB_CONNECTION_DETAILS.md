# MongoDB Connection Details - RevHub Project

## 📋 Summary
All MongoDB connections in this project use:
- **Database Name**: `revhubteam4`
- **Default Port**: `27017`
- **Collections**: `chatMessage`, `notificationMongo`

---

## 🔧 Configuration Files

### 1. **application.properties** (Backend Configuration)
**Location**: `revHubBack/src/main/resources/application.properties`

```properties
spring.data.mongodb.uri=${MONGO_URI:mongodb://localhost:27017/revhubteam4}
spring.data.mongodb.auto-index-creation=true
```

**Details**:
- Uses environment variable `MONGO_URI` or defaults to `mongodb://localhost:27017/revhubteam4`
- Auto-creates indexes for better performance
- Used when running backend locally (non-Docker)

---

### 2. **backend.env.properties** (Docker Environment)
**Location**: `backend.env.properties`

```properties
MONGO_URI=mongodb://host.docker.internal:27017/revhubteam4
```

**Details**:
- Used by Docker containers
- `host.docker.internal` allows Docker container to access host MongoDB
- Loaded by Jenkins pipeline when deploying backend container

---

### 3. **MongoConfig.java** (Java Configuration)
**Location**: `revHubBack/src/main/java/com/example/revHubBack/config/MongoConfig.java`

```java
@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {
    @Override
    protected String getDatabaseName() {
        return "revhubteam4";
    }
}
```

**Details**:
- Hardcoded database name: `revhubteam4`
- Spring Boot MongoDB configuration class

---

## 🐳 Docker & Jenkins Configuration

### 4. **Jenkinsfile** (CI/CD Pipeline)
**Location**: `Jenkinsfile`

```groovy
// MongoDB Setup Stage
bat 'docker ps -a | findstr mongo-revhub && docker start mongo-revhub || docker run -d --name mongo-revhub -p 27017:27017 mongo:latest'

// Initialize Collections
bat 'docker exec mongo-revhub mongosh revhubteam4 --eval "db.createCollection(\'chatMessage\'); db.createCollection(\'notificationMongo\'); ..."'
```

**Details**:
- Container name: `mongo-revhub`
- Port mapping: `27017:27017`
- Database: `revhubteam4`
- Auto-creates collections and indexes

---

### 5. **init-mongodb.js** (Initialization Script)
**Location**: `init-mongodb.js`

```javascript
use revhubteam4

db.createCollection("chatMessage");
db.createCollection("notificationMongo");

// Indexes
db.chatMessage.createIndex({"senderId": 1, "receiverId": 1, "timestamp": -1});
db.chatMessage.createIndex({"senderUsername": 1, "receiverUsername": 1});
db.notificationMongo.createIndex({"userId": 1, "createdDate": -1});
db.notificationMongo.createIndex({"userId": 1, "readStatus": 1});
```

---

## 📊 Collections & Indexes

### Collection: `chatMessage`
**Indexes**:
1. `{senderId: 1, receiverId: 1, timestamp: -1}` - For conversation queries
2. `{senderUsername: 1, receiverUsername: 1}` - For username-based queries

**Fields**:
- `senderId`, `senderUsername`
- `receiverId`, `receiverUsername`
- `content`, `timestamp`, `read`

---

### Collection: `notificationMongo`
**Indexes**:
1. `{userId: 1, createdDate: -1}` - For user notifications sorted by date
2. `{userId: 1, readStatus: 1}` - For unread notifications

**Fields**:
- `userId`, `fromUserId`, `fromUsername`
- `type`, `message`, `readStatus`
- `createdDate`, `followRequestId`, `postId`

---

## 🔌 Connection Scenarios

### Scenario 1: Local Development (Non-Docker)
```
mongodb://localhost:27017/revhubteam4
```
- Backend runs on host machine
- MongoDB runs on host machine or Docker
- Used by: `application.properties` default value

---

### Scenario 2: Docker Backend → Host MongoDB
```
mongodb://host.docker.internal:27017/revhubteam4
```
- Backend runs in Docker container
- MongoDB runs on host machine
- Used by: `backend.env.properties`

---

### Scenario 3: Docker Backend → Docker MongoDB
```
mongodb://mongo-revhub:27017/revhubteam4
```
- Backend runs in Docker container
- MongoDB runs in Docker container named `mongo-revhub`
- Used by: Docker network (if configured)

---

### Scenario 4: Jenkins Pipeline
```
Container: mongo-revhub
Port: 27017:27017
Database: revhubteam4
```
- MongoDB runs in Docker container
- Backend connects via `host.docker.internal:27017`
- Auto-initialized by Jenkins pipeline

---

## 🛠️ Quick Commands

### Check MongoDB Connection
```bash
# From host
mongosh mongodb://localhost:27017/revhubteam4

# From Docker
docker exec -it mongo-revhub mongosh revhubteam4
```

### Verify Collections
```bash
docker exec mongo-revhub mongosh revhubteam4 --eval "db.getCollectionNames()"
```

### Check Data
```bash
# Chat messages
docker exec mongo-revhub mongosh revhubteam4 --eval "db.chatMessage.find().pretty()"

# Notifications
docker exec mongo-revhub mongosh revhubteam4 --eval "db.notificationMongo.find().pretty()"
```

### Verify Connection from Backend
```bash
docker logs backend | grep -i mongo
```

---

## ⚠️ Important Notes

1. **Database Name Consistency**: Always use `revhubteam4` (not `revhub` or `revhubteam7`)

2. **Docker Host Access**: 
   - Use `host.docker.internal` for Docker containers to access host services
   - Use `localhost` for host applications

3. **Port Conflicts**: Ensure port 27017 is not used by other services

4. **Auto-Initialization**: Jenkins pipeline automatically:
   - Starts/creates MongoDB container
   - Creates collections
   - Creates indexes
   - Verifies connection

5. **Environment Variables**: 
   - `MONGO_URI` can override default connection string
   - Set in `backend.env.properties` for Docker deployments

---

## 🔍 Troubleshooting

### Connection Refused
```bash
# Check if MongoDB is running
docker ps | findstr mongo-revhub

# Start MongoDB
docker start mongo-revhub

# Check logs
docker logs mongo-revhub
```

### Wrong Database
```bash
# Verify database name in MongoConfig.java
# Should be: revhubteam4
```

### Missing Collections
```bash
# Run initialization script
docker exec -i mongo-revhub mongosh < init-mongodb.js
```

---

## 📝 Summary Table

| Component | Connection String | Database | Port |
|-----------|------------------|----------|------|
| Local Backend | `mongodb://localhost:27017/revhubteam4` | revhubteam4 | 27017 |
| Docker Backend | `mongodb://host.docker.internal:27017/revhubteam4` | revhubteam4 | 27017 |
| Jenkins Pipeline | Container: `mongo-revhub` | revhubteam4 | 27017 |
| MongoConfig.java | (Uses spring.data.mongodb.uri) | revhubteam4 | - |

---

**Last Updated**: 2025-12-06
**Project**: RevHub Social Platform
**MongoDB Version**: latest (Docker image)
