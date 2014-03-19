define(function (require) {
    var Backbone    = require('backbone');
    var _    = require('underscore');    
    var Template = require('text!tpl/LogView.html');

    return Backbone.View.extend({
	template: _.template(Template),

        initialize: function () {
this.model.state='collapse';
            this.listenTo(this.model, 'change', this.render);
            this.render();
        },
         events: {
             "click #collapseLogButton": "collapseLogButton",
		"click #clearLog": "clearLog"
         },
    
         clearLog: function () { 
		this.model.set('message', ''); 
	},
        collapseLogButton: function () { 
		this.model.state=this.model.state=='collapse'?'':'collapse';
 this.render();
	},
        render: function () {
            $(this.el).html(this.template({ model:this.model}));
            $(this.el).find('textarea').html(this.model.get('message'));
            return this;
        },
    
    
    });
});