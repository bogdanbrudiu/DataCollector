define(function (require) {
    var Backbone    = require('backbone');
    var _    = require('underscore');    
    var Template = require('text!tpl/GridView.html');

    return Backbone.View.extend({
	template: _.template(Template),
        initialize: function () {
            var self = this;
            this.listenTo(this.model, 'backgrid:edited', function (model, selected) {
                if(model.changedAttributes()){
                    model.save();
                }
            });
            
            this.render();
           
        },
        render: function () {
            var columns = [{
                name: "_id", // The key of the model attribute
                label: "ID", // The name to display in the header
                editable: false, // By default every cell in a column is editable, but *ID* shouldn't be
                // Defines a cell type, and ID is displayed as an integer without the ',' separating 1000s.
                cell: "string"
            }, {
                name: "name",
                label: "name",
                cell: "string"
            }, {
                name: "schema",
                label: "schema",
                cell: "string"
            }, {
                name: "lastModified",
                label: "lastModified",
                editable: false,
                cell: "string"
            }, {
                name: "deleted",
                label: "deleted",
                editable: false,
                cell: "string"
            }];
            var CustomRow = Backgrid.Row.extend({
                initialize: function (options) {
                    var row = this;
                    this.listenTo(this.model, 'change', function (model) {
                        row.render();
                    });
                    CustomRow.__super__.initialize.apply(this, arguments);
                },
                render: function () {
                    Backgrid.Row.prototype.render.call(this)
                    if (this.model.get('deleted') == true) {
                        this.$el.addClass('danger')
                    } else {
                        if (this.model.get('lastModified') == '') {
                            this.$el.addClass('success')
                        } else {
                            if (this.model.get('isDirty') == true) {
                                this.$el.addClass('warning')
                            }
                        }
                    }
                    return this
                }
            })
    
    
    
    
            var pageableGrid = new Backgrid.Grid({
                columns: columns,
                collection: this.model,
                row: CustomRow,
            });
    
            //        var paginator = new Backgrid.Extension.Paginator({
            //            collection: this.model
            //        });
    
            var filter = new Backgrid.Extension.ClientSideFilter({
                collection: this.model,
                fields: ['firstName']
            });
            filter.$el.css({ float: "right", margin: "20px" });
            $(this.el).empty();
            $(this.el).append(pageableGrid.render().$el);
            //        $(this.el).append(paginator.render().$el);
            $(this.el).prepend(filter.render().$el);
        },
        changeModel: function (newModel) {
            this.undelegateEvents();
            this.model = newModel;
            this.initialize();
        },
    
    });
});