import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../core/services/post.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css'
})
export class PostCardComponent {
  @Input() post!: Post;
  
  isVideo(mediaType?: string): boolean {
    return mediaType === 'video' || mediaType?.startsWith('video/');
  }
  
  isImage(mediaType?: string): boolean {
    return !mediaType || mediaType === 'image' || mediaType?.startsWith('image/');
  }
}