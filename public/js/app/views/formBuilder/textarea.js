define(function (require) {
    var Backbone    = require('backbone');
    var _    = require('underscore');    
    var Template = require('text!tpl/formBuilder/textarea.html');


    return Backbone.View.extend({

    	className:'form-group',
        initialize: function (options) {
    	this.template=options.template || _.template(Template);
    	
    	this.id=this.model.id;
		this.label=this.model.label || this.id;
		this.placeholder=this.model.placeholder || this.id;
		this.value=this.model.value || options.value;
		this.disabled=this.model.editorAttrs && this.model.editorAttrs.disabled;
        },
    
        render: function () {
        	$(this.el).html(this.template({id:this.id, label:this.label, placeholder: this.placeholder, value:this.value, disabled: this.disabled}));
            return this;
        },
    
    
    });
});