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
    _simplaObservers: {
      type: Object,
      readonly: true,
      value: {}
    }
  },

  observers: [
    '_setData(_value, uid)'
  ],

  /**
   * Check for Simpla on element creation
   * @return {undefined}
   */
  created() {
    if (!window.Simpla) {
      console.error('Cannot find Simpla global');
    }
  },

  /**
   * Setup editable state observer on attach
   * @return {undefined}
   */
  attached() {
    this._observeEditable();
  },

  /**
   * Clean up Simpla observers on detach
   * @return {undefined}
   */
  detached() {
    Object.keys(this._simplaObservers)
      .forEach(observer => {
        this._simplaObservers[observer].unobserve();
      });
    this._simplaObservers = [];
  },


  /**
   * Init the UID whenever it changes
   * @param  {String} uid Current value of UID prop
   * @return {undefined}
   */
  _initUid(uid) {
    Simpla.get(uid)
      .then(item => {
        if (item && item.data) {
          this._value = item.data.markdown;
        }
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
      data: { markdown: value }
    });
  },

  /**
   * Data buffer observer
   * @param  {String} uid UID to observe in buffer
   * @return {undefined}
   */
  _observeBuffer(uid) {
    let observers = this._simplaObservers;

    if (!uid) {
      return;
    }

    if (observers.buffer) {
      observers.buffer.unobserve();
    }

    observers.buffer = Simpla.observe(uid, item => {
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
    let observers = this._simplaObservers;

    this.editable = Simpla.getState('editable');

    if (observers.editable) {
      observers.editable.unobserve();
    }

    observers.editable = Simpla.observeState('editable',
      editable => this.editable = editable
    );
  }
}