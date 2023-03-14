import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type MainConfig = {
    owner_address: Address;
    last_sender_address: Address;
    factory_code: Cell;
};

export function mainConfigToCell(config: MainConfig): Cell {
    return beginCell()
        .storeAddress(config.owner_address)
        .storeAddress(config.last_sender_address)
        .storeRef(config.factory_code)
        .endCell();
}

export const Opcodes = {
    transfer_ownership: 0x2da38aaf,
    create_collection: 42,
};

export class Main implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Main(address);
    }

    static createFromConfig(config: MainConfig, code: Cell, workchain = 0) {
        const data = mainConfigToCell(config);
        const init = { code, data };
        return new Main(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendCreateCollection(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.create_collection, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .endCell(),
        });
    }

    
    async sendtransferOwnership(
        provider: ContractProvider, 
        via: Sender, 
        opts: {
            newOwnerAddress: Address;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.transfer_ownership, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeAddress(opts.newOwnerAddress)
                .endCell(),
        });
    }

    async getOwner(provider: ContractProvider) {
        const result = await provider.get('get_owner_address', []);
        return result.stack.readAddress();
    }

    async getLastSender(provider: ContractProvider) {
        const result = await provider.get('get_last_sender_address', []);
        return result.stack.readAddress();
    }

    async getWalletFactoryAddress(provider: ContractProvider, wallet: Address) {
        const walletCell = beginCell().storeAddress(wallet).endCell();
        const result = await provider.get('get_wallet_factory_address', [{
            type: 'slice',
            cell: walletCell
        }]);
        return result.stack.readAddress()
    }
}
