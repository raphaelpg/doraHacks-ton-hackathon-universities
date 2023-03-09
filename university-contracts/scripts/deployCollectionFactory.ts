import { toNano } from 'ton-core';
import { CollectionFactory } from '../wrappers/CollectionFactory';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const collectionFactory = provider.open(
        CollectionFactory.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('CollectionFactory')
        )
    );

    await collectionFactory.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(collectionFactory.address);

    console.log('ID', await collectionFactory.getID());
}
