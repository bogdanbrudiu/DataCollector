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
            $("#navbar #save").on("click",this,this.save);
            $("#navbar #delete").on("click",this,this.softDelete);
          
        },
        close: function(){
        	for(var i=0;i< this.views.length;i++)
        	{
        		this.views[i].close();
        	}
        	  $("#navbar #save").off("click");
              $("#navbar #delete").off("click");
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
	if(entry.showInEditor==undefined || entry.showInEditor!=false){
		entry.id=entryKey;
		var control=new EditorView({model: entry, value:this.model.get(entryKey)});
		this.views.push(control);
		$(this.el).append(control.el);
		control.render();
	}
}
 $(this.el).append(this.template());



            return this;
        },


        save: function (event ) {
        	if(event && event.data){that=event.data;}else{that=this;}
        	
            if (that.model.isNew()) {
                var selfEntryView = that;
		 if (!that.model.id) {//guid
			 that.model.id = (((1+Math.random())*0x10000)|0).toString(16).substring(1)+
(((1+Math.random())*0x10000)|0).toString(16).substring(1)+"-"+
(((1+Math.random())*0x10000)|0).toString(16).substring(1)+"-"+
(((1+Math.random())*0x10000)|0).toString(16).substring(1)+"-"+
(((1+Math.random())*0x10000)|0).toString(16).substring(1)+"-"+
(((1+Math.random())*0x10000)|0).toString(16).substring(1)+
(((1+Math.random())*0x10000)|0).toString(16).substring(1)+
(((1+Math.random())*0x10000)|0).toString(16).substring(1);
			 that.model.set(that.model.idAttribute, that.model.id);
		    }
		 that.App.currentEntityCollection.create(that.model, {
                    success: function (model) {
                        //selfEntryView.App.navigate('metadata/' + selfEntryView.App.currentCollection + '/' + model.get('_id'), false);
                        selfEntryView.App.navigate('metadata/' + selfEntryView.App.currentCollection +'/table', {trigger: true});
                    },
                    error: function (model, response) {
                        alert(response.responseText);
                    }
                });
            } else {
            	that.model.save();
            	that.App.navigate('metadata/' + that.App.currentCollection +'/table', {trigger: true});
            }
            that.render();
            return false;
        },
        softDelete: function (event ) {
        	if(event && event.data){that=event.data;}else{that=this;}
        	
        	that.model.set({ deleted: true });
        	that.model.save();
        	that.model.trigger('softdelete');
        	that.App.navigate('metadata/' + that.App.currentCollection+'/table', {trigger: true});
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
        }
      
    
    });
});