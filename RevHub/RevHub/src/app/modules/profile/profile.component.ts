import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProfileService, User } from '../../core/services/profile.service';
import { PostService, Post } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  posts: Post[] = [];
  isLoading = true;
  username: string = '';
  isOwnProfile = false;
  showComments: { [key: number]: boolean } = {};
  newComment = '';
  showDeleteCommentConfirm = false;
  commentToDelete: { post: any, commentId: number } | null = null;
  followStatus: string = 'NOT_FOLLOWING';
  isFollowLoading = false;

  constructor(
    private profileService: ProfileService,
    private postService: PostService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get username from route or use current user
    this.route.params.subscribe(params => {
      this.username = params['username'] || this.authService.getCurrentUser()?.username;
      if (this.username) {
        this.isOwnProfile = this.username === this.authService.getCurrentUser()?.username;
        this.loadProfile();
        this.loadUserPosts();
        if (!this.isOwnProfile) {
          this.loadFollowStatus();
        }
      }
    });
  }

  loadProfile() {
    this.profileService.getProfile(this.username).subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
      }
    });
  }

  loadUserPosts() {
    this.profileService.getUserPosts(this.username).subscribe({
      next: (posts) => {
        this.posts = posts;
      },
      error: (error) => {
        console.error('Error loading user posts:', error);
      }
    });
  }

  commentPost(post: any) {
    this.showComments[post.id] = !this.showComments[post.id];
    if (!post.commentsList) {
      post.commentsList = [];
    }
  }

  likePost(post: any) {
    this.postService.toggleLike(post.id).subscribe({
      next: (response) => {
        post.likesCount = response.likesCount;
        post.isLiked = response.isLiked;
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      }
    });
  }

  addComment(post: any) {
    if (this.newComment.trim()) {
      this.postService.addComment(post.id, this.newComment).subscribe({
        next: (response) => {
          if (!post.commentsList) {
            post.commentsList = [];
          }
          post.commentsList.push(response);
          post.commentsCount = post.commentsList.length;
          this.newComment = '';
        },
        error: (error) => {
          console.error('Error adding comment:', error);
        }
      });
    }
  }

  deleteComment(post: any, commentId: number) {
    this.commentToDelete = { post, commentId };
    this.showDeleteCommentConfirm = true;
  }

  confirmDeleteComment() {
    if (this.commentToDelete) {
      const { post, commentId } = this.commentToDelete;
      console.log('Deleting comment:', commentId, 'from post:', post.id);
      this.postService.deleteComment(post.id, commentId).subscribe({
        next: (response) => {
          console.log('Comment deleted successfully:', response);
          this.postService.getComments(post.id).subscribe({
            next: (comments) => {
              post.commentsList = comments;
              post.commentsCount = comments.length;
            },
            error: (error) => {
              console.error('Error reloading comments:', error);
            }
          });
          this.showDeleteCommentConfirm = false;
          this.commentToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
          console.error('Failed to delete comment:', error.error || error.message);
          this.showDeleteCommentConfirm = false;
          this.commentToDelete = null;
        }
      });
    }
  }

  cancelDeleteComment() {
    this.showDeleteCommentConfirm = false;
    this.commentToDelete = null;
  }

  canDeleteComment(comment: any, post: any): boolean {
    const currentUser = this.authService.getCurrentUser();
    return comment.author?.username === currentUser?.username || post.author?.username === currentUser?.username;
  }

  loadFollowStatus() {
    this.profileService.getFollowStatus(this.username).subscribe({
      next: (response) => {
        this.followStatus = response.status;
      },
      error: (error) => {
        console.error('Error loading follow status:', error);
      }
    });
  }

  followUser() {
    this.isFollowLoading = true;
    this.profileService.followUser(this.username).subscribe({
      next: (response) => {
        console.log(response.message);
        this.loadFollowStatus();
        this.loadProfile();
        this.isFollowLoading = false;
      },
      error: (error) => {
        console.error('Error following user:', error);
        this.isFollowLoading = false;
      }
    });
  }

  unfollowUser() {
    this.isFollowLoading = true;
    this.profileService.unfollowUser(this.username).subscribe({
      next: (response) => {
        console.log(response.message);
        this.loadFollowStatus();
        this.loadProfile();
        this.isFollowLoading = false;
      },
      error: (error) => {
        console.error('Error unfollowing user:', error);
        this.isFollowLoading = false;
      }
    });
  }

  getFollowButtonText(): string {
    switch (this.followStatus) {
      case 'ACCEPTED':
        return 'Unfollow';
      case 'PENDING':
        return 'Requested';
      default:
        return 'Follow';
    }
  }

  getFollowButtonClass(): string {
    switch (this.followStatus) {
      case 'ACCEPTED':
        return 'btn-outline-danger';
      case 'PENDING':
        return 'btn-outline-warning';
      default:
        return 'btn-primary';
    }
  }

  onFollowButtonClick() {
    if (this.followStatus === 'ACCEPTED') {
      this.unfollowUser();
    } else if (this.followStatus === 'NOT_FOLLOWING') {
      this.followUser();
    }
  }
}