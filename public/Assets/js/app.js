var MyApp = (function () {
    function init(uid, mid){
        alert("From app.js, User ID: " + uid + "\nMeeting ID: " + mid);
    }
    
    return {
        _init: function (uid, mid) {
            init(uid, mid);
        },
    };
})();