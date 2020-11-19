/*!
 * Start Bootstrap - Creative v6.0.3 (https://startbootstrap.com/themes/creative)
 * Copyright 2013-2020 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
 */
(function($) {
  "use strict"; // Start of use strict


  var prevScrollpos = window.pageYOffset;
  window.onscroll = function() {
    var currentScrollPos = window.pageYOffset;
    if(prevScrollpos > currentScrollPos) {
      document.getElementById("mainNav").style.top = "0";
    } else {
      document.getElementById("mainNav").style.top = "-100px";
    }
    prevScrollpos = currentScrollPos;
  }


  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 75
  });

  // Collapse Navbar
  var navbarCollapse = function() {
    if($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-scrolled");
    } else {
      $("#mainNav").removeClass("navbar-scrolled");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);

  // Magnific popup calls
  //$('#portfolio').magnificPopup({
  //  delegate: 'a',
  //  type: 'image',
  //  tLoading: 'Loading image #%curr%...',
  //  mainClass: 'mfp-img-mobile',
  //   gallery: {
  //    enabled: true,
  //    navigateByImgClick: true,
  //    preload: [0, 1]
  //  },
  //  image: {
  //    tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
  //  }
  // });

  $.getScript('http://www.youtube.com/iframe_api');
  var player, seconds = 0;

  function onYouTubeIframeAPIReady() {
    console.log("player");
    player = new YT.Player('player', {
      events: {
        'onReady': onPlayerReady
      }
    });
  }

  function onPlayerReady(event) {
    event.target.playVideo();
  }

  $('playerBtn').click(function() {
    if(player) {
      seconds = 32;
      player.seekTo(seconds, true);
    }
  });
  // function seek(sec) {
  //   console.log("player");
  //   if(player) {
  //     seconds = sec;
  //     player.seekTo(seconds, true);
  //   }
  // }


  $('#recipeCarousel').carousel({
    interval: 10000
  })

  $('.carousel .carousel-item').each(function() {
    var minPerSlide = 3;
    var next = $(this).next();
    if(!next.length) {
      next = $(this).siblings(':first');
    }
    next.children(':first-child').clone().appendTo($(this));

    for(var i = 0; i < minPerSlide; i++) {
      next = next.next();
      if(!next.length) {
        next = $(this).siblings(':first');
      }

      next.children(':first-child').clone().appendTo($(this));
    }
  });

})(jQuery); // End of use strict
