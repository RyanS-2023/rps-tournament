import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { TournamentService, Tournament } from '../../services/tournament.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-container">
      <header>
        <h1>📊 Your Stats</h1>
        <button (click)="goToLobby()" class="btn-back">Back to Lobby</button>
      </header>

      <div class="stats-content">
        @if (loading) {
          <div class="loading">Loading your stats...</div>
        } @else {
          <div class="stats-overview">
            <div class="stat-card">
              <h3>Total Games</h3>
              <p class="stat-value">{{ stats.totalGames }}</p>
            </div>
            <div class="stat-card wins">
              <h3>Wins</h3>
              <p class="stat-value">{{ stats.wins }}</p>
            </div>
            <div class="stat-card losses">
              <h3>Losses</h3>
              <p class="stat-value">{{ stats.losses }}</p>
            </div>
            <div class="stat-card draws">
              <h3>Draws</h3>
              <p class="stat-value">{{ stats.draws }}</p>
            </div>
            <div class="stat-card winrate">
              <h3>Win Rate</h3>
              <p class="stat-value">{{ stats.winRate }}%</p>
            </div>
            <div class="stat-card">
              <h3>Rounds Won</h3>
              <p class="stat-value">{{ stats.totalRoundsWon }}</p>
            </div>
          </div>

          <div class="game-history">
            <h2>Game History</h2>
            @if (gameHistory.length === 0) {
              <div class="empty-state">
                <p>No games played yet</p>
                <p class="sub-text">Start playing to see your history!</p>
              </div>
            } @else {
              <div class="history-list">
                @for (game of gameHistory; track game.id) {
                  <div class="game-card" [class.win]="didWinGame(game)" [class.lose]="didLoseGame(game)">
                    <div class="game-header">
                      <span class="result-badge" [class.win]="didWinGame(game)" [class.lose]="didLoseGame(game)">
                        {{ getGameResult(game) }}
                      </span>
                      <span class="game-date">{{ formatDate(game.updatedAt) }}</span>
                    </div>
                    <div class="game-details">
                      <div class="player-info">
                        <span class="player-name">{{ game.player1Nickname || game.player1Email }}</span>
                        <span class="score">{{ game.player1Score }}</span>
                      </div>
                      <span class="vs">vs</span>
                      <div class="player-info">
                        <span class="player-name">{{ game.player2Nickname || game.player2Email }}</span>
                        <span class="score">{{ game.player2Score }}</span>
                      </div>
                    </div>
                    <div class="rounds-detail">
                      @for (round of game.rounds; track round.roundNumber) {
                        <span class="round-icon" [class.won]="round.winner === currentUserId" 
                              [class.lost]="round.winner && round.winner !== currentUserId">
                          {{ round.roundNumber }}
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    header {
      max-width: 1200px;
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

    .stats-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .loading {
      background: white;
      padding: 60px;
      border-radius: 10px;
      text-align: center;
      font-size: 18px;
      color: #666;
    }

    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      margin: 0;
      font-size: 36px;
      font-weight: 700;
      color: #333;
    }

    .stat-card.wins .stat-value {
      color: #4caf50;
    }

    .stat-card.losses .stat-value {
      color: #f44336;
    }

    .stat-card.draws .stat-value {
      color: #ff9800;
    }

    .stat-card.winrate .stat-value {
      color: #667eea;
    }

    .game-history {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .game-history h2 {
      margin: 0 0 20px 0;
      color: #333;
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

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .game-card {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid #e0e0e0;
      transition: all 0.3s;
    }

    .game-card.win {
      border-left-color: #4caf50;
      background: #f1f8f4;
    }

    .game-card.lose {
      border-left-color: #f44336;
      background: #fef5f5;
    }

    .game-card:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .result-badge {
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .result-badge.win {
      background: #4caf50;
      color: white;
    }

    .result-badge.lose {
      background: #f44336;
      color: white;
    }

    .game-date {
      color: #999;
      font-size: 14px;
    }

    .game-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .player-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .player-name {
      font-size: 14px;
      color: #666;
    }

    .score {
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }

    .vs {
      color: #999;
      font-weight: 600;
    }

    .rounds-detail {
      display: flex;
      gap: 8px;
    }

    .round-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      background: #e0e0e0;
      color: #666;
    }

    .round-icon.won {
      background: #4caf50;
      color: white;
    }

    .round-icon.lost {
      background: #f44336;
      color: white;
    }
  `]
})
export class StatsComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(Auth);
  private tournamentService = inject(TournamentService);

  loading = true;
  currentUserId = '';
  gameHistory: Tournament[] = [];
  stats = {
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: '0.0',
    totalRoundsWon: 0,
    totalRoundsLost: 0
  };

  async ngOnInit() {
    this.currentUserId = this.auth.currentUser?.uid || '';
    await this.loadStats();
  }

  async loadStats() {
    try {
      this.gameHistory = await this.tournamentService.getUserGameHistory(this.currentUserId);
      this.stats = this.tournamentService.getUserStats(this.currentUserId, this.gameHistory);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      this.loading = false;
    }
  }

  didWinGame(game: Tournament): boolean {
    const isPlayer1 = game.player1Id === this.currentUserId;
    return isPlayer1 ? game.player1Score > game.player2Score : game.player2Score > game.player1Score;
  }

  didLoseGame(game: Tournament): boolean {
    const isPlayer1 = game.player1Id === this.currentUserId;
    return isPlayer1 ? game.player1Score < game.player2Score : game.player2Score < game.player1Score;
  }

  getGameResult(game: Tournament): string {
    if (this.didWinGame(game)) return 'Win';
    if (this.didLoseGame(game)) return 'Loss';
    return 'Draw';
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  goToLobby() {
    this.router.navigate(['/lobby']);
  }
}