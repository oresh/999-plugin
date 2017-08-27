/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ({

/***/ 8:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var taggle_1 = __webpack_require__(9);
var default_sellers = [
    'imobil', 'chirie', 'gazda', 'globalprim-const', 'globalprim', 'rentapartment',
    'anghilina', 'goodtime', 'caseafaceri', 'dom-solutions', 'euroval-cons', 'chirii',
    'apppel', 'apartamentul-tau', 'platondumitrash', 'classapartment', 'vladasimplu123',
    'casaluminoasa', 'nighttime', 'exfactor', 'acces', 'abicom', 'ivan-botanika', 'imobio'
];
var status_el = document.getElementById('status');
var timer;
var resellers_taggle;
var approved_taggle;
function approved_to_obj(approved) {
    var approved_obj = {};
    approved.forEach(function (el) {
        approved_obj[el] = true;
    });
    return approved_obj;
}
function obj_to_approved(obj) {
    var props = Object.getOwnPropertyNames(obj);
    return props;
}
function save_options() {
    var resellers = resellers_taggle.getTags().values;
    var approved = approved_taggle.getTags().values;
    chrome.storage.sync.set({
        resellersList: resellers,
        approvedList: approved_to_obj(approved)
    }, function () {
        clearTimeout(timer);
        status_el.textContent = 'Options saved.';
        timer = setTimeout(function () {
            status_el.textContent = '';
        }, 1000);
    });
}
function restore_options() {
    chrome.storage.sync.get({
        resellersList: default_sellers,
        approvedList: []
    }, function (items) {
        resellers_taggle = new taggle_1.Taggle('resellers_taggle', {
            tags: items.resellersList || default_sellers,
            onTagAdd: save_options,
            onTagRemove: save_options
        });
        var approved = obj_to_approved(items.approvedList);
        if (obj_to_approved(items.approvedList).length) {
            approved_taggle = new taggle_1.Taggle('approved_taggle', {
                tags: obj_to_approved(items.approvedList),
                onTagAdd: save_options,
                onTagRemove: save_options
            });
        }
        else {
            approved_taggle = new taggle_1.Taggle('approved_taggle', {
                onTagAdd: save_options,
                onTagRemove: save_options
            });
        }
    });
}
document.addEventListener('DOMContentLoaded', restore_options);


/***/ }),

/***/ 9:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
'use strict';
var noop = function () { };
var retTrue = function () {
    return true;
};
var BACKSPACE = 8;
var COMMA = 188;
var TAB = 9;
var ENTER = 13;
var DEFAULTS = {
    additionalTagClasses: "",
    allowDuplicates: false,
    saveOnBlur: false,
    clearOnBlur: true,
    duplicateTagClass: "",
    containerFocusClass: "active",
    focusInputOnContainerClick: true,
    hiddenInputName: "taggles[]",
    tags: [],
    delimeter: ",",
    attachTagId: false,
    allowedTags: [],
    disallowedTags: [],
    maxTags: null,
    tabIndex: 1,
    placeholder: "Enter tags...",
    submitKeys: [COMMA, TAB, ENTER],
    preserveCase: false,
    inputFormatter: noop,
    tagFormatter: noop,
    onBeforeTagAdd: noop,
    onTagAdd: noop,
    onBeforeTagRemove: retTrue,
    onTagRemove: noop
};
function _isArray(arr) {
    if (Array.isArray) {
        return Array.isArray(arr);
    }
    return Object.prototype.toString.call(arr) === "[object Array]";
}
function _on(element, eventName, handler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, handler, false);
    }
    else if (element.attachEvent) {
        element.attachEvent("on" + eventName, handler);
    }
    else {
        element["on" + eventName] = handler;
    }
}
function _trim(str) {
    return str.replace(/^\s+|\s+$/g, "");
}
function _setText(el, text) {
    if (window.attachEvent && !window.addEventListener) {
        el.innerText = text;
    }
    else {
        el.textContent = text;
    }
}
var Taggle = (function () {
    function Taggle(el, options) {
        if (options === void 0) { options = {}; }
        this.settings = Object.assign({}, DEFAULTS, options);
        this.measurements = {
            container: {
                rect: ClientRect,
                style: null,
                padding: null
            }
        };
        this.container = el;
        this.tag = {
            values: [],
            elements: []
        };
        this.list = document.createElement("ul");
        this.inputLi = document.createElement("li");
        this.input = document.createElement("input");
        this.sizer = document.createElement("div");
        this.pasting = false;
        this.placeholder = null;
        if (this.settings.placeholder) {
            this.placeholder = document.createElement("span");
        }
        if (typeof el === "string") {
            this.container = document.getElementById(el);
        }
        this._id = 0;
        this._setMeasurements();
        this._setupTextarea();
        this._attachEvents();
    }
    Taggle.prototype._setMeasurements = function () {
        this.measurements.container.rect = this.container.getBoundingClientRect();
        this.measurements.container.style = window.getComputedStyle(this.container);
        var style = this.measurements.container.style;
        var lpad = parseInt(style["padding-left"] || style.paddingLeft, 10);
        var rpad = parseInt(style["padding-right"] || style.paddingRight, 10);
        var lborder = parseInt(style["border-left-width"] || style.borderLeftWidth, 10);
        var rborder = parseInt(style["border-right-width"] || style.borderRightWidth, 10);
        this.measurements.container.padding = lpad + rpad + lborder + rborder;
    };
    ;
    Taggle.prototype._setupTextarea = function () {
        var fontSize;
        this.list.className = "taggle_list";
        this.input.type = "text";
        this.input.style.paddingLeft = "0";
        this.input.style.paddingRight = "0";
        this.input.className = "taggle_input";
        this.input.tabIndex = this.settings.tabIndex;
        this.sizer.className = "taggle_sizer";
        if (this.settings.tags.length) {
            for (var i = 0, len = this.settings.tags.length; i < len; i++) {
                var taggle = this._createTag(this.settings.tags[i]);
                this.list.appendChild(taggle);
            }
        }
        if (this.placeholder) {
            this.placeholder.style.opacity = "0";
            this.placeholder.classList.add("taggle_placeholder");
            this.container.appendChild(this.placeholder);
            _setText(this.placeholder, this.settings.placeholder);
            if (!this.settings.tags.length) {
                this._showPlaceholder();
            }
        }
        var formattedInput = this.settings.inputFormatter(this.input);
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
    ;
    Taggle.prototype._attachEvents = function () {
        var self = this;
        if (this.settings.focusInputOnContainerClick) {
            _on(this.container, "click", function () {
                self.input.focus();
            });
        }
        _on(this.input, "focus", this._focusInput.bind(this));
        _on(this.input, "blur", this._blurEvent.bind(this));
        _on(this.input, "keydown", this._keydownEvents.bind(this));
        _on(this.input, "keyup", this._keyupEvents.bind(this));
    };
    ;
    Taggle.prototype._fixInputWidth = function () {
        var width;
        var inputRect;
        var rect;
        var leftPos;
        var padding;
        this._setMeasurements();
        this._setInputWidth();
        inputRect = this.input.getBoundingClientRect();
        rect = this.measurements.container.rect;
        width = ~~rect.width;
        if (!width) {
            width = ~~rect.right - ~~rect.left;
        }
        leftPos = ~~inputRect.left - ~~rect.left;
        padding = this.measurements.container.padding;
        this._setInputWidth(width - leftPos - padding - 2);
    };
    ;
    Taggle.prototype._canAdd = function (e, text) {
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
    ;
    Taggle.prototype._tagIsInArray = function (text, arr, caseSensitive) {
        if (caseSensitive) {
            return arr.indexOf(text) !== -1;
        }
        var lowercased = [].slice.apply(arr).map(function (str) {
            return str.toLowerCase();
        });
        return lowercased.indexOf(text) !== -1;
    };
    ;
    Taggle.prototype._add = function (e, text) {
        if (text === void 0) { text = undefined; }
        var self = this;
        var values = text || "";
        if (typeof text !== "string") {
            values = _trim(this.input.value);
        }
        values.split(this.settings.delimeter).map(function (val) {
            return self._formatTag(val);
        }).forEach(function (val) {
            if (!self._canAdd(e, val)) {
                return;
            }
            var li = self._createTag(val);
            var lis = self.list.children;
            var lastLi = lis[lis.length - 1];
            self.list.insertBefore(li, lastLi);
            val = self.tag.values[self.tag.values.length - 1];
            self.settings.onTagAdd(e, val);
            self.input.value = "";
            self._fixInputWidth();
            self._focusInput();
        });
    };
    ;
    Taggle.prototype._checkLastTag = function (e) {
        e = e || window.event;
        var taggles = this.container.querySelectorAll(".taggle");
        var lastTaggle = taggles[taggles.length - 1];
        var hotClass = "taggle_hot";
        var heldDown = this.input.classList.contains("taggle_back");
        if (this.input.value === "" && e.keyCode === BACKSPACE && !heldDown) {
            if (lastTaggle.classList.contains(hotClass)) {
                this.input.classList.add("taggle_back");
                this._remove(lastTaggle, e);
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
    ;
    Taggle.prototype._setInputWidth = function (width) {
        if (width === void 0) { width = 0; }
        this.input.style.width = (width || 10) + "px";
    };
    ;
    Taggle.prototype._hasDupes = function (text) {
        var needle = this.tag.values.indexOf(text);
        var tagglelist = this.container.querySelector(".taggle_list");
        var dupes;
        if (this.settings.duplicateTagClass) {
            dupes = tagglelist.querySelectorAll("." + this.settings.duplicateTagClass);
            for (var i = 0, len = dupes.length; i < len; i++) {
                dupes[i].classList.remove(this.settings.duplicateTagClass);
            }
        }
        if (needle > -1) {
            if (this.settings.duplicateTagClass) {
                var nodes = tagglelist.childNodes[needle];
                nodes.classList.add(this.settings.duplicateTagClass);
            }
            return true;
        }
        return false;
    };
    ;
    Taggle.prototype._isConfirmKey = function (key) {
        var confirmKey = false;
        if (this.settings.submitKeys.indexOf(key) > -1) {
            confirmKey = true;
        }
        return confirmKey;
    };
    ;
    Taggle.prototype._focusInput = function () {
        this._fixInputWidth();
        if (!this.container.classList.contains(this.settings.containerFocusClass)) {
            this.container.classList.add(this.settings.containerFocusClass);
        }
        if (this.placeholder) {
            this.placeholder.style.opacity = "0";
        }
    };
    ;
    Taggle.prototype._blurEvent = function (e) {
        if (this.container.classList.contains(this.settings.containerFocusClass)) {
            this.container.classList.remove(this.settings.containerFocusClass);
        }
        if (this.settings.saveOnBlur) {
            e = e || window.event;
            this._listenForEndOfContainer();
            if (this.input.value !== "") {
                this._confirmValidTagEvent(e);
                return;
            }
            if (this.tag.values.length) {
                this._checkLastTag(e);
            }
        }
        else if (this.settings.clearOnBlur) {
            this.input.value = "";
            this._setInputWidth();
        }
        if (!this.tag.values.length && !this.input.value) {
            this._showPlaceholder();
        }
    };
    ;
    Taggle.prototype._keydownEvents = function (e) {
        e = e || window.event;
        var key = e.keyCode;
        this.pasting = false;
        this._listenForEndOfContainer();
        if (key === 86 && e.metaKey) {
            this.pasting = true;
        }
        if (this._isConfirmKey(key) && this.input.value !== "") {
            this._confirmValidTagEvent(e);
            return;
        }
        if (this.tag.values.length) {
            this._checkLastTag(e);
        }
    };
    ;
    Taggle.prototype._keyupEvents = function (e) {
        e = e || window.event;
        this.input.classList.remove("taggle_back");
        _setText(this.sizer, this.input.value);
        if (this.pasting && this.input.value !== "") {
            this._add(e);
            this.pasting = false;
        }
    };
    ;
    Taggle.prototype._confirmValidTagEvent = function (e) {
        e = e || window.event;
        if (e.preventDefault) {
            e.preventDefault();
        }
        else {
            e.returnValue = false;
        }
        this._add(e);
    };
    ;
    Taggle.prototype._listenForEndOfContainer = function () {
        var width = this.sizer.getBoundingClientRect().width;
        var max = this.measurements.container.rect.width - this.measurements.container.padding;
        var size = parseInt(this.sizer.style.fontSize, 10);
        if (width + (size * 1.5) > parseInt(this.input.style.width, 10)) {
            this.input.style.width = max + "px";
        }
    };
    ;
    Taggle.prototype._createTag = function (text) {
        var li = document.createElement("li");
        var close = document.createElement("button");
        var hidden = document.createElement("input");
        var span = document.createElement("span");
        text = this._formatTag(text);
        close.innerHTML = "&times;";
        close.className = "close";
        close.type = "button";
        _on(close, "click", this._remove.bind(this, close));
        _setText(span, text);
        span.className = "taggle_text";
        li.className = "taggle " + this.settings.additionalTagClasses;
        hidden.type = "hidden";
        hidden.value = text;
        hidden.name = this.settings.hiddenInputName;
        li.appendChild(span);
        li.appendChild(close);
        li.appendChild(hidden);
        var formatted = this.settings.tagFormatter(li);
        if (typeof formatted !== "undefined") {
            li = formatted;
        }
        if (!(li instanceof HTMLElement) || li.tagName !== "LI") {
            throw new Error("tagFormatter must return an li element");
        }
        if (this.settings.attachTagId) {
            this._id += 1;
            text = {
                text: text,
                id: this._id
            };
        }
        this.tag.values.push(text);
        this.tag.elements.push(li);
        return li;
    };
    ;
    Taggle.prototype._showPlaceholder = function () {
        if (this.placeholder) {
            this.placeholder.style.opacity = "1";
        }
    };
    ;
    Taggle.prototype._remove = function (li, e) {
        if (e === void 0) { e = false; }
        var self = this;
        var text;
        var elem;
        var index;
        if (li.tagName.toLowerCase() !== "li") {
            li = li.parentNode;
        }
        elem = (li.tagName.toLowerCase() === "a") ? li.parentNode : li;
        index = this.tag.elements.indexOf(elem);
        text = this.tag.values[index];
        function done(error) {
            if (error === void 0) { error = false; }
            if (error) {
                return;
            }
            li.parentNode.removeChild(li);
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
    ;
    Taggle.prototype._formatTag = function (text) {
        return this.settings.preserveCase ? text : text.toLowerCase();
    };
    ;
    Taggle.prototype.getTags = function () {
        return {
            elements: this.getTagElements(),
            values: this.getTagValues()
        };
    };
    ;
    Taggle.prototype.getTagElements = function () {
        return this.tag.elements;
    };
    ;
    Taggle.prototype.getTagValues = function () {
        return [].slice.apply(this.tag.values);
    };
    ;
    Taggle.prototype.getInput = function () {
        return this.input;
    };
    ;
    Taggle.prototype.getContainer = function () {
        return this.container;
    };
    ;
    Taggle.prototype.add = function (text) {
        var isArr = _isArray(text);
        if (isArr) {
            for (var i = 0, len = text.length; i < len; i++) {
                if (typeof text[i] === "string") {
                    this._add(null, text[i]);
                }
            }
        }
        else {
            this._add(null, text);
        }
        return this;
    };
    ;
    Taggle.prototype.remove = function (text, all) {
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
    ;
    Taggle.prototype.removeAll = function () {
        for (var i = this.tag.values.length - 1; i >= 0; i--) {
            this._remove(this.tag.elements[i]);
        }
        this._showPlaceholder();
        return this;
    };
    ;
    Taggle.prototype.setOptions = function (options) {
        this.settings = Object.assign({}, this.settings, options || {});
        return this;
    };
    ;
    return Taggle;
}());
exports.Taggle = Taggle;


/***/ })

/******/ });