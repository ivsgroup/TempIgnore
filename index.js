"use strict";

const remove    = require('mout/array/remove');
const filter    = require('mout/array/filter');
const deepMixIn = require('mout/object/deepMixIn');

class TempIgnore {

  constructor(options) {
    this.ignore_list = [];
    this.timer       = null;
    this.options     = {
      timeout : 5000
    };

    deepMixIn(this.options, (options || {}));
  }

  stack(key) {
    this.ignore_list.push({
      'key' : key,
      'datetime' : new Date().getTime()
    });
  }

  is_in(key) {
    this.purge_old();

    var matching_entries = filter(this.ignore_list, function(value) {
      return key == value.key;
    });

    var is_in = matching_entries.length > 0;
    if(is_in)
      this._destack(matching_entries[0]);

    return is_in;
  }

  _destack(entry) {
    remove(this.ignore_list, entry);
  }

  purge_old() {
    if(this.timer)
      clearInterval(this.timer);

    if(this.ignore_list.length > 0) {
      this.timer = setInterval(() => {
        var old_entries = filter(this.ignore_list, (value) => {
          return value.datetime + this.options.timeout < new Date().getTime();
        });
        if(old_entries.length > 0)
          this._destack(old_entries[0]);
        if(this.ignore_list.length == 0)
          clearInterval(this.timer);
      }, 1000);
    }
  }

}

module.exports = TempIgnore;
