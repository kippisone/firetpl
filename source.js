(function() {
	FireTPL.templateCache.listing = function(data) {
		var scope001 = function(data) {
			return h.each(data, function(data) {
				var s='';
				s+='<li><span class="name">'+data.name+'</span><span class="image xq-scope xq-scope002">';
				var c=data.image;
				var r=scope002(c);
				s+=r;
				s+='</span></li>';
				return s;
			});
		};

		var scope002 = function(data) {
			return h.if(c,function(data){
				var s='';
				s+='<img src="'+data.image+'">';
				return s;
			});
		};

		var s='';
		var h=FireTPL.helpers;
		s+='<div class="example"><h1>'+data.title+'</h1><div class="description">'+data.description+'</div><ul class="listing xq-scope xq-scope001">';
		s+=scope001(data.listing);
		s+='</ul></div>';
		return s;
		}
	;
	}
)();
