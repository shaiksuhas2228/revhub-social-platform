package com.example.revHubBack.service;

import com.example.revHubBack.entity.ChatMessage;
import com.example.revHubBack.entity.User;
import com.example.revHubBack.repository.ChatMessageRepository;
import com.example.revHubBack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public ChatMessage sendMessage(String senderUsername, String receiverUsername, String content) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        ChatMessage message = new ChatMessage();
        message.setSenderId(sender.getId().toString());
        message.setSenderUsername(sender.getUsername());
        message.setReceiverId(receiver.getId().toString());
        message.setReceiverUsername(receiver.getUsername());
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        
        return chatMessageRepository.save(message);
    }
    
    public List<ChatMessage> getConversation(String username1, String username2) {
        User user1 = userRepository.findByUsername(username1)
                .orElseThrow(() -> new RuntimeException("User1 not found"));
        
        User user2 = userRepository.findByUsername(username2)
                .orElseThrow(() -> new RuntimeException("User2 not found"));
        
        return chatMessageRepository.findConversation(user1.getId().toString(), user2.getId().toString());
    }
    
    public void markMessagesAsRead(String receiverUsername, String senderUsername) {
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        List<ChatMessage> unreadMessages = chatMessageRepository.findConversation(
                sender.getId().toString(), receiver.getId().toString());
        
        unreadMessages.stream()
                .filter(msg -> msg.getReceiverId().equals(receiver.getId().toString()) && !msg.isRead())
                .forEach(msg -> {
                    msg.setRead(true);
                    chatMessageRepository.save(msg);
                });
    }
}