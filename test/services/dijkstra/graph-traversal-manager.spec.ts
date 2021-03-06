import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {LineStopBuilder} from '../../builders/line-stop.builder';
import {GraphTraversalManager} from '../../../src/services/dijkstra/graph-traversal-manager';

@suite
class GraphTraversalManagerSpec {
    private graphTraversalStateManager: GraphTraversalManager;

    public before(): void {
        this.graphTraversalStateManager = new GraphTraversalManager();
    }

    @test
    public async shouldCreateDijsktraGraphTraversor(): Promise<void> {
        const source = LineStopBuilder.withDefaults().build();
        const allStops = [source, LineStopBuilder.withDefaults().build(), LineStopBuilder.withDefaults().build()];

        const traversor = this.graphTraversalStateManager.startTraversal(allStops, [source]);

        expect(traversor.unvisitedStops).to.have.lengthOf(3);
        expect(traversor.moveToNext()).to.equal(source);
    }
}