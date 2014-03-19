require.config({

    baseUrl: 'js/lib',

    paths: {
        app: '../app',
        tpl: '../tpl',
	jquery: 'jquery-1.11.0',
	bootstrap: '../../bootstrap/js/bootstrap'
    },

    map: {
        '*': {
            'app/models/employee': 'app/models/memory/employee'
        }
    },

    shim: {
	    'bootstrap': ['jquery'],
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'backbone-forms': {
            deps: ['backbone'],
            exports: 'Forms'
        },
        'underscore': {
            exports: '_'
        } 
    }
});

require(['jquery', 'bootstrap'], function($, Bootstrap){
	$("#loading").modal();


require([ 'backbone',  'app/app', 'app/models/models'], function ( Backbone, AppRouter, models) {

$("#loading").modal("hide");
   
        var App = new AppRouter();

        App.loginState = new models.Login();
        App.Collections.Logs = new models.Logs();
    
        if (!App.loginState.loginStatus) 
        {
            if(window.localStorage.email !== undefined && 
                window.localStorage.password !== undefined &&
                window.localStorage.email !== "" && 
                window.localStorage.password !== "")
            {
                App.authenticate(window.localStorage.email, window.localStorage.password, function (data) 
                    {
                        App.log('Login request details: ' + JSON.stringify(data));
                        if (data.error) 
                        {  // If there is an error, show the error messages
                            App.log('Automatic login error: ' + data.error);
                            App.login();
                        }
                        else 
                        { // If not, send them back to the home page
                            App.loginState.set('loginStatus', true);
                            App.loginState.set('login', data);
                            App.load();
                        }
                    });
            }
            else
            {
                App.login();
            }
        } else {
            App.load();
        } 

});
});