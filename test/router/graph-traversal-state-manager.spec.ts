import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {LineStopBuilder} from '../builders/line-stop.builder';
import {GraphTraversalStateManager} from '../../src/router/graph-traversal-state-manager';

@suite
class GraphTraversalStateManagerSpec {
    private graphTraversalStateManager: GraphTraversalStateManager;

    public before(): void {
        this.graphTraversalStateManager = new GraphTraversalStateManager();
    }

    @test
    public async shouldCreateDijsktraGraphTraversor(): Promise<void> {
        const source = LineStopBuilder.withDefaults().build();
        const allStops = [source, LineStopBuilder.withDefaults().build(), LineStopBuilder.withDefaults().build()];

        const traversor = this.graphTraversalStateManager.startTraversal(allStops, source);

        expect(traversor.unvisitedStops).to.have.lengthOf(3);
        expect(traversor.moveToNext()).to.equal(source);
    }
}