const Buffer = require('node:buffer')
const { subtle } = require('node:crypto').webcrypto;
import { TextEncoder, TextDecoder } from "util";
const enc = new TextEncoder(); const dec = new TextDecoder();
function bytesToArrayBuffer(bytes) {
    const bytesAsArrayBuffer = new ArrayBuffer(bytes.length);
    const bytesUint8 = new Uint8Array(bytesAsArrayBuffer);
    bytesUint8.set(bytes);
    return bytesAsArrayBuffer;                  }
function getKeyMaterial(password) {
    return subtle.importKey(
        "raw", enc.encode(password), { name: "PBKDF2" },
        false, ["deriveBits", "deriveKey"]);        }
async function getUnwrappingKey(password, salt) {
    const keyMaterial = await getKeyMaterial(password);
    // const saltBuffer = bytesToArrayBuffer(salt);
    let unWrappingKey = await subtle.deriveKey(
        {   "name": "PBKDF2", salt: salt,
            "iterations": 100000, "hash": "SHA-256"     },
        keyMaterial, { "name": "AES-KW", "length": 256 },
        true, ["wrapKey", "unwrapKey"]);
    return unWrappingKey;                       }
async function decrypt(cipher, unwrappedKey, iv) { let message = null;
    try {   // originalEncryptKey
        let decrypted = await subtle.decrypt(
            { name: "AES-GCM", iv: iv }, unwrappedKey, cipher);
        message = dec.decode(decrypted);
    } catch (err) { console.error(err)  }
    return message;                             }
async function unWrapCryptoKey(wrappedKey, encryptedMsg, iv, password, salt) {
    const unwrappingKey = await getUnwrappingKey(password, salt);
    let unwrappedKey = await subtle.unwrapKey(
        "raw",                 // import format
        wrappedKey,      // ArrayBuffer representing key to unwrap
        unwrappingKey,         // CryptoKey representing key encryption key
        "AES-KW",              // algorithm identifier for key encryption key
        "AES-GCM",             // algorithm identifier for key to unwrap
        true,                  // extractability of key to unwrap
        ["encrypt", "decrypt"] // key usages for key to unwrap
    );
    let msg = await decrypt(encryptedMsg, unwrappedKey, iv);       
    return msg;                                             }
export default class KeyOps {
    public static unPack = (data) => {
        const string = Buffer.atob(data)
        const buffer = new ArrayBuffer(string.length)
        const bufferView = new Uint8Array(buffer)
        for (let i = 0; i < string.length; i++) { bufferView[i] = string.charCodeAt(i); }
        return buffer
    }
    public static decrypt = async (packCipher, packedWrappedKey, packIv, 
        message, password, packSalt) => {
        let encryptedMsg = this.unPack(packCipher); 
        let wrappedKey = this.unPack(packedWrappedKey);
        let iv = this.unPack(packIv);
        let salt = this.unPack(packSalt);
        let decryptedMsg = await unWrapCryptoKey(wrappedKey, encryptedMsg, iv, password, salt)
        // console.log(key);
        return decryptedMsg;    }
    public static hi = () => {
        return 'hi';
    }
}