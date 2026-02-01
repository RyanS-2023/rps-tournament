import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TournamentService, Tournament } from '../../services/tournament.service';
import { Subscription } from 'rxjs';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lobby-container">
      <header>
        <h1>🏆 RPS Tournament Lobby</h1>
        <div class="user-info">
          <span>{{ userEmail }}</span>
          <button (click)="viewSlots()" class="btn-slots">SKOL</button>
          <button (click)="viewVideoPoker()" class="btn-poker">POKER</button>
          <button (click)="viewFriends()" class="btn-friends">Friends</button>
          <button (click)="viewLeaderboard()" class="btn-leaderboard">Leaderboard</button>
          <button (click)="viewStats()" class="btn-stats">Stats</button>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </header>
      
      <div class="lobby-content">
        <!-- IN-PROGRESS CASUAL GAMES -->
@if (inProgressGames.length > 0) {
  <div class="resume-section">
    <h2>📱 Resume Your Games</h2>
    <div class="games-list">
      @for (game of inProgressGames; track game.id) {
        <div class="game-card">
          <button (click)="endGame(game.id!)" class="btn-end-game" title="End this game">
            ✕
          </button>
          <div class="game-info">
            <h3>{{ game.player1Nickname || game.player1Email }} vs {{ game.player2Nickname || game.player2Email }}</h3>
            <p class="score">Score: {{ game.player1Score }} - {{ game.player2Score }}</p>
            <small>Last played {{ getTimeAgo(game.updatedAt) }}</small>
          </div>
          <button (click)="resumeGame(game.id!)" class="btn-resume">
            Resume
          </button>
        </div>
      }
    </div>
  </div>
}

        <!-- GAME MODE SELECTION -->
        <div class="mode-selector">
          <h2>Select Game Mode</h2>
          <div class="mode-tabs">
            <button 
              (click)="selectedMode = 'casual'" 
              [class.active]="selectedMode === 'casual'"
              class="tab-button">
              🎮 Casual Mode
            </button>
            <button 
              (click)="selectedMode = 'tournament'" 
              [class.active]="selectedMode === 'tournament'"
              class="tab-button">
              🏆 Tournament Mode
            </button>
          </div>
          
          <div class="mode-description">
            @if (selectedMode === 'casual') {
              <p>✨ <strong>Casual Mode:</strong> Play a single game with no time limits. Games are automatically saved and can be resumed anytime!</p>
            } @else {
              <p>⚡ <strong>Tournament Mode:</strong> Best of 5 rounds with 60-second time limits per move. Complete the tournament in one session!</p>
            }
          </div>
        </div>
        
        <div class="game-modes">
          @if (selectedMode === 'casual') {
            <!-- CASUAL MODE OPTIONS -->
            <div class="mode-card">
              <h2>🤖 Play vs Computer</h2>
              <p>Practice at your own pace - resume anytime</p>
              <button (click)="playCasualVsComputer()" class="btn-casual-computer" [disabled]="creating">
                {{ creating ? 'Starting...' : 'Start Casual Game' }}
              </button>
            </div>
            
            <div class="mode-card">
              <h2>👥 Play vs Player</h2>
              <p>Challenge a friend - no time pressure!</p>
              <button (click)="createCasualGame()" class="btn-casual-multi" [disabled]="creating">
                {{ creating ? 'Creating...' : 'Create Casual Game' }}
              </button>
            </div>
          } @else {
            <!-- TOURNAMENT MODE OPTIONS -->
            <div class="mode-card">
              <h2>🤖 Play vs Computer</h2>
              <p>Best of 5 competitive match against AI</p>
              <button (click)="playVsComputer()" class="btn-computer" [disabled]="creating">
                {{ creating ? 'Starting...' : 'Start Tournament' }}
              </button>
            </div>
            
            <div class="mode-card">
              <h2>👥 Multiplayer</h2>
              <p>Best of 5 competitive match with timer</p>
              <button (click)="createTournament()" class="btn-create" [disabled]="creating">
                {{ creating ? 'Creating...' : 'Create Tournament' }}
              </button>
            </div>
          }
        </div>
        
        <div class="tournaments-section">
          <h2>Available Games</h2>
          
          @if (tournaments.length === 0) {
            <div class="empty-state">
              <p>No games available</p>
              <p class="sub-text">Create one to get started!</p>
            </div>
          } @else {
            <div class="tournaments-list">
              @for (tournament of tournaments; track tournament.id) {
                <div class="tournament-card">
                  <div class="tournament-info">
                    <h3>{{ tournament.player1Nickname || tournament.player1Email }}</h3>
                    <p>
                      @if (tournament.gameMode === 'casual') {
                        <span class="badge-casual">🎮 Casual</span>
                      } @else {
                        <span class="badge-tournament">🏆 Tournament</span>
                      }
                      Waiting for opponent...
                    </p>
                    <small>Created {{ getTimeAgo(tournament.createdAt) }}</small>
                  </div>
                  <div class="tournament-actions">
                    @if (tournament.player1Id === currentUserId) {
                      <button (click)="cancelTournament(tournament.id!)" class="btn-cancel">
                        Cancel
                      </button>
                    } @else {
                      <button (click)="joinTournament(tournament.id!)" class="btn-join">
                        Join
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lobby-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    header {
      max-width: 1000px;
      margin: 0 auto 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    h1 {
      color: white;
      margin: 0;
      font-size: 1.8rem;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
      flex-wrap: wrap;
    }
    
    .user-info > span {
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 200px;
    }
    
    .btn-logout,
    .btn-stats,
    .btn-leaderboard,
    .btn-friends,
    .btn-slots,
    .btn-poker {
      padding: 10px 20px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid white;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      white-space: nowrap;
      transition: background 0.3s;
    }
    
    .btn-slots {
      background: linear-gradient(90deg, #4F2683 0%, #79228B 100%);
      border-color: #FFC62F;
      color: #FFC62F;
      font-weight: 800;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }
    
    .btn-poker {
      background: linear-gradient(90deg, #0a3d0a 0%, #1a5f1a 100%);
      border-color: #FFD700;
      color: #FFD700;
      font-weight: 800;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }
    
    .btn-logout:hover,
    .btn-stats:hover,
    .btn-leaderboard:hover,
    .btn-friends:hover {
      background: rgba(255,255,255,0.3);
    }
    
    .btn-slots:hover {
      background: linear-gradient(90deg, #5a2d94 0%, #8b2d9c 100%);
      box-shadow: 0 0 15px rgba(255, 198, 47, 0.5);
      transform: translateY(-2px);
    }
    
    .btn-poker:hover {
      background: linear-gradient(90deg, #0d4a0d 0%, #227022 100%);
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
      transform: translateY(-2px);
    }
    
    .lobby-content {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    /* RESUME SECTION */
    .resume-section {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      margin-bottom: 30px;
    }
    
    .resume-section h2 {
      margin-bottom: 20px;
      color: #333;
    }
    
    .games-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .game-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 20px;
  background: #f0f7ff;
  border-radius: 8px;
  border: 2px solid #4caf50;
  gap: 20px;
  position: relative;
}
    
.btn-end-game {
  width: 36px;
  height: 36px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-end-game:hover {
  background: #da190b;
  transform: scale(1.1);
}

.game-info {
  flex: 1;
  min-width: 0;
  text-align: center;
}

    .game-info {
      flex: 1;
      min-width: 0;
    }
    
    .game-info h3 {
  margin: 0 0 8px 0;
  color: #333;
  word-wrap: break-word;
  font-size: 18px;
}

.game-info .score {
  margin: 8px 0;
  color: #4caf50;
  font-weight: bold;
  font-size: 16px;
}

.game-info small {
  color: #999;
  font-size: 12px;
}
    
    .btn-resume {
      padding: 10px 30px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      white-space: nowrap;
    }
    
    .btn-resume:hover {
      background: #45a049;
    }
    
    /* MODE SELECTOR */
    .mode-selector {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      margin-bottom: 30px;
      text-align: center;
    }
    
    .mode-selector h2 {
      margin-bottom: 20px;
      color: #333;
    }
    
    .mode-tabs {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .tab-button {
      padding: 15px 40px;
      background: #f5f5f5;
      color: #666;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .tab-button:hover {
      background: #e8e8e8;
      border-color: #667eea;
    }
    
    .tab-button.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
    }
    
    .mode-description {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    
    .mode-description p {
      margin: 0;
      color: #555;
      line-height: 1.6;
    }
    
    .game-modes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .mode-card {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      text-align: center;
    }
    
    .mode-card h2 {
      margin-bottom: 10px;
      color: #333;
      font-size: 1.5rem;
    }
    
    .mode-card p {
      color: #666;
      margin-bottom: 20px;
    }
    
    .btn-create, .btn-computer, .btn-casual-computer, .btn-casual-multi {
      padding: 15px 40px;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
      width: 100%;
    }
    
    .btn-create {
      background: #667eea;
    }
    
    .btn-create:hover:not(:disabled) {
      background: #5568d3;
    }
    
    .btn-computer {
      background: #ff6b6b;
    }
    
    .btn-computer:hover:not(:disabled) {
      background: #ee5a52;
    }
    
    .btn-casual-computer {
      background: #4caf50;
    }
    
    .btn-casual-computer:hover:not(:disabled) {
      background: #45a049;
    }
    
    .btn-casual-multi {
      background: #2196f3;
    }
    
    .btn-casual-multi:hover:not(:disabled) {
      background: #1976d2;
    }
    
    .btn-create:disabled, .btn-computer:disabled, 
    .btn-casual-computer:disabled, .btn-casual-multi:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .tournaments-section {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    
    .tournaments-section h2 {
      margin-bottom: 20px;
      color: #333;
      font-size: 1.5rem;
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }
    
    .empty-state .sub-text {
      font-size: 14px;
      margin-top: 10px;
    }
    
    .tournaments-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .tournament-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
      border: 2px solid #e0e0e0;
      transition: all 0.3s;
      gap: 15px;
      flex-wrap: wrap;
    }
    
    .tournament-card:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102,126,234,0.2);
    }
    
    .tournament-info {
      flex: 1;
      min-width: 0;
    }
    
    .tournament-info h3 {
      margin: 0 0 5px 0;
      color: #333;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .tournament-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    
    .tournament-info small {
      color: #999;
      font-size: 12px;
    }
    
    .badge-casual,
    .badge-tournament {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
    }
    
    .badge-casual {
      background: #e8f5e9;
      color: #4caf50;
    }
    
    .badge-tournament {
      background: #e3f2fd;
      color: #2196f3;
    }
    
    .tournament-actions {
      flex-shrink: 0;
    }
    
    .btn-join, .btn-cancel {
      padding: 10px 30px;
      border: none;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      white-space: nowrap;
    }
    
    .btn-join {
      background: #4caf50;
      color: white;
    }
    
    .btn-join:hover {
      background: #45a049;
    }
    
    .btn-cancel {
      background: #f44336;
      color: white;
    }
    
    .btn-cancel:hover {
      background: #da190b;
    }
    
    @media (max-width: 768px) {
      .game-card {
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        gap: 15px;
      }
      
      .btn-end-game {
        grid-row: 1;
        grid-column: 1;
      }
      
      .game-info {
        grid-row: 1;
        grid-column: 2;
      }
      
      .btn-resume {
        grid-row: 2;
        grid-column: 1 / -1;
        width: 100%;
      }
      
      header {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
      }
      
      h1 {
        font-size: 1.5rem;
        text-align: center;
      }
      
      .user-info {
        justify-content: center;
        gap: 8px;
      }
      
      .user-info > span {
        width: 100%;
        text-align: center;
        max-width: 100%;
      }
      
      .mode-tabs {
        flex-direction: column;
      }
      
      .tab-button {
        width: 100%;
      }
      
      .game-modes {
        grid-template-columns: 1fr;
        gap: 15px;
      }
      
      .mode-card {
        padding: 25px;
      }
      
      .mode-card h2 {
        font-size: 1.3rem;
      }
      
      .tournaments-section, .resume-section, .mode-selector {
        padding: 25px;
      }
      
      .tournaments-section h2, .resume-section h2, .mode-selector h2 {
        font-size: 1.3rem;
      }
      
      .tournament-card, .game-card {
        padding: 15px;
      }
    }
    
    @media (max-width: 480px) {
      .lobby-container {
        padding: 10px;
      }
      
      h1 {
        font-size: 1.3rem;
      }
      
      .user-info {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
      }
      
      .user-info > span {
        text-align: center;
        padding: 8px;
        background: rgba(255,255,255,0.2);
        border-radius: 5px;
      }
      
      .btn-logout,
      .btn-stats,
      .btn-leaderboard,
      .btn-friends,
      .btn-slots,
      .btn-poker {
        width: 100%;
        padding: 12px;
        text-align: center;
      }
      
      .game-modes {
        gap: 12px;
      }
      
      .mode-card {
        padding: 20px;
      }
      
      .mode-card h2 {
        font-size: 1.2rem;
      }
      
      .btn-create, .btn-computer, .btn-casual-computer, .btn-casual-multi {
        padding: 12px 30px;
        font-size: 16px;
      }
      
      .tournaments-section, .resume-section, .mode-selector {
        padding: 20px 15px;
      }
      
      .tournaments-section h2, .resume-section h2, .mode-selector h2 {
        font-size: 1.2rem;
        margin-bottom: 15px;
      }
      
      .tournament-card, .game-card {
        flex-direction: column;
        align-items: stretch;
        padding: 15px;
        gap: 12px;
      }
      
      .tournament-info, .game-info {
        text-align: center;
      }
      
      .tournament-actions {
        width: 100%;
      }
      
      .btn-join, .btn-cancel, .btn-resume {
        width: 100%;
        padding: 12px;
      }
      
      .empty-state {
        padding: 40px 15px;
      }
    }
    
    @media (max-width: 360px) {
      h1 {
        font-size: 1.1rem;
      }
      
      .mode-card h2 {
        font-size: 1.1rem;
      }
      
      .btn-logout,
      .btn-stats,
      .btn-leaderboard,
      .btn-friends,
      .btn-slots,
      .btn-poker {
        padding: 10px;
        font-size: 14px;
      }
    }
  `]
})
export class LobbyComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private tournamentService = inject(TournamentService);
  private router = inject(Router);
  private auth = inject(Auth);
  
  tournaments: Tournament[] = [];
  inProgressGames: Tournament[] = [];
  creating = false;
  userEmail = '';
  currentUserId = '';
  selectedMode: 'casual' | 'tournament' = 'casual';
  private subscription?: Subscription;
  private inProgressSubscription?: Subscription;

  ngOnInit() {
    this.userEmail = this.auth.currentUser?.email || '';
    this.currentUserId = this.auth.currentUser?.uid || '';
    
    this.subscription = this.tournamentService.getAvailableTournaments().subscribe({
      next: (tournaments) => {
        this.tournaments = tournaments;
      },
      error: (error) => {
        console.error('Error loading tournaments:', error);
      }
    });
    
    this.inProgressSubscription = this.tournamentService.getInProgressCasualGames(this.currentUserId).subscribe({
      next: (games) => {
        this.inProgressGames = games;
      },
      error: (error) => {
        console.error('Error loading in-progress games:', error);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.inProgressSubscription?.unsubscribe();
  }

  async playVsComputer() {
    this.creating = true;
    try {
      const tournamentId = await this.tournamentService.createComputerTournament();
      this.router.navigate(['/game', tournamentId]);
    } catch (error) {
      console.error('Error creating computer tournament:', error);
      alert('Failed to create computer tournament');
    } finally {
      this.creating = false;
    }
  }

  async createTournament() {
    this.creating = true;
    try {
      const tournamentId = await this.tournamentService.createTournament();
      this.router.navigate(['/game', tournamentId]);
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Failed to create tournament');
    } finally {
      this.creating = false;
    }
  }

  async joinTournament(tournamentId: string) {
  try {
    await this.tournamentService.joinTournament(tournamentId);
    this.router.navigate(['/game', tournamentId]);
  } catch (error: any) {
    console.error('Error joining tournament:', error);
    if (error.message === 'You already have an active game with this player') {
      alert('You already have an active game with this player. Check your "Resume Your Games" section above!');
    } else {
      alert('Failed to join tournament');
    }
  }
}

  async cancelTournament(tournamentId: string) {
    if (confirm('Are you sure you want to cancel this tournament?')) {
      try {
        await this.tournamentService.deleteTournament(tournamentId);
      } catch (error) {
        console.error('Error canceling tournament:', error);
        alert('Failed to cancel tournament');
      }
    }
  }
    
  async playCasualVsComputer() {
    this.creating = true;
    try {
      const gameId = await this.tournamentService.createCasualComputerGame();
      this.router.navigate(['/game', gameId]);
    } catch (error) {
      console.error('Error creating casual game:', error);
      alert('Failed to create casual game');
    } finally {
      this.creating = false;
    }
  }

  async createCasualGame() {
    this.creating = true;
    try {
      const gameId = await this.tournamentService.createCasualGame();
      this.router.navigate(['/game', gameId]);
    } catch (error) {
      console.error('Error creating casual game:', error);
      alert('Failed to create casual game');
    } finally {
      this.creating = false;
    }
  }

  resumeGame(gameId: string) {
    this.router.navigate(['/game', gameId]);
  }

  async endGame(gameId: string) {
  if (confirm('Are you sure you want to end this game? This cannot be undone.')) {
    try {
      await this.tournamentService.deleteTournament(gameId);
    } catch (error) {
      console.error('Error ending game:', error);
      alert('Failed to end game');
    }
  }
}

  getTimeAgo(timestamp: any): string {
    if (!timestamp) return 'just now';
    const seconds = Math.floor((Date.now() - timestamp.toDate().getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  logout() {
    this.authService.logout();
  }

  viewStats() {
    this.router.navigate(['/stats']);
  }

  viewLeaderboard() {
    this.router.navigate(['/leaderboard']);
  }

  viewFriends() {
    this.router.navigate(['/friends']);
  }

  viewSlots() {
    this.router.navigate(['/slots']);
  }

  viewVideoPoker() {
    this.router.navigate(['/video-poker']);
  }
}