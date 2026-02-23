/* ================================================================
   D2C Admin Panel — UI Enhancements
   Hosted on GitHub, served via jsDelivr CDN.
   Loaded by: devtools-loader.js (DevTools Local Override for
     admin.d2cmedia.ca/assets/js/sitepagesaddedjs.js)

   Edit here, push to GitHub, then purge jsDelivr cache:
     https://purge.jsdelivr.net/gh/cbemister/blue-admin-ui@main/src/js/d2c-enhancements.js
   ================================================================ */

(function () {
  'use strict';

  // ── Guard: only run once even if loaded from multiple override files ──
  if (document.getElementById('d2c-custom-styles')) return;

  /* ================================================================
     CSS INJECTION
     All custom styles injected here so we only need one override file.
     The hashed CSS bundles (resource.l-7fbe7fae.php etc.) are ignored.
     ================================================================ */
  var css = [
    /* Custom properties */
    ':root{--d2c-navy:#003b70;--d2c-navy-dark:#002a52;--d2c-blue:#0066cc;--d2c-blue-light:#e8f0fe;--bg:#f5f7fa;--surface:#fff;--border:#e2e8f0;--border-dark:#c4cdd6;--text:#1a2a3a;--text-muted:#64748b;--text-light:#94a3b8;--success:#10b981;--warning:#f59e0b;--danger:#ef4444;--info:#3b82f6;--header-height:95px;--content-max:1200px;--font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--mono:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;--r-sm:4px;--r-md:6px;--r-lg:8px;--r-xl:12px;--shadow-sm:0 1px 3px rgba(0,0,0,.07);--shadow-md:0 4px 12px rgba(0,0,0,.08);--shadow-lg:0 8px 28px rgba(0,0,0,.13);--t:.15s ease}',

    /* Reset & utilities */
    '*,*::before,*::after{box-sizing:border-box}',
    'body{font-family:var(--font);font-size:14px;line-height:1.6;color:var(--text);background:var(--bg);-webkit-font-smoothing:antialiased}',
    'a{color:var(--d2c-blue);transition:color var(--t)}a:hover{color:var(--d2c-navy);text-decoration:none}',
    '.d-none{display:none!important}.d-block{display:block!important}.d-flex{display:flex!important}.d-inline-block{display:inline-block!important}',
    '.pull-left{float:left!important}.pull-right{float:right!important}.hidden{display:none!important}.clearfix::after{content:"";display:table;clear:both}',
    '.fix-row-bootstrap{margin-left:0!important;margin-right:0!important}.bottom-zero{margin-bottom:0!important}',
    '.text-center{text-align:center!important}.text-right{text-align:right!important}.text-left{text-align:left!important}',
    '.text-muted{color:var(--text-muted)!important}.text-danger{color:var(--danger)!important}.text-success{color:var(--success)!important}',
    '.fw-bold,.font-weight-bold{font-weight:600!important}.small,small{font-size:12px!important}',
    '.mt-0{margin-top:0!important}.mt-1{margin-top:4px!important}.mt-2{margin-top:8px!important}.mt-3{margin-top:16px!important}',
    '.mb-0{margin-bottom:0!important}.mb-1{margin-bottom:4px!important}.mb-2{margin-bottom:8px!important}.mb-3{margin-bottom:16px!important}',

    /* Centered layout — sidebar hidden, content centered */
    '#wrapper{width:100%!important;max-width:none!important;overflow:visible!important;margin:0!important}',
    '.navbar-default.sidebar,div.navbar-default.sidebar{display:none!important}',
    '#page-wrapper{margin-left:0!important;min-height:calc(100vh - var(--header-height))!important;background:var(--bg)!important;padding:0!important}',
    '#content{width:auto!important;max-width:var(--content-max)!important;margin:0 auto!important;padding:28px 40px!important;box-sizing:border-box!important}',
    '@media(max-width:767px){#content{padding:16px!important}}',

    /* Sticky header */
    'nav.navbar.navbar-default{position:sticky!important;top:0!important;z-index:1030!important;background:var(--surface)!important;border:none!important;border-bottom:none!important;box-shadow:var(--shadow-sm)!important;border-radius:0!important;margin-bottom:0!important;width:100%!important;overflow:visible!important}',
    '#topRight{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;padding:6px 20px!important;background:var(--surface)!important;border-bottom:1px solid var(--border)!important;float:none!important;width:100%!important;box-sizing:border-box!important;position:relative!important}',
    'ul.navbar-top-links,.navbar-top-links{float:none!important;margin:0!important;display:flex!important;align-items:center!important;gap:2px!important}',
    '.navbar-top-links>li{display:inline-flex!important;align-items:center!important}',
    '.navbar-top-links>li>a{padding:5px 10px!important;color:var(--text-muted)!important;font-size:13px!important;border-radius:var(--r-md)!important;display:flex!important;align-items:center!important;gap:5px!important;transition:background var(--t),color var(--t)!important}',
    '.navbar-top-links>li>a:hover{background:var(--bg)!important;color:var(--text)!important}',
    /* Hide dealer selector — command palette replaces it */
    '#dealername,.top-dropdown.brandname{display:none!important}',
    /* Tone down the "Need help?" btn-primary */
    '#topRight .btn.btn-primary{background:transparent!important;border:1px solid var(--border-dark)!important;color:var(--text-muted)!important;font-size:12px!important;padding:4px 10px!important;box-shadow:none!important}',
    '#topRight .btn.btn-primary:hover{background:var(--bg)!important;color:var(--text)!important}',
    '#header_website_link a{display:inline-flex!important;align-items:center!important;padding:4px 14px!important;background:var(--d2c-navy)!important;color:#fff!important;font-size:13px!important;font-weight:700!important;border-radius:20px!important;text-decoration:none!important;letter-spacing:.1px!important;transition:background var(--t)!important}',
    '#header_website_link a:hover{background:#004d90!important;color:#fff!important}',

    /* Top nav bar — explicit height chain so links fill correctly */
    '.topnav,div.topnav#desktopnav{width:100%!important;background:linear-gradient(180deg,var(--d2c-navy) 0%,var(--d2c-navy-dark) 100%)!important;height:44px!important;min-height:44px!important;border-bottom:2px solid rgba(0,102,204,.45)!important;display:flex!important;align-items:stretch!important;overflow:visible!important;padding:0!important}',
    '.topnav ul{margin:0 auto!important;padding:0!important;height:100%!important;display:flex!important;align-items:stretch!important;list-style:none!important;float:none!important;justify-content:center!important}',
    '.topnav ul li{float:none!important;list-style:none!important;height:100%!important;display:flex!important;align-items:stretch!important}',
    '.topnav ul li a{display:flex!important;align-items:center!important;padding:0 16px!important;height:100%!important;font-size:13px!important;font-weight:500!important;color:rgba(255,255,255,.85)!important;text-decoration:none!important;letter-spacing:.3px!important;border-bottom:2px solid transparent!important;transition:background var(--t),color var(--t),border-color var(--t)!important;white-space:nowrap!important}',
    '.topnav ul li a:hover{background:rgba(255,255,255,.1)!important;color:#fff!important;border-bottom-color:rgba(255,255,255,.3)!important}',
    '.topnav ul li.active>a,.topnav ul li.open>a{background:rgba(255,255,255,.12)!important;color:#fff!important;border-bottom-color:#5aabff!important}',

    /* Sidebar — hidden (command palette replaces sidebar navigation) */
    '.menu_connected_users{display:none!important}',

    /* Page headers */
    '#content h1{font-size:22px!important;font-weight:600!important;color:var(--text)!important;margin:0 0 24px!important;padding-bottom:16px!important;border-bottom:2px solid var(--border)!important;line-height:1.3!important}',
    '#content h2{font-size:18px!important;font-weight:600!important;color:var(--text)!important;margin:0 0 16px!important}',
    '#content h3{font-size:15px!important;font-weight:600!important;color:var(--text)!important;margin:0 0 12px!important}',

    /* Expandable sections */
    '#content h2.expandablesection{background:var(--d2c-navy)!important;background-image:none!important;color:#fff!important;padding:14px 20px 14px 48px!important;margin:20px 0 0!important;border-radius:var(--r-lg) var(--r-lg) 0 0!important;font-size:14px!important;font-weight:600!important;cursor:pointer!important;user-select:none!important;transition:background var(--t)!important;border:none!important;position:relative!important;display:flex!important;align-items:center!important}',
    '#content h2.expandablesection:hover{background:#004d90!important}',
    '#content h2.expandablesection.closed{border-radius:var(--r-lg)!important;margin-bottom:8px!important;background:#4a5568!important}',
    '#content h2.expandablesection.closed:hover{background:#2d3748!important}',
    '#content h2.expandablesection::before{content:"\\2212"!important;position:absolute!important;left:16px!important;font-size:20px!important;font-weight:300!important;line-height:1!important;color:rgba(255,255,255,.6)!important;background-image:none!important;width:20px!important;text-align:center!important}',
    '#content h2.expandablesection.closed::before{content:"+"!important}',
    '#content h2.expandablesection .expandableHeaderText,#content h2.expandablesection .first{color:#fff!important;font-weight:600!important}',
    '#content h2.expandablesection+div,#content h2.expandablesection+table{border:1px solid var(--border)!important;border-top:none!important;border-radius:0 0 var(--r-lg) var(--r-lg)!important;background:var(--surface)!important;padding:24px!important;margin-bottom:8px!important;overflow-x:auto!important}',
    '#content h5.expandablesection{background:#f1f5f9!important;background-image:none!important;color:var(--text)!important;padding:10px 16px 10px 36px!important;margin:16px 0 0!important;border-radius:var(--r-md) var(--r-md) 0 0!important;font-size:13px!important;font-weight:600!important;cursor:pointer!important;user-select:none!important;transition:background var(--t)!important;border:1px solid var(--border)!important;border-bottom:none!important;position:relative!important;display:flex!important;align-items:center!important}',
    '#content h5.expandablesection:hover{background:#e8eef6!important}',
    '#content h5.expandablesection.closed{border-radius:var(--r-md)!important;border:1px solid var(--border)!important;margin-bottom:8px!important;background:#f8fafc!important}',
    '#content h5.expandablesection::before{content:"\\2212"!important;position:absolute!important;left:12px!important;font-size:14px!important;color:var(--text-muted)!important;background-image:none!important}',
    '#content h5.expandablesection.closed::before{content:"+"!important}',
    '#content h5.expandablesection+div,#content h5.expandablesection+table{border:1px solid var(--border)!important;border-top:none!important;border-radius:0 0 var(--r-md) var(--r-md)!important;background:var(--surface)!important;padding:16px!important;margin-bottom:8px!important;overflow-x:auto!important}',

    /* Forms */
    '.form-group{margin-bottom:16px!important}',
    '.form-group label,label{font-size:13px!important;font-weight:500!important;color:var(--text)!important;margin-bottom:4px!important;display:block!important}',
    '.form-control{height:36px!important;padding:6px 12px!important;font-size:13px!important;color:var(--text)!important;background:var(--surface)!important;border:1px solid var(--border-dark)!important;border-radius:var(--r-md)!important;box-shadow:none!important;transition:border-color var(--t),box-shadow var(--t)!important;line-height:1.5!important;width:100%!important}',
    '.form-control:focus{border-color:var(--d2c-blue)!important;box-shadow:0 0 0 3px rgba(0,102,204,.12)!important;outline:none!important}',
    '.form-control:disabled,.form-control[readonly]{background:var(--bg)!important;color:var(--text-muted)!important;cursor:not-allowed!important}',
    'textarea.form-control{height:auto!important;min-height:80px!important;resize:vertical!important}',
    'input[data-editable],select[data-editable],textarea[data-editable]{border-color:#92c5f8!important;background:#eff8ff!important}',
    '.has-warning .form-control{border-color:var(--warning)!important}.has-error .form-control{border-color:var(--danger)!important}',

    /* Buttons */
    '.btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:7px 16px!important;font-size:13px!important;font-weight:500!important;line-height:1.4!important;border-radius:var(--r-md)!important;border:1px solid transparent!important;cursor:pointer!important;transition:all var(--t)!important;text-decoration:none!important;white-space:nowrap!important;box-shadow:none!important;gap:6px!important;font-family:var(--font)!important}',
    '.btn:focus{outline:none!important;box-shadow:0 0 0 3px rgba(0,59,112,.2)!important}',
    '.btn-default{background:var(--surface)!important;border-color:var(--border-dark)!important;color:var(--text)!important}',
    '.btn-default:hover{background:var(--bg)!important;border-color:#a0aec0!important}',
    '.btn-primary{background:var(--d2c-navy)!important;border-color:var(--d2c-navy)!important;color:#fff!important}',
    '.btn-primary:hover,.btn-primary:focus{background:#004d90!important;border-color:#004d90!important;color:#fff!important}',
    '.btn-success{background:var(--success)!important;border-color:var(--success)!important;color:#fff!important}',
    '.btn-danger{background:var(--danger)!important;border-color:var(--danger)!important;color:#fff!important}',
    '.btn-warning{background:var(--warning)!important;border-color:var(--warning)!important;color:#fff!important}',
    '.btn-info{background:var(--info)!important;border-color:var(--info)!important;color:#fff!important}',
    '.btn-info:hover{background:#2563eb!important;border-color:#2563eb!important;color:#fff!important}',
    '.btn-link{background:none!important;border-color:transparent!important;color:var(--d2c-blue)!important;padding:7px 8px!important;box-shadow:none!important}',
    '.btn-sm{padding:4px 10px!important;font-size:12px!important}.btn-lg{padding:10px 20px!important;font-size:15px!important}.btn-xs{padding:2px 8px!important;font-size:11px!important}',
    /* Ensure buttons with inline background colors get white text */
    '.btn[style*="background"]{color:#fff!important}',
    '.btn-block{width:100%!important;display:flex!important}',
    /* D2C custom button classes (not Bootstrap) */
    '.button,.buttonSmall,input.buttonSmall,a.buttonSmall{display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:8px 20px!important;font-size:13px!important;font-weight:600!important;color:#fff!important;background:var(--d2c-navy)!important;border:none!important;border-radius:var(--r-md)!important;cursor:pointer!important;text-decoration:none!important;font-family:var(--font)!important;transition:background var(--t)!important}',
    '.button:hover,.buttonSmall:hover{background:#004d90!important;color:#fff!important}',
    '.buttonSmall{padding:5px 12px!important;font-size:12px!important}',
    /* Save button — lives inside #d2c-right-panel below section TOC */
    '#d2c-floating-save{flex-shrink:0!important;width:100%!important;padding:10px 0!important;font-size:13px!important;font-weight:600!important;color:var(--d2c-navy)!important;background:var(--surface)!important;border:1px solid var(--border)!important;border-radius:var(--r-lg)!important;cursor:pointer!important;box-shadow:var(--shadow-md)!important;font-family:var(--font)!important;transition:background var(--t),color var(--t),border-color var(--t)!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important}',
    '#d2c-floating-save:hover{background:var(--d2c-navy)!important;color:#fff!important;border-color:var(--d2c-navy)!important}',
    '#d2c-floating-save .fa{font-size:14px!important}',

    /* Tables */
    '.table{width:100%!important;border-collapse:collapse!important;margin-bottom:16px!important;font-size:13px!important}',
    '.table>thead>tr>th{padding:10px 12px!important;background:var(--bg)!important;border-bottom:2px solid var(--border-dark)!important;color:var(--text-muted)!important;font-weight:600!important;font-size:12px!important;text-transform:uppercase!important;letter-spacing:.5px!important;vertical-align:bottom!important;text-align:left!important}',
    '.table>tbody>tr>td,.table>tbody>tr>th{padding:10px 12px!important;border-top:1px solid var(--border)!important;vertical-align:middle!important;color:var(--text)!important}',
    '.table-bordered{border:1px solid var(--border)!important}',
    '.table-bordered>thead>tr>th,.table-bordered>tbody>tr>td{border:1px solid var(--border)!important}',
    '.table-striped>tbody>tr:nth-child(odd)>td{background:#f8fafc!important}',
    '.table-hover>tbody>tr:hover>td{background:var(--d2c-blue-light)!important}',
    'td{padding:6px 10px!important;vertical-align:top!important}',

    /* Panels */
    '.panel{background:var(--surface)!important;border:1px solid var(--border)!important;border-radius:var(--r-lg)!important;box-shadow:var(--shadow-sm)!important;margin-bottom:20px!important}',
    '.panel-default>.panel-heading{background:var(--bg)!important;border-bottom:1px solid var(--border)!important;color:var(--text)!important;border-radius:var(--r-lg) var(--r-lg) 0 0!important;padding:12px 16px!important;font-weight:600!important;font-size:14px!important}',
    '.panel-body{padding:16px!important}.panel-footer{background:var(--bg)!important;border-top:1px solid var(--border)!important;padding:12px 16px!important}',

    /* Alerts */
    '.alert{padding:12px 16px!important;border-radius:var(--r-md)!important;border:1px solid transparent!important;font-size:13px!important;margin-bottom:16px!important}',
    '.alert-success{background:#d1fae5!important;border-color:#a7f3d0!important;color:#065f46!important}',
    '.alert-warning{background:#fef3c7!important;border-color:#fde68a!important;color:#92400e!important}',
    '.alert-danger{background:#fee2e2!important;border-color:#fca5a5!important;color:#991b1b!important}',
    '.alert-info{background:#dbeafe!important;border-color:#bfdbfe!important;color:#1e40af!important}',

    /* Modals — let Bootstrap manage display:none/block via its JS; we only style appearance */
    '.modal{position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:0!important;z-index:1050!important;overflow-x:hidden!important;overflow-y:auto!important}',
    '.modal-dialog{width:600px!important;max-width:90vw!important;background:var(--surface)!important;border-radius:var(--r-xl)!important;overflow:hidden!important;box-shadow:var(--shadow-lg)!important;margin:0 auto!important}',
    '.modal-dialog.modal-lg{width:900px!important}.modal-dialog.modal-sm{width:400px!important}',
    '.modal-header{padding:20px 24px!important;border-bottom:1px solid var(--border)!important;display:flex!important;align-items:center!important;justify-content:space-between!important}',
    '.modal-title{font-size:16px!important;font-weight:600!important;color:var(--text)!important;margin:0!important}',
    '.modal-body{padding:24px!important;max-height:65vh!important;overflow-y:auto!important}',
    '.modal-footer{padding:16px 24px!important;border-top:1px solid var(--border)!important;display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;background:var(--bg)!important}',
    '.modal-backdrop.in{background:rgba(0,0,0,.5)!important}',

    /* Collapse — let Bootstrap handle display, we only style the transition */
    '.collapsing{position:relative!important;height:0!important;overflow:hidden!important;transition:height .2s ease!important}',

    /* Bootstrap Select */
    '.bootstrap-select .btn-default{background:var(--surface)!important;border:1px solid var(--border-dark)!important;color:var(--text)!important;border-radius:var(--r-md)!important;padding:6px 10px!important;font-size:13px!important;height:36px!important;display:flex!important;align-items:center!important;width:100%!important;text-align:left!important;font-family:var(--font)!important}',
    '.bootstrap-select .btn-default:hover{background:var(--bg)!important;border-color:var(--d2c-blue)!important}',
    '.bootstrap-select.open .btn-default{border-color:var(--d2c-blue)!important;box-shadow:0 0 0 3px rgba(0,102,204,.12)!important}',
    '.bootstrap-select .filter-option{display:flex!important;align-items:center!important;gap:6px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;flex:1!important}',
    '.bootstrap-select .dropdown-menu .inner>li>a{padding:8px 12px!important;display:flex!important;align-items:center!important;gap:8px!important}',
    '.bs-searchbox{padding:8px!important;border-bottom:1px solid var(--border)!important}',
    '.bs-searchbox input{width:100%!important;padding:6px 10px!important;border:1px solid var(--border-dark)!important;border-radius:var(--r-sm)!important;font-size:13px!important;outline:none!important}',

    /* Dropdowns — don't override display, Bootstrap handles open/close */
    '.dropdown-menu{background:var(--surface)!important;border:1px solid var(--border)!important;border-radius:var(--r-lg)!important;box-shadow:var(--shadow-lg)!important;padding:6px!important;min-width:180px!important;font-size:13px!important;z-index:1050!important}',
    '.dropdown-menu>li>a{display:block!important;padding:7px 12px!important;color:var(--text)!important;border-radius:var(--r-sm)!important;text-decoration:none!important;transition:background var(--t)!important;white-space:nowrap!important}',
    '.dropdown-menu>li>a:hover{background:var(--bg)!important;color:var(--d2c-navy)!important}',
    '.dropdown-menu>li.active>a{background:var(--d2c-blue-light)!important;color:var(--d2c-navy)!important}',
    '.dropdown-menu .divider{height:1px!important;background:var(--border)!important;margin:6px!important}',

    /* Nav tabs */
    '.nav-tabs{border-bottom:2px solid var(--border)!important;margin-bottom:20px!important;padding:0!important;list-style:none!important;display:flex!important;gap:4px!important}',
    '.nav-tabs>li>a{display:block!important;padding:8px 16px!important;font-size:13px!important;font-weight:500!important;color:var(--text-muted)!important;border:1px solid transparent!important;border-bottom:none!important;border-radius:var(--r-md) var(--r-md) 0 0!important;text-decoration:none!important;margin-bottom:-2px!important;transition:color var(--t),background var(--t)!important}',
    '.nav-tabs>li>a:hover{color:var(--text)!important;background:var(--bg)!important;border-color:var(--border)!important}',
    '.nav-tabs>li.active>a{color:var(--d2c-navy)!important;background:var(--surface)!important;border-color:var(--border)!important;border-bottom-color:var(--surface)!important;font-weight:600!important}',

    /* Misc */
    '.well{background:var(--bg)!important;border:1px solid var(--border)!important;border-radius:var(--r-lg)!important;box-shadow:none!important;padding:16px!important}',
    '.progress{background:var(--bg)!important;border-radius:var(--r-sm)!important;height:8px!important;box-shadow:none!important;overflow:hidden!important;margin-bottom:8px!important}',
    '.progress-bar{background:var(--d2c-navy)!important}',
    '.badge{display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:2px 8px!important;font-size:11px!important;font-weight:600!important;border-radius:20px!important;background:var(--d2c-navy)!important;color:#fff!important;min-width:20px!important}',
    '.close{float:right!important;font-size:18px!important;font-weight:600!important;line-height:1!important;color:inherit!important;opacity:.5!important;background:none!important;border:none!important;cursor:pointer!important;padding:2px 6px!important}',
    '.close:hover{opacity:.85!important}',
    /* #saveLockScreen — do NOT override display, jQuery fadeIn/hide manages it */
    '#saveLockScreen{position:fixed!important;top:0!important;left:0!important;width:100%!important;height:100%!important;background:rgba(255,255,255,.7)!important;z-index:9999!important}',

    /* JS-injected enhancement elements */
    '#d2c-right-panel{position:fixed!important;right:16px!important;top:120px!important;width:196px!important;max-height:calc(100vh - 150px)!important;display:flex!important;flex-direction:column!important;gap:8px!important;z-index:1025!important}',
    '#d2c-section-toc{flex:1!important;min-height:0!important;overflow-y:auto!important;background:var(--surface)!important;border:1px solid var(--border)!important;border-radius:var(--r-lg)!important;box-shadow:var(--shadow-md)!important;font-size:12px!important;scrollbar-width:thin!important}',
    '#d2c-section-toc.d2c-toc-minimized .d2c-toc-list,#d2c-section-toc.d2c-toc-minimized .d2c-toc-actions{display:none!important}',
    '.d2c-toc-header{padding:9px 12px!important;font-weight:700!important;font-size:11px!important;color:var(--d2c-navy)!important;border-bottom:1px solid var(--border)!important;cursor:pointer!important;user-select:none!important;text-transform:uppercase!important;letter-spacing:.5px!important;display:flex!important;align-items:center!important;justify-content:space-between!important}',
    '.d2c-toc-actions{padding:6px 8px!important;display:flex!important;gap:4px!important;border-bottom:1px solid var(--border)!important}',
    '.d2c-toc-btn{flex:1!important;padding:3px 6px!important;font-size:10px!important;border:1px solid var(--border)!important;border-radius:var(--r-sm)!important;background:var(--bg)!important;color:var(--text-muted)!important;cursor:pointer!important;text-align:center!important;transition:background var(--t)!important;font-family:var(--font)!important}',
    '.d2c-toc-btn:hover{background:var(--border)!important;color:var(--text)!important}',
    '.d2c-toc-list{list-style:none!important;margin:0!important;padding:4px 0!important}',
    '.d2c-toc-item a{display:block!important;padding:5px 12px!important;color:var(--text-muted)!important;text-decoration:none!important;border-left:2px solid transparent!important;transition:all var(--t)!important;line-height:1.4!important;font-size:11px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}',
    '.d2c-toc-item a:hover{background:var(--bg)!important;color:var(--d2c-navy)!important}',
    '.d2c-toc-item a.d2c-toc-active{border-left-color:var(--d2c-navy)!important;color:var(--d2c-navy)!important;font-weight:600!important;background:var(--d2c-blue-light)!important}',
    '#d2c-palette-overlay{position:fixed!important;inset:0!important;background:rgba(0,0,0,.5)!important;z-index:100000!important;justify-content:center!important;align-items:flex-start!important;padding-top:14vh!important;backdrop-filter:blur(3px)!important}',
    '#d2c-palette{width:580px!important;max-width:90vw!important;background:var(--surface)!important;border-radius:var(--r-xl)!important;box-shadow:0 24px 60px rgba(0,0,0,.28)!important;overflow:hidden!important}',
    '#d2c-palette-input{width:100%!important;padding:18px 20px!important;border:none!important;border-bottom:1px solid var(--border)!important;font-size:16px!important;font-family:var(--font)!important;outline:none!important;box-sizing:border-box!important;color:var(--text)!important;background:transparent!important}',
    '#d2c-palette-input::placeholder{color:var(--text-light)!important}',
    '#d2c-palette-results{max-height:380px!important;overflow-y:auto!important;padding:6px 0!important}',
    '.d2c-palette-item{padding:10px 16px!important;cursor:pointer!important;display:flex!important;align-items:center!important;gap:10px!important;font-size:13px!important;color:var(--text)!important;transition:background .08s!important}',
    '.d2c-palette-item:hover,.d2c-palette-item.d2c-palette-active{background:var(--d2c-blue-light)!important}',
    '.d2c-palette-item .fa{color:var(--text-light)!important;width:20px!important;text-align:center!important;flex-shrink:0!important}',
    '.d2c-palette-title{flex:1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}',
    '.d2c-palette-type{font-size:10px!important;padding:2px 7px!important;border-radius:20px!important;font-weight:600!important;text-transform:uppercase!important;letter-spacing:.4px!important;flex-shrink:0!important}',
    '.d2c-pt-page{background:#d1fae5!important;color:#065f46!important}.d2c-pt-dealer{background:var(--d2c-blue-light)!important;color:var(--d2c-navy)!important}.d2c-pt-nav{background:#fef3c7!important;color:#92400e!important}',
    '.d2c-palette-empty{padding:32px 20px!important;text-align:center!important;color:var(--text-light)!important;font-size:14px!important}',
    '#d2c-palette-footer{padding:8px 16px!important;border-top:1px solid var(--border)!important;background:var(--bg)!important;display:flex!important;gap:16px!important;font-size:11px!important;color:var(--text-light)!important;align-items:center!important}',
    '#d2c-palette-footer kbd{display:inline-block!important;padding:2px 6px!important;border:1px solid var(--border-dark)!important;border-radius:4px!important;background:var(--surface)!important;font-size:10px!important;font-family:var(--mono)!important;color:var(--text-muted)!important;margin-right:2px!important}',
    '#d2c-save-indicator{position:fixed!important;bottom:24px!important;right:24px!important;padding:8px 16px!important;border-radius:var(--r-lg)!important;font-size:12px!important;font-weight:500!important;font-family:var(--font)!important;z-index:10001!important;transition:all .25s ease!important;display:flex!important;align-items:center!important;gap:8px!important;box-shadow:var(--shadow-md)!important;pointer-events:none!important}',
    '#d2c-save-indicator.d2c-save-idle{background:var(--surface)!important;color:var(--text-light)!important;border:1px solid var(--border)!important;opacity:.65!important}',
    '#d2c-save-indicator.d2c-save-active{background:#fef3c7!important;color:#92400e!important;border:1px solid var(--warning)!important;opacity:1!important}',
    '#d2c-save-indicator.d2c-save-success{background:#d1fae5!important;color:#065f46!important;border:1px solid var(--success)!important;opacity:1!important}',
    '#d2c-save-indicator.d2c-save-error{background:#fee2e2!important;color:#991b1b!important;border:1px solid var(--danger)!important;opacity:1!important;pointer-events:auto!important}',
    '#d2c-scroll-top{position:fixed!important;bottom:24px!important;right:224px!important;width:36px!important;height:36px!important;border-radius:50%!important;background:var(--d2c-navy)!important;color:#fff!important;border:none!important;cursor:pointer!important;z-index:10001!important;opacity:0!important;transform:translateY(12px)!important;transition:opacity .2s,transform .2s!important;font-size:14px!important;box-shadow:var(--shadow-md)!important;display:flex!important;align-items:center!important;justify-content:center!important;pointer-events:none!important;font-family:var(--font)!important}',
    '#d2c-scroll-top.d2c-st-visible{opacity:1!important;transform:translateY(0)!important;pointer-events:auto!important}',
    '#d2c-scroll-top:hover{background:#004d90!important}',

    /* Floating dealer nav panel (left side) */
    '#d2c-dealer-nav{position:fixed!important;top:120px!important;left:16px!important;width:180px!important;max-height:calc(100vh - 150px)!important;overflow-y:auto!important;background:var(--surface)!important;border:1px solid var(--border)!important;border-radius:var(--r-lg)!important;box-shadow:var(--shadow-md)!important;z-index:1025!important;font-size:12px!important;scrollbar-width:thin!important}',
    '.d2c-dn-header{padding:9px 12px!important;font-weight:700!important;font-size:11px!important;color:var(--d2c-navy)!important;border-bottom:1px solid var(--border)!important;text-transform:uppercase!important;letter-spacing:.5px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}',
    '.d2c-dn-list{list-style:none!important;margin:0!important;padding:4px 0!important}',
    '.d2c-dn-list li a{display:flex!important;align-items:center!important;gap:6px!important;padding:5px 12px!important;color:var(--text-muted)!important;text-decoration:none!important;border-left:2px solid transparent!important;transition:all var(--t)!important;line-height:1.4!important;font-size:12px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}',
    '.d2c-dn-list li a:hover{background:var(--bg)!important;color:var(--d2c-navy)!important}',
    '.d2c-dn-list li a.d2c-dn-active{border-left-color:var(--d2c-navy)!important;color:var(--d2c-navy)!important;font-weight:600!important;background:var(--d2c-blue-light)!important}',
    '.d2c-dn-list li a .fa{width:14px!important;text-align:center!important;color:var(--text-light)!important;flex-shrink:0!important;font-size:11px!important}',
    '.d2c-dn-list li a.d2c-dn-active .fa{color:var(--d2c-navy)!important}',
    '.d2c-dn-section{padding:6px 12px 3px!important;font-size:10px!important;font-weight:700!important;color:var(--text-muted)!important;text-transform:uppercase!important;letter-spacing:.5px!important;margin-top:4px!important}',
    '.d2c-dn-more{border-top:1px solid var(--border)!important;margin-top:4px!important}',
    '.d2c-dn-more-btn{display:block!important;width:100%!important;padding:6px 12px!important;font-size:11px!important;color:var(--text-muted)!important;background:none!important;border:none!important;cursor:pointer!important;text-align:left!important;font-family:var(--font)!important;transition:color var(--t)!important}',
    '.d2c-dn-more-btn:hover{color:var(--d2c-navy)!important}',

    /* Breadcrumb in header */
    '#d2c-breadcrumb{display:flex!important;align-items:center!important;gap:6px!important;font-size:13px!important;color:var(--text-muted)!important;margin-right:auto!important;min-width:0!important;overflow:hidden!important}',
    '#d2c-breadcrumb span{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}',
    '#d2c-breadcrumb .d2c-bc-sep{color:var(--text-light)!important;flex-shrink:0!important;font-size:10px!important}',
    '#d2c-breadcrumb .d2c-bc-dealer{font-weight:600!important;color:var(--d2c-navy)!important}',
    '#d2c-breadcrumb .d2c-bc-section{color:var(--text-muted)!important}',
    '#d2c-breadcrumb .d2c-bc-page{color:var(--text)!important;font-weight:500!important}',

    /* Search hint — prominent bar before breadcrumb */
    '#d2c-search-hint{flex-shrink:0!important}',
    '#d2c-search-hint>a{display:flex!important;align-items:center!important;gap:6px!important;padding:4px 8px!important;color:var(--text-muted)!important;border-radius:var(--r-md)!important;border:none!important;background:transparent!important;transition:background var(--t),color var(--t)!important;font-size:13px!important;text-decoration:none!important;cursor:pointer!important}',
    '#d2c-search-hint>a:hover{background:var(--bg)!important;color:var(--text)!important}',
    '#d2c-search-hint .fa{font-size:13px!important;color:var(--text-light)!important}',
    '.d2c-hint-label{font-size:13px!important;color:var(--text-muted)!important}',
    '.d2c-hint-kbd{display:inline-block!important;padding:1px 6px!important;border:1px solid var(--border-dark)!important;border-radius:3px!important;font-size:10px!important;font-family:var(--mono)!important;color:var(--text-muted)!important;background:var(--surface)!important;line-height:1.6!important;margin-left:4px!important}',
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.id = 'd2c-custom-styles';
  styleEl.textContent = css;
  // Insert into <head> as early as possible — overrides the hashed CSS bundles
  (document.head || document.documentElement).appendChild(styleEl);

  /* ---- Timing helper ---- */
  function onReady(fn) {
    if (document.readyState !== 'loading') {
      setTimeout(fn, 300); // small delay for dynamic admin content
    } else {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 300); });
    }
  }

  /* ================================================================
     1. MEASURE HEADER HEIGHT  →  set CSS variable
     ================================================================ */
  function measureHeader() {
    var navbar = document.querySelector('nav.navbar.navbar-default');
    if (!navbar) return;
    var h = navbar.offsetHeight;
    if (h > 0) {
      document.documentElement.style.setProperty('--header-height', h + 'px');
    }
    // Also position the sidebar correctly
    var sidebar = document.querySelector('.navbar-default.sidebar');
    if (sidebar) {
      sidebar.style.top = h + 'px';
      sidebar.style.height = 'calc(100vh - ' + h + 'px)';
    }
  }

  /* ================================================================
     SHARED RIGHT PANEL  (fixed column — TOC + save button)
     ================================================================ */
  function getRightPanel() {
    var panel = document.getElementById('d2c-right-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'd2c-right-panel';
      document.body.appendChild(panel);
    }
    return panel;
  }

  /* ================================================================
     2. SECTION TABLE OF CONTENTS  (floating right panel)
     ================================================================ */
  function buildSectionTOC() {
    var sections = document.querySelectorAll('#content h2.expandablesection');
    if (sections.length < 2) return;

    var toc = document.createElement('div');
    toc.id = 'd2c-section-toc';

    var header = document.createElement('div');
    header.className = 'd2c-toc-header';
    header.innerHTML = 'Sections <span class="d2c-toc-toggle">\u25b2</span>';

    var actions = document.createElement('div');
    actions.className = 'd2c-toc-actions';
    actions.innerHTML =
      '<button class="d2c-toc-btn" id="d2c-collapse-all">Collapse All</button>' +
      '<button class="d2c-toc-btn" id="d2c-expand-all">Expand All</button>';

    var list = document.createElement('ul');
    list.className = 'd2c-toc-list';

    sections.forEach(function (section, i) {
      var titleEl = section.querySelector('.expandableHeaderText') || section.querySelector('.first');
      var title = titleEl ? titleEl.textContent.trim() : section.textContent.trim();
      // Give section an ID for scrolling
      if (!section.id) section.id = 'd2c-s' + i;

      var li = document.createElement('li');
      li.className = 'd2c-toc-item';
      var a = document.createElement('a');
      a.href = '#' + section.id;
      a.textContent = title;
      a.setAttribute('data-idx', i);
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (section.classList.contains('closed')) section.click();
        var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 95;
        var top = section.getBoundingClientRect().top + window.scrollY - headerH - 12;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
      li.appendChild(a);
      list.appendChild(li);
    });

    toc.appendChild(header);
    toc.appendChild(actions);
    toc.appendChild(list);
    getRightPanel().appendChild(toc);

    /* Collapse / expand all */
    document.getElementById('d2c-collapse-all').addEventListener('click', function () {
      sections.forEach(function (s) { if (s.classList.contains('open')) s.click(); });
    });
    document.getElementById('d2c-expand-all').addEventListener('click', function () {
      sections.forEach(function (s) { if (s.classList.contains('closed')) s.click(); });
    });

    /* Toggle minimise on header click */
    var isMin = false;
    header.addEventListener('click', function () {
      isMin = !isMin;
      toc.classList.toggle('d2c-toc-minimized', isMin);
      header.querySelector('.d2c-toc-toggle').textContent = isMin ? '\u25bc' : '\u25b2';
    });

    /* IntersectionObserver — highlight current section */
    if ('IntersectionObserver' in window) {
      var links = list.querySelectorAll('a');
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var idx = Array.prototype.indexOf.call(sections, entry.target);
          links.forEach(function (l) { l.classList.remove('d2c-toc-active'); });
          if (idx >= 0 && links[idx]) links[idx].classList.add('d2c-toc-active');
        });
      }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });
      sections.forEach(function (s) { obs.observe(s); });
    }
  }


  /* ================================================================
     3. FLOATING DEALER NAV  (left side — current dealer's pages)
     ================================================================ */
  function buildDealerNav() {
    if (document.getElementById('d2c-dealer-nav')) return;

    // Find the active dealer in the sidebar
    var activeLi = document.querySelector('#side-menu > li.active');
    if (!activeLi) return;

    // Get dealer name from the top-level <a>
    var dealerLinks = activeLi.children;
    var dealerName = '';
    for (var di = 0; di < dealerLinks.length; di++) {
      if (dealerLinks[di].tagName === 'A') {
        var ts = dealerLinks[di].querySelector('.title');
        dealerName = (ts || dealerLinks[di]).textContent.trim();
        break;
      }
    }
    if (!dealerName) return;

    // Walk nav-second-level sections (Configurator, Group Mgmt, Statistics)
    var sectionLis = activeLi.querySelectorAll('.nav-second-level > li');
    if (sectionLis.length === 0) return;

    var currentPath = window.location.pathname;
    var nav = document.createElement('div');
    nav.id = 'd2c-dealer-nav';

    var header = document.createElement('div');
    header.className = 'd2c-dn-header';
    header.textContent = dealerName;
    header.title = dealerName;
    nav.appendChild(header);

    var seenTitles = {};
    var extraSections = []; // non-Configurator sections go here

    function buildList(secLi) {
      var pageLinks = secLi.querySelectorAll('.nav-third-level a[data-islink="true"]');
      var list = document.createElement('ul');
      list.className = 'd2c-dn-list';
      pageLinks.forEach(function (a) {
        var title = a.getAttribute('title') || a.textContent.trim();
        var href = a.getAttribute('href');
        if (!title || !href) return;
        var key = title.toLowerCase();
        if (seenTitles[key]) return;
        seenTitles[key] = true;
        var iconEl = a.querySelector('i.fa:not(.menu_connected_users)');
        var icon = iconEl ? iconEl.className : 'fa fa-fw fa-file-o';
        var isActive = currentPath === href || (href !== '/' && currentPath.indexOf(href) === 0);
        var li = document.createElement('li');
        var link = document.createElement('a');
        link.href = href;
        link.innerHTML = '<i class="' + icon + '"></i> ' + title;
        if (isActive) link.className = 'd2c-dn-active';
        li.appendChild(link);
        list.appendChild(li);
      });
      return list.children.length > 0 ? list : null;
    }

    sectionLis.forEach(function (secLi) {
      var secA = null;
      for (var si = 0; si < secLi.children.length; si++) {
        if (secLi.children[si].tagName === 'A') { secA = secLi.children[si]; break; }
      }
      if (!secA) return;
      var secTitle = secA.getAttribute('title') || secA.textContent.trim();
      var isConfigurator = secTitle.toLowerCase().indexOf('configurator') !== -1;

      if (isConfigurator) {
        // Show Configurator links directly — no label needed
        var list = buildList(secLi);
        if (list) nav.appendChild(list);
      } else {
        // Collect other sections for the "More" toggle
        var list = buildList(secLi);
        if (list) extraSections.push({ title: secTitle, list: list });
      }
    });

    // "More" toggle for non-Configurator sections
    if (extraSections.length > 0) {
      var moreWrap = document.createElement('div');
      moreWrap.className = 'd2c-dn-more';

      var moreBtn = document.createElement('button');
      moreBtn.className = 'd2c-dn-more-btn';
      moreBtn.textContent = 'More\u2026';
      moreWrap.appendChild(moreBtn);

      var moreContent = document.createElement('div');
      moreContent.className = 'd2c-dn-more-content';
      moreContent.style.display = 'none';

      extraSections.forEach(function (sec) {
        var label = document.createElement('div');
        label.className = 'd2c-dn-section';
        label.textContent = sec.title;
        moreContent.appendChild(label);
        moreContent.appendChild(sec.list);
      });

      moreWrap.appendChild(moreContent);
      nav.appendChild(moreWrap);

      moreBtn.addEventListener('click', function () {
        var open = moreContent.style.display !== 'none';
        moreContent.style.display = open ? 'none' : 'block';
        moreBtn.textContent = open ? 'More\u2026' : 'Less';
      });
    }

    document.body.appendChild(nav);
  }

  /* ================================================================
     4. HEADER BREADCRUMB  (dealer > section > page)
     ================================================================ */
  function buildBreadcrumb() {
    if (document.getElementById('d2c-breadcrumb')) return;

    var topRight = document.getElementById('topRight');
    if (!topRight) return;

    // Find active dealer
    var activeLi = document.querySelector('#side-menu > li.active');
    if (!activeLi) return;

    var dealerA = null;
    for (var di = 0; di < activeLi.children.length; di++) {
      if (activeLi.children[di].tagName === 'A') { dealerA = activeLi.children[di]; break; }
    }
    if (!dealerA) return;
    var ts = dealerA.querySelector('.title');
    var dealerName = (ts || dealerA).textContent.trim();

    // Find active section (Configurator, Group Mgmt, etc.)
    var activeSec = activeLi.querySelector('.nav-second-level > li.active');
    var secName = '';
    if (activeSec) {
      var secA = null;
      for (var si = 0; si < activeSec.children.length; si++) {
        if (activeSec.children[si].tagName === 'A') { secA = activeSec.children[si]; break; }
      }
      if (secA) secName = secA.getAttribute('title') || secA.textContent.trim();
    }

    // Find active page
    var activePage = activeLi.querySelector('.nav-third-level li.active a[data-islink="true"]');
    var pageName = '';
    if (activePage) pageName = activePage.getAttribute('title') || activePage.textContent.trim();

    // Build breadcrumb
    var bc = document.createElement('div');
    bc.id = 'd2c-breadcrumb';

    var parts = [];
    if (dealerName) parts.push('<span class="d2c-bc-dealer">' + dealerName + '</span>');
    if (secName) parts.push('<span class="d2c-bc-section">' + secName + '</span>');
    if (pageName) parts.push('<span class="d2c-bc-page">' + pageName + '</span>');

    bc.innerHTML = parts.join('<span class="d2c-bc-sep">\u203A</span>');

    // Insert at the beginning of #topRight so it sits on the left
    topRight.insertBefore(bc, topRight.firstChild);
  }

  /* ================================================================
     5. COMMAND PALETTE  (Ctrl+K / ⌘K)
     ================================================================ */
  var paletteOverlay, paletteInput, paletteResults;
  var commands = [];
  var filtered = [];
  var selIdx = 0;

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildPalette() {
    if (document.getElementById('d2c-palette-overlay')) return;
    paletteOverlay = document.createElement('div');
    paletteOverlay.id = 'd2c-palette-overlay';
    paletteOverlay.style.display = 'none';
    paletteOverlay.innerHTML =
      '<div id="d2c-palette">' +
        '<input id="d2c-palette-input" type="text" autocomplete="off" placeholder="Search pages, dealerships\u2026" />' +
        '<div id="d2c-palette-results"></div>' +
        '<div id="d2c-palette-footer">' +
          '<span><kbd>\u2191</kbd><kbd>\u2193</kbd> navigate</span>' +
          '<span><kbd>Enter</kbd> open</span>' +
          '<span><kbd>Esc</kbd> close</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(paletteOverlay);

    paletteInput   = document.getElementById('d2c-palette-input');
    paletteResults = document.getElementById('d2c-palette-results');

    paletteInput.addEventListener('input', function () { selIdx = 0; render(this.value); });
    paletteInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); selIdx = Math.min(selIdx + 1, filtered.length - 1); render(paletteInput.value); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); selIdx = Math.max(selIdx - 1, 0); render(paletteInput.value); }
      else if (e.key === 'Enter')  { e.preventDefault(); execute(filtered[selIdx]); }
      else if (e.key === 'Escape') { closePalette(); }
    });
    paletteResults.addEventListener('click', function (e) {
      var item = e.target.closest('.d2c-palette-item');
      if (item) execute(filtered[parseInt(item.getAttribute('data-i'))]);
    });
    paletteOverlay.addEventListener('click', function (e) {
      if (e.target === paletteOverlay) closePalette();
    });
  }

  function scrapeCommands() {
    var cmds = [];
    // Pages from sidebar — walk up DOM to get the parent dealer name
    var seenPageKeys = {}; // dedup EN+FR bilingual duplicates (same href, same dealer)
    var links = document.querySelectorAll('#side-menu a[data-islink="true"]');
    links.forEach(function (a) {
      var title = a.getAttribute('title') || a.textContent.trim();
      var href  = a.getAttribute('href');
      if (!href || !title) return;

      // Find the top-level dealer <li> this link belongs to
      var dealerName = '';
      var topLi = a.closest('#side-menu > li');
      if (topLi) {
        // Walk children directly — avoids :scope quirks across browsers
        for (var ci = 0; ci < topLi.children.length; ci++) {
          if (topLi.children[ci].tagName === 'A') {
            var dealerAnchor = topLi.children[ci];
            var titleSpan = dealerAnchor.querySelector('.title');
            dealerName = (titleSpan || dealerAnchor).textContent.trim();
            break;
          }
        }
      }

      // Skip bilingual duplicates — EN/FR links have different hrefs but same title
      var dedupKey = (dealerName + '|' + title).toLowerCase();
      if (seenPageKeys[dedupKey]) return;
      seenPageKeys[dedupKey] = true;

      var icon = (a.querySelector('i.fa') || {}).className || 'fa fa-file-o';
      // Use \u203A (›) via unicode escape — ASCII-safe regardless of file charset
      var displayTitle = dealerName ? dealerName + ' \u203A ' + title : title;
      // q uses plain space so fuzzy search never depends on special-char encoding
      cmds.push({ type: 'page', title: displayTitle, href: href, icon: icon, q: (dealerName ? dealerName + ' ' + title : title).toLowerCase() });
    });

    // Dealerships from selector
    var sel = document.querySelector('#dealername select.selectpicker');
    if (sel) {
      var currentId = '';
      var currentSiteEl = document.getElementById('currentSiteID');
      if (currentSiteEl) currentId = currentSiteEl.value;
      // Fall back: get the selected option value
      if (!currentId && sel.options.length) {
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].selected) { currentId = sel.options[i].value; break; }
        }
      }

      var pages = [
        { name: 'General',      path: '/sites/general' },
        { name: 'Homepage',     path: '/sites/homepage' },
        { name: 'New Vehicles', path: '/sites/new-vehicles' },
        { name: 'Pre-owned',    path: '/sites/used-vehicles' },
        { name: 'Promotions',   path: '/sites/promotions' },
        { name: 'Financing',    path: '/sites/financing' },
        { name: 'Service',      path: '/sites/services' },
        { name: 'Our Team',     path: '/sites/our-team' },
        { name: 'Contact Us',   path: '/sites/contact-us' },
        { name: 'Custom Pages', path: '/sites/custom-pages' },
        { name: 'Clearance',    path: '/sites/clearance' },
        { name: 'Statistics',   path: '/sites/stats' }
      ];

      for (var j = 0; j < sel.options.length; j++) {
        var opt = sel.options[j];
        var sid  = opt.value;
        var name = opt.textContent.trim().replace(/\s*\(\d+\)\s*$/, '');
        if (!sid || !name) continue;

        // Switch-to-dealer command
        cmds.push({
          type:  'dealer',
          title: name,
          sub:   sid === currentId ? '(current site)' : 'Switch to this dealership',
          siteId: sid,
          icon:  'fa fa-fw fa-globe',
          q:     name.toLowerCase()
        });

        // Dealer+page combos for non-current dealers
        if (sid !== currentId) {
          pages.forEach(function (pg) {
            cmds.push({
              type:  'nav',
              title: name + ' \u203A ' + pg.name,
              href:  pg.path,
              siteId: sid,
              icon:  'fa fa-fw fa-arrow-right',
              q:     (name + ' ' + pg.name).toLowerCase()
            });
          });
        }
      }
    }
    return cmds;
  }

  function fuzzyScore(query, text) {
    if (!text) return 0;
    if (text.includes(query)) return 100 - text.indexOf(query);
    var qi = 0, score = 0, last = -1;
    for (var i = 0; i < text.length && qi < query.length; i++) {
      if (text[i] === query[qi]) {
        score += 10;
        if (last === i - 1) score += 5;
        if (i === 0 || text[i - 1] === ' ' || text[i - 1] === '\u203A') score += 8;
        last = i; qi++;
      }
    }
    return qi === query.length ? score : 0;
  }

  function render(q) {
    var lq = q.trim().toLowerCase();
    if (!lq) {
      // Default view: show pages first; fall back to dealer list if no pages found
      filtered = commands.filter(function (c) { return c.type === 'page'; }).slice(0, 20);
      if (filtered.length === 0) {
        filtered = commands.filter(function (c) { return c.type === 'dealer'; }).slice(0, 20);
      }
    } else {
      var scored = commands.map(function (c) { return { c: c, s: fuzzyScore(lq, c.q) }; })
        .filter(function (x) { return x.s > 0; });
      scored.sort(function (a, b) { return b.s - a.s; });
      filtered = scored.slice(0, 20).map(function (x) { return x.c; });
    }

    selIdx = Math.min(selIdx, Math.max(0, filtered.length - 1));

    if (filtered.length === 0) {
      var emptyMsg = lq
        ? 'No results for \u201c' + escHtml(q) + '\u201d'
        : 'No shortcuts found \u2014 navigate to a section page first';
      paletteResults.innerHTML = '<div class="d2c-palette-empty">' + emptyMsg + '</div>';
      return;
    }

    var html = '';
    filtered.forEach(function (cmd, i) {
      var active = i === selIdx ? ' d2c-palette-active' : '';
      var badge = cmd.type === 'page' ?
        '<span class="d2c-palette-type d2c-pt-page">Page</span>' :
        cmd.type === 'dealer' ?
        '<span class="d2c-palette-type d2c-pt-dealer">Dealer</span>' :
        '<span class="d2c-palette-type d2c-pt-nav">Nav</span>';
      html +=
        '<div class="d2c-palette-item' + active + '" data-i="' + i + '">' +
          '<i class="' + escHtml(cmd.icon || 'fa fa-file-o') + '"></i>' +
          '<span class="d2c-palette-title">' + escHtml(cmd.title) + '</span>' +
          badge +
        '</div>';
    });
    paletteResults.innerHTML = html;

    var activeEl = paletteResults.querySelector('.d2c-palette-active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }

  function execute(cmd) {
    if (!cmd) return;
    closePalette();

    if (cmd.type === 'page') {
      window.location.href = cmd.href;
    } else if (cmd.type === 'dealer') {
      var sel = document.querySelector('#dealername select.selectpicker');
      if (sel && typeof jQuery !== 'undefined') {
        jQuery(sel).val(cmd.siteId).trigger('change');
      }
    } else if (cmd.type === 'nav') {
      // Switch dealer then navigate
      var selEl = document.querySelector('#dealername select.selectpicker');
      if (selEl && typeof jQuery !== 'undefined') {
        jQuery(selEl).val(cmd.siteId).trigger('change');
        setTimeout(function () { window.location.href = cmd.href; }, 400);
      } else {
        window.location.href = cmd.href;
      }
    }
  }

  function openPalette() {
    // Dismiss any open Bootstrap modal so its backdrop doesn't stack with ours
    try {
      if (typeof jQuery !== 'undefined') {
        jQuery('.modal.in').modal('hide');
        // Remove any orphaned backdrop immediately (Bootstrap removes it async)
        jQuery('.modal-backdrop').remove();
        jQuery('body').removeClass('modal-open').css('padding-right', '');
      }
    } catch (e) { /* ignore */ }

    commands = scrapeCommands();
    paletteOverlay.style.display = 'flex';
    paletteInput.value = '';
    selIdx = 0;
    render('');
    setTimeout(function () { paletteInput.focus(); }, 40);
  }

  function closePalette() {
    paletteOverlay.style.display = 'none';
  }

  /* Keyboard shortcut */
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (!paletteOverlay) return;
      paletteOverlay.style.display === 'none' ? openPalette() : closePalette();
    }
  });

  /* ================================================================
     6. FLOATING SAVE STATUS INDICATOR
     ================================================================ */
  // Shared flag — set on save button click, consumed by the next ajaxSend
  var d2cSaveArmed = false;
  var d2cSaveArmTimer = null;

  function buildSaveIndicator() {
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

  /* ================================================================
     7. SEARCH HINT BUTTON  (injected into header nav)
     ================================================================ */
  function buildSearchHint() {
    if (document.getElementById('d2c-search-hint')) return;

    var topRight = document.getElementById('topRight');
    if (!topRight) return;

    var el = document.createElement('div');
    el.id = 'd2c-search-hint';
    el.innerHTML =
      '<a href="#" title="Search pages and dealerships">' +
        '<i class="fa fa-search"></i>' +
        '<span class="d2c-hint-label">Search</span>' +
        '<span class="d2c-hint-kbd">Ctrl+K</span>' +
      '</a>';
    el.addEventListener('click', function (e) { e.preventDefault(); openPalette(); });
    // Insert at the very beginning of #topRight (before breadcrumb)
    topRight.insertBefore(el, topRight.firstChild);
  }

  /* ================================================================
     8. SCROLL TO TOP BUTTON
     ================================================================ */
  function buildScrollTop() {
    if (document.getElementById('d2c-scroll-top')) return;
    var btn = document.createElement('button');
    btn.id = 'd2c-scroll-top';
    btn.title = 'Scroll to top';
    btn.innerHTML = '&#8679;'; // ↑
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', function () {
      btn.classList.toggle('d2c-st-visible', window.scrollY > 400);
    }, { passive: true });
  }

  /* ================================================================
     9. FLOATING SAVE BUTTON
     ================================================================ */
  function buildFloatingSave() {
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

  /* ================================================================
     INIT
     ================================================================ */
  onReady(function () {
    // Critical path: layout measurement runs immediately
    measureHeader();
    window.addEventListener('resize', measureHeader, { passive: true });

    // Non-critical UI: defer until browser is idle so page interactions
    // (forms, dropdowns, CKEditor init) are not delayed
    var defer = typeof requestIdleCallback === 'function'
      ? function (fn) { requestIdleCallback(fn, { timeout: 2000 }); }
      : function (fn) { setTimeout(fn, 500); };

    defer(function () {
      buildBreadcrumb();
      buildSectionTOC();
      buildDealerNav();
      buildSearchHint();
      buildPalette();
      buildSaveIndicator();
      buildScrollTop();
      buildFloatingSave();
    });
  });

})();
