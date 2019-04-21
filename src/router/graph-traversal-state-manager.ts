import {LineStop} from '../models/line-stop';
import {DijkstraGraphTraverser} from './dijkstra-graph-traverser';

export class GraphTraversalStateManager {
    public startTraversal(allStops: LineStop[], source: LineStop): DijkstraGraphTraverser {
        return DijkstraGraphTraverser.traverseWith(allStops, source);
    }
}