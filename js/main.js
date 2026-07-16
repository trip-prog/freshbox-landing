/* ============================================================
   FreshBox — интерактив лендинга
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Данные меню ---------- */
  var U = 'https://images.unsplash.com/';
  var IMG = function (id, w) { return U + id + '?auto=format&fit=crop&w=' + (w || 480) + '&q=70'; };

  var MENU = {
    breakfast: [
      { name: 'Тосты с ягодами и мёдом', kcal: 340, p: 11, f: 9, c: 52, img: 'photo-1484723091739-30a097e8f929' },
      { name: 'Смузи-боул с гранолой', kcal: 310, p: 9, f: 8, c: 48, img: 'photo-1490474418585-ba9bad8fd0ea' },
      { name: 'Авокадо-тост с яйцом', kcal: 390, p: 16, f: 21, c: 34, img: 'photo-1482049016688-2d3e1b311543' },
      { name: 'Овсяная каша с фруктами', kcal: 320, p: 10, f: 7, c: 54, img: 'photo-1504674900247-0877df9cc836' }
    ],
    lunch: [
      { name: 'Боул с курицей и киноа', kcal: 480, p: 34, f: 14, c: 52, img: 'photo-1546069901-ba9599a7e63c' },
      { name: 'Лосось с овощами гриль', kcal: 520, p: 36, f: 24, c: 38, img: 'photo-1467003909585-2f8a72700288' },
      { name: 'Индейка с гарниром', kcal: 490, p: 38, f: 16, c: 44, img: 'photo-1432139555190-58524dae6a55' },
      { name: 'Рис с овощами и тофу', kcal: 430, p: 18, f: 12, c: 62, img: 'photo-1476224203421-9ac39bcb3327' }
    ],
    dinner: [
      { name: 'Овощной боул с авокадо', kcal: 380, p: 13, f: 18, c: 42, img: 'photo-1512621776951-a57141f2eefd' },
      { name: 'Паста с овощами', kcal: 420, p: 15, f: 12, c: 60, img: 'photo-1473093295043-cdd812d0e601' },
      { name: 'Вок с лапшой и овощами', kcal: 410, p: 17, f: 11, c: 58, img: 'photo-1455619452474-d2be8b1e70cd' },
      { name: 'Салат с нутом и фетой', kcal: 350, p: 14, f: 16, c: 36, img: 'photo-1540189549336-e6e99c3679fe' }
    ],
    snack: [
      { name: 'Йогурт-парфе с ягодами', kcal: 190, p: 9, f: 5, c: 26, img: 'photo-1488477181946-6428a0291777' },
      { name: 'Овощной детокс-микс', kcal: 140, p: 4, f: 2, c: 24, img: 'photo-1511690656952-34342bb7c2f2' },
      { name: 'Фруктовая тарелка', kcal: 160, p: 2, f: 1, c: 38, img: 'photo-1490645935967-10de6ba17061' },
      { name: 'Смузи манго-банан', kcal: 180, p: 4, f: 3, c: 34, img: 'photo-1494859802809-d069c3b71a8a' }
    ]
  };
  var MEAL_TYPES = [
    { key: 'breakfast', label: 'Завтрак' },
    { key: 'lunch', label: 'Обед' },
    { key: 'snack', label: 'Перекус' },
    { key: 'dinner', label: 'Ужин' }
  ];

  var fmt = function (n) { return n.toLocaleString('ru-RU'); };

  /* ---------- Header: тень при скролле ---------- */
  var header = document.getElementById('header');
  var onScroll = function () {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.classList.contains('nav__link')) {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Reveal-анимации ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Конструктор рациона ---------- */
  var state = { kcal: 1400, meals: 4, days: 5 };
  var DISCOUNTS = { 5: 0, 7: 5, 14: 10, 28: 15 };

  var kcalRange = document.getElementById('kcal-range');
  var kcalOutput = document.getElementById('kcal-output');

  var planFor = function (kcal) {
    if (kcal < 1600) return 'Balance';
    if (kcal < 2000) return 'Fit';
    return 'Power';
  };
  var dayPrice = function () {
    var raw = 420 + state.kcal * 0.24 + (state.meals - 3) * 70;
    return Math.round(raw / 10) * 10;
  };

  var renderSummary = function () {
    var price = dayPrice();
    var discount = DISCOUNTS[state.days];
    var total = Math.round(price * state.days * (1 - discount / 100) / 10) * 10;

    document.getElementById('sum-plan').textContent = planFor(state.kcal);
    document.getElementById('sum-kcal').textContent = fmt(state.kcal) + ' ккал';
    document.getElementById('sum-meals').textContent = state.meals + ' в день';
    document.getElementById('sum-day-price').textContent = fmt(price) + ' ₽';
    document.getElementById('sum-days').textContent = state.days + ' дней';
    document.getElementById('sum-total').textContent = fmt(total) + ' ₽';

    var discountRow = document.getElementById('sum-discount-row');
    discountRow.hidden = discount === 0;
    document.getElementById('sum-discount').textContent = '−' + discount + '%';
  };

  var syncRange = function () {
    kcalOutput.textContent = fmt(state.kcal) + ' ккал';
    var pct = (state.kcal - 1000) / (2500 - 1000) * 100;
    kcalRange.style.setProperty('--fill', pct + '%');
  };

  kcalRange.addEventListener('input', function () {
    state.kcal = Number(kcalRange.value);
    syncRange();
    renderSummary();
  });

  var activateChip = function (chip) {
    var group = chip.closest('.chips');
    group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
    chip.classList.add('is-active');
  };

  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      activateChip(chip);
      if (chip.dataset.goal) {
        state.kcal = Number(chip.dataset.kcal);
        kcalRange.value = state.kcal;
        syncRange();
      }
      if (chip.dataset.meals) state.meals = Number(chip.dataset.meals);
      if (chip.dataset.days) state.days = Number(chip.dataset.days);
      renderSummary();
    });
  });

  /* Кнопки «Выбрать план» в тарифах — настраивают конструктор */
  document.querySelectorAll('[data-plan-kcal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.kcal = Number(btn.dataset.planKcal);
      state.meals = Number(btn.dataset.planMeals);
      kcalRange.value = state.kcal;
      syncRange();
      document.querySelectorAll('[data-meals]').forEach(function (c) {
        c.classList.toggle('is-active', Number(c.dataset.meals) === state.meals);
      });
      document.querySelectorAll('[data-goal]').forEach(function (c) {
        c.classList.remove('is-active');
      });
      renderSummary();
      document.getElementById('constructor').scrollIntoView({ behavior: 'smooth' });
    });
  });

  syncRange();
  renderSummary();

  /* ---------- Меню: карточки и табы ---------- */
  var dishCard = function (dish) {
    return '<article class="dish">' +
      '<div class="dish__img"><img src="' + IMG(dish.img) + '" alt="' + dish.name + '" loading="lazy" width="480" height="360"></div>' +
      '<div class="dish__body">' +
      '<h3 class="dish__name">' + dish.name + '</h3>' +
      '<p class="dish__kcal">' + dish.kcal + ' ккал</p>' +
      '<p class="dish__macros"><span>Б ' + dish.p + ' г</span><span>Ж ' + dish.f + ' г</span><span>У ' + dish.c + ' г</span></p>' +
      '</div></article>';
  };

  Object.keys(MENU).forEach(function (key) {
    var panel = document.getElementById('tab-' + key);
    panel.innerHTML = MENU[key].map(dishCard).join('');
  });

  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      document.querySelectorAll('.menu__grid').forEach(function (panel) {
        var show = panel.id === 'tab-' + tab.dataset.tab;
        panel.classList.toggle('is-active', show);
        panel.hidden = !show;
      });
    });
  });

  /* ---------- Календарь питания ---------- */
  var CAL = {
    year: 2026,
    month: 6,            // июль (0-индексация)
    daysInMonth: 31,
    firstWeekday: 2,     // 1 июля 2026 — среда (0=Пн)
    today: 16
  };
  var calDays = document.getElementById('cal-days');
  var calDetail = document.getElementById('cal-detail');
  var skipped = {};      // { день: true }
  var selectedDay = CAL.today;

  /* Детерминированный «рандом» блюд по номеру дня */
  var mealsForDay = function (day) {
    return MEAL_TYPES.map(function (mt, i) {
      var list = MENU[mt.key];
      var dish = list[(day + i) % list.length];
      return { type: mt.label, dish: dish };
    });
  };

  var renderDetail = function () {
    var day = selectedDay;
    var html = '<div class="cal-detail__date"><strong>' + day + ' июля</strong></div>';

    if (skipped[day]) {
      html += '<p class="cal-detail__skipped-note">День пропущен — доставка не приедет, стоимость вернётся на баланс. Передумали?</p>';
      html += '<button class="btn--skip" type="button" id="skip-btn">Вернуть день</button>';
    } else {
      html += mealsForDay(day).map(function (m) {
        return '<div class="cal-detail__meal">' +
          '<img src="' + IMG(m.dish.img, 120) + '" alt="" loading="lazy" width="52" height="52">' +
          '<div><div class="cal-detail__meal-type">' + m.type + '</div>' +
          '<div class="cal-detail__meal-name">' + m.dish.name + '</div></div>' +
          '<span class="cal-detail__meal-kcal">' + m.dish.kcal + ' ккал</span>' +
          '</div>';
      }).join('');
      html += '<button class="btn--skip" type="button" id="skip-btn">Пропустить день</button>';
    }
    calDetail.innerHTML = html;

    document.getElementById('skip-btn').addEventListener('click', function () {
      skipped[selectedDay] = !skipped[selectedDay];
      renderCalendar();
      renderDetail();
    });
  };

  var renderCalendar = function () {
    var html = '';
    for (var e = 0; e < CAL.firstWeekday; e++) {
      html += '<span class="cal-day cal-day--empty" aria-hidden="true"></span>';
    }
    for (var d = 1; d <= CAL.daysInMonth; d++) {
      var cls = 'cal-day';
      if (d < CAL.today) cls += ' cal-day--past';
      if (d === CAL.today) cls += ' cal-day--today';
      if (skipped[d]) cls += ' is-skipped';
      if (d === selectedDay) cls += ' is-selected';
      html += '<button class="' + cls + '" type="button" data-day="' + d + '" aria-label="' + d + ' июля' +
        (skipped[d] ? ', день пропущен' : '') + '"' +
        (d === selectedDay ? ' aria-current="date"' : '') + '>' + d + '</button>';
    }
    calDays.innerHTML = html;
  };

  calDays.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-day]');
    if (!btn) return;
    selectedDay = Number(btn.dataset.day);
    renderCalendar();
    renderDetail();
  });

  renderCalendar();
  renderDetail();

  /* ---------- Модалка оформления ---------- */
  var modal = document.getElementById('checkout-modal');
  var formView = document.getElementById('checkout-form-view');
  var successView = document.getElementById('checkout-success-view');
  var form = document.getElementById('checkout-form');
  var nameInput = document.getElementById('f-name');
  var phoneInput = document.getElementById('f-phone');
  var lastFocused = null;

  var renderCheckoutSummary = function () {
    var price = dayPrice();
    var discount = DISCOUNTS[state.days];
    var total = Math.round(price * state.days * (1 - discount / 100) / 10) * 10;
    document.getElementById('checkout-summary').innerHTML =
      '<div class="row"><span>План</span><strong>' + planFor(state.kcal) + ' · ' + fmt(state.kcal) + ' ккал</strong></div>' +
      '<div class="row"><span>Приёмов пищи</span><strong>' + state.meals + ' в день</strong></div>' +
      '<div class="row"><span>Длительность</span><strong>' + state.days + ' дней' +
        (discount ? ' (−' + discount + '%)' : '') + '</strong></div>' +
      '<div class="row row--total"><span>Итого</span><strong>' + fmt(total) + ' ₽</strong></div>';
  };

  var openModal = function () {
    lastFocused = document.activeElement;
    renderCheckoutSummary();
    formView.hidden = false;
    successView.hidden = true;
    form.reset();
    nameInput.classList.remove('is-invalid');
    phoneInput.classList.remove('is-invalid');
    document.getElementById('err-name').hidden = true;
    document.getElementById('err-phone').hidden = true;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    nameInput.focus();
  };
  var closeModal = function () {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus();
  };

  document.querySelectorAll('[data-open-checkout]').forEach(function (btn) {
    btn.addEventListener('click', openModal);
  });
  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-close-checkout]')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* Маска телефона: +7 (XXX) XXX-XX-XX */
  phoneInput.addEventListener('input', function () {
    var digits = phoneInput.value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);
    var out = '+7';
    if (digits.length > 1) out += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
    if (digits.length >= 7) out += '-' + digits.slice(7, 9);
    if (digits.length >= 9) out += '-' + digits.slice(9, 11);
    phoneInput.value = out;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    var nameOk = nameInput.value.trim().length >= 2;
    nameInput.classList.toggle('is-invalid', !nameOk);
    document.getElementById('err-name').hidden = nameOk;
    if (!nameOk) valid = false;

    var phoneOk = phoneInput.value.replace(/\D/g, '').length === 11;
    phoneInput.classList.toggle('is-invalid', !phoneOk);
    document.getElementById('err-phone').hidden = phoneOk;
    if (!phoneOk) valid = false;

    if (!valid) {
      (nameOk ? phoneInput : nameInput).focus();
      return;
    }
    formView.hidden = true;
    successView.hidden = false;
    successView.querySelector('.btn').focus();
  });
})();
