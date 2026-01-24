import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CreditsService } from '../../services/credits.service';
import { Auth } from '@angular/fire/auth';

interface Reel {
  symbols: string[];
  element: HTMLElement | null;
  position: number;
}

interface WinResult {
  lineIndex: number;
  symbol: string;
  count: number;
  payout: number;
  positions: number[];
}

@Component({
  selector: 'app-slots',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slots-page">
      <header class="slots-header">
        <button (click)="goBack()" class="btn-back">← Lobby</button>
        <h1>VIKINGS SLOTS</h1>
        <button (click)="togglePaytable()" class="btn-paytable">Paytable</button>
      </header>

      <!-- Daily Credits Banner -->
      <div class="daily-banner" *ngIf="showDailyBanner">
        <div class="banner-content">
          <h3>🎁 Daily Bonus Claimed!</h3>
          <p>+1000 Credits Added</p>
          <p class="next-bonus">Next bonus in: {{ timeUntilNextCredit }}</p>
        </div>
      </div>

      <div class="paytable-modal" *ngIf="showPaytable" (click)="showPaytable = false">
        <div class="paytable-content" (click)="$event.stopPropagation()">
          <h2>💰 PAYTABLE 💰</h2>
          
          <div class="paytable-section">
            <h3>Symbol Payouts</h3>
            <p class="bet-note">Payouts shown for <strong>{{ currentBet }} credit</strong> bet per line</p>
            <div class="payout-grid">
              <div class="payout-row jackpot">
                <span class="symbol">🏆</span>
                <div class="payout-values">
                  <span>5 = <strong>{{ calculatePayout('🏆', 5) }}</strong></span>
                  <span>4 = <strong>{{ calculatePayout('🏆', 4) }}</strong></span>
                  <span>3 = <strong>{{ calculatePayout('🏆', 3) }}</strong></span>
                  <span>2 = <strong>{{ calculatePayout('🏆', 2) }}</strong></span>
                </div>
              </div>
              <div class="payout-row high">
                <span class="symbol">🏈</span>
                <div class="payout-values">
                  <span>5 = <strong>{{ calculatePayout('🏈', 5) }}</strong></span>
                  <span>4 = <strong>{{ calculatePayout('🏈', 4) }}</strong></span>
                  <span>3 = <strong>{{ calculatePayout('🏈', 3) }}</strong></span>
                  <span>2 = <strong>{{ calculatePayout('🏈', 2) }}</strong></span>
                </div>
              </div>
              <div class="payout-row high">
                <span class="symbol">⚔️</span>
                <div class="payout-values">
                  <span>5 = <strong>{{ calculatePayout('⚔️', 5) }}</strong></span>
                  <span>4 = <strong>{{ calculatePayout('⚔️', 4) }}</strong></span>
                  <span>3 = <strong>{{ calculatePayout('⚔️', 3) }}</strong></span>
                  <span>2 = <strong>{{ calculatePayout('⚔️', 2) }}</strong></span>
                </div>
              </div>
              <div class="payout-row medium">
                <span class="symbol">🛡️</span>
                <div class="payout-values">
                  <span>5 = <strong>{{ calculatePayout('🛡️', 5) }}</strong></span>
                  <span>4 = <strong>{{ calculatePayout('🛡️', 4) }}</strong></span>
                  <span>3 = <strong>{{ calculatePayout('🛡️', 3) }}</strong></span>
                  <span>2 = <strong>{{ calculatePayout('🛡️', 2) }}</strong></span>
                </div>
              </div>
              <div class="payout-row medium">
                <span class="symbol">👑</span>
                <div class="payout-values">
                  <span>5 = <strong>{{ calculatePayout('👑', 5) }}</strong></span>
                  <span>4 = <strong>{{ calculatePayout('👑', 4) }}</strong></span>
                  <span>3 = <strong>{{ calculatePayout('👑', 3) }}</strong></span>
                  <span>2 = <strong>{{ calculatePayout('👑', 2) }}</strong></span>
                </div>
              </div>
              <div class="payout-row low">
                <span class="symbol">⚡</span>
                <div class="payout-values">
                  <span>5 = <strong>{{ calculatePayout('⚡', 5) }}</strong></span>
                  <span>4 = <strong>{{ calculatePayout('⚡', 4) }}</strong></span>
                  <span>3 = <strong>{{ calculatePayout('⚡', 3) }}</strong></span>
                </div>
              </div>
              <div class="payout-row low">
                <span class="symbol">💜</span>
                <div class="payout-values">
                  <span>5 = <strong>{{ calculatePayout('💜', 5) }}</strong></span>
                  <span>4 = <strong>{{ calculatePayout('💜', 4) }}</strong></span>
                  <span>3 = <strong>{{ calculatePayout('💜', 3) }}</strong></span>
                </div>
              </div>
              <div class="payout-row low">
                <span class="symbol">V</span>
                <div class="payout-values">
                  <span>5 = <strong>{{ calculatePayout('V', 5) }}</strong></span>
                  <span>4 = <strong>{{ calculatePayout('V', 4) }}</strong></span>
                  <span>3 = <strong>{{ calculatePayout('V', 3) }}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div class="paytable-section">
            <h3>📊 25 Paylines</h3>
            <p class="lines-desc">Wins pay from left to right on active paylines</p>
            <p class="lines-desc">All 25 lines active every spin</p>
            <p class="lines-desc">Multiple winning lines award multiple payouts</p>
            <p class="lines-desc highlight">Higher value symbols pay on 2+ matches</p>
            <p class="lines-desc highlight">Lower value symbols pay on 3+ matches</p>
          </div>

          <div class="paytable-section">
            <h3>💎 Daily Credits</h3>
            <ul class="rules-list">
              <li>Receive 1,000 free credits every day</li>
              <li>Credits automatically added on first login each day</li>
              <li>Maximum balance: 50,000 credits</li>
              <li>Next daily bonus: {{ timeUntilNextCredit }}</li>
            </ul>
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
                <div class="win-summary">{{ currentWins.length }} Winning Line{{ currentWins.length > 1 ? 's' : '' }}</div>
                <div *ngFor="let win of currentWins" class="win-line">
                  Line {{ win.lineIndex + 1 }}: {{ win.count }} × {{ win.symbol }} = {{ win.payout }} credits
                </div>
              </div>
            </div>
          </div>

          <div id="header">
            <div id="logo">⚔️ VIKINGS SLOTS ⚔️</div>
          </div>

          <div id="reelsContainer">
            <svg class="paylines-svg" viewBox="0 0 540 315" preserveAspectRatio="none">
              <line x1="0" y1="52.5" x2="540" y2="52.5" [attr.opacity]="winningLines.has(0) ? '1' : '0.15'" stroke="#FFD700" stroke-width="2"/>
              <line x1="0" y1="105" x2="540" y2="105" [attr.opacity]="winningLines.has(1) ? '1' : '0.15'" stroke="#FF6B6B" stroke-width="2"/>
              <line x1="0" y1="157.5" x2="540" y2="157.5" [attr.opacity]="winningLines.has(2) ? '1' : '0.15'" stroke="#4ECDC4" stroke-width="2"/>
              <line x1="0" y1="210" x2="540" y2="210" [attr.opacity]="winningLines.has(3) ? '1' : '0.15'" stroke="#95E1D3" stroke-width="2"/>
              <line x1="0" y1="262.5" x2="540" y2="262.5" [attr.opacity]="winningLines.has(4) ? '1' : '0.15'" stroke="#F38181" stroke-width="2"/>
              <polyline points="0,52.5 135,157.5 270,262.5 405,157.5 540,52.5" [attr.opacity]="winningLines.has(5) ? '1' : '0.15'" stroke="#AA96DA" stroke-width="2" fill="none"/>
              <polyline points="0,262.5 135,157.5 270,52.5 405,157.5 540,262.5" [attr.opacity]="winningLines.has(6) ? '1' : '0.15'" stroke="#FCBAD3" stroke-width="2" fill="none"/>
              <polyline points="0,105 135,157.5 270,210 405,157.5 540,105" [attr.opacity]="winningLines.has(7) ? '1' : '0.15'" stroke="#FFFFD2" stroke-width="2" fill="none"/>
              <polyline points="0,210 135,157.5 270,105 405,157.5 540,210" [attr.opacity]="winningLines.has(8) ? '1' : '0.15'" stroke="#A8D8EA" stroke-width="2" fill="none"/>
              <polyline points="0,52.5 108,157.5 216,52.5 324,157.5 432,52.5 540,157.5" [attr.opacity]="winningLines.has(9) ? '1' : '0.15'" stroke="#FF6B9D" stroke-width="2" fill="none"/>
              <polyline points="0,262.5 108,157.5 216,262.5 324,157.5 432,262.5 540,157.5" [attr.opacity]="winningLines.has(10) ? '1' : '0.15'" stroke="#C44569" stroke-width="2" fill="none"/>
              <polyline points="0,157.5 108,52.5 216,157.5 324,262.5 432,157.5 540,52.5" [attr.opacity]="winningLines.has(11) ? '1' : '0.15'" stroke="#F8B500" stroke-width="2" fill="none"/>
              <polyline points="0,157.5 108,262.5 216,157.5 324,52.5 432,157.5 540,262.5" [attr.opacity]="winningLines.has(12) ? '1' : '0.15'" stroke="#6BCB77" stroke-width="2" fill="none"/>
              <polyline points="0,52.5 135,105 270,157.5 405,210 540,262.5" [attr.opacity]="winningLines.has(13) ? '1' : '0.15'" stroke="#4D96FF" stroke-width="2" fill="none"/>
              <polyline points="0,262.5 135,210 270,157.5 405,105 540,52.5" [attr.opacity]="winningLines.has(14) ? '1' : '0.15'" stroke="#FFB6B9" stroke-width="2" fill="none"/>
              <polyline points="0,105 135,52.5 270,105 405,157.5 540,210" [attr.opacity]="winningLines.has(15) ? '1' : '0.15'" stroke="#BAE8E8" stroke-width="2" fill="none"/>
              <polyline points="0,210 135,262.5 270,210 405,157.5 540,105" [attr.opacity]="winningLines.has(16) ? '1' : '0.15'" stroke="#FFEAA7" stroke-width="2" fill="none"/>
              <polyline points="0,157.5 135,105 270,52.5 405,105 540,157.5" [attr.opacity]="winningLines.has(17) ? '1' : '0.15'" stroke="#DDA15E" stroke-width="2" fill="none"/>
              <polyline points="0,157.5 135,210 270,262.5 405,210 540,157.5" [attr.opacity]="winningLines.has(18) ? '1' : '0.15'" stroke="#BC6C25" stroke-width="2" fill="none"/>
              <polyline points="0,52.5 135,210 270,52.5 405,210 540,52.5" [attr.opacity]="winningLines.has(19) ? '1' : '0.15'" stroke="#E07A5F" stroke-width="2" fill="none"/>
              <polyline points="0,262.5 135,105 270,262.5 405,105 540,262.5" [attr.opacity]="winningLines.has(20) ? '1' : '0.15'" stroke="#81B29A" stroke-width="2" fill="none"/>
              <polyline points="0,105 135,210 270,105 405,210 540,105" [attr.opacity]="winningLines.has(21) ? '1' : '0.15'" stroke="#F2CC8F" stroke-width="2" fill="none"/>
              <polyline points="0,210 135,105 270,210 405,105 540,210" [attr.opacity]="winningLines.has(22) ? '1' : '0.15'" stroke="#3D5A80" stroke-width="2" fill="none"/>
              <polyline points="0,157.5 135,52.5 270,157.5 405,262.5 540,157.5" [attr.opacity]="winningLines.has(23) ? '1' : '0.15'" stroke="#EE6C4D" stroke-width="2" fill="none"/>
              <polyline points="0,157.5 135,262.5 270,157.5 405,52.5 540,157.5" [attr.opacity]="winningLines.has(24) ? '1' : '0.15'" stroke="#98C1D9" stroke-width="2" fill="none"/>
            </svg>

            <div id="reels">
              <div class="reel" *ngFor="let reel of reels; let i = index">
                <div class="symbols" [id]="'reel-' + i">
                  <div *ngFor="let symbol of reel.symbols" 
                       class="symbol"
                       [class.winning]="false">
                    {{ symbol }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="controls">
            <div class="info-panel">
              <div class="info-item">
                <span class="label">Credits:</span>
                <span class="value">{{ balance }}</span>
              </div>
              <div class="info-item">
                <span class="label">Bet/Line:</span>
                <span class="value">{{ currentBet }}</span>
              </div>
              <div class="info-item">
                <span class="label">Total Bet:</span>
                <span class="value">{{ currentBet * 25 }}</span>
              </div>
              <div class="info-item">
                <span class="label">Last Win:</span>
                <span class="value win-value">{{ lastWin }}</span>
              </div>
            </div>

            <div class="button-panel">
              <button (click)="decreaseBet()" [disabled]="isSpinning" class="btn-bet">-</button>
              <button (click)="spin()" [disabled]="isSpinning || balance < currentBet * 25" class="btn-spin">
                {{ isSpinning ? 'SPINNING...' : 'SPIN' }}
              </button>
              <button (click)="increaseBet()" [disabled]="isSpinning" class="btn-bet">+</button>
            </div>

            <button (click)="maxBet()" [disabled]="isSpinning" class="btn-max-bet">MAX BET</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .daily-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #4F2683 0%, #FFC62F 100%);
      padding: 15px;
      z-index: 1000;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
      animation: slideDown 0.5s ease-out;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .banner-content h3 {
      color: #fff;
      font-size: 24px;
      margin: 0 0 10px 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .banner-content p {
      color: #fff;
      font-size: 18px;
      margin: 5px 0;
      font-weight: bold;
    }

    .next-bonus {
      font-size: 14px !important;
      opacity: 0.9;
      font-weight: normal !important;
    }

    .bet-note {
      background: rgba(255, 198, 47, 0.1);
      padding: 10px;
      border-radius: 6px;
      border-left: 3px solid #FFC62F;
      margin: 10px 0 15px;
      font-size: 14px;
      color: #FFC62F;
    }

    .bet-note strong {
      color: #fff;
    }

    .slots-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%);
      padding: 15px;
    }

    .slots-header {
      max-width: 700px;
      margin: 0 auto 15px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .btn-back, .btn-paytable {
      background: linear-gradient(180deg, #4F2683 0%, #3a1c61 100%);
      color: #FFC62F;
      border: 2px solid #FFC62F;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 8px;
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
      font-size: 22px;
      margin: 0;
      flex: 1;
      text-align: center;
      text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
      letter-spacing: 2px;
    }

    .paytable-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      overflow-y: auto;
      padding: 20px;
    }

    .paytable-content {
      background: linear-gradient(180deg, #1a0033 0%, #0d001a 100%);
      border: 4px solid #FFC62F;
      border-radius: 15px;
      padding: 30px;
      max-width: 650px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      color: white;
      box-shadow: 0 0 50px rgba(255, 198, 47, 0.3);
    }

    .paytable-content h2 {
      color: #FFC62F;
      text-align: center;
      margin-bottom: 25px;
      font-size: 32px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    }

    .paytable-content h3 {
      color: #FFC62F;
      margin: 25px 0 15px;
      font-size: 22px;
      border-bottom: 2px solid #4F2683;
      padding-bottom: 8px;
    }

    .paytable-section {
      margin-bottom: 25px;
    }

    .payout-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .payout-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 15px;
      background: rgba(79, 38, 131, 0.3);
      border-radius: 8px;
      border-left: 4px solid #999;
    }

    .payout-row.jackpot {
      border-left-color: #FFD700;
      background: rgba(255, 215, 0, 0.1);
    }

    .payout-row.high {
      border-left-color: #FF6B6B;
    }

    .payout-row.medium {
      border-left-color: #4ECDC4;
    }

    .payout-row.low {
      border-left-color: #95E1D3;
    }

    .payout-row .symbol {
      font-size: 36px;
      width: 60px;
      text-align: center;
    }

    .payout-values {
      display: flex;
      gap: 12px;
      font-size: 13px;
      flex-wrap: wrap;
    }

    .payout-values strong {
      color: #FFC62F;
    }

    .lines-desc {
      color: #bbb;
      font-size: 14px;
      margin-bottom: 10px;
    }

    .lines-desc.highlight {
      color: #FFC62F;
      font-weight: bold;
      background: rgba(255, 198, 47, 0.1);
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 3px solid #FFC62F;
    }

    .rules-list {
      padding-left: 20px;
      color: #ccc;
      font-size: 14px;
      line-height: 1.8;
    }

    .rules-list li {
      margin-bottom: 8px;
    }

    .btn-close {
      width: 100%;
      background: linear-gradient(180deg, #4F2683 0%, #3a1c61 100%);
      color: #FFC62F;
      border: 2px solid #FFC62F;
      padding: 12px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 20px;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background: linear-gradient(180deg, #5a2d94 0%, #4F2683 100%);
      box-shadow: 0 0 15px rgba(255, 198, 47, 0.5);
    }

    .slots-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    #slotMachine {
      max-width: 700px;
      width: 100%;
      background: linear-gradient(180deg, #1a0033 0%, #0d001a 100%);
      border: 4px solid #FFC62F;
      border-radius: 20px;
      box-shadow: 0 0 30px rgba(255, 198, 47, 0.3);
      padding: 20px;
      position: relative;
    }

    #header {
      text-align: center;
      margin-bottom: 15px;
    }

    #logo {
      color: #FFC62F;
      font-size: 28px;
      font-weight: bold;
      text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
      letter-spacing: 3px;
    }

    #reelsContainer {
      position: relative;
      background: linear-gradient(180deg, #2a1a4e 0%, #1a0a2e 100%);
      border: 3px solid #4F2683;
      border-radius: 15px;
      padding: 10px;
      margin-bottom: 15px;
      overflow: hidden;
    }

    .paylines-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    #reels {
      display: flex;
      gap: 8px;
      position: relative;
      z-index: 2;
    }

    .reel {
      flex: 1;
      background: rgba(26, 10, 46, 0.8);
      border: 2px solid #4F2683;
      border-radius: 10px;
      overflow: hidden;
      height: 315px;
      position: relative;
    }

    .symbols {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }

    .symbol {
      height: 105px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60px;
      background: rgba(79, 38, 131, 0.3);
      border-bottom: 1px solid rgba(255, 198, 47, 0.2);
      user-select: none;
    }

    .symbol.winning {
      animation: pulse 0.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    #controls {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .info-panel {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: rgba(79, 38, 131, 0.3);
      padding: 15px;
      border-radius: 10px;
      border: 2px solid #4F2683;
    }

    .info-item {
      text-align: center;
    }

    .label {
      display: block;
      color: #bbb;
      font-size: 12px;
      margin-bottom: 5px;
    }

    .value {
      display: block;
      color: #FFC62F;
      font-size: 18px;
      font-weight: bold;
    }

    .win-value {
      color: #4CAF50;
    }

    .button-panel {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .btn-bet {
      background: linear-gradient(180deg, #4F2683 0%, #3a1c61 100%);
      color: #FFC62F;
      border: 2px solid #FFC62F;
      padding: 15px 30px;
      font-size: 24px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-bet:hover:not(:disabled) {
      background: linear-gradient(180deg, #5a2d94 0%, #4F2683 100%);
      box-shadow: 0 0 15px rgba(255, 198, 47, 0.5);
      transform: translateY(-2px);
    }

    .btn-bet:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-spin {
      flex: 1;
      background: linear-gradient(180deg, #4CAF50 0%, #45a049 100%);
      color: white;
      border: 3px solid #FFC62F;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
    }

    .btn-spin:hover:not(:disabled) {
      background: linear-gradient(180deg, #5cbf60 0%, #4CAF50 100%);
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.5);
      transform: translateY(-2px);
    }

    .btn-spin:disabled {
      background: linear-gradient(180deg, #666 0%, #555 100%);
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-max-bet {
      width: 100%;
      background: linear-gradient(180deg, #FF6B6B 0%, #ee5a52 100%);
      color: white;
      border: 2px solid #FFC62F;
      padding: 12px;
      font-size: 18px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-max-bet:hover:not(:disabled) {
      background: linear-gradient(180deg, #ff7f7f 0%, #FF6B6B 100%);
      box-shadow: 0 0 15px rgba(255, 107, 107, 0.5);
      transform: translateY(-2px);
    }

    .btn-max-bet:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    #winOverlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      border-radius: 20px;
    }

    #winMessage {
      text-align: center;
      animation: winPop 0.5s ease-out;
      max-width: 90%;
    }

    @keyframes winPop {
      0% {
        transform: scale(0.3);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .win-title {
      font-size: 48px;
      font-weight: bold;
      color: #FFC62F;
      text-shadow: 0 0 30px #FFC62F, 0 0 50px #FFC62F;
      margin-bottom: 20px;
      animation: glow 1s ease-in-out infinite;
    }

    @keyframes glow {
      0%, 100% {
        text-shadow: 0 0 30px #FFC62F, 0 0 50px #FFC62F;
      }
      50% {
        text-shadow: 0 0 50px #FFC62F, 0 0 80px #FFC62F, 0 0 100px #FFC62F;
      }
    }

    .win-amount {
      font-size: 72px;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 0 50px #4CAF50, 0 0 70px #4CAF50;
      margin-bottom: 25px;
    }

    .win-details {
      background: rgba(79, 38, 131, 0.6);
      padding: 20px;
      border-radius: 12px;
      margin-top: 20px;
      border: 2px solid #FFC62F;
      max-height: 200px;
      overflow-y: auto;
    }

    .win-summary {
      color: #FFC62F;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
      text-transform: uppercase;
    }

    .win-line {
      color: #fff;
      font-size: 16px;
      margin: 8px 0;
      padding: 8px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      border-left: 3px solid #4CAF50;
    }
  `]
})
export class SlotsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly SYMBOLS = ['🏆', '🏈', '⚔️', '🛡️', '👑', '⚡', '💜', 'V'];
  
  private readonly REEL_STRIPS = [
    ['⚡', '💜', 'V', '👑', '🛡️', '⚔️', '💜', 'V', '⚡', '👑', '🛡️', 'V', '💜', '⚔️', '🏈', 'V', '⚡', '👑', '💜', '🛡️', 'V', '⚔️', '⚡', '👑', '🏆', 'V', '💜', '🛡️', '⚔️', 'V'],
    ['V', '💜', '⚡', '🛡️', '👑', 'V', '⚔️', '💜', '⚡', '🛡️', 'V', '👑', '🏈', '💜', '⚡', 'V', '🛡️', '👑', '⚔️', 'V', '💜', '⚡', '🏆', '🛡️', 'V', '👑', '💜', '⚔️', 'V', '⚡'],
    ['⚡', 'V', '👑', '💜', '🛡️', '⚔️', 'V', '⚡', '💜', '🏈', '👑', '🛡️', 'V', '⚔️', '⚡', '💜', 'V', '👑', '🛡️', '🏆', '⚔️', 'V', '⚡', '💜', '👑', 'V', '🛡️', '⚔️', '💜', 'V'],
    ['💜', 'V', '⚡', '🛡️', '👑', '⚔️', 'V', '💜', '⚡', '🛡️', '👑', 'V', '⚔️', '🏈', '💜', '⚡', 'V', '🛡️', '👑', '⚔️', '💜', 'V', '⚡', '🏆', '🛡️', '👑', 'V', '⚔️', '💜', 'V'],
    ['V', '⚡', '💜', '👑', '🛡️', 'V', '⚔️', '⚡', '💜', '🛡️', '👑', 'V', '⚔️', '⚡', '🏈', '💜', 'V', '🛡️', '👑', '⚔️', 'V', '⚡', '💜', '🛡️', '🏆', '👑', 'V', '⚔️', '⚡', 'V']
  ];

  private readonly SYMBOL_HEIGHT = 105;
  private readonly VISIBLE_SYMBOLS = 3;
  private readonly BET_LEVELS = [1, 2, 5, 10, 20, 50, 100];
  
  // ENHANCED PAYTABLE - Now includes 2-symbol wins for premium symbols
  private readonly PAYTABLE: {[key: string]: {[key: number]: number}} = {
    '🏆': { 5: 1000, 4: 250, 3: 50, 2: 10 },   // Trophy - Jackpot symbol
    '🏈': { 5: 500, 4: 100, 3: 25, 2: 5 },     // Football - High symbol
    '⚔️': { 5: 300, 4: 75, 3: 20, 2: 4 },      // Sword - High symbol
    '🛡️': { 5: 200, 4: 50, 3: 15, 2: 3 },      // Shield - Medium symbol
    '👑': { 5: 150, 4: 40, 3: 10, 2: 2 },      // Crown - Medium symbol
    '⚡': { 5: 100, 4: 30, 3: 8 },              // Lightning - Low symbol (3+ only)
    '💜': { 5: 80, 4: 25, 3: 5 },               // Purple heart - Low symbol (3+ only)
    'V': { 5: 60, 4: 20, 3: 5 }                 // V - Low symbol (3+ only)
  };

  // 25 Paylines matching the visual display
  private readonly PAYLINES = [
    // Straight lines (5)
    [0, 0, 0, 0, 0], // Line 1 - Top
    [1, 1, 1, 1, 1], // Line 2 - Middle
    [2, 2, 2, 2, 2], // Line 3 - Bottom
    [0, 1, 1, 1, 0], // Line 4
    [2, 1, 1, 1, 2], // Line 5
    
    // V and inverted V patterns (4)
    [0, 1, 2, 1, 0], // Line 6 - V shape
    [2, 1, 0, 1, 2], // Line 7 - Inverted V
    [0, 1, 0, 1, 0], // Line 8
    [2, 1, 2, 1, 2], // Line 9
    
    // Zigzag patterns (6)
    [0, 0, 1, 2, 2], // Line 10
    [2, 2, 1, 0, 0], // Line 11
    [1, 0, 1, 2, 1], // Line 12
    [1, 2, 1, 0, 1], // Line 13
    [0, 1, 0, 2, 0], // Line 14
    [2, 1, 2, 0, 2], // Line 15
    
    // Diagonal and complex patterns (10)
    [0, 0, 0, 1, 2], // Line 16
    [2, 2, 2, 1, 0], // Line 17
    [1, 0, 0, 0, 1], // Line 18
    [1, 2, 2, 2, 1], // Line 19
    [0, 2, 0, 2, 0], // Line 20
    [2, 0, 2, 0, 2], // Line 21
    [0, 1, 2, 0, 1], // Line 22
    [2, 1, 0, 2, 1], // Line 23
    [1, 0, 1, 0, 1], // Line 24
    [1, 2, 1, 2, 1]  // Line 25
  ];

  balance = 0;
  currentBet = 1;
  lastWin = 0;
  isSpinning = false;
  isSaving = false;
  betIndex = 0;
  
  showWinOverlay = false;
  showPaytable = false;
  showDailyBanner = false;
  winTitle = '';
  winAmount = '';
  timeUntilNextCredit = '';
  winningReels = new Set<number>();
  winningLines = new Set<number>();
  currentWins: WinResult[] = [];

  // Initialize reels array with placeholder data so DOM elements render immediately
  reels: Reel[] = Array(5).fill(null).map((_, index) => ({
    symbols: this.REEL_STRIPS[index] ? [...this.REEL_STRIPS[index], ...this.REEL_STRIPS[index], ...this.REEL_STRIPS[index]] : [],
    element: null,
    position: 0
  }));
  private userId: string = '';

  constructor(
    private router: Router,
    private creditsService: CreditsService,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.loadUserCredits();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initReels(), 100);
  }

  ngOnDestroy() {
    if (this.userId) {
      this.saveBalance();
    }
  }

  async loadUserCredits() {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.userId = user.uid;
      const credits = await this.creditsService.getUserCredits();
      
      const today = new Date().toISOString().split('T')[0];
      if (credits.lastDailyCredit === today && this.balance === 0) {
        this.showDailyBanner = true;
        setTimeout(() => this.showDailyBanner = false, 5000);
      }

      this.balance = credits.balance;
      this.updateTimeUntilNextCredit();
    } catch (error) {
      console.error('Error loading credits:', error);
      alert('Failed to load credits');
    }
  }

  async updateTimeUntilNextCredit() {
    this.timeUntilNextCredit = await this.creditsService.getTimeUntilNextDailyCredit();
  }

  calculatePayout(symbol: string, count: number): number {
    return (this.PAYTABLE[symbol]?.[count] || 0) * this.currentBet;
  }

  togglePaytable() {
    this.showPaytable = !this.showPaytable;
    if (this.showPaytable) {
      this.updateTimeUntilNextCredit();
    }
  }

  private initReels() {
    // Update existing reels array instead of creating new one
    for (let index = 0; index < this.REEL_STRIPS.length; index++) {
      const strip = this.REEL_STRIPS[index];
      const reelElement = document.getElementById('reel-' + index);
      
      if (!reelElement) {
        console.error('Reel element not found:', 'reel-' + index);
      }
      
      // Update the existing reel object
      this.reels[index] = {
        symbols: [...strip, ...strip, ...strip],
        element: reelElement,
        position: 0
      };
      
      if (reelElement) {
        const transform = 'translateY(0px)';
        reelElement.style.transform = transform;
        reelElement.style.transition = 'none';
        reelElement.style.willChange = 'transform';
        console.log(`Initialized reel ${index} with element, transform:`, transform);
      } else {
        console.error('Reel element is null for index:', index);
      }
    }
  }

  spin() {
    if (this.isSpinning || this.balance < this.currentBet * 25) {
      console.log('Spin blocked:', { isSpinning: this.isSpinning, balance: this.balance, required: this.currentBet * 25 });
      return;
    }

    console.log('Starting spin with', this.reels.length, 'reels');

    this.isSpinning = true;
    this.balance -= this.currentBet * 25;
    this.lastWin = 0;
    this.winningReels.clear();
    this.winningLines.clear();
    this.currentWins = [];

    const spinPromises = this.reels.map((reel, index) => {
      return new Promise<void>(resolve => {
        const stripLength = this.REEL_STRIPS[index].length;
        const spins = 3 + index * 0.5;
        const targetPos = Math.floor(Math.random() * stripLength) + stripLength * spins;
        const startPos = reel.position;
        const duration = 2000 + index * 200;
        const startTime = Date.now();

        console.log(`Reel ${index}: startPos=${startPos}, targetPos=${targetPos}, element=${!!reel.element}`);

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentPos = startPos + (targetPos - startPos) * easeOut;
          
          reel.position = currentPos;
          if (reel.element) {
            const transformValue = 'translateY(-' + (currentPos * this.SYMBOL_HEIGHT) + 'px)';
            reel.element.style.transform = transformValue;
            
            // Log first frame to verify transform is applied
            if (elapsed < 100) {
              console.log(`Reel ${index} transform:`, transformValue, 'computed:', window.getComputedStyle(reel.element).transform);
            }
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            reel.position = targetPos;
            if (reel.element) {
              reel.element.style.transform = 'translateY(-' + (targetPos * this.SYMBOL_HEIGHT) + 'px)';
            }
            console.log(`Reel ${index} finished`);
            resolve();
          }
        };

        setTimeout(() => requestAnimationFrame(animate), index * 150);
      });
    });

    Promise.all(spinPromises).then(() => {
      console.log('All reels finished spinning');
      this.checkWin();
      this.isSpinning = false;
    });
  }

  private getVisibleSymbols(): string[][] {
    const grid: string[][] = [];
    this.reels.forEach((reel, reelIndex) => {
      const column: string[] = [];
      const basePos = Math.floor(reel.position);
      for (let i = 0; i < this.VISIBLE_SYMBOLS; i++) {
        const index = (basePos + i) % this.REEL_STRIPS[reelIndex].length;
        column.push(reel.symbols[index]);
      }
      grid.push(column);
    });
    return grid;
  }

  private async checkWin() {
    const grid = this.getVisibleSymbols();
    let totalWinCoins = 0;
    const winningReelsSet = new Set<number>();
    const winningLinesSet = new Set<number>();
    const wins: WinResult[] = [];

    // Check each payline
    this.PAYLINES.forEach((payline, lineIndex) => {
      const lineSymbols = payline.map((row, col) => grid[col][row]);
      const lineWin = this.checkLine(lineSymbols);
      
      if (lineWin.payout > 0) {
        totalWinCoins += lineWin.payout;
        lineWin.positions.forEach(pos => winningReelsSet.add(pos));
        winningLinesSet.add(lineIndex);
        
        wins.push({
          lineIndex,
          symbol: lineWin.symbol,
          count: lineWin.count,
          payout: lineWin.payout,
          positions: lineWin.positions
        });
      }
    });

    if (totalWinCoins > 0) {
      this.balance += totalWinCoins;
      this.lastWin = totalWinCoins;
      this.winningReels = winningReelsSet;
      this.winningLines = winningLinesSet;
      this.currentWins = wins;
      
      try {
        await this.creditsService.recordWin(this.userId, totalWinCoins);
      } catch (error) {
        console.error('Error recording win:', error);
      }

      this.showWinAnimation(totalWinCoins);
    } else {
      await this.saveBalance();
    }
  }

  // ENHANCED WIN DETECTION - Now properly checks for 2+ symbol matches
  private checkLine(symbols: string[]): { payout: number; positions: number[]; symbol: string; count: number } {
    let bestWin = { payout: 0, positions: [] as number[], symbol: '', count: 0 };

    // Check each unique symbol
    for (const symbol of this.SYMBOLS) {
      let count = 0;
      
      // Count consecutive matches from left to right
      for (let i = 0; i < symbols.length; i++) {
        if (symbols[i] === symbol) {
          count++;
        } else {
          break; // Stop at first non-match (left-to-right rule)
        }
      }

      // Check if this symbol has a payout for this count
      if (count >= 2 && this.PAYTABLE[symbol]?.[count]) {
        const payout = this.PAYTABLE[symbol][count] * this.currentBet;
        
        // Keep the highest paying win for this line
        if (payout > bestWin.payout) {
          bestWin = {
            payout,
            positions: Array.from({ length: count }, (_, i) => i),
            symbol,
            count
          };
        }
      }
    }

    return bestWin;
  }

  private showWinAnimation(amount: number) {
    const totalBet = this.currentBet * 25;
    const multiplier = amount / totalBet;

    if (multiplier >= 50) {
      this.winTitle = '🏆💎 MEGA JACKPOT! 💎🏆';
    } else if (multiplier >= 25) {
      this.winTitle = '🏆 JACKPOT! 🏆';
    } else if (multiplier >= 10) {
      this.winTitle = '⚡ BIG WIN! ⚡';
    } else if (multiplier >= 5) {
      this.winTitle = '💰 GREAT WIN! 💰';
    } else {
      this.winTitle = '✨ WINNER! ✨';
    }

    this.winAmount = amount + ' CREDITS';
    this.showWinOverlay = true;

    setTimeout(() => {
      this.showWinOverlay = false;
      this.winningReels.clear();
      this.winningLines.clear();
      this.saveBalance();
    }, 4500);
  }

  private async saveBalance() {
    if (!this.userId || this.isSaving) return;
    
    this.isSaving = true;
    try {
      await this.creditsService.updateBalance(this.userId, this.balance);
    } catch (error) {
      console.error('Error saving balance:', error);
    } finally {
      this.isSaving = false;
    }
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
    this.saveBalance();
    this.router.navigate(['/lobby']);
  }
}