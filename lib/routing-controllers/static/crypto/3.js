//  #region variable
let cipher = null, iv = null, key = null, data = null;
const encrytBtn = document.getElementById("encrytBtn");
const decryptBtn = document.getElementById("decryptBtn");
const sendToServerBtn = document.getElementById("sendToServerBtn");
const resArea = document.getElementById("out"); let salt;
const message = 'Hi there, lets try crypto concepts';
const password = 'PasswordUsedIsMoreThan24WordsToAvailNorms';
//  #endregion
//  #region encypt
function getMessageEncoding() {
    let enc = new TextEncoder();
    return enc.encode(message);
}
async function encrypt() {
    let encoded = getMessageEncoding();
    // The iv must never be reused with a given key.
    iv = window.crypto.getRandomValues(new Uint8Array(12));
    cipher = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encoded
    );
    let buffer = new Uint8Array(cipher, 0, 5);
    resArea.textContent = `${buffer}...[${cipher.byteLength} bytes total]`;
}
//  #endregion
//  #region decrypt
async function decrypt() {
    let decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        cipher
    );

    let dec = new TextDecoder();
    resArea.textContent = dec.decode(decrypted);
}
//  #endregion
//  #region ui handlers
window.crypto.subtle.generateKey(
    {
        name: "AES-GCM",
        length: 256,
    },
    true,
    ["encrypt", "decrypt"]
).then((genKey) => {
    key = genKey;
});
encrytBtn.addEventListener("click", () => {
    encrypt();
});
decryptBtn.addEventListener("click", () => {
    decrypt();
});
sendToServerBtn.addEventListener("click", async () => {
    let Body = JSON.stringify(data)
    // console.log(Body)
    let message = await fetch('/crypto/3d', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: Body
    }).then(response => response.json());
    console.log(message);
    // resArea.innerText = message;
});
//  #endregion