//  #region variable
let cipher = null, iv = null, key = null, data = null;
const encrytBtn = document.getElementById("encrytBtn");
const decryptBtn = document.getElementById("decryptBtn");
const sendToServerBtn = document.getElementById("sendToServerBtn");
const resArea = document.getElementById("out"); let salt;
let res = document.getElementById("res"); let originalEncryptKey = null;
const resArea2 = document.getElementById("out2"); let join1, join2 = null;
const message = 'Hi there, lets try crypto concepts';
const password = 'PasswordUsedIsMoreThan24WordsToAvailNorms';
const enc = new TextEncoder(); const dec = new TextDecoder();
var keyMaterial = null, wrappedKeyBuffer = null, wrappingKey = null,
    wrapped = null, packedKey, unPackedKey;
//  #endregion
//  #region wrapCryptoKey
const pack = (buffer) => { return window.btoa( String.fromCharCode.apply(null, new Uint8Array(buffer)) ) }
function getKeyMaterial() {
    return window.crypto.subtle.importKey(
        "raw", enc.encode(password), { name: "PBKDF2" },
        false, ["deriveBits", "deriveKey"]);        }
function getKey(keyMaterial, salt) {
    return window.crypto.subtle.deriveKey(
        {   "name": "PBKDF2", salt: salt,
            "iterations": 100000, "hash": "SHA-256"  },
        keyMaterial, { "name": "AES-KW", "length": 256 }, true,
        ["wrapKey", "unwrapKey"]);                  }
async function wrapCryptoKey(keyToWrap) {
    keyMaterial = await getKeyMaterial();
    salt = window.crypto.getRandomValues(new Uint8Array(16));
    wrappingKey = await getKey(keyMaterial, salt);
    iv = window.crypto.getRandomValues(new Uint8Array(12));
    wrapped = await window.crypto.subtle.wrapKey(
        "raw", keyToWrap, wrappingKey, "AES-KW");
    packedKey = pack(wrapped)
    wrappedKeyBuffer = new Uint8Array(wrapped);
    join1 = window.btoa(wrappedKeyBuffer)
    resArea.textContent = join1;
}
async function encrypt() {
    iv = window.crypto.getRandomValues(new Uint8Array(12));
    cipher = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv }, key, enc.encode(message));
    originalEncryptKey = key;
    let buffer = new Uint8Array(cipher, 0, 5);
    resArea.textContent = `${buffer}...[${cipher.byteLength} bytes total]`;
    wrapCryptoKey(key);                             }
//  #endregion
//  #region unWrapCryptoKey
function bytesToArrayBuffer(bytes) {
    const bytesAsArrayBuffer = new ArrayBuffer(bytes.length);
    const bytesUint8 = new Uint8Array(bytesAsArrayBuffer);
    bytesUint8.set(bytes);
    return bytesAsArrayBuffer;
}
const unpack = (packed) => {
    const string = window.atob(packed)
    const buffer = new ArrayBuffer(string.length)
    const bufferView = new Uint8Array(buffer)
    for (let i = 0; i < string.length; i++) {
        bufferView[i] = string.charCodeAt(i);   }
    return buffer
}
async function getUnwrappingKey() {
    const keyMaterial = await getKeyMaterial();
    const saltBuffer = bytesToArrayBuffer(salt);
    let unWrappingKey = await window.crypto.subtle.deriveKey(
        {   "name": "PBKDF2", salt: saltBuffer,
            "iterations": 100000, "hash": "SHA-256"     },
        keyMaterial, { "name": "AES-KW", "length": 256 },
        true, ["wrapKey", "unwrapKey"]);
    return unWrappingKey;                           }
async function decrypt(unwrappedKey) {
    try {   // originalEncryptKey
        let decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv }, unwrappedKey, cipher);
        let message = dec.decode(decrypted);
    } catch (err) { console.error(err)  }
    return message;                                 }
async function unWrapCryptoKey() {
    let unPackedKey = unpack(packedKey);
    const unwrappingKey = await getUnwrappingKey();
    let unwrappedKey = await window.crypto.subtle.unwrapKey(
        "raw",                 // import format
        unPackedKey,      // ArrayBuffer representing key to unwrap
        unwrappingKey,         // CryptoKey representing key encryption key
        "AES-KW",              // algorithm identifier for key encryption key
        "AES-GCM",             // algorithm identifier for key to unwrap
        true,                  // extractability of key to unwrap
        ["encrypt", "decrypt"] // key usages for key to unwrap
    );
    let msg = await decrypt(unwrappedKey);
    resArea2.textContent = msg;
    res.textContent = (msg === message) ? true : false; }
//  #endregion
//  #region ui handlers
window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true,
    ["encrypt", "decrypt"]).then((keyPair) => { key = keyPair; });
encrytBtn.addEventListener("click", () => { encrypt(); });
decryptBtn.addEventListener("click", () => { unWrapCryptoKey(); });
sendToServerBtn.addEventListener("click", async () => {
    let message = await fetch('/crypto/3d', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, body: JSON.stringify(data)
    }).then(response => response.json());
    console.log(message);  // resArea.innerText = message;
});
//  #endregion