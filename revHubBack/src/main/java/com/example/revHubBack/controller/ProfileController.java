package com.example.revHubBack.controller;

import com.example.revHubBack.entity.Post;
import com.example.revHubBack.entity.User;
import com.example.revHubBack.repository.UserRepository;
import com.example.revHubBack.repository.FollowRepository;
import com.example.revHubBack.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/profile")
public class ProfileController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostService postService;
    
    @Autowired
    private FollowRepository followRepository;

    @GetMapping("/{username}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(user -> {
                    Map<String, Object> profile = new HashMap<>();
                    profile.put("id", user.getId());
                    profile.put("username", user.getUsername());
                    profile.put("email", user.getEmail());
                    profile.put("profilePicture", user.getProfilePicture());
                    profile.put("bio", user.getBio());
                    profile.put("isPrivate", user.getIsPrivate());
                    profile.put("createdDate", user.getCreatedDate());
                    profile.put("followersCount", followRepository.countFollowers(user));
                    profile.put("followingCount", followRepository.countFollowing(user));
                    return ResponseEntity.ok(profile);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{username}/posts")
    public ResponseEntity<List<Post>> getUserPosts(@PathVariable String username) {
        try {
            List<Post> posts = postService.getPostsByUser(username);
            return ResponseEntity.ok(posts);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> updates, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("bio")) {
            user.setBio(updates.get("bio"));
        }
        if (updates.containsKey("profilePicture")) {
            user.setProfilePicture(updates.get("profilePicture"));
        }
        if (updates.containsKey("isPrivate")) {
            user.setIsPrivate(Boolean.parseBoolean(updates.get("isPrivate")));
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }
}