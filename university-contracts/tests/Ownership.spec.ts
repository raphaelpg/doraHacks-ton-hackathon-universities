import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
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
    let deployer: SandboxContract<TreasuryContract>;
    let deployerAddress: Address;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
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

    it("should allow owner to transfer ownership", async () => {
        const newOwner = await blockchain.treasury('newOwner');
        
        const contractOwnerBefore = await collectionFactory.getOwner();

        await collectionFactory.sendtransferOwnership(deployer.getSender(), {
            newOwnerAddress: newOwner.address,
            value: toNano('0.05'),
        })

        const contractOwnerAfter = await collectionFactory.getOwner();

        expect(contractOwnerAfter.equals(contractOwnerBefore)).toEqual(false);
        expect(contractOwnerAfter.equals(newOwner.address)).toEqual(true);
    });

    it("should allow owner to transfer ownership", async () => {
        const randomUser = await blockchain.treasury('randomUser');
        const newOwner = await blockchain.treasury('newOwner');

        const contractOwnerBefore = await collectionFactory.getOwner();
        
        await collectionFactory.sendtransferOwnership(randomUser.getSender(), {
            newOwnerAddress: newOwner.address,
            value: toNano('0.05'),
        })

        const contractOwnerAfter = await collectionFactory.getOwner();

        expect(contractOwnerAfter.equals(contractOwnerBefore)).toEqual(true);
        expect(contractOwnerAfter.equals(newOwner.address)).toEqual(false);
    });
});
