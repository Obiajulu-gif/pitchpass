// Browser shim for `sodium-universal`.
//
// In Node/Bare, sodium-universal uses the native `sodium-native`. In the
// browser it maps to `sodium-javascript`, which implements everything WDK needs
// EXCEPT `sodium_memzero` (a helper that wipes a buffer). We re-export the JS
// sodium implementation and add a correct `sodium_memzero` so WDK's EVM signer
// runs entirely client-side — keys never leave the device.

const sodium = require("sodium-javascript");

function sodium_memzero(buf) {
  if (buf && typeof buf.fill === "function") buf.fill(0);
}

module.exports = Object.assign({}, sodium, { sodium_memzero });
module.exports.sodium_memzero = sodium_memzero;
