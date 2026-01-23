import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { TournamentService, Friend, GameRequest } from '../../services/tournament.service';
import { Subscription } from 'rxjs';

interface UserSearchResult {
  uid: string;
  nickname: string;
}

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="friends-container">
      <header>
        <h1>👥 Friends</h1>
        <button (click)="goToLobby()" class="btn-back">Back to Lobby</button>
      </header>

      <div class="friends-content">
        @if (loading) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading friends...</p>
          </div>
        } @else {
          
          <!-- Search Section -->
          <div class="search-card">
            <div class="search-header">
              <h2>🔍 Search Users</h2>
            </div>
            <div class="search-content">
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (input)="searchUsers()"
                placeholder="Search by nickname..."
                class="search-input"
              />
              
              @if (isSearching) {
                <div class="searching">Searching...</div>
              }
              
              @if (searchResults.length > 0) {
                <div class="search-results">
                  @for (user of searchResults; track user.uid) {
                    <div class="search-result-item">
                      <span class="user-nickname">{{ user.nickname }}</span>
                      <button class="btn-add" (click)="addFriend(user)">+ Add Friend</button>
                    </div>
                  }
                </div>
              }
              
              @if (!isSearching && searchResults.length === 0 && searchQuery) {
                <div class="no-results">No users found</div>
              }
            </div>
          </div>

          <!-- Incoming Game Requests -->
          @if (gameRequests.length > 0) {
            <div class="requests-card">
              <div class="requests-header">
                <h2>🎮 Game Requests ({{ gameRequests.length }})</h2>
              </div>
              <div class="requests-list">
                @for (request of gameRequests; track request.id) {
                  <div class="request-item">
                    <div class="request-info">
                      <span class="request-icon">⚔️</span>
                      <div class="request-details">
                        <span class="request-name">{{ request.fromNickname }}</span>
                        <span class="request-text">wants to play!</span>
                      </div>
                    </div>
                    <div class="request-actions">
                      <button (click)="acceptRequest(request)" class="btn-accept">
                        Accept
                      </button>
                      <button (click)="declineRequest(request)" class="btn-decline">
                        Decline
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Friends List -->
          <div class="friends-card">
            <div class="friends-header">
              <h2>Your Friends ({{ friends.length }})</h2>
            </div>

            @if (friends.length === 0) {
              <div class="empty-state">
                <p>You haven't added any friends yet</p>
                <p class="sub-text">Search for users above to add friends!</p>
              </div>
            } @else {
              <div class="friends-list">
                @for (friend of friends; track friend.id) {
                  <div class="friend-item">
                    <div class="friend-info">
                      <span class="friend-icon">👤</span>
                      <div class="friend-details">
                        <span class="friend-name">{{ friend.friendNickname }}</span>
                        <span class="friend-date">Added {{ formatDate(friend.addedAt) }}</span>
                      </div>
                    </div>
                    <div class="friend-actions">
                      <button (click)="challengeFriend(friend)" class="btn-challenge">
                        Challenge
                      </button>
                      <button (click)="confirmRemoveFriend(friend)" class="btn-remove">
                        Remove
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      @if (showConfirmModal) {
        <div class="modal-overlay" (click)="cancelRemove()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>Remove Friend?</h3>
            <p>Are you sure you want to remove <strong>{{ friendToRemove?.friendNickname }}</strong> from your friends list?</p>
            <div class="modal-actions">
              <button (click)="cancelRemove()" class="btn-cancel-modal">Cancel</button>
              <button (click)="removeFriend()" class="btn-confirm-remove">Remove</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .friends-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    header {
      max-width: 800px;
      margin: 0 auto 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    h1 {
      color: white;
      margin: 0;
    }

    .btn-back {
      padding: 10px 20px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid white;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-back:hover {
      background: rgba(255,255,255,0.3);
    }

    .friends-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .loading {
      background: white;
      padding: 60px;
      border-radius: 10px;
      text-align: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading p {
      color: #666;
      font-size: 16px;
    }

    .search-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      margin-bottom: 30px;
      overflow: hidden;
    }

    .search-header {
      padding: 20px 30px;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border-bottom: 2px solid #2196f3;
    }

    .search-header h2 {
      margin: 0;
      color: #333;
    }

    .search-content {
      padding: 20px 30px;
    }

    .search-input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 5px;
      font-size: 16px;
      outline: none;
      transition: border-color 0.3s;
    }

    .search-input:focus {
      border-color: #2196f3;
    }

    .searching, .no-results {
      text-align: center;
      padding: 20px;
      color: #999;
    }

    .search-results {
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .search-result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      background: #f5f5f5;
      border-radius: 5px;
    }

    .user-nickname {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .btn-add {
      padding: 8px 15px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-add:hover {
      background: #45a049;
    }

    .requests-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      margin-bottom: 30px;
      overflow: hidden;
      border: 3px solid #ffd700;
    }

    .requests-header {
      padding: 20px 30px;
      background: linear-gradient(135deg, #fff9e6 0%, #ffe6b3 100%);
      border-bottom: 2px solid #ffd700;
    }

    .requests-header h2 {
      margin: 0;
      color: #333;
    }

    .requests-list {
      display: flex;
      flex-direction: column;
    }

    .request-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      border-bottom: 1px solid #f0f0f0;
      background: #fffbf0;
    }

    .request-item:last-child {
      border-bottom: none;
    }

    .request-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .request-icon {
      font-size: 32px;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff3cd;
      border-radius: 50%;
    }

    .request-details {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .request-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .request-text {
      font-size: 14px;
      color: #666;
    }

    .request-actions {
      display: flex;
      gap: 10px;
    }

    .btn-accept, .btn-decline {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-accept {
      background: #4caf50;
      color: white;
    }

    .btn-accept:hover {
      background: #45a049;
    }

    .btn-decline {
      background: #f44336;
      color: white;
    }

    .btn-decline:hover {
      background: #da190b;
    }

    .friends-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      overflow: hidden;
    }

    .friends-header {
      padding: 25px 30px;
      border-bottom: 2px solid #f0f0f0;
    }

    .friends-header h2 {
      margin: 0;
      color: #333;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #999;
    }

    .empty-state .sub-text {
      font-size: 14px;
      margin-top: 10px;
    }

    .friends-list {
      display: flex;
      flex-direction: column;
    }

    .friend-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.3s;
    }

    .friend-item:last-child {
      border-bottom: none;
    }

    .friend-item:hover {
      background: #f9f9f9;
    }

    .friend-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .friend-icon {
      font-size: 32px;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e3f2fd;
      border-radius: 50%;
    }

    .friend-details {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .friend-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .friend-date {
      font-size: 13px;
      color: #999;
    }

    .friend-actions {
      display: flex;
      gap: 10px;
    }

    .btn-challenge {
      padding: 8px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-challenge:hover {
      background: #5568d3;
    }

    .btn-remove {
      padding: 8px 20px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-remove:hover {
      background: #da190b;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 10px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }

    .modal-content h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .modal-content p {
      margin: 0 0 25px 0;
      color: #666;
      line-height: 1.5;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .btn-cancel-modal, .btn-confirm-remove {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-cancel-modal {
      background: #e0e0e0;
      color: #333;
    }

    .btn-cancel-modal:hover {
      background: #d0d0d0;
    }

    .btn-confirm-remove {
      background: #f44336;
      color: white;
    }

    .btn-confirm-remove:hover {
      background: #da190b;
    }
  `]
})
export class FriendsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private auth = inject(Auth);
  private tournamentService = inject(TournamentService);

  loading = true;
  friends: Friend[] = [];
  gameRequests: GameRequest[] = [];
  searchQuery: string = '';
  searchResults: UserSearchResult[] = [];
  isSearching: boolean = false;
  showConfirmModal = false;
  friendToRemove: Friend | null = null;
  private requestsSubscription?: Subscription;
  private sentRequestsSubscription?: Subscription;

  async ngOnInit() {
    await this.loadFriends();
    this.loadGameRequests();
    this.watchSentRequests();
  }

  ngOnDestroy() {
    this.requestsSubscription?.unsubscribe();
    this.sentRequestsSubscription?.unsubscribe();
  }

  async loadFriends() {
    const userId = this.auth.currentUser?.uid;
    if (!userId) return;

    try {
      this.friends = await this.tournamentService.getFriends(userId);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      this.loading = false;
    }
  }

  async searchUsers() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    try {
      const results = await this.tournamentService.searchUsers(this.searchQuery);
      const currentUser = this.auth.currentUser;
      
      // Filter out current user and existing friends
      this.searchResults = results.filter(user => 
        user.uid !== currentUser?.uid && 
        !this.friends.some(friend => friend.friendId === user.uid)
      );
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      this.isSearching = false;
    }
  }

  async addFriend(user: UserSearchResult) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    try {
      await this.tournamentService.addFriend(currentUser.uid, user.uid, user.nickname);
      // Remove from search results and reload friends
      this.searchResults = this.searchResults.filter(u => u.uid !== user.uid);
      this.searchQuery = '';
      await this.loadFriends();
    } catch (error) {
      console.error('Error adding friend:', error);
      alert('Failed to add friend');
    }
  }

  loadGameRequests() {
    const userId = this.auth.currentUser?.uid;
    if (!userId) return;

    this.requestsSubscription = this.tournamentService.getGameRequests(userId)
      .subscribe(requests => {
        this.gameRequests = requests;
      });
  }

  watchSentRequests() {
    const userId = this.auth.currentUser?.uid;
    if (!userId) return;

    this.sentRequestsSubscription = this.tournamentService.getSentGameRequests(userId)
      .subscribe(requests => {
        // Check if any sent request was accepted
        requests.forEach(request => {
          if (request.status === 'accepted' && request.tournamentId) {
            // Navigate to the game
            this.router.navigate(['/game', request.tournamentId]);
          }
        });
      });
  }

  async challengeFriend(friend: Friend) {
    try {
      await this.tournamentService.sendGameRequest(
        friend.friendId,
        friend.friendEmail,
        friend.friendNickname
      );
      alert(`Challenge sent to ${friend.friendNickname}!`);
    } catch (error) {
      console.error('Error sending challenge:', error);
      alert('Failed to send challenge');
    }
  }

  async acceptRequest(request: GameRequest) {
    try {
      const tournamentId = await this.tournamentService.acceptGameRequest(request.id);
      this.router.navigate(['/game', tournamentId]);
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    }
  }

  async declineRequest(request: GameRequest) {
    try {
      await this.tournamentService.declineGameRequest(request.id);
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Failed to decline request');
    }
  }

  confirmRemoveFriend(friend: Friend) {
    this.friendToRemove = friend;
    this.showConfirmModal = true;
  }

  cancelRemove() {
    this.showConfirmModal = false;
    this.friendToRemove = null;
  }

  async removeFriend() {
    if (!this.friendToRemove) return;

    try {
      await this.tournamentService.removeFriend(this.friendToRemove.friendId);
      this.showConfirmModal = false;
      this.friendToRemove = null;
      await this.loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend');
    }
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  goToLobby() {
    this.router.navigate(['/lobby']);
  }
}