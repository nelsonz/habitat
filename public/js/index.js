<<<<<<< HEAD
/* transition a grid */
=======
>>>>>>> 289a296623ce7d8f436bec7c4b2c4e8bdf09d9d2
function easeGrid(id, direction, maxtime) {
	$(".grid#"+id).children().each(function(i, e) {
		$(e).animate({
			opacity: ((direction == "out") ? 0.0 : 1.0)
		}, Math.random()*maxtime);
	});
};

<<<<<<< HEAD
/* transition between pages */
=======
>>>>>>> 289a296623ce7d8f436bec7c4b2c4e8bdf09d9d2
function transition(dest) {
	var pagefade_delay = 0;
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
}

var gridfade_t = 500,
	pagefade_t = 100;

$(function() {
	$("body").fadeIn(pagefade_t, function() {
		$(".grid").each(function(i, e) {
			easeGrid($(this).attr('id'), "in", gridfade_t);
		});
	});
	
	$(".link").click(function() {
		transition((($(this).attr('class').split(' ').indexOf('external') > -1) ? '' : '/') + $(this).attr('name'));
	});
	
	$(".form_input").focus(function() {
		if (!$(this).attr('value')) {
			$(this).attr('value', $(this).attr('data-default'));
		}
	});
});