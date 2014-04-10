define(function (require) {
    var Backbone    = require('backbone');
    var _    = require('underscore');
    var Template = require('text!tpl/RegisterView.html');

    return Backbone.View.extend({
        template: _.template(Template),

        initialize: function (options) {
            this.App = options.App;
        },
    
        events: {
        	 "click #loginButton": "login",
            "click #registerButton": "register"
        },
        login: function () {
        	this.App.navigate('login', {trigger: true});
        	return false;
        },
        register: function () {
        	self=this;
        	$.ajax({
        		  type: "POST",
        		  url: '/register',
        		  data: {email:$('#inputEmail').val()},
        		  success: function(){
        			  self.App.navigate('login', {trigger: true});
        			  }
        		});
        	
        	
        	
        	return false;
        },
        render: function () {
            $(this.el).html(this.template());
            return this;
        },

    });
});