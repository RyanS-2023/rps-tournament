import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Reel {
  symbols: string[];
  element: HTMLElement | null;
  position: number;
}

@Component({
  selector: 'app-slots',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slots-page">
      <header class="slots-header">
        <button (click)="goBack()" class="btn-back">← Back to Lobby</button>
        <h1>Minnesota Vikings Slots</h1>
      </header>
      
      <div class="slots-container">
        <div id="slotMachine">
          <div id="winOverlay" [class.show]="showWinOverlay">
            <div id="winMessage">
              <div class="win-title">{{ winTitle }}</div>
              <div class="win-amount">{{ winAmount }}</div>
            </div>
          </div>

          <div id="header">
            <div id="logo">MINNESOTA VIKINGS SLOTS</div>
          </div>

          <div id="reelsContainer">
            <div id="reels">
              <div class="reel" [class.winning]="winningReels.has(0)">
                <div class="win-frame"></div>
                <div class="reel-inner" id="reel0"></div>
              </div>
              <div class="reel" [class.winning]="winningReels.has(1)">
                <div class="win-frame"></div>
                <div class="reel-inner" id="reel1"></div>
              </div>
              <div class="reel" [class.winning]="winningReels.has(2)">
                <div class="win-frame"></div>
                <div class="reel-inner" id="reel2"></div>
              </div>
              <div class="reel" [class.winning]="winningReels.has(3)">
                <div class="win-frame"></div>
                <div class="reel-inner" id="reel3"></div>
              </div>
              <div class="reel" [class.winning]="winningReels.has(4)">
                <div class="win-frame"></div>
                <div class="reel-inner" id="reel4"></div>
              </div>
            </div>
          </div>

          <div id="controlPanel">
            <div id="infoDisplay">
              <div class="info-item">
                <div class="info-label">Balance</div>
                <div class="info-value">{{ balance }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Bet</div>
                <div class="info-value">{{ currentBet }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Win</div>
                <div class="info-value">{{ lastWin }}</div>
              </div>
            </div>

            <div id="controls">
              <div class="control-group">
                <button (click)="decreaseBet()" [disabled]="isSpinning">-</button>
                <span style="color: #999;">BET</span>
                <button (click)="increaseBet()" [disabled]="isSpinning">+</button>
              </div>

              <button id="spinButton" (click)="spin()" [disabled]="isSpinning || balance < currentBet">
                {{ isSpinning ? 'SPINNING...' : 'SPIN' }}
              </button>

              <div class="control-group">
                <button (click)="maxBet()" [disabled]="isSpinning">MAX BET</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .slots-page {
      min-height: 100vh;
      background: #0a0a0a;
      padding: 20px;
    }

    .slots-header {
      max-width: 900px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .btn-back {
      background: linear-gradient(180deg, #4F2683 0%, #3a1c61 100%);
      color: #FFC62F;
      border: 2px solid #FFC62F;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: linear-gradient(180deg, #5a2d94 0%, #4F2683 100%);
      box-shadow: 0 0 15px rgba(255, 198, 47, 0.5);
      transform: translateY(-2px);
    }

    .slots-header h1 {
      color: #FFC62F;
      font-size: 24px;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    }

    .slots-container {
      max-width: 900px;
      margin: 0 auto;
    }

    #slotMachine {
      width: 900px;
      max-width: 100%;
      background: linear-gradient(180deg, #1a0033 0%, #0d001a 100%);
      border: 3px solid #4F2683;
      border-radius: 15px;
      box-shadow: 0 0 40px rgba(79, 38, 131, 0.5);
      overflow: hidden;
      margin: 0 auto;
      position: relative;
    }

    #header {
      background: linear-gradient(90deg, #4F2683 0%, #79228B 50%, #4F2683 100%);
      padding: 20px;
      text-align: center;
      border-bottom: 3px solid #FFC62F;
    }

    #logo {
      color: #FFC62F;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 3px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    }

    #reelsContainer {
      background: #000;
      padding: 40px 20px;
      position: relative;
    }

    #reels {
      display: flex;
      justify-content: center;
      gap: 12px;
      max-width: 750px;
      margin: 0 auto;
    }

    .reel {
      width: 140px;
      height: 420px;
      background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
      border: 2px solid #333;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
    }

    .reel-inner {
      position: absolute;
      width: 100%;
      transition: transform 0.05s linear;
    }

    :host ::ng-deep .symbol {
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 80px;
      background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
      border-bottom: 1px solid #333;
    }

    .win-frame {
      position: absolute;
      top: 140px;
      left: 0;
      right: 0;
      height: 140px;
      border: 3px solid #FFC62F;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 10;
    }

    .reel.winning .win-frame {
      opacity: 1;
      animation: pulse 0.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    #controlPanel {
      background: linear-gradient(180deg, #1a0033 0%, #0d001a 100%);
      padding: 30px;
      border-top: 2px solid #4F2683;
    }

    #infoDisplay {
      display: flex;
      justify-content: space-around;
      margin-bottom: 25px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 8px;
    }

    .info-item {
      text-align: center;
    }

    .info-label {
      color: #999;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }

    .info-value {
      color: #FFC62F;
      font-size: 28px;
      font-weight: bold;
    }

    #controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 30px;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    button {
      background: linear-gradient(180deg, #4F2683 0%, #3a1c61 100%);
      color: #FFC62F;
      border: 2px solid #FFC62F;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 50px;
    }

    button:hover:not(:disabled) {
      background: linear-gradient(180deg, #5a2d94 0%, #4F2683 100%);
      box-shadow: 0 0 15px rgba(255, 198, 47, 0.5);
      transform: translateY(-2px);
    }

    button:active:not(:disabled) {
      transform: translateY(0);
    }

    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    #spinButton {
      background: linear-gradient(180deg, #FFC62F 0%, #e6a800 100%);
      color: #000;
      font-size: 24px;
      padding: 18px 50px;
      border: 3px solid #fff;
      box-shadow: 0 5px 20px rgba(255, 198, 47, 0.4);
    }

    #spinButton:hover:not(:disabled) {
      background: linear-gradient(180deg, #ffd454 0%, #FFC62F 100%);
      box-shadow: 0 5px 30px rgba(255, 198, 47, 0.7);
    }

    #winOverlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    #winOverlay.show {
      display: flex;
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    #winMessage {
      text-align: center;
      color: #FFC62F;
      animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    .win-title {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 0 0 20px rgba(255, 198, 47, 0.8);
    }

    .win-amount {
      font-size: 72px;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 0 30px rgba(255, 198, 47, 1);
    }

    @media (max-width: 768px) {
      #slotMachine {
        width: 100%;
      }

      .reel {
        width: 18%;
      }

      #controls {
        flex-direction: column;
        gap: 15px;
      }

      .info-value {
        font-size: 20px;
      }

      #logo {
        font-size: 24px;
      }
    }
  `]
})
export class SlotsComponent implements OnInit, AfterViewInit {
  // Game configuration
  private readonly SYMBOLS = ['⚔️', '🛡️', '👑', '⚡', '🏈', '🏆', 'V'];
  private readonly REEL_LENGTH = 30;
  private readonly SYMBOL_HEIGHT = 140;
  private readonly VISIBLE_SYMBOLS = 3;
  private readonly BET_LEVELS = [1, 5, 10, 25, 50, 100, 250, 500];
  
  private readonly PAYTABLE: {[key: string]: {[key: number]: number}} = {
    '🏆': { 3: 100, 4: 500, 5: 2000 },
    '🏈': { 3: 50, 4: 150, 5: 500 },
    '⚔️': { 3: 30, 4: 100, 5: 300 },
    '🛡️': { 3: 25, 4: 80, 5: 250 },
    '👑': { 3: 20, 4: 60, 5: 200 },
    '⚡': { 3: 15, 4: 40, 5: 150 },
    'V': { 3: 10, 4: 30, 5: 100 }
  };

  // Game state
  balance = 1000;
  currentBet = 10;
  lastWin = 0;
  isSpinning = false;
  betIndex = 2;
  
  // UI state
  showWinOverlay = false;
  winTitle = '';
  winAmount = '';
  winningReels = new Set<number>();

  private reels: Reel[] = [];

  constructor(private router: Router) {}

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => this.initReels(), 0);
  }

  private initReels() {
    for (let i = 0; i < 5; i++) {
      const reel: Reel = {
        symbols: [],
        element: document.getElementById(`reel${i}`),
        position: 0
      };

      if (reel.element) {
        for (let j = 0; j < this.REEL_LENGTH; j++) {
          const symbol = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
          reel.symbols.push(symbol);
          
          const symbolEl = document.createElement('div');
          symbolEl.className = 'symbol';
          symbolEl.textContent = symbol;
          reel.element.appendChild(symbolEl);
        }
      }

      this.reels.push(reel);
    }
  }

  spin() {
    if (this.isSpinning || this.balance < this.currentBet) return;

    this.isSpinning = true;
    this.balance -= this.currentBet;
    this.lastWin = 0;
    this.winningReels.clear();

    const spinPromises = this.reels.map((reel, index) => {
      return new Promise<void>(resolve => {
        const spinDuration = 2000 + (index * 200);
        const startTime = Date.now();
        const startPos = reel.position;
        const spins = 5 + index;
        const targetPos = (startPos + (this.REEL_LENGTH * spins) + 
                          Math.floor(Math.random() * this.REEL_LENGTH)) % this.REEL_LENGTH;

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / spinDuration, 1);
          
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const totalDistance = (this.REEL_LENGTH * spins) + (targetPos - startPos);
          const currentDistance = totalDistance * easeOut;
          const currentPos = (startPos + currentDistance) % this.REEL_LENGTH;
          
          reel.position = currentPos;
          if (reel.element) {
            reel.element.style.transform = `translateY(-${currentPos * this.SYMBOL_HEIGHT}px)`;
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            reel.position = targetPos;
            if (reel.element) {
              reel.element.style.transform = `translateY(-${targetPos * this.SYMBOL_HEIGHT}px)`;
            }
            resolve();
          }
        };

        setTimeout(() => animate(), index * 100);
      });
    });

    Promise.all(spinPromises).then(() => {
      this.checkWin();
      this.isSpinning = false;
    });
  }

  private getVisibleSymbols(): string[][] {
    const grid: string[][] = [];
    this.reels.forEach(reel => {
      const column: string[] = [];
      const basePos = Math.floor(reel.position);
      for (let i = 0; i < this.VISIBLE_SYMBOLS; i++) {
        const index = (basePos + i) % this.REEL_LENGTH;
        column.push(reel.symbols[index]);
      }
      grid.push(column);
    });
    return grid;
  }

  private checkWin() {
    const grid = this.getVisibleSymbols();
    let totalWin = 0;
    const winningReelsSet = new Set<number>();

    for (let row = 0; row < this.VISIBLE_SYMBOLS; row++) {
      const line = grid.map(col => col[row]);
      const win = this.checkLine(line);
      if (win.amount > 0) {
        totalWin += win.amount;
        win.reels.forEach(r => winningReelsSet.add(r));
      }
    }

    if (totalWin > 0) {
      const winAmountValue = totalWin * this.currentBet;
      this.balance += winAmountValue;
      this.lastWin = winAmountValue;
      this.winningReels = winningReelsSet;
      this.showWinAnimation(winAmountValue);
    }
  }

  private checkLine(symbols: string[]): { amount: number; reels: number[] } {
    let bestWin = { amount: 0, reels: [] as number[] };

    for (const symbol of this.SYMBOLS) {
      let count = 0;
      for (let i = 0; i < symbols.length; i++) {
        if (symbols[i] === symbol) {
          count++;
        } else {
          break;
        }
      }

      if (count >= 3 && this.PAYTABLE[symbol] && this.PAYTABLE[symbol][count]) {
        const amount = this.PAYTABLE[symbol][count];
        if (amount > bestWin.amount) {
          bestWin = {
            amount: amount,
            reels: Array.from({ length: count }, (_, i) => i)
          };
        }
      }
    }

    return bestWin;
  }

  private showWinAnimation(amount: number) {
    if (amount >= this.currentBet * 100) {
      this.winTitle = '🏆 MEGA WIN! 🏆';
    } else if (amount >= this.currentBet * 50) {
      this.winTitle = '⚡ BIG WIN! ⚡';
    } else {
      this.winTitle = 'WIN!';
    }

    this.winAmount = `$${amount}`;
    this.showWinOverlay = true;

    setTimeout(() => {
      this.showWinOverlay = false;
      this.winningReels.clear();
    }, 3000);
  }

  increaseBet() {
    if (this.betIndex < this.BET_LEVELS.length - 1) {
      this.betIndex++;
      this.currentBet = this.BET_LEVELS[this.betIndex];
    }
  }

  decreaseBet() {
    if (this.betIndex > 0) {
      this.betIndex--;
      this.currentBet = this.BET_LEVELS[this.betIndex];
    }
  }

  maxBet() {
    this.betIndex = this.BET_LEVELS.length - 1;
    this.currentBet = this.BET_LEVELS[this.betIndex];
  }

  goBack() {
    this.router.navigate(['/lobby']);
  }
}
