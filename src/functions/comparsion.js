/**
 * Greater than comparison
 *
 * The property becomes true if property is greater than value.
 *
 * @group InlineFunctions
 * @method gt
 * @param  {number} value Comparison value
 * @return {boolean}    Returns true if input is greater then value
 */
FireTPL.registerFunction('gt', function(str, cmp) {
    return Number(str) > Number(cmp);
});

/**
 * Greater than comparison or equal
 *
 * The property becomes true if property is greater or equal than value.
 *
 * @group InlineFunctions
 * @method gte
 * @param  {number} value Comparison value
 * @return {boolean}    Returns true if input is greater or equal then value
 */
FireTPL.registerFunction('gte', function(str, cmp) {
    return Number(str) >= Number(cmp);
});

/**
 * Lesser than comparison
 *
 * The property becomes true if property is lesser than value.
 *
 * @group InlineFunctions
 * @method lt
 * @param  {number} value Comparison value
 * @return {boolean}    Returns true if input is lesser then value
 */
FireTPL.registerFunction('lt', function(str, cmp) {
    return Number(str) < Number(cmp);
});

/**
 * Lesser than comparison or equal
 *
 * The property becomes true if property is lesser or equal than value.
 *
 * @group InlineFunctions
 * @method gte
 * @param  {number} value Comparison value
 * @return {boolean}    Returns true if input is lesser or equal then value
 */
FireTPL.registerFunction('lte', function(str, cmp) {
    return Number(str) <= Number(cmp);
});

/**
 * Equal comparison
 *
 * The property becomes true if input and value are both identical
 *
 * @group InlineFunctions
 * @method eq
 * @param  {number} value Comparison value
 * @return {boolean}    Returns true if input and value are identical
 */
FireTPL.registerFunction('eq', function(str, cmp) {
    return Number(str) === Number(cmp);
});

/**
 * Not equal comparison
 *
 * The property becomes true if input and value aren't identical
 *
 * @group InlineFunctions
 * @method not
 * @param  {number} value Comparison value
 * @return {boolean}    Returns true if input and value aren't identical
 */
FireTPL.registerFunction('not', function(str, cmp) {
    return Number(str) !== Number(cmp);
});

/**
 * Expression matching
 *
 * Returns value if expression is matching, otherwise altValue will be returned
 *
 * @group InlineFunctions
 * @method if
 * @param {string} expression Expression
 * @param  {number} value Comparison value
 * @return {boolean}    Returns true if input and value aren't identical
 */
FireTPL.registerFunction('if', function(str, expression, value, altValue) {
    if (String(str) === String(expression)) {
        return value;
    }

    return altValue;
});