define(function (require) {
    var Backbone    = require('backbone');
    var _    = require('underscore');    
    var Template = require('text!tpl/formBuilder/text.html');

    return Backbone.View.extend({
	template: _.template(Template),

        initialize: function (options) {
	    this.att=options.att;
            //this.listenTo(this.model, 'change', this.render);
            this.render();
        },
    
        render: function () {
            $(this.el).html(this.template({model:this.model, att: this.att}));
            return this;
        },
    
    
    });
});