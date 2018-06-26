const a = `112622
27108
17885
15702
13115
11917
9318
8632
6177
4931
4296
4100
2240
1067
922
240
235
31
25
22
19
17
12
9
1
1
1`;

let b = a.split('\n');
b = b.map(item => parseInt(item, 10));
console.log(b);

let c = b.reduce((a, b) => (a + b));
console.log(c);

let d = b.map(item => ((item/c * 100).toFixed(0) + '%'));
console.log(d.join('\n'));
