'use strict';(function(modules){var installedModules={};function __webpack_require__(moduleId){if(installedModules[moduleId]){return installedModules[moduleId].exports}var module=installedModules[moduleId]={i:moduleId,l:false,exports:{}};modules[moduleId].call(module.exports,module,module.exports,__webpack_require__);module.l=true;return module.exports}__webpack_require__.m=modules;__webpack_require__.c=installedModules;__webpack_require__.d=function(exports,name,getter){if(!__webpack_require__.o(exports,name)){Object.defineProperty(exports,name,{configurable:false,enumerable:true,get:getter})}};__webpack_require__.n=function(module){var getter=module&&module.__esModule?function getDefault(){return module['default']}:function getModuleExports(){return module};__webpack_require__.d(getter,'a',getter);return getter};__webpack_require__.o=function(object,property){return Object.prototype.hasOwnProperty.call(object,property)};__webpack_require__.p='';return __webpack_require__(__webpack_require__.s=0)})([function(module,exports,__webpack_require__){module.exports=__webpack_require__(1)},function(module,exports){var modules=['ngRoute'];angular.module('cuneiformTextCorpus',modules).config(['$locationProvider','$routeProvider',function($locationProvider,$routeProvider){$locationProvider.html5Mode(false);$routeProvider.when('/',{templateUrl:'pages/home.html',controllerAs:'$ctrl',controller:function controller(){document.body.setAttribute('ng-section','home')}}).when('/etcsl/:href',{templateUrl:function templateUrl($routeParams){return'etcsl/'+$routeParams['href']+'.html'},controllerAs:'$ctrl',controller:function controller(){document.body.setAttribute('ng-section','etcsl')}}).otherwise({redirectTo:'/'});function toggleMenu(e){if(document.body.getAttribute('ng-section')==='home')return;var next=e.currentTarget;do{next=next.nextElementSibling}while(next&&next.nodeName.toLowerCase()!=='ul');var isHidden=next&&next.hasAttribute('hidden');var parent=e.currentTarget.closest('ul, nav');if(parent instanceof Element){parent.querySelectorAll('ul:not([hidden])').forEach(function(list){list.setAttribute('hidden','')})}if(next instanceof Element&&isHidden){next.removeAttribute('hidden')}}new MutationObserver(function(mutationsList){switch(mutationsList[0].oldValue){case'home':var navLists=document.querySelectorAll('body > nav ul');navLists.forEach(function(list){list.style.transition='none';list.setAttribute('hidden','')});setTimeout(function(){navLists.forEach(function(list){list.style.transition=''})},0);break;case null:document.querySelectorAll('body > nav ul').forEach(function(list){list.setAttribute('hidden','')});var nav=document.querySelector('body > nav[hidden]');if(nav instanceof Element)nav.removeAttribute('hidden');}}).observe(document.body,{attributeFilter:['ng-section'],attributeOldValue:true,attributes:true});document.querySelectorAll('body > nav a:not([href])').forEach(function(link){link.addEventListener('click',toggleMenu)});window.addEventListener('hashchange',function(){document.querySelectorAll('body > nav ul:not([hidden])').forEach(function(list){list.setAttribute('hidden','')})})}])}]);