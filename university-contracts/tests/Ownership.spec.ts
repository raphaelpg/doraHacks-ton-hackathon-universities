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

    it('should retrieve owner address', async () => {
      blockchain = await Blockchain.create();

      const deployer = await blockchain.treasury('deployer');

      collectionFactory = blockchain.openContract(
          CollectionFactory.createFromConfig(
              {
                  id: 0,
                  counter: 0,
                  age: 42,
                  owner_address: deployer.address,
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

      const owner = await collectionFactory.getOwner();

      console.log({owner})
      console.log({"deployer.address": deployer.address})

      expect(owner.equals(deployer.address)).toEqual(true);
    })
});
