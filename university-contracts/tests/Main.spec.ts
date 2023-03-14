import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Address, Cell, toNano } from 'ton-core';
import { Main } from '../wrappers/Main';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { randomAddress } from './helpers';

describe('Main', () => {
    let code: Cell;
    let factoryCode: Cell;

    beforeAll(async () => {
        code = await compile('Main');
        factoryCode = await compile('collectionFactory');
    });

    let blockchain: Blockchain;
    let main: SandboxContract<Main>;
    let deployerAddress: Address;
    beforeEach(async () => {
        blockchain = await Blockchain.create();

        const deployer = await blockchain.treasury('deployer');
        deployerAddress = deployer.address;

        main = blockchain.openContract(
            Main.createFromConfig(
                {
                    owner_address: deployer.address,
                    factory_code: factoryCode,
                },
                code
            )
        );

        const deployResult = await main.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: main.address,
            deploy: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and collectionFactory are ready to use
    });

    it('should retrieve owner address', async () => {
        const owner = await main.getOwner();

        console.log({owner})
        console.log({"deployer.address": deployerAddress})

        expect(owner.equals(deployerAddress)).toEqual(true);
    })

    it("should retrieve user's factory", async () => {
        const newSender = await blockchain.treasury('newUser');

        console.log('newSender', newSender.address);

        const userFactory = await main.getWalletFactoryAddress(newSender.address);

        console.log({userFactory})
        // console.log({deployerAddress})
        // expect(lastSender.equals(deployerAddress)).toEqual(true);
    })
});
