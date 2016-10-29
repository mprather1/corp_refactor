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

var Users = Backbone.PageableCollection.extend({
  url: "http://localhost:8000/api/users",
  mode: 'client',
  model: User,
  state: {
    pageSize: 20,
    sortKey: 'id',
    order: 1
  },
  queryParams: {
    totalPages: null,
    totalRecords: null,
  },
});

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
  childView: UserView,
  initialize: function(){
    this.collection.setSorting('lastName', -1)
    this.collection.fullCollection.sort();
  }
})

var TableView = Backbone.Marionette.View.extend({
  initialize: function(){
    this.listenTo(Backbone, 'sort:users', this.sortUsers)
  },
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
    }));
  },
  sortUsers: function(flag){
    var name = flag.target.id;
    if (this.sortFlag === false){
      this.sortFlag = true;
      this.collection.setSorting(name, -1)
      this.collection.fullCollection.sort();
      this.collection.getFirstPage();
    } else {
      this.sortFlag = false;
      this.collection.setSorting(name, 1)
      this.collection.fullCollection.sort();
      this.collection.getFirstPage()
    }
  },
});

var TableHeader = Backbone.Marionette.View.extend({
  tagName: 'thead',
  className: 'thead thead-default',
  template: "#table-header-template",
  events: {
    'click .table-header': 'sortTable',
    'mouseover .table-header': 'mouseoverFunc',
    'mouseout .table-header': 'mouseoutFunc'
  },
  mouseoverFunc: function(event){
    $(event.currentTarget).css({"background-color":"yellow","cursor":"pointer"});
  },
  mouseoutFunc: function(event){
    $(event.currentTarget).css("background-color", "#f5f5f5");
  },
  sortTable: function(e){
    Backbone.trigger('sort:users', e);
  }
})

var TableFooter = Backbone.Marionette.View.extend({
  tagName: 'div',
  className: 'panel-footer',
  template: "#table-footer-template"
})

var FormView = Backbone.Marionette.View.extend({
  tagName: 'div',
  className: 'container-fluid',
  template: '#form-template',
  ui: {
    submit: '.submit-button',
    cancel: '.cancel-button'
  },
  events: {
    'click @ui.submit': "submitForm",
    'click @ui.cancel': 'cancelForm'
  },
  regions: {
    body: {
      el: 'form',
      replaceElement: true
    }
  },
  onRender: function(){
    this.showChildView('body', new UsersFormView({
      collection: this.collection,
      model: new User()
    }))
  },
  submitForm: function(e){
    e.preventDefault();
    Backbone.trigger('form:submit')
  },
  cancelForm: function(e){
    e.preventDefault();
    Backbone.trigger('form:cancel')
  }
});

var UsersFormView = Backbone.Marionette.View.extend({
  template: '#users-form-template',
  initialize: function(){
    this.listenTo(Backbone, 'form:submit', this.submitUsersForm)
  },
  submitUsersForm: function(){
    var userAttrs = {
      firstName: $('#firstName_input').val(),
      lastName: $('#lastName_input').val(),
      email: $('#email_input').val(),
      phone: $('#phone_input').val()
    };
    this.model.set(userAttrs);
    // if(this.model.isValid(true)){
      this.model.save();
      this.collection.add(this.model);
      // Backbone.Validation.unbind(this);
      Backbone.trigger('form:cancel')
    // }
  }
  
})

var SidebarView = Backbone.Marionette.View.extend({
  tagName: 'div',
  className: "container-fluid",
  template: '#sidebar-template',
  initialize: function(){
    this.listenTo(Backbone, 'form:cancel', this.render)
  },
  ui: {
    show: '.show-button'
  },
  events: {
    'click @ui.show': 'showForm'
  },
  regions: {
    body: {
      el: '.sidebar',
      replaceElement: true
    }
  },
  showForm: function(){
    this.showChildView('body', new FormView({
      collection: this.collection
    }))
  }
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
    this.showChildView('sidebar', new SidebarView({
      collection: this.collection
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