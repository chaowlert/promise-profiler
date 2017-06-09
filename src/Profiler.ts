function isPromise(value: any): value is Promise<any> {
    return value && typeof value.then === 'function';
}

export interface IProfilingMetric {
    name: string;
    sum: number;
    min: number;
    max: number;
    count: number;
    avg?: number;
}

export class Profiler {
    metrics: Record<string, IProfilingMetric> = {};
    active: boolean;

    patch<T extends Function>(func: T, name?: string): T;
    patch<T extends Object>(service: T, name?: string): T;
    patch<T>(obj: T, name?: string): T {
        let type = typeof obj;
        switch (type) {
            case 'function':
                return this.patchFunction<any>(obj, name);
            case 'object':
                return this.patchObject<any>(obj, name);
            default:
                throw new Error('not support patching type: ' + type);
        }
    }

    private patchObject<T extends Object>(service: T, name?: string): T {
        if (!name) {
            name = service.constructor.name;
        }

        let keys = getAllProps(service);
        for (let key of keys) {
            let prop = service[key];
            if (typeof prop === 'function') {
                service[key] = this.patchFunction(prop, name + '.' + key);
            }
        }

        return service;

        function getAllProps(obj: any) {
            let props = new Set<string>();

            do {
                let names = Object.getOwnPropertyNames(obj);
                for (let n of names) {
                    props.add(n);
                }
                obj = Object.getPrototypeOf(obj);
            } while (obj && obj.constructor.name !== 'Object');

            props.delete('constructor');
            return Array.from(props);
        }
    }

    private patchFunction<T extends Function>(func: T, name?: string): T {
        if (!name) {
            name = func.name;
        }
        let self = this;
        return function (this: any) {
            if (!self.active) {
                return func.apply(this, arguments);
            }

            let start = Date.now();
            try {
                let result = func.apply(this, arguments);
                if (isPromise(result)) {
                    result.then(
                        () => self.tick(name, Date.now() - start),
                        () => self.tick(name, Date.now() - start));
                } else {
                    self.tick(name, Date.now() - start);
                }
                return result;
            } catch (e) {
                self.tick(name, Date.now() - start);
                throw e;
            }
        } as any;
    }

    tick(name: string, time: number) {
        let metric = this.metrics[name];
        if (!metric) {
            this.metrics[name] = metric = {
                name: name,
                sum: 0,
                max: 0,
                min: Number.MAX_VALUE,
                count: 0
            };
        }

        metric.sum += time;
        metric.min = Math.min(metric.min, time);
        metric.max = Math.max(metric.max, time);
        metric.count++;
    }

    report() {
        return Object.keys(this.metrics)
            .map(key => {
                let result = this.metrics[key];
                result.avg = result.sum / result.count;
                return result;
            })
            .sort((a, b) => b.sum - a.sum);
    }
}
