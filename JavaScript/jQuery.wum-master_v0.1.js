//-- =========================================================== --//
//-- Title       : wum-master_v0.1.js                            --//
//-- Version     : 0.1                                           --//
//-- Date        : 19Apr2020                                     --//
//-- Author      : Duncan Appelbe                                --//
//-- E-Mail      : duncan.appelbe@ndorms.ox.ac.uk                --//
//-- ----------------------------------------------------------- --//
//-- Description : Master code for Web Usage Metrics, requires   --//
//--               that the individual libraries for the         --//
//--               different recording mechanisms are in place   --//
//-- History     :                                               --//
//--                                                             --//
//-- =========================================================== --//
(function($){
    $.fn.wum = function( options ) {
        /*-- Options for the function --*/
        let settings = $.extend({
            useAmplitude: true,
            useMatamo:true,
            useServerLogs: true,
            recordPageLoad: true,
            recordAClicks: true,
            recordLeavingPage: true,
            recordIdleTimeOnPage: true,
            whenToReportIdleTime : 10,
            recordVideoActivity: true,
            userID : 0,
            debugMode: false,
        }, options);

        /*-- Add the event handlers --*/
        $("document").ready(function() {
            pageTitle = window.location.pathname;
            var playerArray = Array();

            if ( settings.recordAClicks ) {
                $('a').on("click", function(){
                    let linkID = $(this).attr('id');
                    if (typeof linkID === typeof undefined || linkID === false) {
                        linkID = '';
                    }
                    let linkDestination = $(this).attr('href');
                    if (typeof linkDestination === typeof undefined || linkID === false) {
                        linkDestination = '';
                    }
                    if ( settings.useAmplitude ) {
                        amplitudeSendClickEvent( pageTitle, linkID, linkDestination, settings.userID, settings.debugMode);
                    }
                    if ( settings.useServerLogs ) {
                        serverLogSendClickEvent(pageTitle, linkID, linkDestination, settings.userID, settings.debugMode );
                    }
                });
                if ( settings.useMatamo ) {
                    //-- Link tracking is configured via the dashboard and should
                    //-- be enabled by default
                }
            }
            if ( settings.recordLeavingPage) {
                $(window).on('beforeunload', function(){
                    if ( settings.useAmplitude) {
                        amplitudeSendPageUnload( pageTitle, settings.userID, settings.debugMode);
                    }
                    if ( settings.useServerLogs ) {
                        serverLogSendPageUnload( pageTitle, settings.userID, settings.debugMode);
                    }
                    if ( settings.useMatamo ) {
                        matamoSendPageUnload( pageTitle, settings.userID, settings.debugMode);
                    }
                });
            }
            if ( settings.recordIdleTimeOnPage ) {
                idleTime = 0;
                reportIdleTimeInMinutes = 5;
                idleInterval = setInterval( timerIncrement, 60000);
                $(this).mousemove(function(e) { idleTime = 0; });
                $(this).keypress(function(e) { idleTime = 0; });
            }
            if ( settings.recordVideoActivity ) {
                window.YT.ready(function(){
                    $('.videometrics').each(function (idx, obj) {
                        $(obj).find('iframe').each(function (jdx, vo) {
                            if (~$(vo).attr('src').toLowerCase().indexOf('youtube')) {
                                try {
                                    // add "?enablejsapi=1" to src
                                    var src = $(vo).attr('src');
                                    let newId = $(vo).attr('title');
                                    src += "?enablejsapi=1";
                                    $(vo).attr('src', src)
                                    let id = $(vo).attr('id');
                                    if ( id === null || id === undefined ) {
                                        //-- No ID so lets set the ID to be the title
                                        if ( newId === null || newId === undefined ) {
                                            newId = '';
                                        }
                                        newId = newId.replace(' ', '_') + Date.now();
                                        $(vo).attr('id', newId);
                                    }
                                    id = $(vo).attr('id');
                                    let player = new YT.Player(id, { events: {onStateChange: recordYouTubeActivity} });
                                    let pa = new Array(2);
                                    pa[0] = id;
                                    pa[1] = player;
                                    playerArray.push(pa);
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                        });
                    })
                });
                $('.videometrics').each(function (idx, obj) {
                    $(obj).find('iframe').each(function (jdx, vo) {
                        if (~$(vo).attr('src').toLowerCase().indexOf('vimeo')) {
                            let player = new Vimeo.Player($(vo)[0]);
                            player.on('play', function(){
                                if ( settings.useServerLogs ) {
                                    let id
                                    serverLogSendVideoWatched( window.location.pathname, id, watched + ' - ' + time + 's', settings.userID, settings.debugMode);
                                }
                            })
                        }
                    })
                })
            }
        });

        function timerIncrement() {
            idleTime++;
            if ( settings.useAmplitude ) {
                amplitudeSendPageIdleTime( pageTitle, idleTime, settings.whenToReportIdleTime, settings.userID, settings.debugMode);
            }
            if ( settings.useServerLogs ) {
                serverLogSendPageIdleTime( pageTitle, idleTime, settings.whenToReportIdleTime, settings.userID, settings.debugMode);
            }
            if ( settings.useMatamo ) {
                matamoSendPageIdleTime( pageTitle, idleTime, settings.whenToReportIdleTime, settings.userID, settings.debugMode);
            }
        }

        /*-- PRIVATE START ServerLog Functions --*/
        function serverLogSendClickEvent( pageTitle = 'Not Set',
                                          linkID = '',
                                          linkDestination = '',
                                          userid = 0,
                                          debug = false) {

            if ( debug ) {
                console.log( "================================================" );
                console.log( "WUMSL: pageTitle         => " + pageTitle );
                console.log( "WUMSL: linkID            => " + linkID );
                console.log( "WUMSL: linkDestination   => " + linkDestination );
                console.log( "WUMSL: UserID            => " + userid );
                console.log( "================================================" );
            }

            try {

                //-- Get the current URL
                let loc = window.location.href;
                //-- check to see if we have a parameter already
                if ( loc.indexOf("?") > 0 ) {
                    loc = loc.concat('&ClickedOnLinkId=');
                } else {
                    loc = loc.concat('?UserID=').concat(userid);
                    loc = loc.concat('&ClickedOnLinkId=');
                }
                loc = loc.concat( linkID );
                loc = loc.concat( "&ClickedOnLinkHref=").concat( linkDestination );

                $.get(loc);
                if ( debug ) {
                    console.log( "================================================" );
                    console.log( "== WUMSL: link-clicked event sent => " + loc );
                    console.log( "================================================" );
                }
            } catch ( err ) {
                console.error( "WUMAMP -> " + err.message);
            }
        }

        function serverLogSendPageUnload(pageTitle = 'Not Set',
                                         userid = 0,
                                         debug = false) {
            //-- Get the current URL
            let loc = window.location.href;
            //-- check to see if we have a parameter already
            if ( loc.indexOf("?") > 0 ) {
                loc = loc.concat('&LeftPageAt=')
            } else {
                loc = loc.concat('?UserID=').concat(userid);
                loc = loc.concat('&LeftPageAt=')
            }
            //-- Get the current date and time
            let callTime = new Date();
            let callTimeToString = callTime.getFullYear()
                + '-'
                + callTime.getMonth() + 1
                + '-'
                + callTime.getDate()
                + 'T'
                + callTime.getHours()
                + ':'
                + callTime.getMinutes()
                + ':'
                + callTime.getSeconds();
            loc = loc.concat(callTimeToString);
            if ( debug ) {
                console.log( "================================================" );
                console.log( "WUMSL: pageTitle  => " + pageTitle );
                console.log( "WUMSL: calling    => " + loc );
                console.log( "================================================" );
            }
            try {
                $.get(loc);
                if (debug) {
                    console.log("================================================");
                    console.log("WUMSL: called page");
                    console.log("================================================");
                }
            } catch (err) {
                console.error("WUMSL -> " + err.message);
            }

        }

        function serverLogSendPageIdleTime( pageTitle = 'Not Set',
                                            howLongSinceInactive = 0,
                                            reportWhenInactiveFor = 10,
                                            userid = 0,
                                            debug = false) {
            let callTime = new Date();
            let callTimeToString = callTime.getFullYear()
                + '-'
                + callTime.getMonth() + 1
                + '-'
                + callTime.getDate()
                + ' '
                + callTime.getHours()
                + ':'
                + callTime.getMinutes()
                + ':'
                + callTime.getSeconds();

            //-- Get the current URL
            let loc = window.location.href;
            //-- check to see if we have a parameter already
            if ( loc.indexOf("?") > 0 ) {
                loc = loc.concat('&IdlePageForMins=')
            } else {
                loc = loc.concat('?UserID=').concat(userid);
                loc = loc.concat('&IdlePageForMins=')
            }
            loc = loc.concat(howLongSinceInactive);

            if ( debug ) {
                console.log( "================================================" );
                console.log( "WUMSL: pageTitle                => " + pageTitle );
                console.log( "WUMSL: inactiveTime event       => Called at " +  callTimeToString );
                console.log( "WUMSL: Inactive for             => " + howLongSinceInactive + ' minutes');
                console.log( "WUMSL: Will trigger event after => " + reportWhenInactiveFor + ' minutes');
                console.log( "================================================" );
            }

            if ( howLongSinceInactive >= reportWhenInactiveFor ) {
                try {
                    $.get(loc);
                    if (debug) {
                        console.log("================================================");
                        console.log("== WUMSl: inactiveTime event sent");
                        console.log("== WUMSL: pageTitle                => " + pageTitle);
                        console.log("== WUMSL: inactiveTime event       => Called at " + callTimeToString);
                        console.log("== WUMSL: Inactive for             => " + howLongSinceInactive + ' minutes');
                        console.log("== WUMSL: URL Called               => " + loc );
                        console.log("================================================");
                    }
                } catch (err) {
                    console.error("WUMSL -> " + err.message);
                }
            }
        }

        function serverLogSendVideoWatched( pageTitle = 'Not Set',
                                            videoID = "No video id set",
                                            watched = "0%",
                                            userid = 0,
                                            debug = false) {
            //-- Get the current URL
            let loc = window.location.href;
            //-- check to see if we have a parameter already
            if ( loc.indexOf("?") > 0 ) {
                loc = loc.concat('&VideoIdWatched=')
            } else {
                loc = loc.concat('?UserID=').concat(userid);
                loc = loc.concat('&VideoIdWatched=')
            }
            loc = loc.concat(videoID);
            loc = loc.concat('&VideoWatchedAmmount=');
            loc = loc.concat(watched);
            loc = loc.concat('&VideoWatchedCalledAt=');
            //-- Get the current date and time
            let callTime = new Date();
            let callTimeToString = callTime.getFullYear()
                + '-'
                + callTime.getMonth() + 1
                + '-'
                + callTime.getDate()
                + 'T'
                + callTime.getHours()
                + ':'
                + callTime.getMinutes()
                + ':'
                + callTime.getSeconds();
            loc = loc.concat(callTimeToString);

            if ( debug ) {
                console.log( "================================================" );
                console.log( "WUMSL: pageTitle  => " + pageTitle );
                console.log( "WUMSL: calling    => " + loc );
                console.log( "================================================" );
            }
            try {
                $.get(loc);
                if (debug) {
                    console.log("================================================");
                    console.log("WUMSL: called page");
                    console.log("================================================");
                }
            } catch (err) {
                console.error("WUMSL -> " + err.message);
            }

        }
        /*-- PRIVATE END Sever Log Functions --*/

        /*-- PRIVATE START Amplitude Functions --*/
        function amplitudeSendClickEvent( pageTitle = 'Not Set',
            linkID = '',
            linkDestination = '',
            userid = 0,
            debug = false) {

            if ( debug ) {
                console.log( "================================================" );
                console.log( "WUMAMP: pageTitle         => " + pageTitle );
                console.log( "WUMAMP: linkID            => " + linkID );
                console.log( "WUMAMP: linkDestination   => " + linkDestination );
                console.log( "================================================" );
            }

            let clickProperties = {
                'pageTitle' : pageTitle,
                'linkID' : linkID,
                'linkDestination' : linkDestination,
                'user_id' : userid
            };

            try {
                amplitude.getInstance().logEvent('link-clicked', clickProperties);
                if ( debug ) {
                    console.log( "================================================" );
                    console.log( "== WUMAMP: link-clicked event sent            ==" );
                    console.log( "================================================" );
                }
            } catch ( err ) {
                console.error( "WUMAMP -> " + err.message);
            }
        }

        function amplitudeSendPageUnload( pageTitle = 'Not Set',
                                          userid = 0,
                                          debug = false) {
            let callTime = new Date();
            let callTimeToString = callTime.getFullYear()
                + '-'
                + callTime.getMonth() + 1
                + '-'
                + callTime.getDate()
                + ' '
                + callTime.getHours()
                + ':'
                + callTime.getMinutes()
                + ':'
                + callTime.getSeconds();
            if ( debug ) {
                console.log( "================================================" );
                console.log( "WUMAMP: pageTitle         => " + pageTitle );
                console.log( "WUMAMP: unloadPage event  => Called at " +  callTimeToString );
                console.log( "================================================" );
            }

            let pageProperties = {
                'pageTitle'  : pageTitle,
                'unloadTime' : callTimeToString,
                'user_id' : userid
            };

            try {
                amplitude.getInstance().logEvent('leavingPage', pageProperties);
                if ( debug ) {
                    console.log( "================================================" );
                    console.log( "== WUMAMP: leavingPage event sent             ==" );
                    console.log( "================================================" );
                }
            } catch ( err ) {
                console.error( "WUMAMP -> " + err.message);
            }
        }

        function amplitudeSendPageIdleTime( pageTitle = 'Not Set',
                                            howLongSinceInactive = 0,
                                            reportWhenInactiveFor = 10,
                                            userid = 0,
                                            debug = false) {
            let callTime = new Date();
            let callTimeToString = callTime.getFullYear()
                + '-'
                + callTime.getMonth() + 1
                + '-'
                + callTime.getDate()
                + ' '
                + callTime.getHours()
                + ':'
                + callTime.getMinutes()
                + ':'
                + callTime.getSeconds();
            if ( debug ) {
                console.log( "================================================" );
                console.log( "WUMAMP: pageTitle                => " + pageTitle );
                console.log( "WUMAMP: inactiveTime event       => Called at " +  callTimeToString );
                console.log( "WUMAMP: Inactive for             => " + howLongSinceInactive + ' minutes');
                console.log( "WUMAMP: Will trigger event after => " + reportWhenInactiveFor + ' minutes');
                console.log( "================================================" );
            }

            let pageProperties = {
                'pageTitle'  : pageTitle,
                'unloadTime' : callTimeToString,
                'inactiveTime (mins)' : howLongSinceInactive,
                'user_id' : userid,
            };

            if ( howLongSinceInactive >= reportWhenInactiveFor ) {
                try {
                    amplitude.getInstance().logEvent('inactiveTime', pageProperties);
                    if (debug) {
                        console.log("================================================");
                        console.log("== WUMAMP: inaciveTime event sent");
                        console.log("== WUMAMP: pageTitle                => " + pageTitle);
                        console.log("== WUMAMP: inactiveTime event       => Called at " + callTimeToString);
                        console.log("== WUMAMP: Inactive for             => " + howLongSinceInactive + ' minutes');
                        console.log("================================================");
                    }
                } catch (err) {
                    console.error("WUMAMP -> " + err.message);
                }
            }
        }

        function amplitudeSendVideoWatched( pageTitle = 'Not Set',
                                            videoID = "No video id set",
                                            watched = "0%",
                                            userid = 0,
                                            debug = false) {
            let callTime = new Date();
            let callTimeToString = callTime.getFullYear()
                + '-'
                + callTime.getMonth() + 1
                + '-'
                + callTime.getDate()
                + ' '
                + callTime.getHours()
                + ':'
                + callTime.getMinutes()
                + ':'
                + callTime.getSeconds();
            if ( debug ) {
                console.log( "================================================" );
                console.log( "WUMAMP: pageTitle            => " + pageTitle );
                console.log( "WUMAMP: Video ID             => " + videoID );
                console.log( "WUMAMP: Watched              => " + watched );
                console.log( "WUMAMP: Watched video event  => Called at " +  callTimeToString );
                console.log( "================================================" );
            }

            let pageProperties = {
                'pageTitle'  : pageTitle,
                'videoID' : videoID,
                'videoWatched' : watched,
                'calledAt' : callTimeToString,
                'user_id' : userid
            };

            try {
                amplitude.getInstance().logEvent('watchedVideo', pageProperties);
                if ( debug ) {
                    console.log( "================================================" );
                    console.log( "== WUMAMP: Watched video event sent           ==" );
                    console.log( "================================================" );
                }
            } catch ( err ) {
                console.error( "WUMAMP -> " + err.message);
            }
        }

        /*-- PRIVATE END Amplitude Functions   --*/

        /*-- PRIVATE Start Matamo Functions    --*/
        function matamoSendPageUnload(pageTitle = 'Not Set',
                                      userid = 0,
                                         debug = false) {
            let callTime = new Date();
            let callTimeToString = callTime.getFullYear()
                + '-'
                + callTime.getMonth() + 1
                + '-'
                + callTime.getDate()
                + ' '
                + callTime.getHours()
                + ':'
                + callTime.getMinutes()
                + ':'
                + callTime.getSeconds();

            //-- Get the current URL
            if ( debug ) {
                console.log( "================================================" );
                console.log( "WUMMAT: pageTitle  => " + pageTitle );
                console.log( "================================================" );
            }
            try {
                _paq.push(['trackEvent', 'PageUnload', pageTitle, callTimeToString]);
                if (debug) {
                    console.log("================================================");
                    console.log("WUMMAT: called page");
                    console.log("================================================");
                }
            } catch (err) {
                console.error("WUMMAT -> " + err.message);
            }

        }

        function matamoSendPageIdleTime( pageTitle = 'Not Set',
                                            howLongSinceInactive = 0,
                                            reportWhenInactiveFor = 10,
                                         userid = 0,
                                            debug = false) {
            let callTime = new Date();
            let callTimeToString = callTime.getFullYear()
                + '-'
                + callTime.getMonth() + 1
                + '-'
                + callTime.getDate()
                + ' '
                + callTime.getHours()
                + ':'
                + callTime.getMinutes()
                + ':'
                + callTime.getSeconds();
            if ( debug ) {
                console.log( "================================================" );
                console.log( "WUMMAT: pageTitle                => " + pageTitle );
                console.log( "WUMMAT: inactiveTime event       => Called at " +  callTimeToString );
                console.log( "WUMMAT: Inactive for             => " + howLongSinceInactive + ' minutes');
                console.log( "WUMMAT: Will trigger event after => " + reportWhenInactiveFor + ' minutes');
                console.log( "================================================" );
            }


            if ( howLongSinceInactive >= reportWhenInactiveFor ) {
                try {
                    _paq.push(['trackEvent', 'PageIdleInMins', pageTitle, howLongSinceInactive]);
                    if (debug) {
                        console.log("================================================");
                        console.log("== WUMMAT: inaciveTime event sent");
                        console.log("== WUMMAT: pageTitle                => " + pageTitle);
                        console.log("== WUMMAT: inactiveTime event       => Called at " + callTimeToString);
                        console.log("== WUMMAT: Inactive for             => " + howLongSinceInactive + ' minutes');
                        console.log("================================================");
                    }
                } catch (err) {
                    console.error("WUMMAT -> " + err.message);
                }
            }
        }

        function matamoSendVideoWatched(pageTitle = 'Not Set',
                                        videoID = "No video id set",
                                        watched = "0%",
                                        userid = 0,
                                        debug = false) {
            let callTime = new Date();
            let callTimeToString = callTime.getFullYear()
                + '-'
                + callTime.getMonth() + 1
                + '-'
                + callTime.getDate()
                + ' '
                + callTime.getHours()
                + ':'
                + callTime.getMinutes()
                + ':'
                + callTime.getSeconds();

            //-- Get the current URL
            if ( debug ) {
                console.log( "================================================" );
                console.log( "WUMMAT: pageTitle            => " + pageTitle );
                console.log( "WUMMAT: Video ID             => " + videoID );
                console.log( "WUMMAT: Watched              => " + watched );
                console.log( "WUMMAT: Watched video event  => Called at " +  callTimeToString );
                console.log( "================================================" );
            }
            try {
                _paq.push(['trackEvent', 'watchedVideo', 'PageTitle', pageTitle]);
                _paq.push(['trackEvent', 'watchedVideo', 'CallTime', callTimeToString]);
                _paq.push(['trackEvent', 'watchedVideo', 'VideoID', videoID]);
                _paq.push(['trackEvent', 'watchedVideo', 'VideoWatched', watched]);
                if (debug) {
                    console.log("================================================");
                    console.log("WUMMAT: called watchedVideo");
                    console.log("================================================");
                }
            } catch (err) {
                console.error("WUMMAT -> " + err.message);
            }

        }

        /*-- PRIVATE End Matamo Functions    --*/

        /*-- Private start video recording activity --*/
        function recordYouTubeActivity() {
            $.each( playerArray, function(index,value){
                let id = this[0];
                // get video state, 5 if havent played, 0 if finished
                let state = this[1].getPlayerState();
                let hasStarted = (state == -1 || state == 5) ? false : true;
                let hasfinished = (state == 0) ? true : false;

                let  watched = '';
                let  time = '0';
                // if they havent presed play
                if (!hasStarted) {
                    watched = "0%"
                }
                // if they've finished watching
                else if (hasfinished) {
                    watched = "100%"
                }
                else {
                    //get time they've watched
                    time = this[1].getCurrentTime();
                    // get length of video
                    let length = this[1].getDuration()
                    // calculate percentage watched
                    let percentWatched = (time / length) * 100;
                    watched = percentWatched.toFixed(1) + "%";
                }
                if ( settings.useServerLogs ) {
                    serverLogSendVideoWatched( window.location.pathname, id, watched + ' - ' + time + 's', settings.userID, settings.debugMode);
                }
                if ( settings.useAmplitude ) {
                    amplitudeSendVideoWatched( window.location.pathname, id, watched + ' - ' + time + 's', settings.userID, settings.debugMode);
                }
                if ( settings.useMatamo ) {
                    matamoSendVideoWatched( window.location.pathname, id, watched + ' - ' + time + 's', settings.userID, settings.debugMode);
                }
            });
        }


    return this;
    };



})(jQuery);
