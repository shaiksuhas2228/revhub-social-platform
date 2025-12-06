# MongoDB Integration Fix Guide

## Issues Fixed

1. **Chat messages not sending (400 Bad Request)**
   - Fixed ChatController to accept both 'receiver' and 'receiverUsername' parameters
   - Added comprehensive error handling and logging
   - Added validation for null parameters

2. **Follow button not working (400 Bad Request)**
   - Added error handling in FollowService
   - Added MongoDB notification creation with proper error handling
   - Ensured readStatus field is set on all notifications

3. **Notifications not loading**
   - Added logging to track notification creation and retrieval
   - Ensured MongoDB connection is properly configured
   - Added readStatus field to all notification types

## Setup Steps

### 1. Initialize MongoDB

Run the initialization script to create collections and indexes:

```bash
init-mongo.bat
```

This will:
- Start MongoDB container if not running
- Create `chatMessage` and `notificationMongo` collections
- Create indexes for optimal performance

### 2. Verify MongoDB Connection

Check if MongoDB is running:

```bash
docker ps | findstr mongo-revhub
```

Test MongoDB connection:

```bash
docker exec -it mongo-revhub mongosh revhubteam4 --eval "db.stats()"
```

### 3. Check Collections

Verify collections exist:

```bash
docker exec -it mongo-revhub mongosh revhubteam4 --eval "db.getCollectionNames()"
```

Should show: `["chatMessage", "notificationMongo"]`

### 4. Restart Backend

After initializing MongoDB, restart the backend:

```bash
cd revHubBack
mvn clean compile spring-boot:run
```

## Troubleshooting

### Chat Messages Not Sending

1. Check backend logs for errors:
   - Look for "ChatService: Sending message from..."
   - Look for "ChatService: Message saved with ID..."

2. Verify MongoDB is accessible:
   ```bash
   docker exec -it mongo-revhub mongosh revhubteam4 --eval "db.chatMessage.find().count()"
   ```

3. Check if users exist in MySQL:
   - Both sender and receiver must exist in the users table

### Follow Button Not Working

1. Check backend logs for:
   - "NotificationMongoService: Creating follow request notification..."
   - "NotificationMongoService: Follow request notification saved with ID..."

2. Verify follow relationship in MySQL:
   ```sql
   SELECT * FROM follows WHERE follower_id = ? AND following_id = ?;
   ```

3. Check MongoDB for notification:
   ```bash
   docker exec -it mongo-revhub mongosh revhubteam4 --eval "db.notificationMongo.find().pretty()"
   ```

### Notifications Not Loading

1. Check backend logs:
   - "NotificationMongoService: Getting notifications for user..."
   - "NotificationMongoService: Found X notifications"

2. Verify notifications exist in MongoDB:
   ```bash
   docker exec -it mongo-revhub mongosh revhubteam4 --eval "db.notificationMongo.find({userId: 'USER_ID'}).pretty()"
   ```

3. Check MongoDB connection in application.properties:
   ```properties
   spring.data.mongodb.uri=mongodb://localhost:27017/revhubteam4
   ```

## Testing

### Test Chat

1. Login as user1
2. Search for user2 in chat
3. Send a message
4. Check backend logs for success messages
5. Check MongoDB:
   ```bash
   docker exec -it mongo-revhub mongosh revhubteam4 --eval "db.chatMessage.find().pretty()"
   ```

### Test Follow

1. Login as user1
2. Go to user2's profile
3. Click Follow button
4. Check backend logs for notification creation
5. Login as user2
6. Check notifications tab

### Test Notifications

1. Perform actions that create notifications (follow, like, comment)
2. Check backend logs for notification creation
3. Refresh notifications tab
4. Verify notifications appear

## Common Errors

### Error: "Sender not found" or "Receiver not found"
- **Cause**: User doesn't exist in MySQL database
- **Fix**: Ensure both users are registered and exist in the users table

### Error: "Failed to send message"
- **Cause**: MongoDB connection issue or validation error
- **Fix**: 
  1. Check MongoDB is running: `docker ps | findstr mongo`
  2. Check backend logs for detailed error
  3. Verify MongoDB URI in application.properties

### Error: "No notifications found"
- **Cause**: MongoDB collection empty or connection issue
- **Fix**:
  1. Perform actions to create notifications
  2. Check MongoDB: `db.notificationMongo.find().count()`
  3. Verify MongoDB connection

## Backend Logs to Monitor

When testing, watch for these log messages:

**Chat:**
- `ChatService: Sending message from X to Y`
- `ChatService: Saving message to MongoDB...`
- `ChatService: Message saved with ID: ...`

**Notifications:**
- `NotificationMongoService: Creating [type] notification...`
- `NotificationMongoService: [type] notification saved with ID: ...`
- `NotificationMongoService: Getting notifications for user: ...`
- `NotificationMongoService: Found X notifications`

**Follow:**
- `NotificationMongoService: Creating follow request notification...`
- `NotificationMongoService: Follow request notification saved with ID: ...`

## Success Indicators

✅ Chat working:
- Messages send without 400 error
- Messages appear in conversation
- Backend logs show successful save

✅ Follow working:
- Follow button changes state
- No 400 error in console
- Notification created in MongoDB

✅ Notifications working:
- Notifications appear in tab
- Unread count updates
- Backend logs show notifications found

## Additional Commands

### Clear MongoDB Data (if needed)
```bash
docker exec -it mongo-revhub mongosh revhubteam4 --eval "db.chatMessage.deleteMany({})"
docker exec -it mongo-revhub mongosh revhubteam4 --eval "db.notificationMongo.deleteMany({})"
```

### Restart MongoDB Container
```bash
docker restart mongo-revhub
```

### View MongoDB Logs
```bash
docker logs mongo-revhub --tail 50
```

### Check MongoDB Connection from Backend
Look for this in backend startup logs:
```
Cluster created with settings ...
Opened connection [connectionId{localValue:1}] to localhost:27017
```
