define(function (require) {
    var Backbone    = require('backbone');
    var _           = require('underscore');
    var Template = require('text!tpl/HeaderView.html');

    return Backbone.View.extend({
	template: _.template(Template),
        //    events: {
        //        'click .header .nav li': 'selectMenuItem'
        //    },
        initialize: function (options) {
            this.model=options.model;
            this.App = options.App;
            this.loginState = options.loginState;
            this.listenTo(this.loginState, 'change', this.render);
            //this.listenTo(this.model, 'reset', this.render);
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'add', this.render);
            
            
            var self = this;
            this.App.refreshIntervalId = setInterval(function(){
                $(self.el).find('#syncimage').removeClass("btn-warning");
                for (var i = 0; i < self.App.Collections.Entries.length; i++) {
                    var currentEntity=self.App.Collections.Entries.at(i);
                    
                    
                    if (currentEntity.dynamicCollection === null || currentEntity.dynamicCollection === undefined ) {
                        currentEntity.initializeCollection(self.App);
                    }
                   
                    
                    if(navigator.onLine)
                    {
                        //do auto sync
                    	self.App.sync();
                    }else
                    {
                        if(currentEntity.dynamicCollection.where({isDirty:true}).length>0 ||
                        currentEntity.dynamicCollection.where({lastModified:""}).length>0)
                        {
                            //change color
                             $(self.el).find('#syncimage').addClass("btn-warning");
                        }      
                    }
                }
            }, 600000);
            
            this.render();
        },
    
        render: function () {
            $(this.el).html(this.template());
    
    
            if (this.loginState.get('loginStatus')) {
                $(this.el).find('#btnlogin').html('<a href="#logout" ><i class="glyphicon  glyphicon-off"></i> Logout</a>');
            }else{
                $(this.el).find('#btnlogin').html('<a href="#logout" ><i class="glyphicon  glyphicon-off"></i> Login</a>');
            }
            if (this.loginState.get('loginStatus')) {
                $(this.el).find('#navbar #btnmetadata').remove();
                $(this.el).find('#navbar #btnusers').remove();
                $(this.el).find('#collectionsdd').remove();
                if (this.loginState.get('login') !== null && this.loginState.get('login').isAdmin) {
                $(this.el).find('#navbar').prepend('\
                    <li id="btnmetadata"><a href="#metadata/metadata"><i class="glyphicon  glyphicon-edit"></i> Metadata</a></li>\
                    <li id="btnusers"><a href="#metadata/users"><i class="glyphicon  glyphicon-user"></i> Users</a></li>\
                    <li class="dropdown" id="collectionsdd">\
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">Collections <b class="caret"></b></a>\
                        <ul class="dropdown-menu" id="collections">\
                        </ul>\
                    </li>\
                ');
                }
            }
            
    
             $(this.el).find('#collections').empty();
            _.each(this.model.models, function (value, key, list) {
                $(this.el).find('#collections').append('<li><a href="#metadata/'+value.get('_id')+'">' + value.get('name') + '<a></li>');
            }, this);
            return this;
        },
    
    //    selectMenuItem: function (event) {
    //        $('.header .nav li').removeClass('active');
    //        if (event.currentTarget) {
    //            $(event.currentTarget).addClass('active');
    //        }
    //    }
    
    });
});