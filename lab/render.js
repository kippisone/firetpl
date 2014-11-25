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

	var scopes = {};
	document.getElementById('tmpl').innerHTML = tmpl(data, scopes);

	document.getElementById('title').addEventListener('keyup', function(e) {
		var title = e.currentTarget.value;
		fireRender.changeItem('title', title);
	});




	var FireRender = function() {
		this.scopeStore = {};
	};

	FireRender.prototype.init = function() {
		var fireScopes = document.getElementsByClassName('firetpl-scope');
		console.log('Fire Scopes', fireScopes);
		for (var i = 0, len = fireScopes.length; i < len; i++) {
			var el = fireScopes[i];
			var path = el.getAttribute('data-path'),
				scope = el.getAttribute('data-scope');

			console.log('EL', path, scope);
			if (!this.scopeStore[path]) {
				this.scopeStore[path] = [];
			}

			var node;
			if (scope) {
				//Its a scope element
				node = document.createDocumentFragment();
			}
			else {

				node = document.createTextNode('');
			}
			
			el.parentNode.replaceChild(node, el);
			this.scopeStore[path].push(node);
		}
	};

	FireRender.prototype.render = function(data) {
		var path = '';

		for (var key in data) {
			var item = data[key];
			if (typeof(item) === 'object') {
				this.changeItem(key, data);
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
					el[0].innerHTML = el[1](value);
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
					var item = document.createDocumentFragment();
					item.innerHTML = el[1](data);
					console.log('Add item', item, el[0]);
					el[0].appendChild(item);
				}
				else {
					this.warn('Not supported yet!');
				}
			}
		}
	};

	var fireRender = new FireRender();
	fireRender.init();
	fireRender.render(data);
	fireRender.appendItem('listing',  {
		title: 'List item 3',
		index: 3
	});
});