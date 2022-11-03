//  #region variable
let cipher = null, iv = null, key = null, data = null;
const encrytBtn = document.getElementById("encrytBtn");
const decryptBtn = document.getElementById("decryptBtn");
const sendToServerBtn = document.getElementById("sendToServerBtn");
const resArea = document.getElementById("out"); let salt;
const resArea2 = document.getElementById("out2"); let join1, join2 = null;
const message = 'Hi there, lets try crypto concepts';
const password = 'PasswordUsedIsMoreThan24WordsToAvailNorms';
const enc = new TextEncoder(); const dec = new TextDecoder();
var keyMaterial=null, wrappedKeyBuffer=null, wrappingKey=null, wrapped=null;
//  #endregion
//  #region wrapCryptoKey
function getKeyMaterial() {
    return window.crypto.subtle.importKey(
        "raw", enc.encode(password), { name: "PBKDF2" },
        false, ["deriveBits", "deriveKey"]);
}
function getKey(keyMaterial, salt) {
    return window.crypto.subtle.deriveKey(
        {   "name": "PBKDF2", salt: salt,
            "iterations": 100000, "hash": "SHA-256" },
        keyMaterial, { "name": "AES-KW", "length": 256 }, true,
        ["wrapKey", "unwrapKey"]);
}
async function wrapCryptoKey(keyToWrap) {
    keyMaterial = await getKeyMaterial();
    salt = window.crypto.getRandomValues(new Uint8Array(16));
    wrappingKey = await getKey(keyMaterial, salt);
    iv = window.crypto.getRandomValues(new Uint8Array(12));
    wrapped = await window.crypto.subtle.wrapKey(
        "raw", keyToWrap, wrappingKey, "AES-KW");
    console.log(keyToWrap); console.log(wrappingKey); console.log(wrapped);
    wrappedKeyBuffer = new Uint8Array(wrapped);
    join1 = window.btoa(wrappedKeyBuffer)
    resArea.textContent = join1;
}
//  #endregion
//  #region unWrapCryptoKey
let signingKey;
async function signMessage() {
    const signature = await window.crypto.subtle.sign(
        {   name: "RSA-PSS",    saltLength: 32    },
        signingKey,  enc.encode(message)    );
    const buffer = new Uint8Array(signature, 0, 5);
    resArea.textContent = `${buffer}...[${signature.byteLength} bytes total]`;
}
function bytesToArrayBuffer(bytes) {
    const bytesAsArrayBuffer = new ArrayBuffer(bytes.length);
    const bytesUint8 = new Uint8Array(bytesAsArrayBuffer);
    bytesUint8.set(bytes);
    return bytesAsArrayBuffer;
}
async function getUnwrappingKey() {
    const keyMaterial = await getKeyMaterial();
    const saltBuffer = bytesToArrayBuffer(salt);
    let unWrappingKey = await window.crypto.subtle.deriveKey(
      { "name": "PBKDF2", salt: saltBuffer,
        "iterations": 100000, "hash": "SHA-256" },
      keyMaterial, { "name": "AES-KW", "length": 256},
      true, [ "wrapKey", "unwrapKey" ]  );
    return unWrappingKey;
}
async function unWrapCryptoKey() {
    const unwrappingKey = await getUnwrappingKey();
    // const wrappedKeyBuffer = bytesToArrayBuffer(wrappedKey);
    let unwrappedKey = await window.crypto.subtle.unwrapKey(
      "raw",                 // import format
      wrapped,      // ArrayBuffer representing key to unwrap
      unwrappingKey,         // CryptoKey representing key encryption key
      "AES-KW",              // algorithm identifier for key encryption key
      "AES-GCM",             // algorithm identifier for key to unwrap
      true,                  // extractability of key to unwrap
      ["encrypt", "decrypt"] // key usages for key to unwrap
    );
    wrapped = await window.crypto.subtle.wrapKey(
        "raw", unwrappedKey, wrappingKey, "AES-KW");
    wrappedKeyBuffer = new Uint8Array(wrapped);
    join2 = window.btoa(wrappedKeyBuffer)
    resArea2.textContent = join2;
    document.getElementById("res").textContent = (join1 === join2) ? true : false;
}
//  #endregion
//  #region ui handlers
window.crypto.subtle.generateKey( {   name: "AES-GCM", length: 256 }, true,
  ["encrypt", "decrypt"]).then((keyPair) => { key = keyPair; });
encrytBtn.addEventListener("click", () => { wrapCryptoKey(key); });
decryptBtn.addEventListener("click", () => { unWrapCryptoKey(); });
sendToServerBtn.addEventListener("click", async () => {
    let message = await fetch('/crypto/3d', {
        method: 'POST',
        headers: { 'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, body: JSON.stringify(data)
    }).then(response => response.json());
    console.log(message);  // resArea.innerText = message;
});
//  #endregion