import { Controller, Get, Render, Post, Res, BodyParam } from 'routing-controllers';
import { scrypt, randomFill, createCipheriv, createHmac } from 'node:crypto';
const { subtle } = require('node:crypto').webcrypto;
import bcrypt from 'bcrypt'
import { Response } from 'express'
import { TextDecoder } from 'node:util';
import KeyOps from '@/services/crypto/keyOps';
import { rejections } from 'winston';
@Controller()
export class CryptoController {
    @Get('/crypto/hash-pack')
    async hashPack() {
        let secret = "secretIsSecret";
        const algorithm = "sha512";
        const message = 'PasswordUsedIsMoreThan24WordsToAvailNorms';
        let result = await new Promise(async (resolve) => {
            bcrypt.genSalt(2, (err, salt) => {
                bcrypt.hash(message, salt, function (err, hash) {
                    resolve({
                        data: hash, secret, algorithm, message
                    })
                })
            })
        })
        if (result) {
            return result
        } else {
            return false
        }
    }
    @Get('/crypto/hash')
    @Render('crypto/bcrypt-hash.html')
    hash() {
        return '1';
    }
    @Get('/crypto/windows-pack')
    async windowsPack() {
        let msg = "some clear text data";
        const algorithm = 'aes-192-cbc';
        const password = 'PasswordUsedIsMoreThan24WordsToAvailNorms';
        let result = await new Promise(async (resolve) => {
            // First, we'll generate the key. The key length is dependent on the algorithm.
            // In this case for aes192, it is 24 bytes (192 bits).
            scrypt(password, 'salt', 24, (err, key) => {
                if (err) throw err;
                // Then, we'll generate a random initialization vector
                randomFill(new Uint8Array(16), (err, iv) => {
                    if (err) throw err;
                    const cipher = createCipheriv(algorithm, key, iv);
                    let encrypted = cipher.update(msg, 'utf8', 'hex');
                    // console.log(encrypted)
                    encrypted += cipher.final('hex');
                    // console.log(encrypted)
                    resolve({
                        data: encrypted, password, algorithm, msg, iv, key
                    });
                });
            });
        })
        if (result) {
            return result
        } else {
            return false
        }
    }
    @Post('/crypto/7d')
    async example3decrypt(@Res() res: Response,
        @BodyParam("cipher") packCipher: string,
        @BodyParam("iv") packIv: string,
        @BodyParam("message") message: string,
        @BodyParam("packedWrappedKey") packedWrappedKey: string,
        @BodyParam("salt") packSalt: string,
        @BodyParam("password") password: string) {
        try{
            let result = await new Promise(async (resolve, reject) => {
                try{
                    let decryptedMsg = await KeyOps.decrypt(packCipher, packedWrappedKey, packIv, message, password, packSalt);
                    resolve({decryptedMsg})
                } catch (decryptionErr) {
                    console.log(decryptionErr)
                    reject(false)
                }
            })
            if (!!result) {
                return result
            } else {
                return false
            }
        } catch(err) {
            console.error(err)
            return false;
        }
        // return { cipher, iv, key };
    }
    @Get('/crypto/7')
    @Render('crypto/7.html')
    example7() {
        return '1';
    }
    @Get('/crypto/6')
    @Render('crypto/6-encryptDecryptMessageUsingWrapKey.html')
    example6() {
        return '1';
    }
    @Get('/crypto/5')
    @Render('crypto/5-encryptDecryptWrapKey.html')
    example5() {
        return '1';
    }
    @Get('/crypto/4')
    @Render('crypto/4-signMessageWrap.html')
    example4() {
        return '1';
    }
    @Get('/crypto/3')
    @Render('crypto/3-windowCrypto.html')
    example3() {
        return '1';
    }
    @Get('/crypto/2')
    @Render('crypto/2.html')
    example2() {
        return '1';
    }
    @Get('/crypto/1')
    @Render('crypto/1.html')
    example1() {
        return '1';
    }
    @Get('/crypto')
    index() {
        return 'OK';
    }
}
