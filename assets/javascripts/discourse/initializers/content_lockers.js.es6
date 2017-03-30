import { cleanDOM } from 'discourse/lib/clean-dom';
import { startPageTracking, onPageChange } from 'discourse/lib/page-tracker';
import { viewTrackingRequired } from 'discourse/lib/ajax';
import showLockableModal from 'discourse/plugins/content_lockers/discourse/lib/show-lockable-modal';

export default {
  name: "content_lockers",

  initialize(container) {
    if(Discourse.SiteSettings.guest_locker_enabled) {
      if (!Discourse.User.current()) {
        var pageView = 0;
        // Tell our AJAX system to track a page transition
        const router = container.lookup('router:main');
        router.on('willTransition', viewTrackingRequired);
        router.on('didTransition', cleanDOM);

        startPageTracking(router);

        onPageChange((url, title) => {
          var urlPrefix = "/t/";

          var pattern = new RegExp('^' + urlPrefix);
          var hasPrefix = pattern.test(url);
          if(hasPrefix) {
            pageView++;
            if (pageView >= Discourse.SiteSettings.guest_locker_topic_views_threshold) {
              showLockableModal('guest-locker');
            }
          }
        });
      }
    }
  }
};
