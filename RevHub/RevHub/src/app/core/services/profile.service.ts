import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from './post.service';

export interface User {
  id: number;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  isPrivate?: boolean;
  createdDate: string;
  followersCount?: number;
  followingCount?: number;
  followStatus?: string;
}

export interface FollowRequest {
  id: number;
  follower: User;
  following: User;
  status: 'PENDING' | 'ACCEPTED';
  createdDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8080/profile';

  constructor(private http: HttpClient) { }

  getProfile(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${username}`);
  }

  getUserPosts(username: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/${username}/posts`);
  }

  updateProfile(updates: { bio?: string; profilePicture?: string; isPrivate?: string }): Observable<User> {
    return this.http.put<User>(this.apiUrl, updates);
  }
  
  updateProfileWithFile(formData: FormData): Observable<User> {
    const profileData: any = {};
    
    // If no file, just send other data
    if (!formData.has('profilePicture') || !(formData.get('profilePicture') instanceof File)) {
      formData.forEach((value, key) => {
        profileData[key] = value;
      });
      return this.http.put<User>(this.apiUrl, profileData);
    }
    
    // Handle file upload with base64 conversion
    return new Observable<User>(observer => {
      const file = formData.get('profilePicture') as File;
      const reader = new FileReader();
      
      formData.forEach((value, key) => {
        if (key !== 'profilePicture') {
          profileData[key] = value;
        }
      });
      
      reader.onload = () => {
        profileData.profilePicture = reader.result as string;
        this.http.put<User>(this.apiUrl, profileData).subscribe({
          next: result => {
            observer.next(result);
            observer.complete();
          },
          error: err => observer.error(err)
        });
      };
      reader.readAsDataURL(file);
    });
  }
  
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }

  followUser(username: string): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/follow/${username}`, {});
  }

  unfollowUser(username: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/unfollow/${username}`);
  }

  getFollowStatus(username: string): Observable<{status: string}> {
    return this.http.get<{status: string}>(`${this.apiUrl}/follow-status/${username}`);
  }

  getPendingFollowRequests(): Observable<FollowRequest[]> {
    return this.http.get<FollowRequest[]>(`${this.apiUrl}/follow-requests`);
  }

  acceptFollowRequest(followId: number): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/follow-requests/${followId}/accept`, {});
  }

  rejectFollowRequest(followId: number): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/follow-requests/${followId}/reject`, {});
  }

  cancelFollowRequest(username: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/cancel-request/${username}`);
  }

  getFollowers(username: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${username}/followers`);
  }

  getFollowing(username: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${username}/following`);
  }
  
  removeFollower(username: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/remove-follower/${username}`);
  }
  
  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search?query=${encodeURIComponent(query)}`);
  }
}