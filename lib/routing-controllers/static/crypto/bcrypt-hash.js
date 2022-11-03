async function getPacket() {
    let pack = await fetch('/crypto/hash-pack')
        .then(response => response.json());
    console.log(pack);
    decryptPack(pack)
}
async function decryptPack(pack) {
    // console.log(pack.data)
    let rs = null;
    var bcrypt = dcodeIO.bcrypt;
    bcrypt.compare(pack.message, pack.data, function(err, res) {
        if(res) alert("hash matched");
        else alert("hash not matched");
    })
    // let msg = "some clear text data"; let password = "wrongPass";
    // let mk = CryptoJS.createDecipheriv(algorithm, password, pack.iv)
    // let ms = mk.update(pack.data, 'hex', 'utf8')
    // mks = ms + mk.final('utf8')
    // console.log(mks)
    // rs = CryptoJS.enc.Hex.parse(pack.message)
    // console.log(rs)
    // rs = CryptoJS.HmacSHA512(rs, pack.secret)
    // rs = CryptoJS.subtle.decrypt(pack.algorithm, pack.secret, pack.hash)
    // let mkd = CryptoJS.also.AES.createDecryptor(pass.key, { iv: pass.iv });
    // let plainText1 = mkd.process(pass.data)
    // rs = deCrypted.toString(CryptoJS.enc.Utf8)
    // rs = CryptoJS.enc.Hex.stringify(deCrypted.words)
    // console.log(rs)
    // rs = CryptoJS.enc.Utf8.stringify(rs.words)
    // console.log(deCrypted)
    // console.log(deCrypted.toString(CryptoJS.enc.hex).toString(Crypto.enc.Utf8))
    // console.log(rs)
}
getPacket();