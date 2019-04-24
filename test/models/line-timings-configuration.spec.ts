import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Config} from '../../src/providers/line-timings-config';
import {LineTimingsConfiguration} from '../../src/models/line-timings-configuration';

@suite
class LineTimingsConfigurationSpec {
    @test
    public async shouldGetConfigurationForNSLineInPeakHours(): Promise<void> {
        const lineCode = 'NS';
        const configuration = LineTimingsConfiguration.from(Config);
        const beginningOfMorningPeakHour = new Date("2019-01-23T06:00:00.000+08:00");
        const middleOfMorningPeakHour = new Date("2019-01-23T08:30:00.000+08:00");
        const endOfMorningPeakHour = new Date("2019-01-23T08:59:59.000+08:00");
        const beginningOfEveningPeakHour = new Date("2019-01-23T18:00:00.000+08:00");
        const middleOfEveningPeakHour = new Date("2019-01-23T20:30:00.000+08:00");
        const endOfEveningPeakHour = new Date("2019-01-23T20:59:59.000+08:00");

        const expectedConfiguration = {
            isOperational: true,
            timeTakenPerStationInMinutes: 12
        };
        expect(configuration.getLineConfiguration(lineCode, beginningOfMorningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, middleOfMorningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, endOfMorningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, beginningOfEveningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, middleOfEveningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, endOfEveningPeakHour)).to.deep.equal(expectedConfiguration);
    }

    @test
    public async shouldGetConfigurationForNSLineInPeakHoursOnWeekends(): Promise<void> {
        const lineCode = 'NS';
        const configuration = LineTimingsConfiguration.from(Config);
        const saturdayPeakHour = new Date("2019-01-05T06:00:00.000+08:00");
        const sundayPeakHour = new Date("2019-01-06T06:00:00.000+08:00");

        const expectedConfiguration = {
            isOperational: true,
            timeTakenPerStationInMinutes: 10
        };
        expect(configuration.getLineConfiguration(lineCode, saturdayPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, sundayPeakHour)).to.deep.equal(expectedConfiguration);
    }

    @test
    public async shouldGetConfigurationForNELineInPeakHours(): Promise<void> {
        const lineCode = 'NE';
        const configuration = LineTimingsConfiguration.from(Config);
        const beginningOfMorningPeakHour = new Date("2019-01-23T06:00:00.000+08:00");
        const middleOfMorningPeakHour = new Date("2019-01-23T08:30:00.000+08:00");
        const endOfMorningPeakHour = new Date("2019-01-23T08:59:59.000+08:00");
        const beginningOfEveningPeakHour = new Date("2019-01-23T18:00:00.000+08:00");
        const middleOfEveningPeakHour = new Date("2019-01-23T20:30:00.000+08:00");
        const endOfEveningPeakHour = new Date("2019-01-23T20:59:59.000+08:00");

        const expectedConfiguration = {
            isOperational: true,
            timeTakenPerStationInMinutes: 12
        };
        expect(configuration.getLineConfiguration(lineCode, beginningOfMorningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, middleOfMorningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, endOfMorningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, beginningOfEveningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, middleOfEveningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, endOfEveningPeakHour)).to.deep.equal(expectedConfiguration);
    }

    @test
    public async shouldGetConfigurationForAnotherLineInPeakHours(): Promise<void> {
        const lineCode = 'CC';
        const configuration = LineTimingsConfiguration.from(Config);
        const beginningOfMorningPeakHour = new Date("2019-01-23T06:00:00.000+08:00");
        const middleOfMorningPeakHour = new Date("2019-01-23T08:30:00.000+08:00");
        const endOfMorningPeakHour = new Date("2019-01-23T08:59:59.000+08:00");
        const beginningOfEveningPeakHour = new Date("2019-01-23T18:00:00.000+08:00");
        const middleOfEveningPeakHour = new Date("2019-01-23T20:30:00.000+08:00");
        const endOfEveningPeakHour = new Date("2019-01-23T20:59:59.000+08:00");

        const expectedConfiguration = {
            isOperational: true,
            timeTakenPerStationInMinutes: 10
        };
        expect(configuration.getLineConfiguration(lineCode, beginningOfMorningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, middleOfMorningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, endOfMorningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, beginningOfEveningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, middleOfEveningPeakHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, endOfEveningPeakHour)).to.deep.equal(expectedConfiguration);
    }

    @test
    public async shouldGetConfigurationForDTLineInNightHours(): Promise<void> {
        const lineCode = 'DT';
        const configuration = LineTimingsConfiguration.from(Config);
        const beginningOfNightHour = new Date("2019-01-23T22:00:00.000+08:00");
        const middleOfNightHour = new Date("2019-01-23T01:30:00.000+08:00");
        const endOfNightHour = new Date("2019-01-23T05:59:59.000+08:00");

        const expectedConfiguration = {
            isOperational: false,
            timeTakenPerStationInMinutes: Infinity
        };
        expect(configuration.getLineConfiguration(lineCode, beginningOfNightHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, middleOfNightHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, endOfNightHour)).to.deep.equal(expectedConfiguration);
    }

    @test
    public async shouldGetConfigurationForTELineInNightHours(): Promise<void> {
        const lineCode = 'TE';
        const configuration = LineTimingsConfiguration.from(Config);
        const beginningOfNightHour = new Date("2019-01-23T22:00:00.000+08:00");
        const middleOfNightHour = new Date("2019-01-23T01:30:00.000+08:00");
        const endOfNightHour = new Date("2019-01-23T05:59:59.000+08:00");

        const expectedConfiguration = {
            isOperational: true,
            timeTakenPerStationInMinutes: 8
        };
        expect(configuration.getLineConfiguration(lineCode, beginningOfNightHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, middleOfNightHour)).to.deep.equal(expectedConfiguration);
        expect(configuration.getLineConfiguration(lineCode, endOfNightHour)).to.deep.equal(expectedConfiguration);
    }

    @test
    public async shouldGetConfigurationForEWLineInOtherHours(): Promise<void> {
        const lineCode = 'EW';
        const configuration = LineTimingsConfiguration.from(Config);

        expect(configuration.getLineConfiguration(lineCode, new Date('2019-01-01T14:00:00.000+08:00'))).to.deep.equal({
            isOperational: true,
            timeTakenPerStationInMinutes: 10
        });
    }

    @test
    public async shouldGetTimeTakenForLineChange(): Promise<void> {
        const configuration = LineTimingsConfiguration.from(Config);
        const nightHour = new Date("2019-01-23T22:00:00.000+08:00");
        const nonPeakHour = new Date("2019-01-23T11:30:00.000+08:00");
        const morningPeakHour = new Date("2019-01-23T08:30:00.000+08:00");
        const eveningPeakHour = new Date("2019-01-23T20:30:00.000+08:00");

        expect(configuration.getTimeTakenForLineChange(nightHour)).to.equal(10);
        expect(configuration.getTimeTakenForLineChange(nonPeakHour)).to.equal(10);
        expect(configuration.getTimeTakenForLineChange(morningPeakHour)).to.equal(15);
        expect(configuration.getTimeTakenForLineChange(eveningPeakHour)).to.equal(15);
    }
}