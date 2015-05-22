/**
 * Tree helper
 *
 * @module  Tree helper
 * @submodule  Helper
 */
FireTPL.registerHelper('tree', function(context, fn) {
    var s = '';

    if (context.data) {
        s += fn(context.parent, context.root);
    }

    return s;
});