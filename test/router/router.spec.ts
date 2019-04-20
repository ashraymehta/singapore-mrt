import {expect} from 'chai';
import {Line} from '../../src/models/line';
import {suite, test} from 'mocha-typescript';
import {Metro} from '../../src/models/metro';
import {Router} from '../../src/router/router';
import {Station} from '../../src/models/station';
import {Stations} from '../../src/models/stations';
import {LineStop} from '../../src/models/line-stop';

@suite
class RouterSpec {
    private router: Router;

    public before(): void {
        this.router = new Router();
    }

    @test
    public async shouldFindRouteBetweenStationsWhenMetroHasASingleLinePassingThroughThem(): Promise<void> {
        const jurongEastStation = new Station(`Jurong East`);
        const bukitBatokStation = new Station(`Bukit Batok`);
        const jurongLineStop = new LineStop(`NS1`, jurongEastStation, new Date(`10 March 1990`));
        const bukitBatokLineStop = new LineStop(`NS2`, bukitBatokStation, new Date(`10 March 1990`));

        const lines = [new Line([jurongLineStop, bukitBatokLineStop])];
        const stations = new Stations([jurongEastStation, bukitBatokStation]);
        const metro = new Metro(lines, stations);

        const route = await this.router.findRouteBetween(jurongEastStation, bukitBatokStation, metro);

        expect(route).to.deep.equal([jurongLineStop, bukitBatokLineStop]);
    }

    @test
    public async shouldFindReverseRouteBetweenStationsWhenMetroHasASingleLinePassingThroughThem(): Promise<void> {
        const jurongEastStation = new Station(`Jurong East`);
        const bukitBatokStation = new Station(`Bukit Batok`);
        const jurongEastLineStop = new LineStop(`NS1`, jurongEastStation, new Date(`10 March 1990`));
        const bukitBatokLineStop = new LineStop(`NS2`, bukitBatokStation, new Date(`10 March 1990`));

        const lines = [new Line([jurongEastLineStop, bukitBatokLineStop])];
        const stations = new Stations([jurongEastStation, bukitBatokStation]);
        const metro = new Metro(lines, stations);

        const route = await this.router.findRouteBetween(bukitBatokStation, jurongEastStation, metro);

        expect(route).to.deep.equal([bukitBatokLineStop, jurongEastLineStop]);
    }

    @test
    public async shouldFindRouteBetweenFirstAndLastStopForALine(): Promise<void> {
        const firstStation = new Station(`Jurong East`);
        const middleStation = new Station(`Bukit Batok`);
        const lastStation = new Station(`Bukit Gombak`);

        const firstStop = new LineStop(`NS1`, firstStation, new Date(`10 March 1990`));
        const middleStop = new LineStop(`NS2`, middleStation, new Date(`10 March 1990`));
        const lastStop = new LineStop(`NS3`, lastStation, new Date(`10 March 1990`));

        const lines = [new Line([firstStop, middleStop, lastStop])];
        const stations = new Stations([firstStation, middleStation, lastStation]);
        const metro = new Metro(lines, stations);

        const route = await this.router.findRouteBetween(firstStation, lastStation, metro);

        expect(route).to.deep.equal([firstStop, middleStop, lastStop]);
    }

    @test
    public async shouldReturnAnEmptyRouteIfThereIsNoPathBetweenProvidedStations(): Promise<void> {
        const firstStation = new Station(`Jurong East`);
        const middleStation = new Station(`Bukit Batok`);
        const lastStation = new Station(`Bukit Gombak`);

        const firstStop = new LineStop(`NS1`, firstStation, new Date(`10 March 1990`));
        const middleStop = new LineStop(`NS2`, middleStation, new Date(`10 March 1990`));
        const lastStop = new LineStop(`NS3`, lastStation, new Date(`10 March 1990`));

        const lines = [new Line([firstStop, middleStop]), new Line([lastStop])];
        const stations = new Stations([firstStation, middleStation, lastStation]);
        const metro = new Metro(lines, stations);

        const route = await this.router.findRouteBetween(firstStation, lastStation, metro);

        expect(route).to.deep.equal([]);
    }
}