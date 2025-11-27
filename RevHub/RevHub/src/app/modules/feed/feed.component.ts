import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService, Post } from '../../core/services/post.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css'
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  isLoading = true;
  currentPage = 0;
  totalPages = 0;

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.postService.getPosts(this.currentPage, 10).subscribe({
      next: (response) => {
        this.posts = response.content;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.isLoading = false;
      }
    });
  }

  likePost(post: Post) {
    this.postService.likePost(post.id).subscribe({
      next: () => {
        this.loadPosts(); // Reload to get updated counts
      },
      error: (error) => {
        console.error('Error liking post:', error);
      }
    });
  }

  sharePost(post: Post) {
    this.postService.sharePost(post.id).subscribe({
      next: () => {
        this.loadPosts(); // Reload to get updated counts
      },
      error: (error) => {
        console.error('Error sharing post:', error);
      }
    });
  }

  addComment(post: Post, content: string) {
    if (content.trim()) {
      this.postService.addComment(post.id, content).subscribe({
        next: () => {
          this.loadPosts(); // Reload to get updated counts
        },
        error: (error) => {
          console.error('Error adding comment:', error);
        }
      });
    }
  }

  loadMore() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.postService.getPosts(this.currentPage, 10).subscribe({
        next: (response) => {
          this.posts = [...this.posts, ...response.content];
        },
        error: (error) => {
          console.error('Error loading more posts:', error);
        }
      });
    }
  }
}