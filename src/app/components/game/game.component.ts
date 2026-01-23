import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentService, Tournament, Choice, ChatMessage } from '../../services/tournament.service';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="game-container">
      <header>
        <h1>🏆 RPS Tournament</h1>
        <button (click)="exitGame()" class="btn-exit">Exit to Lobby</button>
      </header>
      
      @if (!tournament) {
        <div class="loading">Loading tournament...</div>
      } @else if (tournament.status === 'waiting') {
        <div class="waiting-screen">
          <h2>Waiting for opponent...</h2>
          <p>Tournament created by {{ tournament.player1Email }}</p>
          <div class="spinner"></div>
          <button (click)="exitGame()" class="btn-cancel">Cancel Tournament</button>
        </div>
      } @else if (tournament.status === 'completed') {
        <div class="end-screen">
          <h2>Tournament Complete!</h2>
          <div class="final-score">
            <div class="player-card" [class.winner]="isPlayer1Winner()">
              <h3>{{ tournament.player1Nickname || tournament.player1Email }}</h3>
              <p class="score">{{ tournament.player1Score }}</p>
              @if (isPlayer1Winner()) {
                <span class="trophy">🏆</span>
              }
            </div>
            <div class="vs">VS</div>
            <div class="player-card" [class.winner]="isPlayer2Winner()">
              <h3>{{ tournament.player2Nickname || tournament.player2Email }}</h3>
              <p class="score">{{ tournament.player2Score }}</p>
              @if (isPlayer2Winner()) {
                <span class="trophy">🏆</span>
              }
            </div>
          </div>
          
          <div class="rounds-summary">
            <h3>Round Summary</h3>
            @for (round of tournament.rounds; track round.roundNumber) {
              <div class="round-summary-item">
                <span>Round {{ round.roundNumber }}:</span>
                <span>{{ getIcon(round.player1Choice) }} vs {{ getIcon(round.player2Choice) }}</span>
                <span [class.win]="round.winner === currentUserId" 
                      [class.lose]="round.winner && round.winner !== currentUserId && round.winner !== 'draw'">
                  {{ getRoundResult(round) }}
                </span>
              </div>
            }
          </div>
          
          <button (click)="exitGame()" class="btn-lobby">Back to Lobby</button>
        </div>
        
      } @else {
        <div class="game-layout">
          <!-- Main Game Area -->
          <div class="game-screen">
            <div class="scoreboard">
              <div class="score-item">
                <span>
                  @if (tournament.gameMode === 'casual') {
                    Score:
                  } @else {
                    Round:
                  }
                </span>
                <strong>
                  @if (tournament.gameMode === 'casual') {
                    {{ tournament.player1Score }} - {{ tournament.player2Score }}
                  } @else {
                    {{ tournament.currentRound }} / 5
                  }
                </strong>
              </div>
              <div class="score-item">
                <span>{{ tournament.player1Nickname || tournament.player1Email }}:</span>
                <strong>{{ tournament.player1Score }}</strong>
              </div>
              <div class="score-item">
                <span>{{ tournament.player2Nickname || tournament.player2Email }}:</span>
                <strong>{{ tournament.player2Score }}</strong>
              </div>
            </div>

            @if (!isOpponentFriend && !tournament.isVsComputer) {
              <button (click)="addOpponentAsFriend()" class="btn-add-friend">
                Add {{ getOpponentEmail() }} as Friend
              </button>
            }
            
            @if (hasCurrentPlayerMadeChoice()) {
              <div class="waiting-choice">
                <h3>Waiting for opponent...</h3>
                <p>You chose: {{ getIcon(getCurrentPlayerChoice()) }}</p>
                <div class="spinner"></div>
              </div>
            } @else if (isRoundComplete()) {
              <div class="round-result">
                <h3>
                  @if (tournament.gameMode === 'casual') {
                    Result
                  } @else {
                    Round {{ tournament.currentRound - 1 }} Result
                  }
                </h3>
                <div class="choices">
                  <div class="choice-display">
                    <div class="icon">{{ getIcon(getPreviousRound()?.player1Choice) }}</div>
                    <p>{{ tournament.player1Nickname || tournament.player1Email }}</p>
                  </div>
                  <div class="vs-text">VS</div>
                  <div class="choice-display">
                    <div class="icon">{{ getIcon(getPreviousRound()?.player2Choice) }}</div>
                    <p>{{ tournament.player2Nickname || tournament.player2Email }}</p>
                  </div>
                </div>
                <p class="result-text" [class.win]="didCurrentPlayerWinPreviousRound()" 
                   [class.lose]="!didCurrentPlayerWinPreviousRound() && getPreviousRound()?.winner">
                  {{ getRoundResultText() }}
                </p>
                
                <!-- ONLY SHOW TIMER FOR TOURNAMENT MODE -->
                @if (tournament.gameMode !== 'casual') {
                  <div class="timer-display">
                    <p class="timer-text">Auto-continuing in {{ resultTimeLeft }}s</p>
                  </div>
                }
                
                <!-- CASUAL MODE: Play Again or Back to Lobby -->
                @if (tournament.gameMode === 'casual') {
                  <div class="casual-buttons">
                    <button (click)="playAgain()" class="btn-play-again">
                      🎮 Play Again
                    </button>
                    <button (click)="exitGame()" class="btn-lobby-casual">
                      🏠 Back to Lobby
                    </button>
                  </div>
                } @else {
                  <button (click)="continueToNextRound()" class="btn-continue">
                    Continue to Round {{ tournament.currentRound }} Now
                  </button>
                }
              </div>
            } @else {
              <div class="choice-buttons">
                <!-- ONLY SHOW TIMER FOR TOURNAMENT MODE -->
                @if (tournament.gameMode !== 'casual') {
                  <div class="timer-display warning">
                    <p class="timer-text">⏱️ Time remaining: {{ moveTimeLeft }}s</p>
                  </div>
                }
                
                <h3>Make your choice:</h3>
                <div class="buttons">
                  <button (click)="makeChoice('rock')" class="btn-choice">
                    <span class="icon">✊</span>
                    <span>Rock</span>
                  </button>
                  <button (click)="makeChoice('paper')" class="btn-choice">
                    <span class="icon">✋</span>
                    <span>Paper</span>
                  </button>
                  <button (click)="makeChoice('scissors')" class="btn-choice">
                    <span class="icon">✌️</span>
                    <span>Scissors</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Chat Sidebar (Only for non-computer games) -->
          @if (!tournament.isVsComputer) {
            <div class="chat-sidebar">
              <div class="chat-header">
                <h3>💬 Chat</h3>
              </div>
              
              <div class="chat-messages" #chatContainer>
                @if (chatMessages.length === 0) {
                  <div class="chat-empty">
                    <p>No messages yet</p>
                    <p class="sub">Say hello! 👋</p>
                  </div>
                } @else {
                  @for (msg of chatMessages; track msg.id) {
                    <div class="chat-message" [class.own-message]="msg.userId === currentUserId">
                      <div class="message-header">
                        <span class="message-author">{{ msg.userNickname }}</span>
                        <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                      </div>
                      <div class="message-text">{{ msg.message }}</div>
                    </div>
                  }
                }
              </div>
              
              <div class="chat-input">
                <input 
                  type="text" 
                  [(ngModel)]="chatMessage"
                  (keyup.enter)="sendMessage()"
                  placeholder="Type a message..."
                  maxlength="200"
                />
                <button (click)="sendMessage()" [disabled]="!chatMessage.trim()">
                  Send
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .game-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto 30px;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    h1 {
      color: white;
      margin: 0;
      font-size: 1.8rem;
    }
    
    .btn-exit {
      padding: 10px 20px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid white;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .btn-exit:hover {
      background: rgba(255,255,255,0.3);
    }
    
    .loading, .waiting-screen, .end-screen {
      background: white;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      text-align: center;
    }
    
    .game-layout {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      gap: 20px;
      align-items: flex-start;
    }
    
    .game-screen {
      flex: 1;
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      min-width: 0;
      width: 100%;
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 30px auto;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .btn-cancel, .btn-lobby {
      padding: 12px 30px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 20px;
    }
    
    .btn-continue {
      padding: 15px 40px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 30px;
    }
    
    .btn-add-friend {
      padding: 12px 30px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
      width: 100%;
      max-width: 300px;
    }
    
    .casual-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
      flex-wrap: wrap;
    }
    
    .btn-play-again {
      padding: 15px 40px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .btn-play-again:hover {
      background: #45a049;
    }
    
    .btn-lobby-casual {
      padding: 15px 40px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .btn-lobby-casual:hover {
      background: #5568d3;
    }
    
    .timer-display {
      margin: 20px 0;
      padding: 15px;
      background: #e3f2fd;
      border-radius: 8px;
      border: 2px solid #2196f3;
    }
    
    .timer-display.warning {
      background: #fff3e0;
      border-color: #ff9800;
    }
    
    .timer-text {
      margin: 0;
      font-weight: 600;
      word-wrap: break-word;
    }
    
    .scoreboard {
      display: flex;
      justify-content: space-around;
      margin-bottom: 40px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 10px;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .score-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      min-width: 0;
      flex: 1;
      min-width: 100px;
    }
    
    .score-item span,
    .score-item strong {
      word-wrap: break-word;
      overflow-wrap: break-word;
      text-align: center;
      max-width: 100%;
    }
    
    .choice-buttons {
      text-align: center;
    }
    
    .choice-buttons h3 {
      margin-bottom: 20px;
    }
    
    .buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn-choice {
      padding: 30px;
      background: white;
      border: 3px solid #667eea;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      min-width: 120px;
      flex: 1;
      max-width: 200px;
    }
    
    .btn-choice:hover {
      background: #667eea;
      color: white;
      transform: translateY(-5px);
    }
    
    .btn-choice .icon {
      font-size: 48px;
    }
    
    .btn-choice span:last-child {
      font-size: 16px;
      font-weight: 600;
    }
    
    .round-result,
    .waiting-choice {
      text-align: center;
    }
    
    .choices {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin: 30px 0;
      flex-wrap: wrap;
    }
    
    .choice-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    
    .choice-display .icon {
      font-size: 64px;
    }
    
    .choice-display p {
      margin: 0;
      word-wrap: break-word;
      max-width: 150px;
      text-align: center;
    }
    
    .vs-text {
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
    }
    
    .result-text {
      font-size: 24px;
      font-weight: bold;
      margin: 20px 0;
    }
    
    .result-text.win {
      color: #4caf50;
    }
    
    .result-text.lose {
      color: #f44336;
    }
    
    /* Chat Sidebar */
    .chat-sidebar {
      width: 350px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      height: 600px;
      flex-shrink: 0;
    }
    
    .chat-header {
      padding: 20px;
      border-bottom: 2px solid #f0f0f0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px 10px 0 0;
    }
    
    .chat-header h3 {
      margin: 0;
      color: white;
      font-size: 18px;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .chat-empty {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }
    
    .chat-empty .sub {
      font-size: 14px;
      margin-top: 5px;
    }
    
    .chat-message {
      display: flex;
      flex-direction: column;
      gap: 5px;
      max-width: 80%;
    }
    
    .chat-message.own-message {
      align-self: flex-end;
    }
    
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    
    .message-author {
      font-size: 12px;
      font-weight: 600;
      color: #667eea;
      word-wrap: break-word;
    }
    
    .own-message .message-author {
      color: #764ba2;
    }
    
    .message-time {
      font-size: 11px;
      color: #999;
      white-space: nowrap;
    }
    
    .message-text {
      background: #f5f5f5;
      padding: 10px 15px;
      border-radius: 12px;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .own-message .message-text {
      background: #667eea;
      color: white;
    }
    
    .chat-input {
      display: flex;
      gap: 10px;
      padding: 15px;
      border-top: 2px solid #f0f0f0;
    }
    
    .chat-input input {
      flex: 1;
      padding: 10px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
      min-width: 0;
    }
    
    .chat-input input:focus {
      border-color: #667eea;
    }
    
    .chat-input button {
      padding: 10px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 20px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
      white-space: nowrap;
    }
    
    .chat-input button:hover:not(:disabled) {
      background: #5568d3;
    }
    
    .chat-input button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .final-score {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 40px;
      margin: 40px 0;
      flex-wrap: wrap;
    }
    
    .player-card {
      text-align: center;
      padding: 30px 40px;
      background: #f5f5f5;
      border-radius: 10px;
      border: 3px solid transparent;
      position: relative;
      min-width: 200px;
      max-width: 100%;
    }
    
    .player-card h3 {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .player-card.winner {
      border-color: #ffd700;
      background: linear-gradient(135deg, #fff9e6 0%, #ffe6b3 100%);
    }
    
    .player-card .trophy {
      font-size: 32px;
      position: absolute;
      top: -15px;
      right: -15px;
    }
    
    .player-card .score {
      font-size: 48px;
      font-weight: bold;
      margin: 10px 0;
      color: #667eea;
    }
    
    .rounds-summary {
      margin-top: 30px;
      text-align: left;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .round-summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .round-summary-item span {
      word-wrap: break-word;
    }
    
    .round-summary-item .win {
      color: #4caf50;
      font-weight: bold;
    }
    
    .round-summary-item .lose {
      color: #f44336;
      font-weight: bold;
    }
    
    @media (max-width: 1024px) {
      .game-layout {
        flex-direction: column;
      }
      
      .game-screen {
        width: 100%;
      }
      
      .chat-sidebar {
        width: 100%;
        height: 400px;
      }
    }
    
    @media (max-width: 768px) {
      .game-container {
        padding: 10px;
      }
      
      h1 {
        font-size: 1.5rem;
      }
      
      .game-screen {
        padding: 20px;
        width: 100%;
      }
      
      .loading, .waiting-screen, .end-screen {
        padding: 20px;
      }
      
      .scoreboard {
        padding: 15px;
        margin-bottom: 20px;
      }
      
      .score-item {
        font-size: 14px;
      }
      
      .buttons {
        gap: 10px;
      }
      
      .btn-choice {
        padding: 20px 15px;
        min-width: 90px;
      }
      
      .btn-choice .icon {
        font-size: 36px;
      }
      
      .btn-choice span:last-child {
        font-size: 14px;
      }
      
      .choice-display .icon {
        font-size: 48px;
      }
      
      .vs-text {
        font-size: 20px;
      }
      
      .result-text {
        font-size: 20px;
      }
      
      .btn-continue, .btn-play-again, .btn-lobby-casual {
        padding: 12px 30px;
        font-size: 16px;
      }
      
      .timer-display {
        padding: 10px;
      }
      
      .final-score {
        gap: 20px;
      }
      
      .player-card {
        padding: 20px 25px;
        min-width: 150px;
      }
      
      .player-card .score {
        font-size: 36px;
      }
      
      .casual-buttons {
        flex-direction: column;
        gap: 10px;
      }
    }
    
    @media (max-width: 480px) {
      .game-container {
        padding: 5px;
      }
      
      header {
        justify-content: center;
        margin-bottom: 15px;
      }
      
      h1 {
        font-size: 1.3rem;
        text-align: center;
        width: 100%;
      }
      
      .btn-exit {
        width: 100%;
        max-width: 200px;
      }
      
      .game-screen {
        padding: 15px;
        width: 100%;
      }
      
      .scoreboard {
        flex-direction: column;
        gap: 15px;
      }
      
      .score-item {
        width: 100%;
      }
      
      .buttons {
        flex-direction: column;
        gap: 15px;
      }
      
      .btn-choice {
        max-width: 100%;
        width: 100%;
      }
      
      .choices {
        gap: 15px;
      }
      
      .choice-display .icon {
        font-size: 40px;
      }
      
      .chat-sidebar {
        height: 350px;
      }
      
      .chat-messages {
        padding: 15px;
      }
      
      .player-card {
        width: 100%;
        max-width: 250px;
      }
      
      .casual-buttons {
        width: 100%;
      }
      
      .btn-play-again, .btn-lobby-casual {
        width: 100%;
      }
    }
  `]
})
export class GameComponent implements OnInit, OnDestroy {
  private tournamentService = inject(TournamentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(Auth);
  
  tournament: Tournament | null = null;
  tournamentId = '';
  currentUserId = '';
  private subscription?: Subscription;
  private chatSubscription?: Subscription;
  private acknowledgedRounds: Set<number> = new Set();
  private resultTimer: any = null;
  private moveTimer: any = null;
  resultTimeLeft = 30;
  moveTimeLeft = 60;
  isOpponentFriend = false;
  
  chatMessages: ChatMessage[] = [];
  chatMessage = '';

  playAgain() {
    if (!this.tournament) return;
    this.acknowledgedRounds.add(this.tournament.currentRound - 1);
    this.continueToNextRound();
  }

  continueToNextRound() {
    if (!this.tournament) return;
    this.acknowledgedRounds.add(this.tournament.currentRound - 1);
    this.clearResultTimer();
    
    if (this.tournament.gameMode !== 'casual') {
      this.startMoveTimer();
    }
  }

  private startResultTimer() {
    this.clearResultTimer();
    this.resultTimeLeft = 30;
    
    this.resultTimer = setInterval(() => {
      this.resultTimeLeft--;
      if (this.resultTimeLeft <= 0) {
        this.continueToNextRound();
      }
    }, 1000);
  }

  private clearResultTimer() {
    if (this.resultTimer) {
      clearInterval(this.resultTimer);
      this.resultTimer = null;
    }
  }

  private startMoveTimer() {
    this.clearMoveTimer();
    this.moveTimeLeft = 60;
    
    this.moveTimer = setInterval(() => {
      this.moveTimeLeft--;
      if (this.moveTimeLeft <= 0) {
        this.autoLoseRound();
      }
    }, 1000);
  }

  private clearMoveTimer() {
    if (this.moveTimer) {
      clearInterval(this.moveTimer);
      this.moveTimer = null;
    }
  }

  private async autoLoseRound() {
    if (this.tournament?.gameMode === 'casual') {
      this.clearMoveTimer();
      return;
    }
    
    if (!this.hasCurrentPlayerMadeChoice()) {
      await this.makeChoice('rock');
    }
    this.clearMoveTimer();
  }

  private async checkIfFriend() {
    if (!this.tournament || !this.tournament.player2Id) return;
    
    const opponentId = this.currentUserId === this.tournament.player1Id 
      ? this.tournament.player2Id 
      : this.tournament.player1Id;
    
    this.isOpponentFriend = await this.tournamentService.isFriend(opponentId);
  }

  ngOnInit() {
    this.currentUserId = this.auth.currentUser?.uid || '';
    this.tournamentId = this.route.snapshot.paramMap.get('tournamentId') || '';
    
    if (this.tournamentId) {
      this.subscription = this.tournamentService.getTournament(this.tournamentId).subscribe({
        next: async (tournament) => {
          this.tournament = tournament;
          if (!tournament) {
            alert('Tournament not found');
            this.router.navigate(['/lobby']);
            return;
          }
          
          await this.checkIfFriend();
          
          if (tournament.status === 'completed') {
            await this.tournamentService.clearChatMessages(this.tournamentId);
          }
          
          if (tournament.status === 'in-progress' && tournament.gameMode !== 'casual') {
            if (this.isRoundComplete()) {
              this.startResultTimer();
            } else if (!this.hasCurrentPlayerMadeChoice()) {
              this.startMoveTimer();
            }
          } else if (tournament.gameMode === 'casual') {
            this.clearResultTimer();
            this.clearMoveTimer();
          }
        },
        error: (error) => {
          console.error('Error loading tournament:', error);
          this.router.navigate(['/lobby']);
        }
      });
      
      this.chatSubscription = this.tournamentService.getChatMessages(this.tournamentId).subscribe({
        next: (messages) => {
          this.chatMessages = messages;
          setTimeout(() => this.scrollChatToBottom(), 100);
        }
      });
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.chatSubscription?.unsubscribe();
    this.clearResultTimer();
    this.clearMoveTimer();
  }

  async sendMessage() {
    if (!this.chatMessage.trim()) return;
    
    try {
      await this.tournamentService.sendChatMessage(this.tournamentId, this.chatMessage);
      this.chatMessage = '';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  formatTime(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollChatToBottom() {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  async makeChoice(choice: Choice) {
    try {
      this.clearMoveTimer();
      await this.tournamentService.makeChoice(this.tournamentId, choice);
    } catch (error) {
      console.error('Error making choice:', error);
      alert('Failed to make choice');
    }
  }

  hasCurrentPlayerMadeChoice(): boolean {
    if (!this.tournament) return false;
    const currentRound = this.tournament.rounds[this.tournament.currentRound - 1];
    if (!currentRound) return false;
    
    const isPlayer1 = this.currentUserId === this.tournament.player1Id;
    return isPlayer1 ? !!currentRound.player1Choice : !!currentRound.player2Choice;
  }

  getCurrentPlayerChoice(): Choice {
    if (!this.tournament) return null;
    const currentRound = this.tournament.rounds[this.tournament.currentRound - 1];
    const isPlayer1 = this.currentUserId === this.tournament.player1Id;
    return isPlayer1 ? currentRound.player1Choice : currentRound.player2Choice;
  }

  isRoundComplete(): boolean {
    if (!this.tournament || this.tournament.currentRound === 1) return false;
    const previousRound = this.tournament.rounds[this.tournament.currentRound - 2];
    const previousRoundNumber = this.tournament.currentRound - 1;
    
    if (this.tournament.gameMode === 'tournament' && this.tournament.currentRound > 6) {
    return false;
  }
  
    return previousRound?.completed && !this.acknowledgedRounds.has(previousRoundNumber);
  }

  getPreviousRound() {
    if (!this.tournament || this.tournament.currentRound === 1) return null;
    return this.tournament.rounds[this.tournament.currentRound - 2];
  }

  didCurrentPlayerWinPreviousRound(): boolean {
    const prevRound = this.getPreviousRound();
    return prevRound?.winner === this.currentUserId;
  }

  getRoundResultText(): string {
    const prevRound = this.getPreviousRound();
    if (!prevRound) return '';
    if (!prevRound.winner) return "It's a Draw!";
    return prevRound.winner === this.currentUserId ? "You Win!" : "You Lose!";
  }

  isPlayer1Winner(): boolean {
    return this.tournament ? this.tournament.player1Score > this.tournament.player2Score : false;
  }

  isPlayer2Winner(): boolean {
    return this.tournament ? this.tournament.player2Score > this.tournament.player1Score : false;
  }

  getRoundResult(round: any): string {
    if (!round.winner) return 'Draw';
    if (round.winner === this.currentUserId) return 'Won';
    return 'Lost';
  }

  getIcon(choice: Choice | undefined): string {
    if (!choice) return '?';
    const icons: Record<string, string> = {
      rock: '✊',
      paper: '✋',
      scissors: '✌️'
    };
    return icons[choice] || '?';
  }

  getOpponentEmail(): string {
    if (!this.tournament) return '';
    return this.currentUserId === this.tournament.player1Id 
      ? (this.tournament.player2Nickname || this.tournament.player2Email || '')
      : (this.tournament.player1Nickname || this.tournament.player1Email);
  }

  async addOpponentAsFriend() {
    if (!this.tournament) return;

    const opponentId = this.currentUserId === this.tournament.player1Id 
      ? this.tournament.player2Id! 
      : this.tournament.player1Id;
    
    const opponentEmail = this.currentUserId === this.tournament.player1Id 
      ? this.tournament.player2Email! 
      : this.tournament.player1Email;
      
    const opponentNickname = this.currentUserId === this.tournament.player1Id 
      ? (this.tournament.player2Nickname || this.tournament.player2Email!) 
      : (this.tournament.player1Nickname || this.tournament.player1Email);

    try {
      await this.tournamentService.addFriend(this.currentUserId!, opponentId, opponentNickname);
      this.isOpponentFriend = true;
      alert(`${opponentNickname} has been added to your friends list!`);
    } catch (error: any) {
      if (error.message === 'Already friends') {
        alert('This player is already your friend!');
        this.isOpponentFriend = true;
      } else {
        console.error('Error adding friend:', error);
        alert('Failed to add friend');
      }
    }
  }

  exitGame() {
    if (this.tournament?.status === 'waiting' && this.tournament.player1Id === this.currentUserId) {
      if (confirm('Cancel this tournament?')) {
        this.tournamentService.deleteTournament(this.tournamentId);
        this.router.navigate(['/lobby']);
      }
    } else {
      this.router.navigate(['/lobby']);
    }
  }
}