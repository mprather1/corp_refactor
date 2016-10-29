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

var UserView = Backbone.Marionette.View.extend({
  tagName: 'tr',
  template: "#user-row",
  serializeData: function(){
    return {
      "firstName": this.model.attributes.firstName.capitalizedFirstLetter(),
      "lastName": this.model.attributes.lastName.capitalizedFirstLetter(),
      "phone": this.model.attributes.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'),
      "email": "<a href='mailto:" + this.model.attributes.email + "'>" + this.model.attributes.email + "</a>"
    };
  }
});

var UsersView = Backbone.Marionette.CollectionView.extend({
  tagName: 'tbody',
  childView: UserView
})

var TableView = Backbone.Marionette.View.extend({
  tagName: 'div',
  className: 'panel panel-primary',
  template: '#table-view-template',
  regions: {
    head: {
      el: 'thead',
      replaceElement: true
    },
    body: {
      el: 'tbody',
      replaceElement: true
    },
    footer: {
      el: '#panel-buttons',
      replaceElement: true
    }
  },
  onRender: function(){
    this.showChildView('head', new TableHeader({
    }))
    this.showChildView('body', new UsersView({
      collection: this.collection
    }));
    this.showChildView('footer', new TableFooter({
      
    }))
  }
});

var TableHeader = Backbone.Marionette.View.extend({
  tagName: 'thead',
  className: 'thead thead-default',
  template: "#table-header-template"
})

var TableFooter = Backbone.Marionette.View.extend({
  tagName: 'div',
  // className: 'panel-buttons',
  template: "#table-footer-template"
})

var users = new Users();
users.fetch()

var tableView = new TableView({
  collection: users
})

var myApp = new Marionette.Application({
  region: "#main"
});

myApp.showView(tableView);