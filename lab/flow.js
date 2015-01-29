s += '<section class="test"><h1><span class="firetpl-param" data-path="title"></span></h1><div class="listing"><ul>';
s += '<span class="firetpl-scope" data-scope="scope001" data-path="listing"></span>';
s += '</ul></div><div class="comments">';
s += '<span class="firetpl-scope" data-scope="scope003" data-path="comments"></sapan>';
s += '</div></section>';

//Storage
var store = {};
store.title = [
	TextNode
];

store.listing = [
	[ HTMLSpanElement, scopes.scope001 ]
];

store.comments = [
	[ HTMLSpanElement, scopes.scope003 ]
];

//Change title
store.title.forEach(function() {
	TextNode.value = 'new value';
});

//Change listing
store.listing.forEach(function() {
	HTMLSpanElement.innerHTML = scopes.scope001(data);
});