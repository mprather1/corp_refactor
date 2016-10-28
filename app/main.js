Backbone.Model.prototype.idAttribute = '_id';
String.prototype.capitalizedFirstLetter = function(){
  return this.charAt(0).toUpperCase() + this.slice(1);
};
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

var User = Backbone.Model.extend({
  urlRoot: "http://localhost:8000/api/users",
});

var Users = Backbone.Collection.extend({
  url: "http://localhost:8000/api/users",
  model: User
})

var TableView = Backbone.Marionette.View.extend({
  tagName: 'table',
  className: 'table table-hover',
  template: '#table-view-template',
  regions: {
    head: {
      el: 'thead'
    },
    body: {
      el: 'tbody'
    },
    footer: {
      el: 'tfoot'
    }
  },
  onRender: function(){
    this.showChildView('head', new TableHeader({
    }))
  }
});

var TableHeader = Backbone.Marionette.View.extend({
  tagName: 'thead',
  className: 'thead thead-default',
  template: "#table-header-template"
})

var tableView = new TableView({
  
})

var myApp = new Marionette.Application({
  region: "#main"
});

myApp.showView(tableView);