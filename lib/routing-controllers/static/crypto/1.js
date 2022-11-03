(() => {
    /*
    Store the calculated ciphertext and IV here, so we can decrypt the message later.
    */
    let ciphertext;
    let iv;
    let message = "PasswordUsedIsMoreThan24WordsToAvailNorms";
  
    /*
    Fetch the contents of the "message" textbox, and encode it
    in a form we can use for the encrypt operation.
    */
    function getMessageEncoding() {
      let enc = new TextEncoder();
      return enc.encode(message);
    }
    /*
    Get the encoded message, encrypt it and display a representation
    of the ciphertext in the "Ciphertext" element.
    */
    async function encryptMessage(key) {
      let encoded = getMessageEncoding();
      // The iv must never be reused with a given key.
      iv = window.crypto.getRandomValues(new Uint8Array(16));
      ciphertext = await window.crypto.subtle.encrypt(
        {
          name: "AES-CBC",
          iv
        },
        key,
        encoded
      );
      console.log(ciphertext)
      let buffer = new Uint8Array(ciphertext, 0, 5);
      console.log(buffer)
    //   resArea.textContent = `${buffer}...[${ciphertext.byteLength} bytes total]`;
      resArea.textContent = `${buffer.toString()}`;
    }
    /*
    Fetch the ciphertext and decrypt it.
    Write the decrypted message into the "Decrypted" box.
    */
    async function decryptMessage(key) {
      let decrypted = await window.crypto.subtle.decrypt(
        {
          name: "AES-CBC",
          iv
        },
        key,
        ciphertext
      );
      console.log(decrypted)
      let dec = new TextDecoder();
      resArea.textContent = dec.decode(decrypted);
    }

    const encryptButton = document.getElementById("ba");
    const decryptButton = document.getElementById("cl");
    const resArea = document.getElementById("out")
    /*
    Generate an encryption key, then set up event listeners
    on the "Encrypt" and "Decrypt" buttons.
    */
    window.crypto.subtle.generateKey(
      {
          name: "AES-CBC",
          length: 256
      },
      true,
      ["encrypt", "decrypt"]
    ).then((key) => {
      encryptButton.addEventListener("click", () => {
        encryptMessage(key);
      });
      decryptButton.addEventListener("click", () => {
        decryptMessage(key);
      });
    });
  
  })();