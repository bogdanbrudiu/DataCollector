define(function (require) {

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        AppView     = require('app/views/app'),
        HeaderView  = require('app/views/header'),
        TableView   = require('app/views/table'),
        EntryView   = require('app/views/entry'),
        GridView    = require('app/views/grid'),
        LogView    = require('app/views/log'),
        LoginView   = require('app/views/login');
        
    var models      = require('app/models/models');

    return Backbone.Router.extend({
    
        routes: {
                "entries/reset"                     : "reset",
                "entries/sync"                      : "sync",
    
                "metadata/:collection/table"        : "table",
                "metadata/:collection/grid"         : "grid",
                "metadata/:collection/add"          : "addEntry",
                "metadata/:collection/:id"          : "editEntry",
                "metadata/:collection"              : "changeEntity",
                "login"                             : "login",
                "logout"                             : "logout"
    
        },
        login: function() {
            $('#app').html(new LoginView({App: this}).render().el);
        },
        logout: function() {
            localStorage.removeItem('email');
            localStorage.removeItem('password');
            this.loginState.set('loginStatus', false);
            this.loginState.set('login', null);
            this.login();
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
                        currentEntity.initializeCollection();
                    }
                    currentEntityCollection = currentEntity.dynamicCollection;
                }
            }
            this.currentEntityCollection = currentEntityCollection;
            this.currentCollection = id;
            if (this.Views.appView.changeModel(id)) {
                this.Views.appView.showPleaseWait();
                this.currentEntityCollection.fetch({
                    App: this,
                    success: function (model, resp, options) {
                        var App=options.App;
                        App.Views.tableView.changeModel(currentEntityCollection);
                        //this.Views.gridView.changeModel(currentEntityCollection);
                        App.addEntry(id);
                        App.Views.appView.hidePleaseWait();
                    }
                });
            }
        },
        
        initialize: function (options) {
            this.Collections = {};
            this.Views = {};
        },
    
        editEntry: function (collection, id) {
                collection = collection ? collection : "metadata";
                this.changeEntity(collection);
                var entry = this.currentEntityCollection.get(id);
                if (this.currentView) {
                    this.currentView.undelegateEvents();
                    $(this.currentView.el).empty();
                }
                this.currentView = new EntryView({model: entry, el: "#content", App: this});
        },
    
        addEntry: function (collection) {
                collection = collection ? collection : "metadata";
                this.changeEntity(collection);
                var entry = new this.currentEntityCollection.model();
                if (this.currentView) {
                    this.currentView.undelegateEvents();
                    $(this.currentView.el).empty();
                }
                this.currentView = new EntryView({model: entry, el: "#content", App: this});
        },
        reset: function(){
            localStorage.clear();
            this.currentEntityCollection.reset();
            this.log('Local storage cleared!');
        },
        sync: function(){
            var collection = this.currentEntityCollection;
            this.log('Sync started');
            collection.refreshFromServer({App:this});
        },
        table: function (collection) {
            collection = collection ? collection : "metadata";
            this.changeEntity(collection);
            $('.container .nav li').removeClass('active');
            $('#tablemenu').addClass('active');
            $('#tablerow').show();
            $('#gridrow').hide();
        },
        grid: function (collection) {
            collection = collection ? collection : "metadata";
            this.changeEntity(collection);
            $('.container .nav li').removeClass('active');
            $('#gridmenu').addClass('active');
            $('#tablerow').hide();
            $('#gridrow').show();
        },
        log: function (msg) {
            this.Collections.Logs.set('message', this.Collections.Logs.get('message') + msg + '\n');
        },
        load: function () {
    
                this.Collections.Entries = new models.Entries();
                $.when(this.Collections.Entries.fetch(), this)
                  .done(function (data, App) {
                        App.Collections.Users = new models.Users();
                        App.Views.appView = new AppView({ currentCollection: "metadata", el: '#app', App: App });
                        App.Views.tableView = new TableView({ model: App.Collections.Entries, el: "#table", App: App });
                        //App.Views.gridView = new GridView({ model: App.Collections.Entries, el: "#grid", App: App });
                        App.Views.headerView = new HeaderView({ model: App.Collections.Entries, loginState: App.loginState, el: '.header', App: App });
                        //App.changeEntity(App.Collections.Entries.length>0?App.Collections.Entries.models[0].get('_id'):"metadata");

                        if (App.loginState.get('login').isAdmin) {
                          App.Views.logView = new LogView({ el: "#log", model: App.Collections.Logs, App: App });
                          App.table();
                          App.addEntry();
                        }
                        else 
                        {
                                if (App.Collections.Entries.length ==- 0) {
                                    App.Collections.Entries.refreshFromServer({
                                    App:App,
                                    success: function () {
                                      //App.table(App.Collections.Entries.length > 0 ? App.Collections.Entries.models[0].get('_id') : "metadata");
                                      //App.addEntry(App.Collections.Entries.length > 0 ? App.Collections.Entries.models[0].get('_id') : "metadata");
                                      //App.changeEntity(App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}));
                                      App.table(App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}).get('_id'));
                                      App.addEntry(App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}).get('_id'));
                                    }
                                    });
                                } else {
                                    //App.table(App.Collections.Entries.length > 0 ? App.Collections.Entries.models[0].get('_id') : "metadata");
                                    //App.addEntry(App.Collections.Entries.length > 0 ? App.Collections.Entries.models[0].get('_id') : "metadata");
                                    //App.changeEntity(App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}).id);
                                    App.table(App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}).get('_id'));
                                    App.addEntry(App.Collections.Entries.findWhere({name: App.loginState.get('login').metadata}).get('_id'));
                                }
                         
                        }
                        if(!Backbone.History.started)
                        {
                            Backbone.history.start();
                        }
                  }, this);
    
        }
    
    });
});
