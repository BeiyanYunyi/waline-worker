import { encode, decode } from 'base65536';

/**
 * 一个哈希函数，使用 SHA-256 算法从给定字符串生成一个哈希值。
 */
const getDerivation = async (param: {
  /** 给定字符串 */
  stringToHash: string;
  /** 迭代次数，默认为 1048576 次 */
  iterations?: number;
  /** 哈希值长度，默认为 256 */
  length?: number;
  /** 盐字符串 */
  salt: string;
}) => {
  const textEncoder = new TextEncoder();
  const stringToHashBuffer = textEncoder.encode(param.stringToHash);
  const importedKey = await crypto.subtle.importKey('raw', stringToHashBuffer, 'PBKDF2', false, [
    'deriveBits',
  ]);
  const saltAry = textEncoder.encode(param.salt);
  const derivation = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltAry, iterations: param.iterations || 1048576 },
    importedKey,
    param.length || 256,
  );
  return derivation;
};

/**
 * 从密码生成加密用的密钥。
 * 接受一个参数作为密码。
 * @param password 密码
 */
const getKey = async (password: string) => {
  const derivation = await getDerivation({
    stringToHash: password,
    salt: 'LidisCrypt114514',
  });
  const importedEncryptionKey = await crypto.subtle.importKey(
    'raw',
    derivation,
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt'],
  );
  return importedEncryptionKey;
};

/** 加密一段信息
 * @param text - 要被加密的信息
 * @param password - 密码
 */
const encrypt = async (text: string, password: string) => {
  const key = await getKey(password);
  const textEncoder = new TextEncoder();
  const textBuffer = textEncoder.encode(text);
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encryptedText: ArrayBuffer = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv, length: 256 },
    key,
    textBuffer,
  );
  const encryptedTextAry = new Uint8Array(encryptedText);
  const aryToEncode = new Uint8Array(iv.length + encryptedTextAry.length);
  aryToEncode.set(iv);
  aryToEncode.set(encryptedTextAry, iv.length);
  return encode(aryToEncode);
};

/** 解密一段信息
 * @param cipher - 要被解密的密文
 * @param password - 密码
 */
const decrypt = async (cipher: string, password: string) => {
  const key = await getKey(password);
  const decCipher = decode(cipher);
  const iv = decCipher.slice(0, 16);
  const decryptedText = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv, length: 256 },
    key,
    decCipher.slice(16),
  );
  const textDecoder = new TextDecoder();
  return textDecoder.decode(decryptedText);
};

const lidisCrypt = {
  encrypt,
  decrypt,
  getDerivation,
};

export default lidisCrypt;

// For vitest
if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest;
  describe.concurrent('Test encryption', () => {
    const text = '114514';
    const password = '114514';
    it('Should be able to encrypt and decrypt', async () => {
      const encrypted = await lidisCrypt.encrypt(text, password);
      if (!process.env.CI) console.log(encrypted);
      const decrypted = await lidisCrypt.decrypt(encrypted, password);
      if (!process.env.CI) console.log(decrypted);
      expect(decrypted).toBe(text);
    });
    it("Shouldn't be the same when encrypting the same text", async () => {
      const encrypted1 = await lidisCrypt.encrypt(text, password);
      const encrypted2 = await lidisCrypt.encrypt(text, password);
      expect(encrypted1).not.toBe(encrypted2);
    });
  });
}
