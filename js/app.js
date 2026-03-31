/**
 * LiTarot - 主交互逻辑
 * 洗牌 → 轮盘选牌 → 3D翻牌 → 牌义展示（含逆位）
 */
(function () {
  'use strict';

  /* ===== 状态管理 ===== */
  var state = {
    phase: 'idle',
    deck: [],
    drawnCards: [],
    drawIndex: 0,
    flippedCount: 0,
    animating: false,
    wheelAngle: 0,
    dragging: false,
    dragMoved: false,
    lastPointerAngle: 0,
    baseRadius: 0
  };

  /* ===== DOM 缓存 ===== */
  var $ = function (sel) { return document.querySelector(sel); };
  var btnShuffle    = $('#btnShuffle');
  var btnStart      = $('#btnStart');
  var btnReset      = $('#btnReset');
  var deckStack     = $('#deckStack');
  var deckArea      = $('#deckArea');
  var wheelWrapper  = $('#wheelWrapper');
  var wheelViewport = $('#wheelViewport');
  var wheelRing     = $('#wheelRing');
  var resetWrapper  = $('#resetWrapper');
  var panelToggle   = $('#panelToggle');
  var panelBody     = $('#panelBody');
  var sectionHint   = $('#sectionHint');
  var sectionTitle  = $('.section-title');
  var actionButtons = $('#actionButtons');
  var drawingTitle  = $('#drawingTitle');
  var drawingArea   = $('#drawingArea');

  var VISUAL_CARD_COUNT = 35;
  var STACK_COUNT = 8;
  var REVERSE_CHANCE = 0.35;

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
    deckStack.style.cursor = 'default';
  }

  /* ===== 按钮状态 ===== */
  function updateButtons() {
    var a = state.animating;
    var p = state.phase;
    btnShuffle.disabled = a || (p !== 'idle' && p !== 'shuffled');
    btnStart.disabled   = a || p !== 'shuffled';
    resetWrapper.style.display = (state.flippedCount >= 3) ? '' : 'none';
  }

  function lockUI()  { state.animating = true;  updateButtons(); }
  function unlockUI() { state.animating = false; updateButtons(); }

  /* ===== 事件绑定 ===== */
  function bindEvents() {
    btnShuffle.addEventListener('click', handleShuffle);
    btnStart.addEventListener('click', handleStartReading);
    btnReset.addEventListener('click', handleReset);

    if (panelToggle) {
      panelToggle.addEventListener('click', function () {
        var open = panelBody.classList.toggle('open');
        panelToggle.setAttribute('aria-expanded', open);
      });
    }

    var btnScreenshot = $('#btnScreenshot');
    if (btnScreenshot) btnScreenshot.addEventListener('click', handleScreenshot);
  }

  /* ===== 随机散牌位置 ===== */
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

  /* ===== 洗牌 ===== */
  function handleShuffle() {
    if (state.animating) return;
    lockUI();

    // Fisher-Yates 洗牌 + 随机逆位
    state.deck = TAROT_DECK.map(function (card) {
      var copy = {};
      for (var k in card) copy[k] = card[k];
      copy.reversed = Math.random() < REVERSE_CHANCE;
      return copy;
    });
    for (var i = state.deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = state.deck[i];
      state.deck[i] = state.deck[j];
      state.deck[j] = tmp;
    }

    resetSlots();
    wheelWrapper.style.display = 'none';
    deckArea.style.display = '';

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

    requestAnimationFrame(function () {
      cards.forEach(function (c) {
        c.style.transition = 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)';
      });
      randomPositions(cards, maxX, maxY);
    });

    setTimeout(function () {
      cards.forEach(function (c) {
        c.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });
      randomPositions(cards, maxX, maxY);
    }, 700);

    setTimeout(function () {
      cards.forEach(function (c) {
        c.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });
      randomPositions(cards, maxX, maxY);
    }, 1250);

    setTimeout(function () {
      cards.forEach(function (c) {
        c.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        c.style.transform = 'translate(0, 0) rotate(0deg)';
      });
      setTimeout(function () {
        buildDeckStack();
        state.phase = 'shuffled';
        if (sectionHint) sectionHint.textContent = '洗牌完成，点击「开始占卜」展开轮盘选牌。';
        unlockUI();
      }, 550);
    }, 1800);
  }

  /* ===== 开始占卜：展开轮盘 ===== */
  function handleStartReading() {
    if (state.animating || state.phase !== 'shuffled') return;
    lockUI();
    state.phase = 'drawing';
    state.drawnCards = [];
    state.drawIndex = 0;
    updateButtons();

    if (sectionHint) sectionHint.textContent = '滑动旋转轮盘，点击选牌（共需选3张）';

    // 记录牌堆位置，用于展开动画起点
    var deckRect = deckStack.getBoundingClientRect();
    var deckCenterX = deckRect.left + deckRect.width / 2;
    var deckCenterY = deckRect.top + deckRect.height / 2;

    deckArea.style.display = 'none';
    drawingTitle.style.display = 'none';
    drawingArea.style.display = 'none';
    wheelWrapper.style.display = '';

    setTimeout(function () {
      buildWheel(deckCenterX, deckCenterY);
    }, 350);
  }

  /* ===== 轮盘构建（带展开动画） ===== */
  function buildWheel(fromX, fromY) {
    wheelRing.innerHTML = '';
    state.wheelAngle = 0;
    state.baseRadius = getBaseRadius();
    wheelRing.style.transform = 'rotate(0deg)';

    var total = state.deck.length;  // 78
    var radius = state.baseRadius;
    var angleStep = 360 / total;

    for (var i = 0; i < total; i++) {
      // 目标角度：从0°(正上方)开始顺时针排列，card#1在顶部正中
      var targetAngle = angleStep * i;
      var card = document.createElement('div');
      card.className = 'wheel-card';
      card.dataset.index = i;
      card.dataset.angle = targetAngle;
      // 初始：全部叠在顶部正中（牌堆位置）
      card.style.transform = 'rotate(0deg) translateY(-' + radius + 'px)';
      card.style.transition = 'none';

      var img = document.createElement('img');
      img.src = CARD_BACK_IMAGE;
      img.alt = '牌 ' + (i + 1);
      img.draggable = false;
      card.appendChild(img);

      var num = document.createElement('span');
      num.className = 'card-number';
      num.textContent = i + 1;
      card.appendChild(num);

      card.addEventListener('click', handleWheelCardClick);
      wheelRing.appendChild(card);
    }

    updateWheelCardDepth();

    // 从顶部正中（牌堆位置）顺时针展开：每张牌依次延迟飞到目标位置
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var allCards = wheelRing.querySelectorAll('.wheel-card');
        for (var j = 0; j < allCards.length; j++) {
          var a = parseFloat(allCards[j].dataset.angle);
          var delay = j * 14;
          allCards[j].style.transition = 'transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ' + delay + 'ms';
          allCards[j].style.transform = 'rotate(' + a + 'deg) translateY(-' + radius + 'px)';
        }
      });
    });

    var totalAnimTime = 78 * 14 + 900 + 100;
    setTimeout(function () {
      var allCards = wheelRing.querySelectorAll('.wheel-card');
      for (var j = 0; j < allCards.length; j++) {
        allCards[j].style.transition = 'transform 0.3s ease';
      }
      bindWheelEvents();
      unlockUI();
    }, totalAnimTime);
  }

  function getBaseRadius() {
    var vh = wheelViewport.offsetHeight;
    var rootStyles = getComputedStyle(document.documentElement);
    var cardH = parseInt(rootStyles.getPropertyValue('--card-h'));
    // 确保顶部牌（0°）完全在视口内：vh - radius - cardH/2 >= 5
    return Math.floor(vh - cardH / 2 - 5);
  }

  function normalizeAngle(angle) {
    var normalized = angle % 360;
    return normalized < 0 ? normalized + 360 : normalized;
  }

  function updateWheelCardDepth() {
    var allCards = wheelRing.querySelectorAll('.wheel-card');
    for (var i = 0; i < allCards.length; i++) {
      var card = allCards[i];
      var currentAngle = normalizeAngle(parseFloat(card.dataset.angle) + state.wheelAngle);
      var angleDist = currentAngle <= 180 ? currentAngle : 360 - currentAngle;
      card.style.zIndex = String(181 - Math.round(angleDist));
    }
  }

  /* ===== 轮盘旋转事件（无缩放） ===== */
  function bindWheelEvents() {
    wheelViewport.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    wheelViewport.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  }

  function cleanupWheelEvents() {
    wheelViewport.removeEventListener('mousedown', onPointerDown);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
    wheelViewport.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  }

  function getAngleFromCenter(x, y) {
    var rect = wheelViewport.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.bottom;
    return Math.atan2(y - cy, x - cx) * (180 / Math.PI);
  }

  /* --- Mouse --- */
  function onPointerDown(e) {
    if (e.button !== 0) return;
    state.dragging = true;
    state.dragMoved = false;
    state.lastPointerAngle = getAngleFromCenter(e.clientX, e.clientY);
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (!state.dragging) return;
    var angle = getAngleFromCenter(e.clientX, e.clientY);
    var delta = angle - state.lastPointerAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    if (Math.abs(delta) > 0.3) state.dragMoved = true;
    state.wheelAngle += delta;
    state.lastPointerAngle = angle;
    applyWheelTransform();
  }
  function onPointerUp() {
    state.dragging = false;
  }

  /* --- Touch --- */
  function onTouchStart(e) {
    if (e.touches.length === 1) {
      state.dragging = true;
      state.dragMoved = false;
      state.lastPointerAngle = getAngleFromCenter(e.touches[0].clientX, e.touches[0].clientY);
    }
  }
  function onTouchMove(e) {
    if (e.touches.length === 1 && state.dragging) {
      var t = e.touches[0];
      var angle = getAngleFromCenter(t.clientX, t.clientY);
      var delta = angle - state.lastPointerAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      if (Math.abs(delta) > 0.3) state.dragMoved = true;
      state.wheelAngle += delta;
      state.lastPointerAngle = angle;
      applyWheelTransform();
      e.preventDefault();
    }
  }
  function onTouchEnd(e) {
    if (e.touches.length === 0) {
      state.dragging = false;
    }
  }

  function applyWheelTransform() {
    wheelRing.style.transition = 'none';
    wheelRing.style.transform = 'rotate(' + state.wheelAngle + 'deg)';
    updateWheelCardDepth();
  }

  /* ===== 点击轮盘牌抽牌 ===== */
  function handleWheelCardClick(e) {
    if (state.phase !== 'drawing') return;
    if (state.animating) return;
    if (state.drawIndex >= 3) return;
    if (state.dragMoved) return;

    var target = e.currentTarget;
    if (target.classList.contains('drawn')) return;

    var idx = parseInt(target.dataset.index);
    var cardData = state.deck[idx];
    state.drawnCards.push(cardData);
    target.classList.add('drawn');

    drawCardFromWheel(target, cardData);
  }

  function drawCardFromWheel(wheelCard, cardData) {
    lockUI();
    var slotIndex = state.drawIndex;
    // 使用轮盘内嵌的放牌区
    var slot = $('#wSlot' + slotIndex);
    var placeholder = slot.querySelector('.card-placeholder');

    var rootStyles = getComputedStyle(document.documentElement);
    var cardW = parseInt(rootStyles.getPropertyValue('--card-w'));
    var cardH = parseInt(rootStyles.getPropertyValue('--card-h'));

    var flyCard = document.createElement('div');
    flyCard.className = 'deck-card';
    flyCard.style.width = cardW + 'px';
    flyCard.style.height = cardH + 'px';

    var img = document.createElement('img');
    img.src = CARD_BACK_IMAGE;
    img.alt = cardData.nameCN;
    img.draggable = false;
    flyCard.appendChild(img);

    var wcRect = wheelCard.getBoundingClientRect();
    var startX = wcRect.left + wcRect.width / 2 - cardW / 2;
    var startY = wcRect.top + wcRect.height / 2 - cardH / 2;

    var slotRect = placeholder.getBoundingClientRect();
    var endX = slotRect.left;
    var endY = slotRect.top;

    flyCard.style.position = 'fixed';
    flyCard.style.left = startX + 'px';
    flyCard.style.top = startY + 'px';
    flyCard.style.zIndex = '200';
    flyCard.style.transition = 'none';
    document.body.appendChild(flyCard);

    void flyCard.offsetHeight;
    flyCard.style.transition = 'left 0.6s cubic-bezier(0.22, 1, 0.36, 1), top 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    flyCard.style.left = endX + 'px';
    flyCard.style.top = endY + 'px';

    setTimeout(function () {
      if (flyCard.parentNode) document.body.removeChild(flyCard);
      placeFlipper(slot, cardData, slotIndex);
      state.drawIndex++;

      if (state.drawIndex >= 3) {
        state.phase = 'drawn';
        if (sectionHint) sectionHint.textContent = '点击牌面翻牌查看解读。';
        foldWheelToDeck();
      }
      unlockUI();
    }, 650);
  }

  /* ===== 轮盘折叠回牌堆 ===== */
  function foldWheelToDeck() {
    var allCards = wheelRing.querySelectorAll('.wheel-card');
    var radius = state.baseRadius;

    // 所有牌收拢回顶部正中（牌堆位置），依次延迟
    for (var i = 0; i < allCards.length; i++) {
      var delay = i * 8;
      allCards[i].style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ' + delay + 'ms, opacity 0.4s ' + delay + 'ms';
      allCards[i].style.transform = 'rotate(0deg) translateY(-' + radius + 'px)';
    }

    setTimeout(function () {
      // 将轮盘内的放牌区卡牌移到主放牌区
      moveWheelSlotsToMain();
      wheelWrapper.style.display = 'none';
      cleanupWheelEvents();
      deckArea.style.display = '';
      drawingTitle.style.display = '';
      drawingArea.style.display = '';
      buildDeckStack();
    }, 1200);
  }

  /* 将轮盘内放牌区的卡牌移到主放牌区 */
  function moveWheelSlotsToMain() {
    for (var i = 0; i < 3; i++) {
      var wSlot = $('#wSlot' + i);
      var mainSlot = $('#slot' + i);
      if (!wSlot || !mainSlot) continue;

      var placed = wSlot.querySelector('.placed-card');
      if (placed) {
        // 隐藏主区的占位框
        var mainPlaceholder = mainSlot.querySelector('.card-placeholder');
        if (mainPlaceholder) mainPlaceholder.style.display = 'none';
        // 移动卡牌到主区
        mainSlot.insertBefore(placed, mainSlot.querySelector('.slot-label'));
      }
      // 复制标签文本
      var wLabel = wSlot.querySelector('.slot-label');
      var mainLabel = mainSlot.querySelector('.slot-label');
      if (wLabel && mainLabel) mainLabel.textContent = wLabel.textContent;
    }
  }

  /* ===== 放置可翻转牌 ===== */
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
    if (cardData.reversed) back.classList.add('reversed');
    var backImg = document.createElement('img');
    backImg.src = cardData.image;
    backImg.alt = cardData.nameCN;
    backImg.draggable = false;
    back.appendChild(backImg);

    inner.appendChild(front);
    inner.appendChild(back);
    flipContainer.appendChild(inner);

    flipContainer.addEventListener('click', function handler() {
      if (inner.classList.contains('flipped')) return;
      inner.classList.add('flipped');
      state.flippedCount++;
      flipContainer.removeEventListener('click', handler);

      // 动态找到当前父级 slot 的 label（牌可能已从 wSlot 移到 mainSlot）
      var parentSlot = flipContainer.closest('.card-slot');
      var label = parentSlot ? parentSlot.querySelector('.slot-label') : null;
      if (label) {
        label.textContent = cardData.reversed
          ? cardData.nameCN + '（逆位）'
          : cardData.nameCN;
      }

      showInterpretation(cardData, slotIndex);
      updateButtons();
    });

    slot.insertBefore(flipContainer, slot.querySelector('.slot-label'));
  }

  /* ===== 牌义展示 ===== */
  function showInterpretation(cardData, slotIndex) {
    var posLabel = '栏位 ' + (slotIndex + 1);
    var orientation = cardData.reversed ? '逆位' : '正位';
    var kw = cardData.reversed
      ? (cardData.reversedKeywordsCN || cardData.keywordsCN)
      : cardData.keywordsCN;
    var html =
      '<div class="interp-card">' +
        '<div class="interp-position">' + posLabel + ' · ' + orientation + '</div>' +
        '<div class="interp-name">' + cardData.nameCN + '（' + cardData.name + '）</div>' +
        '<div class="interp-keywords">' + kw + '</div>' +
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
    state.wheelAngle = 0;
    state.baseRadius = 0;

    cleanupWheelEvents();

    wheelWrapper.style.display = 'none';
    deckArea.style.display = '';
    drawingTitle.style.display = '';
    drawingArea.style.display = '';
    buildDeckStack();
    resetSlots();

    if (sectionHint) sectionHint.textContent = '专注于你的问题，然后点击洗牌。';

    var mc = $('#interpretationContentMobile');
    if (mc) mc.innerHTML = '<p class="interpretation-placeholder">抽牌后将在此显示解读...</p>';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateButtons();
  }

  function resetSlots() {
    for (var i = 0; i < 3; i++) {
      // 主放牌区
      var slot = $('#slot' + i);
      if (slot) {
        var existing = slot.querySelector('.placed-card');
        if (existing) existing.remove();
        var placeholder = slot.querySelector('.card-placeholder');
        if (placeholder) placeholder.style.display = '';
        var label = slot.querySelector('.slot-label');
        if (label) label.innerHTML = '&nbsp;';
      }
      // 轮盘内放牌区
      var wSlot = $('#wSlot' + i);
      if (wSlot) {
        var wExisting = wSlot.querySelector('.placed-card');
        if (wExisting) wExisting.remove();
        var wPlaceholder = wSlot.querySelector('.card-placeholder');
        if (wPlaceholder) wPlaceholder.style.display = '';
        var wLabel = wSlot.querySelector('.slot-label');
        if (wLabel) wLabel.innerHTML = '&nbsp;';
      }
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