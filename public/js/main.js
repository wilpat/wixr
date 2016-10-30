
/* ----------------------------- 
NiceScroll
----------------------------- */	


$(".log-bar").niceScroll({
	cursorcolor: '#b327b3',
	cursoropacitymin: '0',
	cursorborder: '0px',
	cursorborderradius: '7px',
	cursorwidth: '3px',
	cursorminheight: 60,
	horizrailenabled: false,
	zindex: 1090
});
$(".loger-body").niceScroll({
	cursorcolor: '#b327b3',
	cursoropacitymin: '0',
	cursorborder: '0px',
	cursorborderradius: '7px',
	cursorwidth: '3px',
	cursorminheight: 60,
	horizrailenabled: false,
	zindex: 1090
});

//$('body').hide();
var showUserDetails = $('#showDet');
var userDetails = $('#subSelect');
var toggleUsers = $('.barsMain');
var menuDoc = $('#menuDoc');
var sendBack = $('#sendBack');
var chatBody = $('#flex-5');
var chatUsers = $('#selector');

showUserDetails.on('click', openDev);
sendBack.on('click', returnUser);

function openDev() {
	userDetails.fadeToggle('slow');
}

toggleUsers.click(function(){
	menuDoc.fadeToggle();
});

function returnUser() {
	chatBody.hide();
	chatUsers.fadeIn();
}





