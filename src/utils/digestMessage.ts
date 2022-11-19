import { encode } from 'base65536';

const digestMessage = async (message: string, algorithm: AlgorithmIdentifier = 'SHA-1') => {
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
  const hashStr = encode(new Uint8Array(hashBuffer));
  return hashStr;
};

export default digestMessage;
