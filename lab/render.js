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


	var FireRender = function() {
		this.scopeStore = {};
		this.tmplScope = {};
	};

	FireRender.prototype.render = function(tmpl, data) {
		var html = tmpl(data, this.tmplScope);
		var div = document.createElement('div');
		div.innerHTML = html;
		this.parse(div);

		return this.createDocFrag(div);
	};

	FireRender.prototype.parse = function(div) {
		var tmplScopes = div.getElementsByClassName('firetpl-scope');
		console.log('Found scopes in DocFrag:', tmplScopes);
		for (var i = tmplScopes.length; i > 0; i--) {
			var el = tmplScopes[i - 1];
			var prop = el.getAttribute('data-path'),
				path = el.getAttribute('data-parent'),
				scope = el.getAttribute('data-scope');

			path = path ? path + '.' + prop : prop;

			if (!this.scopeStore[path]) {
				this.scopeStore[path] = [];
			}

			if (scope) {
				this.scopeStore[path].push({
					el: el,
					fn: this.tmplScope[scope],
					path: path,
					prop: prop
				});
			}
			else {
				var node = document.createTextNode(el.innerHTML);
				el.parentNode.replaceChild(node, el);

				this.scopeStore[path].push({
					el: node,
					path: path,
					prop: prop
				});
			}

		}

		console.log('Scope store', this.scopeStore);
	};

	FireRender.prototype.createDocFrag = function(html) {
		var docFrag = document.createDocumentFragment(),
			div;

		if (typeof html === 'string') {
			div = document.createElement('div');
			div.innerHTML = html;
		}
		else {
			div = html;
		}

		while (div.firstChild) {
			docFrag.appendChild(div.firstChild);
		}

		return docFrag;
	};

	FireRender.prototype.changeItem = function(key, value) {
		if (this.scopeStore[key]) {
			for (var i = 0, len = this.scopeStore[key].length; i < len; i++) {
				var el = this.scopeStore[key][i].el;
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
				var item = this.scopeStore[key][i];
				if (item.fn) {
					var docFrag = this.createDocFrag(item.fn(data));

					item.el.appendChild(docFrag);
				}
				else {
					console.warn('Not supported yet!');
				}
			}
		}
	};

	// OLD stuff

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

	FireRender.prototype.xparse = function(tmpl, data, parent) {
		var html;

		if (typeof tmpl === 'string') {
			html = tmpl;
		}
		
		html = tmpl(data, parent);
		var div = document.createElement('div');
		div.innerHTML = html;
		// var docFrag = this.createDocFrag(html);

		var tmplScopes = div.getElementsByClassName('firetpl-scope');
		console.log('Found scopes in DocFrag:', tmplScopes);

		for (var i = tmplScopes.length; i > 0; i--) {
			var el = tmplScopes[i - 1];
			var path = el.getAttribute('data-path'),
				scope = el.getAttribute('data-scope');

			console.log('Parse path', path, data, parent);

			if (!this.scopeStore[path]) {
				this.scopeStore[path] = [];
			}

			var node;
			if (scope) {
				//Its a scope element
				var scopeFrag = this.parse(this.tmplScope[scope], data[path], data);
				node = new FireListItem();
				node.parent = el.parentNode;
				node.firstChild = scopeFrag.firstChild;
				node.lastChild = scopeFrag.lastChild;
				node.fn = this.tmplScope[scope];
				el.parentNode.replaceChild(scopeFrag, el);
				this.scopeStore[path].push(node);
			}
			else {
				node = document.createTextNode(data[path]);
				el.parentNode.replaceChild(node, el);
				this.scopeStore[path].push(node);
			}
		}

		console.log('DIV', div.innerHTML);
		return this.createDocFrag(div);
	};

	FireRender.prototype.parseScope = function(scope, data, parent) {
		console.log('Parse scope:', scope, data, parent);
		
		var node,
			div = document.createElement('div');
		
		div.innerHTML = this.tmplScope[scope](data, parent);

		//Get all subscopes
		var subScopes = div.getElementsByClassName('firetpl-scope');
		console.log('Found scopes in DocFrag:', subScopes);

		for (var i = subScopes.length; i > 0; i--) {
			var el = subScopes[i - 1];
			var path = el.getAttribute('data-path'),
				scopeName = el.getAttribute('data-scope');

			 if (scopeName) {
			 	console.log('Call scope with path', path, data[path]);
			 	node = this.parseScope(scopeName, data[path], data);
			 }
			 else {
			 	//Handle text node
			 	node = this.parseTextNode(el, path, data);
			 }

			 if (!this.scopeStore[path]) {
				this.scopeStore[path] = [];
			}

			el.parentNode.replaceChild(node, el);
			this.scopeStore[path].push(node);
		}

		return this.createDocFrag(div);
	};

	var fireRender = new FireRender(tmplScope);
	fireRender.init();
	var htmlFrag = fireRender.render(FireTPL.templateCache.test, data);
	document.getElementById('tmpl').appendChild(htmlFrag);
	fireRender.appendItem('listing',  [{
		title: 'List item 3',
		index: 3,
		tags: [{
				tag: 'Tag: 3'
			}, {
				tag: 'Tag: 4'
			}]
	}]);

	console.log('FireRender', fireRender);
});