var Class  = require('uclass');
var filter = require('mout/array/filter');

var TempIgnore = new Class({

  Implements : [
    require('uclass/options')
  ],

  ignore_list : [],
  timer       : null,
  options     : {
    timeout : 5000
  },

  initialize : function(options) {
    var self = this;
    if (options)
      self.setOptions(options);
  },

  stack : function(key) {
    this.ignore_list.push({
      'key' : key,
      'datetime' : new Date().getTime()
    });
  },

  is_in : function(key) {
    this.purge_old();

    var matching_entries = filter(this.ignore_list, function(value, k) {
      return key == value.key;
    });

    var is_in = matching_entries.length > 0;
    if (is_in)
      this._destack(matching_entries[0]);

    return is_in
  },

  _destack : function(entry) {
    this.ignore_list.erase(entry);
  },

  purge_old : function() {
    var self = this;

    if (this.timer)
      clearInterval(this.timer);

    if (this.ignore_list.length > 0) {
      this.timer = setInterval(function() {
        var old_entries = filter(self.ignore_list, function(value, key) {
          return value.datetime + self.options.timeout < new Date().getTime();
        });
        if (old_entries.length > 0)
          self._destack(old_entries[0]);
        if (self.ignore_list.length == 0)
          clearInterval(self.timer);
      }, 1000);
    }
  }
});

module.exports = TempIgnore;
