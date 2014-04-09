define([
       "jquery", "underscore", "backbone"
       , "helper/events" 	
      , "text!tpl/formBuilder/metadata.html"
    //  , "text!tpl/formBuilder/popover.html"
      , "text!tpl/formBuilder/menu.html"
      
], function(
  $, _, Backbone, Events
  , Template, //PopOverTemplate,
   MenuTemplate
){
	
	
	
	
  return Backbone.View.extend({
	  
	  initialize: function(options){
		  
		  this.selectedItem=null;
		  this.collection=options.collection;
		  this.id=this.model.id;
		  this.label=this.model.label || this.id;
		  this.placeholder=this.model.placeholder || this.id;
		  this.value=this.model.value || options.value;
		  this.disabled=this.model.editorAttrs && this.model.editorAttrs.disabled;
		  
		  this.collection.on("add", this.render, this);
	      this.collection.on("remove", this.render, this);
	      this.collection.on("change", this.render, this);
		  
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
			  delete entrymodel.attributes["id"];
			  this.value+="\""+id+"\":"+JSON.stringify(entrymodel)+", ";
		}
	if(this.value.length>0){
		this.value=this.value.substr(0,this.value.length-2);
     }
      $(this.el).html(this.renderForm({id:this.id, label:this.label, placeholder: this.placeholder, value:this.value, disabled: this.disabled}));
     
      
      this.$content=$('#metadatacontent');
      //this.$repository=$('#repository');
      var self=this;
	 // require(["app/views/formBuilder/draggableSnipplet"], function(EditorView) {
      require(["app/views/formBuilder/editor"], function(EditorView) {
		  
		  self.$content.append("<div class='component'>Form</div>");
		  self.$content.append( _.template(MenuTemplate));
		  self.refreshMenu();

		  
	      for(var entryKey in self.collection.models)
	      {
	    	  var entrymodel=self.collection.models[entryKey];
	    	  
	    		if(entrymodel.showInEditor==undefined || entrymodel.showInEditor!=false){
			    	  var entry={};
			    	  entry.id=entrymodel.id;
			    	  entry.type=entrymodel.get('type');
			    	  entry.label=entrymodel.get('label') || entrymodel.id;
			    	  entry.placeholder=entrymodel.get('placeholder') || entrymodel.id;
			    	  entry.disabled=entrymodel.get('editorAttrs') && entrymodel.get('editorAttrs').disabled;
			    	  entry.options=entrymodel.get('options') || [];
			    	  
				      var control=new EditorView({model: entry, value:''});
				      
				      control.$el.on('click',$.proxy(function(e){
				    	  self.selectedItem=this.model;
				    	  self.refreshMenu();
				    	  },control));
				      
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
