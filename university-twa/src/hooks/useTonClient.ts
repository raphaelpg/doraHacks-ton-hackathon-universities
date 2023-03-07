import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from 'ton';
import { CONSTANTS_TON_NETWORK_TYPE } from '../settings/constants';
import { useAsyncInitialize } from './useAsyncInitialize';

export function useTonClient() {
  return useAsyncInitialize(
    async () =>
      new TonClient({
        endpoint: await getHttpEndpoint({ network: CONSTANTS_TON_NETWORK_TYPE }),
      })
  );
}
