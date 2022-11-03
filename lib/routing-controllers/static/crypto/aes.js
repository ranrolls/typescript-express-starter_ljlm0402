async function getPacket() {
    let pack = await fetch('/crypto/aes-pack')
        .then(response => response.json());
    console.log(pack);
    decryptPack(pack)
}
async function decryptPack(pack) {
    let msg = "some clear text data"; let password = "wrongPass";
    // let mk = CryptoJS.createDecipheriv(algorithm, password, pack.iv)
    // let ms = mk.update(pack.data, 'hex', 'utf8')
    // mks = ms + mk.final('utf8')
    // console.log(mks)
    let key = CryptoJS.enc.Utf8.parse(pack.key)
    let iv = CryptoJS.enc.Utf8.parse(pack.iv)
    console.log(key.toString())
    console.log(iv.toString())
    var deCrypted = CryptoJS.AES.decrypt(pack.data, password)
    console.log(deCrypted)
    let rs = null;
    // let mkd = CryptoJS.also.AES.createDecryptor(pass.key, { iv: pass.iv });
    // let plainText1 = mkd.process(pass.data)
    // rs = deCrypted.toString(CryptoJS.enc.Utf8)
    rs = CryptoJS.enc.Hex.stringify(deCrypted.words)
    console.log(rs)
    rs = CryptoJS.enc.Utf8.stringify(rs)
    // console.log(deCrypted)
    // console.log(deCrypted.toString(CryptoJS.enc.hex).toString(Crypto.enc.Utf8))
    console.log(rs)
}
getPacket();