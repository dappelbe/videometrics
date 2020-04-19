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
            amplitudeObject : amplitude,
            useAmplitude: true,
            useMatamo:false,
            useServerLogs: false,
            recordAClicks: true,
            recordLeavingPage: true,
            recordIdleTimeOnPage: true,
            debugMode: false,
        }, options);

        /*-- Add the event handlers --*/
        $("document").ready(function() {
            pageTitle = window.location.pathname;

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
                        amplitudeSendClickEvent( pageTitle, linkID, linkDestination, settings.debugMode);
                    }
                });
            }

            if ( settings.recordLeavingPage) {
                $(window).on('beforeunload', function(){
                    if ( settings.useAmplitude) {
                        amplitudeSendPageUnload( pageTitle, settings.debugMode);
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

        });

        function timerIncrement() {
            idleTime++;
            if ( settings.useAmplitude ) {
                amplitudeSendPageIdleTime( pageTitle, idleTime, settings.debugMode);
            }
        }

        /*-- PRIVATE START Amplitude Functions --*/
        function amplitudeSendClickEvent( pageTitle = 'Not Set',
            linkID = '',
            linkDestination = '',
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
                'linkDestination' : linkDestination
            };

            try {
                settings.amplitudeObject.getInstance().logEvent('link-clicked', clickProperties);
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
                                          debug = false) {
            let callTime = new Date();
            let callTimeToString = callTime.getFullYear()
                + '-'
                + callTime.getMonth()
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
                'unloadTime' : callTimeToString
            };

            try {
                settings.amplitudeObject.getInstance().logEvent('leavingPage', pageProperties);
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
                                            debug = false) {
            let callTime = new Date();
            let callTimeToString = callTime.getFullYear()
                + '-'
                + callTime.getMonth()
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
            };

            if ( howLongSinceInactive >= reportWhenInactiveFor ) {
                try {
                    settings.amplitudeObject.getInstance().logEvent('inactiveTime', pageProperties);
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
        /*-- PRIVATE END Amplitude Functions   --*/
    return this;
    };
})(jQuery);
