import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano, Address } from 'ton-core';
import { CollectionFactory } from '../wrappers/CollectionFactory';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

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
                    owner_address: deployerAddress,
                    last_sender_address: deployerAddress,
                },
                code
            )
        );

        const deployResult = await collectionFactory.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployerAddress,
            to: collectionFactory.address,
            deploy: true,
        });
    });

    it('should retrieve owner address', async () => {
        const owner = await collectionFactory.getOwner();

        console.log({owner})
        console.log({"deployer.address": deployerAddress})

        expect(owner.equals(deployerAddress)).toEqual(true);
    })

    // it("should prevent others from changing owners", async () => {
    //     const newOwner = await blockchain.treasury('newOwner');
    //     const changeOwnerResult = await collectionFactory.transferOwnership(blockchain.provider(), newOwner.getSender(), {
    //         newOwnerAddress: deployerAddress,
    //         value: toNano('0.05'),
    //     })

    //     expect(changeOwnerResult.transactions).toHaveTransaction({
    //         from: deployerAddress,
    //         to: collectionFactory.address,
    //         deploy: true,
    //     });
    // });
});
