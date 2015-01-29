FireTPL.registerFunction('gt', function(str, cmp) {
    return Number(str) > Number(cmp);
});

FireTPL.registerFunction('gte', function(str, cmp) {
    return Number(str) >= Number(cmp);
});

FireTPL.registerFunction('lt', function(str, cmp) {
    return Number(str) < Number(cmp);
});

FireTPL.registerFunction('lte', function(str, cmp) {
    return Number(str) <= Number(cmp);
});

FireTPL.registerFunction('eq', function(str, cmp) {
    return Number(str) === Number(cmp);
});

FireTPL.registerFunction('not', function(str, cmp) {
    return Number(str) !== Number(cmp);
});