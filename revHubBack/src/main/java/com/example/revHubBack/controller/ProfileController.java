package com.example.revHubBack.controller;

import com.example.revHubBack.entity.Follow;
import com.example.revHubBack.entity.Post;
import com.example.revHubBack.entity.User;
import com.example.revHubBack.repository.UserRepository;
import com.example.revHubBack.repository.FollowRepository;
import com.example.revHubBack.service.FollowService;
import com.example.revHubBack.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/profile")
public class ProfileController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostService postService;
    
    @Autowired
    private FollowRepository followRepository;
    
    @Autowired
    private FollowService followService;

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
    
    @PostMapping("/follow/{username}")
    public ResponseEntity<Map<String, String>> followUser(@PathVariable String username, Authentication authentication) {
        try {
            String message = followService.followUser(authentication.getName(), username);
            Map<String, String> response = new HashMap<>();
            response.put("message", message);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/unfollow/{username}")
    public ResponseEntity<Map<String, String>> unfollowUser(@PathVariable String username, Authentication authentication) {
        try {
            followService.removeFollower(authentication.getName(), username);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Follower removed");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/follow-requests")
    public ResponseEntity<List<Follow>> getPendingFollowRequests(Authentication authentication) {
        try {
            List<Follow> requests = followService.getPendingFollowRequests(authentication.getName());
            return ResponseEntity.ok(requests);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/follow-requests/{followId}/accept")
    public ResponseEntity<Map<String, String>> acceptFollowRequest(@PathVariable Long followId, Authentication authentication) {
        try {
            followService.acceptFollowRequest(authentication.getName(), followId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Follow request accepted");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/follow-requests/{followId}/reject")
    public ResponseEntity<Map<String, String>> rejectFollowRequest(@PathVariable Long followId, Authentication authentication) {
        try {
            followService.rejectFollowRequest(authentication.getName(), followId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Follow request rejected");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/follow-status/{username}")
    public ResponseEntity<Map<String, String>> getFollowStatus(@PathVariable String username, Authentication authentication) {
        try {
            String status = followService.getFollowStatus(authentication.getName(), username);
            Map<String, String> response = new HashMap<>();
            response.put("status", status);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{username}/followers")
    public ResponseEntity<List<User>> getFollowers(@PathVariable String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            System.out.println("Getting followers for user: " + username + " (ID: " + user.getId() + ")");
            List<User> followers = followRepository.findFollowers(user);
            System.out.println("Found " + followers.size() + " followers");
            return ResponseEntity.ok(followers);
        } catch (RuntimeException e) {
            System.err.println("Error getting followers: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{username}/following")
    public ResponseEntity<List<User>> getFollowing(@PathVariable String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            System.out.println("Getting following for user: " + username + " (ID: " + user.getId() + ")");
            List<User> following = followRepository.findFollowing(user);
            System.out.println("Found " + following.size() + " following");
            return ResponseEntity.ok(following);
        } catch (RuntimeException e) {
            System.err.println("Error getting following: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/cancel-request/{username}")
    public ResponseEntity<Map<String, String>> cancelFollowRequest(@PathVariable String username, Authentication authentication) {
        try {
            followService.cancelFollowRequest(authentication.getName(), username);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Follow request cancelled");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    

}