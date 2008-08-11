var Glider = Class.create({

  working: false,

  initialize: function(container, options, callback) {
    this.container = $(container);
    this.callback = callback;
    this.options = $H({ direction: 'x', transition: Effect.Transitions.sinoidal }).merge(options);
    this.sections = container.select('div.section');
    this.container.setStyle({
      height: this.sections.first().getHeight() + 'px'
    });
    this.current = { section: this.sections[0], index: 0 };
    if ((initial = this.container.select('div.initial')).length > 0) {
      this.show(initial[0].id, 0.0000000000001);
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

  calculateEffects: function() {
    effects = [];
    switch(this.options.get('direction')) {
      case 'x':
        this.sections.each(function(section) {
          effects.push(new Effect.Move(section, {
            x: section.getWidth() * (this.current.index - index),
            y: 0,
            transition: this.options.get('transition')
          }));
        }, this);
        break;
      case 'y':
        direction = (this.current.index < index) ? -1 : 1;
        offset = 0;
        if (this.current.index < index) {
          for (i = this.current.index; i < index; i++) {
            offset += this.sections[i].getHeight();
          }
        } else if (this.current.index > index) {
          for (i = index; i < this.current.index; i++) {
            offset += this.sections[i].getHeight();
          }
        }
        this.sections.each(function(section) {
          effects.push(new Effect.Move(section, {
            x: 0,
            y: offset * direction,
            transition: this.options.get('transition')
          }));
        }, this);
        factor = this.sections[index].getHeight() / this.current.section.getHeight();
        effects.push(new Effect.Scale(this.container, factor * 100, { scaleX: false, scaleContent: false }));
        break;
    }
    return effects;
  },

  show: function(section, duration) {
    if (this.working) {
      return;
    }
    section = this.container.select('#' + section)[0];
    if (section == undefined) {
      return;
    }
    index = this.findIndex(section);
    effects = this.calculateEffects();
    new Effect.Parallel(effects, {
      duration: (duration || .6),
      beforeStart: function() {
        this.working = true;
      },
      afterFinish: function() {
        this.working = false;
      }
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