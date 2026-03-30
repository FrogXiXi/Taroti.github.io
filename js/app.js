/**
 * Mystic Weave Tarot - 主交互逻辑
 * 洗牌 → 切牌 → 抽牌飞入 → 3D翻牌 → 牌义展示
 */
(function () {
  'use strict';

  /* ===== 状态管理 ===== */
  const state = {
    phase: 'idle',        // idle | shuffling | shuffled | cutting | cut | drawing | reading-done
    deck: [],             // 当前牌组
    drawnCards: [],        // 抽到的3张牌
    drawIndex: 0,         // 当前抽到第几张
    flippedCount: 0,      // 已翻牌数
    animating: false       // 动画锁
  };

  /* ===== DOM 缓存 ===== */
  const $ = (sel) => document.querySelector(sel);
  const btnShuffle  = $('#btnShuffle');
  const btnCut      = $('#btnCut');
  const btnStart    = $('#btnStart');
  const btnReset    = $('#btnReset');
  const deckStack   = $('#deckStack');
  const resetWrapper = $('#resetWrapper');
  const hamburger   = $('#hamburger');
  const mobileNav   = $('#mobileNav');
  const panelToggle = $('#panelToggle');
  const panelBody   = $('#panelBody');

  /* 洗牌视觉张数（看起来足够多） */
  const VISUAL_CARD_COUNT = 35;
  /* 静态牌堆叠放张数 */
  const STACK_COUNT = 8;

  /* ===== 初始化 ===== */
  function init() {
    preloadCardBack().then(() => {
      buildDeckStack();
      bindEvents();
      updateButtons();
    });
  }

  /* 预加载牌背图片 */
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

    // 洗牌：idle 或 shuffled 可点（允许重复洗牌），其它阶段不可
    btnShuffle.disabled = a || (p !== 'idle' && p !== 'shuffled');

    // 切牌：洗牌完成或已切牌后可点（允许多次切牌）
    btnCut.disabled = a || (p !== 'shuffled' && p !== 'cut');

    // 开始占卜：切牌完成后可点
    btnStart.disabled = a || p !== 'cut';

    // 重新占卜：占卜完成后可点，否则禁用
    btnReset.disabled = a || p !== 'reading-done';
  }

  function lockUI()   { state.animating = true;  updateButtons(); }
  function unlockUI()  { state.animating = false; updateButtons(); }

  /* ===== 事件绑定 ===== */
  function bindEvents() {
    btnShuffle.addEventListener('click', handleShuffle);
    btnCut.addEventListener('click', handleCut);
    btnStart.addEventListener('click', handleStartReading);
    btnReset.addEventListener('click', handleReset);

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', mobileNav.classList.contains('open'));
    });

    panelToggle.addEventListener('click', () => {
      const open = panelBody.classList.toggle('open');
      panelToggle.setAttribute('aria-expanded', open);
    });

    const btnScreenshot = $('#btnScreenshot');
    if (btnScreenshot) btnScreenshot.addEventListener('click', handleScreenshot);
  }

  /* ===== 洗牌（35张扇形展开 → 收拢） ===== */
  function handleShuffle() {
    if (state.animating) return;
    lockUI();

    // Fisher-Yates 洗牌
    state.deck = [...TAROT_DECK];
    for (let i = state.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.deck[i], state.deck[j]] = [state.deck[j], state.deck[i]];
    }

    // 重置放牌区
    resetSlots();

    // 先清空牌堆，放入动画用的多张牌
    deckStack.innerHTML = '';
    const total = VISUAL_CARD_COUNT;

    for (let i = 0; i < total; i++) {
      const card = document.createElement('div');
      card.className = 'deck-card';
      card.style.zIndex = i;
      card.style.top = '0px';
      card.style.left = '0px';
      card.style.transition = 'none';
      const img = document.createElement('img');
      img.src = CARD_BACK_IMAGE;
      img.alt = '塔罗牌';
      img.draggable = false;
      card.appendChild(img);
      deckStack.appendChild(card);
    }

    const cards = deckStack.querySelectorAll('.deck-card');

    // 第一帧：强制回流
    void deckStack.offsetHeight;

    // 扇形展开
    requestAnimationFrame(() => {
      const spreadAngle = 160;
      const startAngle = -spreadAngle / 2;
      const radius = Math.min(window.innerWidth * 0.35, 200);

      cards.forEach((card, i) => {
        card.style.transition = 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
        const angle = startAngle + (spreadAngle / (total - 1)) * i;
        const offsetX = Math.sin((angle * Math.PI) / 180) * radius;
        const offsetY = -Math.abs(Math.cos((angle * Math.PI) / 180)) * (radius * 0.25) + (radius * 0.25);
        card.style.transform = `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${angle}deg)`;
        card.style.zIndex = i;
      });
    });

    // 收拢回牌堆
    setTimeout(() => {
      cards.forEach((card) => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        card.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
      });

      setTimeout(() => {
        // 重建静态牌堆
        buildDeckStack();
        state.phase = 'shuffled';
        unlockUI();
      }, 550);
    }, 1200);
  }

  /* ===== 切牌（可多次切牌） ===== */
  function handleCut() {
    if (state.animating) return;
    if (state.phase !== 'shuffled' && state.phase !== 'cut') return;
    lockUI();

    const cards = deckStack.querySelectorAll('.deck-card');
    const cutIndex = Math.floor(cards.length / 2);

    cards.forEach((card, i) => {
      if (i >= cutIndex) {
        card.classList.add('cut-top');
      } else {
        card.classList.add('cut-bottom');
      }
    });

    // 随机切牌位置
    const cutPos = Math.floor(Math.random() * (state.deck.length - 10)) + 5;
    const top = state.deck.splice(cutPos);
    state.deck = [...top, ...state.deck];

    setTimeout(() => {
      cards.forEach(c => {
        c.classList.remove('cut-top', 'cut-bottom');
        c.style.transform = '';
      });
      state.phase = 'cut';
      unlockUI();
    }, 800);
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
      state.phase = 'reading-done';
      updateButtons();
      return;
    }

    lockUI();
    const cardData = state.drawnCards[state.drawIndex];
    const slotIndex = state.drawIndex;
    const slot = $(`#slot${slotIndex}`);
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

    // 起始位置
    const deckRect = deckStack.getBoundingClientRect();
    const startX = deckRect.left + deckRect.width / 2 - cardW / 2;
    const startY = deckRect.top + deckRect.height / 2 - cardH / 2;

    // 目标位置
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

    // 牌背（默认可见）
    const front = document.createElement('div');
    front.className = 'flip-card-front';
    const frontImg = document.createElement('img');
    frontImg.src = CARD_BACK_IMAGE;
    frontImg.alt = '牌背';
    frontImg.draggable = false;
    front.appendChild(frontImg);

    // 牌面（翻转后可见）
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
      showInterpretation(cardData, slotIndex);
    });

    slot.insertBefore(flipContainer, slot.querySelector('.slot-label'));
  }

  /* ===== 牌义展示（使用栏位编号 1/2/3） ===== */
  function showInterpretation(cardData, slotIndex) {
    const posLabel = `栏位 ${slotIndex + 1}`;

    const html = `
      <div class="interp-card">
        <div class="interp-position">${posLabel} · 揭牌</div>
        <div class="interp-name">${cardData.nameCN}（${cardData.name}）</div>
        <div class="interp-keywords">${cardData.keywordsCN}</div>
      </div>
    `;

    const desktopContent = $('#interpretationContent');
    if (desktopContent.querySelector('.interpretation-placeholder')) {
      desktopContent.innerHTML = '';
    }
    desktopContent.insertAdjacentHTML('beforeend', html);

    const mobileContent = $('#interpretationContentMobile');
    if (mobileContent.querySelector('.interpretation-placeholder')) {
      mobileContent.innerHTML = '';
    }
    mobileContent.insertAdjacentHTML('beforeend', html);
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

    $('#interpretationContent').innerHTML = '<p class="interpretation-placeholder">抽牌后将在此显示解读...</p>';
    $('#interpretationContentMobile').innerHTML = '<p class="interpretation-placeholder">抽牌后将在此显示解读...</p>';

    updateButtons();
  }

  function resetSlots() {
    for (let i = 0; i < 3; i++) {
      const slot = $(`#slot${i}`);
      const existing = slot.querySelector('.placed-card');
      if (existing) existing.remove();
      const placeholder = slot.querySelector('.card-placeholder');
      if (placeholder) placeholder.style.display = '';
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
    }).then(canvas => {
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '塔罗占卜_' + new Date().toLocaleDateString('zh-CN').replace(/\//g, '-') + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    }).catch(() => {
      alert('截图失败，请使用系统截图工具（Win+Shift+S）');
    });
  }

  /* ===== 启动 ===== */
  document.addEventListener('DOMContentLoaded', init);
})();
