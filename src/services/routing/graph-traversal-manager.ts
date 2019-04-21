import {LineStop} from '../../models/line-stop';
import {provide} from 'inversify-binding-decorators';
import {DijkstraGraphTraverser} from './dijkstra-graph-traverser';

@provide(GraphTraversalManager)
export class GraphTraversalManager {
    public startTraversal(allStops: LineStop[], source: LineStop): DijkstraGraphTraverser {
        return DijkstraGraphTraverser.traverseWith(allStops, source);
    }
}