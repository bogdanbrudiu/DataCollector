define([
       "jquery", "underscore", "backbone"
       , "helper/events" 	
      , "app/views/formBuilder/editor"
      
], function(
  $, _, Backbone, Events
  , OriginalEditorView
){
	
	
	
	
  return OriginalEditorView.extend({
	    events:{
	        "click"   : "preventPropagation" //stops checkbox / radio reacting.
	        , "mousedown" : "mouseDownHandler"
	        , "mouseup"   : "mouseUpHandler"
        	, "touchstart" : "mouseDownHandler"
        	, "touchend"   : "mouseUpHandler" 
	      },
	      close: function(){
			  this.undelegateEvents();
			},
	 
	      mouseDownHandler : function(mouseDownEvent){
	    	  console.log("mouseDownHandler");
	        mouseDownEvent.stopPropagation();
	        mouseDownEvent.preventDefault();
	       
	        
	        
	    	var mouseDownX     = mouseDownEvent.pageX;
	        var mouseDownY     = mouseDownEvent.pageY;
        	if(mouseDownEvent.originalEvent.touches){
        		mouseDownX     = mouseDownEvent.originalEvent.touches[0].pageX;
        		mouseDownY     = mouseDownEvent.originalEvent.touches[0].pageY;
 	        }
	        
	        	that=this;

	        	 $(".popover").remove();
	             this.$el.popover("show");
	             $(".popover #save").on("click", this.saveHandler(that));
	             $(".popover #cancel").on("click", this.cancelHandler(that));
	        	
	        	
	            $("body").on("touchmove mousemove", function(mouseMoveEvent){

	            	
	            	var mouseX     = mouseMoveEvent.pageX;
			        var mouseY     = mouseMoveEvent.pageY;
		        	if(mouseMoveEvent.originalEvent.touches){
		        		 mouseX     = mouseMoveEvent.originalEvent.touches[0].pageX;
				         mouseY     = mouseMoveEvent.originalEvent.touches[0].pageY;
	     	        }
		        	
	            	
	            	console.log("touchmove mousemove "+mouseDownX+" "+mouseX+","+mouseDownY+" "+mouseY);
	                if(
	      	                Math.abs(mouseDownX - mouseX) > 10 ||
	      	                Math.abs(mouseDownY - mouseY) > 10
	      	              ){
	      	            	  console.log("mySnippetDrag");
	      	            	  that.$el.popover('destroy');
	      	            	  Events.trigger("mySnippetDrag", mouseDownEvent, that.model);
	      	            	  that.mouseUpHandler();
	      	              };
	      	            } );

	        
	    }
  

	      , preventPropagation: function(e) {
	        e.stopPropagation();
	        e.preventDefault();
	      }

	      , mouseUpHandler : function(mouseUpEvent) {
	    	  console.log("mouseUpHandler");
	          $("body").off("mousemove");
	          $("body").off("touchmove");
	      }
	      
	      , saveHandler : function(boundContext) {
	          return function(mouseEvent) {
	            mouseEvent.preventDefault();
	            console.log("saveHandler");
	            $(".popover").remove();
	          }
	        }

	        , cancelHandler : function(boundContext) {
	          return function(mouseEvent) {
	            mouseEvent.preventDefault();
	            $(".popover").remove();
	            console.log("cancelHandler");
	            boundContext.model.trigger("change");
	          }
	        }
	      

	    });
		  

});
