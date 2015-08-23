(function ($, window, i) {

  'use strict';

  $.fn.tabBarNav = function (options) {

    // Settings
    var s = $.extend({
      tabBarNavWrapper:	'tab_bar_wrapper',
      fullNavWrapper:	'tab_bar_full_wrapper',
      siteWrapper:	'site_wrapper',
      siteOverlay: 'site_overlay',
      tabBarNavItems: [0,1,2,3],
    }, options);

    // Init and localize variables
    var element,
        tabBarNavWrapper,
        tabBarNav,
        tabBarMore,
        fullNavWrapper,
        fullNav,
        fullNavClose,
        siteWrapper,
        siteOverlay;


    function createFullNav (element, fullNav, add) {

      add = add || '';

      var li = $('<li/>', {
        class: 'item-close',
      });

      fullNavClose = $('<a/>', {
        href: '#',
        html: 'Close'
      }).appendTo(li);

      li.appendTo(fullNav);

      // add all elements to the fullMenu
      $(element).children('li').each(function () {

        var url = $(this).children('a').attr('href');

        if (url === undefined || url === false || url.length === 0) {
          url = '';
        }

        var li = $('<li/>');

        $('<a/>', {
          href: url,
          html: add + $(this).children('a').text(),
        }).appendTo(li);

        li.appendTo(fullNav);

        // Submenu
        if ($(this).children('ul').length > 0) {
          createFullNav($(this).children('ul'), fullNav, add + "  ");
        }

      });

    }

    function createTabBarNav (element, tabBarNav) {

      if ( s.tabBarNavItems.length >= 1 ) {

        var x;

        for (x in s.tabBarNavItems){

          // add first 4 elements to the tabBar
          $(element).children('li:eq(' + parseInt(s.tabBarNavItems[x]) + ')').each(function () {

            var url = $(this).children('a').attr('href');

            if (url === undefined || url === false || url.length === 0) {
              url = '';
            }

            var li = $('<li/>', {
              class: ($(this).hasClass(s.activeClass)) ? s.activeClass : ''
            });

            li.addClass('item-'+x);
            $('<a/>', {
              href: url,
              html: $(this).children('a').text(),
              class: "scroll",
            }).appendTo(li);

            li.appendTo(tabBarNav);

          });

        }

      }

    }

    // Copyright (c) 2012 Louis-Rémi Babé.
    function on_resize(c,t){onresize=function(){clearTimeout(t);t=setTimeout(c,100)};return c};

    // Let's do it
    this.each(function () {

      element = $(this);

      i += 1;

      if ( i == 1 ){

        // Site Wrapper
        siteWrapper = $('body').wrapInner(
          $('<div/>', {
            id: s.siteWrapper
          })
        ).children();

        // Site Overlay
        siteOverlay = $('<div/>', {
          id: s.siteOverlay
        });

        $('body').prepend(siteOverlay);

        // Full Nav
        fullNavWrapper = $('<nav/>', {
          id: s.fullNavWrapper
        });

        fullNav = $('<ul/>');

        createFullNav($(element), fullNav);

        $(fullNavWrapper).append(fullNav);

        $('body').prepend(fullNavWrapper);

        // Tab Bar Nav
        tabBarNavWrapper = $('<nav/>', {
          id: s.tabBarNavWrapper
        });

        tabBarNav = $('<ul/>');

        createTabBarNav($(element), tabBarNav);

        $(tabBarNavWrapper).append(tabBarNav);

        $('body').prepend(tabBarNavWrapper);

        // Open Full Nav
        $(tabBarMore).click(function(event){
          event.preventDefault();
          event.stopPropagation();
          $('body').addClass('tabbar-more');
        });

        // Close Full Nav
        $(siteOverlay).click(function(event) {
          $('body').removeClass('tabbar-more');
        });

        $(fullNavClose).click(function(event) {
          event.preventDefault();
          $('body').removeClass('tabbar-more');
        });

        // Adjust siteWrapper position on resize
        on_resize(function() {

          var top = 0;

          if ( $(tabBarNavWrapper).is(":visible") ){
            top = $(tabBarNavWrapper).outerHeight() + "px"
          }

          $('body').css('padding-top',top);

        })(); // these parenthesis make it run on load

      }

    });

  };
})(jQuery, this, 0);

$(document).ready(function(){

  $(function(){
    var element = document.getElementById("final-text");
    var bodyRect = document.body.getBoundingClientRect(),
    elemRect = element.getBoundingClientRect(),
    offset   = (elemRect.top - bodyRect.top) + 70;
    $('.banner').css({ "min-height":offset, height: $(window).innerHeight() });
    $(window).resize(function(){
      $('.banner').css({ "min-height":offset, height: $(window).innerHeight() });
    });
  });

  // Initialize tabBarNav
  $('#nav_main > ul').tabBarNav({
    tabBarNavWrapper:	'tab_bar_wrapper',
    fullNavWrapper:	'tab_bar_full_wrapper',
    siteWrapper:	'site_wrapper',
    siteOverlay: 'site_overlay',
    tabBarNavItems:		[0,1,2,3,4],
  });

});

document.onreadystatechange = function(){
  var state = document.readyState;
  if (state == 'interactive') {
      // do something
  } else if (state == 'complete') {

    $(function() {
    	$(".email")
    	.find("span")
    	.hide()
    	.end()
    	.hover(function() {
    		$(this).find("span").stop(true, true).fadeIn();
    	}, function() {
    		$(this).find("span").stop(true, true).fadeOut();
    	});
    });

    $(function() {
    	$(".linkedin")
    	.find("span")
    	.hide()
    	.end()
    	.hover(function() {
    		$(this).find("span").stop(true, true).fadeIn();
    	}, function() {
    		$(this).find("span").stop(true, true).fadeOut();
    	});
    });
    $(function() {
    	$(".facebook")
    	.find("span")
    	.hide()
    	.end()
    	.hover(function() {
    		$(this).find("span").stop(true, true).fadeIn();
    	}, function() {
    		$(this).find("span").stop(true, true).fadeOut();
    	});
    });
    $(function() {
    	$(".github")
    	.find("span")
    	.hide()
    	.end()
    	.hover(function() {
    		$(this).find("span").stop(true, true).fadeIn();
    	}, function() {
    		$(this).find("span").stop(true, true).fadeOut();
    	});
    });
    $(function() {
    	$(".bitbucket")
    	.find("span")
    	.hide()
    	.end()
    	.hover(function() {
    		$(this).find("span").stop(true, true).fadeIn();
    	}, function() {
    		$(this).find("span").stop(true, true).fadeOut();
    	});
    });
    $(function() {
    	$(".twitter")
    	.find("span")
    	.hide()
    	.end()
    	.hover(function() {
    		$(this).find("span").stop(true, true).fadeIn();
    	}, function() {
    		$(this).find("span").stop(true, true).fadeOut();
    	});
    });
    $(function() {
    	$(".dv")
    	.find("span")
    	.hide()
    	.end()
    	.hover(function() {
    		$(this).find("span").stop(true, true).fadeIn();
    	}, function() {
    		$(this).find("span").stop(true, true).fadeOut();
    	});
    });
    $(function() {
    	$(".codeTalk")
    	.find("span")
    	.hide()
    	.end()
    	.hover(function() {
    		$(this).find("span").stop(true, true).fadeIn();
    	}, function() {
    		$(this).find("span").stop(true, true).fadeOut();
    	});
    });

    function hasClass(ele,cls) {
      return !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
    }

    function addClass(ele,cls) {
      if (!hasClass(ele,cls)) ele.className += " "+cls;
    }

    function removeClass(ele,cls) {
      if (hasClass(ele,cls)) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
        ele.className=ele.className.replace(reg,' ');
      }
    }

    function selectItem(elem, elem2){
      var e = document.getElementById("menu-home");
      removeClass(e, "selected");
      e = document.getElementById("menu-about");
      removeClass(e, "selected");
      e = document.getElementById("menu-services");
      removeClass(e, "selected");
      e = document.getElementById("menu-portfolio");
      removeClass(e, "selected");
      e = document.querySelector(".item-0").children[0];
      removeClass(e, "selected");
      e = document.querySelector(".item-1").children[0];
      removeClass(e, "selected");
      e = document.querySelector(".item-2").children[0];
      removeClass(e, "selected");
      e = document.querySelector(".item-3").children[0];
      removeClass(e, "selected");

      e = document.querySelector(elem2).children[0]
      addClass(e, "selected");
      e = document.getElementById("menu-" + elem);
      addClass(e, "selected");
    }

    window.addEventListener(
        'scroll',
        function()
        {
          var menu = document.querySelector('#nav_main')
          var menuPosition = menu.getBoundingClientRect().top;
          if (window.pageYOffset >= menuPosition) {
              menu.style.position = 'fixed';
              menu.style.top = '0px';
          } else {
              menu.style.position = 'static';
              menu.style.top = '';
          }

          var home = document.getElementById("home").offsetHeight;
          var about = document.getElementById("about").offsetHeight;
          var services = document.getElementById("services").offsetHeight;
          var portfolio = document.getElementById("portfolio").offsetHeight;

          var scrollPos = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
          if (scrollPos >= 0 && scrollPos <= home - 100) {
            //home
            selectItem("home", ".item-0");

          } else if (scrollPos > (home - 100) && scrollPos <= about + home) {
            // about
            selectItem("about", ".item-1");

          } else if (scrollPos > (home + about) && scrollPos <= services + home + about) {
            // services
            selectItem("services", ".item-2");

          } else if (scrollPos > home + about + services && scrollPos <= portfolio + home + about + services) {
            // portifolio
            selectItem("portfolio", ".item-3");

          }

        },
        false
    )



  }
};
