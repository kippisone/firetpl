window.addEventListener('DOMContentLoaded', function() {
	'use strict';

	var data = {
		title: 'FireTPL Render test',
		listing: [{
			title: 'List item 1',
			index: 1,
			tags:[{
				tag: 'Tag:1'
			}]
		}, {
			title: 'List item 2',
			index: 2,
			tags:[{
				tag: 'Tag:1'
			}]
		}]
	};

	var tmplScope = {};

	document.getElementById('title').addEventListener('keyup', function(e) {
		var title = e.currentTarget.value;
		fireRender.changeItem('title', title);
	});


	var FireListItem = function() {
		this.firstChild = null;
		this.lastChild = null;
		this.index = null;
		this.parent = null;
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

			if (!this.scopeStore[path]) {
				this.scopeStore[path] = [];
			}

			var node;
			if (scope) {
				//Its a scope element
				node = new FireListItem();
				node.parent = el.parentNode;
				node.firstChild = el;
				node.lastChild = el;
				node.fn = this.tmplScope[scope];
				this.scopeStore[path].push(node);
			}
			else {
				node = document.createTextNode('');
				el.parentNode.replaceChild(node, el);
				this.scopeStore[path].push(node);
			}
		}
	};

	FireRender.prototype.parse = function() {
		
	};

	FireRender.prototype.render = function(tmpl, data) {
		var path = '';

		this.tmpl = tmpl(data, tmplScope)

		for (var key in this.scopeStore) {
			var item = data[key];
			this.changeItem(key, item);
		}
	};

	FireRender.prototype.changeItem = function(key, value) {
		if (this.scopeStore[key]) {
			for (var i = 0, len = this.scopeStore[key].length; i < len; i++) {
				var el = this.scopeStore[key][i];
				if (el instanceof FireListItem) {
					var div = document.createElement('div');
					div.innerHTML = el.fn(value);

					var docFrag = document.createDocumentFragment();
					while (div.firstChild) {
						docFrag.appendChild(div.firstChild);
					}

					var firstChild = docFrag.firstChild;
					var lastChild = docFrag.lastChild;
					if (el.parent.lastChild === el.lastChild) {
						el.parent.appendChild(docFrag);
					}
					else {
						el.parent.insertBefore(docFrag, el.lastChild.nextSibling);
					}

					el.firstChild = firstChild;
					el.lastChild = lastChild;
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
				if (el instanceof FireListItem) {
					var div = document.createElement('div');
					div.innerHTML = el.fn([data]);

					var docFrag = document.createDocumentFragment();
					while (div.firstChild) {
						docFrag.appendChild(div.firstChild);
					}

					var lastChild = docFrag.lastChild;
					if (el.parent.lastChild === el.lastChild) {
						el.parent.appendChild(docFrag);
					}
					else {
						el.parent.insertBefore(docFrag, el.lastChild.nextSibling);
					}

					el.lastChild = lastChild;
				}
				else {
					console.warn('Not supported yet!');
				}
			}
		}
	};

	var fireRender = new FireRender(tmplScope);
	fireRender.init();
	var html = fireRender.render(FireTPL.templateCache.test, data);
	fireRender.appendItem('listing',  {
		title: 'List item 3',
		index: 3
	});


	document.getElementById('tmpl').innerHTML = html;

	console.log('FireRender', fireRender);
});