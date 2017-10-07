import { cleanDOM } from 'discourse/lib/clean-dom';
import { startPageTracking } from 'discourse/lib/page-tracker';
import { viewTrackingRequired } from 'discourse/lib/ajax';
import showLockableModal from 'discourse/plugins/content_lockers/discourse/lib/show-lockable-modal';

export default {
  name: "content_lockers",
  after: 'inject-objects',

  initialize(container) {
    const siteSettings = container.lookup('site-settings:main');

    if(siteSettings.guest_locker_enabled || siteSettings.social_locker_enabled) {
      var topicsViewed = 0;
      // Tell our AJAX system to track a page transition
      const router = container.lookup('router:main');
      router.on('willTransition', viewTrackingRequired);
      router.on('didTransition', cleanDOM);

      let appEvents = container.lookup('app-events:main');
      startPageTracking(router, appEvents);

      appEvents.on('page:changed', data => {
        var showing = false;

        var topicPattern = new RegExp('^/t/');

        if (topicPattern.test(data.url)) {

          if (siteSettings.guest_locker_enabled && !Discourse.User.current()) {

            if (topicsViewed >= siteSettings.guest_locker_topic_views_threshold) {
              showLockableModal('guest-locker', {
                isCloseable: siteSettings.display_close_button_on_lockers,
                secondsToWait: siteSettings.guest_locker_waiting_seconds
              });
              showing = true;
            }

          }

          if (siteSettings.social_locker_enabled && !showing) {
            const status = $.cookie("social_locker");

            if (status == null || status != 'success') {
              const pageViewsThreshold = Discourse.User.current() ? siteSettings.social_locker_user_threshold : siteSettings.social_locker_guest_threshold;

              if ((pageViewsThreshold > 0) && (topicsViewed % pageViewsThreshold == 0)) {
                showLockableModal('social-locker', {
                  isCloseable: siteSettings.display_close_button_on_lockers,
                  secondsToWait: siteSettings.social_locker_waiting_seconds
                });
                showing = true;
              }
            }
          }

          topicsViewed++;

        }

      });
    }

  }
};
