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
    });

})(jQuery);