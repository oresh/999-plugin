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
/***/ (function(module, exports) {

var default_sellers = [
    'imobil', 'chirie', 'gazda', 'globalprim-const', 'globalprim', 'rentapartment',
    'anghilina', 'goodtime', 'caseafaceri', 'dom-solutions', 'euroval-cons', 'chirii',
    'apppel', 'apartamentul-tau', 'platondumitrash', 'classapartment', 'vladasimplu123',
    'casaluminoasa', 'nighttime', 'exfactor', 'acces', 'abicom', 'ivan-botanika', 'imobio'
];
var resellers_el = document.getElementById('resellers');
var approved_sellers_el = document.getElementById('approved');
var status_el = document.getElementById('status');
resellers_el.addEventListener('keyup', save_options);
approved_sellers_el.addEventListener('keyup', save_options);
var timer;
function save_options() {
    var resellers = resellers_el.value;
    var approved = approved_sellers_el.value;
    chrome.storage.sync.set({
        resellersList: resellers.split('\n'),
        approvedList: approved.split('\n')
    }, function () {
        status_el.textContent = '';
        clearTimeout(timer);
        timer = setTimeout(function () {
            status_el.textContent = 'Options saved.';
        }, 1500);
    });
}
function restore_options() {
    chrome.storage.sync.get({
        resellersList: default_sellers,
        approvedList: ''
    }, function (items) {
        resellers_el.value = items.resellersList.join('\n');
        approved_sellers_el.value = items.approvedList.join('\n');
    });
}
document.addEventListener('DOMContentLoaded', restore_options);


/***/ })

/******/ });