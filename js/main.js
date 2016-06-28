$(function() {
    $('.closeme').on('click', function() {
        $('.popup').addClass('hidden');
    });

    $(document).on('keyup', function (e) {
        if (e.keyCode == 27) {
            $('.popup').addClass('hidden');
        }
    });

    $('#submitemail').on('click', function(e) {
        e.preventDefault();
        $(this).text('Shranjujemo ...');
        $.post('https://sheetsu.com/apis/v1.0/f41cf979', {
            'email': $('#emailinput').val(),
            'checkbox': $('#newslettercheckbox').is(':checked')
        }, function(r) {
            $('.popup').addClass('hidden');
            startConfetti();
        })
    });

    // https://davidwalsh.name/javascript-debounce-function
    function debounce(func, wait) {
        wait = wait || 100;
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // skicky header
    function stickToTop() {
        var windowTop = $(window).scrollTop();
        var sticky = $("#sticky");
        var stickyAnchor = $("#sticky-anchor");
        var divTop = stickyAnchor.offset().top;
        if (windowTop > divTop) {
            var stickyHeight = sticky.outerHeight(true);
            var gridContainer = $(".grid-container");
            var gridOffset = gridContainer.offset();
            var gridHeight = gridContainer.outerHeight(true);
            sticky.addClass("stick");
            stickyAnchor.height(stickyHeight);
            if (windowTop > gridOffset.top + gridHeight) {
                sticky.css("top", stickyHeight * -1);
            } else {
                sticky.css("top", 0);
            }
        } else {
            sticky.removeClass("stick");
            stickyAnchor.height(0);
        }
    }

    $(window).on("scroll", stickToTop);
    $(window).on("resize", debounce(stickToTop));
    stickToTop();

    // panel med elementi
    var $currentTarget;

    function getLastElementInRow($element) {
        var offset = $element.offset();
        var $last = $element;
        while (true) {
            var $next = $last.next();
            if (!$next.length || $next.offset().top !== offset.top) {
                break;
            }
            $last = $next;
        }
        return $last;
    }

    function fixArrowPosition($panel, $element) {
        var $arrow = $panel.find("#info-arrow");
        var offsetPanel = $panel.offset();
        var offsetParent = $element.parent().offset();
        var elementWidth = $element.outerWidth();
        $arrow.css({
            left: (offsetParent.left - offsetPanel.left - 10 + (elementWidth / 2))
        });
    }

    function repositionInfoPanel(event) {
        if ($currentTarget && $currentTarget.length) {
            var $panel = $("#info-container");
            $panel.detach();
            var $appendAfter = getLastElementInRow($currentTarget.parent());
            $appendAfter.after($panel);

            fixArrowPosition($panel, $currentTarget);
        }
    }

    var numberOfHatsClicked = 0;

    function showInfoPanel(event) {
        var $element = $(event.currentTarget);
        if ($element.is($currentTarget)) {
            return;
        }
        $currentTarget = $element;
        var $appendAfter = getLastElementInRow($element.parent());

        var $panel = $("#info-container");
        var $tempSpacer = $panel.clone();
        $tempSpacer.attr("id", "info-container-temp");
        var $oldPanel = $panel.replaceWith($tempSpacer);
        var tempSpacerHeight = $tempSpacer.is(":visible") ? $tempSpacer.outerHeight() : 0;
        //$tempSpacer.attr("style", "");
        $tempSpacer.slideUp(function() {
            $tempSpacer.remove();
        });

        var $oldPanelPanel = $oldPanel.find("#info-panel");
        $oldPanelPanel.attr("style", "");
        $oldPanelPanel.hide();
        $oldPanel.show();
        $oldPanel.find("h3").html($element.data("heading") || "ERROR");
        $oldPanel.find("p").html($element.data("text") || "No text!");
        $appendAfter.after($oldPanel);
        $oldPanelPanel.slideDown(function() {
            if(!$element.hasClass("clicked")) {
                $element.addClass("clicked");
                var $cap = $element.find(".cap-container");
                var capOffset = $cap.offset();
                var width = $cap.outerWidth();
                var height = $cap.outerHeight();
                $cap.appendTo($("body"));
                $cap.css({top: capOffset.top, left: capOffset.left, width: width, height: height});
                var $count = $(".header-klobuki span")
                $cap.animate({top: 25 + $(window).scrollTop(), left: $count.offset().left - 100, opacity: 0}, function() {
                    $cap.remove();
                    numberOfHatsClicked++;
                    $count.text(numberOfHatsClicked);
                    $(".header-klobuki .caps").append('<div class="small-cap"><svg class="cap-icon"><use xlink:href="#cap-icon"></use></svg></div>');
                    $(".bar-header .header-desc").addClass("hidden-xs");
                });
            }
        });

        fixArrowPosition($oldPanel, $element);

        var elementOffset = $element.offset();
        var scrollHeight = elementOffset.top - $("#sticky").outerHeight() - 30;
        if (elementOffset.top > $tempSpacer.offset().top) {
            scrollHeight -= tempSpacerHeight;
        }
        $("html, body").animate({ scrollTop: scrollHeight });
    }

    $(".cap-link").on("click", showInfoPanel);
    $(window).on("resize", debounce(repositionInfoPanel));

    // countdown
    countdown.setLabels('ms|s|min|h', 'ms|s|min|h', ', ', ', ');
    var date = new Date(Date.UTC(2016, 5, 28, 12, 0));
    if (date.getTime() > Date.now()) {
        countdown(function(ts) {
            $("#countdown").html(ts.toHTML());
        }, date, countdown.HOURS|countdown.MINUTES|countdown.SECONDS);
    } else {
        $("#countdown-container").text("Seja je že mimo!");
    }

    // forma
    var prejemniki = "Monika.Mandic@dz-rs.si, Bozo.Predalic@dz-rs.si, ksenija.vencelj@dz-rs.si, miroslav.pretnar@dz-rs.si, matej.kolenc@dz-rs.si, terezija.trupi@dz-rs.si, sanja.ajanovic@dz-rs.si, petra.jamnik@dz-rs.si, danica.polak@dz-rs.si";

    $("#message-form").on("submit", function(event) {
        event.preventDefault();
        $.get('http://knedl.si/djnd/add/mail', function(r) {
            var a = 'mailto:' + prejemniki + '?subject=ŠOU ZAKONODAJA&body=' + encodeURIComponent(document.getElementById('form-content').value);
            document.location.href = a;
        })
    });

    $("#ze-poslanih-number").load("http://knedl.si/djnd/counter/mail");

    // share/socials
    $(".share-container input").on("focus", function() {
        $(this).select();
    });

    var shareText = "Vlada RS podpira študentsko mafijo, jaz je ne! Podpiram spremembe ZSKUS, ki bodo korupciji Študentske organizacije naredili konec.";
    $(".icon-facebook").on("click", function() {
        var a = "https://www.facebook.com/dialog/share?app_id=301375193309601&display=popup&href=" + encodeURIComponent(document.location.href) + "&redirect_uri=" + encodeURIComponent(document.location.href) + "&ref=responsive";
        return window.open(a, "_blank"),
        !1
    });
    $(".icon-twitter").on("click", function() {
        var a = "https://twitter.com/intent/tweet?text=" + encodeURIComponent("@vladaRS podpira študentsko mafijo, jaz je ne! Podpiram spremembe #ZSKUS, ki bodo korupciji @studentska_org naredili konec. " + document.location.href);
        return window.open(a, "_blank"),
        !1
    });
    $(".icon-mail").on("click", function() {
        var a = "mailto:?subject=ŠOU ZAKONODAJA&body=" + shareText + " " + document.location.href;
        document.location.href = a,
        !1
    });
});

// confetti
// Modified from https://code.google.com/p/pamelafox-samplecode/ (r343).
// The original code is under the Apache 2.0 license.
// http://opensource.org/licenses/Apache-2.0

var CONFETTIS_PER_SHAKE = 80;
var MAX_CONFETTIS = 81;

function startConfetti() {
    if (window.currentConfettis >= MAX_CONFETTIS)
        return;

    var confettiElements = [];
    for (var i = 0; i < CONFETTIS_PER_SHAKE; i++) {
        var confettiElement = makeConfetti(!i);
        document.body.appendChild(confettiElement);
        confettiElements[i] = confettiElement;
    }
    window.currentConfettis += CONFETTIS_PER_SHAKE;
    setTimeout(removeConfettis, 12 * 1000, confettiElements);
}

function removeConfettis(confettiElements) {
    window.currentConfettis -= CONFETTIS_PER_SHAKE;

    for (var i = 0; i < CONFETTIS_PER_SHAKE; ++i) {
        document.body.removeChild(confettiElements[i]);
    }
    confettiElements = 0;
}

/*
  Receives the lowest and highest values of a range and
  returns a random integer that falls within that range.
*/
function randomInteger(low, high) {
    return low + Math.floor(Math.random() * (high - low + 1));
}

/*
   Receives the lowest and highest values of a range and
   returns a random float that falls within that range.
*/
function randomFloat(low, high) {
    return low + Math.random() * (high - low);
}

function randomItem(items) {
    return items[randomInteger(0, items.length - 1)]
}

/* Returns a duration value for the falling animation.*/
function durationValue(value) {
    return value + 's';
}

function makeConfetti(is_first) {
    var confettis = ['2726', '2736', '2665', '25CF', '25AA', '25B4', '2605'];
    var colors = ['#ccac55', '#e4d2a3', '#467871', '#704a45', '#1d7373', '#c2d8d8', '#6ba8a0', '#e3c3bf', '#704a45', '#dd786b', '#ccac55'];
    var sizes = ['tiny', 'tiny', 'small', 'small', 'small', 'small', 'medium', 'medium', 'medium', 'medium', 'medium', 'medium', 'medium', 'medium'];

    /* Start by creating a wrapper div, and an empty span  */
    var confettiElement = document.createElement('div');
    confettiElement.className = 'confetti ' + randomItem(sizes);

    var confetti = document.createElement('span');
    confetti.innerHTML = '&#x' + randomItem(confettis) + ';';
    confetti.style.color = randomItem(colors);

    confettiElement.appendChild(confetti);

    /* Randomly choose a side to anchor to, keeps the middle more dense and fits liquid layout */
    var anchorSide = (Math.random() < 0.5) ? 'left' : 'right';

    /* Figure out a random duration for the fade and drop animations */
    var fadeAndDropDuration = durationValue(randomFloat(1, 4));

    // how long to wait before the confettis arrive
    var confettiDelay = is_first ? 0 : durationValue(0);

    confettiElement.style.webkitAnimationName = 'fade, drop';
    confettiElement.style.webkitAnimationDuration = fadeAndDropDuration + ',' + fadeAndDropDuration;
    confettiElement.style.webkitAnimationDelay = confettiDelay;

    /* Position the confetti at a random location along the screen, anchored to either the left or the right*/
    confettiElement.style[anchorSide] = randomInteger(5, 80) + '%';

    var jitterNames = ['jitterA', 'jitterB', 'jitterC', 'jitterD'];
    var spinAnimationName = randomItem(jitterNames);
    var spinDuration = durationValue(randomFloat(2, 4));

    confetti.style.webkitAnimationName = spinAnimationName;
    confetti.style.webkitAnimationDuration = spinDuration;
    confetti.style.webkitAnimationDelay = confettiDelay + 2;

    /* Return this confetti element so it can be added to the document */
    return confettiElement;
}
window.currentConfettis = 0;
