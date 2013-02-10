/* transition a grid */
function easeGrid(id, direction, maxtime) {
	$(".grid#"+id).children().each(function(i, e) {
		$(e).animate({
			opacity: ((direction == "out") ? 0.0 : 1.0)
		}, Math.random()*maxtime);
	});
};

/* transition between pages */
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
        $("#nameField").keypress(function () {
          $("#nameSaveButton").show();
        });
        $("#nameSaveButton").bind("click", function () {
          $.post("/users/me", {user: {name: $("#nameField").text()}});
        });
        $("#blurb").keypress(function () {
          $("#saveButton").show();
        });
        $("#saveButton").bind("click", function () {
          $.post("/users/me", {user: {blurb: $("#blurb").text()}});
        });
});
