package com.example.revHubBack.service;

import com.example.revHubBack.dto.PostRequest;
import com.example.revHubBack.entity.Post;
import com.example.revHubBack.entity.User;
import com.example.revHubBack.entity.Comment;
import com.example.revHubBack.entity.Like;
import com.example.revHubBack.entity.Share;
import com.example.revHubBack.repository.PostRepository;
import com.example.revHubBack.repository.UserRepository;
import com.example.revHubBack.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    public Page<Post> getAllPosts(Pageable pageable) {
        System.out.println("Getting all posts with page: " + pageable.getPageNumber() + ", size: " + pageable.getPageSize());
        Page<Post> posts = postRepository.findAllByOrderByCreatedDateDesc(pageable);
        System.out.println("Found " + posts.getTotalElements() + " total posts, " + posts.getContent().size() + " in this page");
        return posts;
    }

    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    public Post createPost(String content, org.springframework.web.multipart.MultipartFile file, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setContent(content);
        
        if (file != null && !file.isEmpty()) {
            try {
                byte[] fileBytes = file.getBytes();
                String base64File = java.util.Base64.getEncoder().encodeToString(fileBytes);
                String mimeType = file.getContentType();
                String dataUrl = "data:" + mimeType + ";base64," + base64File;
                post.setImageUrl(dataUrl);
                
                if (mimeType != null) {
                    if (mimeType.startsWith("image/")) {
                        post.setMediaType("image");
                    } else if (mimeType.startsWith("video/")) {
                        post.setMediaType("video");
                    }
                }
                
                System.out.println("File processed: " + file.getOriginalFilename() + ", MIME: " + mimeType + ", MediaType: " + post.getMediaType());
            } catch (Exception e) {
                throw new RuntimeException("Error processing file: " + e.getMessage());
            }
        }
        
        post.setAuthor(author);
        Post savedPost = postRepository.save(post);
        System.out.println("Post saved with ID: " + savedPost.getId() + ", MediaType: " + savedPost.getMediaType());
        return savedPost;
    }

    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to delete this post");
        }

        postRepository.delete(post);
    }

    public List<Post> getPostsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return postRepository.findByAuthorOrderByCreatedDateDesc(user);
    }
    
    public Post savePost(Post post) {
        return postRepository.save(post);
    }

    public Map<String, Object> toggleLike(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already liked the post
        boolean isLiked = post.getLikes().stream()
                .anyMatch(like -> like.getUser().getId().equals(user.getId()));

        if (isLiked) {
            // Unlike
            post.getLikes().removeIf(like -> like.getUser().getId().equals(user.getId()));
            post.setLikesCount(post.getLikesCount() - 1);
        } else {
            // Like
            Like like = new Like();
            like.setPost(post);
            like.setUser(user);
            post.getLikes().add(like);
            post.setLikesCount(post.getLikesCount() + 1);
        }

        postRepository.save(post);
        
        Map<String, Object> response = new HashMap<>();
        response.put("likesCount", post.getLikesCount());
        response.put("isLiked", !isLiked);
        return response;
    }

    public Comment addComment(Long postId, String content, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setPost(post);
        comment.setAuthor(user);
        
        Comment savedComment = commentRepository.save(comment);
        
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);
        
        return savedComment;
    }

    public List<Comment> getComments(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return commentRepository.findByPostOrderByCreatedDateDesc(post);
    }

    public void deleteComment(Long postId, Long commentId, String username) {
        System.out.println("[SERVICE] Deleting comment " + commentId + " from post " + postId + " by user " + username);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        System.out.println("[SERVICE] Post found: " + post.getId());
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("[SERVICE] User found: " + user.getUsername());

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        System.out.println("[SERVICE] Comment found: " + comment.getId() + " by " + comment.getAuthor().getUsername());

        if (!comment.getAuthor().getId().equals(user.getId()) && !post.getAuthor().getId().equals(user.getId())) {
            System.out.println("[SERVICE] Authorization failed - Comment author: " + comment.getAuthor().getId() + ", User: " + user.getId() + ", Post author: " + post.getAuthor().getId());
            throw new RuntimeException("Unauthorized to delete this comment");
        }

        System.out.println("[SERVICE] Authorization passed, deleting comment");
        commentRepository.delete(comment);
        System.out.println("[SERVICE] Comment deleted from database");
        
        post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
        postRepository.save(post);
        System.out.println("[SERVICE] Post comment count updated to: " + post.getCommentsCount());
    }
}