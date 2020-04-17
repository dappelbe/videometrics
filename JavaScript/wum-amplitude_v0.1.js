//-- =========================================================== --//
//-- Title       : wum-amplitude_v1.0.js                         --//
//-- Version     : 0.1                                           --//
//-- Date        : 15Mar2020                                     --//
//-- Author      : Duncan Appelbe                                --//
//-- E-Mail      : duncan.appelbe'ndorms.ox.ac.uk                --//
//-- ----------------------------------------------------------- --//
//-- Description : A library used to send events to amplitude    --//
//--               the amplitude library must be enabled         --//
//--               The following calls are enabled               --//
//--                                                             --//
//--  Clinks on links (a tags)                                   --//
//--                                                             --//
//-- =========================================================== --//
(function( $ ) {
    'use strict';

    $("document").ready(function(){
        //-- ==================================================== --//
        //-- Setup the Click event on A tags                      --//
        //-- ==================================================== --//
        $('a').on("click", function(){
            let pageTitle =  window.location.pathname;
            let linkID = $(this).attr('id');
            if (typeof linkID === typeof undefined || linkID === false) {
                linkID = '';
            }
            let linkDestination = $(this).attr('href');
            if (typeof linkDestination === typeof undefined || linkID === false) {
                linkDestination = '';
            }
            wumAmpSendClickEvent( pageTitle, linkID, linkDestination, true);
        });

        //-- ==================================================== --//
        //-- Page unload event                                    --//
        //-- ==================================================== --//
        $(window).on('beforeunload', function(){
            let pageTitle =  window.location.pathname;
            wumAmpSendPageUnload( pageTitle, true);
        });

        //-- ===================================================== --//
        //-- The function that we will use to send data           --//
        //-- pageTitle:      This is the name of the page that    --//
        //--                 the link is found on                 --//
        //-- linkID:         This is the ID of the <a> tag        --//
        //-- linkDestination:This is the value of the href attr   --//
        //-- debug:          If true will print debug information --//
        //-- ==================================================== --//
        function wumAmpSendClickEvent( pageTitle = 'Not Set',
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

        //-- ===================================================== --//
        //-- The function that we will use to send data           --//
        //-- pageTitle:      This is the name of the page that    --//
        //--                 the the user has visited             --//
        //-- debug:          If true will print debug information --//
        //-- ==================================================== --//
        function wumAmpSendPageUnload( pageTitle = 'Not Set',
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




    });

})(jQuery);