define([
       "jquery", "underscore", "backbone"
       , "helper/events" 	
      , "app/views/formBuilder/editor"
      
], function(
  $, _, Backbone, Events
  , OriginalEditorView
){
	
	
	
	
  return OriginalEditorView.extend({

	      close: function(){
				  this.undelegateEvents();
				  //Events.unbind();
				  this.unbind();
				},
		      initialize: function(options){
		    	  this.on("newTempPostRender", function(mouseEvent){this.postRender(mouseEvent); $el.trigger('touchstart');}, this);
		          this.constructor.__super__.initialize.call(this, options);
		      },
		      postRender: function(mouseEvent){
		          this.tempForm  =  $("body .dragged")[0];;
		          this.halfHeight = Math.floor(this.tempForm.clientHeight/2);
		          this.halfWidth  = Math.floor(this.tempForm.clientWidth/2);
		          this.centerOnEvent(mouseEvent);
		        }
		     , events:{
		    	 	"mousemove": "mouseMoveHandler"
		    	 	,"touchmove": "mouseMoveHandler"
		    		,"mouseup" : "mouseUpHandler"
		    		,"touchend" : "mouseUpHandler" 
		      }
		        , centerOnEvent: function(mouseEvent){
		        	var mouseX     = mouseEvent.pageX;
			        var mouseY     = mouseEvent.pageY;
		        	if(mouseEvent.originalEvent.touches){
		        		 mouseX     = mouseEvent.originalEvent.touches[0].pageX;
				         mouseY     = mouseEvent.originalEvent.touches[0].pageY;
	     	        }
		        	


		         
		          this.tempForm.style.top = (mouseY - this.halfHeight) + "px";
		          this.tempForm.style.left = (mouseX - this.halfWidth) + "px";
		          // Make sure the element has been drawn and
		          // has height in the dom before triggering.
		          Events.trigger("tempMove", mouseEvent);
		        	
		        }
		       , mouseMoveHandler: function(mouseEvent) {
		          mouseEvent.preventDefault();
		          this.centerOnEvent(mouseEvent);
		        }
		        , mouseUpHandler: function(mouseEvent){
		          mouseEvent.preventDefault();
		          Events.trigger("tempDrop", mouseEvent, this.model);
		          this.remove();
		        }

		    

		    });
		  

});
