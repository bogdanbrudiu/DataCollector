define([
       "jquery", "underscore", "backbone"
       , "helper/events" 	
      , "text!tpl/formBuilder/metadata.html"
      , "text!tpl/formBuilder/popover.html"
      , "text!tpl/formBuilder/menu.html"
      
], function(
  $, _, Backbone, Events
  , Template, PopOverTemplate,
   MenuTemplate
){
	
	
	
	
  return Backbone.View.extend({
	  events: {
          "click #itemup": "itemup",
		"click #itemdown": "itemdown",
		"click #itemdelete": "itemdelete",
		"click #itemedit": "itemedit",
		"click #saveitem": "saveitem",
		"click #closeitem": "closeitem",
		"click #addTextBox": "addTextBox",
		"click #addTextArea": "addTextBox",
		"click #addRadio": "addRadio",
		"click #addCheckbox": "addCheckbox",
		"click #addSelect": "addSelect",
		
		
      },
      addcomponent: function(type){
    	  index=0;
    	  id=type+this.collection.length;
    	  while(this.collection.get(id) !=null)
    	  {
    		  id=id+'_'+index++;
    	  }
    	  return {type:type ,id:id, label:id, placeholder: id, value:'', editorAttrs:{disabled: false}, showInTable:true};
      },
      addTextBox:function(){
    	  this.selectedItem=myModel=this.addcomponent('textbox');
    	  this.collection.add(myModel);
    	  this.render();
      },
      addTextArea:function(){
    	  this.selectedItem=myModel=this.addcomponent('textbox');    	  
    	  this.collection.add(myModel);
    	  this.render();
      },
      addRadio:function(){
    	  this.selectedItem=myModel=this.addcomponent('radio');
    	  myModel.options=["Option1","Option2","Option3"]
    	  this.collection.add(myModel);
    	  this.render();
      },
      addCheckbox:function(){
    	  this.selectedItem=myModel=this.addcomponent('checkbox');
    	  myModel.options=["Option1","Option2","Option3"]
    	  this.collection.add(myModel);
    	  this.render();
      },
      addSelect:function(){
    	  this.selectedItem=myModel=this.addcomponent('select');
    	  myModel.options=["Option1","Option2","Option3"]
    	  this.collection.add(myModel);
    	  this.render();
      },
      itemup: function(){
    	  if(this.selectedItem!=null){
    		  index1=this.collection.indexOf(this.collection.get(this.selectedItem));
    		  index2=index1-1;
    		  this.collection.models[index1] = this.collection.models.splice(index2, 1, this.collection.models[index1])[0];
    		  this.render();
    	  }
      },
      itemdown: function(){
    	  if(this.selectedItem!=null){
    		  index1=this.collection.indexOf(this.collection.get(this.selectedItem));
    		  index2=index1+1;
    		  this.collection.models[index1] = this.collection.models.splice(index2, 1, this.collection.models[index1])[0];
    		  this.render();
    	  }
      },
      itemdelete: function(){
    	  if(this.selectedItem!=null){
    		  this.collection.remove(this.collection.get(this.selectedItem));
    		  this.render();
    	  }
      },
      itemedit: function(){
    	  if(this.selectedItem!=null){
    		  this.selectedIndex= this.collection.indexOf(this.collection.get(this.selectedItem));
    		  $('#controlId').val(this.selectedItem.id);
    		  $('#controlLabel').val(this.selectedItem.label);
    		  $('#controlPlaceholder').val(this.selectedItem.placeholder);
    		  if(this.selectedItem.showInTable){
    			  $('#controlShowInTable').attr('checked', true);

    		  }else{
    			  $('#controlShowInTable').attr('checked', false);
    		  }
    		  $('#controlOptions').val(this.selectedItem.options);
    		  if(this.selectedItem.type.toLowerCase()=="radio" ||
    	    			 this.selectedItem.type.toLowerCase()=="checkboxes"  ||
    	    			 this.selectedItem.type.toLowerCase()=="checkbox" ||
    	    			 this.selectedItem.type.toLowerCase()=="select"
    	    			){
    	    			  $('#controlOptions').show();
    	    			  $('#controlOptionsLabel').show();
    	    		  }else{
    	    			  $('#controlOptions').hide();
    	    			  $('#controlOptionsLabel').hide();
    	    		  }
    		  
    		 $('#itemeditmodal').modal('show');
    	  }
      },
      saveitem: function(){
    	  if(this.selectedIndex!=null){
    		  
    		  //this.selectedItem.id=$('#controlId').val();
    		  //this.selectedItem.label=$('#controlLabel').val();
    		  //this.selectedItem.placeholder=$('#controlPlaceholder').val();
    		  //this.selectedItem.showInTable= $('#controlShowInTable').is(':checked');
    		  //this.selectedItem.options=$('#controlOptions').val();
    		 
    		  this.collection.models[this.selectedIndex].set("id",$('#controlId').val());
    		  this.collection.models[this.selectedIndex].set("label",$('#controlLabel').val());
    		  this.collection.models[this.selectedIndex].set("placeholder",$('#controlPlaceholder').val());
    		  this.collection.models[this.selectedIndex].set("showInTable",$('#controlShowInTable').is(':checked'));
    		  this.collection.models[this.selectedIndex].set("options",$('#controlOptions').val());
    		  this.selectedItem= this.collection.models[this.selectedIndex].attributes;
    		 $('#itemeditmodal').modal('hide');
    		 this.render();
    	  }
      },
      closeitem: function(){
    	
    		 $('#itemeditmodal').modal('hide');

      },
	  initialize: function(options){
		  
		  this.selectedItem=null;
		  this.collection=options.collection;
		  this.id=this.model.id;
		  this.label=this.model.label || this.id;
		  this.placeholder=this.model.placeholder || this.id;
		  this.value=this.model.value || options.value;
		  this.disabled=this.model.editorAttrs && this.model.editorAttrs.disabled;
		  
		  //this.collection.on("add", this.render, this);
	      //this.collection.on("remove", this.render, this);
	      //this.collection.on("change", this.render, this);
		  
	      
	   
		  /*
		  if(!this.loaded){
		      this.collection.on("add", this.render, this);
		      this.collection.on("remove", this.render, this);
		      this.collection.on("change", this.render, this);
		      Events.on("mySnippetDrag", this.handleSnippetDrag, this);
		      Events.on("tempMove", this.handleTempMove, this);
		      Events.on("tempDrop", this.handleTempDrop, this);
		    
		      this.loaded=true;
	      }
	      this.dragged=null;
	      */
      this.renderForm = _.template(Template);
      this.views=[];
      
      
      if(this.collection.get('_id')==null){
    	  this.collection.add({type:"Text" ,id:"_id", value:'', editorAttrs:{disabled: true}, showInEditor:false});
      }
      if(this.collection.get('lastModified')==null){
    	  this.collection.add({type:"Text" ,id:"lastModified", value:'', editorAttrs:{disabled: true}, showInEditor:false});
      }
      
    },
  close: function(){
		for(var i=0;i< this.views.length;i++)
    	{
    		this.views[i].close();
    	}
		/*
		  if(this.dragged && this.dragged.close){
	  		  	this.dragged.close();	
		  }
		  Events.unbind();
		  */

		this.undelegateEvents();
		
	},
	refreshMenu: function(){
		this.$content=$('#metadatacontent');
		  if(!this.selectedItem || this.collection.indexOf(this.collection.get(this.selectedItem))==0)
			  this.$content.find('#itemup').addClass('disabled');
		  else
			  this.$content.find('#itemup').removeClass('disabled');
		  
		  if(!this.selectedItem || this.collection.indexOf(this.collection.get(this.selectedItem))==this.collection.length -1 )
			  this.$content.find('#itemdown').addClass('disabled');
		  else
			  this.$content.find('#itemdown').removeClass('disabled');
		  
		  if(!this.selectedItem)
			  this.$content.find('#itemdelete').addClass('disabled');
		  else
			  this.$content.find('#itemdelete').removeClass('disabled');
		  
		  if(!this.selectedItem)
			  this.$content.find('#itemedit').addClass('disabled');
		  else
			  this.$content.find('#itemedit').removeClass('disabled');
		
	}
		,
	
     render: function(){
      //Render Snippet Views
    	

    	for(var i=0;i< this.views.length;i++)
    	{
    		this.views[i].close();
    	}
    	this.views=[];
    	$(this.el).empty();
		this.value='';
		for(var entryKey in this.collection.models)
		{ 
			var entrymodel=this.collection.models[entryKey];
			var id=entrymodel.get('id');
			//if(id!='_id' && id!='lastModified'){
			  newentrymodel = entrymodel.clone();
			  delete newentrymodel.attributes["id"];
			  this.value+="\""+id+"\":"+JSON.stringify(newentrymodel)+", ";
			//}
		}
	
	if(this.value.length>0){
		this.value=this.value.substr(0,this.value.length-2);
     }
	this.value="{"+this.value+"}";
      $(this.el).html(this.renderForm({id:this.id, label:this.label, placeholder: this.placeholder, value:this.value, disabled: this.disabled}));
  	if(this.model.value!=this.value){
		this.model.value=this.value;
		$(this.el).find('textarea').trigger('change');
	}
      
      this.$content=$('#metadatacontent');
      this.$content.html("");
      this.$content.append("<div class='component'>Form</div>");
      this.$content.append( _.template(MenuTemplate));
      //this.$repository=$('#repository');
      var self=this;
	 // require(["app/views/formBuilder/draggableSnipplet"], function(EditorView) {
      require(["app/views/formBuilder/editor"], function(EditorView) {
		  
		
		  
		  self.refreshMenu();

		  
	      for(var entryKey in self.collection.models)
	      {
	    	  var entrymodel=self.collection.models[entryKey];
	    	  
	    		if((entrymodel.showInEditor==undefined || entrymodel.showInEditor!=false)
	    				&& entrymodel.id!='_id' && entrymodel.id!='lastModified'){
			    	  var entry={};
			    	  entry.id=entrymodel.id;
			    	  entry.type=entrymodel.get('type');
			    	  entry.label=entrymodel.get('label') || entrymodel.id;
			    	  entry.placeholder=entrymodel.get('placeholder') || entrymodel.id;
			    	  entry.showInTable=entrymodel.get('showInTable') || false;
			    	  entry.disabled=entrymodel.get('editorAttrs') && entrymodel.get('editorAttrs').disabled;
			    	  entry.options=entrymodel.get('options') || [];
			    	  
				      var control=new EditorView({model: entry, value:''});
				      control.$el.on('click',$.proxy(function(e){
				    	  self.$content.children().removeClass('bg-info');
				    	  this.$el.addClass('bg-info');
				    	  self.selectedItem=this.model;
				    	  self.refreshMenu();
				    	  },control));
				      if(self.selectedItem && self.selectedItem.id==control.model.id){
				    	  control.$el.addClass("bg-info");

				      }
				      control.$el.addClass("component");
				  /*    control.$el.attr('data-title', 'Edit Control');
				      control.$el.attr('data-trigger', 'manual');
				      control.$el.attr('data-placement', 'right');
				      control.$el.attr('data-html', true);
				      control.$el.attr('data-content',  _.template(PopOverTemplate));*/
				      self.views.push(control);
				      self.$content.append(control.el);
				      control.render();
	    		}
	      }
	      
	  /*
	  var entry={};
	  entry.id='textBox';
	  entry.type='text';
	  entry.label='textBoxLabel';
	  entry.placeholder='textBoxPlaceholder';
	  entry.disabled='false';
	  entry.options=[];
      var control=new EditorView({model: entry, value:''});
      control.$el.addClass("component");
      self.views.push(control);
      self.$repository.append(control.el);
      control.render();
      var entry={};
	  entry.id='textArea';
	  entry.type='textArea';
	  entry.label='textAreaLabel';
	  entry.placeholder='textAreaPlaceholder';
	  entry.disabled='false';
	  entry.options=[];
      var control=new EditorView({model: entry, value:''});
      control.$el.addClass("component");
      self.views.push(control);
      self.$repository.append(control.el);
      control.render();
      var entry={};
	  entry.id='radio';
	  entry.type='radio';
	  entry.label='radioLabel';
	  entry.placeholder='radioPlaceholder';
	  entry.disabled='false';
	  entry.options=['option1','option2','option3'];
      var control=new EditorView({model: entry, value:''});
      control.$el.addClass("component");
      self.views.push(control);
      self.$repository.append(control.el);
      control.render();
      var entry={};
	  entry.id='checkbox';
	  entry.type='checkbox';
	  entry.label='checkboxLabel';
	  entry.placeholder='checkboxPlaceholder';
	  entry.disabled='false';
	  entry.options=['option1','option2','option3'];
      var control=new EditorView({model: entry, value:''});
      control.$el.addClass("component");
      self.views.push(control);
      self.$repository.append(control.el);
      control.render();
      var entry={};
	  entry.id='select';
	  entry.type='select';
	  entry.label='selectLabel';
	  entry.placeholder='selectPlaceholder';
	  entry.disabled='false';
	  entry.options=['option1','option2','option3'];
      var control=new EditorView({model: entry, value:''});
      control.$el.addClass("component");
      self.views.push(control);
      self.$repository.append(control.el);
      control.render();
      */
      
      
	  });
      this.delegateEvents();
    }
/*
    , getBottomAbove: function(eventY){
      var myFormBits = $(this.$el.find(".component"));
      var topelement = _.find(myFormBits, function(renderedSnippet) {
        if (($(renderedSnippet).offset().top + $(renderedSnippet).height()) > eventY  - 50) {
          return true;
        }
        else {
          return false;
        }
      });
      if (topelement){
        return topelement;
      } else {
        return myFormBits[0];
      }
    }

    , handleSnippetDrag: function(mouseEvent, snippetModel) {
    	console.log("handleSnippetDrag");
    	  var that = this;
    	 require(["app/views/formBuilder/tempDraggableSnipplet"], function(EditorView) {
    		  if(this.dragged){
      		  	this.dragged.close();	

  			  }
    		 
    		 this.dragged=new EditorView({model: snippetModel});

    		 this.dragged.$el.addClass("dragged");

    		 this.dragged.$el.css({position : 'absolute', 'background-color' :'white', width:mouseEvent.target.clientWidth});
		      $("body").append(this.dragged.el);
		      this.dragged.render();
		      that.collection.remove(snippetModel);
		      console.log("newTempPostRender");
		      this.dragged.trigger("newTempPostRender", mouseEvent);
    	 });
    }

    , handleTempMove: function(mouseEvent){
    	console.log("handleTempMove");
    	
    	var mouseX     = mouseEvent.pageX;
        var mouseY     = mouseEvent.pageY;
    	if(mouseEvent.originalEvent.touches){
    		 mouseX     = mouseEvent.originalEvent.touches[0].pageX;
	         mouseY     = mouseEvent.originalEvent.touches[0].pageY;
	        }
    	
      $(".target").removeClass("target");
      if(mouseX >= this.$content.offset().left &&
    		  mouseX < (this.$content.width() + this.$content.offset().left) &&
    		  mouseY >= this.$content.offset().top &&
    		  mouseY < (this.$content.height() + this.$content.offset().top)){
        $(this.getBottomAbove(mouseY)).addClass("target");
      } else {
        $(".target").removeClass("target");
      }
    }

    , handleTempDrop: function(mouseEvent, model, index){
    	console.log("handleTempDrop");
    	
    	var mouseX     = mouseEvent.pageX;
        var mouseY     = mouseEvent.pageY;
    	if(mouseEvent.originalEvent.touches){
    		 mouseX     = mouseEvent.originalEvent.touches[0].pageX;
	         mouseY     = mouseEvent.originalEvent.touches[0].pageY;
	        }
    	
    	
    	
      if(mouseX >= this.$content.offset().left &&
    		  mouseX < (this.$content.width() + this.$content.offset().left) &&
    		  mouseY >= this.$content.offset().top &&
    		  mouseY < (this.$content.height() + this.$content.offset().top)) {
        var index = $(".target").index();
        $(".target").removeClass("target");
        this.collection.add(model,{at: index});
      } else {
        $(".target").removeClass("target");
      }
    }
    */
    
  })
});
