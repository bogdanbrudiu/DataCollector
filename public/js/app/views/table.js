define(function (require) {
    var Backbone    = require('backbone');
    var _           = require('underscore');
    var Template = require('text!tpl/TableView.html');

    
    var EntryRowView = Backbone.View.extend({

        tagName: "tr",
    
        events: {
            "click": "details"
        },
    
    
        initialize: function (options) {
            this.App = options.App;
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.destroyHandler);
            this.listenTo(this.model, 'softdelete', this.softdeleteHandler);

        },
    
        render: function () {
            $(this.el).attr('id', this.model.get('_id'));
            var cssclass = this.model.get('deleted') === true ? "danger" : (this.model.get('lastModified') === '' ? "success" : (this.model.get('isDirty') ? "warning" : ""));
            if (cssclass !== '') {
                $(this.el).attr('class', cssclass);
            }
    
    
            $(this.el).empty();
            _.each(this.model.schema, function (value, key, list) {
                if (value.hasOwnProperty("showInTable") && value["showInTable"] == "true" || value["showInTable"] == true) {
                    $(this.el).append('<td>' + this.model.get(key) + '</td>');
                }
            }, this);
    
            return this;
        },
    
        details: function () {
    
            this.App.navigate('#metadata/' +  this.App.currentCollection + '/' + this.model.get('_id'), true);
        },
    
        softdeleteHandler: function () {
            //$(this.el).remove();
        },
        destroyHandler: function () {
            $(this.el).remove();
        }
    
    });
    
    
    
    return Backbone.View.extend({
template: _.template(Template),

        initialize: function (options) {
            this.App = options.App;
            this.listenTo(this.model, 'reset', this.render);
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'add', function (entry) {
                $(this.el).find('#list').append(new EntryRowView({ model: entry, App:this.App }).render().el);
            });
            this.render();
        },
        changeModel: function (newModel) {
            this.stopListening();
            this.model = newModel;
            this.initialize({App:this.App});
        },
        render: function () {
            $(this.el).html(this.template());
            _.each(this.model.getSchema(), function (value, key, list) {
                if (value.hasOwnProperty("showInTable") && value["showInTable"] == "true" || value["showInTable"] == true) {
                    $(this.el).find('#head').append('<th>' + key + '</th>');
                }
            }, this);
            _.each(this.model.models, function (value, key, list) {
                $(this.el).find('#list').append(new EntryRowView({ model: value, App:this.App }).render().el);
            }, this);
    
            return this;
        }
    });
});