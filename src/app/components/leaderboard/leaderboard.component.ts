import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { TournamentService } from '../../services/tournament.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="leaderboard-container">
      <header>
        <h1>🏆 Leaderboard</h1>
        <button (click)="goToLobby()" class="btn-back">Back to Lobby</button>
      </header>

      <div class="leaderboard-content">
        <div class="time-filters">
          <button 
            (click)="selectTimeFilter('day')" 
            [class.active]="timeFilter === 'day'"
            class="filter-btn">
            Today
          </button>
          <button 
            (click)="selectTimeFilter('week')" 
            [class.active]="timeFilter === 'week'"
            class="filter-btn">
            This Week
          </button>
          <button 
            (click)="selectTimeFilter('month')" 
            [class.active]="timeFilter === 'month'"
            class="filter-btn">
            This Month
          </button>
          <button 
            (click)="selectTimeFilter('year')" 
            [class.active]="timeFilter === 'year'"
            class="filter-btn">
            This Year
          </button>
          <button 
            (click)="selectTimeFilter('all')" 
            [class.active]="timeFilter === 'all'"
            class="filter-btn">
            All Time
          </button>
        </div>

        @if (loading) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading leaderboard...</p>
          </div>
        } @else {
          <div class="leaderboard-card">
            @if (leaders.length === 0) {
              <div class="empty-state">
                <p>No games played yet in this time period</p>
                <p class="sub-text">Be the first to compete!</p>
              </div>
            } @else {
              <div class="leaders-list">
                @for (leader of leaders; track leader.userId; let i = $index) {
                  <div class="leader-row" [class.current-user]="leader.userId === currentUserId">
                    <div class="rank">
                      @if (i === 0) {
                        <span class="medal gold">🥇</span>
                      } @else if (i === 1) {
                        <span class="medal silver">🥈</span>
                      } @else if (i === 2) {
                        <span class="medal bronze">🥉</span>
                      } @else {
                        <span class="rank-number">{{ i + 1 }}</span>
                      }
                    </div>
                    <div class="player-info">
                      <span class="player-name">{{ leader.email }}</span>
                      @if (leader.userId === currentUserId) {
                        <span class="you-badge">YOU</span>
                      }
                    </div>
                    <div class="stats">
                      <div class="stat-item">
                        <span class="stat-label">Wins</span>
                        <span class="stat-value wins">{{ leader.wins }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Games</span>
                        <span class="stat-value">{{ leader.totalGames }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Win Rate</span>
                        <span class="stat-value winrate">{{ leader.winRate.toFixed(1) }}%</span>
                      </div>
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
    .leaderboard-container {
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

    .leaderboard-content {
      max-width: 1000px;
      margin: 0 auto;
    }

    .time-filters {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .filter-btn {
      padding: 12px 24px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .filter-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
    }

    .filter-btn.active {
      background: white;
      color: #667eea;
      border-color: white;
      transform: scale(1.05);
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

    .leaderboard-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      overflow: hidden;
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

    .leaders-list {
      display: flex;
      flex-direction: column;
    }

    .leader-row {
      display: grid;
      grid-template-columns: 80px 1fr auto;
      align-items: center;
      gap: 20px;
      padding: 20px 30px;
      border-bottom: 1px solid #f0f0f0;
      transition: all 0.3s;
    }

    .leader-row:last-child {
      border-bottom: none;
    }

    .leader-row:hover {
      background: #f9f9f9;
    }

    .leader-row.current-user {
      background: linear-gradient(90deg, #fff9e6 0%, #ffe6b3 100%);
      border-left: 4px solid #ffd700;
    }

    .rank {
      text-align: center;
    }

    .medal {
      font-size: 36px;
    }

    .rank-number {
      font-size: 28px;
      font-weight: 700;
      color: #999;
    }

    .player-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .player-name {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .you-badge {
      padding: 4px 12px;
      background: #667eea;
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
    }

    .stats {
      display: flex;
      gap: 30px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .stat-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #333;
    }

    .stat-value.wins {
      color: #4caf50;
    }

    .stat-value.winrate {
      color: #667eea;
    }

    @media (max-width: 768px) {
      .leader-row {
        grid-template-columns: 60px 1fr;
        gap: 15px;
      }

      .stats {
        grid-column: 1 / -1;
        justify-content: space-around;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #e0e0e0;
      }

      .rank-number {
        font-size: 20px;
      }

      .medal {
        font-size: 28px;
      }
    }
  `]
})
export class LeaderboardComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(Auth);
  private tournamentService = inject(TournamentService);

  loading = true;
  currentUserId = '';
  timeFilter: 'day' | 'week' | 'month' | 'year' | 'all' = 'all';
  leaders: any[] = [];

  async ngOnInit() {
    this.currentUserId = this.auth.currentUser?.uid || '';
    await this.loadLeaderboard();
  }

  async selectTimeFilter(filter: 'day' | 'week' | 'month' | 'year' | 'all') {
    this.timeFilter = filter;
    this.loading = true;
    await this.loadLeaderboard();
  }

  async loadLeaderboard() {
    try {
      this.leaders = await this.tournamentService.getLeaderboardData(this.timeFilter);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      this.loading = false;
    }
  }

  goToLobby() {
    this.router.navigate(['/lobby']);
  }
}