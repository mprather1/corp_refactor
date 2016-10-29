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
  className: 'container-fluid',
  template: '#table-template',
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
  template: "#table-header-template",
  events: {
    'mouseover .table-header': 'mouseoverFunc',
    'mouseout .table-header': 'mouseoutFunc'
  },
  mouseoverFunc: function(event){
    $(event.currentTarget).css({"background-color":"yellow","cursor":"pointer"});
  },
  mouseoutFunc: function(event){
    $(event.currentTarget).css("background-color", "#f5f5f5");
  }
})

var TableFooter = Backbone.Marionette.View.extend({
  tagName: 'div',
  className: 'panel-footer',
  template: "#table-footer-template"
})

var FormView = Backbone.Marionette.View.extend({
  initialize: function(){
    this.model = new User;
  },
  tagName: 'div',
  className: 'container-fluid',
  template: '#form-template',
  regions: {
    body: {
      el: 'form',
      replaceElement: true
    }
  },
  onRender: function(){
    this.showChildView('body', new UsersFormView({
      
    }))
  }
});

var UsersFormView = Backbone.Marionette.View.extend({
  template: '#users-form-template',
  
})

var SidebarView = Backbone.Marionette.View.extend({
  tagName: 'div',
  className: "container-fluid",
  template: '#sidebar-template',
  
})

var PageView = Backbone.Marionette.View.extend({
  tagName: "div",
  className: 'container-fluid',
  template: '#page-template',
  regions: {
    body: {
      el: '#table-view'
    },
    sidebar: {
      el: '#sidebar-view'
  },
  },
  onRender: function(){
    this.showChildView('body', new TableView({
      collection: this.collection
    }));
    this.showChildView('sidebar', new FormView({
      
    }));
  }
})

var users = new Users();
users.fetch()

var pageView = new PageView({
  collection: users
})

var myApp = new Marionette.Application({
  region: "#main"
});

myApp.showView(pageView);