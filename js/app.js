/*
 * Oregon Accommodation Request Builder — wizard UI.
 *
 * In-memory only: no localStorage, no network, no cookies, no analytics.
 * Answers live in a single JS object; "Start over" or closing the tab
 * erases them.
 */
(function () {
  'use strict';

  var A = window.ACCOMMODATION;

  var state = {
    view: 'intro',
    trackId: null,
    answers: {},
    includeLaw: true,
    tab: 'employee'
  };

  function el(id) { return document.getElementById(id); }

  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text !== undefined) { n.textContent = text; }
    return n;
  }

  /* ---------------------------------------------------------------- */
  /* Section configuration (depends on selected track)                  */
  /* ---------------------------------------------------------------- */

  function trackSections() {
    var t = A.TRACKS[state.trackId];
    return [
      {
        view: 'identity',
        title: 'About you',
        intro: 'These details mirror the official state request form, so your manager has everything needed to route your request. All fields are optional \u2014 anything you leave blank shows up as a [bracketed] fill-in in the text.',
        fields: A.IDENTITY_FIELDS
      },
      {
        view: 'impact',
        title: t.impactTitle,
        intro: '',
        fields: t.impactFields
      },
      {
        view: 'request',
        title: t.requestTitle,
        intro: '',
        fields: [
          { id: 'accommodations', type: 'checkbox', label: 'Check anything you would like to request:', options: t.requestOptions },
          { id: 'otherText', type: 'text', label: 'Other \u2014 describe it', placeholder: 'e.g., a quiet room for focused work one afternoon a week' },
          { id: 'requestDetail', type: 'textarea', label: 'Describe the accommodation you are requesting, in your own words', placeholder: 'e.g., A sit-stand desk converter for my workstation, with standing tasks capped at 15 minutes at a time.' },
          { id: 'howHelps', type: 'textarea', label: 'How will it help you keep doing your job?', placeholder: 'e.g., It lets me keep processing cases at full speed without the flare-ups that currently force me to stop.' }
        ]
      },
      {
        view: 'process',
        title: 'Duration, documentation & next steps',
        intro: '',
        fields: A.DURATION_FIELDS.concat(t.docsFields, A.PROCESS_FIELDS)
      }
    ];
  }

  /* ---------------------------------------------------------------- */
  /* Field rendering                                                    */
  /* ---------------------------------------------------------------- */

  function renderField(f) {
    var wrap = h('div', 'field field-' + f.type);

    if (f.type === 'radio' || f.type === 'checkbox') {
      var fs = h('fieldset', 'group');
      fs.appendChild(h('legend', 'field-label', f.label));
      if (f.hint) { fs.appendChild(h('div', 'field-hint', f.hint)); }
      var boxes = h('div', 'group-items');
      (f.options || []).forEach(function (opt) {
        var value = (typeof opt === 'string') ? opt : opt.value;
        var label = (typeof opt === 'string') ? opt : opt.label;
        var item = h('label', 'option');
        var input = document.createElement('input');
        input.type = (f.type === 'radio') ? 'radio' : 'checkbox';
        input.name = f.id;
        input.value = value;
        if (f.type === 'radio') {
          if (state.answers[f.id] === input.value) { input.checked = true; }
          input.addEventListener('change', function () {
            state.answers[f.id] = input.value;
          });
        } else {
          if (!Array.isArray(state.answers[f.id])) { state.answers[f.id] = []; }
          input.checked = state.answers[f.id].indexOf(input.value) >= 0;
          input.addEventListener('change', function () {
            var arr = state.answers[f.id];
            var i = arr.indexOf(input.value);
            if (input.checked && i < 0) { arr.push(input.value); }
            if (!input.checked && i >= 0) { arr.splice(i, 1); }
          });
        }
        item.appendChild(input);
        item.appendChild(h('span', 'option-label', label));
        boxes.appendChild(item);
      });
      fs.appendChild(boxes);
      wrap.appendChild(fs);
      return wrap;
    }

    var lab = h('label', 'field-label', f.label);
    lab.setAttribute('for', 'f-' + f.id);
    wrap.appendChild(lab);
    if (f.hint) { wrap.appendChild(h('div', 'field-hint', f.hint)); }

    var input;
    if (f.type === 'textarea') {
      input = h('textarea');
      input.rows = 5;
    } else {
      input = h('input');
      input.type = 'text';
    }
    input.id = 'f-' + f.id;
    if (f.placeholder) { input.placeholder = f.placeholder; }
    input.value = state.answers[f.id] || '';
    input.addEventListener('input', function () {
      state.answers[f.id] = input.value;
    });
    wrap.appendChild(input);
    return wrap;
  }

  /* ---------------------------------------------------------------- */
  /* Views                                                              */
  /* ---------------------------------------------------------------- */

  function renderIntro() {
    var card = h('div', 'card intro');
    card.appendChild(h('h2', null, 'A complete request \u2014 in five short steps'));

    var ol = h('ol', 'steps');
    [
      'Tell it what kind of help you need \u2014 a disability, a pregnancy-related condition, expressing milk at work, or a religious observance.',
      'Answer plain-language questions about your situation, what you are asking for, and for how long.',
      'Copy the finished text into an email or document and give it to your manager.',
      'Your manager also gets a matching summary with exactly what HR / Employee Services needs \u2014 no check-back for missing details.'
    ].forEach(function (s) {
      var li = h('li', null, s);
      ol.appendChild(li);
    });
    card.appendChild(ol);

    var priv = h('div', 'callout');
    priv.appendChild(h('strong', null, 'Nothing you type is stored or sent anywhere.'));
    priv.appendChild(h('p', null, 'The page runs entirely in your browser. There is no account, no save button, no server, and no analytics. Closing the tab erases everything \u2014 copy or download your text before you leave.'));
    card.appendChild(priv);

    var nodx = h('div', 'callout');
    nodx.appendChild(h('strong', null, 'It does not ask for a diagnosis.'));
    nodx.appendChild(h('p', null, 'Oregon law triggers on \u201cknown limitations.\u201d You describe what is difficult and what would help, in your own words. Your agency may later ask your provider for functional details if the interactive process needs them.'));
    card.appendChild(nodx);

    var start = h('button', 'btn btn-primary', 'Start');
    start.addEventListener('click', function () { go('track'); });
    card.appendChild(start);
    return card;
  }

  function renderTrackSelect() {
    var card = h('div', 'card');
    card.appendChild(h('h2', null, 'What kind of help do you need?'));
    card.appendChild(h('p', 'muted', 'Pick the closest fit \u2014 you can edit the text later, and your manager or HR can help route it.'));

    var nextBtn = h('button', 'btn btn-primary', 'Continue');
    nextBtn.disabled = !state.trackId;

    Object.keys(A.TRACKS).forEach(function (id) {
      var t = A.TRACKS[id];
      var lab = h('label', 'track-card');
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'track';
      input.value = id;
      if (state.trackId === id) { input.checked = true; }
      input.addEventListener('change', function () {
        if (state.trackId !== id) { state.answers = {}; }
        state.trackId = id;
        nextBtn.disabled = false;
      });
      lab.appendChild(input);
      var body = h('span', 'track-body');
      body.appendChild(h('span', 'track-label', t.label));
      body.appendChild(h('span', 'track-summary', t.summary));
      lab.appendChild(body);
      card.appendChild(lab);
    });

    nextBtn.addEventListener('click', function () { go('identity'); });
    card.appendChild(navRow('intro', nextBtn));
    return card;
  }

  function renderSection(sec, idx) {
    var card = h('div', 'card');
    card.appendChild(h('h2', null, sec.title));
    if (sec.intro) { card.appendChild(h('p', 'muted', sec.intro)); }
    sec.fields.forEach(function (f) { card.appendChild(renderField(f)); });

    var secs = trackSections();
    var isLast = (idx + 1 >= secs.length);
    var nextBtn = h('button', 'btn btn-primary', isLast ? 'Review my request' : 'Continue');
    nextBtn.addEventListener('click', function () {
      go(isLast ? 'review' : secs[idx + 1].view);
    });
    var backView = (idx === 0) ? 'track' : secs[idx - 1].view;
    card.appendChild(navRow(backView, nextBtn));
    return card;
  }

  function renderReview() {
    var card = h('div', 'card review');
    card.appendChild(h('h2', null, 'Your request is ready'));
    var who = (state.answers.supervisor && state.answers.supervisor.trim()) || 'your manager';
    card.appendChild(h('p', 'muted', 'Copy the text below into an email or document and give it to ' + who + '. The second tab is a matching summary your manager can forward to HR / Employee Services, with fill-in brackets for the dates only a manager knows.'));

    var law = h('label', 'check-inline');
    var lawInput = document.createElement('input');
    lawInput.type = 'checkbox';
    lawInput.checked = state.includeLaw;
    lawInput.addEventListener('change', function () {
      state.includeLaw = lawInput.checked;
      refreshOutput();
    });
    law.appendChild(lawInput);
    law.appendChild(h('span', null, 'Include the legal basis in the footer (recommended)'));
    card.appendChild(law);

    var tabs = h('div', 'tabs');
    [ { id: 'employee', label: 'Request to my manager' },
      { id: 'manager', label: 'Summary for HR / Employee Services' }
    ].forEach(function (tb) {
      var b = h('button', 'tab' + (state.tab === tb.id ? ' tab-active' : ''), tb.label);
      b.addEventListener('click', function () {
        state.tab = tb.id;
        go('review');
      });
      tabs.appendChild(b);
    });
    card.appendChild(tabs);

    var ta = h('textarea', 'output');
    ta.id = 'output';
    ta.readOnly = true;
    ta.setAttribute('aria-label', 'Generated text \u2014 read only');
    card.appendChild(ta);

    var acts = h('div', 'actions');
    var copy = h('button', 'btn btn-primary', 'Copy text');
    copy.addEventListener('click', function () { copyOut(copy); });
    var dl = h('button', 'btn btn-ghost', 'Download .txt');
    dl.addEventListener('click', downloadOut);
    var pr = h('button', 'btn btn-ghost', 'Print');
    pr.addEventListener('click', function () {
      el('printArea').textContent = currentText();
      window.print();
    });
    var reset = h('button', 'btn btn-danger-ghost', 'Start over');
    reset.addEventListener('click', function () {
      if (window.confirm('Clear all answers and start over? Everything you typed lives only in this tab and will be erased.')) {
        state.view = 'intro';
        state.trackId = null;
        state.answers = {};
        state.tab = 'employee';
        render();
      }
    });
    [copy, dl, pr, reset].forEach(function (b) { acts.appendChild(b); });
    card.appendChild(acts);

    card.appendChild(h('p', 'muted fine', 'Nothing is stored anywhere \u2014 copy or download before closing this tab.'));
    /* NOTE: the card is not attached to the document yet, so refreshOutput()
       (which looks the textarea up by id) cannot find it here. Populate the
       detached textarea directly; refreshOutput() handles later updates
       (law toggle) once the card is in the DOM. */
    ta.value = currentText();
    el('printArea').textContent = ta.value;
    return card;
  }

  function navRow(backView, nextBtn) {
    var row = h('div', 'nav-row');
    var back = h('button', 'btn btn-ghost', 'Back');
    back.addEventListener('click', function () { go(backView); });
    row.appendChild(back);
    if (nextBtn) { row.appendChild(nextBtn); }
    return row;
  }

  /* ---------------------------------------------------------------- */
  /* Output actions                                                     */
  /* ---------------------------------------------------------------- */

  function currentText() {
    return state.tab === 'employee' ? A.buildEmployeeText(state) : A.buildManagerText(state);
  }

  function refreshOutput() {
    var ta = el('output');
    if (ta) {
      ta.value = currentText();
      el('printArea').textContent = ta.value;
    }
  }

  function copyOut(btn) {
    var text = currentText();
    var ok = function () {
      btn.textContent = 'Copied \u2713';
      setTimeout(function () { btn.textContent = 'Copy text'; }, 2000);
    };
    var fallback = function () {
      var ta = el('output');
      ta.focus();
      ta.select();
      try {
        if (document.execCommand('copy')) { ok(); return; }
      } catch (e) { /* fall through */ }
      btn.textContent = 'Press Ctrl/Cmd-C to copy';
      setTimeout(function () { btn.textContent = 'Copy text'; }, 2500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else {
      fallback();
    }
  }

  function downloadOut() {
    var blob = new Blob([currentText()], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'accommodation-request.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
  }

  /* ---------------------------------------------------------------- */
  /* Progress + routing                                                  */
  /* ---------------------------------------------------------------- */

  function progressNode() {
    var order = ['track', 'identity', 'impact', 'request', 'process'];
    var idx = order.indexOf(state.view);
    var wrap = h('div', 'progress');
    var bar = h('div', 'progress-bar');
    var fill = h('div', 'progress-fill');
    if (state.view === 'review') {
      fill.className = 'progress-fill done';
    } else if (idx >= 0) {
      fill.className = 'progress-fill p' + (idx + 1);
    } else {
      fill.className = 'progress-fill p0';
    }
    bar.appendChild(fill);
    wrap.appendChild(bar);
    var label = (state.view === 'review')
      ? 'Review & copy'
      : 'Step ' + (idx + 1) + ' of 5';
    wrap.appendChild(h('p', 'progress-label', label));
    return wrap;
  }

  function go(view) {
    state.view = view;
    render();
    var hd = document.querySelector('#app h2');
    if (hd) {
      hd.setAttribute('tabindex', '-1');
      hd.focus();
    }
    window.scrollTo(0, 0);
  }

  function render() {
    var app = el('app');
    app.textContent = '';
    if (state.view === 'intro') {
      app.appendChild(renderIntro());
      return;
    }
    app.appendChild(progressNode());
    if (state.view === 'track') {
      app.appendChild(renderTrackSelect());
    } else if (state.view === 'review') {
      app.appendChild(renderReview());
    } else {
      var secs = trackSections();
      for (var i = 0; i < secs.length; i++) {
        if (secs[i].view === state.view) {
          app.appendChild(renderSection(secs[i], i));
          break;
        }
      }
    }
  }

  render();
}());
