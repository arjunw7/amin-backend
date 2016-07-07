$(document).ready(function(){
	jQuery(window).load(function() {
		jQuery("#status").fadeOut();
		jQuery("#preloader").delay(1000).fadeOut(500);
	});

	var biggestHeight = "0";
	$(".slider *").each(function(){
		if($(this).height()>biggestHeight){
			biggestHeight = $(this).height();
		}
	});
	$(".slider").height(biggestHeight);

});
