import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Reel {
  symbols: string[];
  element: HTMLElement | null;
  position: number;
}

interface WinResult {
  lineIndex: number;
  symbol: string;
  count: number;
  amount: number;
  positions: number[];
}

@Component({
  selector: 'app-slots',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slots-page">
      <header class="slots-header">
        <button (click)="goBack()" class="btn-back">Back to Lobby</button>
        <h1>Vikings Slots</h1>
        <button (click)="togglePaytable()" class="btn-paytable">
          Paytable
        </button>
      </header>

      <div class="paytable-modal" *ngIf="showPaytable" (click)="showPaytable = false">
        <div class="paytable-content" (click)="$event.stopPropagation()">
          <h2>PAYTABLE</h2>
          <div class="paytable-section">
            <h3>Symbol Payouts</h3>
            <div class="payout-grid">
              <div class="payout-row">
                <span class="symbol">🏆</span>
                <span>3: 100x | 4: 500x | 5: 2000x</span>
              </div>
              <div class="payout-row">
                <span class="symbol">🏈</span>
                <span>3: 50x | 4: 150x | 5: 500x</span>
              </div>
              <div class="payout-row">
                <span class="symbol">⚔️</span>
                <span>3: 30x | 4: 100x | 5: 300x</span>
              </div>
              <div class="payout-row">
                <span class="symbol">🛡️</span>
                <span>3: 25x | 4: 80x | 5: 250x</span>
              </div>
              <div class="payout-row">
                <span class="symbol">👑</span>
                <span>3: 20x | 4: 60x | 5: 200x</span>
              </div>
              <div class="payout-row">
                <span class="symbol">⚡</span>
                <span>3: 15x | 4: 40x | 5: 150x</span>
              </div>
              <div class="payout-row">
                <span class="symbol">V</span>
                <span>3: 10x | 4: 30x | 5: 100x</span>
              </div>
            </div>
          </div>
          <div class="paytable-section">
            <h3>9 Win Lines</h3>
            <p>Lines 1-3: Horizontal rows</p>
            <p>Lines 4-5: V shapes</p>
            <p>Lines 6-7: Diagonals</p>
            <p>Lines 8-9: W and M shapes</p>
          </div>
          <button (click)="showPaytable = false" class="btn-close">Close</button>
        </div>
      </div>
      
      <div class="slots-container">
        <div id="slotMachine">
          <div id="winOverlay" *ngIf="showWinOverlay">
            <div id="winMessage">
              <div class="win-title">{{ winTitle }}</div>
              <div class="win-amount">{{ winAmount }}</div>
              <div class="win-details" *ngIf="currentWins.length > 0">
                <div *ngFor="let win of currentWins" class="win-line">
                  Line {{ win.lineIndex + 1 }}: {{ win.count }}x {{ win.symbol }}
                </div>
              </div>
            </div>
          </div>

          <div id="header">
            <div id="logo">MINNESOTA VIKINGS SLOTS</div>
          </div>

          <div id="reelsContainer">
            <svg class="paylines-svg" viewBox="0 0 700 300" preserveAspectRatio="none">
              <line x1="0" y1="50" x2="700" y2="50" 
                    [attr.stroke]="winningLines.has(0) ? '#FFC62F' : '#FFC62F'" 
                    [attr.opacity]="winningLines.has(0) ? '1' : '0.2'"
                    stroke-width="3" stroke-dasharray="5,5"/>
              
              <line x1="0" y1="150" x2="700" y2="150" 
                    [attr.stroke]="winningLines.has(1) ? '#FFC62F' : '#FFC62F'" 
                    [attr.opacity]="winningLines.has(1) ? '1' : '0.2'"
                    stroke-width="3" stroke-dasharray="5,5"/>
              
              <line x1="0" y1="250" x2="700" y2="250" 
                    [attr.stroke]="winningLines.has(2) ? '#FFC62F' : '#FFC62F'" 
                    [attr.opacity]="winningLines.has(2) ? '1' : '0.2'"
                    stroke-width="3" stroke-dasharray="5,5"/>
              
              <polyline points="0,50 140,150 280,250 420,150 560,50 700,150" 
                        [attr.stroke]="winningLines.has(3) ? '#9C27B0' : '#9C27B0'" 
                        [attr.opacity]="winningLines.has(3) ? '1' : '0.2'"
                        stroke-width="3" fill="none" stroke-dasharray="5,5"/>
              
              <polyline points="0,250 140,150 280,50 420,150 560,250 700,150" 
                        [attr.stroke]="winningLines.has(4) ? '#00BCD4' : '#00BCD4'" 
                        [attr.opacity]="winningLines.has(4) ? '1' : '0.2'"
                        stroke-width="3" fill="none" stroke-dasharray="5,5"/>
              
              <line x1="0" y1="50" x2="700" y2="250" 
                    [attr.stroke]="winningLines.has(5) ? '#4CAF50' : '#4CAF50'" 
                    [attr.opacity]="winningLines.has(5) ? '1' : '0.2'"
                    stroke-width="3" stroke-dasharray="5,5"/>
              
              <line x1="0" y1="250" x2="700" y2="50" 
                    [attr.stroke]="winningLines.has(6) ? '#FF5722' : '#FF5722'" 
                    [attr.opacity]="winningLines.has(6) ? '1' : '0.2'"
                    stroke-width="3" stroke-dasharray="5,5"/>
              
              <polyline points="0,50 140,250 280,50 420,250 560,50 700,250" 
                        [attr.stroke]="winningLines.has(7) ? '#E91E63' : '#E91E63'" 
                        [attr.opacity]="winningLines.has(7) ? '1' : '0.2'"
                        stroke-width="3" fill="none" stroke-dasharray="5,5"/>
              
              <polyline points="0,250 140,50 280,250 420,50 560,250 700,50" 
                        [attr.stroke]="winningLines.has(8) ? '#FFC107' : '#FFC107'" 
                        [attr.opacity]="winningLines.has(8) ? '1' : '0.2'"
                        stroke-width="3" fill="none" stroke-dasharray="5,5"/>
            </svg>

            <div id="reels">
              <div class="reel" *ngFor="let r of [0,1,2,3,4]; let i = index">
                <div class="reel-inner" [id]="'reel' + i"></div>
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
                <div class="info-label">Lines</div>
                <div class="info-value">9</div>
              </div>
              <div class="info-item">
                <div class="info-label">Bet/Line</div>
                <div class="info-value">{{ currentBet }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Total Bet</div>
                <div class="info-value">{{ currentBet * 9 }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Win</div>
                <div class="info-value">{{ lastWin }}</div>
              </div>
            </div>

            <div id="controls">
              <div class="control-group">
                <button (click)="decreaseBet()" [disabled]="isSpinning">-</button>
                <span class="bet-label">BET</span>
                <button (click)="increaseBet()" [disabled]="isSpinning">+</button>
              </div>

              <button id="spinButton" (click)="spin()" [disabled]="isSpinning || balance < (currentBet * 9)">
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
      padding: 15px;
    }

    .slots-header {
      max-width: 700px;
      margin: 0 auto 15px;
      display: flex;
      align-items: center;
      gap: 15px;
      justify-content: space-between;
    }

    .btn-back, .btn-paytable {
      background: linear-gradient(180deg, #4F2683 0%, #3a1c61 100%);
      color: #FFC62F;
      border: 2px solid #FFC62F;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-back:hover, .btn-paytable:hover {
      background: linear-gradient(180deg, #5a2d94 0%, #4F2683 100%);
      box-shadow: 0 0 15px rgba(255, 198, 47, 0.5);
      transform: translateY(-2px);
    }

    .slots-header h1 {
      color: #FFC62F;
      font-size: 20px;
      margin: 0;
      flex: 1;
      text-align: center;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    }

    .paytable-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .paytable-content {
      background: linear-gradient(180deg, #1a0033 0%, #0d001a 100%);
      border: 3px solid #FFC62F;
      border-radius: 15px;
      padding: 30px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      color: white;
    }

    .paytable-content h2 {
      color: #FFC62F;
      text-align: center;
      margin-bottom: 20px;
      font-size: 28px;
    }

    .paytable-content h3 {
      color: #FFC62F;
      margin: 20px 0 10px;
      font-size: 20px;
    }

    .paytable-section {
      margin-bottom: 20px;
    }

    .payout-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .payout-row {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px;
      background: rgba(79, 38, 131, 0.3);
      border-radius: 8px;
    }

    .payout-row .symbol {
      font-size: 32px;
      width: 50px;
      text-align: center;
    }

    .btn-close {
      width: 100%;
      margin-top: 20px;
      background: linear-gradient(180deg, #FFC62F 0%, #e6a800 100%);
      color: #000;
      border: none;
      padding: 12px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
    }

    .slots-container {
      max-width: 700px;
      margin: 0 auto;
    }

    #slotMachine {
      background: linear-gradient(180deg, #1a0033 0%, #0d001a 100%);
      border: 3px solid #4F2683;
      border-radius: 15px;
      box-shadow: 0 0 40px rgba(79, 38, 131, 0.5);
      overflow: hidden;
      position: relative;
    }

    #header {
      background: linear-gradient(90deg, #4F2683 0%, #79228B 50%, #4F2683 100%);
      padding: 12px;
      text-align: center;
      border-bottom: 3px solid #FFC62F;
    }

    #logo {
      color: #FFC62F;
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 2px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    }

    #reelsContainer {
      background: #000;
      padding: 20px 10px;
      position: relative;
      height: 340px;
    }

    .paylines-svg {
      position: absolute;
      top: 20px;
      left: 10px;
      right: 10px;
      bottom: 20px;
      pointer-events: none;
      z-index: 5;
    }

    #reels {
      display: flex;
      justify-content: center;
      gap: 8px;
      position: relative;
      z-index: 10;
    }

    .reel {
      width: 100px;
      height: 300px;
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
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60px;
      background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
      border-bottom: 1px solid #333;
    }

    #controlPanel {
      background: linear-gradient(180deg, #1a0033 0%, #0d001a 100%);
      padding: 15px;
      border-top: 2px solid #4F2683;
    }

    #infoDisplay {
      display: flex;
      justify-content: space-around;
      margin-bottom: 15px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 8px;
      gap: 5px;
    }

    .info-item {
      text-align: center;
      flex: 1;
    }

    .info-label {
      color: #999;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 3px;
    }

    .info-value {
      color: #FFC62F;
      font-size: 16px;
      font-weight: bold;
    }

    #controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bet-label {
      color: #999;
      font-size: 12px;
      font-weight: bold;
    }

    button {
      background: linear-gradient(180deg, #4F2683 0%, #3a1c61 100%);
      color: #FFC62F;
      border: 2px solid #FFC62F;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 40px;
    }

    button:hover:not(:disabled) {
      background: linear-gradient(180deg, #5a2d94 0%, #4F2683 100%);
      box-shadow: 0 0 15px rgba(255, 198, 47, 0.5);
      transform: translateY(-2px);
    }

    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    #spinButton {
      background: linear-gradient(180deg, #FFC62F 0%, #e6a800 100%);
      color: #000;
      font-size: 18px;
      padding: 12px 35px;
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
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    #winMessage {
      text-align: center;
      animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    .win-title {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #FFC62F;
      text-shadow: 0 0 30px rgba(255, 198, 47, 1);
      animation: titlePulse 1s infinite;
    }

    @keyframes titlePulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .win-amount {
      font-size: 64px;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 0 40px #FFC62F;
      margin-bottom: 20px;
    }

    .win-details {
      background: rgba(79, 38, 131, 0.5);
      padding: 20px;
      border-radius: 10px;
      margin-top: 20px;
    }

    .win-line {
      color: #FFC62F;
      font-size: 18px;
      margin: 8px 0;
      font-weight: bold;
    }
  `]
})
export class SlotsComponent implements OnInit, AfterViewInit {
  private readonly SYMBOLS = ['⚔️', '🛡️', '👑', '⚡', '🏈', '🏆', 'V'];
  private readonly REEL_LENGTH = 30;
  private readonly SYMBOL_HEIGHT = 100;
  private readonly VISIBLE_SYMBOLS = 3;
  private readonly BET_LEVELS = [1, 2, 5, 10, 25, 50, 100];
  
  private readonly PAYTABLE: {[key: string]: {[key: number]: number}} = {
    '🏆': { 3: 100, 4: 500, 5: 2000 },
    '🏈': { 3: 50, 4: 150, 5: 500 },
    '⚔️': { 3: 30, 4: 100, 5: 300 },
    '🛡️': { 3: 25, 4: 80, 5: 250 },
    '👑': { 3: 20, 4: 60, 5: 200 },
    '⚡': { 3: 15, 4: 40, 5: 150 },
    'V': { 3: 10, 4: 30, 5: 100 }
  };

  private readonly PAYLINES = [
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2],
    [2, 2, 1, 0, 0],
    [0, 2, 0, 2, 0],
    [2, 0, 2, 0, 2]
  ];

  balance = 1000;
  currentBet = 1;
  lastWin = 0;
  isSpinning = false;
  betIndex = 0;
  
  showWinOverlay = false;
  showPaytable = false;
  winTitle = '';
  winAmount = '';
  winningReels = new Set<number>();
  winningLines = new Set<number>();
  currentWins: WinResult[] = [];

  private reels: Reel[] = [];

  constructor(private router: Router) {}

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => this.initReels(), 0);
  }

  togglePaytable() {
    this.showPaytable = !this.showPaytable;
  }

  private initReels() {
    for (let i = 0; i < 5; i++) {
      const reel: Reel = {
        symbols: [],
        element: document.getElementById('reel' + i),
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
    const totalBet = this.currentBet * 9;
    if (this.isSpinning || this.balance < totalBet) return;

    this.isSpinning = true;
    this.balance -= totalBet;
    this.lastWin = 0;
    this.winningReels.clear();
    this.winningLines.clear();
    this.currentWins = [];

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
            reel.element.style.transform = 'translateY(-' + (currentPos * this.SYMBOL_HEIGHT) + 'px)';
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            reel.position = targetPos;
            if (reel.element) {
              reel.element.style.transform = 'translateY(-' + (targetPos * this.SYMBOL_HEIGHT) + 'px)';
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
    let totalWinMultiplier = 0;
    const winningReelsSet = new Set<number>();
    const winningLinesSet = new Set<number>();
    const wins: WinResult[] = [];

    this.PAYLINES.forEach((payline, lineIndex) => {
      const line = payline.map((row, col) => grid[col][row]);
      const win = this.checkLine(line);
      
      if (win.amount > 0) {
        totalWinMultiplier += win.amount;
        win.reels.forEach(r => winningReelsSet.add(r));
        winningLinesSet.add(lineIndex);
        wins.push({
          lineIndex,
          symbol: win.symbol,
          count: win.count,
          amount: win.amount,
          positions: win.reels
        });
      }
    });

    if (totalWinMultiplier > 0) {
      const totalWinAmount = totalWinMultiplier * this.currentBet;
      this.balance += totalWinAmount;
      this.lastWin = totalWinAmount;
      this.winningReels = winningReelsSet;
      this.winningLines = winningLinesSet;
      this.currentWins = wins;
      this.showWinAnimation(totalWinAmount, totalWinMultiplier);
    }
  }

  private checkLine(symbols: string[]): { amount: number; reels: number[]; symbol: string; count: number } {
    let bestWin = { amount: 0, reels: [] as number[], symbol: '', count: 0 };

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
            reels: Array.from({ length: count }, (_, i) => i),
            symbol: symbol,
            count: count
          };
        }
      }
    }

    return bestWin;
  }

  private showWinAnimation(amount: number, multiplier: number) {
    if (multiplier >= 1000) {
      this.winTitle = 'MEGA JACKPOT!';
    } else if (multiplier >= 500) {
      this.winTitle = 'JACKPOT!';
    } else if (multiplier >= 100) {
      this.winTitle = 'BIG WIN!';
    } else if (multiplier >= 50) {
      this.winTitle = 'GREAT WIN!';
    } else {
      this.winTitle = 'WIN!';
    }

    this.winAmount = '$' + amount;
    this.showWinOverlay = true;

    setTimeout(() => {
      this.showWinOverlay = false;
      this.winningReels.clear();
      this.winningLines.clear();
    }, 4000);
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