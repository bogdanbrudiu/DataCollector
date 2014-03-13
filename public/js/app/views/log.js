define(function (require) {
    var Backbone    = require('backbone');
    var _    = require('underscore');    
    var Template = require('text!tpl/LogView.html');

    return Backbone.View.extend({
	template: _.template(Template),

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.render();
        },
         events: {
             "click #clearLog": "clearLog"
         },
    
         clearLog: function () { this.model.set('message', ''); },
    
        render: function () {
            $(this.el).html(this.template());
            $(this.el).find('textarea').html(this.model.get('message'));
            return this;
        },
    
    
    });
});