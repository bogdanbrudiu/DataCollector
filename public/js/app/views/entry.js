define(function (require) {
    var Backbone    = require('backbone');
    var _    = require('underscore');    
	var Forms = require('backbone-forms');
	var Template = require('text!tpl/EntryView.html');


var TextView   = require('app/views/formBuilder/text');
var TextAreaView   = require('app/views/formBuilder/textarea');
var RadioView   = require('app/views/formBuilder/radio');
var CheckBoxView   = require('app/views/formBuilder/checkbox');
var SelectView   = require('app/views/formBuilder/select');

    return Backbone.View.extend({
	template: _.template(Template),
    
        initialize: function (options) {
            this.App = options.App;
            this.render();
            _.bindAll(this, 'changed');
        },
    
        events: {
            "click .save": "save",
            "click .delete": "softDelete",
            "change input": "changed",
            "change textarea": "changed"
        },
    
        render: function () {
/*
            var form = new Backbone.Form({ model: this.model, idPrefix: "entrydetails-" }).render();
            $(this.el).html($(form.el).append(this.template()));
    */

$(this.el).html("");

for(var entryKey in this.model.schema)
{
var entry=this.model.schema[entryKey];
	switch (entry.type.toLowerCase())
	{
		case "text":
		  var control=new TextView({model: this.model, att: entryKey});   
		  break;
		case "textarea":
		  var control=new TextAreaView({model: this.model, att: entryKey});   
		  break;
		case "radio":
		  var control=new RadioView({model: this.model, att: entryKey});   
		  break;
		case "checkboxes":
		  var control=new CheckBoxView({model: this.model, att: entryKey});   
		  break;
		case "select":
		  var control=new SelectView({model: this.model, att: entryKey});   
		  break;		
		default:
		  break;
	}
$(this.el).append(control.el);
}
 $(this.el).append(this.template());



            return this;
        },


        save: function () {
            if (this.model.isNew()) {
                var self = this;
		 if (!this.model.id) {//guid
		      this.model.id = (((1+Math.random())*0x10000)|0).toString(16).substring(1)+
(((1+Math.random())*0x10000)|0).toString(16).substring(1)+"-"+
(((1+Math.random())*0x10000)|0).toString(16).substring(1)+"-"+
(((1+Math.random())*0x10000)|0).toString(16).substring(1)+"-"+
(((1+Math.random())*0x10000)|0).toString(16).substring(1)+"-"+
(((1+Math.random())*0x10000)|0).toString(16).substring(1)+
(((1+Math.random())*0x10000)|0).toString(16).substring(1)+
(((1+Math.random())*0x10000)|0).toString(16).substring(1);
		      this.model.set(this.model.idAttribute, this.model.id);
		    }
                this.App.currentEntityCollection.create(this.model, {
                    success: function (model) {
                        self.App.navigate('metadata/' + self.App.currentCollection + '/' + model.get('_id'), false);
                    },
                    error: function (model, response) {
                        alert(response.responseText);
                    }
                });
            } else {
                this.model.save();
            }
            this.render();
            return false;
        },
        changed: function (event) {
            var changed = event.currentTarget;
            var value = $(event.currentTarget).val();
            var obj = {};
            /*var id=changed.id.replace('entrydetails-', '').split('-');*/
	    var id=changed.id.split('-');
            if(id.length>1)
            {
                id=id.slice(0,id.length-1);
            }
            obj[id] = value;
            this.model.set(obj);
            return true;
        },
        softDelete: function () {
            this.model.set({ deleted: true });
            this.model.save();
            this.model.trigger('softdelete');
            return false;
        }
    
    });
});