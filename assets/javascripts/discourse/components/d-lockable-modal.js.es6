import { on } from "ember-addons/ember-computed-decorators";
import DiscourseModal from "discourse/components/d-modal";

export default DiscourseModal.extend({

  @on("didInsertElement")
  setUp() {
    if (this.get('isLocked') == false) {
      $('html').on('keydown.discourse-modal', e => {
        if (e.which === 27) {
          Em.run.next(() => $('.modal-header a.close').click());
        }
      });
    }

    this.appEvents.on('modal:body-shown', data => {
      if (data.title) {
        this.set('title', I18n.t(data.title));
      } else if (data.rawTitle) {
        this.set('title', data.rawTitle);
      }
    });
  },

  click(e) {
    const $target = $(e.target);
    if (($target.hasClass("modal-middle-container") ||
        $target.hasClass("modal-outer-container")) &&
        this.get('isLocked') == false) {
      // Delegate click to modal close if clicked outside.
      // We do this because some CSS of ours seems to cover
      // the backdrop and makes it unclickable.
      $('.modal-header a.close').click();
    }
  }

});
