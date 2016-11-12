
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
var user = $('.onlineUser');
var goRet = $('#backer');
var userDetails = $('#subSelect');
var userDetails2 = $('#subSelect2');

showUserDetails.on('click', openDev);
sendBack.on('click', returnUser);
user.on('click', showDet);
goRet.on('click', takeOut);

function openDev() {
	if($(window).width() > 756) {
		userDetails.fadeToggle('slow');
	}else
	{
		alert(goRet);
		$('#flex-5').hide();
		userDetails.fadeIn('slow');
	}
}

toggleUsers.click(function(){
	menuDoc.fadeToggle();
});

function showDet() {
	$('#flex-5').hide();
	userDetails2.fadeIn('slow');
	userDetails.hide();
};
function takeOut() {
	$('#flex-5').fadeIn('slow');
	userDetails.hide();
	userDetails2.hide();
}
function returnUser() {
	chatBody.hide();
	chatUsers.fadeIn();
}




