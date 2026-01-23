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
                </div>
              </div>
              <div class="payout-row high">
                <span class="symbol">🏈</span>
                <div class="payout-values">
                  <span>5 = <strong>{{ calculatePayout('🏈', 5) }}</strong></span>
                  <span>4 = <strong>{{ calculatePayout('🏈', 4) }}</strong></span>
                  <span>3 = <strong>{{ calculatePayout('🏈', 3) }}</strong></span>
                </div>
              </div>
              <div class="payout-row high">
                <span class="symbol">⚔️</span>
                <div class="payout-values">
                  <span>5 = <strong>{{ calculatePayout('⚔️', 5) }}</strong></span>
                  <span>4 = <strong>{{ calculatePayout('⚔️', 4) }}</strong></span>
                  <span>3 = <strong>{{ calculatePayout('⚔️', 3) }}</strong></span>
                </div>
              </div>
              <div class="payout-row medium">
                <span class="symbol">🛡️</span>
                <div class="payout-values">
                  <span>5 = <strong>{{ calculatePayout('🛡️', 5) }}</strong></span>
                  <span>4 = <strong>{{ calculatePayout('🛡️', 4) }}</strong></span>
                  <span>3 = <strong>{{ calculatePayout('🛡️', 3) }}</strong></span>
                </div>
              </div>
              <div class="payout-row medium">
                <span class="symbol">👑</span>
                <div class="payout-values">
                  <span>5 = <strong>{{ calculatePayout('👑', 5) }}</strong></span>
                  <span>4 = <strong>{{ calculatePayout('👑', 4) }}</strong></span>
                  <span>3 = <strong>{{ calculatePayout('👑', 3) }}</strong></span>
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
                <div class="info-value">25</div>
              </div>
              <div class="info-item">
                <div class="info-label">Bet/Line</div>
                <div class="info-value">{{ currentBet }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Total Bet</div>
                <div class="info-value">{{ currentBet * 25 }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Win</div>
                <div class="info-value win-value">{{ lastWin }}</div>
              </div>
            </div>

            <div id="controls">
              <div class="control-group">
                <button (click)="decreaseBet()" [disabled]="isSpinning">-</button>
                <span class="bet-label">BET</span>
                <button (click)="increaseBet()" [disabled]="isSpinning">+</button>
              </div>

              <button id="spinButton" (click)="spin()" [disabled]="isSpinning || balance < (currentBet * 25) || isSaving">
                {{ isSpinning ? 'SPINNING...' : isSaving ? 'SAVING...' : 'SPIN' }}
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
    /* Previous styles remain the same, adding new ones: */
    
    .daily-banner {
      max-width: 700px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      border: 3px solid #FFC62F;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
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

    /* Keep all existing styles from previous version */
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
      gap: 15px;
      font-size: 14px;
    }

    .payout-values strong {
      color: #FFC62F;
    }

    .lines-desc {
      color: #bbb;
      font-size: 14px;
      margin-bottom: 10px;
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
      margin-top: 25px;
      background: linear-gradient(180deg, #FFC62F 0%, #e6a800 100%);
      color: #000;
      border: none;
      padding: 14px;
      font-size: 18px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background: linear-gradient(180deg, #ffd454 0%, #FFC62F 100%);
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(255, 198, 47, 0.5);
    }

    .slots-container {
      max-width: 700px;
      margin: 0 auto;
    }

    #slotMachine {
      background: linear-gradient(180deg, #1a0033 0%, #0d001a 100%);
      border: 4px solid #4F2683;
      border-radius: 15px;
      box-shadow: 0 0 60px rgba(79, 38, 131, 0.6);
      overflow: hidden;
      position: relative;
    }

    #header {
      background: linear-gradient(90deg, #4F2683 0%, #79228B 50%, #4F2683 100%);
      padding: 15px;
      text-align: center;
      border-bottom: 4px solid #FFC62F;
    }

    #logo {
      color: #FFC62F;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 3px;
      text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
    }

    #reelsContainer {
      background: linear-gradient(180deg, #000 0%, #0a0a0a 100%);
      padding: 20px 15px;
      position: relative;
      height: 355px;
    }

    .paylines-svg {
      position: absolute;
      top: 20px;
      left: 15px;
      right: 15px;
      bottom: 20px;
      pointer-events: none;
      z-index: 5;
    }

    #reels {
      display: flex;
      justify-content: center;
      gap: 10px;
      position: relative;
      z-index: 10;
    }

    .reel {
      width: 100px;
      height: 315px;
      background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
      border: 3px solid #333;
      border-radius: 10px;
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.9),
                  0 0 15px rgba(79, 38, 131, 0.3);
    }

    .reel-inner {
      position: absolute;
      width: 100%;
      transition: transform 0.05s linear;
    }

    :host ::ng-deep .symbol {
      height: 105px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 64px;
      background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
      border-bottom: 1px solid #444;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    }

    #controlPanel {
      background: linear-gradient(180deg, #1a0033 0%, #0d001a 100%);
      padding: 20px;
      border-top: 3px solid #4F2683;
    }

    #infoDisplay {
      display: flex;
      justify-content: space-around;
      margin-bottom: 18px;
      padding: 15px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 10px;
      border: 2px solid #4F2683;
    }

    .info-item {
      text-align: center;
      flex: 1;
    }

    .info-label {
      color: #aaa;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
      font-weight: bold;
    }

    .info-value {
      color: #FFC62F;
      font-size: 18px;
      font-weight: bold;
      text-shadow: 0 0 10px rgba(255, 198, 47, 0.5);
    }

    .win-value {
      color: #4CAF50;
      font-size: 20px;
    }

    #controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bet-label {
      color: #FFC62F;
      font-size: 14px;
      font-weight: bold;
    }

    button {
      background: linear-gradient(180deg, #4F2683 0%, #3a1c61 100%);
      color: #FFC62F;
      border: 2px solid #FFC62F;
      padding: 10px 18px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 45px;
    }

    button:hover:not(:disabled) {
      background: linear-gradient(180deg, #5a2d94 0%, #4F2683 100%);
      box-shadow: 0 0 20px rgba(255, 198, 47, 0.6);
      transform: translateY(-2px);
    }

    button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }

    #spinButton {
      background: linear-gradient(180deg, #FFC62F 0%, #e6a800 100%);
      color: #000;
      font-size: 22px;
      padding: 15px 45px;
      border: 3px solid #fff;
      box-shadow: 0 5px 25px rgba(255, 198, 47, 0.5);
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

    #spinButton:hover:not(:disabled) {
      background: linear-gradient(180deg, #ffd454 0%, #FFC62F 100%);
      box-shadow: 0 8px 35px rgba(255, 198, 47, 0.8);
      transform: translateY(-3px);
    }

    #winOverlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.96);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    #winMessage {
      text-align: center;
      animation: scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      max-width: 90%;
    }

    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    .win-title {
      font-size: 52px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #FFC62F;
      text-shadow: 0 0 40px #FFC62F, 0 0 60px #FFC62F;
      animation: titlePulse 1.5s infinite;
    }

    @keyframes titlePulse {
      0%, 100% { transform: scale(1); text-shadow: 0 0 40px #FFC62F; }
      50% { transform: scale(1.05); text-shadow: 0 0 60px #FFC62F, 0 0 80px #FFC62F; }
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
  
  private readonly PAYTABLE: {[key: string]: {[key: number]: number}} = {
    '🏆': { 5: 1000, 4: 250, 3: 50 },
    '🏈': { 5: 500, 4: 100, 3: 25 },
    '⚔️': { 5: 300, 4: 75, 3: 20 },
    '🛡️': { 5: 200, 4: 50, 3: 15 },
    '👑': { 5: 150, 4: 40, 3: 10 },
    '⚡': { 5: 100, 4: 30, 3: 8 },
    '💜': { 5: 80, 4: 25, 3: 5 },
    'V': { 5: 60, 4: 20, 3: 5 }
  };

  private readonly PAYLINES = [
    [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [1, 1, 1, 1, 1], [2, 1, 1, 1, 2], [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0], [2, 1, 0, 1, 2], [0, 1, 0, 1, 0], [2, 1, 2, 1, 2], [0, 0, 1, 2, 2],
    [2, 2, 1, 0, 0], [1, 0, 1, 2, 1], [1, 2, 1, 0, 1], [0, 1, 0, 2, 0], [2, 1, 2, 0, 2],
    [0, 0, 0, 1, 2], [2, 2, 2, 1, 0], [1, 0, 0, 0, 1], [1, 2, 2, 2, 1], [0, 2, 0, 2, 0],
    [2, 0, 2, 0, 2], [0, 1, 2, 0, 1], [2, 1, 0, 2, 1], [1, 0, 1, 0, 1], [1, 2, 1, 2, 1]
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

  private reels: Reel[] = [];
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
    setTimeout(() => this.initReels(), 0);
  }

  ngOnDestroy() {
    // Save balance on component destroy
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
        // Show daily banner if credits were just awarded
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
    for (let i = 0; i < 5; i++) {
      const reel: Reel = {
        symbols: this.REEL_STRIPS[i],
        element: document.getElementById('reel' + i),
        position: 0
      };

      if (reel.element) {
        const fullStrip = [...this.REEL_STRIPS[i], ...this.REEL_STRIPS[i]];
        fullStrip.forEach(symbol => {
          const symbolEl = document.createElement('div');
          symbolEl.className = 'symbol';
          symbolEl.textContent = symbol;
          reel.element!.appendChild(symbolEl);
        });
      }

      this.reels.push(reel);
    }
  }

  async spin() {
    const totalBet = this.currentBet * 25;
    if (this.isSpinning || this.balance < totalBet || this.isSaving) return;

    this.isSpinning = true;
    this.balance -= totalBet;
    this.lastWin = 0;
    this.winningReels.clear();
    this.winningLines.clear();
    this.currentWins = [];

    // Save wager to Firebase
    try {
      await this.creditsService.recordWager(this.userId, totalBet);
    } catch (error) {
      console.error('Error recording wager:', error);
    }

    const spinPromises = this.reels.map((reel, index) => {
      return new Promise<void>(resolve => {
        const spinDuration = 2000 + (index * 250);
        const startTime = Date.now();
        const startPos = reel.position;
        const stripLength = this.REEL_STRIPS[index].length;
        const spins = 4 + index;
        const randomStop = Math.floor(Math.random() * stripLength);
        const targetPos = (startPos + (stripLength * spins) + randomStop) % stripLength;

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / spinDuration, 1);
          
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const totalDistance = (stripLength * spins) + (targetPos >= startPos ? targetPos - startPos : stripLength - startPos + targetPos);
          const currentDistance = totalDistance * easeOut;
          const currentPos = (startPos + currentDistance) % stripLength;
          
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

        setTimeout(() => requestAnimationFrame(animate), index * 150);
      });
    });

    Promise.all(spinPromises).then(() => {
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
      
      // Save win to Firebase
      try {
        await this.creditsService.recordWin(this.userId, totalWinCoins);
      } catch (error) {
        console.error('Error recording win:', error);
      }

      this.showWinAnimation(totalWinCoins);
    } else {
      // Save balance even on losses
      await this.saveBalance();
    }
  }

  private checkLine(symbols: string[]): { payout: number; positions: number[]; symbol: string; count: number } {
    let bestWin = { payout: 0, positions: [] as number[], symbol: '', count: 0 };

    for (const symbol of this.SYMBOLS) {
      let count = 0;
      for (let i = 0; i < symbols.length; i++) {
        if (symbols[i] === symbol) {
          count++;
        } else {
          break;
        }
      }

      if (count >= 3 && this.PAYTABLE[symbol]?.[count]) {
        const payout = this.PAYTABLE[symbol][count] * this.currentBet;
        
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
    this.saveBalance(); // Save before leaving
    this.router.navigate(['/lobby']);
  }
}