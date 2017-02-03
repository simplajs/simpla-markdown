export default {
  properties: {
    /**
     * Simpla data ID
     * @type {String}
     */
    uid: {
      type: String,
      observer: '_initUid'
    },

    /**
     * Stored Simpla observers
     * @type {Object}
     */
    _observers: {
      type: Object,
      value: {}
    }
  },

  observers: [
    '_setData(_value, uid)'
  ],

  /**
   * Setup editable state observer
   * Called by Polymer on attach
   * @return {undefined}
   */
  attached() {
    this._observeEditable();
  },

  /**
   * Clean up Simpla observers
   * Called by Polymer on detach
   * @return {undefined}
   */
  detached() {
    Object.keys(this._observers)
      .forEach(observer => {
        this._observers[observer].unobserve();
      });
  },

  /**
   * Init the UID whenever it changes
   * @param  {String} uid Current value of UID prop
   * @return {undefined}
   */
  _initUid(uid) {
    // Get data for UID
    Simpla.get(uid)
      .then(item => {
        this._value = item.data.markdown
      });

    // Setup data observer for future changes
    this._observeBuffer(uid);
  },

  /**
   * Set internal value to Simpla on change
   * @param {String} value Internal markdown source
   * @param {String} uid   Element UID
   * @return {Promise}
   */
  _setData(value, uid) {
    return Simpla.set(uid, {
      type: 'Article',
      data: {
        markdown: value
      }
    });
  },

  /**
   * Data buffer observer
   * @param  {String} uid UID to observe in buffer
   * @return {undefined}
   */
  _observeBuffer(uid) {
    if (!uid) {
      return;
    }

    // Clean up any old observers
    if (this._observers.buffer) {
      this._observers.buffer.unobserve();
    }

    this._observers.buffer = Simpla.observe(uid, item => {
      if (item && item.data) {
        this.value = item.data.markdown;
      }
    });
  },

  /**
   * Editable state observer
   * @return {undefined}
   */
  _observeEditable() {
    // Get initial value of editable
    this.editable = Simpla.getState('editable');

    // Clean up any old observers
    if (this._observers.editable) {
      this._observers.editable.unobserve();
    }

    this._observers.editable = Simpla.observeState('editable', editable => {
      this.editable = editable
    });
  }
}