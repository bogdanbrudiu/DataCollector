define(function (require) {
     var $           = require('jquery'),
        Backbone    = require('backbone'),
	Basicauth = require('backbone.basicauth'),
	LocalStorage = require('backbone.localStorage');
    
    
    var refreshFromServer=function (options) {
        var collection = this;
        App=options.App;	
        var lastModifiedEntry = this.max(function (m) { return new Date(m.get('lastModified')); });
        var modifiedSince = (lastModifiedEntry !== null && lastModifiedEntry!= -Infinity) ? lastModifiedEntry.get('lastModified') : "null";
        App.log('Getting entries newer then: ' + modifiedSince);
        App.showPleaseWait();
        Backbone.ajaxSync('read', this, { url: (this.url + '?modifiedSince=' + modifiedSince ), success: function (newEntries) {
    
            App.log(newEntries.length + ' ' + (newEntries.length == 1 ? 'entry' : 'entries') + ' downloaded!');
    
            $.each(newEntries, function (index, newEntry) {
                var localEntry = collection.get(newEntry._id);
                if (localEntry != null) {
                    App.log('Theirs:' + JSON.stringify(newEntry));
                    App.log('Ours:' + JSON.stringify(localEntry));
    
    
                    if (localEntry.get('isDirty') == true) {
                        if (!localEntry.get('deleted')) {
                            if (localEntry.get('lastModified') != newEntry.lastModified) {
                                App.log('Conflict! droping local...');
                                localEntry.destroy();
                                if (newEntry.deleted != true) {
                                    collection.create(newEntry);
                                }
                            } else {
                                App.log('Ours is newer...');
                            }
                        } else {
                            App.log('Ours was deleted so ignore data received from server!');
                        }
                    } else {
                        App.log('No local change...');
                        if (newEntry.deleted == true) {
                            App.log('Theirs was deleted so do the same locally');
                            localEntry.destroy();
                        }
                    }
    
                } else {
                    if (newEntry.deleted != true) {
                        App.log('Adding ' + JSON.stringify(newEntry));
                        collection.create(newEntry, {add:true});
                    }
                }
            });
            App.log('New from Server Done!');
    
            App.log('Pushing modified data from local');
            var modifiedEnties = collection.filter(function (entry) {
                return entry.get('isDirty') == true && entry.get('lastModified') != '';
            });
            App.log(modifiedEnties.length + ' ' + (modifiedEnties.length == 1 ? 'entry' : 'entries') + ' to push!');
            $.each(modifiedEnties, function (index, modifiedLocalEntry) {
                App.log('Pushing:' + JSON.stringify(modifiedLocalEntry));
    
                modifiedLocalEntry.attributes.isDirty = null;
                modifiedLocalEntry.credentials=collection.credentials;
                Backbone.ajaxSync('update', modifiedLocalEntry, { success: function (newEntry) {
                    modifiedLocalEntry.destroy();
                    if (modifiedLocalEntry.get('deleted') == true) {
                        App.log('Entry was actually deleted so do it!');
                    } else {
                        collection.create(newEntry, {add:true});
                    }
                    App.log('Done!');
                }
                });
    
            });
    
            App.log('Pushing new data from local');
            var newEnties = collection.filter(function (entry) {
                return entry.get('lastModified') == '';
            });
            App.log(newEnties.length + ' ' + (newEntries.length == 1 ? 'entry' : 'entries') + ' to push!');
            $.each(newEnties, function (index, newLocalEntry) {
                App.log('Pushing:' + JSON.stringify(newLocalEntry));
                if (newLocalEntry.get('deleted') != true) {
                    var entryToPush = newLocalEntry.clone();
    
                    entryToPush.attributes._id = null;
                    entryToPush.attributes.isDirty = null;
                    entryToPush.credentials=collection.credentials;
                    newLocalEntry.destroy();
                    Backbone.ajaxSync('create', entryToPush, { url: collection.url, success: function (newEntry) {
                        collection.create(newEntry, {add:true});
                        App.log('Done!');
                    }
                    });
                }else{
                    App.log('Entry was actually deleted so do it!');
                    newLocalEntry.destroy();
                }
    
            });
            App.log('Sync Done!');
            if (options && options.success) {
                options.success();
            }
            App.hidePleaseWait();
        }
        });
    };
    
    var parseSchema = function (schema) {
        for (var propertyName in schema) {
            if (schema[propertyName] != null && typeof schema[propertyName] != 'object') {
                schema[propertyName] = {};
                schema[propertyName].Type = propertyName;
            }
        }
        return schema;
    }
    
    var Entry = Backbone.Model.extend({
    
        idAttribute: "_id",
        defaults: {
            _id: null,
            lastModified: "",
            deleted: false,
            isDirty: false
        },
    
        schema: {
            _id:        { type: 'Text', editorAttrs: { disabled: true }, showInEditor:false },
            name:    { type: 'Text', validators: ['required'], showInTable:true },
            schema: { type: 'Metadata' },
            lastModified:   { type: 'Text', editorAttrs: { disabled: true }, showInEditor:false }
        },
        save: function (attrs, options) {
            options || (options = {});
            if (!this.isNew() && options.add != true) {
                this.set({isDirty: true});
            }
            return Backbone.Model.prototype.save.call(this, attrs, options);
        },
        initializeCollection:function(App){
            var self=this;
            var schema={};
            try {
                schema = parseSchema(JSON.parse(this.get('schema')));
    
            } catch (e) {
                App.log('Schema is not valid for'+ this.get('_id'));
                console.log(e);
            }
    
            this.modelDef=Backbone.Model.extend({ 
                idAttribute: "_id",
                defaults: {
                    _id: null,
                    lastModified: "",
                    deleted: false,
                    isDirty: false
                },
                schema:schema,
                save: function (attrs, options) {
                    options || (options = {});
                    if (!this.isNew() && options.add != true) {
                        this.set({isDirty: true});
                    }
                    return Backbone.Model.prototype.save.call(this, attrs, options);
                }
            });
            this.collectionDef = Backbone.Collection.extend({
		initialize: function(models, options)
		{
			this.localStorage= new Backbone.LocalStorage(options.auth.username+"-"+options.metadata_id);
			this.credentials = {    username: options.auth.username,    password: options.auth.password};
		},
                url: "../collections/"+this.get('_id'), 
                model: this.modelDef,
                refreshFromServer: refreshFromServer,
                getSchema: function () {
                	return schema;
                }
            });
            this.dynamicCollection=new  this.collectionDef([],{auth: App.loginState.get('login'), metadata_id:this.get('_id')});
        },
        events: {
            "change":"initializeCollection"
        }
    
    });
    
    
    
    
    var User = Backbone.Model.extend({
        idAttribute: "_id",
        defaults: {
            _id: null,
	    lastModified: "",
            isAdmin:false,
            deleted: false,
            isDirty: false
        },
        schema: {
            _id: { type: 'Text', editorAttrs: { disabled: true }, showInEditor:false },
            owner: { type: 'Text', validators: ['required'], editorAttrs: { disabled: true }, showInEditor:false },
            username: { type: 'Text', validators: ['required'], showInTable: true },
            password: { type: 'Text', validators: ['required'] },
            metadata: { type: 'Text', validators: ['required'], showInTable: true },
            isAdmin: { type: 'Checkbox', showInTable: true },
            lastModified: { type: 'Text', editorAttrs: { disabled: true }, showInEditor:false }
        },
        save: function (attrs, options) {
            options || (options = {});
            if (!this.isNew() && options.add != true) {
                this.set({ isDirty: true });
            }
            return Backbone.Model.prototype.save.call(this, attrs, options);
        },
        events: {
            "change": "initializeCollection"
        }
    
    });
    
    var Users = Backbone.Collection.extend({
	initialize: function(models, options)
	{
		this.localStorage=new Backbone.LocalStorage(options.auth.username+"-"+"users");
		this.credentials = {    username: options.auth.username,    password: options.auth.password};
	},
        model: User,
        getSchema: function () { return parseSchema(new User().schema); },
        url: "../collections/users",
        refreshFromServer: refreshFromServer
    });
    
    var Entries = Backbone.Collection.extend({
	initialize: function(models, options)
	{
		this.localStorage=new Backbone.LocalStorage(options.auth.username+"-"+"metadata");
		this.credentials = {    username: options.auth.username,    password: options.auth.password};
	},
        model: Entry,
        getSchema: function () { return parseSchema(new Entry().schema); },
        url: "../collections/metadata",
        refreshFromServer: refreshFromServer
    });
    
    var Logs = Backbone.Model.extend({
        defaults: {
            message:""
        }
    });
    
    var Login = Backbone.Model.extend({
        defaults: {
            loginStatus: false,
            user:null
        }
    });

    return {
        Entry: Entry,
        User: User,
        Users: Users,
        Entries: Entries,
        Logs: Logs,
        Login: Login
    };

});
