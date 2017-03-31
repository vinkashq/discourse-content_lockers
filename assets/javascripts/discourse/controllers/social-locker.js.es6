import ModalFunctionality from 'discourse/mixins/modal-functionality';

export default Ember.Controller.extend(ModalFunctionality, {
  first_call: true,
  href: window.location.href,

  _bindFacebookEvents() {
    var self = this;
    if (typeof FB === 'undefined' || FB === null) {
      window.fbAsyncInit = function() {
        FB.Event.subscribe('edge.create', function(href, widget) {
          self.send('closeModal');
        });
        FB.Event.subscribe('message.send', function(href, widget) {
          self.send('closeModal');
        });
      };
    }
  },

  _bindTwitterEvents() {
    var self = this;
    if (typeof twttr.events === 'undefined' || twttr.events === null) {
      setTimeout(function () {
        self._bindTwitterEvents();
      }, 1000);
    } else {
      twttr.events.bind('tweet', function (event) {
        self.send('closeModal');
      });
      twttr.events.bind('follow', function (event) {
        self.send('closeModal');
      });
    }
  },

  onShow() {
    this.set('href', window.location.href);
    if (this.get('first_call')) {
      this._bindFacebookEvents();
      this._bindTwitterEvents();
      this.set('first_call', false);
    }
    setTimeout(function () {
      FB.XFBML.parse();
      twttr.widgets.load();
    }, 1000);
  },

  actions: {
    fbShare() {
      var self = this;
      FB.ui({
        method: 'share',
        href: self.get('href'),
      }, function(response) {
        if (response && !response.error_message) {
          self.send('closeModal');
        }
      });
    }
  }

});
