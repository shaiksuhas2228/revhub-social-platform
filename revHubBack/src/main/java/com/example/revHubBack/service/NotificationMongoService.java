package com.example.revHubBack.service;

import com.example.revHubBack.entity.NotificationMongo;
import com.example.revHubBack.entity.User;
import com.example.revHubBack.repository.NotificationMongoRepository;
import com.example.revHubBack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationMongoService {
    
    @Autowired
    private NotificationMongoRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<NotificationMongo> getUserNotifications(String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return notificationRepository.findByUserIdOrderByCreatedDateDesc(user.getId().toString());
        } catch (Exception e) {
            System.out.println("Error in getUserNotifications: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }
    
    public NotificationMongo markAsRead(String notificationId, String username) {
        NotificationMongo notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!notification.getUserId().equals(user.getId().toString())) {
            throw new RuntimeException("Unauthorized");
        }
        
        notification.setReadStatus(true);
        return notificationRepository.save(notification);
    }
    
    public void createFollowRequestNotification(User toUser, User fromUser, Long followRequestId) {
        NotificationMongo notification = new NotificationMongo();
        notification.setUserId(toUser.getId().toString());
        notification.setFromUserId(fromUser.getId().toString());
        notification.setFromUsername(fromUser.getUsername());
        notification.setFromUserProfilePicture(fromUser.getProfilePicture());
        notification.setType("FOLLOW_REQUEST");
        notification.setMessage(fromUser.getUsername() + " wants to follow you");
        notification.setFollowRequestId(followRequestId);
        notification.setCreatedDate(LocalDateTime.now());
        
        notificationRepository.save(notification);
    }
    
    public void createFollowNotification(User toUser, User fromUser) {
        NotificationMongo notification = new NotificationMongo();
        notification.setUserId(toUser.getId().toString());
        notification.setFromUserId(fromUser.getId().toString());
        notification.setFromUsername(fromUser.getUsername());
        notification.setFromUserProfilePicture(fromUser.getProfilePicture());
        notification.setType("FOLLOW");
        notification.setMessage(fromUser.getUsername() + " started following you");
        notification.setCreatedDate(LocalDateTime.now());
        
        notificationRepository.save(notification);
    }
    
    public long getUnreadCount(String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return notificationRepository.countByUserIdAndReadStatusFalse(user.getId().toString());
        } catch (Exception e) {
            System.out.println("Error in getUnreadCount: " + e.getMessage());
            return 0L;
        }
    }
    
    public void removeFollowRequestNotification(Long followRequestId) {
        try {
            List<NotificationMongo> notifications = notificationRepository.findAll();
            notifications.stream()
                .filter(n -> followRequestId.equals(n.getFollowRequestId()))
                .forEach(notificationRepository::delete);
        } catch (Exception e) {
            System.out.println("Error removing follow request notification: " + e.getMessage());
        }
    }
}