define(function (require) {
    var Backbone    = require('backbone');
    var _    = require('underscore');
	var Template = require('text!tpl/AppView.html');

    return Backbone.View.extend({
	template: _.template(Template),
        initialize: function (options) {
            this.App = options.App;
            this.currentCollection = options.currentCollection;
           
            $(this.el).html(this.template());
            this.render();
            
        },
        changeModel: function (newModel) {
           
            if (this.currentCollection != newModel) {
                this.undelegateEvents();
                //this.initialize({currentCollection:newModel});
                this.currentCollection = newModel;
                this.render();
                return true;
            }
            return false;
        },
        render: function () {
            //$(this.el).html(this.template());
        	
        	//$(this.el).find('#btnMap').attr("href", '#metadata/' + this.currentCollection + '/map');
        	//if(this.App.currentEntityCollection && this.App.currentEntityCollection.getSchema().lat && this.App.currentEntityCollection.getSchema().lng){
        	//	$(this.el).find('#btnMap').show();
        	//}else{
        	//	$(this.el).find('#btnMap').hide();
        	//}
            $(this.el).find('#btnTable').attr("href", '#metadata/' + this.currentCollection + '/table');
            $(this.el).find('#btnAdd').attr("href", '#metadata/' + this.currentCollection + '/add');
            return this;
        }
       
    });
});