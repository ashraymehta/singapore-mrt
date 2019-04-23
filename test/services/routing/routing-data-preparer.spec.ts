import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Line} from '../../../src/models/line';
import {Lines} from '../../../src/models/lines';
import {Station} from '../../../src/models/station';
import {LineStop} from '../../../src/models/line-stop';
import {anything, instance, mock, when} from 'ts-mockito';
import {LineStopBuilder} from '../../builders/line-stop.builder';
import {IntersectionLine} from '../../../src/models/intersection-line';
import {ConfigurationProvider} from '../../../src/providers/configuration-provider';
import {RoutingDataPreparer} from '../../../src/services/routing/routing-data-preparer';
import {LineTimingsConfiguration} from '../../../src/models/line-timings-configuration';

@suite
class RoutingDataPreparerSpec {
    private routingDataPreparer: RoutingDataPreparer;
    private configurationProvider: ConfigurationProvider;

    public before(): void {
        this.configurationProvider = mock(ConfigurationProvider);
        this.routingDataPreparer = new RoutingDataPreparer(instance(this.configurationProvider));
    }

    @test
    public async shouldGetLinesAndStopsFromMetro(): Promise<void> {
        const jurongEast = new Station('Jurong East');
        const bukitBatok = new Station('Bukit Batok');
        const harbourFront = new Station('HarbourFront');
        const aLine = new Line([
            new LineStop('NS1', jurongEast, new Date('10 March 1990')),
            new LineStop('NS2', bukitBatok, new Date('10 March 1990'))
        ]);
        const anotherLine = new Line([
            new LineStop('NE1', harbourFront, new Date('20 June 2003')),
        ]);
        const lines = new Lines([aLine, anotherLine]);

        const result = await this.routingDataPreparer.prepare(lines);

        expect(result).to.deep.equal({
            allLines: new Lines([aLine, anotherLine]),
            allStops: [...aLine.stops, ...anotherLine.stops]
        });
    }

    @test
    public async shouldGetUniqueStopsFromMetro(): Promise<void> {
        const commonStop = LineStopBuilder.withDefaults().build();
        const aLine = new Line([LineStopBuilder.withDefaults().build(), commonStop]);
        const anotherLine = new Line([LineStopBuilder.withDefaults().build(), commonStop]);
        const lines = new Lines([aLine, anotherLine]);

        const result = await this.routingDataPreparer.prepare(lines);

        expect(result).to.deep.equal({
            allLines: new Lines([aLine, anotherLine]),
            allStops: [...aLine.stops, anotherLine.stops[0]]
        });
    }

    @test
    public async shouldAddIntersectionLinesForAllIntersectionsInTheMetro(): Promise<void> {
        const brasBasah = new Station('Bras Basah');
        const dhobyGhaut = new Station('Dhoby Ghaut');
        const clarkeQuay = new Station('Clarke Quay');
        const aLine = new Line([
            new LineStop('NE6', dhobyGhaut, new Date('20 June 2003')),
            new LineStop('NE5', clarkeQuay, new Date('20 June 2003'))
        ]);
        const anotherLine = new Line([
            new LineStop('CC1', dhobyGhaut, new Date('17 April 2010')),
            new LineStop('CC2', brasBasah, new Date('17 April 2010')),
        ]);
        const yetAnotherLine = new Line([
            new LineStop('NS24', dhobyGhaut, new Date('12 December 1987'))
        ]);
        const lines = new Lines([aLine, anotherLine, yetAnotherLine]);

        const result = await this.routingDataPreparer.prepare(lines);

        const expectedIntersectionLines = [
            IntersectionLine.create(aLine.stops[0], anotherLine.stops[0], 1),
            IntersectionLine.create(aLine.stops[0], yetAnotherLine.stops[0], 1),
            IntersectionLine.create(anotherLine.stops[0], yetAnotherLine.stops[0], 1)
        ];
        expect([...result.allLines]).to.deep.equal([aLine, anotherLine, yetAnotherLine, ...expectedIntersectionLines]);
    }

    @test
    public async shouldFilterOutStopsWhichHaveNotBeenOpenedAtTheTimeProvided(): Promise<void> {
        const stopOpenedLastYear = LineStopBuilder.withDefaults().withOpeningDate(new Date(2018, 1, 1)).build();
        const stopOpeningNextYear = LineStopBuilder.withDefaults().withOpeningDate(new Date(2020, 1, 1)).build();
        const stopOpeningNextMonth = LineStopBuilder.withDefaults().withOpeningDate(new Date(2019, 2, 1)).build();
        const anotherStopOpeningNextMonth = LineStopBuilder.withDefaults().withOpeningDate(new Date(2020, 2, 1)).build();

        const aLine = new Line([stopOpenedLastYear, stopOpeningNextYear, stopOpeningNextMonth]);
        const anotherLine = new Line([anotherStopOpeningNextMonth]);
        const lines = new Lines([aLine, anotherLine]);
        const timeOfTravel = new Date(2019, 1, 1);
        const timingsConfiguration = mock(LineTimingsConfiguration);
        when(this.configurationProvider.provideLineTimingsConfiguration()).thenReturn(instance(timingsConfiguration));
        when(timingsConfiguration.getLineConfiguration(anything(), timeOfTravel)).thenReturn({
            isOperational: true,
            timeTakenPerStationInMinutes: 10,
            timeTakenPerLineChangeInMinutes: 10
        });

        const result = await this.routingDataPreparer.prepare(lines, timeOfTravel);

        expect(result.allStops).to.deep.equal([stopOpenedLastYear]);
    }

    @test
    public async shouldNotAddIntersectionLinesForStopsWhichHaveNotOpenedYet(): Promise<void> {
        const intersectionStation = new Station('Dhoby Ghaut');
        const aLine = new Line([
            LineStopBuilder.withDefaults().stoppingAt(intersectionStation).withOpeningDate(new Date(2019, 2, 1)).build(),
            LineStopBuilder.withDefaults().build()
        ]);
        const anotherLine = new Line([
            LineStopBuilder.withDefaults().stoppingAt(intersectionStation).withOpeningDate(new Date(2018, 1, 1)).build(),
            LineStopBuilder.withDefaults().build()
        ]);
        const lines = new Lines([aLine, anotherLine]);
        const timeOfTravel = new Date(2019, 1, 1);
        const timingsConfiguration = mock(LineTimingsConfiguration);
        when(this.configurationProvider.provideLineTimingsConfiguration()).thenReturn(instance(timingsConfiguration));
        when(timingsConfiguration.getLineConfiguration(anything(), timeOfTravel)).thenReturn({
            isOperational: true,
            timeTakenPerStationInMinutes: 10,
            timeTakenPerLineChangeInMinutes: 10
        });

        const result = await this.routingDataPreparer.prepare(lines, timeOfTravel);

        expect(result.allLines).to.have.lengthOf(2);
    }

    @test
    public async shouldSetTimeTakenPerStationForLinesWhenTravelTimeIsProvided(): Promise<void> {
        const aLine = new Line([
            LineStopBuilder.withDefaults().withCode('NS1').build(),
            LineStopBuilder.withDefaults().withCode('NS2').build()
        ]);
        const anotherLine = new Line([
            LineStopBuilder.withDefaults().withCode('CC1').build(),
            LineStopBuilder.withDefaults().withCode('CC2').build()
        ]);
        const lines = new Lines([aLine, anotherLine]);
        const timingsConfiguration = mock(LineTimingsConfiguration);
        const timeOfTravel = new Date(2019, 1, 1, 6, 30, 0);
        when(this.configurationProvider.provideLineTimingsConfiguration()).thenReturn(instance(timingsConfiguration));
        when(timingsConfiguration.getLineConfiguration('NS', timeOfTravel)).thenReturn({
            isOperational: true,
            timeTakenPerStationInMinutes: 10,
            timeTakenPerLineChangeInMinutes: 15
        });
        when(timingsConfiguration.getLineConfiguration('CC', timeOfTravel)).thenReturn({
            isOperational: true,
            timeTakenPerStationInMinutes: 12,
            timeTakenPerLineChangeInMinutes: 15
        });

        const {allLines} = await this.routingDataPreparer.prepare(lines, timeOfTravel);

        expect([...allLines][0].getTimeTakenBetweenStations()).to.deep.equal(10);
        expect([...allLines][1].getTimeTakenBetweenStations()).to.deep.equal(12);
    }

    @test
    public async shouldSetTimeTakenPerStationToOneForLinesWhenTravelTimeIsNotProvided(): Promise<void> {
        const aLine = new Line([
            LineStopBuilder.withDefaults().withCode('NS1').build(),
            LineStopBuilder.withDefaults().withCode('NS2').build()
        ]);
        const anotherLine = new Line([
            LineStopBuilder.withDefaults().withCode('CC1').build(),
            LineStopBuilder.withDefaults().withCode('CC2').build()
        ]);
        const lines = new Lines([aLine, anotherLine]);

        const {allLines} = await this.routingDataPreparer.prepare(lines);

        expect([...allLines][0].getTimeTakenBetweenStations()).to.deep.equal(1);
        expect([...allLines][1].getTimeTakenBetweenStations()).to.deep.equal(1);
    }

    @test
    public async shouldRemoveStopsAndLinesWhichAreNotOperationalForTheTravelTime(): Promise<void> {
        const aLine = new Line([
            LineStopBuilder.withDefaults().withCode('NS1').build(),
            LineStopBuilder.withDefaults().withCode('NS2').build()
        ]);
        const anotherLine = new Line([
            LineStopBuilder.withDefaults().withCode('CC1').build(),
            LineStopBuilder.withDefaults().withCode('CC2').build()
        ]);
        const lines = new Lines([aLine, anotherLine]);
        const timingsConfiguration = mock(LineTimingsConfiguration);
        const timeOfTravel = new Date(2019, 1, 1, 6, 30, 0);
        when(this.configurationProvider.provideLineTimingsConfiguration()).thenReturn(instance(timingsConfiguration));
        when(timingsConfiguration.getLineConfiguration('NS', timeOfTravel)).thenReturn({
            isOperational: true,
            timeTakenPerStationInMinutes: 10,
            timeTakenPerLineChangeInMinutes: 15
        });
        when(timingsConfiguration.getLineConfiguration('CC', timeOfTravel)).thenReturn({
            isOperational: false,
            timeTakenPerStationInMinutes: 12,
            timeTakenPerLineChangeInMinutes: 15
        });

        const {allLines, allStops} = await this.routingDataPreparer.prepare(lines, timeOfTravel);

        expect(allLines).to.have.lengthOf(1);
        expect(allStops).to.have.lengthOf(2);
        expect(allStops).to.deep.equal(aLine.stops);
    }

    @test
    public async shouldAddIntersectionLinesWithLineChangingTimeWhenTravelTimeIsProvided(): Promise<void> {
        const intersectionStation = new Station('Intersection Station');
        const aLine = new Line([
            LineStopBuilder.withDefaults().withCode('NS1').build(),
            LineStopBuilder.withDefaults().withCode('NS2').stoppingAt(intersectionStation).build()
        ]);
        const anotherLine = new Line([
            LineStopBuilder.withDefaults().withCode('CC1').build(),
            LineStopBuilder.withDefaults().withCode('CC2').stoppingAt(intersectionStation).build()
        ]);
        const lines = new Lines([aLine, anotherLine]);
        const timingsConfiguration = mock(LineTimingsConfiguration);
        const timeOfTravel = new Date(2019, 1, 1, 6, 30, 0);
        when(this.configurationProvider.provideLineTimingsConfiguration()).thenReturn(instance(timingsConfiguration));
        when(timingsConfiguration.getLineConfiguration('NS', timeOfTravel)).thenReturn({
            isOperational: true,
            timeTakenPerStationInMinutes: 10,
            timeTakenPerLineChangeInMinutes: 15
        });
        when(timingsConfiguration.getLineConfiguration('CC', timeOfTravel)).thenReturn({
            isOperational: true,
            timeTakenPerStationInMinutes: 12,
            timeTakenPerLineChangeInMinutes: 15
        });

        const result = await this.routingDataPreparer.prepare(lines, timeOfTravel);

        const expectedIntersectionLine = IntersectionLine.create(aLine.stops[1], anotherLine.stops[1], 15);
        expect(result.allLines).to.have.lengthOf(3);
        expect([...result.allLines][2]).to.deep.equal(expectedIntersectionLine);
        expect(expectedIntersectionLine.getTimeTakenBetweenStations()).to.equal(15);
    }
}