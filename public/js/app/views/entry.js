define(['backbone','underscore','text!tpl/EntryView.html',
        'app/views/formBuilder/editor'
        ],function (Backbone, _, Template,
        		EditorView) {
   
	return Backbone.View.extend({
	template: _.template(Template),
    
        initialize: function (options) {
        	this.views=[];
            this.App = options.App;
            this.render();
            _.bindAll(this, 'changed');
            
        },
        close: function(){
        	for(var i=0;i< this.views.length;i++)
        	{
        		this.views[i].close();
        	}
      	  this.undelegateEvents();
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


for(var i=0;i< this.views.length;i++)
{
	this.views[i].close();
}
this.views=[];
$(this.el).html("");

for(var entryKey in this.model.schema)
{
var entry=this.model.schema[entryKey];
entry.id=entryKey;
var control=new EditorView({model: entry, value:this.model.get(entryKey)});
this.views.push(control);
$(this.el).append(control.el);
control.render();
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