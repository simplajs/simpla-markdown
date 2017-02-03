export default {
  properties: {
    uid: {
      type: String,
      observer: '_initUid'
    },

    _observers: {
      type: Object,
      value: {}
    }
  },

  observers: [
    '_setData(_value, uid)'
  ],

  attached() {
    this._observeEditable();
  },

  detached() {
    Object.keys(this._observers)
      .forEach(observer => {
        this._observers[observer].unobserve();
      });
  },

  _initUid(uid) {
    Simpla.get(uid)
      .then(item => {
        this._value = item.data.markdown
      });

    this._observeBuffer(uid);
  },

  _setData(value, uid) {
    Simpla.set(uid, {
      type: 'Article',
      data: {
        markdown: value
      }
    });
  },

  _observeBuffer(uid) {
    if (!uid) {
      return;
    }

    if (this._observers.buffer) {
      this._observers.buffer.unobserve();
    }

    this._observers.buffer = Simpla.observe(uid, item => {
      if (item && item.data) {
        this.value = item.data.markdown;
      }
    });
  },

  _observeEditable() {
    this.editable = Simpla.getState('editable');

    if (this._observers.editable) {
      this._observers.editable.unobserve();
    }

    this._observers.editable = Simpla.observeState('editable', editable => {
      this.editable = editable
    });
  }
}