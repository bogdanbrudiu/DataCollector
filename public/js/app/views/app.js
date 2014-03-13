define(function (require) {
    var Backbone    = require('backbone');
    var _    = require('underscore');
	var Template = require('text!tpl/AppView.html');

    return Backbone.View.extend({
	template: _.template(Template),
        initialize: function (options) {
            //this.App = options.App;
            this.currentCollection = options.currentCollection;
            this.render();
            $(this.el).html(this.template());
            this.pleaseWaitDiv = $(this.el).find('#pleaseWaitDialog');
            this.hidePleaseWait();
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
            $(this.el).find('#btnTable').attr("href", '#metadata/' + this.currentCollection + '/table');
            $(this.el).find('#btnGrid').attr("href", '#metadata/' + this.currentCollection + '/grid');
            $(this.el).find('#btnAdd').attr("href", '#metadata/' + this.currentCollection + '/add');
            return this;
        },
        showPleaseWait: function() {
            this.pleaseWaitDiv.modal();
        },
        hidePleaseWait: function () {
            var delay = 500;
            var start = new Date().getTime();
            while (new Date().getTime() < start + delay);
            this.pleaseWaitDiv.modal('hide');
        },
       
    });
});