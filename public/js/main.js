require.config({

    baseUrl: 'js/lib',

    paths: {
        app: '../app',
        tpl: '../tpl',
        helper: '../app/helper',
        jquery: 'jquery-1.11.0',
		bootstrap: '../../bootstrap/js/bootstrap',
		polyglot: 'polyglot',
		async: 'async'
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
        },
        'polyglot': {
            exports: 'Polyglot'
        }
    }
});




require([ 'jquery', 'bootstrap', 'backbone',  'app/app', 'app/models/models'], function ($, Bootstrap, Backbone, AppRouter, models) {

	
	
	
	
	 var locale = localStorage.getItem('locale') || navigator.language || navigator.userLanguage || 'en-US';
	  // Gets the language file.
	  $.getJSON('locales/'+locale+'.json',function(data) {
	    // Instantiates polyglot with phrases.
	    window.polyglot = new Polyglot({phrases: data});

		
		
        var App = new AppRouter();
        if(!Backbone.History.started)
        {
            Backbone.history.start();
        }
        window.location.hash='';
        App.loginState = new models.Login();
        App.Collections.Logs = new models.Logs();
    
        if (!App.loginState.loginStatus) 
        {
            if((window.localStorage.email !== undefined && 
                window.localStorage.password !== undefined &&
                window.localStorage.email !== "" && 
                window.localStorage.password !== "") ||(
                		 username!==undefined && username!='<%= username %>' && username!='' &&
                         password!==undefined && password!='<%= password %>' 
                        	 )
               )
            {
            	
            	if(username!==undefined && username!='<%= username %>' && username!='' &&
                        password!==undefined && password!='<%= password %>' ){
            		//autologin
            		myusername=username;
            		mypassword=password;
            	}else{
            		myusername=window.localStorage.email;
            		mypassword=window.localStorage.password;
            	}
            		
            	
            	
                App.authenticate(myusername, mypassword, function (data) 
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
	  }
	  );

});
