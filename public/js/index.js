function easeGrid(id, direction, maxtime) {
	$(".grid#"+id).children().each(function(i, e) {
		$(e).animate({
			opacity: ((direction == "out") ? 0.0 : 1.0)
		}, Math.random()*maxtime);
	});
};

var gridfade_t = 500,
	pagefade_t = 100;

$(function() {
	$("body").fadeIn(pagefade_t, function() {
		$(".grid").each(function(i, e) {
			easeGrid($(this).attr('id'), "in", gridfade_t);
		});
	});
	
	$(".nav").click(function() {
		var dest = '/' + $(this).attr('id'),
			pagefade_delay = 0;
		
		console.log(dest);
		$(".grid").each(function(i, e) {
			easeGrid($(this).attr('id'), "out", gridfade_t);
			pagefade_delay = gridfade_t / 2;
		});
		setTimeout(function() {
			$("body").fadeOut(pagefade_t, function() {
				window.location.href = dest;
			});
		}, pagefade_delay);
	});
});