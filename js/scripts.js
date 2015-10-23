'use strict'
$(function() {
  /* highlight the top nav as scrolling occurs */
  $('body').scrollspy({
    target: '#nav',
    offset: $('#nav').height()
  })

  /* affix the navbar after scroll below header */
  $('#nav').affix({
    offset: {
      top: $('#nav').offset().top
    }
  });	

  /* set the height of an empty div to do a correct offset */
  $('#nav').on('affix.bs.affix affix-top.bs.affix', function(e) {
    var height;
    
    switch (e.type) {
      case 'affix':
        height = getAffixedNavbarHeight();
        break;
      case 'affix-top':
        height = 0;
        break;
    }
    $('#affix-spacer').height(height);
  });

  /* smooth scrolling for nav sections */
  $('#nav .navbar-nav li>a').click( function(e) {
    e.preventDefault();
    var section = $(this).attr('href');
    var sectionOffset = $(section).offset().top;
    var navHeight = getAffixedNavbarHeight();

    var posi = sectionOffset - navHeight + 1;

    if (isMobile()) {
      if (isNavbarFixed()) {
        posi -= $('.navbar-collapse.in').height();
      }
      /* collapse the navbar after clicking */
      $('.navbar-toggle').click();
    }

    $('html, body').animate({scrollTop: posi}, 700);
  });

  $('.navbar-toggle').click(function(e) {

  });

  var isMobile = function() {
    var screenWidth = $(window).width();
    return screenWidth < 768;
  }

  var isNavbarExpanded = function() {
    return $('.navbar-collapse.in').size() == 0;
  }

  var isNavbarFixed = function() {
    return $('#nav.affix').size() == 0;
  }

  var getAffixedNavbarHeight = function() {
    if (isMobile()) {
      return $('.navbar-header').height();
    }
    return $('#nav').height();
  }

  /* instafeed.js */
  var feed = new Instafeed({
    get: 'user',
    userId: 1416158121,
    accessToken: '1416158121.467ede5.6a670872bf694751b43af736bdd775cf',
    template: '<a href="{{link}}"><img src="{{image}}"></a>'
  });
  feed.run();
});
