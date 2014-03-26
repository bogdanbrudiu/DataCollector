define(['backbone','underscore',
        'app/views/formBuilder/text',
        'app/views/formBuilder/textarea',
        'app/views/formBuilder/radio',
        'app/views/formBuilder/checkbox',
        'app/views/formBuilder/select',
        'app/views/formBuilder/metadata'
        ],function (Backbone, _, 
        		TextView,
        		TextAreaView,
        		RadioView,
        		CheckBoxView,
        		SelectView,
        		MetadataView) {
  return Backbone.View.extend({
	  initialize: function (options) {
          this.value = options.value;
      },
      close: function(){
    	  if(this.control && this.control.close){
  		  	this.control.close();	

			  }
    	  this.undelegateEvents();
		},
      render: function () {
    	  if(this.control){
    		  	this.control.close();	

			  }
    	  switch ( this.model.type.toLowerCase())
    		{
    			case "text":
    				this.control=new TextView({model: this.model, value: this.value});   
    			  break;
    			case "textarea":
    				this.control=new TextAreaView({model: this.model, value: this.value});   
    			  break;
    			case "radio":
    				this.control=new RadioView({model: this.model, value: this.value});   
    			  break;
    			case "checkboxes":
    			case "checkbox":
    				this.control=new CheckBoxView({model: this.model, value: this.value});   
    			  break;
    			case "select":
    				this.control=new SelectView({model: this.model, value: this.value});   
    			  break;		
    			case "metadata":
    				var collection=new Backbone.Collection();
    				var value=JSON.parse(this.value||'{}');
    				for(var entryKey in value)
    			    {
    					var entry=value[entryKey];
    					entry.id=entryKey;
    					collection.add(entry);
    			    }
    				this.control=new MetadataView({model: this.model, value: this.value, collection: collection});   
    			  break;		
    			default:
    			  break;
    		}
    	$(this.el).append(this.control.el);
    	this.control.render();
      }

  });
});