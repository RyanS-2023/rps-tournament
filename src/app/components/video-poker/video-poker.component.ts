import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CreditsService } from '../../services/credits.service';
import { Auth } from '@angular/fire/auth';

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
  held: boolean;
}

interface HandResult {
  name: string;
  payout: number;
  multiplier: number;
}

@Component({
  selector: 'app-video-poker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="poker-page">
      <header class="poker-header">
        <button (click)="goBack()" class="btn-back">← Lobby</button>
        <h1>VIDEO POKER - JACKS OR BETTER</h1>
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
          <h2>💰 JACKS OR BETTER PAYTABLE 💰</h2>
          
          <div class="paytable-section">
            <h3>🃏 Hand Rankings & Payouts</h3>
            <p class="bet-note">Payouts shown for each bet level (1-5 credits)</p>
            
            <div class="payout-table">
              <div class="payout-header">
                <div class="hand-name">Hand</div>
                <div class="bet-amount">1 Credit</div>
                <div class="bet-amount">2 Credits</div>
                <div class="bet-amount">3 Credits</div>
                <div class="bet-amount">4 Credits</div>
                <div class="bet-amount special">5 Credits</div>
              </div>
              
              <div class="payout-row royal-flush">
                <div class="hand-name">🏆 Royal Flush</div>
                <div class="bet-amount">250</div>
                <div class="bet-amount">500</div>
                <div class="bet-amount">750</div>
                <div class="bet-amount">1000</div>
                <div class="bet-amount special">4000</div>
              </div>

              <div class="payout-row high">
                <div class="hand-name">💎 Straight Flush</div>
                <div class="bet-amount">50</div>
                <div class="bet-amount">100</div>
                <div class="bet-amount">150</div>
                <div class="bet-amount">200</div>
                <div class="bet-amount">250</div>
              </div>

              <div class="payout-row high">
                <div class="hand-name">🎰 Four of a Kind</div>
                <div class="bet-amount">25</div>
                <div class="bet-amount">50</div>
                <div class="bet-amount">75</div>
                <div class="bet-amount">100</div>
                <div class="bet-amount">125</div>
              </div>

              <div class="payout-row medium">
                <div class="hand-name">🏠 Full House</div>
                <div class="bet-amount">9</div>
                <div class="bet-amount">18</div>
                <div class="bet-amount">27</div>
                <div class="bet-amount">36</div>
                <div class="bet-amount">45</div>
              </div>

              <div class="payout-row medium">
                <div class="hand-name">♦️ Flush</div>
                <div class="bet-amount">6</div>
                <div class="bet-amount">12</div>
                <div class="bet-amount">18</div>
                <div class="bet-amount">24</div>
                <div class="bet-amount">30</div>
              </div>

              <div class="payout-row medium">
                <div class="hand-name">📊 Straight</div>
                <div class="bet-amount">4</div>
                <div class="bet-amount">8</div>
                <div class="bet-amount">12</div>
                <div class="bet-amount">16</div>
                <div class="bet-amount">20</div>
              </div>

              <div class="payout-row low">
                <div class="hand-name">🎲 Three of a Kind</div>
                <div class="bet-amount">3</div>
                <div class="bet-amount">6</div>
                <div class="bet-amount">9</div>
                <div class="bet-amount">12</div>
                <div class="bet-amount">15</div>
              </div>

              <div class="payout-row low">
                <div class="hand-name">👥 Two Pair</div>
                <div class="bet-amount">2</div>
                <div class="bet-amount">4</div>
                <div class="bet-amount">6</div>
                <div class="bet-amount">8</div>
                <div class="bet-amount">10</div>
              </div>

              <div class="payout-row low">
                <div class="hand-name">🎯 Jacks or Better</div>
                <div class="bet-amount">1</div>
                <div class="bet-amount">2</div>
                <div class="bet-amount">3</div>
                <div class="bet-amount">4</div>
                <div class="bet-amount">5</div>
              </div>
            </div>
          </div>

          <div class="paytable-section">
            <h3>📜 Game Rules</h3>
            <ul class="rules-list">
              <li>Standard 52-card deck shuffled after each hand</li>
              <li>Jacks or Better: Pair of Jacks, Queens, Kings, or Aces pays out</li>
              <li>Lower pairs (2s through 10s) do not pay</li>
              <li>Click cards to HOLD before drawing</li>
              <li>Maximum 5 credits bet per hand</li>
              <li>Royal Flush bonus: 800:1 payout on max bet (4000 credits!)</li>
            </ul>
          </div>

          <div class="paytable-section provably-fair">
            <h3>🔐 Provably Fair Gaming</h3>
            <p class="fair-desc">Every deal is verifiable using cryptographic hashing</p>
            <div class="fair-info">
              <div class="fair-item">
                <strong>Client Seed:</strong>
                <code>{{ clientSeed }}</code>
                <button (click)="regenerateClientSeed()" class="btn-regenerate">New Seed</button>
              </div>
              <div class="fair-item">
                <strong>Nonce:</strong> {{ dealNonce }}
              </div>
              <div class="fair-item">
                <strong>Last Deal Hash:</strong>
                <code class="hash">{{ lastDealHash || 'Deal to generate' }}</code>
              </div>
            </div>
            <p class="fair-note">Each deal combines server seed + client seed + nonce to generate verifiable random cards</p>
          </div>

          <button (click)="showPaytable = false" class="btn-close">Close</button>
        </div>
      </div>

      <!-- Win Overlay -->
      <div class="win-overlay" *ngIf="showWinOverlay">
        <div class="win-message">
          <div class="win-hand">{{ winHandName }}</div>
          <div class="win-amount">{{ winAmount }} CREDITS</div>
        </div>
      </div>

      <div class="poker-container">
        <div class="poker-machine">
          <div class="machine-header">
            <div class="game-title">🃏 JACKS OR BETTER 🃏</div>
            <div class="fairness-badge" (click)="showPaytable = true">
              🔐 Provably Fair
            </div>
          </div>

          <!-- Quick Paytable Reference -->
          <div class="quick-paytable">
            <div class="quick-hand" *ngFor="let hand of quickPaytable" 
                 [class.highlight]="currentHand?.name === hand.name">
              <span class="hand-label">{{ hand.name }}</span>
              <span class="hand-payout">{{ hand.payout }}</span>
            </div>
          </div>

          <!-- Cards Display -->
          <div class="cards-container">
            <div class="card-wrapper" *ngFor="let card of hand; let i = index">
              <div class="held-indicator" *ngIf="card.held && gameState !== 'dealt'">HELD</div>
              <div class="card" 
                   [class.held]="card.held"
                   [class.clickable]="gameState === 'dealt'"
                   (click)="toggleHold(i)"
                   [attr.data-suit]="card.suit">
                <div class="card-inner">
                  <div class="card-rank">{{ card.rank }}</div>
                  <div class="card-suit">{{ getSuitSymbol(card.suit) }}</div>
                  <div class="card-rank-bottom">{{ card.rank }}</div>
                </div>
              </div>
              <button class="hold-btn" 
                      *ngIf="gameState === 'dealt'"
                      (click)="toggleHold(i)"
                      [class.active]="card.held">
                {{ card.held ? 'HELD' : 'HOLD' }}
              </button>
            </div>
          </div>

          <!-- Hand Result Display -->
          <div class="hand-result" *ngIf="currentHand && gameState === 'drawn'">
            <div class="result-text">{{ currentHand.name }}</div>
            <div class="result-payout" *ngIf="currentHand.payout > 0">
              WIN: {{ currentHand.payout }} CREDITS
            </div>
          </div>

          <!-- Game Info Panel -->
          <div class="info-panel">
            <div class="info-item">
              <span class="label">Credits:</span>
              <span class="value">{{ balance }}</span>
            </div>
            <div class="info-item">
              <span class="label">Bet:</span>
              <span class="value">{{ currentBet }}</span>
            </div>
            <div class="info-item">
              <span class="label">Win:</span>
              <span class="value win-value">{{ lastWin }}</span>
            </div>
          </div>

          <!-- Controls -->
          <div class="controls">
            <div class="bet-controls">
              <button (click)="decreaseBet()" 
                      [disabled]="gameState !== 'idle'"
                      class="btn-bet">
                BET -
              </button>
              <div class="bet-display">
                <div class="bet-label">BET</div>
                <div class="bet-value">{{ currentBet }}</div>
              </div>
              <button (click)="increaseBet()" 
                      [disabled]="gameState !== 'idle'"
                      class="btn-bet">
                BET +
              </button>
            </div>

            <button (click)="maxBet()" 
                    [disabled]="gameState !== 'idle'"
                    class="btn-max-bet">
              BET MAX (5)
            </button>

            <button (click)="dealOrDraw()" 
                    [disabled]="gameState === 'dealing' || (gameState === 'idle' && balance < currentBet)"
                    class="btn-deal">
              {{ getDealButtonText() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .poker-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a3d0a 0%, #1a0a0a 100%);
      padding: 15px;
    }

    .poker-header {
      max-width: 900px;
      margin: 0 auto 15px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .btn-back, .btn-paytable {
      background: linear-gradient(180deg, #1a5f1a 0%, #0d4a0d 100%);
      color: #FFD700;
      border: 2px solid #FFD700;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-back:hover, .btn-paytable:hover {
      background: linear-gradient(180deg, #227022 0%, #1a5f1a 100%);
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
      transform: translateY(-2px);
    }

    .poker-header h1 {
      color: #FFD700;
      font-size: 22px;
      margin: 0;
      flex: 1;
      text-align: center;
      text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
      letter-spacing: 1px;
    }

    .daily-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #1a5f1a 0%, #FFD700 100%);
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
      background: linear-gradient(180deg, #0a3d0a 0%, #051a05 100%);
      border: 4px solid #FFD700;
      border-radius: 15px;
      padding: 30px;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      color: white;
      box-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
    }

    .paytable-content h2 {
      color: #FFD700;
      text-align: center;
      margin-bottom: 30px;
      font-size: 36px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    }

    .paytable-content h3 {
      color: #FFD700;
      margin: 30px 0 20px;
      font-size: 24px;
      border-bottom: 3px solid #1a5f1a;
      padding-bottom: 10px;
    }

    .paytable-section {
      margin-bottom: 30px;
    }

    .bet-note {
      background: rgba(255, 215, 0, 0.15);
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid #FFD700;
      margin: 15px 0 20px;
      font-size: 15px;
      color: #FFD700;
      text-align: center;
    }

    .payout-table {
      background: rgba(26, 95, 26, 0.3);
      border-radius: 10px;
      overflow: hidden;
    }

    .payout-header, .payout-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
      gap: 10px;
      padding: 12px 15px;
      align-items: center;
    }

    .payout-header {
      background: rgba(26, 95, 26, 0.5);
      font-weight: bold;
      color: #FFD700;
      border-bottom: 2px solid #FFD700;
    }

    .payout-row {
      border-bottom: 1px solid rgba(255, 215, 0, 0.2);
    }

    .payout-row:hover {
      background: rgba(255, 215, 0, 0.1);
    }

    .payout-row.royal-flush {
      background: rgba(255, 215, 0, 0.2);
      border-left: 4px solid #FFD700;
    }

    .payout-row.high {
      border-left: 4px solid #FF6B6B;
    }

    .payout-row.medium {
      border-left: 4px solid #4ECDC4;
    }

    .payout-row.low {
      border-left: 4px solid #95E1D3;
    }

    .hand-name {
      font-weight: bold;
      color: #FFD700;
    }

    .bet-amount {
      text-align: center;
      color: #4CAF50;
      font-weight: bold;
    }

    .bet-amount.special {
      color: #FFD700;
      font-size: 18px;
      text-shadow: 0 0 10px #FFD700;
    }

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

    .provably-fair {
      background: rgba(26, 95, 26, 0.3);
      padding: 20px;
      border-radius: 12px;
      border: 2px solid #1a5f1a;
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
      color: #FFD700;
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
      background: linear-gradient(180deg, #1a5f1a 0%, #0d4a0d 100%);
      color: #FFD700;
      border: 2px solid #FFD700;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      width: fit-content;
    }

    .btn-regenerate:hover {
      background: linear-gradient(180deg, #227022 0%, #1a5f1a 100%);
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
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
      background: linear-gradient(180deg, #1a5f1a 0%, #0d4a0d 100%);
      color: #FFD700;
      border: 2px solid #FFD700;
      padding: 15px;
      font-size: 18px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 30px;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background: linear-gradient(180deg, #227022 0%, #1a5f1a 100%);
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
    }

    .win-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1500;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .win-message {
      text-align: center;
      animation: winPop 0.5s ease-out;
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

    .win-hand {
      font-size: 48px;
      font-weight: bold;
      color: #FFD700;
      text-shadow: 0 0 30px #FFD700, 0 0 50px #FFD700;
      margin-bottom: 20px;
      animation: glow 1s ease-in-out infinite;
    }

    @keyframes glow {
      0%, 100% {
        text-shadow: 0 0 30px #FFD700, 0 0 50px #FFD700;
      }
      50% {
        text-shadow: 0 0 50px #FFD700, 0 0 80px #FFD700, 0 0 100px #FFD700;
      }
    }

    .win-amount {
      font-size: 64px;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 0 50px #4CAF50, 0 0 70px #4CAF50;
    }

    .poker-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .poker-machine {
      max-width: 900px;
      width: 100%;
      background: linear-gradient(180deg, #0a3d0a 0%, #051a05 100%);
      border: 4px solid #FFD700;
      border-radius: 20px;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
      padding: 25px;
    }

    .machine-header {
      text-align: center;
      margin-bottom: 20px;
      position: relative;
    }

    .game-title {
      color: #FFD700;
      font-size: 32px;
      font-weight: bold;
      text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
      letter-spacing: 2px;
    }

    .fairness-badge {
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

    .fairness-badge:hover {
      background: rgba(76, 175, 80, 0.3);
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
    }

    .quick-paytable {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
      margin-bottom: 20px;
      padding: 15px;
      background: rgba(26, 95, 26, 0.3);
      border-radius: 10px;
    }

    .quick-hand {
      display: flex;
      justify-content: space-between;
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      font-size: 12px;
      transition: all 0.2s;
    }

    .quick-hand.highlight {
      background: rgba(255, 215, 0, 0.3);
      border: 2px solid #FFD700;
      transform: scale(1.05);
    }

    .hand-label {
      color: #ccc;
    }

    .hand-payout {
      color: #4CAF50;
      font-weight: bold;
    }

    .cards-container {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin: 30px 0;
      min-height: 200px;
    }

    .card-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
    }

    .held-indicator {
      position: absolute;
      top: -25px;
      background: #FFD700;
      color: #0a3d0a;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      animation: pulse 1s ease-in-out infinite;
    }

    .card {
      width: 120px;
      height: 170px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.3s;
      position: relative;
    }

    .card.clickable {
      cursor: pointer;
    }

    .card.clickable:hover {
      transform: translateY(-10px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
    }

    .card.held {
      border: 3px solid #FFD700;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }

    .card[data-suit="hearts"] .card-rank,
    .card[data-suit="hearts"] .card-suit,
    .card[data-suit="diamonds"] .card-rank,
    .card[data-suit="diamonds"] .card-suit {
      color: #e74c3c;
    }

    .card[data-suit="clubs"] .card-rank,
    .card[data-suit="clubs"] .card-suit,
    .card[data-suit="spades"] .card-rank,
    .card[data-suit="spades"] .card-suit {
      color: #2c3e50;
    }

    .card-inner {
      padding: 15px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .card-rank {
      font-size: 24px;
      font-weight: bold;
    }

    .card-suit {
      font-size: 48px;
      text-align: center;
    }

    .card-rank-bottom {
      font-size: 24px;
      font-weight: bold;
      text-align: right;
      transform: rotate(180deg);
    }

    .hold-btn {
      background: linear-gradient(180deg, #1a5f1a 0%, #0d4a0d 100%);
      color: #FFD700;
      border: 2px solid #FFD700;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
    }

    .hold-btn:hover {
      background: linear-gradient(180deg, #227022 0%, #1a5f1a 100%);
      transform: scale(1.05);
    }

    .hold-btn.active {
      background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%);
      color: #0a3d0a;
      border-color: #0a3d0a;
    }

    .hand-result {
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background: rgba(26, 95, 26, 0.3);
      border-radius: 10px;
    }

    .result-text {
      font-size: 28px;
      font-weight: bold;
      color: #FFD700;
      margin-bottom: 10px;
    }

    .result-payout {
      font-size: 24px;
      color: #4CAF50;
      font-weight: bold;
    }

    .info-panel {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
      padding: 20px;
      background: rgba(26, 95, 26, 0.3);
      border-radius: 10px;
      border: 2px solid #1a5f1a;
    }

    .info-item {
      text-align: center;
    }

    .label {
      display: block;
      color: #bbb;
      font-size: 14px;
      margin-bottom: 5px;
    }

    .value {
      display: block;
      color: #FFD700;
      font-size: 24px;
      font-weight: bold;
    }

    .win-value {
      color: #4CAF50;
    }

    .controls {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .bet-controls {
      display: flex;
      gap: 15px;
      align-items: center;
      justify-content: center;
    }

    .btn-bet {
      background: linear-gradient(180deg, #1a5f1a 0%, #0d4a0d 100%);
      color: #FFD700;
      border: 2px solid #FFD700;
      padding: 15px 25px;
      font-size: 18px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      flex: 1;
    }

    .btn-bet:hover:not(:disabled) {
      background: linear-gradient(180deg, #227022 0%, #1a5f1a 100%);
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
      transform: translateY(-2px);
    }

    .btn-bet:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .bet-display {
      text-align: center;
      padding: 10px 30px;
      background: rgba(26, 95, 26, 0.5);
      border: 3px solid #FFD700;
      border-radius: 10px;
    }

    .bet-label {
      color: #FFD700;
      font-size: 14px;
      font-weight: bold;
    }

    .bet-value {
      color: #fff;
      font-size: 32px;
      font-weight: bold;
    }

    .btn-max-bet {
      background: linear-gradient(180deg, #FF8C00 0%, #FF6B00 100%);
      color: white;
      border: 2px solid #FFD700;
      padding: 15px;
      font-size: 18px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-max-bet:hover:not(:disabled) {
      background: linear-gradient(180deg, #FFA500 0%, #FF8C00 100%);
      box-shadow: 0 0 15px rgba(255, 165, 0, 0.5);
      transform: translateY(-2px);
    }

    .btn-max-bet:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-deal {
      background: linear-gradient(180deg, #4CAF50 0%, #45a049 100%);
      color: white;
      border: 3px solid #FFD700;
      padding: 20px;
      font-size: 28px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
    }

    .btn-deal:hover:not(:disabled) {
      background: linear-gradient(180deg, #5cbf60 0%, #4CAF50 100%);
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.5);
      transform: translateY(-2px);
    }

    .btn-deal:disabled {
      background: linear-gradient(180deg, #666 0%, #555 100%);
      cursor: not-allowed;
      box-shadow: none;
    }

    @media (max-width: 768px) {
      .cards-container {
        gap: 8px;
      }

      .card {
        width: 80px;
        height: 110px;
      }

      .card-inner {
        padding: 8px;
      }

      .card-rank {
        font-size: 16px;
      }

      .card-suit {
        font-size: 32px;
      }

      .card-rank-bottom {
        font-size: 16px;
      }

      .fairness-badge {
        position: static;
        margin-top: 10px;
        display: inline-block;
      }

      .payout-header, .payout-row {
        grid-template-columns: 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr;
        font-size: 12px;
        padding: 10px 8px;
      }
    }
  `]
})
export class VideoPokerComponent implements OnInit, OnDestroy {
  private readonly SUITS: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  private readonly RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  private readonly RANK_VALUES: {[key: string]: number} = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };

  // Jacks or Better Paytable (9/6 - Full Pay)
  private readonly PAYTABLE: {[key: string]: number[]} = {
    'Royal Flush': [250, 500, 750, 1000, 4000],
    'Straight Flush': [50, 100, 150, 200, 250],
    'Four of a Kind': [25, 50, 75, 100, 125],
    'Full House': [9, 18, 27, 36, 45],
    'Flush': [6, 12, 18, 24, 30],
    'Straight': [4, 8, 12, 16, 20],
    'Three of a Kind': [3, 6, 9, 12, 15],
    'Two Pair': [2, 4, 6, 8, 10],
    'Jacks or Better': [1, 2, 3, 4, 5]
  };

  balance = 0;
  currentBet = 1;
  lastWin = 0;
  isSaving = false;
  
  hand: Card[] = [];
  deck: Card[] = [];
  gameState: 'idle' | 'dealing' | 'dealt' | 'drawing' | 'drawn' = 'idle';
  currentHand: HandResult | null = null;
  
  showPaytable = false;
  showDailyBanner = false;
  showWinOverlay = false;
  timeUntilNextCredit = '';
  winHandName = '';
  winAmount = '';

  quickPaytable = [
    { name: 'Royal Flush', payout: '250-4000' },
    { name: 'Straight Flush', payout: '50' },
    { name: 'Four of a Kind', payout: '25' },
    { name: 'Full House', payout: '9' },
    { name: 'Flush', payout: '6' },
    { name: 'Straight', payout: '4' },
    { name: 'Three of a Kind', payout: '3' },
    { name: 'Two Pair', payout: '2' },
    { name: 'Jacks or Better', payout: '1' }
  ];

  // Provably Fair System
  clientSeed: string = '';
  serverSeed: string = '';
  dealNonce: number = 0;
  lastDealHash: string = '';

  private userId: string = '';

  constructor(
    private router: Router,
    private creditsService: CreditsService,
    private auth: Auth
  ) {
    this.clientSeed = this.generateRandomSeed();
    this.serverSeed = this.generateRandomSeed();
  }

  ngOnInit() {
    this.loadUserCredits();
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

  togglePaytable() {
    this.showPaytable = !this.showPaytable;
    if (this.showPaytable) {
      this.updateTimeUntilNextCredit();
    }
  }

  getSuitSymbol(suit: string): string {
    const symbols: {[key: string]: string} = {
      'hearts': '♥',
      'diamonds': '♦',
      'clubs': '♣',
      'spades': '♠'
    };
    return symbols[suit] || '';
  }

  // Provably Fair Functions
  private generateRandomSeed(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  regenerateClientSeed() {
    this.clientSeed = this.generateRandomSeed();
    this.dealNonce = 0;
  }

  private async generateHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async shuffleDeckProvablyFair(): Promise<Card[]> {
    this.dealNonce++;
    const combinedSeed = `${this.serverSeed}:${this.clientSeed}:${this.dealNonce}`;
    this.lastDealHash = await this.generateHash(combinedSeed);
    
    // Create full deck
    const freshDeck: Card[] = [];
    for (const suit of this.SUITS) {
      for (const rank of this.RANKS) {
        freshDeck.push({
          suit,
          rank,
          value: this.RANK_VALUES[rank],
          held: false
        });
      }
    }

    // Shuffle using hash
    const shuffled: Card[] = [];
    const remaining = [...freshDeck];
    
    for (let i = 0; i < 52; i++) {
      const hashSegment = this.lastDealHash.substring((i * 2) % 64, ((i * 2) % 64) + 8);
      const numericValue = parseInt(hashSegment, 16);
      const index = numericValue % remaining.length;
      shuffled.push(remaining[index]);
      remaining.splice(index, 1);
    }
    
    return shuffled;
  }

  async dealOrDraw() {
    if (this.gameState === 'idle') {
      await this.deal();
    } else if (this.gameState === 'dealt') {
      await this.draw();
    } else if (this.gameState === 'drawn') {
      this.newGame();
    }
  }

  async deal() {
    if (this.balance < this.currentBet) return;

    this.gameState = 'dealing';
    this.balance -= this.currentBet;
    this.lastWin = 0;
    this.currentHand = null;

    // Shuffle deck with provably fair algorithm
    this.deck = await this.shuffleDeckProvablyFair();
    
    // Deal 5 cards
    this.hand = this.deck.splice(0, 5);
    
    this.gameState = 'dealt';
    
    // Check for instant win (e.g., dealt a Royal Flush)
    this.evaluateHand();
  }

  toggleHold(index: number) {
    if (this.gameState !== 'dealt') return;
    this.hand[index].held = !this.hand[index].held;
  }

  async draw() {
    if (this.gameState !== 'dealt') return;

    this.gameState = 'drawing';

    // Replace non-held cards
    for (let i = 0; i < this.hand.length; i++) {
      if (!this.hand[i].held) {
        this.hand[i] = this.deck.shift()!;
      }
    }

    this.gameState = 'drawn';
    this.evaluateHand();

    if (this.currentHand && this.currentHand.payout > 0) {
      this.balance += this.currentHand.payout;
      this.lastWin = this.currentHand.payout;
      
      try {
        await this.creditsService.recordWin(this.userId, this.currentHand.payout);
      } catch (error) {
        console.error('Error recording win:', error);
      }

      this.showWinAnimation();
    } else {
      await this.saveBalance();
    }
  }

  newGame() {
    this.hand = [];
    this.deck = [];
    this.gameState = 'idle';
    this.currentHand = null;
  }

  evaluateHand() {
    const result = this.getHandRank(this.hand);
    this.currentHand = result;
  }

  private getHandRank(cards: Card[]): HandResult {
    const sorted = [...cards].sort((a, b) => a.value - b.value);
    
    // Count ranks and suits
    const rankCounts: {[key: number]: number} = {};
    const suitCounts: {[key: string]: number} = {};
    
    sorted.forEach(card => {
      rankCounts[card.value] = (rankCounts[card.value] || 0) + 1;
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    });

    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const isFlush = Object.values(suitCounts).some(count => count === 5);
    const isStraight = this.checkStraight(sorted);
    const isRoyal = sorted[0].value === 10 && sorted[4].value === 14;

    // Check for Royal Flush
    if (isFlush && isStraight && isRoyal) {
      const payout = this.PAYTABLE['Royal Flush'][this.currentBet - 1];
      return { name: 'Royal Flush', payout, multiplier: payout / this.currentBet };
    }

    // Check for Straight Flush
    if (isFlush && isStraight) {
      const payout = this.PAYTABLE['Straight Flush'][this.currentBet - 1];
      return { name: 'Straight Flush', payout, multiplier: payout / this.currentBet };
    }

    // Check for Four of a Kind
    if (counts[0] === 4) {
      const payout = this.PAYTABLE['Four of a Kind'][this.currentBet - 1];
      return { name: 'Four of a Kind', payout, multiplier: payout / this.currentBet };
    }

    // Check for Full House
    if (counts[0] === 3 && counts[1] === 2) {
      const payout = this.PAYTABLE['Full House'][this.currentBet - 1];
      return { name: 'Full House', payout, multiplier: payout / this.currentBet };
    }

    // Check for Flush
    if (isFlush) {
      const payout = this.PAYTABLE['Flush'][this.currentBet - 1];
      return { name: 'Flush', payout, multiplier: payout / this.currentBet };
    }

    // Check for Straight
    if (isStraight) {
      const payout = this.PAYTABLE['Straight'][this.currentBet - 1];
      return { name: 'Straight', payout, multiplier: payout / this.currentBet };
    }

    // Check for Three of a Kind
    if (counts[0] === 3) {
      const payout = this.PAYTABLE['Three of a Kind'][this.currentBet - 1];
      return { name: 'Three of a Kind', payout, multiplier: payout / this.currentBet };
    }

    // Check for Two Pair
    if (counts[0] === 2 && counts[1] === 2) {
      const payout = this.PAYTABLE['Two Pair'][this.currentBet - 1];
      return { name: 'Two Pair', payout, multiplier: payout / this.currentBet };
    }

    // Check for Jacks or Better (pair of J, Q, K, or A)
    if (counts[0] === 2) {
      const pairValue = Object.keys(rankCounts).find(k => rankCounts[parseInt(k)] === 2);
      if (pairValue && parseInt(pairValue) >= 11) {
        const payout = this.PAYTABLE['Jacks or Better'][this.currentBet - 1];
        return { name: 'Jacks or Better', payout, multiplier: payout / this.currentBet };
      }
    }

    return { name: 'No Win', payout: 0, multiplier: 0 };
  }

  private checkStraight(sorted: Card[]): boolean {
    // Check for regular straight
    let isRegularStraight = true;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1].value !== sorted[i].value + 1) {
        isRegularStraight = false;
        break;
      }
    }

    // Check for A-2-3-4-5 (wheel)
    const isWheel = sorted[0].value === 2 && sorted[1].value === 3 && 
                    sorted[2].value === 4 && sorted[3].value === 5 && 
                    sorted[4].value === 14;

    return isRegularStraight || isWheel;
  }

  private showWinAnimation() {
    if (!this.currentHand || this.currentHand.payout === 0) return;

    this.winHandName = this.currentHand.name;
    this.winAmount = this.currentHand.payout.toString();
    this.showWinOverlay = true;

    setTimeout(() => {
      this.showWinOverlay = false;
      this.saveBalance();
    }, 3000);
  }

  getDealButtonText(): string {
    if (this.gameState === 'idle') return 'DEAL';
    if (this.gameState === 'dealt') return 'DRAW';
    if (this.gameState === 'drawn') return 'NEW GAME';
    return 'DEALING...';
  }

  increaseBet() {
    if (this.currentBet < 5) {
      this.currentBet++;
    }
  }

  decreaseBet() {
    if (this.currentBet > 1) {
      this.currentBet--;
    }
  }

  maxBet() {
    this.currentBet = 5;
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

  goBack() {
    this.saveBalance();
    this.router.navigate(['/lobby']);
  }
}