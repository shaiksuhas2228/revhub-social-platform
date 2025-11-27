import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService, PostRequest } from '../../../core/services/post.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent {
  postData: PostRequest = {
    content: '',
    imageUrl: ''
  };
  
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private postService: PostService,
    private router: Router
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  isVideo(file: File): boolean {
    return file.type.startsWith('video/');
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  onSubmit() {
    if (this.postData.content.trim()) {
      this.isLoading = true;
      this.errorMessage = '';
      
      if (this.selectedFile) {
        // Use multipart upload for files
        const formData = new FormData();
        formData.append('content', this.postData.content);
        formData.append('file', this.selectedFile);
        
        this.postService.createPostWithFile(formData).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Failed to create post. Please try again.';
          }
        });
      } else {
        // Use JSON for text-only posts
        this.postService.createPost(this.postData).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Failed to create post. Please try again.';
          }
        });
      }
    }
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
  }
}