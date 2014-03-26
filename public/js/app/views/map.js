define([ 'backbone', 'underscore', 'text!tpl/MapView.html', 'backbone.googlemaps'
         ,'async!https://maps.googleapis.com/maps/api/js?key=AIzaSyDZtAcd6xOfGLeEIixSYA6DiAmvMOaxzuA&sensor=false'
         ],
		function (Backbone, _, Template, GoogleMaps, gmaps
				) {



    
  
    
    
    return Backbone.View.extend({
    	template: _.template(Template),

    	 initialize: function (options) {
             this.App = options.App;
             this.places = new GoogleMaps.LocationCollection();
             _.each(this.model.models, function (value, key, list) {
            	 this.places.add([{title:value.get('label'), lat:value.get('lat'),lng:value.get('lng')}]);
             }, this);
             
       
             
             this.render();
         },
         changeModel: function (newModel) {
             this.model = newModel;
             this.initialize({App:this.App});
         },
         render: function () {
             $(this.el).html(this.template());
             var mapOptions = {
            	      center: new google.maps.LatLng(45.75684, 21.221289),
            	      zoom: 12,
            	      mapTypeId: google.maps.MapTypeId.ROADMAP
            	    }

            	    // Instantiate map
            	    var map = new google.maps.Map($('#map_canvas')[0], mapOptions);

            	    // Render Markers
            	    var markerCollectionView = new GoogleMaps.MarkerCollectionView({
            	      collection: this.places,
            	      map: map
            	    });
            	    markerCollectionView.render();
             return this;
         }
    });
});