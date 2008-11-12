var Glider = Class.create({

  initialize: function(container, options, callback) {
    this.container = $(container);
    this.callback = callback;
    this.options = $H({ direction: 'x', transition: Effect.Transitions.sinoidal, duration: .6 }).merge(options);
    this.sectionsContainer = this.container.down('.sections');
    this.sectionInfo = this.collectSectionInfo();
    this.container.setStyle({
      height: this.sectionInfo.first().section.getHeight() + 'px',
      width: this.sectionInfo.first().section.getWidth() + 'px'
    });
    this.setInitialSection();
  },
  
  collectSectionInfo: function() {
    counter = -1;
    sections = this.sectionsContainer.select('.section');
    return sections.map(function(section) {
      counter++;
      return {
        section: $(section),
        index: counter,
        left: function() {
          left = 0;
          for (i = 0; i < counter; i++) {
            left += sections[i].getWidth();
          }
          return left;
        }.bind(this)(),
        top: function() {
          top = 0;
          for (i = 0; i < counter; i++) {
            top += sections[i].getHeight();
          }
          return top;
        }.bind(this)()
      }
    }.bind(this));
  },

  setInitialSection: function() {
    initial = null;
    if (document.location.href.indexOf('#') > 0) {
      initial = this.sectionInfo.find(function(sectionInfo) {
        return sectionInfo.section.id == document.location.href.split('#').last();
      });
      initial = initial ? initial.section : null;
    }
    if (!initial && (initialSection = this.sectionsContainer.select('.initial')).length == 1) {
      initial = initialSection[0];
    }
    if (!initial) {
      initial = this.sectionInfo.first().section;
    }
    this.show(initial.id, 0.0000000000001);
  },

  getSectionInfo: function(id) {
    return this.sectionInfo.find(function(sectionInfo) {
      return sectionInfo.section.id == id;
    });
  },

  calculateEffects: function(sectionInfo, duration) {
    effects = [];
    movements = { x: 0, y: 0 }
    scales =    { x: false, y: false, factor: 1}
    if (this.options.get('direction') == 'x') {
      direction = (this.sectionsContainer.positionedOffset().left + sectionInfo.left) > 0 ? -1 : 1;
      movements.x   = (Math.abs(this.sectionsContainer.positionedOffset().left + sectionInfo.left) * direction)
      scales.factor = sectionInfo.section.getWidth() / this.container.getWidth();
      scales.x      = true;
    } else {
      direction = (this.sectionsContainer.positionedOffset().top + sectionInfo.top) > 0 ? -1 : 1;
      movements.y   = (Math.abs(this.sectionsContainer.positionedOffset().top + sectionInfo.top) * direction)
      scales.factor = sectionInfo.section.getHeight() / this.container.getHeight();
      scales.y      = true;
    }
    effects.push(new Effect.Move(this.sectionsContainer, {
      duration: duration,
      x: movements.x,
      y: movements.y,
      transition: this.options.get('transition'),
      queue: { scope: 'simplabs:glider' }
    }));
    if (scales.factor != 1) {
      effects.push(new Effect.Scale(this.container, scales.factor * 100, {
        duration: duration,
        scaleX: scales.x,
        scaleY: scales.y,
        scaleContent: false,
        queue: { scope: 'simplabs:glider' }
      }));
    }
    return effects;
  },

  show: function(sectionId, duration) {
    duration = duration || this.options.get('duration');
    Effect.Queues.get('simplabs:glider').each(function(effect) { effect.cancel(); });
    sectionInfo = this.getSectionInfo(sectionId);
    if (sectionInfo == undefined) {
      return;
    }
    effects = this.calculateEffects(sectionInfo, duration);
    new Effect.Parallel(effects, {
      duration: duration,
      queue: { scope: 'simplabs:glider' }
    });
    if (this.options.get('onSlide')) {
      this.options.get('onSlide')(sectionInfo.section);
    }
  },
  
});

var GliderLink = Class.create({

  initialize: function(link, glider) {
    this.link = $(link);
    this.glider = glider;
    this.link.observe('click', this.onclick.bindAsEventListener(this));
  },

  onclick: function(event) {
    Event.stop(event);
    this.glider.show(this.link.href.split('#').last());
  }

});
