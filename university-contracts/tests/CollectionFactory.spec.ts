import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Address, Cell, toNano } from 'ton-core';
import { CollectionFactory } from '../wrappers/CollectionFactory';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { randomAddress } from './helpers';

describe('CollectionFactory', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('CollectionFactory');
    });

    let blockchain: Blockchain;
    let collectionFactory: SandboxContract<CollectionFactory>;
    let deployerAddress: Address;
    beforeEach(async () => {
        blockchain = await Blockchain.create();

        const deployer = await blockchain.treasury('deployer');
        deployerAddress = deployer.address;

        collectionFactory = blockchain.openContract(
            CollectionFactory.createFromConfig(
                {
                    id: 0,
                    counter: 0,
                    age: 42,
                    owner_address: deployer.address,
                    last_sender_address: deployer.address,
                },
                code
            )
        );

        const deployResult = await collectionFactory.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: collectionFactory.address,
            deploy: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and collectionFactory are ready to use
    });

    it('should retrieve age', async () => {
        const initalAge = await collectionFactory.getAge();

        console.log({initalAge});

        expect(initalAge).toBe(42);
    });

    it('should retrieve last sender address and it should be the deployer', async () => {
        const lastSender = await collectionFactory.getLastSender();

        console.log({lastSender})
        console.log({deployerAddress})
        expect(lastSender.equals(deployerAddress)).toEqual(true);
    })

    it('should increase counter', async () => {
        const increaseTimes = 3;
        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const increaser = await blockchain.treasury('increaser' + i);

            const counterBefore = await collectionFactory.getCounter();

            console.log('counter before increasing', counterBefore);

            const increaseBy = Math.floor(Math.random() * 100);

            console.log('increasing by', increaseBy);

            const increaseResult = await collectionFactory.sendIncrease(increaser.getSender(), {
                increaseBy,
                value: toNano('0.05'),
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: increaser.address,
                to: collectionFactory.address,
                success: true,
            });

            const counterAfter = await collectionFactory.getCounter();

            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }
    });

    it('should change last sender', async () => {
        const newSender = await blockchain.treasury('newSender');

        const lastSenderBefore = await collectionFactory.getLastSender();

        console.log('lastSenderBefore', lastSenderBefore);

        await collectionFactory.sendCreateCollection(newSender.getSender(), {
            value: toNano('0.05'),
        });

        const lastSenderAfter = await collectionFactory.getLastSender();

        console.log('lastSenderAfter', lastSenderAfter);

        expect(lastSenderBefore.equals(lastSenderAfter)).toEqual(false);
    });
});
