// Shared flag — set on save button click, consumed by the next ajaxSend
var d2cSaveArmed = false;
var d2cSaveArmTimer = null;

export function buildSaveIndicator() {
  if (document.getElementById('d2c-save-indicator')) return;
  var indicator = document.createElement('div');
  indicator.id = 'd2c-save-indicator';
  indicator.className = 'd2c-save-idle';
  indicator.style.display = 'none';
  indicator.innerHTML = '<i class="fa fa-check-circle"></i><span id="d2c-save-text">All changes saved</span>';
  document.body.appendChild(indicator);

  var textEl = document.getElementById('d2c-save-text');
  var iconEl = indicator.querySelector('i');
  var hideTimer = null;
  var trackedXhr = null; // only watch the specific XHR we armed for

  function showSaving() {
    clearTimeout(hideTimer);
    indicator.style.display = '';
    indicator.className = 'd2c-save-active';
    iconEl.className = 'fa fa-spinner fa-spin';
    textEl.textContent = 'Saving\u2026';
  }
  function showSaved() {
    trackedXhr = null;
    indicator.className = 'd2c-save-success';
    iconEl.className = 'fa fa-check-circle';
    textEl.textContent = 'All changes saved';
    hideTimer = setTimeout(function () {
      indicator.className = 'd2c-save-idle';
      indicator.style.display = 'none';
    }, 3000);
  }
  function showError() {
    trackedXhr = null;
    clearTimeout(hideTimer);
    indicator.style.display = '';
    indicator.className = 'd2c-save-error';
    iconEl.className = 'fa fa-exclamation-triangle';
    textEl.textContent = 'Save failed \u2014 check console';
  }

  // Arm on save button click (capture phase — fires before the button's own handler)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[onclick*="save"], #d2c-floating-save');
    if (!btn) return;
    d2cSaveArmed = true;
    clearTimeout(d2cSaveArmTimer);
    // Safety: disarm after 15s in case the AJAX never fires
    d2cSaveArmTimer = setTimeout(function () { d2cSaveArmed = false; }, 15000);
  }, true);

  if (typeof jQuery !== 'undefined') {
    jQuery(document).ajaxSend(function (e, xhr, cfg) {
      if (!d2cSaveArmed || cfg.type !== 'POST') return;
      // Consume the arm — only track this one specific XHR
      d2cSaveArmed = false;
      clearTimeout(d2cSaveArmTimer);
      trackedXhr = xhr;
      showSaving();
    });
    jQuery(document).ajaxSuccess(function (_e, xhr) {
      if (xhr === trackedXhr) showSaved();
    });
    jQuery(document).ajaxError(function (_e, xhr) {
      if (xhr === trackedXhr) showError();
    });
  }
}
