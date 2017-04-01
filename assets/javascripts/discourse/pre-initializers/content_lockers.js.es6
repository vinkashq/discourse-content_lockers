import ModalController from 'discourse/controllers/modal';

export default {
  name: 'content_lockers',
  before: 'inject-discourse-objects',
  initialize() {

    ModalController.reopen({
      secondsElapsed: -1,
      stopWatch: false,

      secondsRemaining: function() {
        const secondsToWait = this.get('secondsToWait');
        const secondsElapsed = this.get('secondsElapsed');

        if (secondsToWait && secondsToWait > secondsElapsed) {
          this.set('stopWatch', false);
          return secondsToWait - secondsElapsed;
        }

        if (secondsElapsed >= 0) {
          this.set('stopWatch', true);
          this.send('closeModal');
        }

        return 0;
      }.property('secondsToWait', 'secondsElapsed'),

      tick() {
        const self = this;

        this.set('secondsElapsed', this.get('secondsElapsed') + 1);
        if (this.get('stopWatch')) { return; }

        Ember.run.later((function() {
          self.tick();
        }), 1000);
      },

      onShow() {
        this.set('secondsElapsed', -1);
        this.set('stopWatch', false);
        this.tick();
      }

    });

  }
};
