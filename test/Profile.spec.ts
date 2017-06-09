import { Profile } from '../src/';
import { expect } from 'chai';

describe('MaybePromise', () => {
    it('should be able to chain', async () => {
        let normalFn = (a: number, b: number) => a + b;
        let promiseFn = (a: number, b: number) => Promise.resolve(a + b);
        let errorFn = function errorFn(a: number, b: number) { throw a + b; };
        let rejectFn = (a: number, b: number) => Promise.reject(a + b);

        let profiler = new Profile();
        normalFn = profiler.patch(normalFn, 'normalFn');
        promiseFn = profiler.patch(promiseFn, 'promiseFn');
        errorFn = profiler.patch(errorFn);
        rejectFn = profiler.patch(rejectFn, 'rejectFn');

        profiler.active = true;
        let result = normalFn(1, 2);
        expect(result).equals(3);

        result = await promiseFn(1, 2);
        expect(result).equals(3);

        try {
            result = errorFn(1, 2);
            expect.fail('not throw', 'throw');
        } catch (e) {
            expect(e).equals(3);
        }

        try {
            result = await rejectFn(1, 2);
            expect.fail('not throw', 'throw');
        } catch (e) {
            expect(e).equals(3);
        }

        normalFn(1, 2);

        profiler.active = false;
        normalFn(1, 2);

        let report = profiler.report();
        expect(report.length).equals(4);

        expect(profiler.metrics['normalFn'].count).equals(2);
        expect(profiler.metrics['promiseFn'].count).equals(1);
        expect(profiler.metrics['errorFn'].count).equals(1);
        expect(profiler.metrics['rejectFn'].count).equals(1);
    });
});
