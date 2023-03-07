import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from 'ton';
import { TON_NETWORK_TYPE } from '../settings/constants';
import { useAsyncInitialize } from './useAsyncInitialize';

export function useTonClient() {
  return useAsyncInitialize(
    async () =>
      new TonClient({
        endpoint: await getHttpEndpoint({ network: TON_NETWORK_TYPE }),
      })
  );
}
