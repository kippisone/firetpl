(function() {
	FireTPL.templateCache.listing = function(data, scopes) {
		var root = data,
			parent = data;

		scopes.scope001 = function(data,parent) {
			return h.each(data, function(data) {
				var s='';
				s+='<li><span class="name">'+data.name+'</span><span class="image xq-scope xq-scope002">';
				var c=data.image;
				var r=scopes.scope002(c,data);
				s+=r;
				s+='</span></li>';
				return s;
			});
		};

		scopes.scope002 = function(data) {
			return h.if(c,function(data){
				var s='';
				s+='<img src="'+data.image+'">';
				return s;
			});
		};

		var s='';
		var h=FireTPL.helpers;
		s+='<div class="example"><h1>'+data.title+'</h1><div class="description">'+data.description+'</div><ul class="listing xq-scope xq-scope001">';
		s+=scopes.scope001(data.listing,data);
		s+='</ul></div>';
		return s;
		}
	;
	}
)();