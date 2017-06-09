# profile-profiler
Track promise & non-promise execution time

## Install

```
npm install profile-profiler --save
```

## Usage

### Patch function

```javascript
fn = profiler.patch(fn, 'name');    //name can be omit to use function name
```

### Patch object

```javascript
profiler.patch(obj, 'name');    //name can be omit to use class name
```

### Turn profiler on/off
```javascript
profiler.active = true; //or false for off
```

### Get report
```javascript
let result = profiler.report();
//[
//  { name: 'fnName', sum: 1000, min: 20, max: 150, avg: 100, count: 10 }    
//]
```