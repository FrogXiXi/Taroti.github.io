/**
 * Mystic Weave Tarot - 主交互逻辑
 * 洗牌 → 切牌 → 抽牌飞入 → 3D翻牌 → 牌义展示
 */
(function () {
  'use strict';

  /* ===== 状态管理 ===== */
  const state = {
    phase: 'idle',        // idle | shuffled | cut | drawing | drawn | reading-done
    deck: [],
    drawnCards: [],
    drawIndex: 0,
    flippedCount: 0,
    animating: false
  };

  /* ===== DOM 缓存 ===== */
  const $ = (sel) => document.querySelector(sel);
  const btnShuffle   = $('#btnShuffle');
  const btnCut       = $('#btnCut');
  const btnStart     = $('#btnStart');
  const btnReset     = $('#btnReset');
  const deckStack    = $('#deckStack');
  const resetWrapper = $('#resetWrapper');
  const panelToggle  = $('#panelToggle');
  const panelBody    = $('#panelBody');

  const VISUAL_CARD_COUNT = 35;
  const STACK_COUNT = 8;

  /* ===== 初始化 ===== */
  function init() {
    preloadCardBack().then(() => {
      buildDeckStack();
      bindEvents();
      updateButtons();
    });
  }

  function preloadCardBack() {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = CARD_BACK_IMAGE;
    });
  }

  /* 生成牌堆（静态叠放） */
  function buildDeckStack() {
    deckStack.innerHTML = '';
    for (let i = 0; i < STACK_COUNT; i++) {
      const card = document.createElement('div');
      card.className = 'deck-card';
      card.style.zIndex = i;
      card.style.top = -(i * 2) + 'px';
      card.style.left = (i * 1) + 'px';
      const img = document.createElement('img');
      img.src = CARD_BACK_IMAGE;
      img.alt = '塔罗牌背';
      img.draggable = false;
      card.appendChild(img);
      deckStack.appendChild(card);
    }
  }

  /* ===== 按钮状态控制 ===== */
  function updateButtons() {
    const a = state.animating;
    const p = state.phase;

    btnShuffle.disabled = a || (p !== 'idle' && p !== 'shuffled');
    btnCut.disabled     = a || (p !== 'shuffled' && p !== 'cut');
    btnStart.disabled   = a || p !== 'cut';

    // 重置按钮：三张牌全部翻开后才出现
    resetWrapper.style.display = (state.flippedCount >= 3) ? '' : 'none';
  }

  function lockUI()  { state.animating = true;  updateButtons(); }
  function unlockUI() { state.animating = false; updateButtons(); }

  /* ===== 事件绑定 ===== */
  function bindEvents() {
    btnShuffle.addEventListener('click', handleShuffle);
    btnCut.addEventListener('click', handleCut);
    btnStart.addEventListener('click', handleStartReading);
    btnReset.addEventListener('click', handleReset);

    if (panelToggle) {
      panelToggle.addEventListener('click', () => {
        const open = panelBody.classList.toggle('open');
        panelToggle.setAttribute('aria-expanded', open);
      });
    }

    const btnScreenshot = $('#btnScreenshot');
    if (btnScreenshot) btnScreenshot.addEventListener('click', handleScreenshot);
  }

  /* ===== 洗牌（杂乱散牌 → 收拢） ===== */
  function handleShuffle() {
    if (state.animating) return;
    lockUI();

    // Fisher-Yates 洗牌
    state.deck = [...TAROT_DECK];
    for (let i = state.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.deck[i], state.deck[j]] = [state.deck[j], state.deck[i]];
    }

    resetSlots();
    deckStack.innerHTML = '';
    const total = VISUAL_CARD_COUNT;

    // 计算散牌范围
    const deckArea = document.getElementById('deckArea');
    const areaW = deckArea.offsetWidth;
    const maxX = Math.min(areaW * 0.4, 280);
    const maxY = 80;

    for (let i = 0; i < total; i++) {
      const card = document.createElement('div');
      card.className = 'deck-card';
      card.style.zIndex = i;
      card.style.transition = 'none';
      const img = document.createElement('img');
      img.src = CARD_BACK_IMAGE;
      img.alt = '塔罗牌';
      img.draggable = false;
      card.appendChild(img);
      deckStack.appendChild(card);
    }

    const cards = deckStack.querySelectorAll('.deck-card');
    void deckStack.offsetHeight;

    // 杂乱散开
    requestAnimationFrame(() => {
      cards.forEach((card) => {
        card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        const rx = (Math.random() - 0.5) * 2 * maxX;
        const ry = (Math.random() - 0.5) * 2 * maxY;
        const rot = (Math.random() - 0.5) * 360;
        card.style.transform = 'translate(' + rx + 'px, ' + ry + 'px) rotate(' + rot + 'deg)';
        card.style.zIndex = Math.floor(Math.random() * total);
      });
    });

    // 收拢回牌堆
    setTimeout(() => {
      cards.forEach((card) => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        card.style.transform = 'translate(0, 0) rotate(0deg)';
      });

      setTimeout(() => {
        buildDeckStack();
        state.phase = 'shuffled';
        unlockUI();
      }, 550);
    }, 1400);
  }

  /* ===== 切牌（上半部分拿起 → 放到底下） ===== */
  function handleCut() {
    if (state.animating) return;
    if (state.phase !== 'shuffled' && state.phase !== 'cut') return;
    lockUI();

    const cards = Array.from(deckStack.querySelectorAll('.deck-card'));
    const total = cards.length;
    const cutIndex = Math.floor(total / 2);

    // 阶段1：上半部分牌抬起并右移
    cards.forEach((card, i) => {
      if (i >= cutIndex) {
        card.style.transition = 'transform 0.4s ease-out';
        card.style.transform = 'translateY(-80px) translateX(55px)';
      }
    });

    // 阶段2：上半部分降低z-index（放到底下），下半部分升高z-index（放到上面）
    setTimeout(() => {
      cards.forEach((card, i) => {
        if (i >= cutIndex) {
          card.style.zIndex = i - cutIndex;
          card.style.transition = 'transform 0.4s ease-in';
          card.style.transform = 'translateY(0) translateX(0)';
        } else {
          card.style.zIndex = i + (total - cutIndex);
        }
      });

      setTimeout(() => {
        cards.forEach(c => {
          c.style.transform = '';
          c.style.transition = '';
        });

        // 数据层切牌
        const cutPos = Math.floor(Math.random() * (state.deck.length - 10)) + 5;
        const top = state.deck.splice(cutPos);
        state.deck = [...top, ...state.deck];

        state.phase = 'cut';
        unlockUI();
      }, 450);
    }, 450);
  }

  /* ===== 开始占卜 ===== */
  function handleStartReading() {
    if (state.animating || state.phase !== 'cut') return;
    state.phase = 'drawing';
    state.drawnCards = state.deck.slice(0, 3);
    state.drawIndex = 0;
    updateButtons();
    drawNextCard();
  }

  function drawNextCard() {
    if (state.drawIndex >= 3) {
      state.phase = 'drawn';
      updateButtons();
      return;
    }

    lockUI();
    const cardData = state.drawnCards[state.drawIndex];
    const slotIndex = state.drawIndex;
    const slot = $('#slot' + slotIndex);
    const placeholder = slot.querySelector('.card-placeholder');

    const rootStyles = getComputedStyle(document.documentElement);
    const cardW = parseInt(rootStyles.getPropertyValue('--card-w'));
    const cardH = parseInt(rootStyles.getPropertyValue('--card-h'));

    // 飞行牌
    const flyCard = document.createElement('div');
    flyCard.className = 'deck-card';
    flyCard.style.width = cardW + 'px';
    flyCard.style.height = cardH + 'px';

    const img = document.createElement('img');
    img.src = CARD_BACK_IMAGE;
    img.alt = cardData.nameCN;
    img.draggable = false;
    flyCard.appendChild(img);

    // 起始位置（牌堆中心）
    const deckRect = deckStack.getBoundingClientRect();
    const startX = deckRect.left + deckRect.width / 2 - cardW / 2;
    const startY = deckRect.top + deckRect.height / 2 - cardH / 2;

    // 目标位置（牌位中心）
    const slotRect = placeholder.getBoundingClientRect();
    const endX = slotRect.left;
    const endY = slotRect.top;

    flyCard.style.position = 'fixed';
    flyCard.style.left = startX + 'px';
    flyCard.style.top = startY + 'px';
    flyCard.style.zIndex = '200';
    flyCard.style.transition = 'none';
    flyCard.style.boxShadow = '0 0 15px rgba(201, 168, 76, 0.4)';
    document.body.appendChild(flyCard);

    void flyCard.offsetHeight;
    flyCard.style.transition = 'all 0.85s cubic-bezier(0.22, 1, 0.36, 1)';
    flyCard.style.left = endX + 'px';
    flyCard.style.top = endY + 'px';
    flyCard.style.boxShadow = '0 0 30px rgba(201, 168, 76, 0.6), 0 0 60px rgba(201, 168, 76, 0.2)';

    setTimeout(() => {
      if (flyCard.parentNode) document.body.removeChild(flyCard);
      placeFlipper(slot, cardData, slotIndex);
      state.drawIndex++;
      unlockUI();
      setTimeout(() => drawNextCard(), 350);
    }, 900);
  }

  /* 放置可翻转牌 */
  function placeFlipper(slot, cardData, slotIndex) {
    const placeholder = slot.querySelector('.card-placeholder');
    placeholder.style.display = 'none';

    const flipContainer = document.createElement('div');
    flipContainer.className = 'placed-card';

    const inner = document.createElement('div');
    inner.className = 'flip-card-inner';

    const front = document.createElement('div');
    front.className = 'flip-card-front';
    const frontImg = document.createElement('img');
    frontImg.src = CARD_BACK_IMAGE;
    frontImg.alt = '牌背';
    frontImg.draggable = false;
    front.appendChild(frontImg);

    const back = document.createElement('div');
    back.className = 'flip-card-back';
    const backImg = document.createElement('img');
    backImg.src = cardData.image;
    backImg.alt = cardData.nameCN;
    backImg.draggable = false;
    back.appendChild(backImg);

    inner.appendChild(front);
    inner.appendChild(back);
    flipContainer.appendChild(inner);

    // 点击翻牌
    flipContainer.addEventListener('click', function handler() {
      if (inner.classList.contains('flipped')) return;
      inner.classList.add('flipped');
      state.flippedCount++;
      flipContainer.removeEventListener('click', handler);

      // 翻牌后底下显示牌名
      const label = slot.querySelector('.slot-label');
      if (label) label.textContent = cardData.nameCN;

      showInterpretation(cardData, slotIndex);
      updateButtons();
    });

    slot.insertBefore(flipContainer, slot.querySelector('.slot-label'));
  }

  /* ===== 牌义展示 ===== */
  function showInterpretation(cardData, slotIndex) {
    var posLabel = '栏位 ' + (slotIndex + 1);

    var html =
      '<div class="interp-card">' +
        '<div class="interp-position">' + posLabel + ' · 揭牌</div>' +
        '<div class="interp-name">' + cardData.nameCN + '（' + cardData.name + '）</div>' +
        '<div class="interp-keywords">' + cardData.keywordsCN + '</div>' +
      '</div>';

    var desktopContent = $('#interpretationContent');
    if (desktopContent) {
      if (desktopContent.querySelector('.interpretation-placeholder')) {
        desktopContent.innerHTML = '';
      }
      desktopContent.insertAdjacentHTML('beforeend', html);
    }

    var mobileContent = $('#interpretationContentMobile');
    if (mobileContent) {
      if (mobileContent.querySelector('.interpretation-placeholder')) {
        mobileContent.innerHTML = '';
      }
      mobileContent.insertAdjacentHTML('beforeend', html);
    }
  }

  /* ===== 重置 ===== */
  function handleReset() {
    state.phase = 'idle';
    state.deck = [];
    state.drawnCards = [];
    state.drawIndex = 0;
    state.flippedCount = 0;
    state.animating = false;

    buildDeckStack();
    resetSlots();

    var dc = $('#interpretationContent');
    if (dc) dc.innerHTML = '<p class="interpretation-placeholder">抽牌后将在此显示解读...</p>';
    var mc = $('#interpretationContentMobile');
    if (mc) mc.innerHTML = '<p class="interpretation-placeholder">抽牌后将在此显示解读...</p>';

    updateButtons();
  }

  function resetSlots() {
    for (var i = 0; i < 3; i++) {
      var slot = $('#slot' + i);
      var existing = slot.querySelector('.placed-card');
      if (existing) existing.remove();
      var placeholder = slot.querySelector('.card-placeholder');
      if (placeholder) placeholder.style.display = '';
      var label = slot.querySelector('.slot-label');
      if (label) label.innerHTML = '&nbsp;';
    }
  }

  /* ===== 截图 ===== */
  function handleScreenshot() {
    if (typeof html2canvas === 'undefined') {
      alert('截图组件加载中，请稍后再试...');
      return;
    }
    html2canvas($('main'), {
      backgroundColor: '#0f0a1a',
      scale: 2,
      useCORS: true,
      logging: false
    }).then(function (canvas) {
      canvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = '塔罗占卜_' + new Date().toLocaleDateString('zh-CN').replace(/\//g, '-') + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    }).catch(function () {
      alert('截图失败，请使用系统截图工具（Win+Shift+S）');
    });
  }

  /* ===== 启动 ===== */
  document.addEventListener('DOMContentLoaded', init);
})();
