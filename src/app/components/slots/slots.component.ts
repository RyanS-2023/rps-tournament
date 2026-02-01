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

interface SpinResult {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  hash: string;
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

      <!-- Paytable Modal -->
      <div class="paytable-modal" *ngIf="showPaytable" (click)="showPaytable = false">
        <div class="paytable-content" (click)="$event.stopPropagation()">
          <h2>💰 PAYTABLE & RULES 💰</h2>
          
          <!-- Symbol Payouts Section -->
          <div class="paytable-section">
            <h3>🎰 Symbol Payouts</h3>
            <p class="bet-note">All payouts shown for <strong>1 credit</strong> bet per line. Multiply by your bet amount.</p>
            
            <div class="symbols-grid">
              <div class="symbol-card jackpot">
                <div class="symbol-icon">🏆</div>
                <div class="symbol-name">TROPHY</div>
                <div class="symbol-pays">
                  <div class="pay-line"><span class="count">5×</span> = <strong>2000</strong></div>
                  <div class="pay-line"><span class="count">4×</span> = <strong>400</strong></div>
                  <div class="pay-line"><span class="count">3×</span> = <strong>80</strong></div>
                  <div class="pay-line"><span class="count">2×</span> = <strong>10</strong></div>
                </div>
              </div>

              <div class="symbol-card high">
                <div class="symbol-icon">🏈</div>
                <div class="symbol-name">FOOTBALL</div>
                <div class="symbol-pays">
                  <div class="pay-line"><span class="count">5×</span> = <strong>1000</strong></div>
                  <div class="pay-line"><span class="count">4×</span> = <strong>200</strong></div>
                  <div class="pay-line"><span class="count">3×</span> = <strong>50</strong></div>
                  <div class="pay-line"><span class="count">2×</span> = <strong>5</strong></div>
                </div>
              </div>

              <div class="symbol-card high">
                <div class="symbol-icon">⚔️</div>
                <div class="symbol-name">SWORD</div>
                <div class="symbol-pays">
                  <div class="pay-line"><span class="count">5×</span> = <strong>600</strong></div>
                  <div class="pay-line"><span class="count">4×</span> = <strong>150</strong></div>
                  <div class="pay-line"><span class="count">3×</span> = <strong>40</strong></div>
                  <div class="pay-line"><span class="count">2×</span> = <strong>4</strong></div>
                </div>
              </div>

              <div class="symbol-card medium">
                <div class="symbol-icon">🛡️</div>
                <div class="symbol-name">SHIELD</div>
                <div class="symbol-pays">
                  <div class="pay-line"><span class="count">5×</span> = <strong>400</strong></div>
                  <div class="pay-line"><span class="count">4×</span> = <strong>100</strong></div>
                  <div class="pay-line"><span class="count">3×</span> = <strong>25</strong></div>
                  <div class="pay-line"><span class="count">2×</span> = <strong>3</strong></div>
                </div>
              </div>

              <div class="symbol-card medium">
                <div class="symbol-icon">👑</div>
                <div class="symbol-name">CROWN</div>
                <div class="symbol-pays">
                  <div class="pay-line"><span class="count">5×</span> = <strong>300</strong></div>
                  <div class="pay-line"><span class="count">4×</span> = <strong>80</strong></div>
                  <div class="pay-line"><span class="count">3×</span> = <strong>20</strong></div>
                  <div class="pay-line"><span class="count">2×</span> = <strong>2</strong></div>
                </div>
              </div>

              <div class="symbol-card low">
                <div class="symbol-icon">⚡</div>
                <div class="symbol-name">LIGHTNING</div>
                <div class="symbol-pays">
                  <div class="pay-line"><span class="count">5×</span> = <strong>200</strong></div>
                  <div class="pay-line"><span class="count">4×</span> = <strong>50</strong></div>
                  <div class="pay-line"><span class="count">3×</span> = <strong>15</strong></div>
                </div>
              </div>

              <div class="symbol-card low">
                <div class="symbol-icon">💜</div>
                <div class="symbol-name">HEART</div>
                <div class="symbol-pays">
                  <div class="pay-line"><span class="count">5×</span> = <strong>150</strong></div>
                  <div class="pay-line"><span class="count">4×</span> = <strong>40</strong></div>
                  <div class="pay-line"><span class="count">3×</span> = <strong>10</strong></div>
                </div>
              </div>

              <div class="symbol-card low">
                <div class="symbol-icon">V</div>
                <div class="symbol-name">VIKINGS V</div>
                <div class="symbol-pays">
                  <div class="pay-line"><span class="count">5×</span> = <strong>100</strong></div>
                  <div class="pay-line"><span class="count">4×</span> = <strong>30</strong></div>
                  <div class="pay-line"><span class="count">3×</span> = <strong>8</strong></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Paylines Visualization -->
          <div class="paytable-section">
            <h3>📊 25 Paylines Visualization</h3>
            <p class="paylines-info">Click on a payline to see how it works across the reels</p>
            
            <div class="paylines-grid">
              <div class="payline-visual" *ngFor="let line of PAYLINES; let i = index" 
                   (click)="highlightPayline(i)"
                   [class.active]="highlightedPayline === i">
                <div class="line-number">Line {{ i + 1 }}</div>
                <div class="mini-grid">
                  <div class="mini-reel" *ngFor="let pos of [0,1,2,3,4]">
                    <div class="mini-cell" [class.active]="line[pos] === 0"></div>
                    <div class="mini-cell" [class.active]="line[pos] === 1"></div>
                    <div class="mini-cell" [class.active]="line[pos] === 2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rules Section -->
          <div class="paytable-section">
            <h3>📜 Game Rules</h3>
            <ul class="rules-list">
              <li>All 25 paylines are active on every spin</li>
              <li>Wins pay left to right on consecutive reels</li>
              <li>Premium symbols (🏆🏈⚔️🛡️👑) pay on 2+ matches</li>
              <li>Standard symbols (⚡💜V) pay on 3+ matches</li>
              <li>Multiple winning lines pay out separately</li>
              <li>Maximum payout per spin: 50,000 credits</li>
            </ul>
          </div>

          <!-- Provably Fair Section -->
          <div class="paytable-section provably-fair">
            <h3>🔐 Provably Fair Gaming</h3>
            <p class="fair-desc">Every spin is verifiable using cryptographic hashing</p>
            <div class="fair-info">
              <div class="fair-item">
                <strong>Client Seed:</strong>
                <code>{{ clientSeed }}</code>
                <button (click)="regenerateClientSeed()" class="btn-regenerate">New Seed</button>
              </div>
              <div class="fair-item">
                <strong>Nonce:</strong> {{ spinNonce }}
              </div>
              <div class="fair-item">
                <strong>Last Spin Hash:</strong>
                <code class="hash">{{ lastSpinHash || 'Spin to generate' }}</code>
              </div>
            </div>
            <p class="fair-note">Each spin combines server seed + client seed + nonce to generate verifiable random results</p>
          </div>

          <!-- Daily Credits -->
          <div class="paytable-section">
            <h3>💎 Daily Bonus</h3>
            <ul class="rules-list">
              <li>Receive 1,000 free credits every day</li>
              <li>Credits automatically added on first login</li>
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
            <div id="fairness-badge" (click)="showPaytable = true; scrollToFairness()">
              🔐 Provably Fair
            </div>
          </div>

          <div id="reelsContainer">
            <svg class="paylines-svg" viewBox="0 0 540 315" preserveAspectRatio="none">
              <line x1="0" y1="52.5" x2="540" y2="52.5" [attr.opacity]="winningLines.has(0) ? '1' : '0.2'" stroke="#FFD700" stroke-width="3"/>
              <line x1="0" y1="157.5" x2="540" y2="157.5" [attr.opacity]="winningLines.has(1) ? '1' : '0.2'" stroke="#FF6B6B" stroke-width="3"/>
              <line x1="0" y1="262.5" x2="540" y2="262.5" [attr.opacity]="winningLines.has(2) ? '1' : '0.2'" stroke="#4ECDC4" stroke-width="3"/>
              <line x1="0" y1="105" x2="540" y2="105" [attr.opacity]="winningLines.has(3) ? '1' : '0.2'" stroke="#95E1D3" stroke-width="3"/>
              <line x1="0" y1="210" x2="540" y2="210" [attr.opacity]="winningLines.has(4) ? '1' : '0.2'" stroke="#F38181" stroke-width="3"/>
              <polyline points="0,52.5 135,157.5 270,262.5 405,157.5 540,52.5" [attr.opacity]="winningLines.has(5) ? '1' : '0.2'" stroke="#AA96DA" stroke-width="3" fill="none"/>
              <polyline points="0,262.5 135,157.5 270,52.5 405,157.5 540,262.5" [attr.opacity]="winningLines.has(6) ? '1' : '0.2'" stroke="#FCBAD3" stroke-width="3" fill="none"/>
              <polyline points="0,105 135,157.5 270,210 405,157.5 540,105" [attr.opacity]="winningLines.has(7) ? '1' : '0.2'" stroke="#FFFFD2" stroke-width="3" fill="none"/>
              <polyline points="0,210 135,157.5 270,105 405,157.5 540,210" [attr.opacity]="winningLines.has(8) ? '1' : '0.2'" stroke="#A8D8EA" stroke-width="3" fill="none"/>
              <polyline points="0,52.5 108,157.5 216,52.5 324,157.5 432,52.5 540,157.5" [attr.opacity]="winningLines.has(9) ? '1' : '0.2'" stroke="#FF6B9D" stroke-width="3" fill="none"/>
              <polyline points="0,262.5 108,157.5 216,262.5 324,157.5 432,262.5 540,157.5" [attr.opacity]="winningLines.has(10) ? '1' : '0.2'" stroke="#C44569" stroke-width="3" fill="none"/>
              <polyline points="0,157.5 108,52.5 216,157.5 324,262.5 432,157.5 540,52.5" [attr.opacity]="winningLines.has(11) ? '1' : '0.2'" stroke="#F8B500" stroke-width="3" fill="none"/>
              <polyline points="0,157.5 108,262.5 216,157.5 324,52.5 432,157.5 540,262.5" [attr.opacity]="winningLines.has(12) ? '1' : '0.2'" stroke="#6BCB77" stroke-width="3" fill="none"/>
              <polyline points="0,52.5 135,105 270,157.5 405,210 540,262.5" [attr.opacity]="winningLines.has(13) ? '1' : '0.2'" stroke="#4D96FF" stroke-width="3" fill="none"/>
              <polyline points="0,262.5 135,210 270,157.5 405,105 540,52.5" [attr.opacity]="winningLines.has(14) ? '1' : '0.2'" stroke="#FFB6B9" stroke-width="3" fill="none"/>
              <polyline points="0,105 135,52.5 270,105 405,157.5 540,210" [attr.opacity]="winningLines.has(15) ? '1' : '0.2'" stroke="#BAE8E8" stroke-width="3" fill="none"/>
              <polyline points="0,210 135,262.5 270,210 405,157.5 540,105" [attr.opacity]="winningLines.has(16) ? '1' : '0.2'" stroke="#FFEAA7" stroke-width="3" fill="none"/>
              <polyline points="0,157.5 135,105 270,52.5 405,105 540,157.5" [attr.opacity]="winningLines.has(17) ? '1' : '0.2'" stroke="#DDA15E" stroke-width="3" fill="none"/>
              <polyline points="0,157.5 135,210 270,262.5 405,210 540,157.5" [attr.opacity]="winningLines.has(18) ? '1' : '0.2'" stroke="#BC6C25" stroke-width="3" fill="none"/>
              <polyline points="0,52.5 135,210 270,52.5 405,210 540,52.5" [attr.opacity]="winningLines.has(19) ? '1' : '0.2'" stroke="#E07A5F" stroke-width="3" fill="none"/>
              <polyline points="0,262.5 135,105 270,262.5 405,105 540,262.5" [attr.opacity]="winningLines.has(20) ? '1' : '0.2'" stroke="#81B29A" stroke-width="3" fill="none"/>
              <polyline points="0,105 135,210 270,105 405,210 540,105" [attr.opacity]="winningLines.has(21) ? '1' : '0.2'" stroke="#F2CC8F" stroke-width="3" fill="none"/>
              <polyline points="0,210 135,105 270,210 405,105 540,210" [attr.opacity]="winningLines.has(22) ? '1' : '0.2'" stroke="#3D5A80" stroke-width="3" fill="none"/>
              <polyline points="0,157.5 135,52.5 270,157.5 405,262.5 540,157.5" [attr.opacity]="winningLines.has(23) ? '1' : '0.2'" stroke="#EE6C4D" stroke-width="3" fill="none"/>
              <polyline points="0,157.5 135,262.5 270,157.5 405,52.5 540,157.5" [attr.opacity]="winningLines.has(24) ? '1' : '0.2'" stroke="#98C1D9" stroke-width="3" fill="none"/>
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
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      color: white;
      box-shadow: 0 0 50px rgba(255, 198, 47, 0.3);
    }

    .paytable-content h2 {
      color: #FFC62F;
      text-align: center;
      margin-bottom: 30px;
      font-size: 36px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    }

    .paytable-content h3 {
      color: #FFC62F;
      margin: 30px 0 20px;
      font-size: 24px;
      border-bottom: 3px solid #4F2683;
      padding-bottom: 10px;
    }

    .paytable-section {
      margin-bottom: 30px;
    }

    .bet-note {
      background: rgba(255, 198, 47, 0.15);
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid #FFC62F;
      margin: 15px 0 20px;
      font-size: 15px;
      color: #FFC62F;
      text-align: center;
    }

    .bet-note strong {
      color: #fff;
      font-size: 18px;
    }

    /* Symbol Cards Grid */
    .symbols-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }

    .symbol-card {
      background: rgba(79, 38, 131, 0.4);
      border-radius: 12px;
      padding: 15px;
      border: 3px solid #666;
      text-align: center;
      transition: all 0.3s;
    }

    .symbol-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
    }

    .symbol-card.jackpot {
      border-color: #FFD700;
      background: rgba(255, 215, 0, 0.15);
    }

    .symbol-card.high {
      border-color: #FF6B6B;
    }

    .symbol-card.medium {
      border-color: #4ECDC4;
    }

    .symbol-card.low {
      border-color: #95E1D3;
    }

    .symbol-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }

    .symbol-name {
      font-size: 12px;
      color: #FFC62F;
      font-weight: bold;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .symbol-pays {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .pay-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
    }

    .pay-line .count {
      color: #bbb;
      font-weight: bold;
    }

    .pay-line strong {
      color: #4CAF50;
      font-size: 14px;
    }

    /* Paylines Visualization */
    .paylines-info {
      color: #bbb;
      text-align: center;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .paylines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 10px;
    }

    .payline-visual {
      background: rgba(79, 38, 131, 0.3);
      border: 2px solid #4F2683;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .payline-visual:hover, .payline-visual.active {
      border-color: #FFC62F;
      background: rgba(255, 198, 47, 0.2);
      transform: scale(1.05);
    }

    .line-number {
      font-size: 12px;
      font-weight: bold;
      color: #FFC62F;
      margin-bottom: 8px;
      text-align: center;
    }

    .mini-grid {
      display: flex;
      gap: 3px;
      justify-content: center;
    }

    .mini-reel {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .mini-cell {
      width: 18px;
      height: 18px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid #666;
      border-radius: 3px;
    }

    .mini-cell.active {
      background: #FFC62F;
      border-color: #FFC62F;
      box-shadow: 0 0 8px #FFC62F;
    }

    /* Rules List */
    .rules-list {
      padding-left: 20px;
      color: #ccc;
      font-size: 15px;
      line-height: 2;
    }

    .rules-list li {
      margin-bottom: 10px;
      padding-left: 10px;
    }

    /* Provably Fair Section */
    .provably-fair {
      background: rgba(79, 38, 131, 0.3);
      padding: 20px;
      border-radius: 12px;
      border: 2px solid #4F2683;
    }

    .fair-desc {
      color: #bbb;
      text-align: center;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .fair-info {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .fair-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .fair-item strong {
      color: #FFC62F;
      font-size: 14px;
    }

    .fair-item code {
      background: rgba(0, 0, 0, 0.5);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #4CAF50;
      word-break: break-all;
    }

    .fair-item code.hash {
      font-size: 10px;
    }

    .btn-regenerate {
      background: linear-gradient(180deg, #4F2683 0%, #3a1c61 100%);
      color: #FFC62F;
      border: 2px solid #FFC62F;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      width: fit-content;
    }

    .btn-regenerate:hover {
      background: linear-gradient(180deg, #5a2d94 0%, #4F2683 100%);
      box-shadow: 0 0 10px rgba(255, 198, 47, 0.5);
    }

    .fair-note {
      color: #999;
      font-size: 12px;
      margin-top: 15px;
      text-align: center;
      font-style: italic;
    }

    .btn-close {
      width: 100%;
      background: linear-gradient(180deg, #4F2683 0%, #3a1c61 100%);
      color: #FFC62F;
      border: 2px solid #FFC62F;
      padding: 15px;
      font-size: 18px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 30px;
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
      position: relative;
    }

    #logo {
      color: #FFC62F;
      font-size: 28px;
      font-weight: bold;
      text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
      letter-spacing: 3px;
    }

    #fairness-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: rgba(76, 175, 80, 0.2);
      border: 2px solid #4CAF50;
      color: #4CAF50;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }

    #fairness-badge:hover {
      background: rgba(76, 175, 80, 0.3);
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
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
      will-change: transform;
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

    @media (max-width: 768px) {
      .symbols-grid {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }

      .paylines-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      }

      #fairness-badge {
        position: static;
        margin-top: 10px;
        display: inline-block;
      }
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
  
  // IMPROVED PAYTABLE - Doubled all payouts for better rewards
  private readonly PAYTABLE: {[key: string]: {[key: number]: number}} = {
    '🏆': { 5: 2000, 4: 400, 3: 80, 2: 10 },
    '🏈': { 5: 1000, 4: 200, 3: 50, 2: 5 },
    '⚔️': { 5: 600, 4: 150, 3: 40, 2: 4 },
    '🛡️': { 5: 400, 4: 100, 3: 25, 2: 3 },
    '👑': { 5: 300, 4: 80, 3: 20, 2: 2 },
    '⚡': { 5: 200, 4: 50, 3: 15 },
    '💜': { 5: 150, 4: 40, 3: 10 },
    'V': { 5: 100, 4: 30, 3: 8 }
  };

  readonly PAYLINES = [
    [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2],
    [0, 1, 1, 1, 0], [2, 1, 1, 1, 2], [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2], [0, 1, 0, 1, 0], [2, 1, 2, 1, 2],
    [0, 0, 1, 2, 2], [2, 2, 1, 0, 0], [1, 0, 1, 2, 1],
    [1, 2, 1, 0, 1], [0, 1, 0, 2, 0], [2, 1, 2, 0, 2],
    [0, 0, 0, 1, 2], [2, 2, 2, 1, 0], [1, 0, 0, 0, 1],
    [1, 2, 2, 2, 1], [0, 2, 0, 2, 0], [2, 0, 2, 0, 2],
    [0, 1, 2, 0, 1], [2, 1, 0, 2, 1], [1, 0, 1, 0, 1],
    [1, 2, 1, 2, 1]
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
  highlightedPayline: number | null = null;

  // Provably Fair System
  clientSeed: string = '';
  serverSeed: string = '';
  spinNonce: number = 0;
  lastSpinHash: string = '';

  reels: Reel[] = [];
  private reelsInitialized = false;
  private userId: string = '';

  constructor(
    private router: Router,
    private creditsService: CreditsService,
    private auth: Auth
  ) {
    this.reels = Array(5).fill(null).map((_, index) => ({
      symbols: this.REEL_STRIPS[index] ? [...this.REEL_STRIPS[index], ...this.REEL_STRIPS[index], ...this.REEL_STRIPS[index]] : [],
      element: null,
      position: 0
    }));

    // Initialize provably fair seeds
    this.clientSeed = this.generateRandomSeed();
    this.serverSeed = this.generateRandomSeed();
  }

  ngOnInit() {
    this.loadUserCredits();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initReels();
      setTimeout(() => {
        if (!this.reelsInitialized) {
          console.warn('Reels not initialized, retrying...');
          this.initReels();
        }
      }, 300);
    }, 150);
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

  highlightPayline(index: number) {
    this.highlightedPayline = this.highlightedPayline === index ? null : index;
  }

  scrollToFairness() {
    setTimeout(() => {
      const fairSection = document.querySelector('.provably-fair');
      if (fairSection) {
        fairSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  // Provably Fair Functions
  private generateRandomSeed(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  regenerateClientSeed() {
    this.clientSeed = this.generateRandomSeed();
    this.spinNonce = 0;
  }

  private async generateHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async generateProvablyFairResult(): Promise<number[]> {
    this.spinNonce++;
    const combinedSeed = `${this.serverSeed}:${this.clientSeed}:${this.spinNonce}`;
    this.lastSpinHash = await this.generateHash(combinedSeed);
    
    // Use hash to generate 5 deterministic reel positions
    const positions: number[] = [];
    for (let i = 0; i < 5; i++) {
      const hashSegment = this.lastSpinHash.substring(i * 12, (i + 1) * 12);
      const numericValue = parseInt(hashSegment, 16);
      const position = numericValue % this.REEL_STRIPS[i].length;
      positions.push(position);
    }
    
    return positions;
  }

  private initReels() {
    let allFound = true;
    
    for (let index = 0; index < 5; index++) {
      const reelElement = document.getElementById('reel-' + index);
      
      if (!reelElement) {
        console.error(`Reel element not found: reel-${index}`);
        allFound = false;
        continue;
      }
      
      this.reels[index].element = reelElement;
      this.reels[index].position = 0;
      
      reelElement.style.transform = 'translateY(0px)';
      reelElement.style.transition = 'none';
      reelElement.style.willChange = 'transform';
    }
    
    this.reelsInitialized = allFound;
    
    if (allFound) {
      console.log('All reels initialized successfully');
    } else {
      console.error('Some reels failed to initialize');
    }
  }

  async spin() {
    if (this.isSpinning || this.balance < this.currentBet * 25 || !this.reelsInitialized) {
      if (!this.reelsInitialized) {
        console.error('Cannot spin: reels not initialized');
      }
      return;
    }

    this.isSpinning = true;
    this.balance -= this.currentBet * 25;
    this.lastWin = 0;
    this.winningReels.clear();
    this.winningLines.clear();
    this.currentWins = [];

    // Generate provably fair results
    const targetPositions = await this.generateProvablyFairResult();

    const spinPromises: Promise<void>[] = [];

    for (let index = 0; index < 5; index++) {
      const reel = this.reels[index];
      const reelElement = reel.element;
      
      if (!reelElement) {
        console.error(`Cannot spin reel ${index}: element not found`);
        continue;
      }

      const promise = new Promise<void>(resolve => {
        reelElement.style.transition = 'none';
        
        const stripLength = this.REEL_STRIPS[index].length;
        const spins = 3 + (index * 0.5);
        const targetPos = targetPositions[index] + Math.floor(stripLength * spins);
        const startPos = reel.position;
        const duration = 2000 + (index * 200);
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentPos = startPos + (targetPos - startPos) * easeOut;
          const pixels = currentPos * this.SYMBOL_HEIGHT;
          
          reelElement.style.transform = `translateY(-${pixels}px)`;

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            const normalizedPos = targetPos % stripLength;
            reel.position = normalizedPos;
            
            const finalPixels = normalizedPos * this.SYMBOL_HEIGHT;
            reelElement.style.transform = `translateY(-${finalPixels}px)`;
            
            resolve();
          }
        };

        setTimeout(() => requestAnimationFrame(animate), index * 150);
      });

      spinPromises.push(promise);
    }

    Promise.all(spinPromises).then(() => {
      this.checkWin();
      this.isSpinning = false;
    });
  }

  private getVisibleSymbols(): string[][] {
    const grid: string[][] = [];
    
    for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
      const reel = this.reels[reelIndex];
      const column: string[] = [];
      const basePos = Math.floor(reel.position);
      const stripLength = this.REEL_STRIPS[reelIndex].length;
      
      for (let i = 0; i < this.VISIBLE_SYMBOLS; i++) {
        const index = (basePos + i) % stripLength;
        column.push(this.REEL_STRIPS[reelIndex][index]);
      }
      
      grid.push(column);
    }
    
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

      if (count >= 2 && this.PAYTABLE[symbol]?.[count]) {
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

    if (multiplier >= 100) {
      this.winTitle = '💎🏆 LEGENDARY WIN! 🏆💎';
    } else if (multiplier >= 50) {
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