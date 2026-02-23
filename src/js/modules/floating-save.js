import { getRightPanel } from './utils.js';

export function buildFloatingSave() {
  if (document.getElementById('d2c-floating-save')) return;

  // Find the page's original save button to know what function to call
  var origSaveBtn = document.querySelector('.button[onclick*="save"], button.button[onclick*="save"]');
  if (!origSaveBtn) return; // no save button on this page

  var btn = document.createElement('button');
  btn.id = 'd2c-floating-save';
  btn.type = 'button';
  btn.innerHTML = '<i class="fa fa-floppy-o"></i> Save';
  getRightPanel().appendChild(btn);

  btn.addEventListener('click', function () {
    // Trigger the same onclick as the original save button
    origSaveBtn.click();
  });
}
