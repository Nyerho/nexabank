(function($) {

    "use strict";

    //Hide Loading Box (Preloader)
    function handlePreloader() {
        if ($('.loader-wrap').length) {
            $('.loader-wrap').delay(1000).fadeOut(500);
        }
    }

    if ($(".preloader-close").length) {
        $(".preloader-close").on("click", function() {
            $('.loader-wrap').delay(200).fadeOut(500);
        })
    }

    //Update Header Style and Scroll to Top
    function headerStyle() {
        if ($('.main-header').length) {
            var windowpos = $(window).scrollTop();
            var siteHeader = $('.main-header');
            var scrollLink = $('.scroll-top');
            if (windowpos >= 110) {
                siteHeader.addClass('fixed-header');
                scrollLink.addClass('open');
            } else {
                siteHeader.removeClass('fixed-header');
                scrollLink.removeClass('open');
            }
        }
    }

    headerStyle();


    //Submenu Dropdown Toggle
    if ($('.main-header li.dropdown ul').length) {
        $('.main-header .navigation li.dropdown').append('<div class="dropdown-btn"><span class="fas fa-angle-down"></span></div>');

    }

    //Mobile Nav Hide Show
    if ($('.mobile-menu').length) {


        var mobileMenuContent = $('.main-header .menu-area .main-menu').html();
        $('.mobile-menu .menu-box .menu-outer').append(mobileMenuContent);
        $('.sticky-header .main-menu').append(mobileMenuContent);

        //Dropdown Button
        $('.mobile-menu li.dropdown .dropdown-btn').on('click', function() {
            $(this).toggleClass('open');
            $(this).prev('ul').slideToggle(500);
        });
        //Dropdown Button
        $('.mobile-menu li.dropdown .dropdown-btn').on('click', function() {
            $(this).prev('.megamenu').slideToggle(900);
        });
        //Menu Toggle Btn
        $('.mobile-nav-toggler').on('click', function() {
            $('body').addClass('mobile-menu-visible');
        });

        //Menu Toggle Btn
        $('.mobile-menu .menu-backdrop,.mobile-menu .close-btn').on('click', function() {
            $('body').removeClass('mobile-menu-visible');
        });
    }

    // Elements Animation
    if ($('.wow').length) {
        var wow = new WOW({
            mobile: false
        });
        wow.init();
    }

    //Contact Form Validation
    if ($('#contact-form').length) {
        $('#contact-form').validate({
            rules: {
                username: {
                    required: true
                },
                email: {
                    required: true,
                    email: true
                },
                phone: {
                    required: true
                },
                subject: {
                    required: true
                },
                message: {
                    required: true
                }
            }
        });
    }

    if ($(".odometer").length) {
        var odo = $(".odometer");
        odo.each(function() {
            $(this).appear(function() {
                var countNumber = $(this).attr("data-count");
                $(this).html(countNumber);
            });
        });
    }


    //LightBox / Fancybox
    if ($('.lightbox-image').length) {
        $('.lightbox-image').fancybox({
            openEffect: 'fade',
            closeEffect: 'fade',
            helpers: {
                media: {}
            }
        });
    }


    //Tabs Box
    if ($('.tabs-box').length) {
        $('.tabs-box .tab-buttons .tab-btn').on('click', function(e) {
            e.preventDefault();
            var target = $($(this).attr('data-tab'));

            if ($(target).is(':visible')) {
                return false;
            } else {
                target.parents('.tabs-box').find('.tab-buttons').find('.tab-btn').removeClass('active-btn');
                $(this).addClass('active-btn');
                target.parents('.tabs-box').find('.tabs-content').find('.tab').fadeOut(0);
                target.parents('.tabs-box').find('.tabs-content').find('.tab').removeClass('active-tab');
                $(target).fadeIn(100);
                $(target).addClass('active-tab');
            }
        });
    }


    //Tabs Box
    if ($('.tabs-box-2').length) {
        $('.tabs-box-2 .tab-buttons-2 .tab-btn-2').on('click', function(e) {
            e.preventDefault();
            var target = $($(this).attr('data-tab'));

            if ($(target).is(':visible')) {
                return false;
            } else {
                target.parents('.tabs-box-2').find('.tab-buttons-2').find('.tab-btn-2').removeClass('active-btn-2');
                $(this).addClass('active-btn-2');
                target.parents('.tabs-box-2').find('.tabs-content-2').find('.tab-2').fadeOut(0);
                target.parents('.tabs-box-2').find('.tabs-content-2').find('.tab-2').removeClass('active-tab-2');
                $(target).fadeIn(300);
                $(target).addClass('active-tab-2');
            }
        });
    }


    //booking Tabs
    if ($('.exchange-tab').length) {
        $('.exchange-tab .product-tab-btns .p-tab-btn').on('click', function(e) {
            e.preventDefault();
            var target = $($(this).attr('data-tab'));

            if ($(target).hasClass('actve-tab')) {
                return false;
            } else {
                $('.exchange-tab .product-tab-btns .p-tab-btn').removeClass('active-btn');
                $(this).addClass('active-btn');
                $('.exchange-tab .p-tabs-content .p-tab').removeClass('active-tab');
                $(target).addClass('active-tab');
            }
        });
    }



    //Accordion Box
    if ($('.accordion-box').length) {
        $(".accordion-box").on('click', '.acc-btn', function() {

            var outerBox = $(this).parents('.accordion-box');
            var target = $(this).parents('.accordion');

            if ($(this).hasClass('active') !== true) {
                $(outerBox).find('.accordion .acc-btn').removeClass('active');
            }

            if ($(this).next('.acc-content').is(':visible')) {
                return false;
            } else {
                $(this).addClass('active');
                $(outerBox).children('.accordion').removeClass('active-block');
                $(outerBox).find('.accordion').children('.acc-content').slideUp(300);
                target.addClass('active-block');
                $(this).next('.acc-content').slideDown(300);
            }
        });
    }


    // banner-carousel
    if ($('.banner-carousel').length) {
        $('.banner-carousel').owlCarousel({
            loop: true,
            margin: 0,
            nav: true,
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            active: true,
            smartSpeed: 1000,
            autoplay: 6000,
            navText: ['<span class="flaticon-next"></span>', '<span class="flaticon-next"></span>'],
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 1
                },
                800: {
                    items: 1
                },
                1024: {
                    items: 1
                }
            }
        });
    }


    // single-item-carousel
    if ($('.single-item-carousel').length) {
        $('.single-item-carousel').owlCarousel({
            loop: true,
            margin: 30,
            nav: true,
            smartSpeed: 500,
            autoplay: 1000,
            navText: ['<span class="flaticon-next"></span>', '<span class="flaticon-next"></span>'],
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                600: {
                    items: 1
                },
                800: {
                    items: 1
                },
                1200: {
                    items: 1
                }

            }
        });
    }


    // two-item-carousel
    if ($('.two-item-carousel').length) {
        $('.two-item-carousel').owlCarousel({
            loop: true,
            margin: 30,
            nav: true,
            smartSpeed: 500,
            autoplay: 1000,
            navText: ['<span class="flaticon-next"></span>', '<span class="flaticon-next"></span>'],
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                600: {
                    items: 1
                },
                800: {
                    items: 2
                },
                1200: {
                    items: 2
                }

            }
        });
    }


    // three-item-carousel
    if ($('.three-item-carousel').length) {
        $('.three-item-carousel').owlCarousel({
            loop: true,
            margin: 30,
            nav: true,
            smartSpeed: 500,
            autoplay: 1000,
            navText: ['<span class="flaticon-next"></span>', '<span class="flaticon-next"></span>'],
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                600: {
                    items: 2
                },
                800: {
                    items: 2
                },
                1200: {
                    items: 3
                }

            }
        });
    }


    // four-item-carousel
    if ($('.four-item-carousel').length) {
        $('.four-item-carousel').owlCarousel({
            loop: true,
            margin: 30,
            nav: true,
            smartSpeed: 500,
            autoplay: 1000,
            navText: ['<span class="flaticon-next"></span>', '<span class="flaticon-next"></span>'],
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                600: {
                    items: 2
                },
                800: {
                    items: 3
                },
                1200: {
                    items: 4
                }

            }
        });
    }


    // five-item-carousel
    if ($('.five-item-carousel').length) {
        $('.five-item-carousel').owlCarousel({
            loop: true,
            margin: 30,
            nav: true,
            smartSpeed: 500,
            autoplay: 1000,
            navText: ['<span class="fal fa-angle-left"></span>', '<span class="fal fa-angle-right"></span>'],
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 2
                },
                600: {
                    items: 3
                },
                800: {
                    items: 4
                },
                1200: {
                    items: 5
                }

            }
        });
    }


    // six-item-carousel
    if ($('.six-item-carousel').length) {
        $('.six-item-carousel').owlCarousel({
            loop: true,
            margin: 100,
            nav: true,
            smartSpeed: 500,
            autoplay: 1000,
            navText: ['<span class="fal fa-angle-left"></span>', '<span class="fal fa-angle-right"></span>'],
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 2
                },
                600: {
                    items: 3
                },
                800: {
                    items: 4
                },
                1200: {
                    items: 6
                }

            }
        });
    }


    // tab-btn-carousel
    if ($('.tab-btn-carousel').length) {
        $('.tab-btn-carousel').owlCarousel({
            loop: false,
            margin: 0,
            nav: true,
            smartSpeed: 500,
            autoplay: 1000,
            navText: ['<span class="flaticon-next"></span>', '<span class="flaticon-next"></span>'],
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                600: {
                    items: 2
                },
                800: {
                    items: 3
                },
                1200: {
                    items: 4
                }

            }
        });
    }


    //Add One Page nav
    if ($('.scroll-nav').length) {
        $('.scroll-nav').onePageNav();
    }

    //nice select
    $(document).ready(function() {
        $('select:not(.ignore)').niceSelect();
    });


    //Sortable Masonary with Filters
    function enableMasonry() {
        if ($('.sortable-masonry').length) {

            var winDow = $(window);
            // Needed variables
            var $container = $('.sortable-masonry .items-container');
            var $filter = $('.filter-btns');

            $container.isotope({
                filter: '*',
                masonry: {
                    columnWidth: '.masonry-item.small-column'
                },
                animationOptions: {
                    duration: 500,
                    easing: 'linear'
                }
            });


            // Isotope Filter 
            $filter.find('li').on('click', function() {
                var selector = $(this).attr('data-filter');

                try {
                    $container.isotope({
                        filter: selector,
                        animationOptions: {
                            duration: 500,
                            easing: 'linear',
                            queue: false
                        }
                    });
                } catch (err) {

                }
                return false;
            });


            winDow.on('resize', function() {
                var selector = $filter.find('li.active').attr('data-filter');

                $container.isotope({
                    filter: selector,
                    animationOptions: {
                        duration: 500,
                        easing: 'linear',
                        queue: false
                    }
                });
            });


            var filterItemA = $('.filter-btns li');

            filterItemA.on('click', function() {
                var $this = $(this);
                if (!$this.hasClass('active')) {
                    filterItemA.removeClass('active');
                    $this.addClass('active');
                }
            });
        }
    }

    enableMasonry();


    // Progress Bar
    if ($('.count-bar').length) {
        $('.count-bar').appear(function() {
            var el = $(this);
            var percent = el.data('percent');
            $(el).css('width', percent).addClass('counted');
        }, {
            accY: -50
        });

    }


    //Search Popup
    if ($('#search-popup').length) {

        //Show Popup
        $('.search-toggler').on('click', function() {
            $('#search-popup').addClass('popup-visible');
        });
        $(document).keydown(function(e) {
            if (e.keyCode === 27) {
                $('#search-popup').removeClass('popup-visible');
            }
        });
        //Hide Popup
        $('.close-search,.search-popup .overlay-layer').on('click', function() {
            $('#search-popup').removeClass('popup-visible');
        });
    }


    if ($('.curved-circle').length) {
        $('.curved-circle').circleType({
            position: 'absolute',
            dir: 0.85,
            radius: 77,
            forceHeight: true,
            forceWidth: true
        });
    }

    if ($('.curved-circle-2').length) {
        $('.curved-circle-2').circleType({
            position: 'absolute',
            dir: 0.85,
            radius: 57,
            forceHeight: true,
            forceWidth: true
        });
    }


    // Scroll to a Specific Div
    if ($('.scroll-to-target').length) {
        $(".scroll-to-target").on('click', function() {
            var target = $(this).attr('data-target');
            // animate
            $('html, body').animate({
                scrollTop: $(target).offset().top
            }, 1000);

        });
    }


    //Chat Popup
    if ($('#chat-popup').length) {

        //Show Popup
        $('.chat-toggler').on('click', function() {
            $('#chat-popup').addClass('popup-visible');
        });
        $(document).keydown(function(e) {
            if (e.keyCode === 27) {
                $('#chat-popup').removeClass('popup-visible');
            }
        });
        //Hide Popup
        $('.close-chat,.chat-popup .overlay-layer').on('click', function() {
            $('#chat-popup').removeClass('popup-visible');
        });
    }


    //shopping-cart-bar sticky
    $(".nav-btn").on("click", function() {
        $(".nav-content").addClass('cart-visible');
    });
    $(".close-icon").click(function() {
        $(".nav-content").removeClass('cart-visible');

    });

    //shopping-cart-bar sticky
    $(".nav-btn-2").on("click", function() {
        $(".nav-content-2").addClass('cart-visible');
    });
    $(".close-icon").click(function() {
        $(".nav-content-2").removeClass('cart-visible');

    });

    // Date picker
    function datepicker() {
        if ($('#datepicker').length) {
            $('#datepicker').datepicker();
        };
    }



    // Time picker
    function timepicker() {
        if ($('input[name="time"]').length) {
            $('input[name="time"]').ptTimeSelect();
        }
    }





    /*	=========================================================================
    When document is on ready, do
    ========================================================================== */

    jQuery(document).on('ready', function() {
        (function($) {
            // add your functions
            datepicker();
            timepicker();
        })(jQuery);
    });



    /* ==========================================================================
   When document is Scrollig, do
   ========================================================================== */

    $(window).on('scroll', function() {
        headerStyle();
    });



    /* ==========================================================================
   When document is loaded, do
   ========================================================================== */

    $(window).on('load', function() {
        handlePreloader();
        enableMasonry();
    });



})(window.jQuery);