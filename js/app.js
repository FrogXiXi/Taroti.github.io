/**
 * Mystic Weave Tarot - 主交互逻辑
 * 洗牌 → 切牌 → 点击牌堆手动抽牌 → 3D翻牌 → 牌义展示
 */
(function () {
  'use strict';

  /* ===== 状态管理 ===== */
  var state = {
    phase: 'idle',        // idle | shuffled | cut | drawing | drawn
    deck: [],
    drawnCards: [],
    drawIndex: 0,
    flippedCount: 0,
    animating: false
  };

  /* ===== DOM 缓存 ===== */
  var $ = function (sel) { return document.querySelector(sel); };
  var btnShuffle   = $('#btnShuffle');
  var btnCut       = $('#btnCut');
  var btnStart     = $('#btnStart');
  var btnReset     = $('#btnReset');
  var deckStack    = $('#deckStack');
  var deckArea     = $('#deckArea');
  var resetWrapper = $('#resetWrapper');
  var panelToggle  = $('#panelToggle');
  var panelBody    = $('#panelBody');

  var VISUAL_CARD_COUNT = 35;
  var STACK_COUNT = 8;

  /* ===== 初始化 ===== */
  function init() {
    preloadCardBack().then(function () {
      buildDeckStack();
      bindEvents();
      updateButtons();
    });
  }

  function preloadCardBack() {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = CARD_BACK_IMAGE;
    });
  }

  /* 生成牌堆（静态叠放） */
  function buildDeckStack() {
    deckStack.innerHTML = '';
    for (var i = 0; i < STACK_COUNT; i++) {
      var card = document.createElement('div');
      card.className = 'deck-card';
      card.style.zIndex = i;
      card.style.top = -(i * 2) + 'px';
      card.style.left = (i * 1) + 'px';
      var img = document.createElement('img');
      img.src = CARD_BACK_IMAGE;
      img.alt = '塔罗牌背';
      img.draggable = false;
      card.appendChild(img);
      deckStack.appendChild(card);
    }
    // 移除牌堆点击态（非抽牌阶段）
    deckStack.style.cursor = 'default';
  }

  /* ===== 按钮状态控制 ===== */
  function updateButtons() {
    var a = state.animating;
    var p = state.phase;

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

    // 点击牌堆抽牌
    deckStack.addEventListener('click', handleDeckClick);

    if (panelToggle) {
      panelToggle.addEventListener('click', function () {
        var open = panelBody.classList.toggle('open');
        panelToggle.setAttribute('aria-expanded', open);
      });
    }

    var btnScreenshot = $('#btnScreenshot');
    if (btnScreenshot) btnScreenshot.addEventListener('click', handleScreenshot);
  }

  /* ===== 生成随机散牌位置 ===== */
  function randomPositions(cards, maxX, maxY) {
    var total = cards.length;
    cards.forEach(function (card) {
      var rx = (Math.random() - 0.5) * 2 * maxX;
      var ry = (Math.random() - 0.5) * 2 * maxY;
      var rot = (Math.random() - 0.5) * 360;
      card.style.transform = 'translate(' + rx + 'px, ' + ry + 'px) rotate(' + rot + 'deg)';
      card.style.zIndex = Math.floor(Math.random() * total);
    });
  }

  /* ===== 洗牌（散开 → 打乱重排 → 再打乱 → 收拢） ===== */
  function handleShuffle() {
    if (state.animating) return;
    lockUI();

    // Fisher-Yates 洗牌
    state.deck = [].concat(TAROT_DECK);
    for (var i = state.deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = state.deck[i];
      state.deck[i] = state.deck[j];
      state.deck[j] = tmp;
    }

    resetSlots();
    deckStack.innerHTML = '';
    var total = VISUAL_CARD_COUNT;

    var areaW = deckArea.offsetWidth;
    var maxX = Math.min(areaW * 0.38, 260);
    var maxY = 90;

    for (var k = 0; k < total; k++) {
      var card = document.createElement('div');
      card.className = 'deck-card';
      card.style.zIndex = k;
      card.style.transition = 'none';
      var img = document.createElement('img');
      img.src = CARD_BACK_IMAGE;
      img.alt = '塔罗牌';
      img.draggable = false;
      card.appendChild(img);
      deckStack.appendChild(card);
    }

    var cards = Array.from(deckStack.querySelectorAll('.deck-card'));
    void deckStack.offsetHeight;

    // 阶段1：散开
    requestAnimationFrame(function () {
      cards.forEach(function (c) {
        c.style.transition = 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)';
      });
      randomPositions(cards, maxX, maxY);
    });

    // 阶段2：打乱重排（第一次搅动）
    setTimeout(function () {
      cards.forEach(function (c) {
        c.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });
      randomPositions(cards, maxX, maxY);
    }, 700);

    // 阶段3：打乱重排（第二次搅动）
    setTimeout(function () {
      cards.forEach(function (c) {
        c.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });
      randomPositions(cards, maxX, maxY);
    }, 1250);

    // 阶段4：收拢回牌堆
    setTimeout(function () {
      cards.forEach(function (c) {
        c.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        c.style.transform = 'translate(0, 0) rotate(0deg)';
      });

      setTimeout(function () {
        buildDeckStack();
        state.phase = 'shuffled';
        unlockUI();
      }, 550);
    }, 1800);
  }

  /* ===== 切牌（上半叠抬起右移 → 放回底下） ===== */
  function handleCut() {
    if (state.animating) return;
    if (state.phase !== 'shuffled' && state.phase !== 'cut') return;
    lockUI();

    // 每次切牌前重建牌堆，确保DOM干净
    buildDeckStack();
    void deckStack.offsetHeight;

    var cards = Array.from(deckStack.querySelectorAll('.deck-card'));
    var total = cards.length;
    var cutIndex = Math.floor(total / 2);

    // 上半部分（z-index >= cutIndex，视觉上在上面）
    var topCards = cards.filter(function (_, i) { return i >= cutIndex; });
    var bottomCards = cards.filter(function (_, i) { return i < cutIndex; });

    // 阶段1：上半部分抬起右移
    topCards.forEach(function (card) {
      card.style.transition = 'transform 0.45s ease-out';
      card.style.transform = 'translateY(-75px) translateX(50px)';
    });

    // 阶段2：上半部分z-index降到底下，下半部分升高
    setTimeout(function () {
      topCards.forEach(function (card, i) {
        card.style.zIndex = i;
      });
      bottomCards.forEach(function (card, i) {
        card.style.zIndex = i + topCards.length;
      });

      // 上半部分回到原位（现在在底下了）
      topCards.forEach(function (card) {
        card.style.transition = 'transform 0.4s ease-in';
        card.style.transform = 'translateY(0) translateX(0)';
      });

      setTimeout(function () {
        // 数据层切牌
        var cutPos = Math.floor(Math.random() * (state.deck.length - 10)) + 5;
        var topPart = state.deck.splice(cutPos);
        state.deck = topPart.concat(state.deck);

        // 清除transform，然后平滑调整top/left到新z-index对应的位置
        cards.forEach(function (c) {
          c.style.transform = '';
          var z = parseInt(c.style.zIndex) || 0;
          c.style.transition = 'top 0.3s ease, left 0.3s ease';
          c.style.top = -(z * 2) + 'px';
          c.style.left = (z * 1) + 'px';
        });

        setTimeout(function () {
          cards.forEach(function (c) {
            c.style.transition = '';
          });
          state.phase = 'cut';
          unlockUI();
        }, 350);
      }, 450);
    }, 500);
  }

  /* ===== 开始占卜：滚动到牌堆+放牌区，启用手动抽牌 ===== */
  function handleStartReading() {
    if (state.animating || state.phase !== 'cut') return;
    state.phase = 'drawing';
    state.drawnCards = state.deck.slice(0, 3);
    state.drawIndex = 0;
    updateButtons();

    // 平滑滚动，让牌堆顶部对齐视口顶部（按钮刚好看不见）
    var deckTop = deckArea.getBoundingClientRect().top + window.pageYOffset;
    var navbarH = document.querySelector('.navbar') ? document.querySelector('.navbar').offsetHeight : 0;
    window.scrollTo({
      top: deckTop - navbarH - 8,
      behavior: 'smooth'
    });

    // 设置牌堆为可点击态
    deckStack.style.cursor = 'pointer';
  }

  /* ===== 点击牌堆手动抽牌 ===== */
  function handleDeckClick() {
    if (state.phase !== 'drawing') return;
    if (state.animating) return;
    if (state.drawIndex >= 3) return;

    drawOneCard();
  }

  function drawOneCard() {
    lockUI();
    var cardData = state.drawnCards[state.drawIndex];
    var slotIndex = state.drawIndex;
    var slot = $('#slot' + slotIndex);
    var placeholder = slot.querySelector('.card-placeholder');

    var rootStyles = getComputedStyle(document.documentElement);
    var cardW = parseInt(rootStyles.getPropertyValue('--card-w'));
    var cardH = parseInt(rootStyles.getPropertyValue('--card-h'));

    // 飞行牌
    var flyCard = document.createElement('div');
    flyCard.className = 'deck-card';
    flyCard.style.width = cardW + 'px';
    flyCard.style.height = cardH + 'px';

    var img = document.createElement('img');
    img.src = CARD_BACK_IMAGE;
    img.alt = cardData.nameCN;
    img.draggable = false;
    flyCard.appendChild(img);

    // 起始位置
    var deckRect = deckStack.getBoundingClientRect();
    var startX = deckRect.left + deckRect.width / 2 - cardW / 2;
    var startY = deckRect.top + deckRect.height / 2 - cardH / 2;

    // 目标位置
    var slotRect = placeholder.getBoundingClientRect();
    var endX = slotRect.left;
    var endY = slotRect.top;

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

    setTimeout(function () {
      if (flyCard.parentNode) document.body.removeChild(flyCard);
      placeFlipper(slot, cardData, slotIndex);
      state.drawIndex++;

      if (state.drawIndex >= 3) {
        state.phase = 'drawn';
        deckStack.style.cursor = 'default';
      }
      unlockUI();
    }, 900);
  }

  /* 放置可翻转牌 */
  function placeFlipper(slot, cardData, slotIndex) {
    var placeholder = slot.querySelector('.card-placeholder');
    placeholder.style.display = 'none';

    var flipContainer = document.createElement('div');
    flipContainer.className = 'placed-card';

    var inner = document.createElement('div');
    inner.className = 'flip-card-inner';

    var front = document.createElement('div');
    front.className = 'flip-card-front';
    var frontImg = document.createElement('img');
    frontImg.src = CARD_BACK_IMAGE;
    frontImg.alt = '牌背';
    frontImg.draggable = false;
    front.appendChild(frontImg);

    var back = document.createElement('div');
    back.className = 'flip-card-back';
    var backImg = document.createElement('img');
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
      var label = slot.querySelector('.slot-label');
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

    var content = $('#interpretationContentMobile');
    if (content) {
      if (content.querySelector('.interpretation-placeholder')) {
        content.innerHTML = '';
      }
      content.insertAdjacentHTML('beforeend', html);
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

    var mc = $('#interpretationContentMobile');
    if (mc) mc.innerHTML = '<p class="interpretation-placeholder">抽牌后将在此显示解读...</p>';

    // 滚动回顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });

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