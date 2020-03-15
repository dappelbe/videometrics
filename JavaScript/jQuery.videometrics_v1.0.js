/** ==================================================================== */

//-- <script src="https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.js" integrity="sha256-ffw+9zwShMev88XNrDgS0hLIuJkDfXhgyLogod77mn8=" crossorigin="anonymous"></script>
//-- <script src="https://player.vimeo.com/api/player.js"></script>

(function($){
    "use strict";
    //-- =============================================================== --//
    //-- Main function for the library                                   --//
    //-- =============================================================== --//
    function VideoMetrics( postURL,
                           delay = 5000,
                           videoclass = "videometrics",
                           type = "vimeo",
                           userIdentifier = "ipaddress",
                           debug = false
    ) {
        //-- =========================================================== --//
        //-- Borrowed from the internet                                  --//
        //-- used to determine what browser we are using                 --//
        //-- =========================================================== --//
        var BrowserDetect = {
            init: function () {
                this.browser = this.searchString(this.dataBrowser) || "Other";
                this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
            },
            searchString: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var dataString = data[i].string;
                    this.versionSearchString = data[i].subString;

                    if (dataString.indexOf(data[i].subString) !== -1) {
                        return data[i].identity;
                    }
                }
            },
            searchVersion: function (dataString) {
                var index = dataString.indexOf(this.versionSearchString);
                if (index === -1) {
                    return;
                }

                var rv = dataString.indexOf("rv:");
                if (this.versionSearchString === "Trident" && rv !== -1) {
                    return parseFloat(dataString.substring(rv + 3));
                } else {
                    return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
                }
            },

            dataBrowser: [
                {string: navigator.userAgent, subString: "Edge", identity: "MS Edge"},
                {string: navigator.userAgent, subString: "MSIE", identity: "Explorer"},
                {string: navigator.userAgent, subString: "Trident", identity: "Explorer"},
                {string: navigator.userAgent, subString: "Firefox", identity: "Firefox"},
                {string: navigator.userAgent, subString: "Opera", identity: "Opera"},
                {string: navigator.userAgent, subString: "OPR", identity: "Opera"},
                {string: navigator.userAgent, subString: "Chrome", identity: "Chrome"},
                {string: navigator.userAgent, subString: "Safari", identity: "Safari"}
            ]
        };
        BrowserDetect.init();
        var pathname = window.location.pathname;
        var client = BrowserDetect.browser + ' ' + BrowserDetect.version;

        if ( debug ) {
            console.log( "================================================" );
            console.log( "VM: postURL        => " + postURL );
            console.log( "VM: delay          => " + delay );
            console.log( "VM: videoclass     => " + videoclass );
            console.log( "VM: type           => " + type );
            console.log( "VM: userIdentifier => " + userIdentifier );
            console.log( "VM: pathname       => " + pathname );
            console.log( "VM: client         => " + client );
            console.log( "================================================" );
        }

        const interval = setInterval(function() {
            $('.' + videoclass).each(function(){
                var identifier = $(this).attr('id');
                var iframe = document.querySelector('#' + identifier);
                var videoId = $(this).data('id');
                var player = null;
                var seconds = 0.0;
                if ( type.toLowerCase() === 'vimeo') {
                    //-- Vimeo
                    try {
                        player = new Vimeo.Player(iframe);
                        seconds = player.getCurrentTime();
                    } catch ( error) {
                        console.error( error );
                    };
                } else if (type.toLowerCase() === 'youtube') {
                    //-- YouTube
                    try {
                        player = new Vimeo.Player(iframe);
                        seconds = player.getCurrentTime();
                    } catch ( error) {
                        console.error( error );
                    };
                } else {
                    //-- HTML 5
                    try {
                        seconds = player.currentTime;
                    } catch ( error) {
                        console.error( error );
                    };
                }

                $.ajax({
                    url: postURL,
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify({
                        video: videoId,
                        identifier: userIdentifier,
                        url: pathname,
                        client: client,
                        watched: seconds,
                    }),
                });

            });

        }, delay);

    }

})(jQuery);