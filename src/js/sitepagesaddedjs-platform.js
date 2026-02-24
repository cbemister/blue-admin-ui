if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/g, '');
	};
}

/** 
 * Example
 * var myAlert = new _AlertEx();
 * myAlert.lockSreen( true );
 * // ... code that does sutff ...
 * $.ajax('ajax...', function(){
 *  myAlert.show( 'Job done!', 'Close' ); // shows modal with close button
 *  // The clsoe button on clock will clear the overlay
 * });
 * 
 * // or
 * myAlert.unlock();
*/
function _AlertEx(){
	var __SELF = this;
	this.onclose = null;
	this.loaderGIF = '/images/ajax-loader_big.gif';
  this.onButton1 = null;
  this.onButton2 = null;
	this.width = null;
	this.fullScreen = false;
	this.modal = false;
	
	jQuery( function($){
		if( $('#msg_dialog-overlay').length < 1 ){
			$('<div id="msg_dialog-overlay"><img src="/images/ajax-bar-loader2.gif" id="ajaxBarLoader" style="display:none;"/></div>').appendTo('body');
		}
	
		if($('#msg_dialog-box').length< 1){
			$('<div id="msg_dialog-box"></div>').appendTo('body');
			var btnHTML = '<div class="msg_dialog-content">'+
										'	<div id="msg_dialog-message"></div>'+
										'</div>'+
										'<center id="msg_dialog-overlay_btn_center" ><a id="msg_dialog-box_button" href="#" class="buttonSmall"></a></center>'+
										'<div id="msg_dialog-overlay_btn_div" style="display:none;width:100%;margin-right:20px;text-align:right;">'+
										'	<a id="msg_dialog-overlay_btn_center_btn1" href="javascript:void(0)" class="buttonSmall" style="text-align:center"></a>'+
										'	<a id="msg_dialog-overlay_btn_center_btn2" href="javascript:void(0)" class="buttonSmall" style="text-align:center;margin-right:20px;"></a>'+
										'</div>'+
										'<br/>';
			$('#msg_dialog-box').html(btnHTML);			
			
			$('<style type="text/css">'+
			'#msg_dialog-overlay { width:100%; height:100%; filter:alpha(opacity=50); -moz-opacity:0.5; -khtml-opacity: 0.5; opacity: 0.5; background:#000; position:absolute; top:0; left:0; z-index:3000; display:none; } #msg_dialog-box{ position: absolute; /*fixed; SCARED OF IE*/ -webkit-box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5); -moz-box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5); -moz-border-radius: 5px; -webkit-border-radius: 5px;  background:#eee; z-index:5000; display:none; overflow: hidden; } #msg_dialog-box .msg_dialog-content { text-align:left; margin:13px; color:#666; overflow: hidden; } #msg_dialog-box_button:hover { color: #fff; } '+
			'</style>').appendTo('head');
			
			
		}
	
	});
	
	this.lockScreen = function(showLoader)
	{
		this._lockScreen(showLoader);
	}
	
	this._lockScreen = function(showLoader)
	{
		// get the screen height and width  
		var maskHeight = $(document).height();  
		var maskWidth = $(window).width();
		
		var $overlay = $('#msg_dialog-overlay');
		
		$overlay.css({height:maskHeight, width:maskWidth}).show()
		if( !this.modal ){
			$overlay.one('click',function(){
				__SELF.hide();
			});
			
			var hideThis = function(e){
				if( e.which == 27 ){
					__SELF.hide();
					$('body').off('keyup', hideThis );
					$overlay.off('click');
				}
			}
			$('body').on('keyup', hideThis);
		}
		
		
		if(!__SELF.width){
			$('#msg_dialog-box').css('width','50%');
		}else{
			$('#msg_dialog-box').css('width',__SELF.width);
		}
    
		
    if (showLoader == true)
    {
      var top  = ($(window).height()) + $(document).scrollTop() - 14; //- 19;
      var left = ($(window).width()) - 190; //- 220;
			
			$('#ajaxBarLoader').css({
				top: '50%',
				left: '50%',
				marginLeft: '-95px',
				position: 'fixed',
				'z-index': 1000
			}).show();
    }
    else $('#ajaxBarLoader').hide();
	}
	
	this.lockScreenLoading = function()
	{
		// get the screen height and width  
		var maskHeight = $(document).height();  
		var maskWidth = $(window).width();
		
		$('#msg_dialog-overlay').css({height:maskHeight, width:maskWidth}).show();
	  $('#msg_dialog-box').css('width','50%');
   	
    __SELF.hideLoadingGIF();
    
    $('<img id="__loadingimage" style="left:50%;top:50%;z-index:5001;position:absolute;margin-left:-50px;margin-top:-50px" src="' + __SELF.loaderGIF + '"/>').appendTo($('body'));
	}
	
	this.hideLoadingGIF = function()
	{
		if (typeof $('#__loadingimage').attr('id') != 'undefined') $('#__loadingimage').remove();	
	}
	
	this.unlockScreen = function()
	{
		__SELF.hideLoadingGIF();
		$('#msg_dialog-overlay').hide();
	}
	
	this.show = function(message, closeText)
	{
		__SELF._lockScreen(false);
    __SELF.hideLoadingGIF();
		
		if( !closeText ){
			closeText =  ($('#closeText').val()) ? $('#closeText').val() : 'OK';
		}
		
	  // show the message so I can get height and width
	  $('#msg_dialog-message').attr('style','').html(message);
	  
		$btn = $('#msg_dialog-box_button');
		$btn.html(closeText);
		var x = $btn.attr('onclick');
		if( typeof x == 'undefined' ){
			$btn.off('click').on('click', __SELF.hide );
		}
		
	  $('#msg_dialog-overlay_btn_center').show();	
	  $('#msg_dialog-overlay_btn_div').hide();	
	  // Reset to default	
		$('#msg_dialog-box').attr('style', '').show().css(this.getCoords());
		/*
		$('#msg_dialog-box').show();	
	  
	  // reposition message
	  width = $('#msg_dialog-box').width();
		if (width > 500) width = width/2;
		height = $('#msg_dialog-box').height();
		if (height > 500) height = height / 2;
		
		var top = ($(window).height() / 3) + $(document).scrollTop() + height/2;
		var left = ($(window).width() / 2) - (width / 2);
		
		$('#msg_dialog-box').css('top', top.toString() + 'px');
		$('#msg_dialog-box').css('left', left.toString() + 'px');
		$('#msg_dialog-box').css('width',width.toString() + 'px');
		//$('#msg_dialog-box').css('height',height.toString() + 'px');
		*/
		
		if( $.fn.corner ) $('#msg_dialog-box').corner();
		
	  
	}
	
	this.showQuestion = function(message, button1, button2)
	{
		__SELF._lockScreen(false);
    __SELF.hideLoadingGIF();
		
		
	  // show the message so I can get height and width
	  $('#msg_dialog-message').attr('style','').html(message);
		
		$btn1 = $('#msg_dialog-overlay_btn_center_btn1');
		$btn2 = $('#msg_dialog-overlay_btn_center_btn2');
		
		
		var x = $btn1.attr('onclick');
		if( typeof x == 'undefined' ){
			$btn1.off('click').on('click', __SELF.button1Click );
		}
		var x = $btn2.attr('onclick');
		if( typeof x == 'undefined' ){
			$btn2.off('click').on('click', __SELF.button2Click );
		}
		
	  $btn1.html(button1);
	  $btn2.html(button2);
	  $('#msg_dialog-overlay_btn_center').hide();	
	  $('#msg_dialog-overlay_btn_div').show();	
		// Reset to default	
	  $('#msg_dialog-box').attr('style', '').show().css(this.getCoords());

		if( typeof $.fn.corner !== 'undefined' )
		{
			$('#msg_dialog-box').corner();
		}
	  
	}
	
	this.getCoords = function(){
		var x,y,w,h = 0;
		if( __SELF.fullScreen == true ){
			w = (__SELF.width) ? __SELF.enforeCSS(__SELF.width) : '100%';
			return {
				top: '3%',
				left: '50%',
				marginLeft: ((w == '100%') ? '-50%' : (parseInt(w)/-2)+'px' ),
				width: w,
				height: '90%',
				position: 'fixed'
			}
		}
		
		var $box = $('#msg_dialog-box');

		// reposition message
	  w = (__SELF.width) ? __SELF.enforeCSS(__SELF.width) : $box.width();
		w = ( w < 100 ) ? 100 : w;
		w = ( w > 800 ) ? 800 : w;
		
		h = $box.height();
		h = ( h < 100 ) ? 100 : h;
		h = ( h > 600 ) ? 600 : h;
				
		var y = ($(window).height() / 3) + $(document).scrollTop() - (h/2);
		var x = ($(window).width() / 2) - (w / 2);
		h = 0;
		
		return { top: y+'px', left: x+'px', width: w+'px' }
	}
	
	this.onHide = function(){
	}
	
	this.button1Click = function()
	{
		if (typeof __SELF.onButton1 != 'undefined' && __SELF.onButton1 != null) {
			if( __SELF.onButton1() ){
				__SELF.hide()
			}
		}else{
			__SELF.hide();
		}
		return false;
	}
	
	this.button2Click = function()
	{
		if (typeof __SELF.onButton2 != 'undefined' && __SELF.onButton2 != null) {
			if( __SELF.onButton2() ){
				__SELF.hide()
			}
		}else{
			__SELF.hide();
		}
		return false;
	}
	
	this.hide = function()
	{
		if (this.onclose != null)this.onclose();
		 
		$('#msg_dialog-overlay').hide();
  	$('#msg_dialog-box').hide();
		
		if( 'function' == typeof __SELF.onHide){
			__SELF.onHide();
		}else{
			eval( __SELF.onHide );
		}
  	__SELF.hideLoadingGIF();
		
		return false;
	}
	
	this.enforeCSS = function(value)
	{
		if( !value ) return '';
		if( typeof value != 'string') value = value.toString();
		
		var Vmeasures = ['%','em','px','pt','cm','in','mm','pc'];
		for( var i = 0; i < Vmeasures.length; i++ ){
			if( value.indexOf(Vmeasures[i])  != -1 ) return value;	
		}
		return value+'px';
	}
	
	return this;
}

var alertEX = new _AlertEx();
/*
var alertEX = {
  onclose: null,
  loaderGIF: '/images/ajax-loader_big.gif',
  onButton1: null,
  onButton2: null,
	
	lockScreen: function(showLoader)
	{
	},
	_lockScreen: function(showLoader)
	{
		// get the screen height and width  
		var maskHeight = $(document).height();  
		var maskWidth = $(window).width();
		
		$('#msg_dialog-overlay').css({height:maskHeight, width:maskWidth}).show();
	  $('#msg_dialog-box').css('width','50%');
    
    if (showLoader == true)
    {
      var top = ($(window).height()) + $(document).scrollTop() - 14; //- 19;
      var left = ($(window).width()) - 190; //- 220;
      $('#ajaxBarLoader').css('top', top.toString() + 'px');
      $('#ajaxBarLoader').css('left', left.toString() + 'px');
      $('#ajaxBarLoader').css('position', 'absolute');
      $('#ajaxBarLoader').show();
    }
    else $('#ajaxBarLoader').hide();
    
		
	},
	lockScreenLoading: function()
	{
		// get the screen height and width  
		var maskHeight = $(document).height();  
		var maskWidth = $(window).width();
		
		$('#msg_dialog-overlay').css({height:maskHeight, width:maskWidth}).show();
	  $('#msg_dialog-box').css('width','50%');
   	
    alertEX.hideLoadingGIF();
    
    $('<img id="__loadingimage" style="left:50%;top:50%;z-index:5001;position:absolute;margin-left:-50px;margin-top:-50px" src="' + alertEX.loaderGIF + '"/>').appendTo($('body'));
    
    
    
		
	},
	hideLoadingGIF: function()
	{
		if (typeof $('#__loadingimage').attr('id') != 'undefined') $('#__loadingimage').remove();	
	},
	
	unlockScreen: function()
	{
		alertEX.hideLoadingGIF();
		$('#msg_dialog-overlay').hide();
	},
	show: function(message)
	{
		alertEX._lockScreen(false);
    alertEX.hideLoadingGIF();
		
	  // show the message so I can get height and width
	  $('#msg_dialog-message').html(message);
	  $('#msg_dialog-box_button').html($('#closeText').val());
	  $('#msg_dialog-overlay_btn_center').show();	
	  $('#msg_dialog-overlay_btn_div').hide();	
	  $('#msg_dialog-box').show();	
	  
	  // reposition message
	  width = $('#msg_dialog-box').width();
		if (width > 500) width = width/2;
		height = $('#msg_dialog-box').height();
		if (height > 500) height = height / 2;
		
		var top = ($(window).height() / 3) + $(document).scrollTop() + height/2;
		var left = ($(window).width() / 2) - (width / 2);
		
		$('#msg_dialog-box').css('top', top.toString() + 'px');
		$('#msg_dialog-box').css('left', left.toString() + 'px');
		$('#msg_dialog-box').css('width',width.toString() + 'px');
		//$('#msg_dialog-box').css('height',height.toString() + 'px');
		
		$('#msg_dialog-box').corner();
	  
	},
	
	showQuestion: function(message, button1, button2)
	{
		alertEX._lockScreen(false);
    alertEX.hideLoadingGIF();
		
		
	  // show the message so I can get height and width
	  $('#msg_dialog-message').html(message);
	  $('#msg_dialog-overlay_btn_center_btn1').html(button1);
	  $('#msg_dialog-overlay_btn_center_btn2').html(button2);
	  $('#msg_dialog-overlay_btn_center').hide();	
	  $('#msg_dialog-overlay_btn_div').show();	
	  $('#msg_dialog-box').show();	
	  
	  // reposition message
	  width = $('#msg_dialog-box').width();
		if (width > 500) width = width/2;
		height = $('#msg_dialog-box').height();
		if (height > 500) height = height / 2;
		
		var top = ($(window).height() / 3) + $(document).scrollTop() + height/2;
		var left = ($(window).width() / 2) - (width / 2);
		
		$('#msg_dialog-box').css('top', top.toString() + 'px');
		$('#msg_dialog-box').css('left', left.toString() + 'px');
		$('#msg_dialog-box').css('width',width.toString() + 'px');
		//$('#msg_dialog-box').css('height',height.toString() + 'px');
		
		$('#msg_dialog-box').corner();
	  
	},
	button1Click: function(){
		console.log( 'static obj', alertEX );
		if (typeof alertEX.onButton1 != 'undefined' && alertEX.onButton1 != null)alertEX.onButton1();
		alertEX.hide();
	},
	button2Click: function(){
		if (typeof alertEX.onButton2 != 'undefined' && alertEX.onButton2 != null)alertEX.onButton2();
		alertEX.hide();
	},
	
	
	hide: function()
	{
		if (this.onclose != null)this.onclose();
		 
		$('#msg_dialog-overlay').hide();
  	$('#msg_dialog-box').hide();
  	alertEX.hideLoadingGIF();
	}
	
};

*/


/* ================================================================
