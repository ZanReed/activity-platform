// =============================================================================
// runtime/runtime.ts — Client-side runtime for published HTML
// -----------------------------------------------------------------------------
// This is shipped as a string, embedded into the published HTML. No bundler
// involved — the renderer concatenates it into a <script> tag. So this code
// must:
//   * Be valid JavaScript (no TypeScript-only syntax)
//   * Use only widely-supported browser APIs (no top-level await,
//     no class fields if older browsers matter)
//   * Have no module imports
//
// We write it AS a TypeScript template literal for editor support, but the
// content is runtime-only JS. The TS file imports nothing and exports a
// single string.
// =============================================================================

export const runtimeJs = `
(function() {
  'use strict';

  var STORAGE_KEY_NAME = 'activity_student_name';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // Restore name from previous activity (same domain).
  function loadStoredName() {
    try { return localStorage.getItem(STORAGE_KEY_NAME) || ''; }
    catch (e) { return ''; }
  }
  function saveName(name) {
    try { localStorage.setItem(STORAGE_KEY_NAME, name); }
    catch (e) { /* private mode etc — ignore */ }
  }

  // ---- Answer evaluation strategies -----------------------------------------
  // Each strategy answers one question: "given a trimmed, non-empty typed
  // value and the blank element's metadata, is the answer correct?" Strategies
  // are pure boolean checks — they don't touch the DOM beyond reading data-*
  // attributes off the blank, and they don't handle empty input (caller does).
  //
  // Phase 1 ships only 'list'. Phase 2.5 (parameterized problems) will add
  // 'expression' (e.g. math.js-style equivalence) and possibly 'computed' (a
  // parameterized problem with a variant-aware answer key). Adding a strategy
  // is one entry here plus the renderer emitting data-blank-strategy="<name>"
  // on the input — no changes to gatherResponses or checkBlank.
  var strategies = {
    list: function(input, typed) {
      var answers = (input.getAttribute('data-blank-answers') || '').split('|');
      return answers.indexOf(typed) !== -1;
    },
  };

  function evaluateAnswer(input, typed) {
    var name = input.getAttribute('data-blank-strategy') || 'list';
    var strategy = strategies[name];
    if (!strategy) {
      // Misconfigured activity. Don't break submission for students — warn
      // (visible in DevTools) and fall back to list comparison so existing
      // data-blank-answers still scores something.
      if (window.console) {
        console.warn('Unknown blank strategy "' + name + '", falling back to list');
      }
      strategy = strategies.list;
    }
    return strategy(input, typed);
  }

  // ---- Blank validation -----------------------------------------------------
  // On blur, mark a blank correct/incorrect. Comparison is whitespace-trimmed
  // and case-sensitive — the case sensitivity matches what teachers expect for
  // math (variable names, function names). Case-insensitive comparison for
  // verbal answers is a future per-strategy concern, not a global one.
  function checkBlank(input) {
    var value = input.value.replace(/^\\s+|\\s+$/g, '');
    if (value === '') {
      input.classList.remove('correct', 'incorrect');
      return null; // unscored
    }
    var correct = evaluateAnswer(input, value);
    input.classList.toggle('correct', correct);
    input.classList.toggle('incorrect', !correct);
    return correct;
  }

  function wireBlanks() {
    $$('.blank').forEach(function(input) {
      input.addEventListener('blur', function() { checkBlank(input); });
    });
  }

  // ---- Submission -----------------------------------------------------------
  function gatherResponses() {
    var blanks = {};
    var totalCorrect = 0;
    var totalScored = 0;
    $$('.blank').forEach(function(input) {
      var id = input.getAttribute('data-blank-id');
      if (!id) return;
      var correct = checkBlank(input);
      if (correct !== null) totalScored += 1;
      if (correct === true) totalCorrect += 1;
      blanks[id] = {
        answer: input.value.replace(/^\\s+|\\s+$/g, ''),
        correct: correct === true,
      };
    });
    var score = totalScored > 0 ? totalCorrect / totalScored : 0;
    return { blanks: blanks, score: score, totalScored: totalScored };
  }

  function setStatus(msg, kind) {
    var el = $('.submit-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'submit-status' + (kind ? ' ' + kind : '');
  }

  function setScore(score, total) {
    var el = $('.score-display');
    if (!el || total === 0) return;
    var pct = Math.round(score * 100);
    el.textContent = 'Score: ' + Math.round(score * total) + ' / ' + total + ' (' + pct + '%)';
  }

  function submit(config) {
    var nameInput = $('#student-name');
    var name = nameInput ? nameInput.value.replace(/^\\s+|\\s+$/g, '') : '';
    if (!name) {
      setStatus('Please enter your name before submitting.', 'error');
      if (nameInput) nameInput.focus();
      return;
    }
    saveName(name);

    var data = gatherResponses();
    var payload = {
      activityId: config.activityId,
      displayName: name,
      responses: { schemaVersion: 1, blanks: data.blanks },
      score: data.score,
    };

    var button = $('.submit-button');
    if (button) button.disabled = true;
    setStatus('Submitting…');

    fetch(config.submissionEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function(res) {
        if (!res.ok) {
          return res.text().then(function(t) { throw new Error('Submission failed: ' + (t || res.status)); });
        }
        return res.json();
      })
      .then(function() {
        setStatus('Submitted! You can close this page.', 'success');
        setScore(data.score, data.totalScored);
        if (button) {
          button.disabled = true;
          button.textContent = 'Submitted';
        }
      })
      .catch(function(err) {
        setStatus(err.message || 'Submission failed. Please try again.', 'error');
        if (button) button.disabled = false;
      });
  }

  // ---- Bootstrap ------------------------------------------------------------
  function init() {
    var configEl = document.getElementById('activity-config');
    if (!configEl) return;
    var config;
    try { config = JSON.parse(configEl.textContent || '{}'); }
    catch (e) { console.error('Invalid activity config'); return; }

    // Restore name from a previous session
    var nameInput = $('#student-name');
    if (nameInput) nameInput.value = loadStoredName();

    wireBlanks();

    var button = $('.submit-button');
    if (button) {
      button.addEventListener('click', function() { submit(config); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;
