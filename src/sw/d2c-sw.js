// D2C Admin SW shim  loads actual implementation from jsDelivr CDN.
// This file never needs to change. Other users only need this one-line shim
// in their chrome-overrides and the logic auto-updates on every push.
// Dev mode: add a 4th DevTools override cdn.jsdelivr.net/.../dist/d2c-sw.js -> dist/d2c-sw.js
importScripts('https://cdn.jsdelivr.net/gh/cbemister/blue-admin-ui@main/dist/d2c-sw.js');
