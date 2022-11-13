import CFKV from '../../types/CFKV';
import CFKVStorage from './CFKVStorage';
import IKVStorage from './IKVStorage';

const getStorage: (env: { CFKV: CFKV }) => Promise<IKVStorage> = async (env) =>
  new CFKVStorage(env);

export default getStorage;
