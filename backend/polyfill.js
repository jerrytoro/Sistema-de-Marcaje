/**
 * Polyfill para TextEncoder/TextDecoder
 * Este archivo se carga con --require ANTES de cualquier código
 */

const util = require('util');

global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

console.log('✅ [POLYFILL.JS] TextEncoder/TextDecoder cargados globalmente');