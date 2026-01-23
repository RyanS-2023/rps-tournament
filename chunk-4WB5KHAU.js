import{Da as g,J as l,K as r,O as d,P as c,ba as n,ca as t,da as p,fa as m,ha as u,ka as i,za as b}from"./chunk-6W26MSV2.js";var f=class o{constructor(s){this.router=s}slotsHTML=`
    <div id="slotMachine">
      <div id="winOverlay">
        <div id="winMessage">
          <div class="win-title"></div>
          <div class="win-amount"></div>
        </div>
      </div>

      <div id="header">
        <div id="logo">MINNESOTA VIKINGS SLOTS</div>
      </div>

      <div id="reelsContainer">
        <div id="reels">
          <div class="reel">
            <div class="win-frame"></div>
            <div class="reel-inner" id="reel0"></div>
          </div>
          <div class="reel">
            <div class="win-frame"></div>
            <div class="reel-inner" id="reel1"></div>
          </div>
          <div class="reel">
            <div class="win-frame"></div>
            <div class="reel-inner" id="reel2"></div>
          </div>
          <div class="reel">
            <div class="win-frame"></div>
            <div class="reel-inner" id="reel3"></div>
          </div>
          <div class="reel">
            <div class="win-frame"></div>
            <div class="reel-inner" id="reel4"></div>
          </div>
        </div>
      </div>

      <div id="controlPanel">
        <div id="infoDisplay">
          <div class="info-item">
            <div class="info-label">Balance</div>
            <div class="info-value" id="balance">1000</div>
          </div>
          <div class="info-item">
            <div class="info-label">Bet</div>
            <div class="info-value" id="betDisplay">10</div>
          </div>
          <div class="info-item">
            <div class="info-label">Win</div>
            <div class="info-value" id="winDisplay">0</div>
          </div>
        </div>

        <div id="controls">
          <div class="control-group">
            <button id="betMinus">-</button>
            <span style="color: #999;">BET</span>
            <button id="betPlus">+</button>
          </div>

          <button id="spinButton">SPIN</button>

          <div class="control-group">
            <button id="maxBet">MAX BET</button>
          </div>
        </div>
      </div>

      <style>
        #slotMachine {
          width: 900px;
          max-width: 100%;
          background: linear-gradient(180deg, #1a0033 0%, #0d001a 100%);
          border: 3px solid #4F2683;
          border-radius: 15px;
          box-shadow: 0 0 40px rgba(79, 38, 131, 0.5);
          overflow: hidden;
          margin: 0 auto;
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

        .symbol {
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

        #slotMachine button {
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

        #slotMachine button:hover:not(:disabled) {
          background: linear-gradient(180deg, #5a2d94 0%, #4F2683 100%);
          box-shadow: 0 0 15px rgba(255, 198, 47, 0.5);
          transform: translateY(-2px);
        }

        #slotMachine button:active:not(:disabled) {
          transform: translateY(0);
        }

        #slotMachine button:disabled {
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
      </style>

      <script>
        (function() {
          // Game configuration
          const SYMBOLS = ['\u2694\uFE0F', '\u{1F6E1}\uFE0F', '\u{1F451}', '\u26A1', '\u{1F3C8}', '\u{1F3C6}', 'V'];
          const REEL_LENGTH = 30;
          const SYMBOL_HEIGHT = 140;
          const VISIBLE_SYMBOLS = 3;
          const BET_LEVELS = [1, 5, 10, 25, 50, 100, 250, 500];

          // Paytable (multipliers)
          const PAYTABLE = {
            '\u{1F3C6}': { 3: 100, 4: 500, 5: 2000 },
            '\u{1F3C8}': { 3: 50, 4: 150, 5: 500 },
            '\u2694\uFE0F': { 3: 30, 4: 100, 5: 300 },
            '\u{1F6E1}\uFE0F': { 3: 25, 4: 80, 5: 250 },
            '\u{1F451}': { 3: 20, 4: 60, 5: 200 },
            '\u26A1': { 3: 15, 4: 40, 5: 150 },
            'V': { 3: 10, 4: 30, 5: 100 }
          };

          // Game state
          let balance = 1000;
          let currentBet = 10;
          let betIndex = 2;
          let isSpinning = false;
          let reels = [];

          // DOM elements
          const balanceEl = document.getElementById('balance');
          const betDisplayEl = document.getElementById('betDisplay');
          const winDisplayEl = document.getElementById('winDisplay');
          const spinButton = document.getElementById('spinButton');
          const betPlusBtn = document.getElementById('betPlus');
          const betMinusBtn = document.getElementById('betMinus');
          const maxBetBtn = document.getElementById('maxBet');
          const winOverlay = document.getElementById('winOverlay');

          // Initialize reels
          function initReels() {
            for (let i = 0; i < 5; i++) {
              const reel = [];
              const reelEl = document.getElementById(\`reel\${i}\`);
              
              for (let j = 0; j < REEL_LENGTH; j++) {
                const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                reel.push(symbol);
                
                const symbolEl = document.createElement('div');
                symbolEl.className = 'symbol';
                symbolEl.textContent = symbol;
                reelEl.appendChild(symbolEl);
              }
              
              reels.push({
                symbols: reel,
                element: reelEl,
                position: 0
              });
            }
          }

          // Spin the reels
          function spin() {
            if (isSpinning || balance < currentBet) return;

            isSpinning = true;
            balance -= currentBet;
            updateDisplay();
            winDisplayEl.textContent = '0';
            spinButton.disabled = true;

            document.querySelectorAll('.reel').forEach(r => r.classList.remove('winning'));

            const spinPromises = reels.map((reel, index) => {
              return new Promise(resolve => {
                const spinDuration = 2000 + (index * 200);
                const startTime = Date.now();
                const startPos = reel.position;
                const spins = 5 + index;
                const targetPos = (startPos + (REEL_LENGTH * spins) + Math.floor(Math.random() * REEL_LENGTH)) % REEL_LENGTH;

                function animate() {
                  const elapsed = Date.now() - startTime;
                  const progress = Math.min(elapsed / spinDuration, 1);
                  
                  const easeOut = 1 - Math.pow(1 - progress, 3);
                  const totalDistance = (REEL_LENGTH * spins) + (targetPos - startPos);
                  const currentDistance = totalDistance * easeOut;
                  const currentPos = (startPos + currentDistance) % REEL_LENGTH;
                  
                  reel.position = currentPos;
                  reel.element.style.transform = \`translateY(-\${currentPos * SYMBOL_HEIGHT}px)\`;

                  if (progress < 1) {
                    requestAnimationFrame(animate);
                  } else {
                    reel.position = targetPos;
                    reel.element.style.transform = \`translateY(-\${targetPos * SYMBOL_HEIGHT}px)\`;
                    resolve();
                  }
                }

                setTimeout(() => animate(), index * 100);
              });
            });

            Promise.all(spinPromises).then(() => {
              checkWin();
              isSpinning = false;
              spinButton.disabled = false;
            });
          }

          function getVisibleSymbols() {
            const grid = [];
            reels.forEach(reel => {
              const column = [];
              const basePos = Math.floor(reel.position);
              for (let i = 0; i < VISIBLE_SYMBOLS; i++) {
                const index = (basePos + i) % REEL_LENGTH;
                column.push(reel.symbols[index]);
              }
              grid.push(column);
            });
            return grid;
          }

          function checkWin() {
            const grid = getVisibleSymbols();
            let totalWin = 0;
            const winningReels = new Set();

            for (let row = 0; row < VISIBLE_SYMBOLS; row++) {
              const line = grid.map(col => col[row]);
              const win = checkLine(line);
              if (win.amount > 0) {
                totalWin += win.amount;
                win.reels.forEach(r => winningReels.add(r));
              }
            }

            if (totalWin > 0) {
              const winAmount = totalWin * currentBet;
              balance += winAmount;
              updateDisplay();
              showWin(winAmount, winningReels);
            }
          }

          function checkLine(symbols) {
            let bestWin = { amount: 0, reels: [] };

            for (const symbol of SYMBOLS) {
              let count = 0;
              for (let i = 0; i < symbols.length; i++) {
                if (symbols[i] === symbol) {
                  count++;
                } else {
                  break;
                }
              }

              if (count >= 3 && PAYTABLE[symbol] && PAYTABLE[symbol][count]) {
                const amount = PAYTABLE[symbol][count];
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

          function showWin(amount, winningReels) {
            document.querySelectorAll('.reel').forEach((reel, index) => {
              if (winningReels.has(index)) {
                reel.classList.add('winning');
              }
            });

            const winTitle = document.querySelector('.win-title');
            const winAmountEl = document.querySelector('.win-amount');

            if (amount >= currentBet * 100) {
              winTitle.textContent = '\u{1F3C6} MEGA WIN! \u{1F3C6}';
            } else if (amount >= currentBet * 50) {
              winTitle.textContent = '\u26A1 BIG WIN! \u26A1';
            } else {
              winTitle.textContent = 'WIN!';
            }

            winAmountEl.textContent = \`$\${amount}\`;
            winDisplayEl.textContent = amount;
            winOverlay.classList.add('show');

            setTimeout(() => {
              winOverlay.classList.remove('show');
              document.querySelectorAll('.reel').forEach(r => r.classList.remove('winning'));
            }, 3000);
          }

          function updateDisplay() {
            balanceEl.textContent = balance;
            betDisplayEl.textContent = currentBet;
          }

          betPlusBtn.addEventListener('click', () => {
            if (isSpinning || betIndex >= BET_LEVELS.length - 1) return;
            betIndex++;
            currentBet = BET_LEVELS[betIndex];
            updateDisplay();
          });

          betMinusBtn.addEventListener('click', () => {
            if (isSpinning || betIndex <= 0) return;
            betIndex--;
            currentBet = BET_LEVELS[betIndex];
            updateDisplay();
          });

          maxBetBtn.addEventListener('click', () => {
            if (isSpinning) return;
            betIndex = BET_LEVELS.length - 1;
            currentBet = BET_LEVELS[betIndex];
            updateDisplay();
          });

          spinButton.addEventListener('click', spin);

          document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
              e.preventDefault();
              spin();
            }
          });

          // Initialize
          initReels();
          updateDisplay();
        })();
      <\/script>
    </div>
  `;goBack(){this.router.navigate(["/lobby"])}static \u0275fac=function(e){return new(e||o)(d(g))};static \u0275cmp=c({type:o,selectors:[["app-slots"]],decls:7,vars:1,consts:[[1,"slots-page"],[1,"slots-header"],[1,"btn-back",3,"click"],[1,"slots-container",3,"innerHTML"]],template:function(e,a){e&1&&(n(0,"div",0)(1,"header",1)(2,"button",2),u("click",function(){return a.goBack()}),i(3,"\u2190 Back to Lobby"),t(),n(4,"h1"),i(5,"Minnesota Vikings Slots"),t()(),p(6,"div",3),t()),e&2&&(r(6),m("innerHTML",a.slotsHTML,l))},dependencies:[b],styles:[".slots-page[_ngcontent-%COMP%]{min-height:100vh;background:#0a0a0a;padding:20px}.slots-header[_ngcontent-%COMP%]{max-width:900px;margin:0 auto 20px;display:flex;align-items:center;gap:20px}.btn-back[_ngcontent-%COMP%]{background:linear-gradient(180deg,#4f2683,#3a1c61);color:#ffc62f;border:2px solid #FFC62F;padding:12px 24px;font-size:16px;font-weight:700;border-radius:6px;cursor:pointer;transition:all .2s}.btn-back[_ngcontent-%COMP%]:hover{background:linear-gradient(180deg,#5a2d94,#4f2683);box-shadow:0 0 15px #ffc62f80;transform:translateY(-2px)}.slots-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{color:#ffc62f;font-size:24px;margin:0;text-shadow:2px 2px 4px rgba(0,0,0,.8)}.slots-container[_ngcontent-%COMP%]{max-width:900px;margin:0 auto}[_nghost-%COMP%]     *{box-sizing:border-box}"]})};export{f as SlotsComponent};
