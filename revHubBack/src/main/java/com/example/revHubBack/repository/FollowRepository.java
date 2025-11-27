package com.example.revHubBack.repository;

import com.example.revHubBack.entity.Follow;
import com.example.revHubBack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerAndFollowing(User follower, User following);
    
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.following = :user")
    long countFollowers(User user);
    
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.follower = :user")
    long countFollowing(User user);
    
    @Query("SELECT f.follower FROM Follow f WHERE f.following = :user")
    List<User> findFollowers(User user);
    
    @Query("SELECT f.following FROM Follow f WHERE f.follower = :user")
    List<User> findFollowing(User user);
}