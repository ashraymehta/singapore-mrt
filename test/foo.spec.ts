import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';

@suite
class FooSpec {
    @test
    public async shouldAddNumbers(): Promise<void> {
        expect(1 + 1).to.equal(2);
    }
}