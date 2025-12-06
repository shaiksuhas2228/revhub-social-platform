// MongoDB Initialization Script for RevHub
use revhubteam4

// Create collections if they don't exist
db.createCollection("chatMessage");
db.createCollection("notificationMongo");

// Create indexes for better performance
db.chatMessage.createIndex({"senderId": 1, "receiverId": 1, "timestamp": -1});
db.chatMessage.createIndex({"senderUsername": 1, "receiverUsername": 1});
db.notificationMongo.createIndex({"userId": 1, "createdDate": -1});
db.notificationMongo.createIndex({"userId": 1, "readStatus": 1});

print("✅ MongoDB initialized successfully!");
print("Database: revhubteam4");
print("Collections created: chatMessage, notificationMongo");
print("Indexes created for optimal performance");
