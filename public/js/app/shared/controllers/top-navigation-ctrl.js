/**
 * [y] hybris Platform
 * 
 * Copyright (c) 2000-2015 hybris AG All rights reserved.
 * 
 * This software is the confidential and proprietary information of hybris
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the license
 * agreement you entered into with hybris.
 */

'use strict';

angular.module('ds.shared')
/**
 * Handles interactions with the top menu (mobile menu, mobile search, mobile
 * cart & full screen cart icon)
 */
.controller('TopNavigationCtrl', [ '$scope', '$rootScope', '$state', '$controller', '$timeout', 'GlobalData', 'CartSvc', 'AuthSvc', 'AuthDialogManager', 'CategorySvc', 'settings', 'YGoogleSignin', 'SupportSvc',

function($scope, $rootScope, $state, $controller, $timeout, GlobalData, CartSvc, AuthSvc, AuthDialogManager, CategorySvc, settings, YGoogleSignin, SupportSvc) {

	$scope.GlobalData = GlobalData;
	$scope.categories = CategorySvc.getCategoriesFromCache();

	$scope.isAuthenticated = AuthSvc.isAuthenticated;
	$scope.user = GlobalData.user;

	$scope.supportSvc = SupportSvc;
	$rootScope.$on('textChatClick', function() {
		$scope.popTextChatDialog();
	});
	$rootScope.$on('videoChatClick', function() {
		$scope.popVideoChatDialog();
	});

	if (AuthSvc.isGoogleLoggedIn(GlobalData.customerAccount)) {
		YGoogleSignin.getUser(settings.googleClientId).then(function(googleUser) {
			if (googleUser.image) {
				$scope.user.image = googleUser.image;
			} else {
				$scope.user.image = settings.avatarImagePlaceholder;
			}
		});
	} else {
		$scope.user.image = settings.avatarImagePlaceholder;
	}

	var unbindCats = $rootScope.$on('categories:updated', function(eve, obj) {
		if (!$scope.categories || obj.source === settings.eventSource.languageUpdate) {
			$scope.categories = obj.categories;
		}
	});

	$scope.cart = CartSvc.getLocalCart();
	var unbind = $rootScope.$on('cart:updated', function(eve, eveObj) {
		$scope.cart = eveObj.cart;
	});

	$scope.$on('$destroy', unbind);
	$scope.$on('$destroy', unbindCats);

	/**
	 * Toggles the "show cart view" state as the cart icon is clicked. Note that
	 * this is the actual cart details display, not the icon.
	 */
	$scope.toggleCart = function() {
		if (!$rootScope.showCart) {
			AuthDialogManager.close();
		}
		$rootScope.showCart = !$rootScope.showCart;
	};

	/** Determines if the cart icon should be displayed. */
	$scope.isShowCartButton = function() {
		return !$state.is('base.checkout.details') && !$state.is('base.confirmation');
	};

	/** Toggles the navigation menu for the mobile view. */
	$scope.toggleOffCanvas = function() {
		$rootScope.showMobileNav = !$rootScope.showMobileNav;
	};

	$scope.logout = function() {
		AuthSvc.signOut();
	};

	$scope.login = function(dOpts, opts) {
		AuthDialogManager.open(dOpts, opts);
	};

	$scope.myAccount = function() {
		$state.go('base.account');
	};
	$scope.support = function() {
		$state.go('base.support');
	};

	// chat
	$scope.popTextChatDialog = function() {
		if ($scope.textChatPopup === undefined) {
			return;
		}
		if ($scope.videoChatPopup.isShow === true) {
			return;
		}
		if ($scope.textChatPopup.isShow) {
			var textChatDiv = document.getElementById('textChatDiv');
			$scope.drawAttention(textChatDiv);
		} else {
			$scope.textChatPopup.isShow = true;
		}
	};

	$scope.popVideoChatDialog = function() {
		if ($scope.videoChatPopup === undefined) {
			return;
		}
		if ($scope.textChatPopup.isShow === true) {
			return;
		}
		if ($scope.videoChatPopup.isShow) {
			var videoChatDiv = document.getElementById('videoChatDiv');
			$scope.drawAttention(videoChatDiv);
		} else {
			$scope.videoChatPopup.isShow = true;
		}
	};
	$scope.theurl = 'customer.html';
	console.log(window.screen.availHeight);
	console.log(window.screen.availWidth);
	$scope.modalWidth = window.screen.availWidth / 4;
	$scope.modalHeight = window.screen.availHeight / 4;

	$scope.textChatPopup = {
		modelName : 'textChatPopup',
		// width : window.screen.availWidth*0.8,
		// height :window.screen.availHeight*0.8,
		width : 530,
		height : 436,
		hasTitleBar : true,
		template : '<iframe width=100% height=90% style="overflow:hidden;margin:0px; padding-right:1.5%;" scrolling="no" src="customerForTextChat.html" frameborder="0" id="webRtcTextIframe"></iframe>',
		title : 'Text Chat',
		resizable : false,
		pinned : false,
		draggable : false,
		isShow : false,
		position : {
			top : 100,
			left : 100
		},
		onOpen : function() {
			// $("#webRtcVideoIframe").attr("src",
			// $scope.theurl);
			// sendWinMsg("start");
			var name, email;
			var videoChatBtn = document.getElementById('videoChatBtn');
			videoChatBtn.style.backgroundColor = 'white';
			videoChatBtn.disabled = true;

			if (GlobalData.customerAccount !== undefined && GlobalData.customerAccount !== null) {
				// id = GlobalData.customerAccount.id;
				// name =
				// GlobalData.customerAccount.title + "
				// " +
				// GlobalData.customerAccount.firstName
				// + " " +
				// GlobalData.customerAccount.middleName
				// + " " +
				// GlobalData.customerAccount.lastName;
				email = GlobalData.customerAccount.contactEmail;
				name = GlobalData.customerAccount.contactEmail;
				if (typeof GlobalData.customerAccount.firstName !== undefined) {
					name = GlobalData.customerAccount.firstName;
				}
			}

			var jsonmsg = {
				'method' : 'sendChatInvite',
				'url' : window.location.href,
				'customerEmail' : email,
				'firstName' : name,
				'productId' : $scope.supportSvc.selectedProduct ? $scope.supportSvc.selectedProduct.id : ''
			};
			// var win = $("#webRtcVideoIframe")[0];
			var win = document.getElementById('webRtcTextIframe');
			if (win.contentWindow) {
				var cw = win.contentWindow;
				if (!window.location.origin) {
					window.location.origin = window.location.protocol + '//' + window.location.host;
				}
				cw.postMessage(jsonmsg, window.location.origin);
			}
			var x = $('.fa-minus')[1];
			x.setAttribute('style', 'display:none');
			x = $('.fa-expand')[1];
			x.setAttribute('style', 'display:none');
			x = $('.fa-map-pin')[1];
			x.setAttribute('style', 'display:none');
		},
		onClose : function() {
			var win = document.getElementById('webRtcTextIframe');
			if (win.contentWindow) {
				var cw = win.contentWindow;
				if (!window.location.origin) {
					window.location.origin = window.location.protocol + '//' + window.location.host;
				}
				cw.postMessage('closetextchat', window.location.origin);
			}

		},
		onResize : function() {
		}
	};

	$scope.closeInteraction = function() {

	};

	$scope.cancel = function() {
		$scope.modalInstance.close();
		$scope.cleanUp();
	};

	$scope.drawAttention = function(obj) {

		if (typeof (obj) !== null) {

			// obj.style = {
			// "left" : obj.offsetLeft + "px",
			// "top" : obj.offsetTop + "px",
			// "position" : "absolute",
			// "margin" : 0
			// }

			var edgeArray = [ obj.offsetLeft, obj.offsetTop ];
			var conter = 0;
			var timer = setInterval(function() {
				if (conter >= 20) {
					clearInterval(timer);
					obj.style.left = edgeArray[0] + 'px';
					obj.style.top = edgeArray[1] + 'px';
				} else {
					obj.style.left = edgeArray[0] + ((conter % 2) > 0 ? -3 : 3) + 'px';
					obj.style.top = edgeArray[1] + ((conter % 2) > 0 ? -3 : 3) + 'px';
					conter++;
				}
			}, 20);
			clearInterval(timer);
		}
	};

	$scope.videoChatPopup = {
		modelName : 'videoChatPopup',
		width : 572,
		height : 630,
		hasTitleBar : true,
		template : '<iframe class="container-fluid" width="100%" height=90% style="overflow:hidden;margin:0px; padding:0px;" scrolling="no" src="customer.html" frameborder="0" id="webRtcVideoIframe"></iframe>',
		title : 'Video Chat',
		resizable : false,
		draggable : false,
		isShow : false,
		position : {
			top : 100,
			left : 100
		},
		onOpen : function() {
			// $("#webRtcVideoIframe").attr("src",
			// $scope.theurl);
			// sendWinMsg("start");
			var name, email;
			var textChatBtn = document.getElementById('textChatBtn');
			textChatBtn.style.backgroundColor = 'white';
			textChatBtn.disabled = true;

			if (GlobalData.customerAccount !== undefined && GlobalData.customerAccount !== null) {
				// id = GlobalData.customerAccount.id;
				// name =
				// GlobalData.customerAccount.title + "
				// " +
				// GlobalData.customerAccount.firstName
				// + " " +
				// GlobalData.customerAccount.middleName
				// + " " +
				// GlobalData.customerAccount.lastName;
				email = GlobalData.customerAccount.contactEmail;
				name = GlobalData.customerAccount.contactEmail;
				if (typeof GlobalData.customerAccount.firstName !== undefined) {
					name = GlobalData.customerAccount.firstName;
				}

			}

			var jsonmsg = {
				'method' : 'sendChatInvite',
				'url' : window.location.href,
				'customerEmail' : email,
				'firstName' : name
			// "productId":$scope.supportSvc.selectedProduct ?
			// $scope.supportSvc.selectedProduct.id : ""
			};
			// var win = $("#webRtcVideoIframe")[0];
			var win = document.getElementById('webRtcVideoIframe');
			if (win.contentWindow) {
				var cw = win.contentWindow;
				if (!window.location.origin) {
					window.location.origin = window.location.protocol + '//' + window.location.host;
				}
				cw.postMessage(jsonmsg, window.location.origin);
			}
			var x = $('.fa-minus')[0];
			x.setAttribute('style', 'display:none');
			x = $('.fa-expand')[0];
			x.setAttribute('style', 'display:none');
			x = $('.fa-map-pin')[0];
			x.setAttribute('style', 'display:none');
		},
		onClose : function() {
			var win = document.getElementById('webRtcVideoIframe');
			if (win.contentWindow) {
				var cw = win.contentWindow;
				if (!window.location.origin) {
					window.location.origin = window.location.protocol + '//' + window.location.host;
				}
				cw.postMessage('closechat', window.location.origin);
			}

		},
		onResize : function() {
		}
	};

	var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
	var eventer = window[eventMethod];
	var messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';

	var textChatBtn = document.getElementById('textChatBtn');
	if (textChatBtn) {
		textChatBtn.style.backgroundColor = 'white';
	}

	var videoChatBtn = document.getElementById('videoChatBtn');
	if (videoChatBtn) {
		videoChatBtn.style.backgroundColor = 'white';
		videoChatBtn.style.visibility = 'collapse';
	}

	// Listen to message from child window
	eventer(messageEvent, function(e) {
		var doc = document.documentElement;
		var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
		var win = document.getElementById('webRtcVideoIframe');
		// if (e.data == "ClosePopup") {
		// win.height = "596px";
		// $scope.videoChatPopup.isShow =
		// false;
		// $scope.textChatPopup.isShow =
		// false;
		// window.scrollTo(0, top + 3);
		// }

		if (e.data === 'CloseVideoChat') {
			win.height = '596px';
			$scope.videoChatPopup.isShow = false;
			window.scrollTo(0, top + 3);
			textChatBtn = document.getElementById('textChatBtn');
			textChatBtn.style.backgroundColor = '';
			textChatBtn.disabled = false;
		}
		if (e.data === 'CloseTextChat') {
			win = document.getElementById('webRtcTextIframe');
			$scope.textChatPopup.isShow = false;
			window.scrollTo(0, top + 3);
			videoChatBtn = document.getElementById('videoChatBtn');
			videoChatBtn.style.backgroundColor = '';
			videoChatBtn.disabled = false;
		}

		if (e.data === 'HideVideo') {
			$scope.videoChatPopup.height = 345;
			if (win.contentWindow) {
				win.height = '296px';
			}
			window.scrollTo(0, top + 3);
		}

		if (e.data === 'notifyEnableTextChatButton') {
			textChatBtn = document.getElementById('textChatBtn');
			textChatBtn.style.backgroundColor = '';
			textChatBtn.disabled = false;

		}

		if (e.data === 'notifyEnableVideoChatButton') {
			videoChatBtn = document.getElementById('videoChatBtn');
			videoChatBtn.style.backgroundColor = '';
			videoChatBtn.disabled = false;

		}

		if (e.data === 'notifyShowVideoChatButton') {
			videoChatBtn = document.getElementById('videoChatBtn');
			videoChatBtn.style.visibility = 'visible';
		}

		if (e.data === 'ShowVideo') {
			$scope.videoChatPopup.height = 645;
			if (win.contentWindow) {
				win.height = '596px';
			}
			window.scrollTo(0, top - 3);
		}
	}, false);
	// chat

} ]);