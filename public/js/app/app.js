define([ 'jquery', 'backbone', 'polyglot', 'app/views/app', 'app/views/header', 'app/views/map', 'app/views/table', 'app/views/entry', 'app/views/log', 'app/views/login', 'app/views/register', 'app/models/models', 'backbone.basicauth'],
		function ($, Backbone, Polyglot, AppView, HeaderView, MapView, TableView, EntryView, LogView, LoginView, RegisterView, Models, Basicauth ) {



    return Backbone.Router.extend({
    
        routes: {
  //              "entries/reset"                     : "reset",
                "entries/sync"                      : "sync",
    
                "metadata/:collection/map"        : "map",
                "metadata/:collection/table"        : "table",
                "metadata/:collection/add"          : "addEntry",
                "metadata/:collection/:id"          : "editEntry",
                "metadata/:collection"              : "changeEntity",
                "register"                             : "register",
                "login"                             : "login",
                "logout"                             : "logout"
    
        },
        login: function() {
            $('#app').html(new LoginView({App: this}).render().el);
        },
        register: function() {
            $('#app').html(new RegisterView({App: this}).render().el);
        },
        logout: function() {

		$.ajax({
			url: '/logout',
			type: 'GET',
			context: this,
			headers: Backbone.BasicAuth.getHeader({
		    		username: this.loginState.get('login').username,
    				password: this.loginState.get('login').password
    			}),
			success: function (data) {
			
				clearInterval(this.refreshIntervalId);
				localStorage.removeItem('email');
				localStorage.removeItem('password');
            			this.loginState.set('loginStatus', false);
         			this.loginState.set('login', null);
         			 this.navigate('login', {trigger: true});
         			Backbone.history.stop();
			}
		});

            
        },
        authenticate: function (email, password, success) {
            var self=this;    
            var url = '/login';
            self.log('Loggin in... ');
            var formValues = {
                email: email,
                password: password
            };
    
            $.ajax({
                url: url,
                type: 'POST',
                dataType: "json",
                data: formValues,
                context: this,
                success: function (data) {
                    if(success){
                        success(data);
                    }
                }
            });
        },
        changeEntity:function(id)
        {
            var currentEntityCollection;
            if (id == "metadata") {
                currentEntityCollection = this.Collections.Entries;
            } else {
                if (id == "users") {
                    currentEntityCollection = this.Collections.Users;
                } else {
                    var currentEntity = this.Collections.Entries.get(id);
                    if (currentEntity.dynamicCollection === null || currentEntity.dynamicCollection === undefined ) {
                        currentEntity.initializeCollection(this);
                    }
                    currentEntityCollection = currentEntity.dynamicCollection;
                }
            }
            this.currentEntityCollection = currentEntityCollection;
            this.currentCollection = id;
            if (this.Views.appView.changeModel(id)) {
                this.showPleaseWait();
                this.currentEntityCollection.fetch({
                    App: this,
                    success: function (model, resp, options) {
                        var App=options.App;
                        App.Views.tableView.changeModel(currentEntityCollection);
                        App.Views.mapView.changeModel(currentEntityCollection);
                        $('.container .nav li').removeClass('active');
                        $('#addEntrymenu>a').html('<span class="glyphicon glyphicon-plus"></span> '+polyglot.t('Add_Entry'));
                        $('#tablemenu').addClass('active');
                        $('#maprow').hide();
                        $('#tablerow').show();
                        $('#entryrow').hide();
                        App.addEntry(id, true);
                        App.hidePleaseWait();
                    }
                });
            }
        },
        
        initialize: function (options) {
            this.Collections = {};
            this.Views = {};
            this.pleaseWaitDiv = $('#pleaseWaitDialog');
            this.hidePleaseWait();
        },
    
        editEntry: function (collection, id) {
                collection = collection ? collection : "metadata";
                this.changeEntity(collection);
                var entry = this.currentEntityCollection.get(id);
                if (this.currentView) {
                	this.currentView.close();
                    //this.currentView.undelegateEvents();
                    $(this.currentView.el).empty();
                }
                this.currentView = new EntryView({model: entry, el: "#content", App: this});
                $('.container .nav li').removeClass('active');
                $('#addEntrymenu>a').html('<span class="glyphicon glyphicon-pencil"></span> '+polyglot.t('Edit_Entry'));
                $('#addEntrymenu').addClass('active');
                $('#maprow').hide();
                $('#tablerow').hide();
                $('#entryrow').show();
                $("#navbar #save").show();
                $("#navbar #delete").show();

        },
    
        addEntry: function (collection,nsw) {
                collection = collection ? collection : "metadata";
                this.changeEntity(collection);
                var entry = new this.currentEntityCollection.model();
                if (this.currentView) {
                	this.currentView.close();
                    //this.currentView.undelegateEvents();
                    $(this.currentView.el).empty();
                }
                this.currentView = new EntryView({model: entry, el: "#content", App: this});
                if(!nsw){
                $('.container .nav li').removeClass('active');
                $('#addEntrymenu>a').html('<span class="glyphicon glyphicon-plus"></span> '+polyglot.t('Add_Entry'));
                $('#addEntrymenu').addClass('active');
                $('#maprow').hide();
                $('#tablerow').hide();
                $('#entryrow').show();
                
                $("#navbar #save").show();

            }
        },
        table: function (collection) {
            collection = collection ? collection : "metadata";
            this.changeEntity(collection);
            $('.container .nav li').removeClass('active');
            $('#addEntrymenu>a').html('<span class="glyphicon glyphicon-plus"></span> '+polyglot.t('Add_Entry'));
            $('#tablemenu').addClass('active');
            $('#maprow').hide();
            $('#tablerow').show();
            $('#entryrow').hide();
            
            $("#navbar #save").hide();
            $("#navbar #delete").hide();

        },
        map: function (collection) {
            collection = collection ? collection : "metadata";
            this.changeEntity(collection);
            $('.container .nav li').removeClass('active');
            $('#addEntrymenu>a').html('<span class="glyphicon glyphicon-plus"></span> '+polyglot.t('Add_Entry'));
            $('#mapmenu').addClass('active');
            $('#maprow').show();
            $('#tablerow').hide();
            $('#entryrow').hide();
            
            $("#navbar .save").hide();
            $("#navbar .delete").hide();
        },
     
 //       reset: function(){
 //           localStorage.clear();
 //           this.currentEntityCollection.reset();
 //           this.log('Local storage cleared!');
 //       },
        sync: function(){
            var collection = this.currentEntityCollection;
            this.log('Sync started');
            collection.refreshFromServer({App:this});
        },
        log: function (msg) {
            this.Collections.Logs.set('message', this.Collections.Logs.get('message') + msg + '\n');
        },
        load: function () {
        	 
                this.Collections.Entries = new Models.Entries([],{auth: this.loginState.get('login')});
                this.showPleaseWait();
                $.when(this.Collections.Entries.fetch(), this)
                  .done(function (data, App) {
                        App.Collections.Users = new Models.Users([],{auth: App.loginState.get('login')});
                        
                        App.Views.appView = new AppView({ currentCollection: "metadata", el: '#app', App: App });
                        App.Views.tableView = new TableView({ model: App.Collections.Entries, el: "#table", App: App });
                        App.Views.headerView = new HeaderView({ model: App.Collections.Entries, loginState: App.loginState, el: '.header', App: App });
                        App.Views.mapView = new MapView({ model: App.Collections.Entries, el: "#map", App: App });
                        
                        //App.changeEntity(App.Collections.Entries.length>0?App.Collections.Entries.models[0].get('_id'):"metadata");

                        if (App.loginState.get('login').isAdmin) {
                          //App.Views.logView = new LogView({ el: "#log", model: App.Collections.Logs, App: App });
                          //App.table();
                          //App.addEntry(null,true);
                        	if(App.loginState.get('login').metadata)
                        	{
                        		App.navigate('metadata/'+App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}).get('_id'), {trigger: true});
                        	}else{
                        		App.navigate('metadata/metadata', {trigger: true});
                        	}
                        	App.table();
                        }
                        else 
                        {
                                if (App.Collections.Entries.length == 0) {
                                    App.Collections.Entries.refreshFromServer({
                                    App:App,
                                    success: function () {
                                      //App.table(App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}).get('_id'));
                                      //App.addEntry(App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}).get('_id'), true);
                                      App.navigate('metadata/'+App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}).get('_id'), {trigger: true});
                                    }
                                    });
                                } else {
                                    //App.table(App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}).get('_id'));
                                    //App.addEntry(App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}).get('_id'), true);
                                	App.navigate('metadata/'+App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}).get('_id'), {trigger: true});
                                }
                         
                        }
                      
                        App.hidePleaseWait();
                  }, this);
    
        },
        showPleaseWait: function() {
            this.pleaseWaitDiv.modal();
        },
        hidePleaseWait: function () {
            var delay = 500;
            var start = new Date().getTime();
            while (new Date().getTime() < start + delay);
            this.pleaseWaitDiv.modal('hide');
        }
    
    });
});
