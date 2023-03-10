import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type CollectionFactoryConfig = {
    id: number;
    counter: number;
    age: number;
    owner_address: Address;
    last_sender_address: Address;
};

export function collectionFactoryConfigToCell(config: CollectionFactoryConfig): Cell {
    return beginCell()
        .storeUint(config.id, 32)
        .storeUint(config.counter, 32)
        .storeUint(config.age, 32)
        .storeAddress(config.owner_address)
        .storeAddress(config.last_sender_address)
        .endCell();
}

export const Opcodes = {
    increase: 0x7e8764ef,
    transfer_ownership: 0x2da38aaf,
};

export class CollectionFactory implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new CollectionFactory(address);
    }

    static createFromConfig(config: CollectionFactoryConfig, code: Cell, workchain = 0) {
        const data = collectionFactoryConfigToCell(config);
        const init = { code, data };
        return new CollectionFactory(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendIncrease(
        provider: ContractProvider,
        via: Sender,
        opts: {
            increaseBy: number;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.increase, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.increaseBy, 32)
                .endCell(),
        });
    }

    
    async transferOwnership(
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

    async getCounter(provider: ContractProvider) {
        const result = await provider.get('get_counter', []);
        return result.stack.readNumber();
    }

    async getID(provider: ContractProvider) {
        const result = await provider.get('get_id', []);
        return result.stack.readNumber();
    }

    async getAge(provider: ContractProvider) {
        const result = await provider.get('get_age', []);
        return result.stack.readNumber();
    }

    async getOwner(provider: ContractProvider) {
        const result = await provider.get('get_owner_address', []);
        return result.stack.readAddress();
    }

    async getLastSender(provider: ContractProvider) {
        const result = await provider.get('get_last_sender_address', []);
        return result.stack.readAddress();
    }
}
