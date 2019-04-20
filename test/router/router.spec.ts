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
    public async shouldFindRouteBetweenTwoLineStopsWhenMetroHasASingleLineWithThoseTwoStops(): Promise<void> {
        const jurongLineStop = new LineStop(`NS1`, new Date(`10 March 1990`));
        const bukitBatokLineStop = new LineStop(`NS2`, new Date(`10 March 1990`));
        const lines = [new Line([jurongLineStop, bukitBatokLineStop])];
        const jurongEastStation = new Station(`Jurong East`, [jurongLineStop]);
        const bukitBatokStation = new Station(`Bukit Batok`, [bukitBatokLineStop]);
        const stations = new Stations([jurongEastStation, bukitBatokStation]);
        const metro = new Metro(lines, stations);

        const route = await this.router.findRouteBetween(jurongEastStation, bukitBatokStation, metro);

        expect(route).to.deep.equal([jurongLineStop, bukitBatokLineStop]);
    }

    @test
    public async shouldFindReverseRouteBetweenTwoLineStopsWhenMetroHasASingleLineWithThoseTwoStops(): Promise<void> {
        const jurongEastLineStop = new LineStop(`NS1`, new Date(`10 March 1990`));
        const bukitBatokLineStop = new LineStop(`NS2`, new Date(`10 March 1990`));
        const lines = [new Line([jurongEastLineStop, bukitBatokLineStop])];
        const jurongEastStation = new Station(`Jurong East`, [jurongEastLineStop]);
        const bukitBatokStation = new Station(`Bukit Batok`, [bukitBatokLineStop]);
        const stations = new Stations([jurongEastStation, bukitBatokStation]);
        const metro = new Metro(lines, stations);

        const route = await this.router.findRouteBetween(bukitBatokStation, jurongEastStation, metro);

        expect(route).to.deep.equal([bukitBatokLineStop, jurongEastLineStop]);
    }
}