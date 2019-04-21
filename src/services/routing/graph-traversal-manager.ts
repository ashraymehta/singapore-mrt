import {LineStop} from '../../models/line-stop';
import {DijkstraGraphTraverser} from './dijkstra-graph-traverser';

export class GraphTraversalManager {
    public startTraversal(allStops: LineStop[], source: LineStop): DijkstraGraphTraverser {
        return DijkstraGraphTraverser.traverseWith(allStops, source);
    }
}