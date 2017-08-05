/* !
 * @author Sean Coker <sean@seancoker.com>
 * @version 1.11.2
 * @url http://sean.is/poppin/tags
 * @license MIT
 * @description Taggle is a dependency-less tagging library
 */

'use strict';

const noop: Function = function(): any {};
const retTrue: Function = function(): boolean {
  return true;
};
const BACKSPACE: number = 8;
const COMMA: number = 188;
const TAB: number = 9;
const ENTER: number = 13;

interface TaggleDefaults {
  additionalTagClasses: string,
  allowDuplicates: boolean,
  saveOnBlur: boolean,
  clearOnBlur: boolean,
  duplicateTagClass: string,
  containerFocusClass: string,
  focusInputOnContainerClick: boolean,
  hiddenInputName: string,
  tags: string[],
  delimeter: string,
  attachTagId: boolean,
  allowedTags: string[],
  disallowedTags: string[],
  maxTags: number,
  tabIndex: number,
  placeholder: string,
  submitKeys: number[],
  preserveCase: boolean,
  onBeforeTagAdd: Function,
  inputFormatter: Function,
  tagFormatter: Function,
  onTagAdd: Function,
  onBeforeTagRemove: Function,
  onTagRemove: Function
}

const DEFAULTS: TaggleDefaults = {
  additionalTagClasses: '',
  allowDuplicates: false,
  saveOnBlur: false,
  clearOnBlur: true,
  duplicateTagClass: '',
  containerFocusClass: 'active',
  focusInputOnContainerClick: true,
  hiddenInputName: 'taggles[]',
  tags: [],
  delimeter: ',',
  attachTagId: false,
  allowedTags: [],
  disallowedTags: [],
  maxTags: null,
  tabIndex: 1,
  placeholder: 'Enter tags...',
  submitKeys: [COMMA, TAB, ENTER],
  preserveCase: false,
  inputFormatter: noop,
  tagFormatter: noop,
  onBeforeTagAdd: noop,
  onTagAdd: noop,
  onBeforeTagRemove: retTrue,
  onTagRemove: noop
};

function _isArray(arr: any): boolean {
  if (Array.isArray) {
    return Array.isArray(arr);
  }
  return Object.prototype.toString.call(arr) === '[object Array]';
}

function _on(element, eventName, handler): void {
  if (element.addEventListener) {
    element.addEventListener(eventName, handler, false);
  }
  else if (element.attachEvent) {
    element.attachEvent('on' + eventName, handler);
  }
  else {
    element['on' + eventName] = handler;
  }
}

function _trim(str: string): string {
  return str.replace(/^\s+|\s+$/g, '');
}

function _setText(el: HTMLElement, text: string): void {
  if ((<any>window).attachEvent && !window.addEventListener) { // <= IE8
    el.innerText = text;
  }
  else {
    el.textContent = text;
  }
}

interface TaggleMeasurements {
  container: {
    rect: ClientRect,
    style: CSSStyleDeclaration,
    padding: number
  }
}

interface TaggleTag {
  values: any[],
  elements: any[]
}

/**
 * Constructor
 * @param {Mixed} el ID of an element or the actual element
 * @param {Object} options
 */
export class Taggle {

  private settings: any;
  private measurements: TaggleMeasurements;
  private container: HTMLElement;
  private tag: TaggleTag;
  private list: HTMLUListElement;
  private inputLi: HTMLLIElement;
  private input: HTMLInputElement;
  private sizer: HTMLElement;
  private pasting: boolean;
  private placeholder: HTMLElement;
  private _id: number;

  constructor(el, options = {}) {
    this.settings = (<any>Object).assign({}, DEFAULTS, options);
    this.measurements = {
      container: {
        rect: null,
        style: null,
        padding: null
      }
    };
    this.container = el;
    this.tag = {
      values: [],
      elements: []
    };
    this.list = document.createElement('ul');
    this.inputLi = document.createElement('li');
    this.input = document.createElement('input');
    this.sizer = document.createElement('div');
    this.pasting = false;
    this.placeholder = null;

    if (this.settings.placeholder) {
      this.placeholder = document.createElement('span');
    }

    if (typeof el === 'string') {
      this.container = document.getElementById(el);
    }

    this._id = 0;
    this._setMeasurements();
    this._setupTextarea();
    this._attachEvents();
  }

  /**
   * Gets all the layout measurements up front
   */
  _setMeasurements(): void {
    this.measurements.container.rect = this.container.getBoundingClientRect();
    this.measurements.container.style = window.getComputedStyle(this.container);

    const style: CSSStyleDeclaration = this.measurements.container.style;
    const lpad: number = parseInt(style['padding-left'] || style.paddingLeft, 10);
    const rpad: number = parseInt(style['padding-right'] || style.paddingRight, 10);
    const lborder: number = parseInt(style['border-left-width'] || style.borderLeftWidth, 10);
    const rborder: number = parseInt(style['border-right-width'] || style.borderRightWidth, 10);

    this.measurements.container.padding = lpad + rpad + lborder + rborder;
  };

  /**
   * Setup the div container for tags to be entered
   */
  _setupTextarea(): void {
    let fontSize: string;

    this.list.className = 'taggle_list';
    this.input.type = 'text';
    // Make sure no left/right padding messes with the input sizing
    this.input.style.paddingLeft = '0';
    this.input.style.paddingRight = '0';
    this.input.className = 'taggle_input';
    this.input.tabIndex = this.settings.tabIndex;
    this.sizer.className = 'taggle_sizer';

    if (this.settings.tags.length) {
      for (let i = 0, len = this.settings.tags.length; i < len; i++) {
        let taggle: HTMLLIElement = this._createTag(this.settings.tags[i]);
        this.list.appendChild(taggle);
      }
    }

    if (this.placeholder) {
      this.placeholder.style.opacity = '0';
      this.placeholder.classList.add('taggle_placeholder');
      this.container.appendChild(this.placeholder);
      _setText(this.placeholder, this.settings.placeholder);

      if (!this.settings.tags.length) {
        this._showPlaceholder();
      }
    }

    let formattedInput = this.settings.inputFormatter(this.input);
    if (formattedInput) {
      this.input = formattedInput;
    }

    this.inputLi.appendChild(this.input);
    this.list.appendChild(this.inputLi);
    this.container.appendChild(this.list);
    this.container.appendChild(this.sizer);
    fontSize = window.getComputedStyle(this.input).fontSize;
    this.sizer.style.fontSize = fontSize;
  };

  /**
   * Attaches neccessary events
   */
  _attachEvents(): void {
    var self = this;

    if (this.settings.focusInputOnContainerClick) {
      _on(this.container, 'click', function() {
        self.input.focus();
      });
    }

    _on(this.input, 'focus', this._focusInput.bind(this));
    _on(this.input, 'blur', this._blurEvent.bind(this));
    _on(this.input, 'keydown', this._keydownEvents.bind(this));
    _on(this.input, 'keyup', this._keyupEvents.bind(this));
  };

  /**
   * Resizes the hidden input where user types to fill in the
   * width of the div
   */
  _fixInputWidth(): void {
    var width;
    var inputRect;
    var rect;
    var leftPos;
    var padding;

    this._setMeasurements();

    // Reset width incase we've broken to the next line on a backspace erase
    this._setInputWidth();

    inputRect = this.input.getBoundingClientRect();
    rect = this.measurements.container.rect;
    width = ~~rect.width;
    // Could probably just use right - left all the time
    // but eh, this check is mostly for IE8
    if (!width) {
      width = ~~rect.right - ~~rect.left;
    }
    leftPos = ~~inputRect.left - ~~rect.left;
    padding = this.measurements.container.padding;

    this._setInputWidth(width - leftPos - padding - 2);
  };

  /**
   * Returns whether or not the specified tag text can be added
   */
  _canAdd(e: Event, text: string): boolean {
    if (!text) {
      return false;
    }
    var limit = this.settings.maxTags;
    if (limit !== null && limit <= this.getTagValues().length) {
      return false;
    }

    if (this.settings.onBeforeTagAdd(e, text) === false) {
      return false;
    }

    if (!this.settings.allowDuplicates && this._hasDupes(text)) {
      return false;
    }

    var sensitive = this.settings.preserveCase;
    var allowed = this.settings.allowedTags;

    if (allowed.length && !this._tagIsInArray(text, allowed, sensitive)) {
      return false;
    }

    var disallowed = this.settings.disallowedTags;
    if (disallowed.length && this._tagIsInArray(text, disallowed, sensitive)) {
      return false;
    }

    return true;
  };

  /**
   * Returns whether a string is in an array based on case sensitivity
   */
  _tagIsInArray(text: string, arr: string[], caseSensitive: boolean): boolean {
    if (caseSensitive) {
      return arr.indexOf(text) !== -1;
    }

    var lowercased = [].slice.apply(arr).map(function(str) {
      return str.toLowerCase();
    });

    return lowercased.indexOf(text) !== -1;
  };

  /**
   * Appends tag with its corresponding input to the list
   */
  _add(e: Event, text: string = undefined): void {
    var self = this;
    var values = text || '';

    if (typeof text !== 'string') {
      values = _trim(this.input.value);
    }

    values.split(this.settings.delimeter).map(function(val) {
      return self._formatTag(val);
    }).forEach(function(val) {
      if (!self._canAdd(e, val)) {
        return;
      }

      var li = self._createTag(val);
      var lis = self.list.children;
      var lastLi = lis[lis.length - 1];
      self.list.insertBefore(li, lastLi);


      val = self.tag.values[self.tag.values.length - 1];

      self.settings.onTagAdd(e, val);

      self.input.value = '';
      self._fixInputWidth();
      self._focusInput();
    });
  };

  /**
   * Removes last tag if it has already been probed
   */
  _checkLastTag(e: KeyboardEvent): void {
    e = e || window.event as KeyboardEvent;

    var taggles = this.container.querySelectorAll('.taggle');
    var lastTaggle = taggles[taggles.length - 1];
    var hotClass = 'taggle_hot';
    var heldDown = this.input.classList.contains('taggle_back');

    // prevent holding backspace from deleting all tags
    if (this.input.value === '' && e.keyCode === BACKSPACE && !heldDown) {
      if (lastTaggle.classList.contains(hotClass)) {
        this.input.classList.add('taggle_back');
        this._remove(lastTaggle as HTMLLIElement, e);
        this._fixInputWidth();
        this._focusInput();
      }
      else {
        lastTaggle.classList.add(hotClass);
      }
    }
    else if (lastTaggle.classList.contains(hotClass)) {
      lastTaggle.classList.remove(hotClass);
    }
  };

  /**
   * Setter for the hidden input.
   */
  _setInputWidth(width: number = 0): void {
    this.input.style.width = (width || 10) + 'px';
  };

  /**
   * Checks global tags array if provided tag exists
   */
  _hasDupes(text: string): boolean {
    var needle = this.tag.values.indexOf(text);
    var tagglelist = this.container.querySelector('.taggle_list');
    var dupes;

    if (this.settings.duplicateTagClass) {
      dupes = tagglelist.querySelectorAll('.' + this.settings.duplicateTagClass);
      for (var i = 0, len = dupes.length; i < len; i++) {
        dupes[i].classList.remove(this.settings.duplicateTagClass);
      }
    }

    // if found
    if (needle > -1) {
      if (this.settings.duplicateTagClass) {
        var nodes: HTMLElement = tagglelist.childNodes[needle] as HTMLElement;
        nodes.classList.add(this.settings.duplicateTagClass);
      }
      return true;
    }

    return false;
  };

  /**
   * Checks whether or not the key pressed is acceptable
   */
  _isConfirmKey(key: number): boolean {
    var confirmKey = false;

    if (this.settings.submitKeys.indexOf(key) > -1) {
      confirmKey = true;
    }

    return confirmKey;
  };

  // Event handlers

  /**
   * Handles focus state of div container.
   */
  _focusInput(): void {
    this._fixInputWidth();

    if (!this.container.classList.contains(this.settings.containerFocusClass)) {
      this.container.classList.add(this.settings.containerFocusClass);
    }

    if (this.placeholder) {
      this.placeholder.style.opacity = '0';
    }
  };

  /**
   * Runs all the events that need to happen on a blur
   */
  _blurEvent(e: KeyboardEvent): void {
    if (this.container.classList.contains(this.settings.containerFocusClass)) {
      this.container.classList.remove(this.settings.containerFocusClass);
    }

    if (this.settings.saveOnBlur) {
      e = e || window.event as KeyboardEvent;

      this._listenForEndOfContainer();

      if (this.input.value !== '') {
        this._confirmValidTagEvent(e);
        return;
      }

      if (this.tag.values.length) {
        this._checkLastTag(e);
      }
    }
    else if (this.settings.clearOnBlur) {
      this.input.value = '';
      this._setInputWidth();
    }

    if (!this.tag.values.length && !this.input.value) {
      this._showPlaceholder();
    }
  };

  /**
   * Runs all the events that need to run on keydown
   */
  _keydownEvents(e: KeyboardEvent): void {
    e = e || window.event as KeyboardEvent;

    var key = e.keyCode;
    this.pasting = false;

    this._listenForEndOfContainer();

    if (key === 86 && e.metaKey) {
      this.pasting = true;
    }

    if (this._isConfirmKey(key) && this.input.value !== '') {
      this._confirmValidTagEvent(e);
      return;
    }

    if (this.tag.values.length) {
      this._checkLastTag(e);
    }
  };

  /**
   * Runs all the events that need to run on keyup
   */
  _keyupEvents(e: KeyboardEvent): void {
    e = e || window.event as KeyboardEvent;

    this.input.classList.remove('taggle_back');

    _setText(this.sizer, this.input.value);

    if (this.pasting && this.input.value !== '') {
      this._add(e);
      this.pasting = false;
    }
  };

  /**
   * Confirms the inputted value to be converted to a tag
   */
  _confirmValidTagEvent(e): void {
    e = e || window.event;

    // prevents from jumping out of textarea
    if (e.preventDefault) {
      e.preventDefault();
    }
    else {
      e.returnValue = false;
    }

    this._add(e);
  };

  /**
   * Approximates when the hidden input should break to the next line
   */
  _listenForEndOfContainer(): void {
    var width = this.sizer.getBoundingClientRect().width;
    var max = this.measurements.container.rect.width - this.measurements.container.padding;
    var size = parseInt(this.sizer.style.fontSize, 10);

    // 1.5 just seems to be a good multiplier here
    if (width + (size * 1.5) > parseInt(this.input.style.width, 10)) {
      this.input.style.width = max + 'px';
    }
  };

  _createTag(text: string): HTMLLIElement {
    var li = document.createElement('li');
    var close = document.createElement('button');
    var hidden = document.createElement('input');
    var span = document.createElement('span');

    text = this._formatTag(text);

    close.innerHTML = '&times;';
    close.className = 'close';
    close.type = 'button';
    _on(close, 'click', this._remove.bind(this, close));

    _setText(span, text);
    span.className = 'taggle_text';

    li.className = 'taggle ' + this.settings.additionalTagClasses;

    hidden.type = 'hidden';
    hidden.value = text;
    hidden.name = this.settings.hiddenInputName;

    li.appendChild(span);
    li.appendChild(close);
    li.appendChild(hidden);

    var formatted = this.settings.tagFormatter(li);

    if (typeof formatted !== 'undefined') {
      li = formatted;
    }

    if (!(li instanceof HTMLElement) || li.tagName !== 'LI') {
      throw new Error('tagFormatter must return an li element');
    }

    if (this.settings.attachTagId) {
      this._id += 1;
      var text_obj = {
        text: text,
        id: this._id
      };
    }

    this.tag.values.push(text_obj);
    this.tag.elements.push(li);

    return li;
  };

  _showPlaceholder(): void {
    if (this.placeholder) {
      this.placeholder.style.opacity = '1';
    }
  };

  /**
   * Removes tag from the tags collection
   */
  _remove(li: HTMLLIElement, e?: KeyboardEvent): void {
    var self = this;
    var text;
    var elem;
    var index;

    if (li.tagName.toLowerCase() !== 'li') {
      li = li.parentNode as HTMLLIElement;
    }

    elem = (li.tagName.toLowerCase() === 'a') ? li.parentNode : li;
    index = this.tag.elements.indexOf(elem);

    text = this.tag.values[index];

    function done(error: any = false) {
      if (error) {
        return;
      }

      li.parentNode.removeChild(li);

      // Going to assume the indicies match for now
      self.tag.elements.splice(index, 1);
      self.tag.values.splice(index, 1);

      self.settings.onTagRemove(e, text);

      self._focusInput();
    }

    var ret = this.settings.onBeforeTagRemove(e, text, done);

    if (!ret) {
      return;
    }

    done();
  };

  /**
   * Format the text for a tag
   */
  _formatTag(text: string): string {
    return this.settings.preserveCase ? text : text.toLowerCase();
  };

  getTags(): TaggleTag {
    return {
      elements: this.getTagElements(),
      values: this.getTagValues()
    };
  };

  // @todo
  // @deprecated use getTags().elements
  getTagElements() {
    return this.tag.elements;
  };

  // @todo
  // @deprecated use getTags().values
  getTagValues() {
    return [].slice.apply(this.tag.values);
  };

  getInput() {
    return this.input;
  };

  getContainer() {
    return this.container;
  };

  add(text): this {
    var isArr = _isArray(text);

    if (isArr) {
      for (var i = 0, len = text.length; i < len; i++) {
        if (typeof text[i] === 'string') {
          this._add(null, text[i]);
        }
      }
    }
    else {
      this._add(null, text);
    }

    return this;
  };

  remove(text, all): this {
    var len = this.tag.values.length - 1;
    var found = false;

    while (len > -1) {
      var tagText = this.tag.values[len];
      if (this.settings.attachTagId) {
        tagText = tagText.text;
      }

      if (tagText === text) {
        found = true;
        this._remove(this.tag.elements[len]);
      }

      if (found && !all) {
        break;
      }

      len--;
    }

    return this;
  };

  removeAll():this {
    for (var i = this.tag.values.length - 1; i >= 0; i--) {
      this._remove(this.tag.elements[i]);
    }

    this._showPlaceholder();

    return this;
  };

  setOptions(options): this {
    this.settings = (<any>Object).assign({}, this.settings, options || {});

    return this;
  };
}