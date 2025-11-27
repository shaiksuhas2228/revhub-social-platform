import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/services/theme.service';
import { FeedService, Post } from './core/services/feed.service';
import { AuthService } from './core/services/auth.service';
import { ProfileService, User } from './core/services/profile.service';
import { PostService } from './core/services/post.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  activeTab = 'feed';
  feedType = 'universal';
  currentPage = 0;
  hasMorePosts = true;
  isLoading = false;
  isDarkTheme = false;
  isEditingProfile = false;
  editBio = '';
  selectedProfilePicture: File | null = null;
  profileName = '';
  profileUsername = '';
  currentUser: any = null;
  userProfile: User | null = null;
  followersCount = 0;
  followingCount = 0;
  userPostsData: any[] = [];
  newPostContent = '';
  posts: any[] = [
    {
      id: 1,
      author: 'Akram',
      content: 'This is a sample post content.',
      timestamp: '2 hours ago',
      likes: 5,
      comments: 2,
      shares: 1,
      liked: false,
      media: null,
      mediaType: '',
      commentsList: [
        { id: 1, author: 'Karthik', content: 'Great post!', timestamp: '1 hour ago' },
        { id: 2, author: 'Akram', content: 'Thanks!', timestamp: '30 min ago' }
      ]
    }
  ];
  
  selectedFile: File | null = null;
  selectedFileType = '';
  selectedFilePreview: string | null = null;
  showComments: { [key: number]: boolean } = {};
  newComment = '';
  selectedPostId: number | null = null;
  replyingTo: { postId: string, commentId: number } | null = null;
  replyContent = '';
  postVisibility = 'public';
  
  selectedChat: string | null = null;
  newMessage = '';
  contacts = ['Karthik', 'Sai'];
  messages: { [key: string]: any[] } = {};

  constructor(
    private themeService: ThemeService, 
    private feedService: FeedService,
    private authService: AuthService,
    private profileService: ProfileService,
    private postService: PostService
  ) {}

  ngOnInit() {
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
    
    // Load current user data
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.profileName = this.currentUser.username;
      this.profileUsername = this.currentUser.username;
      this.loadUserProfile();
    }
    
    this.loadFeeds();
    this.loadSuggestedUsers();
  }

  loadFeeds() {
    console.log('loadFeeds called');
    this.isLoading = true;
    this.postService.getPosts(0, 10).subscribe({
      next: (response) => {
        console.log('Posts loaded from backend:', response);
        this.posts = response.content || [];
        // Debug: Log each post's media info
        this.posts.forEach(post => {
          if (post.imageUrl) {
            console.log('Post media:', {
              id: post.id,
              mediaType: post.mediaType,
              imageUrl: post.imageUrl.substring(0, 50) + '...',
              hasVideo: post.imageUrl.startsWith('data:video/'),
              hasImage: post.imageUrl.startsWith('data:image/')
            });
          }
        });
        this.currentPage = response.number || 0;
        this.hasMorePosts = (response.number || 0) < (response.totalPages || 0) - 1;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.posts = []; // Clear posts on error
        this.isLoading = false;
      }
    });
  }

  switchFeedType(type: string) {
    this.feedType = type;
    this.loadFeeds();
  }

  loadMorePosts() {
    if (this.isLoading || !this.hasMorePosts || this.feedType === 'universal') return;
    
    this.isLoading = true;
    const followingNames = this.followingList.map(f => f.name);
    const morePosts = this.feedService.loadMorePosts(followingNames);
    
    if (morePosts.length > 0) {
      this.posts = [...this.posts, ...morePosts];
    } else {
      this.hasMorePosts = false;
    }
    
    this.isLoading = false;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'feed') {
      this.showSuggestions = true;
      this.loadFeeds(); // Reload posts when switching to feed
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  editProfile() {
    this.isEditingProfile = true;
    this.editBio = this.userProfile?.bio || '';
  }

  saveProfile() {
    const updates: any = {};
    
    if (this.editBio !== (this.userProfile?.bio || '')) {
      updates.bio = this.editBio;
    }
    
    if (this.selectedProfilePicture) {
      // Convert image to base64 for simple storage
      const reader = new FileReader();
      reader.onload = () => {
        updates.profilePicture = reader.result as string;
        this.updateProfile(updates);
      };
      reader.readAsDataURL(this.selectedProfilePicture);
    } else if (Object.keys(updates).length > 0) {
      this.updateProfile(updates);
    } else {
      this.isEditingProfile = false;
    }
  }
  
  updateProfile(updates: any) {
    this.profileService.updateProfile(updates).subscribe({
      next: (updatedUser) => {
        this.loadUserProfile(); // Reload profile data
        this.isEditingProfile = false;
        this.selectedProfilePicture = null;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
      }
    });
  }

  cancelEdit() {
    this.isEditingProfile = false;
    this.editBio = '';
    this.selectedProfilePicture = null;
  }
  
  onProfilePictureSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedProfilePicture = file;
    }
  }

  createPost() {
    if (this.newPostContent.trim()) {
      if (this.selectedFile) {
        console.log('Creating post with file:', this.selectedFile.name, this.selectedFile.type);
        const formData = new FormData();
        formData.append('content', this.newPostContent);
        formData.append('file', this.selectedFile);
        
        this.postService.createPostWithFile(formData).subscribe({
          next: (response) => {
            console.log('Post with file created:', response);
            this.resetPostForm();
          },
          error: (error) => {
            console.error('Error creating post with file:', error);
          }
        });
      } else {
        console.log('Creating text-only post');
        const postData = {
          content: this.newPostContent,
          imageUrl: ''
        };
        
        this.postService.createPost(postData).subscribe({
          next: (response) => {
            console.log('Text post created:', response);
            this.resetPostForm();
          },
          error: (error) => {
            console.error('Error creating post:', error);
          }
        });
      }
    }
  }
  
  resetPostForm() {
    this.newPostContent = '';
    this.selectedFile = null;
    this.selectedFileType = '';
    this.selectedFilePreview = null;
    this.postVisibility = 'public';
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    this.setActiveTab('feed');
    setTimeout(() => {
      this.loadFeeds();
      this.loadUserProfile();
    }, 500);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      if (file.type.startsWith('image/')) {
        this.selectedFileType = 'image';
      } else if (file.type.startsWith('video/')) {
        this.selectedFileType = 'video';
      }
      
      // Create base64 preview instead of blob URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedFilePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
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

  commentPost(post: any) {
    this.showComments[post.id] = !this.showComments[post.id];
    if (!post.commentsList) {
      post.commentsList = [];
    }
    if (this.showComments[post.id]) {
      this.postService.getComments(post.id).subscribe({
        next: (comments) => {
          post.commentsList = comments;
        },
        error: (error) => {
          console.error('Error loading comments:', error);
        }
      });
    }
  }

  sharePost(post: any) {
    const shareData = {
      title: 'RevHub Post',
      text: `Check out this post by ${post.author.username}: ${post.content}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).then(() => {
        this.postService.sharePost(post.id).subscribe({
          next: (response) => {
            post.sharesCount = response.sharesCount;
          },
          error: (error) => {
            console.error('Error updating share count:', error);
          }
        });
      }).catch((error) => {
        console.log('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `Check out this post by ${post.author.username}: ${post.content}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
      
      this.postService.sharePost(post.id).subscribe({
        next: (response) => {
          post.sharesCount = response.sharesCount;
        },
        error: (error) => {
          console.error('Error updating share count:', error);
        }
      });
    }
  }

  fallbackShare(post: any) {
    const text = `Check out this post by ${post.author}: ${post.content}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    post.shares += 1;
  }

  formatPostContent(content: string): string {
    return content
      .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')
      .replace(/@(\w+)/g, '<span class="mention">@$1</span>');
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
    console.log('Delete comment clicked:', commentId, 'from post:', post.id);
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
          // Reload comments from backend to ensure UI is in sync
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
          console.error('Error details:', error.error);
          console.error('Error status:', error.status);
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
    return comment.author?.username === this.currentUser?.username || post.author?.username === this.currentUser?.username;
  }

  replyToComment(post: any, comment: any) {
    this.replyingTo = { postId: post.id, commentId: comment.id };
  }

  addReply(post: any, parentComment: any) {
    if (this.replyContent.trim()) {
      const reply = {
        id: Date.now(),
        author: this.profileName,
        content: this.replyContent,
        timestamp: 'Just now',
        isReply: true,
        parentId: parentComment.id
      };
      if (!parentComment.replies) {
        parentComment.replies = [];
      }
      parentComment.replies.push(reply);
      this.replyContent = '';
      this.replyingTo = null;
    }
  }

  cancelReply() {
    this.replyingTo = null;
    this.replyContent = '';
  }



  followUser(user: any) {
    if (!this.followingList.some(f => f.username === user.username)) {
      this.followingList.push({...user});
    }
  }

  followFromList(user: any) {
    if (!this.followingList.some(f => f.name === user.name)) {
      this.followingList.push(user);
    }
  }

  unfollowUser(user: any) {
    this.followingList = this.followingList.filter(f => f.name !== user.name);
  }

  isFollowing(user: any): boolean {
    return this.followingList.some(f => f.username === user.username);
  }

  closeSuggestions() {
    this.showSuggestions = false;
  }

  selectChat(contact: string) {
    this.selectedChat = contact;
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedChat) {
      if (!this.messages[this.selectedChat]) {
        this.messages[this.selectedChat] = [];
      }
      this.messages[this.selectedChat].push({
        sender: this.profileName,
        content: this.newMessage,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      });
      this.newMessage = '';
    }
  }

  backToContacts() {
    this.selectedChat = null;
  }

  get userPosts() {
    return this.userPostsData.length > 0 ? this.userPostsData : this.posts.filter(post => post.author === this.profileName);
  }

  searchQuery = '';
  searchType = 'users';
  allUsers = ['Akram', 'Karthik', 'Sai', 'Priya', 'Arjun', 'Rohit'];
  showFollowersList = false;
  showFollowingList = false;
  followersList = [
    { name: 'Karthik', username: 'karthik_dev', followers: 245 },
    { name: 'Sai', username: 'sai_tech', followers: 189 },
    { name: 'Priya', username: 'priya_design', followers: 567 },
    { name: 'Arjun', username: 'arjun_photo', followers: 123 },
    { name: 'Ananya', username: 'ananya_art', followers: 345 },
    { name: 'Rohit', username: 'rohit_code', followers: 456 },
    { name: 'Kavya', username: 'kavya_write', followers: 234 }
  ];
  followingList = [
    { name: 'Karthik', username: 'karthik_dev', followers: 245 },
    { name: 'Sai', username: 'sai_tech', followers: 189 },
    { name: 'Priya', username: 'priya_design', followers: 567 },
    { name: 'Rohit', username: 'rohit_code', followers: 456 },
    { name: 'Neha', username: 'neha_music', followers: 678 }
  ];
  suggestedUsers: any[] = [];
  showSuggestions = true;
  showDeleteConfirm = false;
  postToDelete: any = null;
  showDeleteCommentConfirm = false;
  commentToDelete: { post: any, commentId: number } | null = null;
  notifications = [
    {
      id: 1,
      type: 'follow',
      message: 'Priya started following you',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'like',
      message: 'Rohit liked your post',
      timestamp: '5 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'mention',
      message: 'Karthik mentioned you in a post',
      timestamp: '1 day ago',
      read: true
    }
  ];
  
  loadUserProfile() {
    if (this.currentUser?.username) {
      this.profileService.getProfile(this.currentUser.username).subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.followersCount = profile.followersCount || 0;
          this.followingCount = profile.followingCount || 0;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
        }
      });
      
      // Load user posts
      this.profileService.getUserPosts(this.currentUser.username).subscribe({
        next: (posts) => {
          this.userPostsData = posts;
        },
        error: (error) => {
          console.error('Error loading user posts:', error);
        }
      });
    }
  }
  
  get filteredUsers() {
    if (!this.searchQuery.trim() || this.searchType !== 'users') return [];
    return this.allUsers.filter(user => 
      user.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get filteredPosts() {
    if (!this.searchQuery.trim() || this.searchType !== 'posts') return [];
    const query = this.searchQuery.toLowerCase();
    return this.posts.filter(post => 
      post.content.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes('#' + query) ||
      post.author.toLowerCase().includes(query)
    );
  }

  switchSearchType(type: string) {
    this.searchType = type;
  }

  deletePost(post: any) {
    this.posts = this.posts.filter(p => p.id !== post.id);
    this.feedService.deletePost(post.id);
  }

  canDeletePost(post: any): boolean {
    return post.author === this.profileName;
  }

  editingPost: any = null;
  editPostContent = '';

  editPost(post: any) {
    this.editingPost = post;
    this.editPostContent = post.content;
  }

  saveEditPost() {
    if (this.editPostContent.trim() && this.editingPost) {
      this.editingPost.content = this.editPostContent;
      this.feedService.updatePost(this.editingPost);
      this.cancelEditPost();
    }
  }

  cancelEditPost() {
    this.editingPost = null;
    this.editPostContent = '';
  }

  get postsCount() {
    return this.userPosts.length;
  }
  
  deleteUserPost(post: any) {
    this.postToDelete = post;
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    if (this.postToDelete) {
      const postId = this.postToDelete.id;
      
      // Immediately update UI
      this.userPostsData = this.userPostsData.filter(p => p.id !== postId);
      this.posts = this.posts.filter(p => p.id !== postId);
      this.showDeleteConfirm = false;
      this.postToDelete = null;
      
      // Then call backend
      this.postService.deletePost(postId).subscribe({
        next: () => {
          console.log('Post deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          // Reload posts if backend delete failed
          this.loadFeeds();
          this.loadUserProfile();
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.postToDelete = null;
  }

  showFollowers() {
    this.showFollowersList = true;
    this.showFollowingList = false;
  }

  showFollowing() {
    this.showFollowingList = true;
    this.showFollowersList = false;
  }

  hideUserLists() {
    this.showFollowersList = false;
    this.showFollowingList = false;
  }

  togglePrivacy() {
    if (this.userProfile) {
      const newPrivacySetting = !this.userProfile.isPrivate;
      this.profileService.updateProfile({ isPrivate: newPrivacySetting.toString() }).subscribe({
        next: (updatedUser) => {
          if (this.userProfile) {
            this.userProfile.isPrivate = newPrivacySetting;
          }
        },
        error: (error) => {
          console.error('Error updating privacy setting:', error);
        }
      });
    }
  }

  checkForMentions(content: string) {
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);
    if (mentions) {
      mentions.forEach(mention => {
        const username = mention.substring(1);
        this.addMentionNotification(username);
      });
    }
  }

  addMentionNotification(username: string) {
    const notification = {
      id: Date.now(),
      type: 'mention',
      message: `${this.profileName} mentioned you in a post`,
      timestamp: 'Just now',
      read: false
    };
    this.notifications.unshift(notification);
  }
  
  loadSuggestedUsers() {
    this.profileService.getAllUsers().subscribe({
      next: (users) => {
        this.suggestedUsers = users.filter(user => user.username !== this.currentUser?.username).slice(0, 5);
      },
      error: (error) => {
        console.error('Error loading suggested users:', error);
      }
    });
  }
  
  isVideo(url: string): boolean {
    if (!url) return false;
    return url.startsWith('data:video/') || url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('.mov') || (url.startsWith('blob:') && this.selectedFileType === 'video');
  }
  
  isImage(url: string): boolean {
    if (!url) return false;
    return url.startsWith('data:image/') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp') || (url.startsWith('blob:') && this.selectedFileType === 'image');
  }
}