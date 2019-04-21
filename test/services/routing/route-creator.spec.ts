import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {RouteCreator} from '../../../src/services/routing/route-creator';
import {LineStopBuilder} from '../../builders/line-stop.builder';
import {DijkstraGraphTraverser} from '../../../src/services/routing/dijkstra-graph-traverser';

@suite
class RouteCreatorSpec {
    private routeCreator: RouteCreator;

    public before(): void {
        this.routeCreator = new RouteCreator();
    }

    @test
    public async shouldCreateRouteFromTraverser(): Promise<void> {
        const aLineStop = LineStopBuilder.withDefaults().build();
        const sourceLineStop = LineStopBuilder.withDefaults().build();
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const yetAnotherLineStop = LineStopBuilder.withDefaults().build();
        const destinationLineStop = LineStopBuilder.withDefaults().build();
        const allStops = [aLineStop, anotherLineStop, yetAnotherLineStop, sourceLineStop, destinationLineStop];

        const traverser = DijkstraGraphTraverser.traverseWith(allStops, sourceLineStop);
        traverser.optionallySaveTimeToLineStop(aLineStop, sourceLineStop, 1);
        traverser.optionallySaveTimeToLineStop(anotherLineStop, aLineStop, 1);
        traverser.optionallySaveTimeToLineStop(yetAnotherLineStop, anotherLineStop, 1);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, yetAnotherLineStop, 1);

        const route = this.routeCreator.createFrom(destinationLineStop, sourceLineStop, traverser);

        expect(route).to.deep.equal([[sourceLineStop, aLineStop, anotherLineStop, yetAnotherLineStop, destinationLineStop]]);
    }

    @test
    public async shouldCreateMultipleRoutesWhenAvailable(): Promise<void> {
        const aLineStop = LineStopBuilder.withDefaults().build();
        const sourceLineStop = LineStopBuilder.withDefaults().build();
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const yetAnotherLineStop = LineStopBuilder.withDefaults().build();
        const destinationLineStop = LineStopBuilder.withDefaults().build();
        const allStops = [aLineStop, anotherLineStop, yetAnotherLineStop, sourceLineStop, destinationLineStop];

        const traverser = DijkstraGraphTraverser.traverseWith(allStops, sourceLineStop);
        traverser.optionallySaveTimeToLineStop(aLineStop, sourceLineStop, 1);
        traverser.optionallySaveTimeToLineStop(anotherLineStop, aLineStop, 1);
        traverser.optionallySaveTimeToLineStop(yetAnotherLineStop, anotherLineStop, 1);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, yetAnotherLineStop, 1);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, anotherLineStop, 2);

        const route = this.routeCreator.createFrom(destinationLineStop, sourceLineStop, traverser);

        expect(route).to.deep.equal([
            [sourceLineStop, aLineStop, anotherLineStop, yetAnotherLineStop, destinationLineStop],
            [sourceLineStop, aLineStop, anotherLineStop, destinationLineStop]
        ]);
    }

    @test
    public async shouldCreateRoutesWhenThereAreMultipleBranchesAvailable(): Promise<void> {
        const aLineStop = LineStopBuilder.withDefaults().build();
        const sourceLineStop = LineStopBuilder.withDefaults().build();
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const yetAnotherLineStop = LineStopBuilder.withDefaults().build();
        const destinationLineStop = LineStopBuilder.withDefaults().build();
        const allStops = [aLineStop, anotherLineStop, yetAnotherLineStop, sourceLineStop, destinationLineStop];

        const traverser = DijkstraGraphTraverser.traverseWith(allStops, sourceLineStop);
        traverser.optionallySaveTimeToLineStop(aLineStop, sourceLineStop, 1);
        traverser.optionallySaveTimeToLineStop(anotherLineStop, aLineStop, 1);
        traverser.optionallySaveTimeToLineStop(yetAnotherLineStop, anotherLineStop, 1);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, yetAnotherLineStop, 1);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, anotherLineStop, 2);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, sourceLineStop, 4);

        const route = this.routeCreator.createFrom(destinationLineStop, sourceLineStop, traverser);

        expect(route).to.deep.equal([
            [sourceLineStop, aLineStop, anotherLineStop, yetAnotherLineStop, destinationLineStop],
            [sourceLineStop, aLineStop, anotherLineStop, destinationLineStop],
            [sourceLineStop, destinationLineStop],
        ]);
    }
}