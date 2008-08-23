var Glider = Class.create({

  working: false,

  initialize: function(container, options, callback) {
    this.container = $(container);
    this.callback = callback;
    this.options = $H({ direction: 'x', transition: Effect.Transitions.sinoidal }).merge(options);
    this.sectionsContainer = this.container.down('.sections');
    this.sections = this.sectionsContainer.select('.section');
    this.container.setStyle({
      height: this.sections.first().getHeight() + 'px'
    });
    this.current = { section: this.sections[0], index: 0 };
    this.setInitial();
  },
  
  setInitial: function() {
    initial = null;
    if ((initialSection = this.sectionsContainer.select('.initial')).length == 1) {
      initial = initialSection[0];
    }
    if (document.location.href.indexOf('#') > 0) {
      initial = this.findSection(document.location.href.split('#').last());
    }
    if (initial) {
      this.show(initial.id, 0.0000000000001);
    }
  },

  findIndex: function(section) {
    index = 0;
    this.sections.each(function(s) {
      if (section.id == s.id) {
        throw $break;
      }
      index++;
    });
    return index;
  },
  
  findSection: function(section) {
    return this.sections.find(function(s) {
      return s.id == section;
    });
  },

  calculateEffects: function() {
    effects = [];
    direction = (this.current.index < index) ? -1 : 1;
    offsetX = 0;
    offsetY = 0;
    if (this.current.index < index) {
      for (i = this.current.index; i < index; i++) {
        offsetX += this.sections[i].getWidth();
        offsetY += this.sections[i].getHeight();
      }
    } else if (this.current.index > index) {
      for (i = index; i < this.current.index; i++) {
        offsetX += this.sections[i].getWidth();
        offsetY += this.sections[i].getHeight();
      }
    }
    effects.push(new Effect.Move(this.sectionsContainer, {
      x: (this.options.get('direction') == 'x' ? (offsetX * direction) : 0),
      y: (this.options.get('direction') == 'y' ? (offsetY * direction) : 0),
      transition: this.options.get('transition')
    }));
    if (this.options.get('direction') == 'x') {
      factor = this.sections[index].getWidth() / this.current.section.getWidth();
      scaleOptions = { scaleX: true, scaleY: false, scaleContent: false }
    } else {
      factor = this.sections[index].getHeight() / this.current.section.getHeight();
      scaleOptions = { scaleX: false, scaleY: true, scaleContent: false }
    }
    effects.push(new Effect.Scale(this.container, factor * 100, scaleOptions));
    return effects;
  },

  show: function(section, duration) {
    section = this.findSection(section);
    if (section == undefined) return;
    if (this.working) return;
    this.working = true;
    index = this.findIndex(section);
    effects = this.calculateEffects();
    new Effect.Parallel(effects, {
      duration: (duration || .6),
      afterFinish: function() {
        this.working = false;
      }.bind(this)
    });
    this.current = { section: section, index: index}
    if (this.options.get('onSlide')) {
      this.options.get('onSlide')(section);
    }
  }

});

var GliderLink = Class.create({

  initialize: function(link, glider) {
    this.link = $(link);
    this.glider = glider;
    this.link.observe('click', this.onclick.bindAsEventListener(this));
  },

  onclick: function(event) {
    Event.stop(event);
    this.glider.show(this.link.href.split('#')[1]);
  }

});