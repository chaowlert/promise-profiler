# profile-profiler
Track promise & non-promise execution time

## Install

```
npm install profile-profiler --save
```

## Usage

### Patch function

```javascript
//name can be omit if function already has name
fn = profiler.patch(fn, 'name');
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