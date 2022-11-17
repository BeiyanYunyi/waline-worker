import CFKV from '../../types/CFKV';
import CFKVStorage from './CFKVStorage';
import IKVStorage from './IKVStorage';

const getStorage = async (env: { CFKV: CFKV }): Promise<IKVStorage> => new CFKVStorage(env);

export default getStorage;
