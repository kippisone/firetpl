window.addEventListener('DOMContentLoaded', function() {
	'use strict';

	var data = {
		title: 'FireTPL Render test',
		listing: [{
			title: 'List item 1',
			index: 1
		}, {
			title: 'List item 2',
			index: 2
		}]
	};

	var tmpl = FireTPL.templateCache.test;

	var tmplScope = {};
	document.getElementById('tmpl').innerHTML = tmpl(data, tmplScope);

	document.getElementById('title').addEventListener('keyup', function(e) {
		var title = e.currentTarget.value;
		fireRender.changeItem('title', title);
	});


	var FireListItem = function() {

	};

	var FireTextItem = function() {

	};


	var FireRender = function(tmplScope) {
		this.scopeStore = {};
		this.tmplScope = tmplScope;
	};

	FireRender.prototype.init = function() {
		var fireScopes = document.getElementsByClassName('firetpl-scope');
		console.log('Fire Scopes', fireScopes);
		for (var i = fireScopes.length; i > 0; i--) {
			var el = fireScopes[i - 1];
			var path = el.getAttribute('data-path'),
				scope = el.getAttribute('data-scope');

			console.log('EL', path, scope);
			if (!this.scopeStore[path]) {
				this.scopeStore[path] = [];
			}

			var node;
			if (scope) {
				//Its a scope element
				this.scopeStore[path].push([el, this.tmplScope[scope]]);
			}
			else {
				node = document.createTextNode('');
				el.parentNode.replaceChild(node, el);
				this.scopeStore[path].push(node);
			}
			
		}
	};

	FireRender.prototype.render = function(data) {
		var path = '';

		for (var key in data) {
			var item = data[key];
			if (typeof(item) === 'object') {
				this.changeItem(key, item);
			}
			else {
				this.changeItem(key, item);
			}
		}
	};

	FireRender.prototype.changeItem = function(key, value) {
		if (this.scopeStore[key]) {
			for (var i = 0, len = this.scopeStore[key].length; i < len; i++) {
				var el = this.scopeStore[key][i];
				if (Array.isArray(el)) {
					var div = document.createElement('div');
					div.innerHTML = el[1](value);

					var docFrag = document.createDocumentFragment();
					var childs = [];
					while (div.firstChild) {
						childs.push(docFrag.appendChild(div.firstChild));
					}

					el[0].parentNode.replaceChild(docFrag, el[0]);
					this.scopeStore[key][i][0] = childs;
				}
				else {
					el.nodeValue = value;
				}
			}
		}
	};

	FireRender.prototype.appendItem = function(key, data) {
		if (this.scopeStore[key]) {
			for (var i = 0, len = this.scopeStore[key].length; i < len; i++) {
				var el = this.scopeStore[key][i];
				if (Array.isArray(el)) {
					var div = document.createElement('div');
					div.innerHTML = el[1](data);

					var docFrag = document.createDocumentFragment();
					var childs = [];
					while (div.firstChild) {
						childs.push(docFrag.appendChild(div.firstChild));
					}

					
					var next = el[0][el[0].length - 1].nextSibling;
					if (next) {
						console.warn('Not supported yet!');
					}
					else {
						el[0][0].parentNode.appendChild(docFrag);
					}

					this.scopeStore[key][i][0].concat(childs);
				}
				else {
					console.warn('Not supported yet!');
				}
			}
		}
	};

	var fireRender = new FireRender(tmplScope);
	fireRender.init();
	fireRender.render(data);
	// fireRender.appendItem('listing',  {
	// 	title: 'List item 3',
	// 	index: 3
	// });

	console.log('FireRender', fireRender);
});