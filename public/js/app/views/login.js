define(function (require) {
    var Backbone    = require('backbone');
    var _    = require('underscore');
    var Template = require('text!tpl/LoginView.html');

    return Backbone.View.extend({
        template: _.template(Template),

        initialize: function (options) {
            this.App = options.App;
        },
    
        events: {
            "click #loginButton": "login"
        },
    
        render: function () {
            $(this.el).html(this.template());
            return this;
        },
       
      
        login: function (event) {
            var self = this;
            event.preventDefault(); // Don't let this button submit the form
            $('.alert-error').hide(); // Hide any errors on a new submit
            self.App.authenticate($('#inputEmail').val(), $('#inputPassword').val(), function (data) {
                self.App.log('Login request details: ' + JSON.stringify(data));
                if (data.error) {  // If there is an error, show the error messages
                    $('.alert-danger').text(data.error).show();
                }
                else { // If not, send them back to the home page
                
                    if($('#inputRememberMe').is(':checked') == true)
                    {
                        window.localStorage.email=$('#inputEmail').val();
                        window.localStorage.password=$('#inputPassword').val();
                    }else
                    {
                        localStorage.removeItem('email');
                        localStorage.removeItem('password');
                    }
                
                
                    self.App.loginState.set('loginStatus', true);
                    self.App.loginState.set('login', data);
                    self.App.load();
                }
            });
        }
    });
});