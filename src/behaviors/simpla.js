export default {
  properties: {
    /**
     * Simpla data path
     * @type {String}
     */
    path: {
      type: String,
      observer: '_initPath'
    },

    /**
     * Stored Simpla observers
     * @type {Object}
     */
    _simplaObservers: {
      type: Object,
      readonly: true,
      value: () => ({})
    }
  },

  observers: [
    '_updateBuffer(value)'
  ],

  /**
   * Check Simpla is ready and setup editable state observer on attach
   * @return {undefined}
   */
  attached() {
    this._checkSimpla();
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

  _checkSimpla() {
    if (!window.Simpla) {
      console.error('Cannot find Simpla global');
      return false;
    }

    if (!window.Simpla.getState('config').project) {
      console.error('You must initialise a Simpla project before using simpla-markdown')
      return false;
    }
  },

  /**
   * Init the data / buffer observer whenever path changes
   * @param  {String} path Path to content on Simpla's API
   * @return {undefined}
   */
  _initPath(path) {
    if (!path) {
      return;
    }

    this._observeBuffer(path);
    Simpla.get(path)
      .then(item => this._setValue(item));
  },

  /**
   * Data buffer observer
   * @param  {String} path path to observe in buffer
   * @return {undefined}
   */
  _observeBuffer(path) {
    let observers = this._simplaObservers;

    if (observers.buffer) {
      observers.buffer.unobserve();
    }

    observers.buffer = Simpla.observe(path, item => this._setValue(item));
  },

  /**
   * Set value to Simpla on change
   * @param {String} value Internal markdown source
   * @param {String} path  Element path
   * @return {Promise}
   */
  _updateBuffer(value) {
    if (!this.path) {
      return;
    }

    return Simpla.set(this.path, {
      type: 'Article',
      data: { html: value }
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
  },

  _setValue(item) {
    if (item.path === this.path) {
      this.value = item.data.html || '';
    }
  }
}
