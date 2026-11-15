/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,e$4=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$4&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$4)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$4?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$3,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$3(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i$1=t=>t,s$1=t.trustedTypes,e$2=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$2=`lit$${Math.random().toFixed(9).slice(2)}$`,n$1="?"+o$2,r$2=`<${n$1}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),w=x(2),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$2?e$2.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$2:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$2+x):s+o$2+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$2),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$2)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$2),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n$1)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$2,t+1));)d.push({type:7,index:l}),t+=o$2.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t.litHtmlPolyfillSupport;B?.(S,k),(t.litHtmlVersions??=[]).push("3.3.2");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t,true,r);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t,true,r);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:true,attribute:false})}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e$1=(e,t,c)=>(c.configurable=true,c.enumerable=true,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,c),c);

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function e(e,r){return (n,s,i)=>{const o=t=>t.renderRoot?.querySelector(e)??null;return e$1(n,s,{get(){return o(this)}})}}

/**
 * Config for GoogleService
 */
const CONFIG = {
    GOOGLE: {
        MAX_RETRIES: 3,
        RETRY_DELAY_MS: 1000,
        FETCH_TIMEOUT_MS: 6000,
    },
};
/**
 * Service for translating and romanizing text using Google Translate (unofficial API)
 */
class GoogleService {
    static delay(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
    static fetchWithTimeout(url, timeoutMs = CONFIG.GOOGLE.FETCH_TIMEOUT_MS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
    }
    static isPurelyLatinScript(text) {
        // Basic check for Latin script characters plus common punctuation and numbers
        // eslint-disable-next-line no-control-regex
        return /^[\u0000-\u007F\u0080-\u00FF\u0100-\u017F\u0180-\u024F]*$/.test(text);
    }
    static async translate(textOrArray, targetLang) {
        if (!textOrArray ||
            (Array.isArray(textOrArray) && textOrArray.length === 0)) {
            return Array.isArray(textOrArray) ? [] : '';
        }
        const isArray = Array.isArray(textOrArray);
        const texts = isArray ? textOrArray : [textOrArray];
        // Check for empty strings to preserve indices
        const nonEmptyIndices = [];
        const textsToTranslate = [];
        texts.forEach((t, i) => {
            if (t && t.trim()) {
                nonEmptyIndices.push(i);
                textsToTranslate.push(t);
            }
        });
        if (textsToTranslate.length === 0) {
            return isArray ? texts : texts[0];
        }
        // Batching logic: Google Translate URL limit is roughly 2000 chars.
        // We'll be conservative with 1500 chars per batch.
        const BATCH_SIZE_CHARS = 1500;
        const translatedResults = new Array(textsToTranslate.length).fill('');
        let currentBatch = [];
        let currentBatchIndices = [];
        let currentBatchLength = 0;
        const processBatch = async (batch, indices) => {
            if (batch.length === 0)
                return;
            const joinedText = batch.join('\n');
            let attempt = 0;
            let success = false;
            while (attempt < CONFIG.GOOGLE.MAX_RETRIES && !success) {
                try {
                    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(joinedText)}`;
                    // eslint-disable-next-line no-await-in-loop
                    const response = await GoogleService.fetchWithTimeout(url);
                    if (!response.ok)
                        throw new Error(`Status ${response.status}`);
                    // eslint-disable-next-line no-await-in-loop
                    const data = await response.json();
                    // data[0] contains segments.
                    // With batching/newlines, Google sometimes returns one large segment with newlines,
                    // or multiple segments. We need to reconstruct the full text first.
                    const fullTranslation = data?.[0]?.map((seg) => seg?.[0]).join('') || '';
                    // Split by newline to get individual lines back
                    const lines = fullTranslation.split('\n');
                    // Edge case: Google might strip trailing newlines or add extra.
                    // If we sent N lines, we expect N lines back approx.
                    // However, empty lines in input were filtered out before sending.
                    // So 'lines' should match 'batch'.
                    // If mismatch, try to align? Or just take what we have.
                    // If lines.length < batch.length, we might have lost some.
                    // If lines.length > batch.length, maybe some line wrap?
                    // We'll trust the split for now but ensure we don't overflow.
                    indices.forEach((originalIdx, i) => {
                        // Safe access
                        if (i < lines.length) {
                            translatedResults[originalIdx] = lines[i];
                        }
                        else {
                            // Fallback if response is shorter
                            translatedResults[originalIdx] = batch[i];
                        }
                    });
                    success = true;
                }
                catch (e) {
                    attempt += 1;
                    if (attempt < CONFIG.GOOGLE.MAX_RETRIES) {
                        // eslint-disable-next-line no-await-in-loop
                        await GoogleService.delay(CONFIG.GOOGLE.RETRY_DELAY_MS * 2 ** (attempt - 1));
                    }
                    else {
                        // Fail: fill with original
                        indices.forEach((originalIdx, i) => {
                            translatedResults[originalIdx] = batch[i];
                        });
                    }
                }
            }
        };
        for (let i = 0; i < textsToTranslate.length; i += 1) {
            const text = textsToTranslate[i];
            if (currentBatchLength + text.length > BATCH_SIZE_CHARS) {
                // eslint-disable-next-line no-await-in-loop
                await processBatch(currentBatch, currentBatchIndices);
                currentBatch = [];
                currentBatchIndices = [];
                currentBatchLength = 0;
            }
            currentBatch.push(text);
            currentBatchIndices.push(i);
            currentBatchLength += text.length;
        }
        if (currentBatch.length > 0) {
            await processBatch(currentBatch, currentBatchIndices);
        }
        // Reconstruct final array
        const finalArray = [...texts];
        nonEmptyIndices.forEach((realIdx, mappedIdx) => {
            finalArray[realIdx] = translatedResults[mappedIdx];
        });
        return isArray ? finalArray : finalArray[0];
    }
    static async romanize(originalLyrics) {
        // Determine if we should treat as word-synced (has syllabus) or line-synced
        const lines = Array.isArray(originalLyrics)
            ? originalLyrics
            : originalLyrics.data ||
                originalLyrics.content ||
                [];
        if (!lines || lines.length === 0)
            return Array.isArray(originalLyrics) ? originalLyrics : [];
        // Check if word synced
        const isWordSynced = lines.some((l) => l.isWordSynced !== false && Array.isArray(l.text) && l.text.length > 1);
        if (isWordSynced) {
            return this.romanizeWordSynced(lines);
        }
        return this.romanizeLineSynced(lines);
    }
    static async romanizeWordSynced(lines) {
        return Promise.all(lines.map(async (line) => {
            if (!line.text ||
                !Array.isArray(line.text) ||
                line.text.length === 0 ||
                line.romanizedText // Skip if already romanized
            )
                return line;
            // Get the entire line text to romanize together for context-aware pronunciation
            const fullText = line.text
                .map((s) => s.text)
                .join('');
            // romanizeTexts expects an array of strings, so we pass an array of one
            const [romanizedFullLine] = await this.romanizeTexts([fullText]);
            const newSyllabus = line.text.map((s) => ({
                ...s,
                romanizedText: s.romanizedText, // Keep any existing syllabus romanization if provided by API natively
            }));
            return {
                ...line,
                text: newSyllabus,
                romanizedText: romanizedFullLine || '',
            };
        }));
    }
    static async romanizeLineSynced(lines) {
        const linesToRomanize = lines.map((line) => {
            // If already romanized, skip
            if (line.romanizedText) {
                return '';
            }
            // If it's line-synced, it usually has 1 syllable with the full text.
            if (Array.isArray(line.text) && line.text.length > 0) {
                return line.text.map((s) => s.text).join('');
            }
            return '';
        });
        const romanizedLines = await this.romanizeTexts(linesToRomanize);
        return lines.map((line, index) => ({
            ...line,
            romanizedText: romanizedLines[index] || '',
        }));
    }
    static async romanizeTexts(texts) {
        const contextText = texts.join(' ');
        if (GoogleService.isPurelyLatinScript(contextText)) {
            return texts;
        }
        const romanizedTexts = [];
        /* eslint-disable no-await-in-loop */
        for (const text of texts) {
            if (!text || GoogleService.isPurelyLatinScript(text)) {
                romanizedTexts.push(text);
            }
            else {
                let attempt = 0;
                let success = false;
                let lastError = null;
                while (attempt < CONFIG.GOOGLE.MAX_RETRIES && !success) {
                    try {
                        const romanizeUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=rm&q=${encodeURIComponent(text)}`;
                        const response = await GoogleService.fetchWithTimeout(romanizeUrl);
                        const data = await response.json();
                        // Response format is [[["...","...","...","romanization"]],...]
                        // or [null, ...] for English/Latin input where no romanization is needed
                        const romanized = data?.[0]?.[0]?.[3] || text;
                        romanizedTexts.push(romanized);
                        success = true;
                    }
                    catch (error) {
                        lastError = error;
                        // eslint-disable-next-line no-console
                        console.warn(`GoogleService: Error romanizing text "${text}" (attempt ${attempt + 1}/${CONFIG.GOOGLE.MAX_RETRIES}):`, error);
                        attempt += 1;
                        if (attempt < CONFIG.GOOGLE.MAX_RETRIES) {
                            await GoogleService.delay(CONFIG.GOOGLE.RETRY_DELAY_MS * 2 ** (attempt - 1)); // Exponential backoff
                        }
                    }
                }
                if (!success) {
                    // eslint-disable-next-line no-console
                    console.error(`GoogleService: Failed to romanize text "${text}" after ${CONFIG.GOOGLE.MAX_RETRIES} attempts. Last error:`, lastError);
                    romanizedTexts.push(text); // Fallback to original text
                }
            }
        }
        /* eslint-enable no-await-in-loop */
        return romanizedTexts;
    }
}

const VERSION = '1.5.6';
const INSTRUMENTAL_THRESHOLD_MS = 7000; // Show dots for gaps >= 7s
const FETCH_TIMEOUT_MS = 8000; // Timeout for all lyrics fetch requests
const SEEK_THRESHOLD_MS = 500;
const SCROLL_ANIMATION_DURATION_MS = 350;
const GAP_PULSE_DURATION_MS = 4000;
const GAP_PULSE_CYCLE_MS = GAP_PULSE_DURATION_MS * 2;
const GAP_EXIT_LEAD_MS = 600;
const GAP_MIN_SCALE = 0.85;
const NEXT_WORD_PRE_WIPE_MAX_GAP_MS = 180;
const NEXT_WORD_PRE_WIPE_MIN_DURATION_MS = 80;
const NEXT_WORD_PRE_WIPE_MAX_DURATION_MS = 240;
const BASE_WIPE_GRADIENT_EM = 0.75;
const LONG_WORD_WIPE_EXTRA_EM = 0.45;
const LONG_WORD_WIPE_EXTRA_RATIO = 0.35;
const SHORT_WORD_DRAG_MIN_DURATION_MS = 760;
const SHORT_WORD_GLOW_MIN_DURATION_MS = 1320;
const WORD_PRE_WIPE_HANDOFF_LEAD_MS = 100;
/**
 * Fetch with an automatic timeout via AbortSignal.
 * Rejects if the request takes longer than `timeoutMs`.
 */
function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}
const KPOE_SERVERS = [
    'https://lyricsplus.binimum.org',
];
const DEFAULT_KPOE_SOURCE_ORDER = 'apple,lyricsplus,musixmatch,spotify,qq,deezer,musixmatch-word';
const GENIUS_WORKER_URL = 'https://fetch-genius.samidy.workers.dev/';
class AmLyrics extends i {
    constructor() {
        super(...arguments);
        this.downloadFormat = 'auto';
        this.highlightColor = '#ffffff';
        this.autoScroll = true;
        this.interpolate = true;
        this.showRomanization = false;
        this.showTranslation = false;
        this._currentTime = 0;
        this.isLoading = false;
        this.activeLineIndices = [];
        this.activeMainWordIndices = new Map();
        this.activeBackgroundWordIndices = new Map();
        this.mainWordProgress = new Map();
        this.backgroundWordProgress = new Map();
        this.lyricsSource = null;
        this.availableSources = [];
        this.currentSourceIndex = 0;
        this.isFetchingAlternatives = false;
        this.hasFetchedAllProviders = false;
        this.mainWordAnimations = new Map();
        this.backgroundWordAnimations = new Map();
        this.lastInstrumentalIndex = null;
        this.isUserScrolling = false;
        this.isProgrammaticScroll = false;
        this.isClickSeeking = false;
        // Cached DOM elements for animation updates
        this.cachedLyricsLines = [];
        // Cached line elements array for scroll/position queries
        this.cachedLineArray = [];
        // Cached line and gap element maps for fast lookup
        this.lineElementCache = new Map();
        this.gapElementCache = new Map();
        // Cached gap computation results
        this.cachedAllGaps = [];
        // Cached isUnsynced flag
        this.cachedIsUnsynced = false;
        // Cached pre-computed line data for render
        this.cachedLineData = null;
        // Active line tracking
        this.activeLineIds = new Set();
        this.currentPrimaryActiveLine = null;
        this.lastPrimaryActiveLine = null;
        this.backgroundExpandedLine = null;
        // Scroll animation state
        this.scrollAnimationState = null;
        this.currentScrollOffset = 0;
        this.animatingLines = [];
        // Syllable animation tracking
        this.lastActiveIndex = 0;
        this.visibleLineIds = new Set();
        // Cached scroll padding top value
        this.cachedScrollPaddingTop = null;
        // Cached element tracking to avoid repeated querySelectorAll calls
        this.preActiveLineElements = [];
        this.positionedLineElements = [];
        this.activeGapLineElements = [];
        // Bound handler references for proper event listener removal
        this._boundHandleUserScroll = this.handleUserScroll.bind(this);
        this._boundAnimateProgress = this.animateProgress.bind(this);
    }
    async toggleRomanization() {
        this.showRomanization = !this.showRomanization;
        await this.applyRomanization();
    }
    async applyRomanization() {
        if (this.showRomanization && this.lyrics) {
            const needsRomanization = this.lyrics.some(l => !l.romanizedText && (!l.text || !l.text.some(s => s.romanizedText)));
            if (needsRomanization) {
                this.isLoading = true;
                try {
                    const romanizedLines = await GoogleService.romanize(this.lyrics);
                    this.lyrics = romanizedLines;
                }
                catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('Romanization failed', e);
                }
                finally {
                    this.isLoading = false;
                }
            }
        }
    }
    async toggleTranslation() {
        this.showTranslation = !this.showTranslation;
        await this.applyTranslation();
    }
    async applyTranslation() {
        if (this.showTranslation && this.lyrics) {
            const needsTranslation = this.lyrics.some(l => !l.translation);
            if (needsTranslation) {
                this.isLoading = true;
                try {
                    // Prepare batch: extract text from all lines
                    const textToTranslate = this.lyrics.map(line => {
                        if (line.translation)
                            return '';
                        return line.text.map(s => s.text).join('');
                    });
                    // If all are empty, skip
                    if (textToTranslate.every(t => !t)) {
                        this.isLoading = false;
                        return;
                    }
                    const result = await GoogleService.translate(textToTranslate, 'en');
                    const translations = Array.isArray(result) ? result : [result];
                    const newLyrics = this.lyrics.map((line, index) => {
                        if (line.translation)
                            return line;
                        return {
                            ...line,
                            translation: translations[index] || undefined,
                        };
                    });
                    this.lyrics = newLyrics;
                }
                catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('Translation failed', e);
                }
                finally {
                    this.isLoading = false;
                }
            }
        }
    }
    set currentTime(value) {
        const oldValue = this._currentTime;
        // If the new time is significantly smaller than the old time (e.g. song looped)
        if (value < oldValue && oldValue - value > 1000 && this.lyrics) {
            this.activeLineIndices = [];
            this.activeMainWordIndices.clear();
            this.activeBackgroundWordIndices.clear();
            this.mainWordProgress.clear();
            this.backgroundWordProgress.clear();
            this.mainWordAnimations.clear();
            this.backgroundWordAnimations.clear();
            this.preActiveLineElements = [];
            this.positionedLineElements = [];
            this.activeGapLineElements = [];
            this.clearBackgroundExpandedLine();
            // Stop all running animations and clear highlights immediately
            if (this.lyricsContainer) {
                const activeLines = this.lyricsContainer.querySelectorAll('.lyrics-line.active, .lyrics-line.pre-active, .lyrics-line.bg-expanded, .lyrics-line.scroll-exiting');
                activeLines.forEach(line => {
                    line.classList.remove('active', 'pre-active', 'bg-expanded', 'scroll-exiting');
                    AmLyrics.resetSyllables(line);
                });
                const activeGaps = this.lyricsContainer.querySelectorAll('.lyrics-gap.active, .lyrics-gap.gap-exiting');
                activeGaps.forEach(gap => gap.classList.remove('active', 'gap-exiting'));
                // Reset gap cache since we manually messed with the elements
                this.gapElementCache.clear();
            }
        }
        this._currentTime = value;
        if (oldValue !== value && this.lyrics) {
            this._onTimeChanged(oldValue, value);
        }
    }
    get currentTime() {
        return this._currentTime;
    }
    _updateFooter() {
        const footer = this.shadowRoot?.querySelector('.lyrics-footer');
        if (!footer)
            return;
        const switchBtn = footer.querySelector('.source-switch-btn');
        const svgEl = footer.querySelector('.source-switch-svg');
        const labelEl = footer.querySelector('.source-switch-label');
        if (switchBtn) {
            switchBtn.disabled = this.isFetchingAlternatives;
        }
        if (svgEl) {
            svgEl.classList.toggle('is-loading', this.isFetchingAlternatives);
        }
        if (labelEl) {
            labelEl.textContent = this.isFetchingAlternatives
                ? 'Switching...'
                : 'Switch';
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.fetchLyrics();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = undefined;
        }
        if (this.userScrollTimeoutId) {
            clearTimeout(this.userScrollTimeoutId);
            this.userScrollTimeoutId = undefined;
        }
        if (this.clickSeekTimeout) {
            clearTimeout(this.clickSeekTimeout);
            this.clickSeekTimeout = undefined;
        }
        if (this.scrollAnimationTimeout) {
            clearTimeout(this.scrollAnimationTimeout);
            this.scrollAnimationTimeout = undefined;
        }
        if (this.scrollUnlockTimeout) {
            clearTimeout(this.scrollUnlockTimeout);
            this.scrollUnlockTimeout = undefined;
        }
        // Cancel any in-flight fetch requests
        this.fetchAbortController?.abort();
        this.fetchAbortController = undefined;
        // Remove scroll event listeners
        if (this.lyricsContainer) {
            this.lyricsContainer.removeEventListener('wheel', this._boundHandleUserScroll);
            this.lyricsContainer.removeEventListener('touchmove', this._boundHandleUserScroll);
        }
        this.preActiveLineElements = [];
        this.positionedLineElements = [];
        this.activeGapLineElements = [];
        this.visibilityObserver?.disconnect();
        this.visibilityObserver = undefined;
    }
    async fetchLyrics() {
        // Cancel any in-flight fetch to prevent stale results from racing
        this.fetchAbortController?.abort();
        const controller = new AbortController();
        this.fetchAbortController = controller;
        this.isLoading = true;
        this.lyrics = undefined;
        this.lyricsSource = null;
        this.availableSources = [];
        this.currentSourceIndex = 0;
        this.isFetchingAlternatives = false;
        this.hasFetchedAllProviders = false;
        this._updateFooter();
        try {
            if (this.ttml) {
                const parseResult = AmLyrics.parseTTML(this.ttml);
                if (parseResult && parseResult.lines.length > 0) {
                    this.lyrics = parseResult.lines;
                    this.lyricsSource = 'Local';
                    if (parseResult.songwriters) {
                        this.songwriters = parseResult.songwriters;
                    }
                    this.availableSources = [
                        {
                            lines: this.lyrics,
                            source: 'Local',
                            songwriters: this.songwriters,
                        },
                    ];
                    this.currentSourceIndex = 0;
                    this.hasFetchedAllProviders = true;
                    this._updateFooter();
                    await this.onLyricsLoaded();
                    return;
                }
            }
            const resolvedMetadata = await this.resolveSongMetadata();
            // If a newer fetch was triggered while we awaited, bail out
            if (controller.signal.aborted)
                return;
            const isMusicIdOnlyRequest = Boolean(this.musicId) &&
                !this.songTitle &&
                !this.songArtist &&
                !this.query &&
                !this.isrc;
            const collectedSources = [];
            if (resolvedMetadata?.metadata && !isMusicIdOnlyRequest) {
                const title = resolvedMetadata.metadata.title?.trim() || '';
                const artist = resolvedMetadata.metadata.artist?.trim() || '';
                const biniResult = await AmLyrics.fetchLyricsFromBiniLyrics(title, artist, resolvedMetadata.catalogIsrc, resolvedMetadata.metadata);
                if (biniResult && biniResult.lines.length > 0) {
                    collectedSources.push(biniResult);
                }
                const hasWordSync = (sources) => sources.some(s => s.lines.some(l => l.isWordSynced || (l.text && l.text.length > 1)));
                if (collectedSources.length === 0 || !hasWordSync(collectedSources)) {
                    const unisonResult = await AmLyrics.fetchLyricsFromUnison(resolvedMetadata.metadata);
                    if (unisonResult && unisonResult.lines.length > 0) {
                        collectedSources.push(unisonResult);
                    }
                }
                if (collectedSources.length === 0 || !hasWordSync(collectedSources)) {
                    const youLyResults = await AmLyrics.fetchLyricsFromYouLyPlus(title, artist, resolvedMetadata.catalogIsrc, resolvedMetadata.metadata, true);
                    if (youLyResults && youLyResults.length > 0) {
                        collectedSources.push(...youLyResults);
                    }
                }
            }
            const hasLineSync = (sources) => sources.some(s => s.lines.some(l => l.timestamp > 0 || l.endtime > 0));
            if ((collectedSources.length === 0 || !hasLineSync(collectedSources)) &&
                resolvedMetadata?.metadata) {
                // Fallback: LRCLIB
                const lrclibResult = await AmLyrics.fetchLyricsFromLrclib(resolvedMetadata.metadata);
                if (lrclibResult && lrclibResult.lines.length > 0) {
                    collectedSources.push({
                        lines: lrclibResult.lines,
                        source: 'LRCLIB',
                    });
                }
            }
            if (collectedSources.length === 0 && resolvedMetadata?.metadata) {
                const geniusResult = await AmLyrics.fetchLyricsFromGenius(resolvedMetadata.metadata);
                if (geniusResult && geniusResult.lines.length > 0) {
                    collectedSources.push({
                        lines: geniusResult.lines,
                        source: 'Genius',
                    });
                }
            }
            this.hasFetchedAllProviders =
                collectedSources.length === 0 ||
                    collectedSources.some(s => s.source === 'LRCLIB' || s.source === 'Genius');
            this._updateFooter();
            if (collectedSources.length > 0) {
                this.availableSources = AmLyrics.mergeAndSortSources(collectedSources);
                this.currentSourceIndex = 0;
                const sourceResult = this.availableSources[0];
                this.lyrics = sourceResult.lines;
                this.lyricsSource = sourceResult.source;
                if (sourceResult.songwriters) {
                    this.songwriters = sourceResult.songwriters;
                }
                await this.onLyricsLoaded();
                return;
            }
            this.lyrics = undefined;
            this.lyricsSource = null;
        }
        finally {
            // Only update loading state if this fetch wasn't superseded
            if (!controller.signal.aborted) {
                this.isLoading = false;
            }
        }
    }
    async onLyricsLoaded() {
        this.activeLineIndices = [];
        this.activeMainWordIndices.clear();
        this.activeBackgroundWordIndices.clear();
        this.mainWordProgress.clear();
        this.backgroundWordProgress.clear();
        this.mainWordAnimations.clear();
        this.backgroundWordAnimations.clear();
        this.preActiveLineElements = [];
        this.positionedLineElements = [];
        this.activeGapLineElements = [];
        this.clearBackgroundExpandedLine();
        if (this.lyricsContainer) {
            this.isProgrammaticScroll = true;
            this.lyricsContainer.scrollTop = 0;
            window.setTimeout(() => {
                this.isProgrammaticScroll = false;
            }, 100);
        }
        await this.autoProcessLyrics();
    }
    async autoProcessLyrics() {
        if (this.showRomanization) {
            await this.applyRomanization();
        }
        if (this.showTranslation) {
            await this.applyTranslation();
        }
    }
    static getRankForCollected(sourceLabel, parsedLines) {
        const lower = sourceLabel.toLowerCase();
        const hasWordSync = parsedLines.some((line) => line.text && Array.isArray(line.text) && line.text.length > 1);
        const isUnsynced = parsedLines.length > 0 &&
            parsedLines.every((line) => line.timestamp === 0 && line.endtime === 0);
        const isQQ = lower.includes('qq') || lower.includes('lyricsplus');
        if (lower.includes('apple') && hasWordSync)
            return 1;
        if (lower.includes('bini') && hasWordSync)
            return 2;
        if (lower.includes('unison') && hasWordSync)
            return 3;
        if (isQQ && hasWordSync)
            return 4;
        if (lower.includes('musixmatch') && hasWordSync)
            return 5;
        if (lower.includes('lrclib') && hasWordSync)
            return 6;
        if (hasWordSync)
            return 7;
        if (lower.includes('apple') && !hasWordSync && !isUnsynced)
            return 8;
        if (lower.includes('bini') && !hasWordSync && !isUnsynced)
            return 9;
        if (lower.includes('unison') && !hasWordSync && !isUnsynced)
            return 10;
        if (isQQ && !hasWordSync && !isUnsynced)
            return 11;
        if (lower.includes('musixmatch') && !hasWordSync && !isUnsynced)
            return 12;
        if (lower.includes('lrclib') && !hasWordSync && !isUnsynced)
            return 13;
        if (!hasWordSync && !isUnsynced)
            return 14;
        if (lower.includes('apple') && isUnsynced)
            return 15;
        if (lower.includes('bini') && isUnsynced)
            return 16;
        if (lower.includes('unison') && isUnsynced)
            return 17;
        if (isQQ && isUnsynced)
            return 18;
        if (lower.includes('musixmatch') && isUnsynced)
            return 19;
        if (lower.includes('lrclib') && isUnsynced)
            return 20;
        if (lower.includes('genius'))
            return 21;
        return 30;
    }
    static getDisplaySourceLabel(sourceLabel) {
        return sourceLabel.toLowerCase().includes('lyricsplus')
            ? 'QQ'
            : sourceLabel;
    }
    static getSourceKey(sourceLabel) {
        const lower = (sourceLabel || '').trim().toLowerCase();
        if (!lower)
            return '';
        if (lower.includes('lyricsplus') || lower === 'qq')
            return 'qq';
        return lower.replace(/\s+/g, ' ');
    }
    static mergeAndSortSources(collectedSources) {
        const uniqueSourcesMap = new Map();
        for (const source of collectedSources) {
            const normalizedSource = AmLyrics.getDisplaySourceLabel(source.source);
            if (!uniqueSourcesMap.has(normalizedSource)) {
                uniqueSourcesMap.set(normalizedSource, {
                    ...source,
                    source: normalizedSource,
                });
            }
        }
        return Array.from(uniqueSourcesMap.values()).sort((a, b) => AmLyrics.getRankForCollected(a.source, a.lines) -
            AmLyrics.getRankForCollected(b.source, b.lines));
    }
    findCurrentSourceIndex(sources = this.availableSources, sourceLabel = this.lyricsSource, lines = this.lyrics) {
        const identityIndex = sources.findIndex(source => source.lines === lines);
        if (identityIndex !== -1)
            return identityIndex;
        const sourceKey = AmLyrics.getSourceKey(sourceLabel);
        if (!sourceKey)
            return -1;
        return sources.findIndex(source => AmLyrics.getSourceKey(source.source) === sourceKey);
    }
    static getNextSourceIndex(sources, currentIndex, currentSourceLabel, currentLines) {
        if (sources.length <= 1)
            return -1;
        if (currentIndex !== -1) {
            return (currentIndex + 1) % sources.length;
        }
        const currentKey = AmLyrics.getSourceKey(currentSourceLabel);
        const fallbackIndex = sources.findIndex(source => source.lines !== currentLines &&
            AmLyrics.getSourceKey(source.source) !== currentKey);
        return fallbackIndex === -1 ? 0 : fallbackIndex;
    }
    async applySourceAtIndex(index) {
        const sourceResult = this.availableSources[index];
        if (!sourceResult)
            return;
        this.currentSourceIndex = index;
        this.lyrics = sourceResult.lines;
        this.lyricsSource = sourceResult.source;
        if (sourceResult.songwriters) {
            this.songwriters = sourceResult.songwriters;
        }
        await this.onLyricsLoaded();
    }
    async switchSource() {
        if (this.isFetchingAlternatives)
            return;
        const currentSourceLabel = this.lyricsSource;
        const currentLines = this.lyrics;
        if (!this.hasFetchedAllProviders) {
            this.isFetchingAlternatives = true;
            this._updateFooter();
            try {
                const resolvedMetadata = await this.resolveSongMetadata();
                if (resolvedMetadata?.metadata) {
                    const newSources = [];
                    // Try Unison if not fetched
                    if (!this.availableSources.some(s => s.source.toLowerCase().includes('unison'))) {
                        const unisonResult = await AmLyrics.fetchLyricsFromUnison(resolvedMetadata.metadata);
                        if (unisonResult && unisonResult.lines.length > 0) {
                            newSources.push(unisonResult);
                        }
                    }
                    // Try YouLyPlus (KPoe) if we don't have Apple or QQ
                    if (!this.availableSources.some(s => s.source.toLowerCase().includes('apple') ||
                        s.source.toLowerCase().includes('qq'))) {
                        const title = resolvedMetadata.metadata.title?.trim() || '';
                        const artist = resolvedMetadata.metadata.artist?.trim() || '';
                        const youLyResults = await AmLyrics.fetchLyricsFromYouLyPlus(title, artist, resolvedMetadata.catalogIsrc, resolvedMetadata.metadata, true);
                        if (youLyResults && youLyResults.length > 0) {
                            newSources.push(...youLyResults);
                        }
                    }
                    // Try LRCLIB if not fetched
                    if (!this.availableSources.some(s => s.source.toLowerCase().includes('lrclib'))) {
                        const lrclibResult = await AmLyrics.fetchLyricsFromLrclib(resolvedMetadata.metadata);
                        if (lrclibResult && lrclibResult.lines.length > 0) {
                            newSources.push({ lines: lrclibResult.lines, source: 'LRCLIB' });
                        }
                    }
                    if (!this.availableSources.some(s => s.source.toLowerCase().includes('genius'))) {
                        const geniusResult = await AmLyrics.fetchLyricsFromGenius(resolvedMetadata.metadata);
                        if (geniusResult && geniusResult.lines.length > 0) {
                            newSources.push({ lines: geniusResult.lines, source: 'Genius' });
                        }
                    }
                    if (newSources.length > 0) {
                        this.availableSources = AmLyrics.mergeAndSortSources([
                            ...this.availableSources,
                            ...newSources,
                        ]);
                        // Re-sync current index since sorting or label normalization can
                        // shift the currently displayed source underneath the old index.
                        this.currentSourceIndex = this.findCurrentSourceIndex(this.availableSources, currentSourceLabel, currentLines);
                    }
                }
            }
            finally {
                this.hasFetchedAllProviders = true;
                this.isFetchingAlternatives = false;
                this._updateFooter();
            }
        }
        if (this.availableSources.length > 1) {
            const currentIndex = this.findCurrentSourceIndex(this.availableSources, currentSourceLabel, currentLines);
            const nextIndex = AmLyrics.getNextSourceIndex(this.availableSources, currentIndex, currentSourceLabel, currentLines);
            if (nextIndex !== -1) {
                await this.applySourceAtIndex(nextIndex);
            }
        }
    }
    async resolveSongMetadata() {
        const metadata = {
            title: this.songTitle?.trim() ?? '',
            artist: this.songArtist?.trim() ?? '',
            album: this.songAlbum?.trim() || undefined,
            songwriters: this.songwriters?.trim() || undefined,
            durationMs: undefined,
        };
        if (typeof this.songDurationMs === 'number' && this.songDurationMs > 0) {
            metadata.durationMs = this.songDurationMs;
        }
        else if (typeof this.duration === 'number' && this.duration > 0) {
            metadata.durationMs = this.duration;
        }
        const appleSong = null;
        let appleId = this.musicId;
        let catalogIsrc = this.isrc;
        if (this.query &&
            (!metadata.title || !metadata.artist || !metadata.album)) {
            const parsed = AmLyrics.parseQueryMetadata(this.query);
            if (parsed) {
                if (!metadata.title && parsed.title) {
                    metadata.title = parsed.title;
                }
                if (!metadata.artist && parsed.artist) {
                    metadata.artist = parsed.artist;
                }
                if (!metadata.album && parsed.album) {
                    metadata.album = parsed.album;
                }
            }
        }
        let catalogResult = null;
        if (this.query && (!metadata.title || !metadata.artist)) {
            catalogResult = await AmLyrics.searchLyricsPlusCatalog(this.query);
            if (catalogResult) {
                if (!metadata.title && catalogResult.title) {
                    metadata.title = catalogResult.title;
                }
                if (!metadata.artist && catalogResult.artist) {
                    metadata.artist = catalogResult.artist;
                }
                if (!metadata.album && catalogResult.album) {
                    metadata.album = catalogResult.album;
                }
                if (!metadata.songwriters && catalogResult.songwriters) {
                    metadata.songwriters = catalogResult.songwriters;
                }
                if (metadata.durationMs == null &&
                    typeof catalogResult.durationMs === 'number' &&
                    catalogResult.durationMs > 0) {
                    metadata.durationMs = catalogResult.durationMs;
                }
                if (!appleId && catalogResult.id?.appleMusic) {
                    appleId = catalogResult.id.appleMusic;
                }
                if (!catalogIsrc && catalogResult.isrc) {
                    catalogIsrc = catalogResult.isrc;
                }
            }
        }
        const trimmedTitle = metadata.title?.trim() ?? '';
        const trimmedArtist = metadata.artist?.trim() ?? '';
        const trimmedAlbum = metadata.album?.trim();
        const sanitizedDuration = typeof metadata.durationMs === 'number' &&
            Number.isFinite(metadata.durationMs) &&
            metadata.durationMs > 0
            ? Math.round(metadata.durationMs)
            : undefined;
        const finalMetadata = trimmedTitle && trimmedArtist
            ? {
                title: trimmedTitle,
                artist: trimmedArtist,
                album: trimmedAlbum || undefined,
                durationMs: sanitizedDuration,
            }
            : undefined;
        return {
            metadata: finalMetadata,
            appleId,
            appleSong,
            catalogIsrc,
        };
    }
    static parseQueryMetadata(rawQuery) {
        const trimmed = rawQuery?.trim();
        if (!trimmed)
            return null;
        const result = {};
        const hyphenSplit = trimmed.split(/\s[-–—]\s/);
        if (hyphenSplit.length >= 2) {
            const [rawTitle, ...rest] = hyphenSplit;
            const rawArtist = rest.join(' - ');
            const titleCandidate = rawTitle.trim();
            const artistCandidate = rawArtist.trim();
            if (titleCandidate && artistCandidate) {
                result.title = titleCandidate;
                result.artist = artistCandidate;
                return result;
            }
        }
        const bySplit = trimmed.split(/\s+[bB]y\s+/);
        if (bySplit.length === 2) {
            const [maybeTitle, maybeArtist] = bySplit.map(part => part.trim());
            if (maybeTitle && maybeArtist) {
                result.title = maybeTitle;
                result.artist = maybeArtist;
                return result;
            }
        }
        return null;
    }
    static async searchLyricsPlusCatalog(searchTerm) {
        const trimmedQuery = searchTerm?.trim();
        if (!trimmedQuery)
            return null;
        for (const base of KPOE_SERVERS) {
            const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
            const url = `${normalizedBase}/v1/songlist/search?q=${encodeURIComponent(trimmedQuery)}`;
            try {
                // eslint-disable-next-line no-await-in-loop
                const response = await fetchWithTimeout(url);
                if (response.ok) {
                    // eslint-disable-next-line no-await-in-loop
                    const payload = await response.json();
                    let results = [];
                    const typedPayload = payload;
                    if (Array.isArray(typedPayload?.results)) {
                        results = typedPayload.results;
                    }
                    else if (Array.isArray(payload)) {
                        results = payload;
                    }
                    if (results.length > 0) {
                        const primary = results.find((item) => item?.id && item.id.appleMusic);
                        return (primary ?? results[0]);
                    }
                }
            }
            catch (error) {
                // Ignore and try next server
            }
        }
        return null;
    }
    static async fetchLyricsFromBiniLyrics(title, artist, isrc, metadata = {}) {
        return null;
    }
    static async fetchLyricsFromYouLyPlus(title, artist, isrc, metadata = {}, skipBiniCache = false) {
        if ((!title || !artist) && !isrc)
            return [];
        const params = new URLSearchParams();
        if (title)
            params.append('title', title);
        if (artist)
            params.append('artist', artist);
        if (isrc)
            params.append('isrc', isrc);
        if (!DEFAULT_KPOE_SOURCE_ORDER.includes('apple')) {
            params.append('source', DEFAULT_KPOE_SOURCE_ORDER);
        }
        const getRank = (sourceLabel, parsedLines) => {
            const lower = sourceLabel.toLowerCase();
            const hasWordSync = parsedLines.some((line) => line.text && Array.isArray(line.text) && line.text.length > 1);
            const isUnsynced = parsedLines.length > 0 &&
                parsedLines.every((line) => line.timestamp === 0 && line.endtime === 0);
            const isQQ = lower.includes('qq') || lower.includes('lyricsplus');
            if (lower.includes('apple') && hasWordSync)
                return 1;
            if (lower.includes('bini') && hasWordSync)
                return 2;
            if (lower.includes('unison') && hasWordSync)
                return 3;
            if (isQQ && hasWordSync)
                return 4;
            if (lower.includes('musixmatch') && hasWordSync)
                return 5;
            if (hasWordSync)
                return 6;
            if (lower.includes('apple') && !hasWordSync && !isUnsynced)
                return 7;
            if (lower.includes('bini') && !hasWordSync && !isUnsynced)
                return 8;
            if (lower.includes('unison') && !hasWordSync && !isUnsynced)
                return 9;
            if (isQQ && !hasWordSync && !isUnsynced)
                return 10;
            if (lower.includes('musixmatch') && !hasWordSync && !isUnsynced)
                return 11;
            if (!hasWordSync && !isUnsynced)
                return 12;
            if (lower.includes('apple') && isUnsynced)
                return 13;
            if (lower.includes('bini') && isUnsynced)
                return 14;
            if (lower.includes('unison') && isUnsynced)
                return 15;
            if (isQQ && isUnsynced)
                return 16;
            if (lower.includes('musixmatch') && isUnsynced)
                return 17;
            return 30;
        };
        const allResults = [];
        if (!skipBiniCache) {
            const biniResult = await AmLyrics.fetchLyricsFromBiniLyrics(title, artist, isrc, metadata);
            if (biniResult) {
                allResults.push(biniResult);
                return allResults;
            }
        }
        // Shuffle servers so we pick a random one first, with all others as fallback
        // Try up to 3 servers to improve reliability when some have CORS or connectivity issues
        const shuffledServers = [...KPOE_SERVERS]
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        for (const base of shuffledServers) {
            const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
            const url = `${normalizedBase}/v2/lyrics/get?${params.toString()}`;
            let payload = null;
            try {
                // eslint-disable-next-line no-await-in-loop
                const response = await fetchWithTimeout(url);
                if (response.ok) {
                    // eslint-disable-next-line no-await-in-loop
                    payload = await response.json();
                }
            }
            catch {
                payload = null;
            }
            if (payload) {
                const lines = AmLyrics.convertKPoeLyrics(payload);
                if (lines && lines.length > 0) {
                    const sourceLabel = payload?.metadata?.source ||
                        payload?.metadata?.provider ||
                        'LyricsPlus (KPoe)';
                    const rank = getRank(sourceLabel, lines);
                    const result = { lines, source: sourceLabel };
                    allResults.push(result);
                    // If source is Apple synced, we have the best so we can just immediately break the sweep
                    if (rank === 1) {
                        break;
                    }
                }
            }
        }
        // If we haven't found a completely synced result (rank 1 or 2) among the servers,
        // force an explicit query against lyricsplus.binimum.org looking for word lyrics
        const hasHighRankResult = allResults.some(r => getRank(r.source, r.lines) <= 2);
        if (!hasHighRankResult) {
            try {
                const fallbackParams = new URLSearchParams(params);
                const url = `https://lyricsplus.binimum.org/v2/lyrics/get?${fallbackParams.toString()}`;
                const response = await fetchWithTimeout(url);
                if (response.ok) {
                    const payload = await response.json();
                    if (payload) {
                        const lines = AmLyrics.convertKPoeLyrics(payload);
                        const sourceLabel = payload?.metadata?.source ||
                            payload?.metadata?.provider ||
                            'LyricsPlus (KPoe)';
                        const hasWordSync = lines?.some((line) => line.text && Array.isArray(line.text) && line.text.length > 1);
                        if (lines && lines.length > 0 && hasWordSync) {
                            allResults.push({ lines, source: sourceLabel });
                        }
                    }
                }
            }
            catch (error) {
                // Explicit fallback failed, ignore
            }
        }
        return allResults;
    }
    /**
     * Parse LRC subtitle format into LyricsLine[].
     * Handles "[mm:ss.xx] text" lines.
     */
    static parseLrcSubtitles(lrc) {
        if (!lrc || typeof lrc !== 'string')
            return [];
        const lines = [];
        const rawLines = lrc.split('\n');
        const parsed = [];
        for (const raw of rawLines) {
            const match = raw.match(/^\[(\d{1,3}):(\d{2})\.(\d{2,3})\]\s?(.*)$/);
            if (!match) {
                // Skip non-timestamped lines (headers like [ti:], [ar:], etc.)
                // eslint-disable-next-line no-continue
                continue;
            }
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            let centiseconds = parseInt(match[3], 10);
            // Handle both mm:ss.xx (centiseconds) and mm:ss.xxx (milliseconds)
            if (match[3].length === 3) {
                centiseconds = Math.round(centiseconds / 10);
            }
            const timestamp = (minutes * 60 + seconds) * 1000 + centiseconds * 10;
            const text = match[4] || '';
            parsed.push({ timestamp, text });
        }
        for (let i = 0; i < parsed.length; i += 1) {
            const { timestamp, text } = parsed[i];
            // Endtime is the start of the next line, or timestamp + 5s for the last line
            const endtime = i + 1 < parsed.length ? parsed[i + 1].timestamp : timestamp + 5000;
            // Skip empty lines (instrumental gaps)
            if (!text.trim()) {
                // eslint-disable-next-line no-continue
                continue;
            }
            const syllable = {
                text,
                part: false,
                timestamp,
                endtime,
                lineSynced: true,
            };
            lines.push({
                text: [syllable],
                background: false,
                backgroundText: [],
                oppositeTurn: false,
                timestamp,
                endtime,
                isWordSynced: false,
            });
        }
        return lines;
    }
    /**
     * Fetch lyrics from LRCLIB.
     * Uses search endpoint, prefers synced lyrics.
     */
    static async fetchLyricsFromLrclib(metadata) {
        const title = metadata.title?.trim();
        const artist = metadata.artist?.trim();
        if (!title || !artist)
            return null;
        try {
            const searchQuery = `${artist} ${title}`;
            const params = new URLSearchParams({ q: searchQuery });
            const response = await fetchWithTimeout(`https://lrclib.net/api/search?${params.toString()}`, {
                headers: {
                    'User-Agent': `apple-music-web-components/${VERSION}`,
                },
            });
            if (!response.ok)
                return null;
            const results = await response.json();
            if (!Array.isArray(results) || results.length === 0)
                return null;
            // Prefer results with synced lyrics
            const withSynced = results.find((r) => r.syncedLyrics && typeof r.syncedLyrics === 'string');
            const bestMatch = withSynced || results[0];
            // Try synced lyrics first
            if (bestMatch.syncedLyrics) {
                const lines = AmLyrics.parseLrcSubtitles(bestMatch.syncedLyrics);
                if (lines.length > 0) {
                    return { lines, source: 'LRCLIB' };
                }
            }
            // Fall back to plain lyrics (unsynced)
            if (bestMatch.plainLyrics && typeof bestMatch.plainLyrics === 'string') {
                const plainLines = bestMatch.plainLyrics
                    .split('\n')
                    .filter((l) => l.trim());
                if (plainLines.length > 0) {
                    const lines = plainLines.map((text) => ({
                        text: [
                            {
                                text,
                                part: false,
                                timestamp: 0,
                                endtime: 0,
                            },
                        ],
                        background: false,
                        backgroundText: [],
                        oppositeTurn: false,
                        timestamp: 0,
                        endtime: 0,
                        isWordSynced: false,
                    }));
                    return { lines, source: 'LRCLIB (unsynced)' };
                }
            }
        }
        catch {
            // LRCLIB fetch failed
        }
        return null;
    }
    static async fetchLyricsFromGenius(metadata) {
        const title = metadata.title?.trim();
        const artist = metadata.artist?.trim();
        if (!title || !artist)
            return null;
        try {
            const params = new URLSearchParams({ title, artist });
            const response = await fetchWithTimeout(`${GENIUS_WORKER_URL}?${params.toString()}`);
            if (!response.ok)
                return null;
            const data = await response.json();
            if (data.lyrics) {
                const plainLines = data.lyrics
                    .split('\n')
                    .map((l) => l.trim())
                    .filter((l) => l && !l.startsWith('['));
                if (plainLines.length > 0) {
                    const lines = plainLines.map((text) => ({
                        text: [
                            {
                                text,
                                part: false,
                                timestamp: 0,
                                endtime: 0,
                            },
                        ],
                        background: false,
                        backgroundText: [],
                        oppositeTurn: false,
                        timestamp: 0,
                        endtime: 0,
                        isWordSynced: false,
                    }));
                    return { lines, source: 'Genius' };
                }
            }
        }
        catch {
            // Genius fetch failed, will fall through to return null
        }
        return null;
    }
    static async fetchLyricsFromUnison(metadata) {
        return null;
    }
    static calculateLineAlignments(lineSingers, agentTypes) {
        const lineSideAssignments = new Array(lineSingers.length).fill(undefined);
        let currentSideIsLeft = true;
        let lastPersonSingerId = null;
        let rightCount = 0;
        let totalCount = 0;
        lineSingers.forEach((singerId, index) => {
            let sideClass;
            if (singerId) {
                let type = agentTypes[singerId];
                if (!type) {
                    if (singerId === 'v1000') {
                        type = 'group';
                    }
                    else if (singerId === 'v2000') {
                        type = 'other';
                    }
                    else {
                        type = 'person';
                    }
                }
                if (type === 'group') {
                    sideClass = 'start';
                }
                else {
                    if (lastPersonSingerId === null) {
                        if (type === 'other') {
                            currentSideIsLeft = false;
                        }
                        else {
                            currentSideIsLeft = true;
                        }
                    }
                    else if (singerId !== lastPersonSingerId) {
                        currentSideIsLeft = !currentSideIsLeft;
                    }
                    sideClass = currentSideIsLeft ? 'start' : 'end';
                    lastPersonSingerId = singerId;
                }
            }
            if (sideClass) {
                totalCount += 1;
                if (sideClass === 'end')
                    rightCount += 1;
            }
            lineSideAssignments[index] = sideClass;
        });
        if (totalCount > 0 && Math.round((rightCount / totalCount) * 100) >= 85) {
            const flip = (s) => {
                if (s === 'start')
                    return 'end';
                if (s === 'end')
                    return 'start';
                return s;
            };
            for (let i = 0; i < lineSideAssignments.length; i += 1) {
                lineSideAssignments[i] = flip(lineSideAssignments[i]);
            }
        }
        return lineSideAssignments;
    }
    static parseTTML(ttmlString) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(ttmlString, 'text/xml');
            const translations = {};
            const transliterations = {};
            const agentMap = {};
            const agents = doc.getElementsByTagName('ttm:agent');
            for (let i = 0; i < agents.length; i += 1) {
                const agent = agents[i];
                const id = agent.getAttribute('xml:id');
                const type = agent.getAttribute('type');
                if (id && type) {
                    agentMap[id] = type;
                }
            }
            let songwriters;
            const songwritersNodes = doc.getElementsByTagName('songwriter');
            if (songwritersNodes.length > 0) {
                const names = [];
                for (let i = 0; i < songwritersNodes.length; i += 1) {
                    if (songwritersNodes[i].textContent) {
                        names.push(songwritersNodes[i].textContent);
                    }
                }
                if (names.length > 0) {
                    songwriters = names.join(', ');
                }
            }
            const translationNodes = doc.getElementsByTagName('translation');
            for (let i = 0; i < translationNodes.length; i += 1) {
                const texts = translationNodes[i].getElementsByTagName('text');
                for (let j = 0; j < texts.length; j += 1) {
                    const textNode = texts[j];
                    const key = textNode.getAttribute('for');
                    if (key && textNode.textContent) {
                        translations[key] = textNode.textContent;
                    }
                }
            }
            const timeToMs = (timeStr) => {
                if (!timeStr)
                    return 0;
                const parts = timeStr.split(':');
                let seconds = 0;
                if (parts.length === 2) {
                    seconds = parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
                }
                else if (parts.length === 3) {
                    seconds =
                        parseInt(parts[0], 10) * 3600 +
                            parseInt(parts[1], 10) * 60 +
                            parseFloat(parts[2]);
                }
                else {
                    seconds = parseFloat(parts[0]);
                }
                return Math.round(seconds * 1000);
            };
            const transliterationNodes = doc.getElementsByTagName('transliteration');
            for (let i = 0; i < transliterationNodes.length; i += 1) {
                const texts = transliterationNodes[i].getElementsByTagName('text');
                for (let j = 0; j < texts.length; j += 1) {
                    const textNode = texts[j];
                    const key = textNode.getAttribute('for');
                    if (!key) {
                        // eslint-disable-next-line no-continue
                        continue;
                    }
                    const spans = Array.from(textNode.getElementsByTagName('span')).filter(span => span.getAttribute('begin'));
                    if (spans.length > 0) {
                        const syllabus = [];
                        let fullText = '';
                        for (let k = 0; k < spans.length; k += 1) {
                            const span = spans[k];
                            const begin = span.getAttribute('begin');
                            const end = span.getAttribute('end');
                            let spanText = span.textContent || '';
                            const nextNode = span.nextSibling;
                            if (nextNode &&
                                nextNode.nodeType === 3 &&
                                /^\s/.test(nextNode.textContent || '') &&
                                !spanText.endsWith(' ')) {
                                spanText += ' ';
                            }
                            if (spanText.trim() === '') {
                                // eslint-disable-next-line no-continue
                                continue;
                            }
                            syllabus.push({
                                time: timeToMs(begin),
                                duration: timeToMs(end) - timeToMs(begin),
                                text: spanText,
                            });
                            fullText += spanText;
                        }
                        transliterations[key] = { text: fullText.trim(), syllabus };
                    }
                    else if (textNode.textContent) {
                        transliterations[key] = {
                            text: textNode.textContent.trim().replace(/\s+/g, ' '),
                        };
                    }
                }
            }
            const lines = [];
            const pNodes = doc.getElementsByTagName('p');
            const lineSingers = [];
            for (let i = 0; i < pNodes.length; i += 1) {
                lineSingers.push(pNodes[i].getAttribute('ttm:agent') || undefined);
            }
            const alignments = AmLyrics.calculateLineAlignments(lineSingers, agentMap);
            for (let i = 0; i < pNodes.length; i += 1) {
                const p = pNodes[i];
                const key = p.getAttribute('itunes:key');
                const beginMs = timeToMs(p.getAttribute('begin'));
                const endMs = timeToMs(p.getAttribute('end'));
                let songPart;
                if (p.parentNode && p.parentNode.tagName === 'div') {
                    songPart =
                        p.parentNode.getAttribute('itunes:songPart') ||
                            undefined;
                }
                const mainSyllables = [];
                const bgSyllables = [];
                const spans = p.getElementsByTagName('span');
                if (spans.length > 0) {
                    for (let j = 0; j < spans.length; j += 1) {
                        const span = spans[j];
                        if (span.getAttribute('ttm:role') === 'x-bg') {
                            const bgInnerSpans = span.getElementsByTagName('span');
                            for (let k = 0; k < bgInnerSpans.length; k += 1) {
                                const bgSpan = bgInnerSpans[k];
                                let bgText = bgSpan.textContent || '';
                                const nextNode = bgSpan.nextSibling;
                                if (nextNode &&
                                    nextNode.nodeType === 3 &&
                                    /^\s/.test(nextNode.textContent || '') &&
                                    !bgText.endsWith(' ')) {
                                    bgText += ' ';
                                }
                                bgSyllables.push({
                                    text: bgText,
                                    timestamp: timeToMs(bgSpan.getAttribute('begin')),
                                    endtime: timeToMs(bgSpan.getAttribute('end')),
                                    part: !/\s$/.test(bgText),
                                });
                            }
                            // eslint-disable-next-line no-continue
                            continue;
                        }
                        if (span.parentNode &&
                            span.parentNode.getAttribute?.('ttm:role') === 'x-bg') {
                            // eslint-disable-next-line no-continue
                            continue;
                        }
                        let text = span.textContent || '';
                        const nextNode = span.nextSibling;
                        if (nextNode &&
                            nextNode.nodeType === 3 &&
                            /^\s/.test(nextNode.textContent || '') &&
                            !text.endsWith(' ')) {
                            text += ' ';
                        }
                        mainSyllables.push({
                            text,
                            timestamp: timeToMs(span.getAttribute('begin')),
                            endtime: timeToMs(span.getAttribute('end')),
                            part: !/\s$/.test(text),
                        });
                    }
                }
                else {
                    mainSyllables.push({
                        text: p.textContent?.trim() || '',
                        timestamp: beginMs,
                        endtime: endMs,
                        part: false,
                        lineSynced: true,
                    });
                }
                const alignment = alignments[i];
                // Distribute line-level transliteration to individual syllables
                // so that per-syllable animated romanisation works (like KPoe lyrics)
                const lineTransliterationItem = key ? transliterations[key] : undefined;
                if (lineTransliterationItem &&
                    mainSyllables.length > 1 &&
                    spans.length > 0) {
                    if (lineTransliterationItem.syllabus &&
                        lineTransliterationItem.syllabus.length === mainSyllables.length) {
                        mainSyllables.forEach((syl, mapIdx) => {
                            // eslint-disable-next-line no-param-reassign
                            syl.romanizedText = lineTransliterationItem.syllabus[mapIdx].text;
                        });
                    }
                    else {
                        const lineTransliteration = lineTransliterationItem.text;
                        const romanWords = lineTransliteration.split(/\s+/).filter(Boolean);
                        const syllableGroups = [];
                        for (let si = 0; si < mainSyllables.length; si += 1) {
                            if (mainSyllables[si].part && syllableGroups.length > 0) {
                                syllableGroups[syllableGroups.length - 1].push(si);
                            }
                            else {
                                syllableGroups.push([si]);
                            }
                        }
                        const isCJK = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(mainSyllables.map(s => s.text).join(''));
                        if (romanWords.length === syllableGroups.length) {
                            syllableGroups.forEach((group, gi) => {
                                // eslint-disable-next-line no-param-reassign
                                mainSyllables[group[0]].romanizedText = romanWords[gi];
                            });
                        }
                        else if (romanWords.length === mainSyllables.length) {
                            mainSyllables.forEach((syl, mapIdx) => {
                                // eslint-disable-next-line no-param-reassign
                                syl.romanizedText = romanWords[mapIdx];
                            });
                        }
                        else if (isCJK) {
                            let romanIdx = 0;
                            for (const group of syllableGroups) {
                                const syl = mainSyllables[group[0]];
                                const sylText = group
                                    .map(gIndex => mainSyllables[gIndex].text)
                                    .join('');
                                const validChars = sylText.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7afA-Za-z0-9]/g) || [];
                                const needed = validChars.length;
                                if (needed > 0 && romanIdx < romanWords.length) {
                                    // eslint-disable-next-line no-param-reassign
                                    syl.romanizedText = romanWords
                                        .slice(romanIdx, romanIdx + needed)
                                        .join(' ');
                                    romanIdx += needed;
                                }
                            }
                        }
                    }
                }
                lines.push({
                    text: mainSyllables,
                    background: bgSyllables.length > 0,
                    backgroundText: bgSyllables,
                    timestamp: beginMs,
                    endtime: endMs,
                    isWordSynced: spans.length > 0,
                    alignment,
                    songPart,
                    translation: key ? translations[key] : undefined,
                    romanizedText: lineTransliterationItem?.text,
                    oppositeTurn: alignment === 'end',
                });
            }
            return { lines, songwriters };
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to parse TTML', e);
            return null;
        }
    }
    static convertKPoeLyrics(payload) {
        if (!payload) {
            return null;
        }
        let rawLyrics = null;
        if (Array.isArray(payload?.lyrics)) {
            rawLyrics = payload.lyrics;
        }
        else if (Array.isArray(payload?.data?.lyrics)) {
            rawLyrics = payload.data.lyrics;
        }
        else if (Array.isArray(payload?.data)) {
            rawLyrics = payload.data;
        }
        if (!rawLyrics || rawLyrics.length === 0) {
            return null;
        }
        const sanitizedEntries = rawLyrics.filter((item) => Boolean(item));
        const lines = [];
        // If type is 'Line', we revert to line-by-line highlighting by skipping syllabus parsing
        const isLineType = payload.type === 'Line' || payload.type === 'line';
        // Convert metadata.agents to type map
        const agentTypes = {};
        if (payload.metadata?.agents) {
            Object.entries(payload.metadata.agents).forEach(([key, agent]) => {
                const mappedKey = agent.alias || key;
                agentTypes[mappedKey] = agent.type;
            });
        }
        const lineSingers = sanitizedEntries.map((entry) => entry.element?.singer);
        const alignments = AmLyrics.calculateLineAlignments(lineSingers, agentTypes);
        for (let i = 0; i < sanitizedEntries.length; i += 1) {
            const entry = sanitizedEntries[i];
            const start = AmLyrics.toMilliseconds(entry.time);
            const duration = AmLyrics.toMilliseconds(entry.duration);
            const alignment = alignments[i];
            const lineText = typeof entry.text === 'string' ? entry.text : '';
            const lineStart = AmLyrics.toMilliseconds(entry.time);
            const lineDuration = AmLyrics.toMilliseconds(entry.duration);
            const explicitEnd = AmLyrics.toMilliseconds(entry.endTime);
            const lineEnd = explicitEnd || lineStart + (lineDuration || 0);
            let syllabus = [];
            if (Array.isArray(entry.syllabus)) {
                syllabus = entry.syllabus.filter((s) => Boolean(s));
            }
            else if (Array.isArray(entry.words)) {
                syllabus = entry.words.filter((s) => Boolean(s));
            }
            const mainSyllables = [];
            const backgroundSyllables = [];
            if (!isLineType && syllabus.length > 0) {
                for (const syl of syllabus) {
                    const sylStart = AmLyrics.toMilliseconds(syl.time, lineStart);
                    const sylDuration = AmLyrics.toMilliseconds(syl.duration);
                    // If there's only 1 syllable and duration is 0, it's likely a line-synced fallback.
                    // Otherwise, it's an instantaneous boundary (like a space or comma) and should not span the line.
                    const sylEnd = sylDuration === 0 && syllabus.length === 1
                        ? lineEnd
                        : sylStart + sylDuration;
                    const syllable = {
                        text: typeof syl.text === 'string' ? syl.text : '',
                        part: Boolean(syl.part),
                        timestamp: sylStart,
                        endtime: sylEnd,
                    };
                    if (syl.isBackground) {
                        backgroundSyllables.push(syllable);
                    }
                    else {
                        mainSyllables.push(syllable);
                    }
                }
            }
            if (mainSyllables.length === 0 && lineText) {
                mainSyllables.push({
                    text: lineText,
                    part: false,
                    timestamp: lineStart,
                    endtime: lineEnd || lineStart,
                    lineSynced: isLineType, // Mark as line-synced
                });
            }
            const hasWordSync = mainSyllables.length > 0 || backgroundSyllables.length > 0;
            const { transliteration } = entry;
            let romanizedTextFromPayload;
            if (transliteration) {
                romanizedTextFromPayload = transliteration.text;
                // If syllabus data matches, map it to main syllables
                if (Array.isArray(transliteration.syllabus) &&
                    transliteration.syllabus.length === mainSyllables.length) {
                    transliteration.syllabus.forEach((s, idx) => {
                        mainSyllables[idx].romanizedText = s.text;
                    });
                }
            }
            // Extract translation from KPoe API if available
            const translationText = entry.translation?.text;
            const lineResult = {
                text: mainSyllables,
                background: backgroundSyllables.length > 0,
                backgroundText: backgroundSyllables,
                oppositeTurn: alignment === 'end' ||
                    (Array.isArray(entry.element)
                        ? entry.element.includes('opposite') ||
                            entry.element.includes('right')
                        : false),
                timestamp: lineStart,
                endtime: start + duration,
                isWordSynced: isLineType ? false : hasWordSync,
                alignment,
                songPart: entry.element?.songPart,
                romanizedText: romanizedTextFromPayload,
                translation: translationText,
            };
            lines.push(lineResult);
        }
        return lines;
    }
    static toMilliseconds(value, fallback = 0) {
        const num = Number(value);
        if (!Number.isFinite(num) || Number.isNaN(num)) {
            return fallback;
        }
        if (!Number.isInteger(num)) {
            return Math.round(num * 1000);
        }
        return Math.max(0, Math.round(num));
    }
    firstUpdated() {
        // Set up scroll event listener for user scroll detection
        // Use wheel/touchmove which are guaranteed to be user initiated,
        // unlike 'scroll' which fires for both user and programmatic/inertia
        if (this.lyricsContainer) {
            this.lyricsContainer.addEventListener('wheel', this._boundHandleUserScroll, { passive: true });
            this.lyricsContainer.addEventListener('touchmove', this._boundHandleUserScroll, { passive: true });
        }
    }
    /**
     * Handle currentTime changes imperatively, bypassing Lit's render cycle.
     * This prevents the template from re-rendering on every frame, which would
     * reset imperative animation classes (highlight, finished, etc.) set by
     * updateSyllablesForLine.
     */
    _onTimeChanged(oldTime, newTime) {
        const timeDiff = Math.abs(newTime - oldTime);
        const isSeek = timeDiff > SEEK_THRESHOLD_MS;
        const newActiveLines = this.findActiveLineIndices(newTime);
        const oldActiveLines = this.activeLineIndices;
        // Reset animation if active lines change or if we skip time.
        const linesChanged = !AmLyrics.arraysEqual(newActiveLines, oldActiveLines);
        if (linesChanged || isSeek) {
            if (this.lyricsContainer) {
                // Remove .active and .bg-expanded immediately when a line drops.
                // All visual fading is handled by CSS transitions — no JS delays,
                // so overlapping lyrics never get stuck with multiple .active lines.
                for (const lineIndex of oldActiveLines) {
                    if (!newActiveLines.includes(lineIndex)) {
                        const lineElement = this._getLineElement(lineIndex);
                        if (lineElement) {
                            if (isSeek ||
                                this.isUserScrolling ||
                                AmLyrics.isLineSyncedLine(this.lyrics?.[lineIndex])) {
                                AmLyrics.unfinishSyllables(lineElement);
                            }
                            else {
                                AmLyrics.finishSyllablesUpToTime(lineElement, newTime);
                            }
                            lineElement.classList.remove('active', 'bg-expanded', 'scroll-exiting');
                            if (lineElement.classList.contains('pre-active')) {
                                lineElement.classList.remove('pre-active');
                            }
                            const preIdx = this.preActiveLineElements.indexOf(lineElement);
                            if (preIdx !== -1)
                                this.preActiveLineElements.splice(preIdx, 1);
                        }
                    }
                }
                // Add 'active' to newly active lines. Background expansion is driven
                // separately by the current scroll target.
                for (const lineIndex of newActiveLines) {
                    if (!oldActiveLines.includes(lineIndex)) {
                        const lineElement = this._getLineElement(lineIndex);
                        if (lineElement) {
                            lineElement.classList.add('active');
                            lineElement.classList.remove('pre-active', 'scroll-exiting');
                            const preIdx = this.preActiveLineElements.indexOf(lineElement);
                            if (preIdx !== -1)
                                this.preActiveLineElements.splice(preIdx, 1);
                        }
                    }
                }
                // Remove pre-active from lines that are now active (they no longer
                // need the unblur preview class) and from lines that dropped.
                for (const lineElement of this.preActiveLineElements) {
                    const idx = AmLyrics.getLineIndexFromElement(lineElement);
                    if (idx === null ||
                        (!newActiveLines.includes(idx) &&
                            lineElement !== this.currentPrimaryActiveLine)) {
                        lineElement.classList.remove('pre-active');
                    }
                }
                this.preActiveLineElements = this.preActiveLineElements.filter(el => el.classList.contains('pre-active'));
            }
            this.startAnimationFromTime(newTime);
        }
        // Predictive scroll: run on every tick so we scroll *before* the next
        // line starts, matching YouLyPlus behaviour.
        this._handleActiveLineScroll(oldActiveLines, isSeek);
        this.clearPastLineHighlights();
        if (this.lyricsContainer) {
            // Update syllables in active lines using cached elements
            for (const lineIndex of this.activeLineIndices) {
                const lineElement = this._getLineElement(lineIndex);
                if (lineElement) {
                    AmLyrics.updateSyllablesForLine(lineElement, newTime);
                }
            }
            // Also update syllables in active gap lines (breathing dots)
            for (const gapLine of this.activeGapLineElements) {
                AmLyrics.updateSyllablesForLine(gapLine, newTime);
            }
            // Imperatively manage gap active state
            if (this.gapElementCache.size > 0) {
                for (const [, gap] of this.gapElementCache) {
                    const gapStartTime = gap._cachedStartTime ??
                        parseFloat(gap.getAttribute('data-start-time') || '0');
                    const gapEndTime = gap._cachedEndTime ??
                        parseFloat(gap.getAttribute('data-end-time') || '0');
                    const shouldBeActive = newTime >= gapStartTime && newTime < gapEndTime;
                    const isActive = gap.classList.contains('active');
                    const isExiting = gap.classList.contains('gap-exiting');
                    const exitLeadMs = GAP_EXIT_LEAD_MS;
                    const shouldStartExiting = isActive && !isExiting && newTime >= gapEndTime - exitLeadMs;
                    if (shouldBeActive && (!isActive || isSeek) && !isExiting) {
                        gap.classList.remove('gap-exiting');
                        if (isSeek && isActive) {
                            gap.classList.remove('active');
                            // eslint-disable-next-line no-void
                            void gap.offsetWidth; // Force reflow
                        }
                        const gapDuration = gapEndTime - gapStartTime;
                        const baseLoopDelay = AmLyrics.getGapLoopDelay(gapDuration);
                        const totalDelay = baseLoopDelay + (newTime - gapStartTime);
                        gap.style.setProperty('--gap-loop-delay', `-${totalDelay}ms`);
                        gap.classList.add('active');
                        if (!this.activeGapLineElements.includes(gap)) {
                            this.activeGapLineElements.push(gap);
                        }
                        const dotSyllables = gap.querySelectorAll('.lyrics-syllable');
                        dotSyllables.forEach(dot => {
                            const dotStart = parseFloat(dot.getAttribute('data-start-time') || '0');
                            const dotEnd = parseFloat(dot.getAttribute('data-end-time') || '0');
                            if (newTime > dotEnd) {
                                dot.classList.add('finished');
                                if (!dot.classList.contains('highlight')) {
                                    AmLyrics.updateSyllableAnimation(dot, newTime - dotStart);
                                }
                            }
                            else if (newTime >= dotStart && newTime <= dotEnd) {
                                AmLyrics.updateSyllableAnimation(dot, newTime - dotStart);
                            }
                        });
                    }
                    else if (shouldStartExiting) {
                        // Cancel gap-loop first, force reflow, then start gap-ended
                        // so the browser sees a clean animation swap
                        gap.classList.remove('active');
                        // eslint-disable-next-line no-void
                        void gap.offsetWidth;
                        gap.classList.add('gap-exiting');
                        const gapIdx = this.activeGapLineElements.indexOf(gap);
                        if (gapIdx !== -1)
                            this.activeGapLineElements.splice(gapIdx, 1);
                        setTimeout(() => {
                            gap.classList.remove('gap-exiting');
                        }, GAP_EXIT_LEAD_MS);
                    }
                    else if (!shouldBeActive && (isActive || isExiting)) {
                        gap.classList.remove('active');
                        gap.classList.remove('gap-exiting');
                        const gapIdx = this.activeGapLineElements.indexOf(gap);
                        if (gapIdx !== -1)
                            this.activeGapLineElements.splice(gapIdx, 1);
                    }
                    else if (isExiting && newTime < gapEndTime - exitLeadMs) {
                        gap.classList.remove('gap-exiting');
                    }
                }
            }
            else if (this.lyricsContainer) {
                // Fallback: no cache yet, use querySelectorAll
                const allGaps = this.lyricsContainer.querySelectorAll('.lyrics-gap');
                allGaps.forEach(gap => {
                    const gapStartTime = parseFloat(gap.getAttribute('data-start-time') || '0');
                    const gapEndTime = parseFloat(gap.getAttribute('data-end-time') || '0');
                    const shouldBeActive = newTime >= gapStartTime && newTime < gapEndTime;
                    const isActive = gap.classList.contains('active');
                    const isExiting = gap.classList.contains('gap-exiting');
                    const exitLeadMs = GAP_EXIT_LEAD_MS;
                    const shouldStartExiting = isActive && !isExiting && newTime >= gapEndTime - exitLeadMs;
                    if (shouldBeActive && (!isActive || isSeek) && !isExiting) {
                        gap.classList.remove('gap-exiting');
                        if (isSeek && isActive) {
                            gap.classList.remove('active');
                            // eslint-disable-next-line no-void
                            void gap.offsetWidth; // Force reflow
                        }
                        const gapDuration = gapEndTime - gapStartTime;
                        const baseLoopDelay = AmLyrics.getGapLoopDelay(gapDuration);
                        const totalDelay = baseLoopDelay + (newTime - gapStartTime);
                        gap.style.setProperty('--gap-loop-delay', `-${totalDelay}ms`);
                        gap.classList.add('active');
                        if (!this.activeGapLineElements.includes(gap)) {
                            this.activeGapLineElements.push(gap);
                        }
                    }
                    else if (shouldStartExiting) {
                        // Cancel gap-loop first, force reflow, then start gap-ended
                        gap.classList.remove('active');
                        // eslint-disable-next-line no-void
                        void gap.offsetWidth;
                        gap.classList.add('gap-exiting');
                        const gapIdx = this.activeGapLineElements.indexOf(gap);
                        if (gapIdx !== -1)
                            this.activeGapLineElements.splice(gapIdx, 1);
                        setTimeout(() => {
                            gap.classList.remove('gap-exiting');
                        }, GAP_EXIT_LEAD_MS);
                    }
                    else if (!shouldBeActive && (isActive || isExiting)) {
                        gap.classList.remove('active');
                        gap.classList.remove('gap-exiting');
                        const gapIdx = this.activeGapLineElements.indexOf(gap);
                        if (gapIdx !== -1)
                            this.activeGapLineElements.splice(gapIdx, 1);
                    }
                    else if (isExiting && newTime < gapEndTime - exitLeadMs) {
                        gap.classList.remove('gap-exiting');
                    }
                });
            }
            // Track instrumental gap state
            const currentGap = this.findInstrumentalGapAt(newTime);
            if (currentGap) {
                this.lastInstrumentalIndex = currentGap.insertBeforeIndex;
                // Un-highlight the previous line immediately when gap dots are playing
                if (currentGap.insertBeforeIndex > 0) {
                    const prevLine = this._getLineElement(currentGap.insertBeforeIndex - 1);
                    if (prevLine &&
                        prevLine.classList.contains('persist-highlight') &&
                        !prevLine.classList.contains('active')) {
                        AmLyrics.unfinishSyllables(prevLine);
                    }
                }
            }
            else if (this.lastInstrumentalIndex !== null) {
                this.lastInstrumentalIndex = null;
            }
            // Check footer active state
            const lastLyric = this.lyrics && this.lyrics.length > 0
                ? this.lyrics[this.lyrics.length - 1]
                : null;
            const footer = this.lyricsContainer.querySelector('.lyrics-footer');
            if (footer && lastLyric && lastLyric.endtime > 0) {
                const isFooterActive = newTime > lastLyric.endtime + 200; // Snappier 200ms buffer
                if (isFooterActive && !footer.classList.contains('active')) {
                    footer.classList.add('active');
                    // Clear pre-active from the last lyric so it doesn't stay
                    // unblurred when the footer takes over.
                    const lastLine = this.lyricsContainer.querySelector('.lyrics-line:last-of-type');
                    if (lastLine) {
                        lastLine.classList.remove('pre-active');
                        const preIdx = this.preActiveLineElements.indexOf(lastLine);
                        if (preIdx !== -1)
                            this.preActiveLineElements.splice(preIdx, 1);
                    }
                    if (this.autoScroll &&
                        !this.isUserScrolling &&
                        !this.isClickSeeking) {
                        this.focusLine(footer);
                    }
                }
                else if (!isFooterActive && footer.classList.contains('active')) {
                    footer.classList.remove('active');
                }
            }
        }
    }
    updated(changedProperties) {
        const lyricsDomBecameRenderable = changedProperties.has('lyrics') ||
            (changedProperties.has('isLoading') &&
                !this.isLoading &&
                Boolean(this.lyrics));
        if (lyricsDomBecameRenderable) {
            this._invalidateCaches();
            this._ensureLineDataCache();
            this._updateCachedIsUnsynced();
            // Recalculate timing data for accurate animations whenever lyrics change
            this._updateCharTimingData();
            // Apply 'active' classes imperatively after lyrics first render,
            // since the template no longer binds the 'active' class (to avoid
            // clobbering imperative scroll-animate classes on re-render).
            if (this.lyricsContainer && this.lyrics) {
                const activeLines = this.findActiveLineIndices(this.currentTime);
                for (const lineIndex of activeLines) {
                    const lineEl = this._getLineElement(lineIndex);
                    if (lineEl)
                        lineEl.classList.add('active');
                }
                const primaryActiveLine = this.getPrimaryActiveLineIndex(activeLines);
                this.setBackgroundExpandedLine(primaryActiveLine !== null
                    ? this._getLineElement(primaryActiveLine)
                    : null);
                // Trigger a faux time-change so that updateSyllablesForLine fires
                // to setup inline syllable CSS wipe animations for whatever the current time is
                this._onTimeChanged(0, this.currentTime);
                // Ensure position classes are applied on initial render if not playing yet
                if (this.positionedLineElements.length === 0) {
                    const firstLine = this.lyricsContainer.querySelector('.lyrics-line');
                    if (firstLine)
                        this.updatePositionClasses(firstLine);
                }
                // Set up IntersectionObserver for viewport virtualization
                this.visibilityObserver?.disconnect();
                this.visibilityObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        const el = entry.target;
                        el.classList.toggle('far-line', !entry.isIntersecting);
                    });
                }, {
                    root: this.lyricsContainer,
                    rootMargin: '200px',
                    threshold: 0,
                });
                const lines = this.lyricsContainer.querySelectorAll('.lyrics-line');
                lines.forEach(line => this.visibilityObserver.observe(line));
            }
        }
        // Handle duration reset (-1 stops playback and resets currentTime to 0)
        if (changedProperties.has('duration') && this.duration === -1) {
            this.currentTime = 0;
            this.activeLineIndices = [];
            this.activeMainWordIndices.clear();
            this.activeBackgroundWordIndices.clear();
            this.mainWordProgress.clear();
            this.backgroundWordProgress.clear();
            this.mainWordAnimations.clear();
            this.backgroundWordAnimations.clear();
            this.preActiveLineElements = [];
            this.positionedLineElements = [];
            this.activeGapLineElements = [];
            this.clearBackgroundExpandedLine();
            this.setUserScrolling(false);
            // Cancel any running animations
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = undefined;
            }
            // Clear user scroll timeout
            if (this.userScrollTimeoutId) {
                clearTimeout(this.userScrollTimeoutId);
                this.userScrollTimeoutId = undefined;
            }
            if (this.scrollUnlockTimeout) {
                clearTimeout(this.scrollUnlockTimeout);
                this.scrollUnlockTimeout = undefined;
            }
            if (this.scrollAnimationTimeout) {
                clearTimeout(this.scrollAnimationTimeout);
                this.scrollAnimationTimeout = undefined;
            }
            // Scroll to top
            if (this.lyricsContainer) {
                this.lyricsContainer.scrollTop = 0;
            }
            return; // Exit early, don't process other changes
        }
        if ((changedProperties.has('query') ||
            changedProperties.has('musicId') ||
            changedProperties.has('isrc') ||
            changedProperties.has('ttml') ||
            changedProperties.has('songTitle') ||
            changedProperties.has('songArtist') ||
            changedProperties.has('songAlbum') ||
            changedProperties.has('songDurationMs')) &&
            !changedProperties.has('currentTime')) {
            this.fetchLyrics();
        }
        if (changedProperties.has('currentTime') && this.lyrics) ;
    }
    /**
     * Handle scrolling when active line indices change.
     * Called imperatively from _onTimeChanged instead of from updated().
     *
     * Uses predictive scroll like YouLyPlus: computes a scrollLookAheadMs based
     * on the gap to the next line, finds the primary line at predictiveTime,
     * and scrolls with a duration matching the lookahead.
     */
    _handleActiveLineScroll(_oldActiveIndices, forceScroll = false) {
        if (!this.lyricsContainer || !this.lyrics || this.lyrics.length === 0) {
            return;
        }
        // If the footer is already active, it set up its own scroll.
        // Don't override it with a scroll back to the last lyric.
        const footer = this.lyricsContainer.querySelector('.lyrics-footer');
        if (footer?.classList.contains('active')) {
            this.setBackgroundExpandedLine(null);
            return;
        }
        // 1. Compute scroll lookahead based on gap to next line (YouLyPlus style)
        let scrollLookAheadMs = 350;
        let currentAudioIndex = -1;
        for (let i = 0; i < this.lyrics.length; i += 1) {
            if (this.lyrics[i].timestamp > this.currentTime) {
                currentAudioIndex = i - 1;
                break;
            }
        }
        if (currentAudioIndex === -1 && this.lyrics.length > 0) {
            if (this.currentTime >= this.lyrics[this.lyrics.length - 1].timestamp) {
                currentAudioIndex = this.lyrics.length - 1;
            }
        }
        if (currentAudioIndex !== -1 &&
            currentAudioIndex + 1 < this.lyrics.length) {
            const currentLine = this.lyrics[currentAudioIndex];
            const nextLine = this.lyrics[currentAudioIndex + 1];
            const gap = nextLine.timestamp - currentLine.endtime;
            scrollLookAheadMs = Math.min(500, Math.max(350, gap));
        }
        // 2. Find scroll target at predictive time
        const predictiveTime = this.currentTime + scrollLookAheadMs;
        const predictiveActiveIndices = this.findActiveLineIndices(predictiveTime);
        let targetElement = null;
        if (predictiveActiveIndices.length > 0) {
            const targetLineIdx = this.getPrimaryScrollLineIndex(predictiveActiveIndices, predictiveTime);
            if (targetLineIdx !== null && targetLineIdx !== -1) {
                targetElement = this._getLineElement(targetLineIdx);
            }
        }
        if (!targetElement) {
            // Fallback: closest line before predictiveTime
            const targetLineIdx = this.getLineIndexAtTime(predictiveTime, 0);
            if (targetLineIdx !== null && targetLineIdx !== -1) {
                targetElement = this._getLineElement(targetLineIdx);
            }
        }
        if (!targetElement) {
            this.setBackgroundExpandedLine(null);
            return;
        }
        const scrollDuration = scrollLookAheadMs;
        if (targetElement !== this.currentPrimaryActiveLine || forceScroll) {
            targetElement.style.setProperty('--scroll-duration', `${scrollDuration}ms`);
        }
        this.setBackgroundExpandedLine(targetElement);
        // Unblur the upcoming target line early while the separate bg-expanded
        // class starts background vocal height/opacity in sync with scroll.
        if (!targetElement.classList.contains('active')) {
            targetElement.classList.add('pre-active');
            if (!this.preActiveLineElements.includes(targetElement)) {
                this.preActiveLineElements.push(targetElement);
            }
        }
        this.focusLine(targetElement, forceScroll, scrollDuration);
    }
    _getTextWidth(text, font) {
        if (!this._textWidthCanvas) {
            this._textWidthCanvas = document.createElement('canvas');
            this._textWidthCtx = this._textWidthCanvas.getContext('2d', {
                willReadFrequently: true,
            });
        }
        if (this._textWidthCtx) {
            this._textWidthCtx.font = font;
            return this._textWidthCtx.measureText(text).width;
        }
        return 0;
    }
    _rebuildDomCache() {
        if (!this.lyricsContainer)
            return;
        this.lineElementCache.clear();
        this.gapElementCache.clear();
        this.cachedLineArray = [];
        if (!this.lyrics)
            return;
        for (let i = 0; i < this.lyrics.length; i += 1) {
            const lineEl = this.lyricsContainer.querySelector(`#lyrics-line-${i}`);
            if (lineEl)
                this.lineElementCache.set(i, lineEl);
            const gapEl = this.lyricsContainer.querySelector(`#gap-${i}`);
            if (gapEl) {
                // Cache numeric timing values to avoid parseFloat on every frame
                gapEl._cachedStartTime = parseFloat(gapEl.getAttribute('data-start-time') || '0');
                gapEl._cachedEndTime = parseFloat(gapEl.getAttribute('data-end-time') || '0');
                this.gapElementCache.set(i, gapEl);
            }
        }
        // Rebuild cached line array for scroll/position queries
        const lineElements = this.lyricsContainer.querySelectorAll('.lyrics-line');
        this.cachedLineArray = Array.from(lineElements);
    }
    _getLineElement(index) {
        const cached = this.lineElementCache.get(index);
        if (cached)
            return cached;
        if (!this.lyricsContainer)
            return null;
        const el = this.lyricsContainer.querySelector(`#lyrics-line-${index}`);
        if (el)
            this.lineElementCache.set(index, el);
        return el;
    }
    _getGapElement(index) {
        const cached = this.gapElementCache.get(index);
        if (cached)
            return cached;
        if (!this.lyricsContainer)
            return null;
        const el = this.lyricsContainer.querySelector(`#gap-${index}`);
        if (el)
            this.gapElementCache.set(index, el);
        return el;
    }
    _invalidateCaches() {
        this.cachedAllGaps = [];
        this.cachedIsUnsynced = false;
        this.cachedLineData = null;
        this.lineElementCache.clear();
        this.gapElementCache.clear();
        this.cachedLineArray = [];
        this.cachedScrollPaddingTop = null;
        this.preActiveLineElements = [];
        this.positionedLineElements = [];
        this.activeGapLineElements = [];
        this.clearBackgroundExpandedLine();
        this.visibilityObserver?.disconnect();
        this.visibilityObserver = undefined;
    }
    _updateCachedIsUnsynced() {
        this.cachedIsUnsynced =
            this.lyrics && this.lyrics.length > 0
                ? this.lyrics.every(l => l.timestamp === 0 && l.endtime === 0)
                : false;
    }
    _ensureLineDataCache() {
        if (this.cachedLineData || !this.lyrics)
            return;
        this.cachedLineData = this.lyrics.map(line => {
            const wordGroups = [];
            let currentGroupBuffer = [];
            line.text.forEach((syllable, idx) => {
                currentGroupBuffer.push(syllable);
                const nextSyllable = line.text[idx + 1];
                const endsWithDelimiter = !nextSyllable ||
                    syllable.part === false ||
                    /\s$/.test(syllable.text) ||
                    (nextSyllable &&
                        syllable.isBackground !==
                            nextSyllable.isBackground);
                if (endsWithDelimiter) {
                    wordGroups.push(currentGroupBuffer);
                    currentGroupBuffer = [];
                }
            });
            if (currentGroupBuffer.length > 0) {
                wordGroups.push(currentGroupBuffer);
            }
            const groupGrowable = new Array(wordGroups.length).fill(false);
            const groupGlowing = new Array(wordGroups.length).fill(false);
            const groupCharRise = new Array(wordGroups.length).fill(false);
            const groupCharDrag = new Array(wordGroups.length).fill(false);
            const vwFullText = new Array(wordGroups.length).fill('');
            const vwFullDuration = new Array(wordGroups.length).fill(0);
            const vwCharOffset = new Array(wordGroups.length).fill(0);
            const vwStartMs = new Array(wordGroups.length).fill(0);
            const vwEndMs = new Array(wordGroups.length).fill(0);
            let lineIsRTL = false;
            let vwStart = 0;
            while (vwStart < wordGroups.length) {
                let vwEnd = vwStart;
                while (vwEnd < wordGroups.length - 1) {
                    const grp = wordGroups[vwEnd];
                    const lastText = grp[grp.length - 1].text;
                    if (/\s$/.test(lastText))
                        break;
                    vwEnd += 1;
                }
                const combinedText = wordGroups
                    .slice(vwStart, vwEnd + 1)
                    .flatMap(g => g.map(s => s.text))
                    .join('')
                    .trim();
                const combinedStart = wordGroups[vwStart][0].timestamp;
                const lastGrp = wordGroups[vwEnd];
                const combinedEnd = lastGrp[lastGrp.length - 1].endtime;
                const combinedDuration = combinedEnd - combinedStart;
                const isCJK = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(combinedText);
                const isRTL = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF]/.test(combinedText);
                if (isRTL)
                    lineIsRTL = true;
                const hasHyphen = combinedText.includes('-');
                const wordLen = combinedText.length;
                const canAnimateByChar = !isCJK && !isRTL && !hasHyphen && wordLen > 0;
                const isLineSynced = line.isWordSynced === false || line.text.some(s => s.lineSynced);
                let isGrowableVW = canAnimateByChar && wordLen > 0 && wordLen <= 7;
                if (isGrowableVW) {
                    if (wordLen <= 1) {
                        isGrowableVW =
                            combinedDuration >= 1050 && combinedDuration >= wordLen * 525;
                    }
                    else if (wordLen <= 3) {
                        isGrowableVW =
                            combinedDuration >=
                                SHORT_WORD_GLOW_MIN_DURATION_MS + (wordLen - 2) * 140;
                    }
                    else {
                        isGrowableVW =
                            combinedDuration >= 850 && combinedDuration >= wordLen * 190;
                    }
                }
                const hasCharRiseDuration = combinedDuration >= Math.max(700, wordLen * 85);
                const hasTinyWordDragDuration = wordLen >= 2 &&
                    wordLen <= 3 &&
                    combinedDuration >=
                        Math.max(SHORT_WORD_DRAG_MIN_DURATION_MS, wordLen * 150);
                const hasLongShortWordDuration = wordLen >= 4 && combinedDuration >= Math.max(1300, wordLen * 260);
                const isCharRiseVW = canAnimateByChar &&
                    !isLineSynced &&
                    !isGrowableVW &&
                    ((wordLen >= 8 && hasCharRiseDuration) ||
                        (wordLen < 8 && hasLongShortWordDuration));
                const isCharDragVW = canAnimateByChar &&
                    !isLineSynced &&
                    !isGrowableVW &&
                    hasTinyWordDragDuration;
                const isGlowingVW = isGrowableVW && !isLineSynced;
                let charOff = 0;
                for (let gi = vwStart; gi <= vwEnd; gi += 1) {
                    groupGrowable[gi] = isGrowableVW;
                    groupGlowing[gi] = isGlowingVW;
                    groupCharRise[gi] = isCharRiseVW;
                    groupCharDrag[gi] = isCharDragVW;
                    vwFullText[gi] = combinedText;
                    vwFullDuration[gi] = combinedDuration;
                    vwCharOffset[gi] = charOff;
                    vwStartMs[gi] = combinedStart;
                    vwEndMs[gi] = combinedEnd;
                    const grpText = wordGroups[gi].map(s => s.text).join('');
                    charOff += grpText.replace(/\s/g, '').length;
                }
                vwStart = vwEnd + 1;
            }
            return {
                wordGroups,
                groupGrowable,
                groupGlowing,
                groupCharRise,
                groupCharDrag,
                vwFullText,
                vwFullDuration,
                vwCharOffset,
                vwStartMs,
                vwEndMs,
                lineIsRTL,
            };
        });
    }
    _updateCharTimingData() {
        if (!this.shadowRoot)
            return;
        this._rebuildDomCache();
        // Get the computed font from the first syllable to ensure accuracy
        const referenceSyllable = this.shadowRoot.querySelector('.lyrics-syllable');
        if (!referenceSyllable)
            return;
        const computedStyle = getComputedStyle(referenceSyllable);
        const { font } = computedStyle; // Full font string
        const fontSize = Number.parseFloat(computedStyle.fontSize) || 16;
        const charTimedWords = Array.from(this.shadowRoot.querySelectorAll('.lyrics-word.growable, .lyrics-word.char-rise, .lyrics-word.char-drag'));
        if (charTimedWords.length === 0)
            return;
        const wordsByVirtualId = new Map();
        charTimedWords.forEach((wordSpan, index) => {
            const virtualWordId = wordSpan.dataset.virtualWordId || `word-${index}`;
            const words = wordsByVirtualId.get(virtualWordId);
            if (words) {
                words.push(wordSpan);
            }
            else {
                wordsByVirtualId.set(virtualWordId, [wordSpan]);
            }
        });
        wordsByVirtualId.forEach(wordSpans => {
            const syllables = [];
            wordSpans.forEach(wordSpan => {
                const syllableWraps = wordSpan.querySelectorAll('.lyrics-syllable-wrap');
                syllableWraps.forEach(wrap => {
                    const syl = wrap.querySelector('.lyrics-syllable');
                    if (syl)
                        syllables.push(syl);
                });
            });
            const charSpans = syllables.flatMap(syl => {
                const spans = Array.from(syl.querySelectorAll('.char'));
                const target = syl;
                target._cachedCharSpans = spans;
                return spans;
            });
            if (charSpans.length === 0)
                return;
            wordSpans.forEach(wordSpan => {
                const target = wordSpan;
                target._cachedVirtualWordElements = wordSpans;
                target._cachedVirtualWordCharSpans = charSpans;
            });
            const syllableEntries = syllables.map(syl => {
                const spans = syl._cachedCharSpans;
                const charWidths = spans.map(span => this._getTextWidth(span.textContent || '', font));
                const totalWidth = charWidths.reduce((a, b) => a + b, 0);
                return {
                    syl,
                    spans,
                    charWidths,
                    totalWidth,
                    start: parseFloat(syl.getAttribute('data-start-time') || ''),
                    end: parseFloat(syl.getAttribute('data-end-time') || ''),
                };
            });
            const totalWordWidth = syllableEntries.reduce((total, entry) => total + entry.totalWidth, 0);
            if (totalWordWidth <= 0)
                return;
            const virtualWordStart = Math.min(...syllableEntries
                .map(entry => entry.start)
                .filter(start => Number.isFinite(start)));
            const virtualWordEnd = Math.max(...syllableEntries
                .map(entry => entry.end)
                .filter(end => Number.isFinite(end)));
            const virtualWordDuration = virtualWordEnd - virtualWordStart;
            const hasTimedSyllables = Number.isFinite(virtualWordStart) &&
                Number.isFinite(virtualWordEnd) &&
                virtualWordDuration > 0;
            const wordVelocityPxPerMs = hasTimedSyllables
                ? totalWordWidth / virtualWordDuration
                : 0;
            const gradientLeadWidthPx = (BASE_WIPE_GRADIENT_EM * Math.max(1, fontSize)) / 2;
            const measuredPreWipeDuration = wordVelocityPxPerMs > 0
                ? gradientLeadWidthPx / wordVelocityPxPerMs
                : 100;
            let cumulativeCharWidth = 0;
            syllableEntries.forEach(entry => {
                let cumulativeSyllableWidth = 0;
                const syllableDuration = entry.end - entry.start;
                const useSyllableTiming = hasTimedSyllables &&
                    Number.isFinite(entry.start) &&
                    Number.isFinite(entry.end) &&
                    syllableDuration > 0 &&
                    entry.totalWidth > 0;
                entry.spans.forEach((span, index) => {
                    const charWidth = entry.charWidths[index];
                    let startPercent = cumulativeCharWidth / totalWordWidth;
                    let durationPercent = charWidth / totalWordWidth;
                    if (useSyllableTiming) {
                        const charStartMs = entry.start -
                            virtualWordStart +
                            (cumulativeSyllableWidth / entry.totalWidth) * syllableDuration;
                        const charDurationMs = (charWidth / entry.totalWidth) * syllableDuration;
                        startPercent = AmLyrics.clamp(charStartMs / virtualWordDuration, 0, 1);
                        durationPercent = AmLyrics.clamp(charDurationMs / virtualWordDuration, 0, 1);
                    }
                    const target = span;
                    target.dataset.wipeStart = startPercent.toFixed(4);
                    target.dataset.wipeDuration = durationPercent.toFixed(4);
                    target.dataset.preWipeDuration = measuredPreWipeDuration.toFixed(2);
                    target.style.setProperty('--word-wipe-width', `${totalWordWidth}px`);
                    target.style.setProperty('--char-wipe-position', `${-cumulativeCharWidth}px`);
                    cumulativeCharWidth += charWidth;
                    cumulativeSyllableWidth += charWidth;
                });
            });
        });
    }
    static arraysEqual(a, b) {
        return a.length === b.length && a.every((val, i) => val === b[i]);
    }
    static isLineSyncedLine(line) {
        if (!line)
            return false;
        return line.isWordSynced === false || line.text.some(s => s.lineSynced);
    }
    getLineHighlightEndTime(index) {
        if (!this.lyrics)
            return 0;
        const line = this.lyrics[index];
        if (!line)
            return 0;
        const rawEnd = Math.max(line.endtime, line.timestamp);
        const nextLine = this.lyrics[index + 1];
        if (!nextLine || nextLine.timestamp <= line.timestamp) {
            return rawEnd > line.timestamp ? rawEnd + 200 : rawEnd;
        }
        if (rawEnd > line.timestamp) {
            if (nextLine.timestamp < rawEnd) {
                return rawEnd;
            }
            const gapToNext = nextLine.timestamp - rawEnd;
            if (gapToNext >= INSTRUMENTAL_THRESHOLD_MS) {
                return rawEnd;
            }
        }
        return nextLine.timestamp;
    }
    static getLineIndexFromElement(lineElement) {
        if (!lineElement)
            return null;
        const match = lineElement.id.match(/^lyrics-line-(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
    }
    static getGapLoopDelay(gapDuration) {
        const desiredPhase = GAP_PULSE_DURATION_MS;
        const targetTime = gapDuration - GAP_EXIT_LEAD_MS;
        const normalizedTarget = ((targetTime % GAP_PULSE_CYCLE_MS) + GAP_PULSE_CYCLE_MS) %
            GAP_PULSE_CYCLE_MS;
        return ((((desiredPhase - normalizedTarget) % GAP_PULSE_CYCLE_MS) +
            GAP_PULSE_CYCLE_MS) %
            GAP_PULSE_CYCLE_MS);
    }
    clearPreActiveClasses(exceptLineIndex = null) {
        if (!this.lyricsContainer)
            return;
        const keptLines = [];
        for (const lineElement of this.preActiveLineElements) {
            const lineIndex = AmLyrics.getLineIndexFromElement(lineElement);
            if (lineIndex === exceptLineIndex) {
                keptLines.push(lineElement);
            }
            else {
                lineElement.classList.remove('pre-active');
            }
        }
        this.preActiveLineElements = keptLines;
    }
    setBackgroundExpandedLine(lineElement) {
        const target = lineElement &&
            !lineElement.classList.contains('lyrics-gap') &&
            lineElement.querySelector('.background-vocal-container')
            ? lineElement
            : null;
        if (this.backgroundExpandedLine === target) {
            if (target && !target.classList.contains('bg-expanded')) {
                target.classList.add('bg-expanded');
            }
            return;
        }
        this.backgroundExpandedLine?.classList.remove('bg-expanded');
        this.backgroundExpandedLine = target;
        target?.classList.add('bg-expanded');
    }
    clearBackgroundExpandedLine() {
        this.backgroundExpandedLine?.classList.remove('bg-expanded');
        this.backgroundExpandedLine = null;
    }
    getPrimaryActiveLineIndex(activeIndices) {
        if (activeIndices.length === 0)
            return null;
        const groupStart = activeIndices[0];
        const groupEnd = activeIndices[activeIndices.length - 1];
        let candidateIndex = Math.max(groupStart, groupEnd - 2);
        const currentPrimaryIndex = AmLyrics.getLineIndexFromElement(this.currentPrimaryActiveLine);
        if (currentPrimaryIndex !== null &&
            activeIndices.includes(currentPrimaryIndex)) {
            if (activeIndices.length <= 3) {
                candidateIndex = currentPrimaryIndex;
            }
            else if (candidateIndex < currentPrimaryIndex) {
                candidateIndex = currentPrimaryIndex;
            }
        }
        return candidateIndex;
    }
    getPrimaryScrollLineIndex(_activeIndices, time) {
        if (!this.lyrics || this.lyrics.length === 0)
            return null;
        // YouLyPlus-style: primary is simply the line at predictive time.
        const primaryIndex = this.getLineIndexAtTime(time, this.lastActiveIndex);
        if (primaryIndex === -1)
            return null;
        // Guard: if new primary is ahead of current but they share the same
        // end time, keep current to prevent bounce during overlaps.
        const currentPrimaryIndex = AmLyrics.getLineIndexFromElement(this.currentPrimaryActiveLine);
        if (currentPrimaryIndex !== null &&
            primaryIndex > currentPrimaryIndex &&
            this.lyrics[currentPrimaryIndex] &&
            this.lyrics[primaryIndex] &&
            this.lyrics[currentPrimaryIndex].endtime ===
                this.lyrics[primaryIndex].endtime) {
            const activeCount = this.findActiveLineIndices(time).length;
            if (activeCount <= 3) {
                return currentPrimaryIndex;
            }
        }
        return primaryIndex;
    }
    getOverlapClusterForActiveIndices(activeIndices, time) {
        if (!this.lyrics || activeIndices.length === 0)
            return null;
        let start = activeIndices[0];
        while (start > 0 &&
            this.lyrics[start - 1].endtime >= this.lyrics[start].timestamp) {
            start -= 1;
        }
        let end = start;
        let clusterEndTime = this.lyrics[start].endtime;
        while (end + 1 < this.lyrics.length &&
            this.lyrics[end + 1].timestamp <= clusterEndTime) {
            end += 1;
            clusterEndTime = Math.max(clusterEndTime, this.lyrics[end].endtime);
        }
        let startedEnd = start;
        let startedEndTime = this.lyrics[start].endtime;
        for (let i = start; i <= end; i += 1) {
            if (this.lyrics[i].timestamp <= time) {
                startedEnd = i;
                startedEndTime = Math.max(startedEndTime, this.lyrics[i].endtime);
            }
            else {
                break;
            }
        }
        return { start, end, startedEnd, startedEndTime };
    }
    focusLine(lineElement, forceScroll = false, scrollDuration = undefined, skipScroll = false, preservePrimary = false) {
        const primaryChanged = lineElement !== this.currentPrimaryActiveLine;
        if (primaryChanged && !preservePrimary) {
            // .active is now managed solely by findActiveLineIndices (which uses
            // effectiveEndTimes).  Lines stay active until their extended end,
            // so we no longer need to remove .active here.
            this.lastPrimaryActiveLine = this.currentPrimaryActiveLine;
            if (this.lastPrimaryActiveLine) {
                this.lastPrimaryActiveLine.style.setProperty('--scroll-duration', `${scrollDuration ?? SCROLL_ANIMATION_DURATION_MS}ms`);
                this.lastPrimaryActiveLine.classList.add('scroll-exiting');
            }
            this.currentPrimaryActiveLine = lineElement;
            this.currentPrimaryActiveLine.classList.remove('scroll-exiting');
            const lineIndex = AmLyrics.getLineIndexFromElement(lineElement);
            if (lineIndex !== null) {
                this.lastActiveIndex = lineIndex;
            }
        }
        // Only update blur/opacity position classes when the primary line
        // actually changes (or on force scroll). Running this every tick
        // causes visual churn and upward glitches.
        if (primaryChanged || forceScroll) {
            this.updatePositionClasses(lineElement);
        }
        if (!skipScroll &&
            (forceScroll || primaryChanged || preservePrimary) &&
            this.autoScroll &&
            !this.isUserScrolling &&
            !this.isClickSeeking) {
            this.scrollToActiveLineYouLy(lineElement, forceScroll, scrollDuration);
        }
    }
    setUserScrolling(value) {
        this.isUserScrolling = value;
        if (value) {
            this.lyricsContainer?.classList.add('user-scrolling');
        }
        else {
            this.lyricsContainer?.classList.remove('user-scrolling');
        }
    }
    handleUserScroll() {
        // Ignore programmatic scrolls and click-seek scrolls
        if (this.isProgrammaticScroll || this.isClickSeeking) {
            return;
        }
        // Mark that user is currently scrolling
        this.setUserScrolling(true);
        this.clearPastLineHighlights();
        // Clear any existing timeout
        if (this.userScrollTimeoutId) {
            clearTimeout(this.userScrollTimeoutId);
        }
        // Set timeout to re-enable auto-scroll after 2 seconds of no scrolling
        this.userScrollTimeoutId = window.setTimeout(() => {
            this.setUserScrolling(false);
            this.userScrollTimeoutId = undefined;
            // Optionally scroll back to current active line when re-enabling auto-scroll
            if (this.activeLineIndices.length > 0) {
                this._handleActiveLineScroll([], false);
            }
        }, 2000);
    }
    clearPastLineHighlights() {
        if (!this.lyricsContainer)
            return;
        const lineElements = this.cachedLineArray.length
            ? this.cachedLineArray
            : Array.from(this.lyricsContainer.querySelectorAll('.lyrics-line:not(.lyrics-gap)'));
        const containerRect = this.lyricsContainer.getBoundingClientRect();
        const anchorY = containerRect.top + this.getScrollPaddingTop();
        for (let i = 0; i < lineElements.length; i += 1) {
            const lineElement = lineElements[i];
            const isActive = lineElement.classList.contains('active');
            const lineRect = lineElement.getBoundingClientRect();
            const hasScrolledPast = lineRect.bottom < anchorY - 2;
            if (!isActive && hasScrolledPast) {
                AmLyrics.unfinishSyllables(lineElement);
            }
        }
    }
    /**
     * Find the first (lowest-index) line whose raw time range contains `timeMs`.
     * Uses a stable forward scan so overlapping ranges always return the same
     * line, preventing primary-target jitter that causes scroll glitches.
     */
    getLineIndexAtTime(timeMs, startHintIndex = 0) {
        if (!this.lyrics || this.lyrics.length === 0)
            return -1;
        const len = this.lyrics.length;
        // 1. Check hint and immediate neighbours first (fast path)
        const hint = Math.max(0, Math.min(startHintIndex, len - 1));
        for (let i = hint; i < len; i += 1) {
            const line = this.lyrics[i];
            if (line.timestamp > timeMs)
                break;
            if (timeMs >= line.timestamp && timeMs < line.endtime) {
                return i;
            }
        }
        for (let i = hint - 1; i >= 0; i -= 1) {
            const line = this.lyrics[i];
            if (timeMs >= line.timestamp && timeMs < line.endtime) {
                return i;
            }
            if (line.endtime < timeMs)
                break;
        }
        // 2. Full forward scan — guaranteed deterministic for overlaps
        for (let i = 0; i < len; i += 1) {
            const line = this.lyrics[i];
            if (line.timestamp > timeMs)
                break;
            if (timeMs >= line.timestamp && timeMs < line.endtime) {
                return i;
            }
        }
        return -1;
    }
    findActiveLineIndices(time) {
        if (!this.lyrics || this.lyrics.length === 0)
            return [];
        const activeLines = [];
        for (let i = 0; i < this.lyrics.length; i += 1) {
            const line = this.lyrics[i];
            const highlightEndTime = this.getLineHighlightEndTime(i);
            if (line.timestamp > time)
                break;
            if (time >= line.timestamp && time < highlightEndTime) {
                activeLines.push(i);
            }
        }
        return activeLines;
    }
    findInstrumentalGapAt(time) {
        if (!this.lyrics || this.lyrics.length === 0)
            return null;
        // Start-of-song gap: from 0 to first line timestamp
        const first = this.lyrics[0];
        if (time >= 0 && time < first.timestamp) {
            const gapStart = 0;
            const gapEnd = first.timestamp;
            if (gapEnd - gapStart >= INSTRUMENTAL_THRESHOLD_MS) {
                return { insertBeforeIndex: 0, gapStart, gapEnd };
            }
            return null;
        }
        // Find consecutive pair (i, i+1) that bounds the current time
        for (let i = 0; i < this.lyrics.length - 1; i += 1) {
            const curr = this.lyrics[i];
            const next = this.lyrics[i + 1];
            const gapStart = curr.endtime;
            const gapEnd = next.timestamp;
            if (time > gapStart && time < gapEnd) {
                if (gapEnd - gapStart >= INSTRUMENTAL_THRESHOLD_MS) {
                    return { insertBeforeIndex: i + 1, gapStart, gapEnd };
                }
                return null;
            }
        }
        return null;
    }
    /**
     * Find ALL instrumental gaps in the song, regardless of current time.
     * Used by the template to always render gap elements in the DOM.
     */
    findAllInstrumentalGaps() {
        if (this.cachedAllGaps.length > 0)
            return this.cachedAllGaps;
        if (!this.lyrics || this.lyrics.length === 0)
            return [];
        const gaps = [];
        // Start-of-song gap
        const first = this.lyrics[0];
        if (first.timestamp >= INSTRUMENTAL_THRESHOLD_MS) {
            gaps.push({ insertBeforeIndex: 0, gapStart: 0, gapEnd: first.timestamp });
        }
        // Inter-line gaps
        for (let i = 0; i < this.lyrics.length - 1; i += 1) {
            const curr = this.lyrics[i];
            const next = this.lyrics[i + 1];
            const gapStart = curr.endtime;
            const gapEnd = next.timestamp;
            if (gapEnd - gapStart >= INSTRUMENTAL_THRESHOLD_MS) {
                gaps.push({ insertBeforeIndex: i + 1, gapStart, gapEnd });
            }
        }
        this.cachedAllGaps = gaps;
        return gaps;
    }
    startAnimationFromTime(time) {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = undefined;
        }
        if (!this.lyrics)
            return;
        const activeLineIndices = this.findActiveLineIndices(time);
        if (!AmLyrics.arraysEqual(activeLineIndices, this.activeLineIndices)) {
            this.activeLineIndices = activeLineIndices;
        }
        // Clear previous state
        this.activeMainWordIndices.clear();
        this.activeBackgroundWordIndices.clear();
        this.mainWordAnimations.clear();
        this.backgroundWordAnimations.clear();
        this.mainWordProgress.clear();
        this.backgroundWordProgress.clear();
        if (activeLineIndices.length === 0) {
            return;
        }
        // Set up animations for each active line
        for (const lineIndex of activeLineIndices) {
            const line = this.lyrics[lineIndex];
            // Find main word based on the reset time
            let mainWordIdx = -1;
            for (let i = 0; i < line.text.length; i += 1) {
                if (time >= line.text[i].timestamp && time <= line.text[i].endtime) {
                    mainWordIdx = i;
                    break;
                }
            }
            this.activeMainWordIndices.set(lineIndex, mainWordIdx);
            // Find background word based on the reset time
            let backWordIdx = -1;
            if (line.backgroundText) {
                for (let i = 0; i < line.backgroundText.length; i += 1) {
                    if (time >= line.backgroundText[i].timestamp &&
                        time <= line.backgroundText[i].endtime) {
                        backWordIdx = i;
                        break;
                    }
                }
            }
            this.activeBackgroundWordIndices.set(lineIndex, backWordIdx);
        }
        // With the state correctly set, configure the animation parameters
        this.setupAnimations();
        // Start the animation loop
        if (this.interpolate) {
            this.animateProgress();
        }
    }
    updateActiveLineAndWords() {
        if (!this.lyrics)
            return;
        const activeLineIndices = this.findActiveLineIndices(this.currentTime);
        if (!AmLyrics.arraysEqual(activeLineIndices, this.activeLineIndices)) {
            this.activeLineIndices = activeLineIndices;
        }
        // Clear previous state
        this.activeMainWordIndices.clear();
        this.activeBackgroundWordIndices.clear();
        for (const lineIdx of activeLineIndices) {
            const line = this.lyrics[lineIdx];
            let mainWordIdx = -1;
            for (let i = 0; i < line.text.length; i += 1) {
                if (this.currentTime >= line.text[i].timestamp &&
                    this.currentTime <= line.text[i].endtime) {
                    mainWordIdx = i;
                    break;
                }
            }
            this.activeMainWordIndices.set(lineIdx, mainWordIdx);
            let backWordIdx = -1;
            if (line.backgroundText) {
                for (let i = 0; i < line.backgroundText.length; i += 1) {
                    if (this.currentTime >= line.backgroundText[i].timestamp &&
                        this.currentTime <= line.backgroundText[i].endtime) {
                        backWordIdx = i;
                        break;
                    }
                }
            }
            this.activeBackgroundWordIndices.set(lineIdx, backWordIdx);
        }
    }
    setupAnimations() {
        if (this.activeLineIndices.length === 0 || !this.lyrics) {
            this.mainWordAnimations.clear();
            this.backgroundWordAnimations.clear();
            return;
        }
        for (const lineIndex of this.activeLineIndices) {
            const line = this.lyrics[lineIndex];
            const mainWordIndex = this.activeMainWordIndices.get(lineIndex) ?? -1;
            const backgroundWordIndex = this.activeBackgroundWordIndices.get(lineIndex) ?? -1;
            // Main word animation
            if (mainWordIndex !== -1) {
                const word = line.text[mainWordIndex];
                const wordDuration = word.endtime - word.timestamp;
                const elapsedInWord = this.currentTime - word.timestamp;
                this.mainWordAnimations.set(lineIndex, {
                    startTime: performance.now() - elapsedInWord,
                    duration: wordDuration,
                });
            }
            else {
                this.mainWordAnimations.set(lineIndex, { startTime: 0, duration: 0 });
            }
            // Background word animation
            if (backgroundWordIndex !== -1 && line.backgroundText) {
                const word = line.backgroundText[backgroundWordIndex];
                const wordDuration = word.endtime - word.timestamp;
                const elapsedInWord = this.currentTime - word.timestamp;
                this.backgroundWordAnimations.set(lineIndex, {
                    startTime: performance.now() - elapsedInWord,
                    duration: wordDuration,
                });
            }
            else {
                this.backgroundWordAnimations.set(lineIndex, {
                    startTime: 0,
                    duration: 0,
                });
            }
        }
    }
    handleLineClick(line) {
        // Reset all syllables to prevent highlighting conflicts during seek
        if (this.lyricsContainer) {
            const allLines = this.lyricsContainer.querySelectorAll('.lyrics-line');
            allLines.forEach(lineEl => {
                AmLyrics.resetSyllables(lineEl);
                // Remove scroll-animate class and properties to stop any scroll animations
                lineEl.classList.remove('scroll-animate', 'scroll-exiting');
                lineEl.style.removeProperty('--scroll-delta');
                lineEl.style.removeProperty('--lyrics-line-delay');
            });
            // Ensure container state is clean
            this.lyricsContainer.classList.remove('wheel-scrolling');
        }
        // Cancel any ongoing scroll animations
        if (this.scrollAnimationState) {
            this.scrollAnimationState.isAnimating = false;
            this.scrollAnimationState.pendingUpdate = null;
        }
        // Clear scroll animation timeouts
        if (this.scrollAnimationTimeout) {
            clearTimeout(this.scrollAnimationTimeout);
            this.scrollAnimationTimeout = undefined;
        }
        // Also clear user scroll timeout to prevent stale scrollToActiveLine
        if (this.userScrollTimeoutId) {
            clearTimeout(this.userScrollTimeoutId);
            this.userScrollTimeoutId = undefined;
        }
        this.setUserScrolling(false);
        // Reset active line tracking to prevent scroll fighting
        this.currentPrimaryActiveLine = null;
        this.lastPrimaryActiveLine = null;
        this.activeLineIds.clear();
        this.animatingLines = [];
        this.setBackgroundExpandedLine(null);
        // Find the clicked line element and scroll to it with forceScroll (like YouLyPlus)
        // Timestamps are already in milliseconds — match the data-start-time attribute directly
        const clickedLineElement = this.lyricsContainer?.querySelector(`.lyrics-line[data-start-time="${line.text[0]?.timestamp || 0}"]`);
        if (clickedLineElement && this.lyricsContainer) {
            // Update active line reference to the clicked line
            this.currentPrimaryActiveLine = clickedLineElement;
            // Reset currentScrollOffset to actual scroll position to prevent stale delta
            this.currentScrollOffset = -this.lyricsContainer.scrollTop;
            // Set click-seek cooldown to prevent updated() scroll from fighting
            this.isClickSeeking = true;
            if (this.clickSeekTimeout)
                clearTimeout(this.clickSeekTimeout);
            this.clickSeekTimeout = setTimeout(() => {
                this.isClickSeeking = false;
            }, 800);
            this.scrollToActiveLineYouLy(clickedLineElement, true);
            this.setBackgroundExpandedLine(clickedLineElement);
        }
        const event = new CustomEvent('line-click', {
            detail: {
                timestamp: line.timestamp,
            },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }
    static getBackgroundTextPlacement(line) {
        if (!line.backgroundText ||
            line.backgroundText.length === 0 ||
            line.text.length === 0) {
            return 'after'; // Default to after if no comparison is possible
        }
        // Compare the start times of the first syllables
        const mainTextStartTime = line.text[0].timestamp;
        const backgroundTextStartTime = line.backgroundText[0].timestamp;
        return backgroundTextStartTime < mainTextStartTime ? 'before' : 'after';
    }
    scrollToActiveLine() {
        if (!this.lyricsContainer || this.activeLineIndices.length === 0) {
            return;
        }
        // Scroll to the first active line
        const firstActiveLineIndex = Math.min(...this.activeLineIndices);
        const activeLineElement = this.lyricsContainer.querySelector(`.lyrics-line:nth-child(${firstActiveLineIndex + 1})`);
        if (activeLineElement) {
            const containerHeight = this.lyricsContainer.clientHeight;
            const lineTop = activeLineElement.offsetTop;
            const lineHeight = activeLineElement.clientHeight;
            // Check if the line has background text placed before the main text
            const hasBackgroundBefore = activeLineElement.querySelector('.background-text.before');
            // Calculate the offset to center the main text content, accounting for background text placement
            let offsetAdjustment = 0;
            if (hasBackgroundBefore) {
                const backgroundElement = hasBackgroundBefore;
                offsetAdjustment = backgroundElement.clientHeight / 2; // Adjust to focus on main content
            }
            const top = lineTop - containerHeight / 2 + lineHeight / 2 - offsetAdjustment;
            // Use requestAnimationFrame for smoother iOS performance
            requestAnimationFrame(() => {
                this.isProgrammaticScroll = true;
                this.lyricsContainer?.scrollTo({ top, behavior: 'smooth' });
                // Reset the flag after a short delay to allow the scroll to complete
                setTimeout(() => {
                    this.isProgrammaticScroll = false;
                }, 100);
            });
        }
    }
    scrollToInstrumental(insertBeforeIndex) {
        if (!this.lyricsContainer)
            return;
        // Find the gap element by ID instead of nth-child
        const gapTarget = this.lyricsContainer.querySelector(`#gap-${insertBeforeIndex}`);
        if (gapTarget) {
            // Use same scroll position as lyrics (scroll-padding-top from top), not center
            // This matches YouLyPlus behavior where gaps don't scroll to a different position
            const paddingTop = this.getScrollPaddingTop();
            const targetTranslateY = paddingTop - gapTarget.offsetTop;
            this.isProgrammaticScroll = true;
            this.clearPastLineHighlights();
            this.animateScrollYouLy(targetTranslateY, false);
            setTimeout(() => {
                this.isProgrammaticScroll = false;
            }, 250);
        }
    }
    // === YouLyPlus-style Animation Methods ===
    /**
     * Get the scroll padding top value from CSS variable
     */
    getScrollPaddingTop() {
        if (!this.lyricsContainer)
            return 0;
        const style = getComputedStyle(this);
        const paddingTopValue = style.getPropertyValue('--lyrics-scroll-padding-top') || '33%';
        let result;
        if (paddingTopValue.includes('%')) {
            result =
                this.lyricsContainer.clientHeight * (parseFloat(paddingTopValue) / 100);
        }
        else {
            result = parseFloat(paddingTopValue) || 0;
        }
        return result || 120;
    }
    /**
     * Animate scroll with staggered delay for smooth YouLyPlus-style scrolling
     */
    animateScrollYouLy(newTranslateY, forceScroll = false, scrollDuration = undefined) {
        if (!this.lyricsContainer)
            return;
        const parent = this.lyricsContainer;
        const targetTop = Math.max(0, -newTranslateY);
        if (!this.scrollAnimationState) {
            this.scrollAnimationState = {
                isAnimating: false,
                pendingUpdate: null,
            };
            this.animatingLines = [];
        }
        const animState = this.scrollAnimationState;
        if (animState.isAnimating && !forceScroll) {
            const pendingTop = animState.pendingUpdate === null
                ? null
                : Math.max(0, -animState.pendingUpdate);
            if (Math.abs(parent.scrollTop - targetTop) < 2 ||
                (pendingTop !== null && Math.abs(pendingTop - targetTop) < 2)) {
                return;
            }
            animState.pendingUpdate = newTranslateY;
            return;
        }
        if (this.scrollAnimationTimeout) {
            clearTimeout(this.scrollAnimationTimeout);
            this.scrollAnimationTimeout = undefined;
        }
        if (this.scrollUnlockTimeout) {
            clearTimeout(this.scrollUnlockTimeout);
            this.scrollUnlockTimeout = undefined;
        }
        const { animatingLines } = this;
        const appliedTranslateY = -targetTop;
        const prevOffset = -parent.scrollTop;
        const delta = prevOffset - appliedTranslateY;
        this.currentScrollOffset = appliedTranslateY;
        // Skip animation if already at the target position (e.g., first lines at top)
        if (Math.abs(parent.scrollTop - targetTop) < 1 && Math.abs(delta) < 1) {
            animState.isAnimating = false;
            animState.pendingUpdate = null;
            return;
        }
        if (forceScroll) {
            // Clean up any lingering scroll animations before smooth scroll
            for (const line of animatingLines) {
                line.classList.remove('scroll-animate');
                line.style.removeProperty('--scroll-delta');
                line.style.removeProperty('--lyrics-line-delay');
                line.style.removeProperty('--scroll-duration');
            }
            animatingLines.length = 0;
            parent.scrollTo({ top: targetTop, behavior: 'smooth' });
            animState.isAnimating = false;
            animState.pendingUpdate = null;
            return;
        }
        // --- Step 1: Remove scroll-animate and custom properties from ALL
        // previously animating lines so stale deltas don't interfere. ---
        for (const line of animatingLines) {
            line.classList.remove('scroll-animate');
            line.style.removeProperty('--scroll-delta');
            line.style.removeProperty('--lyrics-line-delay');
            line.style.removeProperty('--scroll-duration');
        }
        animatingLines.length = 0;
        // Get lines for staggered animation — use cached array
        if (this.cachedLineArray.length === 0) {
            const lineElements = this.lyricsContainer.querySelectorAll('.lyrics-line');
            this.cachedLineArray = Array.from(lineElements);
        }
        const lineArray = this.cachedLineArray;
        const referenceLine = this.currentPrimaryActiveLine ||
            this.lastPrimaryActiveLine ||
            lineArray[0];
        if (!referenceLine)
            return;
        const referenceIndex = lineArray.indexOf(referenceLine);
        if (referenceIndex === -1)
            return;
        const duration = Math.min(450, scrollDuration ?? SCROLL_ANIMATION_DURATION_MS);
        const delayIncrement = duration * 0.1;
        const maxStaggerSteps = 4;
        const lookAhead = 20;
        const len = lineArray.length;
        const start = Math.max(0, referenceIndex - lookAhead);
        const end = Math.min(len, referenceIndex + lookAhead);
        let maxAnimationDuration = 0;
        const newAnimatingLines = [];
        const lineDelays = new Map();
        const scrollingDown = delta >= 0;
        if (scrollingDown) {
            let delayCounter = 0;
            for (let i = start; i < end; i += 1) {
                const line = lineArray[i];
                const delay = i >= referenceIndex
                    ? Math.min(delayCounter, maxStaggerSteps) * delayIncrement
                    : 0;
                if (i >= referenceIndex && !line.classList.contains('lyrics-gap')) {
                    delayCounter += 1;
                }
                line.style.setProperty('--scroll-delta', `${delta}px`);
                line.style.setProperty('--lyrics-line-delay', `${delay}ms`);
                lineDelays.set(line, delay);
                newAnimatingLines.push(line);
                const lineDuration = duration + 100 + delay;
                if (lineDuration > maxAnimationDuration) {
                    maxAnimationDuration = lineDuration;
                }
            }
        }
        else {
            let delayCounter = 0;
            for (let i = end - 1; i >= start; i -= 1) {
                const line = lineArray[i];
                const delay = i <= referenceIndex
                    ? Math.min(delayCounter, maxStaggerSteps) * delayIncrement
                    : 0;
                if (i <= referenceIndex && !line.classList.contains('lyrics-gap')) {
                    delayCounter += 1;
                }
                line.style.setProperty('--scroll-delta', `${delta}px`);
                line.style.setProperty('--lyrics-line-delay', `${delay}ms`);
                lineDelays.set(line, delay);
                newAnimatingLines.push(line);
                const lineDuration = duration + 100 + delay;
                if (lineDuration > maxAnimationDuration) {
                    maxAnimationDuration = lineDuration;
                }
            }
        }
        /* Preserve the staggered starts, but make every line settle together.
           This keeps the selected line from drifting after its neighbours. */
        for (const line of newAnimatingLines) {
            const delay = lineDelays.get(line) ?? 0;
            line.style.setProperty('--scroll-duration', `${Math.max(100, maxAnimationDuration - delay)}ms`);
        }
        // --- Step 3: Force reflow so the browser sees the class removal ---
        // Use offsetHeight which is cheaper than getBoundingClientRect
        // eslint-disable-next-line no-void
        void parent.offsetHeight;
        // --- Step 4: Re-add scroll-animate class to start fresh animations ---
        for (const line of newAnimatingLines) {
            line.classList.add('scroll-animate');
            animatingLines.push(line);
        }
        animState.isAnimating = true;
        // YouLyPlus-style early unlock: allow new scrolls to start after a
        // short base duration, even if CSS animations are still running.
        const BASE_DURATION = 400;
        this.scrollUnlockTimeout = setTimeout(() => {
            animState.isAnimating = false;
            if (animState.pendingUpdate !== null) {
                const pendingValue = animState.pendingUpdate;
                animState.pendingUpdate = null;
                this.animateScrollYouLy(pendingValue, false, scrollDuration);
            }
        }, BASE_DURATION);
        this.scrollAnimationTimeout = setTimeout(() => {
            for (let i = 0; i < animatingLines.length; i += 1) {
                const line = animatingLines[i];
                line.classList.remove('scroll-animate');
                line.style.removeProperty('--scroll-delta');
                line.style.removeProperty('--lyrics-line-delay');
                line.style.removeProperty('--scroll-duration');
            }
            animatingLines.length = 0;
            this.scrollAnimationTimeout = undefined;
        }, maxAnimationDuration + 50);
        parent.scrollTo({ top: targetTop, behavior: 'instant' });
    }
    /**
     * Update position classes for YouLyPlus-style opacity/blur gradients
     */
    updatePositionClasses(lineToScroll) {
        if (!this.lyricsContainer)
            return;
        const positionClasses = [
            'lyrics-activest',
            'post-active-line',
            'next-active-line',
            'prev-1',
            'prev-2',
            'prev-3',
            'prev-4',
            'next-1',
            'next-2',
            'next-3',
            'next-4',
        ];
        // Remove old position classes from tracked elements
        for (const el of this.positionedLineElements) {
            el.classList.remove(...positionClasses);
        }
        this.positionedLineElements = [];
        // Add new position classes
        lineToScroll.classList.add('lyrics-activest');
        this.positionedLineElements.push(lineToScroll);
        if (this.cachedLineArray.length === 0) {
            this.cachedLineArray = Array.from(this.lyricsContainer.querySelectorAll('.lyrics-line'));
        }
        const lineElements = this.cachedLineArray;
        const scrollLineIndex = lineElements.indexOf(lineToScroll);
        if (scrollLineIndex === -1)
            return;
        for (let i = Math.max(0, scrollLineIndex - 4); i <= Math.min(lineElements.length - 1, scrollLineIndex + 4); i += 1) {
            const position = i - scrollLineIndex;
            if (position !== 0) {
                const element = lineElements[i];
                if (position === -1)
                    element.classList.add('post-active-line');
                else if (position === 1)
                    element.classList.add('next-active-line');
                else if (position < 0)
                    element.classList.add(`prev-${Math.abs(position)}`);
                else
                    element.classList.add(`next-${position}`);
                this.positionedLineElements.push(element);
            }
        }
    }
    /**
     * Scroll to active line with YouLyPlus-style animation
     */
    scrollToActiveLineYouLy(activeLine, forceScroll = false, scrollDuration = undefined) {
        if (!activeLine || !this.lyricsContainer)
            return;
        const paddingTop = this.getScrollPaddingTop();
        const targetTranslateY = paddingTop - activeLine.offsetTop;
        const scrollContainerTop = this.lyricsContainer.getBoundingClientRect().top;
        // Skip if already at target position
        if (!forceScroll &&
            Math.abs(activeLine.getBoundingClientRect().top -
                scrollContainerTop -
                paddingTop) < 1) {
            return;
        }
        // Skip scroll if near the bottom of content and we aren't trying to scroll back up
        if (!forceScroll && !activeLine.classList.contains('lyrics-footer')) {
            const parent = this.lyricsContainer;
            const atBottom = parent.scrollTop + parent.clientHeight >= parent.scrollHeight - 50;
            const targetTop = Math.max(0, -(paddingTop - activeLine.offsetTop));
            if (atBottom && targetTop > parent.scrollTop - 50) {
                return;
            }
        }
        this.lyricsContainer.classList.remove('not-focused', 'user-scrolling');
        this.isProgrammaticScroll = true;
        this.setUserScrolling(false);
        if (this.userScrollTimeoutId) {
            clearTimeout(this.userScrollTimeoutId);
            this.userScrollTimeoutId = undefined;
        }
        this.clearPastLineHighlights();
        const duration = scrollDuration ?? SCROLL_ANIMATION_DURATION_MS;
        setTimeout(() => {
            this.isProgrammaticScroll = false;
        }, duration + 160);
        this.animateScrollYouLy(targetTranslateY, forceScroll, scrollDuration);
    }
    /**
     * Update syllable highlight animation - apply CSS wipe animation
     */
    static clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }
    static getVisibleCharacterCount(element) {
        const attrLength = parseFloat(element.getAttribute('data-word-length') || '');
        if (Number.isFinite(attrLength) && attrLength > 0)
            return attrLength;
        return (element.textContent || '').replace(/\s/g, '').length;
    }
    static getLongWordWipeScale(charCount) {
        if (charCount <= 6)
            return 1;
        return (1 +
            AmLyrics.clamp((charCount - 6) / 10, 0, 1) * LONG_WORD_WIPE_EXTRA_RATIO);
    }
    static applyWipeShape(element, charCount) {
        const extra = AmLyrics.clamp((charCount - 6) / 10, 0, 1) * LONG_WORD_WIPE_EXTRA_EM;
        const width = BASE_WIPE_GRADIENT_EM + extra;
        element.style.setProperty('--wipe-gradient-width', `${width.toFixed(3)}em`);
        element.style.setProperty('--wipe-gradient-half', `${(width / 2).toFixed(3)}em`);
    }
    static ensureWordWipeGeometry(charSpans, charCount) {
        if (charSpans.length === 0)
            return;
        const approxWidthCh = Math.max(1, charCount || charSpans.length);
        charSpans.forEach((span, index) => {
            if (!span.style.getPropertyValue('--word-wipe-width')) {
                span.style.setProperty('--word-wipe-width', `${approxWidthCh}ch`);
            }
            if (!span.style.getPropertyValue('--char-wipe-position')) {
                const startPct = Number.parseFloat(span.dataset.wipeStart || `${index / Math.max(1, charSpans.length)}`);
                span.style.setProperty('--char-wipe-position', `${-(AmLyrics.clamp(startPct, 0, 1) * approxWidthCh)}ch`);
            }
        });
    }
    static clearPreHighlight(syllable) {
        const target = syllable;
        target.classList.remove('pre-highlight');
        target.style.removeProperty('--pre-wipe-duration');
        target.style.removeProperty('--pre-wipe-delay');
        target.style.animation = '';
        target
            .querySelectorAll('.pre-wipe-lead')
            .forEach(element => AmLyrics.clearPreWipeLead(element));
    }
    static clearPreWipeLead(element) {
        element.classList.remove('pre-wipe-lead');
        element.style.removeProperty('--pre-wipe-duration');
        element.style.removeProperty('--pre-wipe-delay');
    }
    static hasTextBoundaryAfter(syllable) {
        return /\s$/.test(syllable.textContent || '');
    }
    static getSyllableWordIndex(syllable) {
        const wordElement = AmLyrics.getWordElementForSyllable(syllable);
        const virtualWordId = wordElement?.dataset.virtualWordId;
        if (virtualWordId) {
            return `virtual:${virtualWordId}`;
        }
        const virtualWordStart = wordElement?.dataset.virtualWordStart;
        const virtualWordEnd = wordElement?.dataset.virtualWordEnd;
        if (virtualWordStart || virtualWordEnd) {
            return `virtual:${virtualWordStart || ''}:${virtualWordEnd || ''}`;
        }
        return (syllable.getAttribute('data-word-index') ||
            syllable.getAttribute('data-syllable-index') ||
            '');
    }
    static getNextWordSyllable(syllables, index) {
        const current = syllables[index];
        const currentWordIndex = AmLyrics.getSyllableWordIndex(current);
        const previousSyllable = current;
        for (let i = index + 1; i < syllables.length; i += 1) {
            const candidate = syllables[i];
            if (candidate.classList.contains('transliteration')) {
                // eslint-disable-next-line no-continue
                continue;
            }
            const candidateWordIndex = AmLyrics.getSyllableWordIndex(candidate);
            if (candidateWordIndex === currentWordIndex ||
                !AmLyrics.hasTextBoundaryAfter(previousSyllable)) {
                return null;
            }
            return candidate;
        }
        return null;
    }
    static getPreviousNonTransliterationSyllable(syllables, index) {
        for (let i = index - 1; i >= 0; i -= 1) {
            const candidate = syllables[i];
            if (!candidate.classList.contains('transliteration')) {
                return candidate;
            }
        }
        return null;
    }
    static getRenderedWordSyllables(syllable) {
        const wordElement = AmLyrics.getWordElementForSyllable(syllable);
        const wordElements = AmLyrics.getCachedVirtualWordElements(wordElement);
        const wordSyllables = wordElements.flatMap(element => Array.from(element.querySelectorAll('.lyrics-syllable')));
        return wordSyllables.filter(wordSyllable => !wordSyllable.classList.contains('transliteration'));
    }
    static getWordElementForSyllable(syllable) {
        return syllable.parentElement?.parentElement;
    }
    static getWordPreWipeKey(syllable) {
        const wordElement = AmLyrics.getWordElementForSyllable(syllable);
        return (wordElement?.dataset.virtualWordId ||
            `${syllable.getAttribute('data-start-time') || ''}:${AmLyrics.getSyllableWordIndex(syllable)}`);
    }
    static isPreWipeArmed(syllable) {
        const wordElement = AmLyrics.getWordElementForSyllable(syllable);
        const target = wordElement;
        return Boolean(target?._wordPreWipeKey === AmLyrics.getWordPreWipeKey(syllable));
    }
    static applyWordPreWipe(nextSyllable, wordSyllables, currentTimeMs, preWipeStartMs, preWipeDurationMs) {
        if (AmLyrics.isPreWipeArmed(nextSyllable))
            return;
        const wordElement = AmLyrics.getWordElementForSyllable(nextSyllable);
        const wordElements = AmLyrics.getCachedVirtualWordElements(wordElement);
        const charSpans = AmLyrics.getCachedVirtualWordCharSpans(wordElement, []);
        const elapsedPreWipe = currentTimeMs - preWipeStartMs;
        const charCount = charSpans.length ||
            wordSyllables.reduce((total, wordSyllable) => total + AmLyrics.getVisibleCharacterCount(wordSyllable), 0) ||
            AmLyrics.getVisibleCharacterCount(nextSyllable);
        AmLyrics.ensureWordWipeGeometry(charSpans, charCount);
        const leadChar = charSpans[0];
        const leadCharSyllable = leadChar?.closest('.lyrics-syllable');
        const preWipeSyllable = leadCharSyllable || wordSyllables[0] || nextSyllable;
        AmLyrics.applyWipeShape(preWipeSyllable, charCount);
        preWipeSyllable.style.setProperty('--pre-wipe-duration', `${preWipeDurationMs}ms`);
        preWipeSyllable.style.setProperty('--pre-wipe-delay', `${-elapsedPreWipe}ms`);
        preWipeSyllable.classList.add('pre-highlight');
        // Character-animated words still need a single word-leading gradient.
        // Giving every glyph this state creates one gradient per character and
        // makes the whole word enter the pre-wipe continuation simultaneously.
        if (leadChar) {
            AmLyrics.applyWipeShape(leadChar, charCount);
            leadChar.style.setProperty('--pre-wipe-duration', `${preWipeDurationMs}ms`);
            leadChar.style.setProperty('--pre-wipe-delay', `${-elapsedPreWipe}ms`);
            leadChar.classList.add('pre-wipe-lead');
        }
        wordElements.forEach(element => {
            const target = element;
            target._wordPreWipeKey = AmLyrics.getWordPreWipeKey(nextSyllable);
        });
    }
    static maybePreWipeNextWord(syllables, index, currentTimeMs, currentEndTimeMs) {
        const syllable = syllables[index];
        if (syllable.classList.contains('line-synced') ||
            syllable.classList.contains('transliteration') ||
            syllable.closest('.lyrics-gap')) {
            return;
        }
        const currentWordReady = syllable.classList.contains('finished') ||
            currentTimeMs >= currentEndTimeMs - WORD_PRE_WIPE_HANDOFF_LEAD_MS;
        if (!currentWordReady) {
            return;
        }
        const nextSyllable = AmLyrics.getNextWordSyllable(syllables, index);
        if (!nextSyllable ||
            nextSyllable.classList.contains('line-synced') ||
            nextSyllable.classList.contains('transliteration') ||
            nextSyllable.closest('.lyrics-gap') ||
            nextSyllable.classList.contains('highlight') ||
            nextSyllable.classList.contains('finished')) {
            return;
        }
        const nextStartTimeMs = nextSyllable._cachedStartTime;
        if (!Number.isFinite(nextStartTimeMs))
            return;
        const gapMs = nextStartTimeMs - currentEndTimeMs;
        if (gapMs > NEXT_WORD_PRE_WIPE_MAX_GAP_MS || gapMs < -50) {
            return;
        }
        const nextWordSyllables = AmLyrics.getRenderedWordSyllables(nextSyllable);
        const preWipeSyllables = nextWordSyllables.length > 0 ? nextWordSyllables : [nextSyllable];
        const wordElement = AmLyrics.getWordElementForSyllable(nextSyllable);
        const wordCharSpans = AmLyrics.getCachedVirtualWordCharSpans(wordElement, []);
        const charCount = wordCharSpans.length ||
            preWipeSyllables.reduce((total, wordSyllable) => total + AmLyrics.getVisibleCharacterCount(wordSyllable), 0);
        if (charCount <= 0)
            return;
        const preWipeDuration = AmLyrics.clamp(64 + charCount * 9, NEXT_WORD_PRE_WIPE_MIN_DURATION_MS, NEXT_WORD_PRE_WIPE_MAX_DURATION_MS);
        const preWipeStart = Math.max(nextStartTimeMs - preWipeDuration, currentEndTimeMs - WORD_PRE_WIPE_HANDOFF_LEAD_MS);
        if (currentTimeMs < preWipeStart || currentTimeMs >= nextStartTimeMs) {
            return;
        }
        AmLyrics.applyWordPreWipe(nextSyllable, preWipeSyllables, currentTimeMs, preWipeStart, preWipeDuration);
    }
    static getCachedCharSpans(element) {
        const cacheTarget = element;
        if (!cacheTarget._cachedCharSpans) {
            cacheTarget._cachedCharSpans = Array.from(element.querySelectorAll('span.char'));
        }
        return cacheTarget._cachedCharSpans;
    }
    static getCachedVirtualWordElements(wordElement) {
        if (!wordElement)
            return [];
        const cacheTarget = wordElement;
        if (cacheTarget._cachedVirtualWordElements) {
            return cacheTarget._cachedVirtualWordElements;
        }
        const { virtualWordId } = wordElement.dataset;
        let wordElements = [wordElement];
        if (virtualWordId && wordElement.parentElement) {
            wordElements = Array.from(wordElement.parentElement.querySelectorAll('.lyrics-word')).filter(el => el.dataset.virtualWordId === virtualWordId);
        }
        wordElements.forEach(element => {
            const target = element;
            target._cachedVirtualWordElements = wordElements;
        });
        return wordElements;
    }
    static getCachedVirtualWordCharSpans(wordElement, fallbackCharSpans) {
        if (!wordElement)
            return fallbackCharSpans;
        const cacheTarget = wordElement;
        if (cacheTarget._cachedVirtualWordCharSpans) {
            return cacheTarget._cachedVirtualWordCharSpans;
        }
        const wordElements = AmLyrics.getCachedVirtualWordElements(wordElement);
        const charSpans = wordElements.flatMap(word => Array.from(word.querySelectorAll('span.char')));
        const result = charSpans.length > 0 ? charSpans : fallbackCharSpans;
        wordElements.forEach(element => {
            const target = element;
            target._cachedVirtualWordCharSpans = result;
        });
        return result;
    }
    static updateSyllableAnimation(syllable, elapsedTimeMs = 0) {
        if (syllable.classList.contains('highlight'))
            return;
        const { classList } = syllable;
        const hadPreHighlight = classList.contains('pre-highlight');
        const isRTL = classList.contains('rtl-text');
        const charSpans = AmLyrics.getCachedCharSpans(syllable);
        const wordElement = syllable.parentElement?.parentElement; // syllable-wrap -> word
        const typedWordElement = wordElement;
        const allWordElements = AmLyrics.getCachedVirtualWordElements(typedWordElement);
        const allWordCharSpans = AmLyrics.getCachedVirtualWordCharSpans(typedWordElement, charSpans);
        const isGrowable = typedWordElement?.classList.contains('growable');
        const isCharRise = typedWordElement?.classList.contains('char-rise');
        const isCharDrag = typedWordElement?.classList.contains('char-drag');
        const isFirstSyllable = syllable.getAttribute('data-syllable-index') === '0';
        const syllableStartMs = parseFloat(syllable.getAttribute('data-start-time') || '0');
        const virtualWordStartMs = parseFloat(typedWordElement?.dataset.virtualWordStart || '');
        const isFirstInVirtualWord = isFirstSyllable &&
            (!Number.isFinite(virtualWordStartMs) ||
                Math.abs(syllableStartMs - virtualWordStartMs) < 0.5);
        const isFirstInContainer = isFirstSyllable; // Simplified
        const isGap = syllable.closest('.lyrics-gap') !== null;
        // Get duration from data attribute
        const syllableDurationMs = parseFloat(syllable.getAttribute('data-duration') || '0') || 300;
        const wordDurationMs = parseFloat(syllable.getAttribute('data-word-duration') ||
            syllable.getAttribute('data-duration') ||
            '0') || syllableDurationMs;
        const wordElapsedTimeMs = Number.isFinite(virtualWordStartMs)
            ? elapsedTimeMs + (syllableStartMs - virtualWordStartMs)
            : elapsedTimeMs;
        const charWipeDurationMs = Math.max(wordDurationMs, syllableDurationMs);
        const charAnimationsMap = new Map();
        const styleUpdates = [];
        // Step 1: Grow Pass
        if (isGrowable && isFirstInVirtualWord && allWordCharSpans.length > 0) {
            const finalDuration = wordDurationMs;
            const baseDelayPerChar = finalDuration * 0.09;
            const growDurationMs = finalDuration * 1.5;
            allWordCharSpans.forEach(span => {
                const matrixScale = span.dataset.matrixScale || '1.1';
                const charOffsetX = span.dataset.charOffsetX || '0';
                const shadowIntensity = span.dataset.shadowIntensity || '0.6';
                const translateYPeak = span.dataset.translateYPeak || '-2';
                const syllableCharIndex = parseFloat(span.dataset.syllableCharIndex || '0');
                const growDelay = baseDelayPerChar * syllableCharIndex;
                charAnimationsMap.set(span, `grow-dynamic ${growDurationMs}ms ease-in-out ${growDelay}ms forwards`);
                styleUpdates.push({
                    element: span,
                    property: '--matrix-scale',
                    value: matrixScale,
                });
                styleUpdates.push({
                    element: span,
                    property: '--char-offset-x',
                    value: `${charOffsetX}px`,
                });
                styleUpdates.push({
                    element: span,
                    property: '--shadow-intensity',
                    value: shadowIntensity,
                });
                styleUpdates.push({
                    element: span,
                    property: '--translate-y-peak',
                    value: `${translateYPeak}px`,
                });
            });
        }
        if (isCharRise && isFirstInVirtualWord && allWordCharSpans.length > 0) {
            const finalDuration = Math.max(wordDurationMs, syllableDurationMs);
            const baseDelayPerChar = finalDuration * 0.09;
            const riseDurationMs = finalDuration * 1.5;
            allWordCharSpans.forEach(span => {
                const charIndex = parseFloat(span.dataset.syllableCharIndex || '0');
                const riseDelay = baseDelayPerChar * charIndex;
                charAnimationsMap.set(span, `rise-char ${riseDurationMs}ms ease-in-out ${riseDelay}ms forwards`);
            });
        }
        if (isCharDrag && isFirstInVirtualWord && allWordCharSpans.length > 0) {
            const finalDuration = Math.max(wordDurationMs, syllableDurationMs);
            const baseDelayPerChar = AmLyrics.clamp(finalDuration * 0.15, 64, 118);
            const dragDurationMs = AmLyrics.clamp(finalDuration * 0.82, 560, 900);
            allWordCharSpans.forEach(span => {
                const charIndex = parseFloat(span.dataset.syllableCharIndex || '0');
                const dragDelay = baseDelayPerChar * charIndex;
                charAnimationsMap.set(span, `drag-char ${dragDurationMs}ms ease ${dragDelay}ms forwards`);
            });
        }
        // Step 2: Wipe Pass
        if (charSpans.length > 0) {
            const wipeCharCount = allWordCharSpans.length ||
                charSpans.length ||
                AmLyrics.getVisibleCharacterCount(syllable);
            const wipeScale = AmLyrics.getLongWordWipeScale(wipeCharCount);
            AmLyrics.applyWipeShape(syllable, wipeCharCount);
            AmLyrics.ensureWordWipeGeometry(allWordCharSpans, wipeCharCount);
            allWordCharSpans.forEach(span => AmLyrics.applyWipeShape(span, wipeCharCount));
            const hasWordLevelWipe = !isFirstInVirtualWord &&
                (Boolean(typedWordElement?._wordWipeStarted) ||
                    allWordCharSpans.some(span => span.style.animation.includes('wipe')));
            let charSpansToAnimate = charSpans;
            if (isFirstInVirtualWord) {
                charSpansToAnimate = allWordCharSpans;
            }
            else if (hasWordLevelWipe) {
                charSpansToAnimate = [];
            }
            if (charSpansToAnimate.length > 0 && allWordElements.length > 0) {
                allWordElements.forEach(element => {
                    const target = element;
                    target._wordWipeStarted = true;
                    target._wordPreWipeKey = undefined;
                });
            }
            charSpansToAnimate.forEach((span, charIndex) => {
                const startPct = parseFloat(span.dataset.wipeStart || '0');
                const durationPct = parseFloat(span.dataset.wipeDuration || '0');
                const globalCharIndex = parseFloat(span.dataset.syllableCharIndex || `${charIndex}`);
                const hadCharPreWipe = span.classList.contains('pre-wipe-lead') ||
                    (hadPreHighlight && globalCharIndex === 0);
                const charStartMs = charWipeDurationMs * startPct;
                const remainingWordWipeMs = Math.max(0, charWipeDurationMs - charStartMs);
                const wipeDelay = charStartMs - wordElapsedTimeMs;
                const wipeDuration = Math.min(charWipeDurationMs * durationPct * wipeScale, remainingWordWipeMs);
                const useStartAnimation = isFirstInContainer && globalCharIndex === 0 && !hadCharPreWipe;
                let charWipeAnimation = 'char-wipe';
                if (hadCharPreWipe) {
                    charWipeAnimation = 'char-wipe';
                }
                else if (useStartAnimation) {
                    charWipeAnimation = 'char-start-wipe';
                }
                const existingAnimation = charAnimationsMap.get(span) || span.style.animation || '';
                const animationParts = [];
                if (existingAnimation &&
                    (existingAnimation.includes('grow-dynamic') ||
                        existingAnimation.includes('rise-char') ||
                        existingAnimation.includes('drag-char'))) {
                    animationParts.push(existingAnimation.split(',')[0].trim());
                }
                if (globalCharIndex > 0 &&
                    !hadCharPreWipe &&
                    wipeDelay > 0 &&
                    wipeDuration > 0) {
                    const measuredDuration = Number.parseFloat(span.dataset.preWipeDuration || '100');
                    const preWipeDuration = Math.min(measuredDuration, wipeDuration * 0.9, charWipeDurationMs * 0.08, wipeDelay);
                    if (preWipeDuration >= 16) {
                        animationParts.push(`char-pre-wipe ${preWipeDuration}ms linear ${wipeDelay - preWipeDuration}ms none`);
                    }
                }
                if (wipeDuration > 0) {
                    const wipeFillMode = hadCharPreWipe ? 'both' : 'forwards';
                    animationParts.push(`${charWipeAnimation} ${wipeDuration}ms linear ${wipeDelay}ms ${wipeFillMode}`);
                }
                if (animationParts.length > 0) {
                    charAnimationsMap.set(span, animationParts.join(', '));
                }
            });
        }
        else {
            // Syllable-level wipe for regular (non-growable) words without chars
            const wipeRatio = parseFloat(syllable.getAttribute('data-wipe-ratio') || '1');
            const wipeCharCount = AmLyrics.getVisibleCharacterCount(syllable);
            const wipeScale = AmLyrics.getLongWordWipeScale(wipeCharCount);
            const visualDuration = syllableDurationMs * wipeRatio * wipeScale;
            AmLyrics.applyWipeShape(syllable, wipeCharCount);
            let wipeAnimation = 'wipe';
            if (hadPreHighlight) {
                wipeAnimation = isRTL ? 'wipe-from-pre-rtl' : 'wipe-from-pre';
            }
            else if (isFirstInContainer) {
                wipeAnimation = isRTL ? 'start-wipe-rtl' : 'start-wipe';
            }
            else {
                wipeAnimation = isRTL ? 'wipe-rtl' : 'wipe';
            }
            if (syllable.classList.contains('line-synced'))
                return;
            const currentWipeAnimation = isGap ? 'fade-gap' : wipeAnimation;
            // eslint-disable-next-line no-param-reassign
            syllable.style.animation = `${currentWipeAnimation} ${visualDuration}ms ${isGap ? 'ease-out' : 'linear'} ${-elapsedTimeMs}ms forwards`;
        }
        // --- WRITE PHASE ---
        if (allWordElements.length > 0) {
            allWordElements.forEach(element => {
                const target = element;
                target._wordPreWipeKey = undefined;
            });
        }
        classList.remove('pre-highlight');
        classList.add('highlight');
        allWordCharSpans.forEach(span => AmLyrics.clearPreWipeLead(span));
        // Apply keyframe variables before assigning animation strings so the
        // first painted frame never uses fallback transform values.
        for (const update of styleUpdates) {
            update.element.style.setProperty(update.property, update.value);
        }
        for (const [span, animationString] of charAnimationsMap.entries()) {
            span.style.willChange = 'transform';
            span.style.removeProperty('background-color');
            span.style.animation = animationString;
        }
    }
    /**
     * Reset syllable animation state
     */
    static resetSyllable(syllable) {
        if (!syllable)
            return;
        // eslint-disable-next-line no-param-reassign
        syllable.style.animation = '';
        syllable.style.removeProperty('--pre-wipe-duration');
        syllable.style.removeProperty('--pre-wipe-delay');
        // Force background to secondary and disable transition to prevent lingering white
        // eslint-disable-next-line no-param-reassign
        syllable.style.transition = 'none';
        // eslint-disable-next-line no-param-reassign
        syllable.style.backgroundColor = 'var(--lyplus-text-secondary)';
        // Reset character animations — disable transition so finished chars don't slowly fade
        const charSpans = syllable.querySelectorAll('span.char');
        for (let i = 0; i < charSpans.length; i += 1) {
            const el = charSpans[i];
            el.style.animation = '';
            el.style.transition = 'none';
            el.style.backgroundColor = 'var(--lyplus-text-secondary)';
            AmLyrics.clearPreWipeLead(el);
        }
        // Immediately remove all state classes
        syllable.classList.remove('highlight', 'finished', 'pre-highlight', 'cleanup');
    }
    static resetWordAnimationState(line) {
        const wordElements = line.querySelectorAll('.lyrics-word');
        wordElements.forEach(wordElement => {
            const target = wordElement;
            target._wordPreWipeKey = undefined;
            target._wordWipeStarted = false;
        });
    }
    /**
     * Reset all syllables in a line — batches deferred cleanup into a single rAF
     */
    static resetSyllables(line) {
        if (!line)
            return;
        line.classList.remove('persist-highlight');
        AmLyrics.resetWordAnimationState(line);
        // eslint-disable-next-line no-param-reassign
        line._cachedSyllableElements = null;
        const syllables = line.getElementsByClassName('lyrics-syllable');
        for (let i = 0; i < syllables.length; i += 1) {
            AmLyrics.resetSyllable(syllables[i]);
        }
        // Batch deferred style cleanup into a single rAF for all syllables in the line
        requestAnimationFrame(() => {
            for (let i = 0; i < syllables.length; i += 1) {
                const syllable = syllables[i];
                syllable.style.removeProperty('background-color');
                syllable.style.removeProperty('transition');
                const chars = syllable.querySelectorAll('span.char');
                for (let j = 0; j < chars.length; j += 1) {
                    const el = chars[j];
                    el.style.removeProperty('background-color');
                    el.style.removeProperty('transition');
                    el.style.removeProperty('will-change');
                }
            }
        });
    }
    /**
     * Gentle reset for normal playback: remove highlight/finished classes
     * without forcing inline styles. Lets CSS transition fade syllables
     * back to secondary colour smoothly.
     */
    static unfinishSyllables(line) {
        if (!line)
            return;
        line.classList.remove('persist-highlight');
        AmLyrics.resetWordAnimationState(line);
        const syllables = line.getElementsByClassName('lyrics-syllable');
        for (let i = 0; i < syllables.length; i += 1) {
            const s = syllables[i];
            s.classList.remove('highlight', 'finished', 'pre-highlight', 'cleanup');
            s.style.animation = '';
            s.style.removeProperty('--pre-wipe-duration');
            s.style.removeProperty('--pre-wipe-delay');
            s.style.removeProperty('background-color');
            s.style.removeProperty('transition');
            const chars = s.querySelectorAll('span.char');
            for (let j = 0; j < chars.length; j += 1) {
                const el = chars[j];
                el.style.animation = '';
                el.style.removeProperty('will-change');
                el.style.removeProperty('background-color');
                el.style.removeProperty('transition');
                el.style.removeProperty('filter');
                AmLyrics.clearPreWipeLead(el);
            }
        }
    }
    static finishSyllablesUpToTime(line, currentTimeMs) {
        if (!line)
            return;
        let hasFinishedSyllable = false;
        let syllables = line._cachedSyllableElements;
        if (!syllables) {
            syllables = Array.from(line.querySelectorAll('.lyrics-syllable'));
            for (let i = 0; i < syllables.length; i += 1) {
                const syllable = syllables[i];
                syllable._cachedStartTime = parseFloat(syllable.getAttribute('data-start-time') || '0');
                syllable._cachedEndTime = parseFloat(syllable.getAttribute('data-end-time') || '0');
            }
            // eslint-disable-next-line no-param-reassign
            line._cachedSyllableElements = syllables;
        }
        for (let i = 0; i < syllables.length; i += 1) {
            const syllable = syllables[i];
            const startTime = syllable._cachedStartTime;
            if (Number.isFinite(startTime) && currentTimeMs >= startTime) {
                const { classList } = syllable;
                if (!classList.contains('finished')) {
                    if (!classList.contains('highlight')) {
                        AmLyrics.updateSyllableAnimation(syllable, Math.max(0, currentTimeMs - startTime));
                    }
                    classList.add('finished');
                }
                hasFinishedSyllable = true;
                classList.remove('highlight');
                classList.remove('pre-highlight');
                classList.add('cleanup');
                syllable.style.animation = '';
                syllable.style.removeProperty('--pre-wipe-duration');
                syllable.style.removeProperty('--pre-wipe-delay');
                syllable.style.removeProperty('background-color');
                AmLyrics.applyWipeShape(syllable, AmLyrics.getVisibleCharacterCount(syllable));
                const chars = syllable.querySelectorAll('span.char');
                for (let ci = 0; ci < chars.length; ci += 1) {
                    const charEl = chars[ci];
                    const currentAnim = charEl.style.animation || '';
                    if (currentAnim.includes('grow-dynamic') ||
                        currentAnim.includes('rise-char') ||
                        currentAnim.includes('drag-char')) {
                        const parts = currentAnim.split(',').map(p => p.trim());
                        const transformAnim = parts.find(p => p.includes('grow-dynamic') ||
                            p.includes('rise-char') ||
                            p.includes('drag-char'));
                        charEl.style.animation = transformAnim || '';
                    }
                    else {
                        charEl.style.animation = '';
                    }
                    charEl.style.backgroundColor = 'var(--lyplus-text-primary)';
                    AmLyrics.clearPreWipeLead(charEl);
                }
            }
        }
        if (hasFinishedSyllable) {
            line.classList.add('persist-highlight');
        }
        else {
            line.classList.remove('persist-highlight');
        }
    }
    /**
     * Update syllables based on current time
     * Uses DOM caching and pre-highlight reset for smooth transitions
     */
    static updateSyllablesForLine(line, currentTimeMs) {
        // DOM cache: avoid querySelectorAll on every frame
        let syllables = line._cachedSyllableElements;
        if (!syllables) {
            syllables = Array.from(line.querySelectorAll('.lyrics-syllable'));
            for (let i = 0; i < syllables.length; i += 1) {
                const syllable = syllables[i];
                syllable._cachedStartTime = parseFloat(syllable.getAttribute('data-start-time') || '0');
                syllable._cachedEndTime = parseFloat(syllable.getAttribute('data-end-time') || '0');
            }
            // eslint-disable-next-line no-param-reassign
            line._cachedSyllableElements = syllables;
        }
        for (let i = 0; i < syllables.length; i += 1) {
            const syllable = syllables[i];
            const startTime = syllable._cachedStartTime;
            const endTime = syllable._cachedEndTime;
            if (Number.isFinite(startTime) && Number.isFinite(endTime)) {
                const { classList } = syllable;
                const hasHighlight = classList.contains('highlight');
                const hasFinished = classList.contains('finished');
                const hasPreHighlight = classList.contains('pre-highlight');
                const hasActiveState = hasHighlight || hasFinished || hasPreHighlight;
                // Early exit check
                if (!(currentTimeMs < startTime - 1000 && !hasActiveState)) {
                    let preHighlightReset = false;
                    // Before the syllable starts, pre-highlight only belongs beside a
                    // previous active word. Once the syllable starts, updateSyllableAnimation
                    // consumes the class so the actual wipe can continue from the pre-wipe
                    // pose instead of restarting from the beginning.
                    if (hasPreHighlight && currentTimeMs < startTime) {
                        const prevSyllable = AmLyrics.getPreviousNonTransliterationSyllable(syllables, i);
                        const previousCarriesHighlight = prevSyllable?.classList.contains('highlight') ||
                            prevSyllable?.classList.contains('finished');
                        if (!previousCarriesHighlight) {
                            AmLyrics.clearPreHighlight(syllable);
                            preHighlightReset = true;
                        }
                    }
                    if (!preHighlightReset) {
                        if (currentTimeMs >= startTime && currentTimeMs <= endTime) {
                            // Currently active
                            if (!hasHighlight) {
                                AmLyrics.updateSyllableAnimation(syllable, currentTimeMs - startTime);
                            }
                            if (hasFinished) {
                                classList.remove('finished');
                            }
                        }
                        else if (currentTimeMs > endTime) {
                            // Finished
                            if (!hasFinished) {
                                if (!hasHighlight) {
                                    AmLyrics.updateSyllableAnimation(syllable, currentTimeMs - startTime);
                                }
                                classList.add('finished');
                                // Keep the completed wipe state until user scroll resets it.
                            }
                        }
                        else if (hasHighlight || hasFinished) {
                            // Not yet started
                            AmLyrics.resetSyllable(syllable);
                        }
                        AmLyrics.maybePreWipeNextWord(syllables, i, currentTimeMs, endTime);
                    }
                }
            }
        }
    }
    animateProgress() {
        const now = performance.now();
        let running = false;
        if (!this.lyrics || this.activeLineIndices.length === 0) {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = undefined;
            }
            return;
        }
        // Process each active line
        for (const lineIndex of this.activeLineIndices) {
            const line = this.lyrics[lineIndex];
            const mainWordAnimation = this.mainWordAnimations.get(lineIndex);
            // Main text animation
            if (mainWordAnimation && mainWordAnimation.duration > 0) {
                const elapsed = now - mainWordAnimation.startTime;
                if (elapsed >= 0) {
                    const progress = Math.min(1, elapsed / mainWordAnimation.duration);
                    this.mainWordProgress.set(lineIndex, progress);
                    if (progress < 1) {
                        running = true;
                    }
                    else {
                        // Word animation finished. Look for the next word in the same line.
                        const currentMainWordIndex = this.activeMainWordIndices.get(lineIndex) ?? -1;
                        const nextWordIndex = currentMainWordIndex + 1;
                        if (currentMainWordIndex !== -1 &&
                            nextWordIndex < line.text.length) {
                            const currentWord = line.text[currentMainWordIndex];
                            const nextWord = line.text[nextWordIndex];
                            this.activeMainWordIndices.set(lineIndex, nextWordIndex);
                            const gap = nextWord.timestamp - currentWord.endtime;
                            const nextWordDuration = nextWord.endtime - nextWord.timestamp;
                            this.mainWordAnimations.set(lineIndex, {
                                startTime: performance.now() + gap,
                                duration: nextWordDuration,
                            });
                            running = true;
                        }
                        else {
                            this.mainWordAnimations.set(lineIndex, {
                                startTime: 0,
                                duration: 0,
                            });
                        }
                    }
                }
                else {
                    // Waiting in a gap
                    this.mainWordProgress.set(lineIndex, 0);
                    running = true;
                }
            }
            // Background text animation
            const backgroundWordAnimation = this.backgroundWordAnimations.get(lineIndex);
            if (backgroundWordAnimation && backgroundWordAnimation.duration > 0) {
                const elapsed = now - backgroundWordAnimation.startTime;
                if (elapsed >= 0) {
                    const progress = Math.min(1, elapsed / backgroundWordAnimation.duration);
                    this.backgroundWordProgress.set(lineIndex, progress);
                    if (progress < 1) {
                        running = true;
                    }
                    else {
                        // Word animation finished. Look for the next word in the same line.
                        const currentBackgroundWordIndex = this.activeBackgroundWordIndices.get(lineIndex) ?? -1;
                        if (line.backgroundText &&
                            currentBackgroundWordIndex !== -1 &&
                            currentBackgroundWordIndex < line.backgroundText.length - 1) {
                            const nextWordIndex = currentBackgroundWordIndex + 1;
                            const currentWord = line.backgroundText[currentBackgroundWordIndex];
                            const nextWord = line.backgroundText[nextWordIndex];
                            this.activeBackgroundWordIndices.set(lineIndex, nextWordIndex);
                            const gap = nextWord.timestamp - currentWord.endtime;
                            const nextWordDuration = nextWord.endtime - nextWord.timestamp;
                            this.backgroundWordAnimations.set(lineIndex, {
                                startTime: performance.now() + gap,
                                duration: nextWordDuration,
                            });
                            running = true;
                        }
                        else {
                            this.backgroundWordAnimations.set(lineIndex, {
                                startTime: 0,
                                duration: 0,
                            });
                        }
                    }
                }
                else {
                    // Waiting in a gap
                    this.backgroundWordProgress.set(lineIndex, 0);
                    running = true;
                }
            }
        }
        if (running) {
            this.animationFrameId = requestAnimationFrame(this._boundAnimateProgress);
        }
        else if (this.animationFrameId) {
            // Stop animation if no words are running
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = undefined;
        }
    }
    generateLRC() {
        if (!this.lyrics)
            return '';
        let lrc = '';
        // Add metadata if available
        if (this.songTitle)
            lrc += `[ti:${this.songTitle}]\n`;
        if (this.songArtist)
            lrc += `[ar:${this.songArtist}]\n`;
        if (this.songAlbum)
            lrc += `[al:${this.songAlbum}]\n`;
        if (this.lyricsSource)
            lrc += `[re:${this.lyricsSource}]\n`;
        for (const line of this.lyrics) {
            if (line.text && line.text.length > 0) {
                const timestamp = AmLyrics.formatTimestampLRC(line.timestamp);
                // Construct line text from syllables
                const lineText = line.text
                    .map(s => s.text)
                    .join('')
                    .trim();
                lrc += `[${timestamp}]${lineText}\n`;
            }
        }
        return lrc;
    }
    generateTTML() {
        if (!this.lyrics)
            return '';
        // Basic TTML structure
        let ttml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        ttml +=
            '<tt xmlns="http://www.w3.org/ns/ttml" xmlns:itunes="http://music.apple.com/lyrics">\n';
        ttml += '  <body>\n';
        let currentPart;
        for (let i = 0; i < this.lyrics.length; i += 1) {
            const line = this.lyrics[i];
            const part = line.songPart;
            // If part changed (or first line), start new div
            if (part !== currentPart || i === 0) {
                if (i > 0) {
                    ttml += '    </div>\n';
                }
                currentPart = part;
                if (currentPart) {
                    ttml += `    <div itunes:song-part="${currentPart}">\n`;
                }
                else {
                    ttml += '    <div>\n';
                }
            }
            // For TTML, we can represent syllables as spans if word-synced
            const begin = AmLyrics.formatTimestampTTML(line.timestamp);
            const end = AmLyrics.formatTimestampTTML(line.endtime);
            ttml += `      <p begin="${begin}" end="${end}">\n`;
            for (const word of line.text) {
                const wBegin = AmLyrics.formatTimestampTTML(word.timestamp);
                const wEnd = AmLyrics.formatTimestampTTML(word.endtime);
                // Escape special characters in text
                const text = word.text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                ttml += `        <span begin="${wBegin}" end="${wEnd}">${text}</span>\n`;
            }
            ttml += '      </p>\n';
        }
        if (this.lyrics.length > 0) {
            ttml += '    </div>\n';
        }
        ttml += '  </body>\n';
        ttml += '</tt>';
        return ttml;
    }
    static formatTimestampLRC(ms) {
        const totalSeconds = ms / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const hundredths = Math.floor((ms % 1000) / 10);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
    }
    static formatTimestampTTML(ms) {
        // TTML standard format: HH:MM:SS.mmm
        const totalSeconds = ms / 1000;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const milliseconds = Math.floor(ms % 1000);
        const pad = (n, width = 2) => n.toString().padStart(width, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
    }
    downloadLyrics() {
        if (!this.lyrics || this.lyrics.length === 0)
            return;
        // Determine format: TTML if ANY line is word-synced, else LRC
        const isWordSynced = this.lyrics.some(l => l.isWordSynced !== false);
        let content = '';
        let extension = this.downloadFormat;
        if (extension === 'auto') {
            extension = isWordSynced ? 'ttml' : 'lrc';
        }
        let mimeType = '';
        if (extension === 'ttml') {
            content = this.generateTTML();
            mimeType = 'application/xml';
        }
        else {
            content = this.generateLRC();
            mimeType = 'text/plain';
        }
        if (!content)
            return;
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = this.songTitle
            ? `${this.songTitle}${this.songArtist ? ` - ${this.songArtist}` : ''}.${extension}`
            : `lyrics.${extension}`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    render() {
        if (this.fontFamily) {
            this.style.fontFamily = this.fontFamily;
        }
        // Set both old internal CSS variables (for backward compatibility)
        // and new public CSS variables (which take precedence)
        this.style.setProperty('--highlight-color', this.highlightColor);
        const sourceLabel = this.lyricsSource ?? 'Unavailable';
        const isUnsynced = this.cachedIsUnsynced;
        const renderContent = () => {
            if (this.isLoading) {
                // Render stylized skeleton lines
                return b `
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        `;
            }
            if (!this.lyrics || this.lyrics.length === 0) {
                return b `<div class="no-lyrics">No lyrics found.</div>`;
            }
            // Build a lookup map of ALL gaps so they are always in the DOM
            const allGaps = this.findAllInstrumentalGaps();
            const gapByIndex = new Map(allGaps.map(g => [g.insertBeforeIndex, g]));
            return this.lyrics.map((line, lineIndex) => {
                const lineId = `lyrics-line-${lineIndex}`;
                // Calculate line timing
                const lineStartTime = line.text[0]?.timestamp || 0;
                const lineEndTime = line.text[line.text.length - 1]?.endtime || 0;
                // Always render background vocals in the DOM so the syllable cache
                // includes them and the wipe effect applies correctly.
                const hasBackground = line.backgroundText && line.backgroundText.length > 0;
                // Create background vocals container (with romanization support)
                const backgroundVocalElement = hasBackground
                    ? b `<p class="background-vocal-container">
              <span class="background-vocal-wrap">
                ${line.backgroundText.map((syllable, syllableIndex) => {
                        const startTimeMs = syllable.timestamp;
                        const endTimeMs = syllable.endtime;
                        const durationMs = endTimeMs - startTimeMs;
                        const bgRomanizedText = this.showRomanization &&
                            syllable.romanizedText &&
                            syllable.romanizedText.trim() !== syllable.text.trim()
                            ? b `<span
                          class="lyrics-syllable transliteration no-chars ${syllable.lineSynced
                                ? 'line-synced'
                                : ''}"
                          data-start-time="${startTimeMs}"
                          data-end-time="${endTimeMs}"
                          data-duration="${durationMs}"
                          data-syllable-index="0"
                          data-wipe-ratio="1"
                          >${syllable.romanizedText}</span
                        >`
                            : '';
                        return b `<span class="lyrics-word"
                    ><span
                      class="lyrics-syllable-wrap${bgRomanizedText
                            ? ' has-transliteration'
                            : ''}"
                      ><span
                        class="lyrics-syllable no-chars${syllable.lineSynced
                            ? ' line-synced'
                            : ''}"
                        data-start-time="${startTimeMs}"
                        data-end-time="${endTimeMs}"
                        data-duration="${durationMs}"
                        data-syllable-index="${syllableIndex}"
                        data-word-index="${syllableIndex}"
                        data-word-length="${syllable.text.replace(/\s/g, '')
                            .length}"
                        data-wipe-ratio="1"
                        >${syllable.text}</span
                      >${bgRomanizedText}</span
                    ></span
                  >`;
                    })}
              </span>
            </p>`
                    : '';
                // Background vocals share the same line.translation and line.romanizedText
                // as the main vocal, so we intentionally do NOT render a separate
                // translation/romanization block for background — it would just duplicate
                // the main line's text.
                const bgPlacement = hasBackground
                    ? AmLyrics.getBackgroundTextPlacement(line)
                    : 'after';
                const lineData = this.cachedLineData?.[lineIndex];
                const wordGroups = lineData?.wordGroups ?? [];
                const groupGrowable = lineData?.groupGrowable ?? [];
                const groupGlowing = lineData?.groupGlowing ?? [];
                const groupCharRise = lineData?.groupCharRise ?? [];
                const groupCharDrag = lineData?.groupCharDrag ?? [];
                const vwFullText = lineData?.vwFullText ?? [];
                const vwFullDuration = lineData?.vwFullDuration ?? [];
                const vwCharOffset = lineData?.vwCharOffset ?? [];
                const vwStartMs = lineData?.vwStartMs ?? [];
                const vwEndMs = lineData?.vwEndMs ?? [];
                const lineIsRTL = lineData?.lineIsRTL ?? false;
                const mainVocalElement = b `<p
          class="main-vocal-container ${lineIsRTL ? 'rtl-text' : ''}"
        >
          ${wordGroups.map((group, groupIdx) => {
                    const isGrowable = groupGrowable[groupIdx];
                    const isGlowing = groupGlowing[groupIdx];
                    const isCharRise = groupCharRise[groupIdx];
                    const isCharDrag = groupCharDrag[groupIdx];
                    const isAnimatedByChar = isGrowable || isCharRise || isCharDrag;
                    const groupLineSynced = group.some(s => s.lineSynced);
                    const wordText = isAnimatedByChar ? vwFullText[groupIdx] : '';
                    const wordDuration = isAnimatedByChar
                        ? vwFullDuration[groupIdx]
                        : 0;
                    const wordNumChars = wordText.replace(/\s/g, '').length;
                    const groupCharOffset = isAnimatedByChar
                        ? vwCharOffset[groupIdx]
                        : 0;
                    const virtualWordId = `${lineIndex}:${vwStartMs[groupIdx]}:${vwEndMs[groupIdx]}`;
                    const virtualWordStart = vwStartMs[groupIdx];
                    const virtualWordEnd = vwEndMs[groupIdx];
                    let sylCharAccumulator = 0;
                    const groupText = group.map(s => s.text).join('');
                    const visibleWordLength = groupText.replace(/\s/g, '').length;
                    const shouldAllowBreak = groupText.trim().length >= 16 ||
                        /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(groupText);
                    // Calculate dynamic rise duration based on the audio duration of the word
                    const wordStartTimeMs = group[0].timestamp;
                    const wordEndTimeMs = group[group.length - 1].endtime;
                    const actualDurationMs = wordEndTimeMs - wordStartTimeMs;
                    // Base float is 0.8s, plus a portion of the audio duration, capped between 1.0s and 2.5s
                    const riseDuration = Math.max(1.2, Math.min(2.5, 1.2 + (actualDurationMs / 1000) * 0.6));
                    return b `<span
              class="lyrics-word${isGrowable ? ' growable' : ''}${isCharRise
                        ? ' char-rise'
                        : ''}${isCharDrag ? ' char-drag' : ''}${isGlowing
                        ? ' glowing'
                        : ''}${shouldAllowBreak ? ' allow-break' : ''}"
              data-virtual-word-id="${virtualWordId}"
              data-virtual-word-start="${virtualWordStart}"
              data-virtual-word-end="${virtualWordEnd}"
              style="--rise-duration: ${riseDuration}s"
              >${group.map((syllable, sylIdx) => {
                        const startTimeMs = syllable.timestamp;
                        const endTimeMs = syllable.endtime;
                        const durationMs = endTimeMs - startTimeMs;
                        const text = syllable.text || '';
                        const romanizedText = this.showRomanization &&
                            syllable.romanizedText &&
                            syllable.romanizedText.trim() !== syllable.text.trim()
                            ? b `<span
                        class="lyrics-syllable transliteration no-chars ${groupLineSynced
                                ? 'line-synced'
                                : ''}"
                        data-start-time="${startTimeMs}"
                        data-end-time="${endTimeMs}"
                        data-duration="${durationMs}"
                        data-syllable-index="0"
                        data-wipe-ratio="1"
                        >${syllable.romanizedText}</span
                      >`
                            : '';
                        let syllableContent = text;
                        if (isAnimatedByChar) {
                            const numCharsInSyllable = text.replace(/\s/g, '').length || 1;
                            const hasVirtualTiming = wordDuration > 0 && Number.isFinite(virtualWordStart);
                            const syllableStartRatio = hasVirtualTiming
                                ? AmLyrics.clamp((startTimeMs - virtualWordStart) / wordDuration, 0, 1)
                                : 0;
                            const syllableDurationRatio = hasVirtualTiming
                                ? AmLyrics.clamp(durationMs / wordDuration, 0, 1)
                                : 1;
                            let charIndexInsideSyllable = 0;
                            syllableContent = b `${text.split('').map(char => {
                                if (char === ' ')
                                    return ' ';
                                const charIndexInsideWord = groupCharOffset + sylCharAccumulator;
                                const localCharIndex = charIndexInsideSyllable;
                                const visibleWordChars = Math.max(1, wordNumChars);
                                const charStartPercentVal = AmLyrics.clamp(syllableStartRatio +
                                    (localCharIndex / numCharsInSyllable) *
                                        syllableDurationRatio, 0, 1);
                                const charDurationPercentVal = syllableDurationRatio / numCharsInSyllable ||
                                    1 / visibleWordChars;
                                sylCharAccumulator += 1;
                                charIndexInsideSyllable += 1;
                                const minDuration = 400;
                                const maxDuration = 3000;
                                const easingPower = 3;
                                const progress = Math.min(1, Math.max(0, (wordDuration - minDuration) /
                                    (maxDuration - minDuration)));
                                const easedProgress = progress ** easingPower;
                                const isLongWord = wordNumChars > 5;
                                const isShortDuration = wordDuration < 1200;
                                let maxDecayRate = 0;
                                if (isLongWord || isShortDuration) {
                                    let decayStrength = 0;
                                    if (isLongWord)
                                        decayStrength +=
                                            Math.min((wordNumChars - 5) / 5, 1.0) * 0.4;
                                    if (isShortDuration && wordNumChars > 3)
                                        decayStrength +=
                                            Math.max(0, 1.0 - (wordDuration - 800) / 400) * 0.3;
                                    else if (isShortDuration && wordNumChars <= 3)
                                        decayStrength +=
                                            Math.max(0, 1.0 - (wordDuration - 800) / 400) * 0.1;
                                    maxDecayRate = Math.min(decayStrength, 0.7);
                                }
                                const positionInWord = wordNumChars > 1
                                    ? charIndexInsideWord / (wordNumChars - 1)
                                    : 0;
                                const decayFactor = 1.0 - positionInWord * maxDecayRate;
                                const charProgress = easedProgress * decayFactor;
                                const baseGrowth = wordNumChars <= 3 ? 0.05 : 0.04;
                                const charMaxScale = 1.0 + baseGrowth + charProgress * 0.08;
                                const glowDurFactor = Math.min(1.1, wordDuration / 1500);
                                let glowLenFactor = 1.0;
                                if (wordNumChars <= 3) {
                                    glowLenFactor = 0.85;
                                }
                                else if (wordNumChars >= 6) {
                                    glowLenFactor = 1.1;
                                }
                                const glowIntensityScale = glowDurFactor * glowLenFactor;
                                const charShadowIntensity = isGlowing
                                    ? (0.35 + charProgress * 0.45) * glowIntensityScale
                                    : 0;
                                const normalizedGrowth = (charMaxScale - 1.0) / 0.1;
                                const effectiveDuration = (wordDuration + durationMs * 2) / 3;
                                const peakMultiplier = Math.min(1, Math.max(0.3, effectiveDuration / 2000));
                                const baseTranslateYPeak = -normalizedGrowth * (2 * peakMultiplier); // Further dampened lift peak
                                const position = (charIndexInsideWord + 0.5) / wordNumChars;
                                const horizontalOffset = (position - 0.5) * 2 * ((charMaxScale - 1.0) * 25);
                                const isDragMotion = isCharDrag;
                                let charTranslateYPeak = baseTranslateYPeak;
                                if (isCharRise) {
                                    charTranslateYPeak = 0;
                                }
                                else if (isDragMotion) {
                                    charTranslateYPeak = -0.78;
                                }
                                let motionHorizontalOffset = horizontalOffset;
                                if (isCharRise) {
                                    motionHorizontalOffset = 0;
                                }
                                else if (isDragMotion) {
                                    motionHorizontalOffset = 0;
                                }
                                return b `<span
                      class="char"
                      data-char-index="${charIndexInsideWord}"
                      data-syllable-char-index="${charIndexInsideWord}"
                      data-wipe-start="${charStartPercentVal.toFixed(4)}"
                      data-wipe-duration="${charDurationPercentVal.toFixed(4)}"
                      data-horizontal-offset="${horizontalOffset.toFixed(2)}"
                      data-max-scale="${charMaxScale.toFixed(3)}"
                      data-matrix-scale="${(charMaxScale * 0.98).toFixed(3)}"
                      data-char-offset-x="${(motionHorizontalOffset * 0.98).toFixed(2)}"
                      data-shadow-intensity="${charShadowIntensity.toFixed(3)}"
                      data-translate-y-peak="${charTranslateYPeak.toFixed(3)}"
                      style="--word-wipe-width: ${visibleWordChars}ch; --char-wipe-position: -${charIndexInsideWord}ch"
                      >${char}</span
                    >`;
                            })}`;
                        }
                        return b `<span
                  class="lyrics-syllable-wrap${romanizedText
                            ? ' has-transliteration'
                            : ''}"
                  ><span
                    class="lyrics-syllable${groupLineSynced
                            ? ' line-synced'
                            : ''}${isAnimatedByChar ? ' has-chars' : ' no-chars'}"
                    data-start-time="${startTimeMs}"
                    data-end-time="${endTimeMs}"
                    data-duration="${durationMs}"
                    data-word-duration="${wordDuration}"
                    data-syllable-index="${sylIdx}"
                    data-word-index="${groupIdx}"
                    data-word-length="${visibleWordLength}"
                    data-wipe-ratio="1"
                    >${syllableContent}</span
                  >${romanizedText}</span
                >`;
                    })}</span
            >`;
                })}
        </p>`;
                // Translation container (if enabled)
                // Hide translation if it matches the original line text
                const fullLineText = line.text
                    .map(s => s.text)
                    .join('')
                    .trim();
                const translationElement = this.showTranslation &&
                    line.translation &&
                    line.translation.trim() !== fullLineText
                    ? b `<div class="lyrics-translation-container">
                ${line.translation}
              </div>`
                    : '';
                // Line-synced romanization (fallback if no word-level romanization)
                // Hide if the romanized text matches the original line text
                const lineRomanizationElement = this.showRomanization &&
                    line.romanizedText &&
                    !line.text.some(s => s.romanizedText) &&
                    line.romanizedText.trim() !== fullLineText
                    ? b `<div
                class="lyrics-romanization-container ${lineIsRTL
                        ? 'rtl-text'
                        : ''}"
              >
                ${line.romanizedText}
              </div>`
                    : '';
                // Check for instrumental gap before this line
                let maybeInstrumentalBlock = null;
                const gapForLine = gapByIndex.get(lineIndex);
                if (gapForLine) {
                    const gapDuration = gapForLine.gapEnd - gapForLine.gapStart;
                    // Calculate dot timing for fill-up animation (3 dots)
                    const dotDuration = gapDuration / 3;
                    const gapLoopDelay = AmLyrics.getGapLoopDelay(gapDuration);
                    // Gap starts without 'active' — _onTimeChanged toggles it imperatively
                    maybeInstrumentalBlock = b `<div
            id="gap-${lineIndex}"
            class="lyrics-line lyrics-gap"
            data-start-time="${gapForLine.gapStart}"
            data-end-time="${gapForLine.gapEnd}"
            style="--gap-pulse-duration: ${GAP_PULSE_DURATION_MS}ms; --gap-loop-delay: -${gapLoopDelay}ms; --gap-exit-duration: ${GAP_EXIT_LEAD_MS}ms; --gap-exit-scale: ${GAP_MIN_SCALE};"
          >
            <p class="main-vocal-container">
              <span class="lyrics-word"
                ><span class="lyrics-syllable-wrap"
                  ><span
                    class="lyrics-syllable"
                    data-start-time="${gapForLine.gapStart}"
                    data-end-time="${gapForLine.gapStart + dotDuration}"
                    data-duration="${dotDuration}"
                    data-wipe-ratio="1"
                    data-syllable-index="0"
                  ></span></span
                ><span class="lyrics-syllable-wrap"
                  ><span
                    class="lyrics-syllable"
                    data-start-time="${gapForLine.gapStart + dotDuration}"
                    data-end-time="${gapForLine.gapStart + dotDuration * 2}"
                    data-duration="${dotDuration}"
                    data-wipe-ratio="1"
                    data-syllable-index="1"
                  ></span></span
                ><span class="lyrics-syllable-wrap"
                  ><span
                    class="lyrics-syllable"
                    data-start-time="${gapForLine.gapStart + dotDuration * 2}"
                    data-end-time="${gapForLine.gapEnd}"
                    data-duration="${dotDuration}"
                    data-wipe-ratio="1"
                    data-syllable-index="2"
                  ></span></span
              ></span>
            </p>
          </div>`;
                }
                return b `
          ${maybeInstrumentalBlock}
          <div
            id="${lineId}"
            class="lyrics-line ${line.alignment === 'end'
                    ? 'singer-right'
                    : 'singer-left'} ${lineIsRTL ? 'rtl-text' : ''}"
            data-start-time="${lineStartTime}"
            data-end-time="${lineEndTime}"
            @click=${() => this.handleLineClick(line)}
            tabindex="0"
            @keydown=${(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        this.handleLineClick(line);
                    }
                }}
          >
            <div class="lyrics-line-container ${lineIsRTL ? 'rtl-text' : ''}">
              ${bgPlacement === 'before' ? backgroundVocalElement : ''}
              ${mainVocalElement}
              ${bgPlacement === 'after' ? backgroundVocalElement : ''}
              ${lineRomanizationElement} ${translationElement}
            </div>
          </div>
        `;
            });
        };
        return b `
      <div
        class="lyrics-container ${isUnsynced
            ? 'is-unsynced'
            : 'blur-inactive-enabled'}"
      >
        ${!this.isLoading && this.lyrics && this.lyrics.length > 0
            ? b `
              <div class="lyrics-header">
                <div class="header-controls">
                  <button
                    class="download-button ${this.showRomanization
                ? 'active'
                : ''}"
                    @click=${this.toggleRomanization}
                    title="Toggle Romanization"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-speech-icon lucide-speech"
                    >
                      <path
                        d="M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3A5.37 5.37 0 0 0 2 8.25c0 2.8.656 3.054 1 4.55a5.77 5.77 0 0 1 .029 2.758L2 20"
                      />
                      <path d="M19.8 17.8a7.5 7.5 0 0 0 .003-10.603" />
                      <path d="M17 15a3.5 3.5 0 0 0-.025-4.975" />
                    </svg>
                  </button>
                  <button
                    class="download-button ${this.showTranslation
                ? 'active'
                : ''}"
                    @click=${this.toggleTranslation}
                    title="Toggle Translation"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-languages-icon lucide-languages"
                    >
                      <path d="m5 8 6 6" />
                      <path d="m4 14 6-6 2-3" />
                      <path d="M2 5h12" />
                      <path d="M7 2h1" />
                      <path d="m22 22-5-10-5 10" />
                      <path d="M14 18h6" />
                    </svg>
                  </button>
                </div>
                <div class="download-controls">
                  <select
                    class="format-select"
                    @change=${(e) => {
                this.downloadFormat = e.target
                    .value;
            }}
                    .value=${this.downloadFormat}
                    @click=${(e) => e.stopPropagation()}
                  >
                    <option value="auto">Auto</option>
                    <option value="lrc">LRC</option>
                    <option value="ttml">TTML</option>
                  </select>
                  <button
                    class="download-button"
                    @click=${this.downloadLyrics}
                    title="Download Lyrics"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-download-icon lucide-download"
                    >
                      <path d="M12 15V3" />
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <path d="m7 10 5 5 5-5" />
                    </svg>
                  </button>
                </div>
              </div>
            `
            : ''}
        ${renderContent()}
        ${!this.isLoading
            ? b `
              <footer class="lyrics-footer lyrics-line">
                <div class="footer-content">
                  <span
                    class="source-info"
                    style="display: flex; align-items: center; gap: 8px;"
                  >
                    <b style="font-weight: 750;">Source</b> ${sourceLabel}
                    ${(this.availableSources &&
                this.availableSources.length > 1) ||
                !this.hasFetchedAllProviders
                ? b `
                          <button
                            class="download-button source-switch-btn"
                            title="Switch Lyrics Source"
                            @click=${this.switchSource}
                            ?disabled=${this.isFetchingAlternatives}
                          >
                            <svg
                              class="source-switch-svg lucide lucide-arrow-down-up-icon lucide-arrow-down-up ${this
                    .isFetchingAlternatives
                    ? 'is-loading'
                    : ''}"
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              ${this.isFetchingAlternatives
                    ? w `<path
                                    d="M21 12a9 9 0 1 1-6.219-8.56"
                                  ></path>`
                    : w `<path d="m3 16 4 4 4-4"></path
                                    ><path d="M7 20V4"></path
                                    ><path d="m21 8-4-4-4 4"></path
                                    ><path d="M17 4v16"></path>`}
                            </svg>
                            <span class="source-switch-label"
                              >${this.isFetchingAlternatives
                    ? 'Switching...'
                    : 'Switch'}</span
                            >
                          </button>
                        `
                : ''}
                  </span>
                  ${this.songwriters
                ? b `<span
                        class="songwriters-info"
                        style="margin-top: 4px; font-weight: normal; font-size: 0.9em;"
                      >
                        <b style="font-weight: 750;">Songwriters</b> ${this
                    .songwriters}
                      </span>`
                : ''}
                  <span class="version-info" style="margin-top: 8px;">
                    <b style="font-weight: 750;">am-lyrics</b> v${VERSION} •

                    <a
                      href="https://github.com/uimaxbai/apple-music-web-components"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="display: inline-flex; align-items: center; gap: 4px;"
                      >Star me on GitHub
                    </a>
                  </span>
                </div>
              </footer>
            `
            : ''}
      </div>
    `;
    }
}
AmLyrics.styles = i$3 `
    :host {
      --lyplus-lyrics-palette: var(
        --am-lyrics-highlight-color,
        var(--highlight-color, #ffffff)
      );
      --lyplus-text-primary: var(--lyplus-lyrics-palette);
      /* Use color-mix with the text color rather than just opacity so it adapts */
      --lyplus-text-secondary: color-mix(
        in srgb,
        var(--lyplus-lyrics-palette),
        transparent 50%
      );

      --lyplus-padding-base: 1em;
      --lyplus-padding-line: var(--am-lyrics-padding-line, 12px 16px);
      --lyplus-padding-gap: 0.3em;
      --lyplus-border-radius-base: 0.6em;
      --lyplus-gap-dot-size: 0.4em;
      --lyplus-gap-dot-margin: 0.08em;

      --lyplus-font-size-base: var(--am-lyrics-font-size, 34px);
      --lyplus-font-size-base-grow: 24.5;
      --lyplus-font-size-subtext: 0.6em;
      --char-rise-y: calc(-0.035 * var(--lyplus-font-size-base));

      --lyplus-blur-amount: 0.06em;
      --lyplus-blur-amount-near: 0.03em;
      --lyplus-fade-gap-timing-function: ease-out;
      --wipe-gradient-width: 0.75em;
      --wipe-gradient-half: 0.375em;

      --lyrics-scroll-padding-top: var(--am-lyrics-scroll-top, 33%);

      display: block;
      box-sizing: border-box;
      font-family:
        -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
        system-ui, -apple-system-subheadline, "Helvetica Neue", sans-serif;
      letter-spacing: -0.02em;
      line-height: var(--am-lyrics-line-height, 1.28);
      background: transparent;
      height: 100%;
      width: 100%;
      overflow: hidden;
      font-weight: 700;
      color: var(--lyplus-text-primary);
    }

    /* ==========================================================================
       CONTAINER & SCROLL BEHAVIOR
       ========================================================================== */
    .lyrics-container {
      padding: var(--am-lyrics-container-padding-inline, 20px);
      padding-top: var(--am-lyrics-container-padding-top, 28vh);
      padding-bottom: var(--am-lyrics-container-padding-bottom, 42vh);
      border-radius: 8px;
      background-color: transparent;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      box-sizing: border-box;
      scrollbar-width: none;
      overflow-anchor: none;
    }

    .lyrics-container::-webkit-scrollbar {
      display: none;
    }

    /* Disable transitions during touch-scrolling for 1:1 feedback */
    .lyrics-container.touch-scrolling .lyrics-line,
    .lyrics-container.touch-scrolling .lyrics-plus-metadata {
      transition: none !important;
      filter: none !important;
    }

    /* Apply smooth gliding transition for mouse-wheel scrolling */
    .lyrics-container.wheel-scrolling .lyrics-line {
      transition: transform 0.3s ease-out !important;
      filter: none !important;
    }

    .lyrics-line.scroll-animate {
      /* Preserve the graceful fade duration; the keyframe handles the
         transform, so we only need to keep opacity/filter transitions
         alive without !important overriding the base rule. */
      transition:
        opacity 0.7s ease,
        filter 0.7s ease,
        transform 0.4s cubic-bezier(0.41, 0, 0.12, 0.99)
          var(--lyrics-line-delay, 0ms);
      animation-name: lyrics-scroll;
      animation-duration: var(--scroll-duration, 400ms);
      animation-timing-function: cubic-bezier(0.41, 0, 0.12, 0.99);
      animation-fill-mode: both;
      animation-delay: var(--lyrics-line-delay, 0ms);
    }

    .lyrics-container.user-scrolling .lyrics-line {
      --lyrics-line-delay: 0ms !important;
      transition-delay: 0ms !important;
    }

    /* ==========================================================================
       LYRICS LINE BASE STYLES
       ========================================================================== */
    .lyrics-line {
      padding: var(--lyplus-padding-line);
      opacity: 0.8;
      color: var(--lyplus-text-secondary);
      font-size: var(--lyplus-font-size-base);
      cursor: pointer;
      transform-origin: left;
      /* Graceful 0.7 s fade so the line stays mostly bright while the
         0.4 s scroll animation runs, then settles into the inactive state. */
      transition:
        opacity 0.7s ease,
        transform 0.4s cubic-bezier(0.41, 0, 0.12, 0.99)
          var(--lyrics-line-delay, 0ms),
        filter 0.7s ease;
      content-visibility: auto;
      contain: layout style;
      text-rendering: optimizeLegibility;
    }

    .lyrics-line:not(.scroll-animate) {
      animation: none;
    }

    /* --- Line Container & Vocal Containers --- */
    .lyrics-line-container {
      overflow-wrap: break-word;
      transform-origin: left;
      transform: translateZ(0);
      transition:
        transform 0.7s ease,
        background-color 0.7s,
        color 0.7s;
    }

    .lyrics-line.active .lyrics-line-container,
    .lyrics-line.pre-active .lyrics-line-container {
      transform: translateZ(0);
      transition:
        transform 0.5s ease,
        background-color 0.18s,
        color 0.18s;
    }

    .main-vocal-container {
      transform-origin: 5% 50%;
      margin: 0;
    }

    .background-vocal-container {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      font-size: var(--lyplus-font-size-subtext);
      line-height: 1.15;
      color: color-mix(in srgb, var(--lyplus-text-secondary) 80%, transparent);
      transition:
        max-height var(--scroll-duration, 400ms)
          cubic-bezier(0.41, 0, 0.12, 0.99),
        opacity var(--scroll-duration, 400ms) cubic-bezier(0.41, 0, 0.12, 0.99);
      margin: 0;
      pointer-events: none;
    }

    .background-vocal-wrap {
      display: block;
      padding-top: 0;
      padding-bottom: 0;
      transition: padding-top var(--scroll-duration, 400ms)
        cubic-bezier(0.41, 0, 0.12, 0.99);
    }

    .lyrics-line.singer-right .background-vocal-container,
    .lyrics-line.rtl-text .background-vocal-container {
      margin-left: auto;
      margin-right: 0;
    }

    /* Background vocals expand only when .bg-expanded is present.
       This is separate from .active so bg vocals can collapse immediately
       while .active stays to keep text white until the scroll passes. */
    .lyrics-line.bg-expanded .background-vocal-container {
      max-height: 4em;
      opacity: 1;
      will-change: opacity;
    }

    .lyrics-line.bg-expanded .background-vocal-wrap {
      padding-top: 0.26em;
    }

    /* --- Line States & Modifiers --- */
    .lyrics-line.active {
      opacity: 1;
      color: var(--lyplus-text-primary);
    }

    .lyrics-line.pre-active {
      opacity: 1;
    }

    /* Predictive scrolling begins before the next timestamp. Start dimming
       the outgoing line at the same moment so it settles with the scroll. */
    .lyrics-line.scroll-exiting {
      opacity: 0.8;
      color: var(--lyplus-text-secondary);
      transition:
        opacity var(--scroll-duration, 400ms) cubic-bezier(0.41, 0, 0.12, 0.99),
        transform var(--scroll-duration, 400ms)
          cubic-bezier(0.41, 0, 0.12, 0.99) var(--lyrics-line-delay, 0ms),
        filter var(--scroll-duration, 400ms) ease;
    }

    .lyrics-line.persist-highlight {
      filter: none !important;
      opacity: 1;
    }

    .lyrics-line.persist-highlight .lyrics-syllable.finished,
    .lyrics-line.persist-highlight .lyrics-syllable.finished span.char {
      transition: none !important;
    }

    .lyrics-line.singer-right {
      text-align: end;
    }

    .lyrics-line.singer-right .lyrics-line-container,
    .lyrics-line.singer-right .main-vocal-container {
      transform-origin: right;
    }

    .lyrics-line.rtl-text {
      direction: rtl;
      text-align: right !important;
      transform-origin: right;
    }

    .lyrics-line.rtl-text .lyrics-line-container,
    .lyrics-line.rtl-text .main-vocal-container {
      transform-origin: right;
    }

    .lyrics-line.rtl-text .lyrics-romanization-container,
    .lyrics-line.rtl-text .lyrics-translation-container {
      text-align: right;
    }

    /* --- Unsynced (Plain Text) Lyrics Overrides --- */
    .lyrics-container.is-unsynced .lyrics-line {
      opacity: 1 !important;
      color: var(--lyplus-text-primary) !important;
      filter: none !important;
      transform: none !important;
      cursor: default;
    }

    .lyrics-container.is-unsynced .lyrics-line-container {
      transform: none !important;
      background-color: transparent !important;
    }

    .lyrics-container.is-unsynced .lyrics-syllable {
      color: var(--lyplus-text-primary) !important;
      background-color: transparent !important;
      -webkit-background-clip: unset !important;
      background-clip: unset !important;
      -webkit-text-fill-color: unset !important;
      text-fill-color: unset !important;
      text-shadow: none !important;
      filter: none !important;
      opacity: 1 !important;
      transform: none !important;
    }

    @media (hover: hover) and (pointer: fine) {
      .lyrics-line:hover {
        filter: none !important;
        opacity: 1 !important;
      }
      .lyrics-container.is-unsynced .lyrics-line:hover {
        background: transparent !important;
      }
    }

    /* --- Blur Effect for Inactive Lines --- */
    .lyrics-container.blur-inactive-enabled:not(.not-focused)
      .lyrics-line:not(.active):not(.pre-active):not(.lyrics-gap):not(
        .persist-highlight
      ) {
      filter: blur(var(--lyplus-blur-amount));
    }

    /* Viewport Virtualization: Strip expensive filters and animations from
       offscreen lines.  IntersectionObserver toggles this class. */
    .lyrics-line.far-line {
      filter: none !important;
      will-change: auto !important;
      animation: none !important;
    }

    .lyrics-container.blur-inactive-enabled:not(.not-focused)
      .lyrics-line.post-active-line:not(.lyrics-gap):not(.active):not(
        .pre-active
      ):not(.persist-highlight),
    .lyrics-container.blur-inactive-enabled:not(.not-focused)
      .lyrics-line.next-active-line:not(.lyrics-gap):not(.active):not(
        .pre-active
      ):not(.persist-highlight),
    .lyrics-container.blur-inactive-enabled:not(.not-focused)
      .lyrics-line.lyrics-activest:not(.active):not(.lyrics-gap):not(
        .pre-active
      ):not(.persist-highlight) {
      filter: blur(var(--lyplus-blur-amount-near));
    }

    /* Unblur all lines when user is scrolling */
    .lyrics-container.user-scrolling .lyrics-line {
      transition: none !important;
      filter: none !important;
      opacity: 0.8 !important;
    }

    /* Unblur early for pre-active lines */
    .lyrics-container.blur-inactive-enabled .lyrics-line.pre-active {
      filter: blur(0px) !important;
      opacity: 1;
    }

    /* ==========================================================================
       WORD & SYLLABLE STYLES
       ========================================================================== */
    .lyrics-word:not(.allow-break) {
      display: inline-block;
      vertical-align: baseline;
      white-space: nowrap;
      margin-right: 0.28em;
    }

    .lyrics-word:last-child {
      margin-right: 0;
    }

    .lyrics-word.allow-break {
      display: inline;
      margin-right: 0.28em;
    }

    .lyrics-word.allow-break:last-child {
      margin-right: 0;
    }

    .lyrics-word.char-rise {
      display: inline-block;
      vertical-align: baseline;
      white-space: nowrap;
      margin-right: 0.28em;
    }

    .lyrics-word.char-rise:last-child {
      margin-right: 0;
    }

    .lyrics-word.char-drag {
      display: inline-block;
      vertical-align: baseline;
      white-space: nowrap;
      margin-right: 0.28em;
    }

    .lyrics-word.char-drag:last-child {
      margin-right: 0;
    }

    .lyrics-word.char-rise.allow-break {
      display: inline;
      white-space: normal;
      margin-right: 0.28em;
    }

    .lyrics-word.char-rise.allow-break:last-child {
      margin-right: 0;
    }

    .lyrics-word.char-drag.allow-break {
      display: inline;
      white-space: normal;
      margin-right: 0.28em;
    }

    .lyrics-word.char-drag.allow-break:last-child {
      margin-right: 0;
    }

    .lyrics-syllable-wrap {
      display: inline;
    }

    .lyrics-syllable-wrap.has-transliteration {
      display: inline-flex;
      flex-direction: column;
      align-items: start;
    }

    .lyrics-syllable {
      display: inline-block;
      vertical-align: baseline;
      color: transparent;
      background-color: var(--lyplus-text-secondary);
      white-space: pre-wrap;
      font-variant-ligatures: none;
      font-feature-settings: 'liga' 0;
      background-clip: text;
      -webkit-background-clip: text;
      transition:
        color 0.7s,
        background-color 0.7s,
        transform 0.7s ease;
    }

    /* --- Syllable States --- */
    .lyrics-syllable.finished {
      background-color: var(--lyplus-text-primary);
      /* Unified transition: transform keeps its 1s glow decay, while
         background-color and color fade at 0.7s so everything dims
         together when the line becomes inactive. */
      transition:
        transform 1s ease,
        background-color 0.7s ease,
        color 0.7s ease;
    }

    .lyrics-syllable.finished.has-chars {
      background-color: transparent;
    }

    .lyrics-line.active:not(.lyrics-gap) .lyrics-syllable {
      transition:
        transform 1s ease,
        background-color 0.5s,
        color 0.5s;
    }

    /* --- Wipe Highlight Effect --- */
    .lyrics-line.active:not(.lyrics-gap) .lyrics-syllable.highlight.no-chars,
    .lyrics-line.active:not(.lyrics-gap)
      .lyrics-syllable.pre-highlight.no-chars {
      background-repeat: no-repeat;
      background-image: linear-gradient(
        90deg,
        var(--lyplus-text-primary, #fff) 0%,
        var(--lyplus-text-primary, #fff)
          calc(100% - var(--wipe-gradient-width, 0.75em)),
        #0000 100%
      );
      background-size: 0% 100%;
      background-position: left;
    }

    .lyrics-line.active:not(.lyrics-gap) .lyrics-syllable.highlight.rtl-text,
    .lyrics-line.active:not(.lyrics-gap)
      .lyrics-syllable.pre-highlight.rtl-text {
      direction: rtl;
      background-image: linear-gradient(
        -90deg,
        var(--lyplus-text-primary) 0%,
        var(--lyplus-text-primary)
          calc(100% - var(--wipe-gradient-width, 0.75em)),
        transparent 100%
      );
      background-size: 0% 100%;
      background-position: right 0%;
    }

    /* Background vocals: muted gray wipe instead of white.
       Must match specificity of the main .active .highlight rule (0,3,1). */
    .lyrics-line.active
      .background-vocal-container
      .lyrics-syllable.highlight.no-chars,
    .lyrics-line.active
      .background-vocal-container
      .lyrics-syllable.pre-highlight.no-chars,
    .lyrics-line.pre-active
      .background-vocal-container
      .lyrics-syllable.highlight.no-chars,
    .lyrics-line.pre-active
      .background-vocal-container
      .lyrics-syllable.pre-highlight.no-chars {
      background-image: linear-gradient(
        90deg,
        color-mix(in srgb, var(--lyplus-text-primary, #fff) 50%, #888888) 0%,
        color-mix(in srgb, var(--lyplus-text-primary, #fff) 50%, #888888)
          calc(100% - var(--wipe-gradient-width, 0.75em)),
        #0000 100%
      );
    }

    .lyrics-line.active
      .background-vocal-container
      .lyrics-syllable.highlight.rtl-text,
    .lyrics-line.active
      .background-vocal-container
      .lyrics-syllable.pre-highlight.rtl-text,
    .lyrics-line.pre-active
      .background-vocal-container
      .lyrics-syllable.highlight.rtl-text,
    .lyrics-line.pre-active
      .background-vocal-container
      .lyrics-syllable.pre-highlight.rtl-text {
      background-image: linear-gradient(
        -90deg,
        color-mix(in srgb, var(--lyplus-text-primary) 50%, #888888) 0%,
        color-mix(in srgb, var(--lyplus-text-primary) 50%, #888888)
          calc(100% - var(--wipe-gradient-width, 0.75em)),
        transparent 100%
      );
    }

    /* Non-growable words float up with a gentle curve */
    .lyrics-line.active:not(.lyrics-gap)
      .lyrics-word:not(.growable)
      .lyrics-syllable.highlight {
      transform: translate3d(0, var(--char-rise-y, -1.12px), 0);
    }

    .lyrics-line.persist-highlight:not(.lyrics-gap)
      .lyrics-word:not(.growable)
      .lyrics-syllable.finished {
      transform: translate3d(0, var(--char-rise-y, -1.12px), 0);
    }

    .lyrics-word.growable .lyrics-syllable.cleanup .char {
      transform: translate3d(0, var(--char-rise-y, -1.12px), 0);
    }

    .lyrics-word.char-rise .lyrics-syllable.cleanup .char {
      transform: translate3d(0, var(--char-rise-y, -1.12px), 0);
    }

    .lyrics-word.char-drag .lyrics-syllable.cleanup .char {
      transform: translate3d(0, var(--char-rise-y, -1.12px), 0);
    }

    .lyrics-line.persist-highlight
      .lyrics-word.growable
      .lyrics-syllable.finished
      .char,
    .lyrics-line.persist-highlight
      .lyrics-word.char-rise
      .lyrics-syllable.finished
      .char,
    .lyrics-line.persist-highlight
      .lyrics-word.char-drag
      .lyrics-syllable.finished
      .char {
      transform: translate3d(0, var(--char-rise-y, -1.12px), 0);
    }

    /* Background vocal overrides — placed AFTER main rules so they win
       on equal specificity. */
    .background-vocal-container .lyrics-syllable {
      background-color: color-mix(
        in srgb,
        var(--lyplus-text-secondary) 50%,
        #888888
      );
    }

    .lyrics-line.active:not(.lyrics-gap)
      .background-vocal-container
      .lyrics-syllable.finished,
    .lyrics-line.pre-active
      .background-vocal-container
      .lyrics-syllable.finished {
      background-color: color-mix(
        in srgb,
        var(--lyplus-text-primary) 50%,
        #888888
      );
    }

    .background-vocal-container .lyrics-syllable.line-synced {
      color: color-mix(
        in srgb,
        var(--lyplus-text-secondary) 50%,
        #888888
      ) !important;
    }

    .lyrics-line.active:not(.lyrics-gap)
      .background-vocal-container
      .lyrics-syllable.line-synced,
    .lyrics-line.pre-active
      .background-vocal-container
      .lyrics-syllable.line-synced {
      color: color-mix(
        in srgb,
        var(--lyplus-text-primary) 50%,
        #888888
      ) !important;
    }

    .lyrics-line.active:not(.lyrics-gap)
      .background-vocal-container
      .lyrics-syllable.line-synced.finished,
    .lyrics-line.pre-active
      .background-vocal-container
      .lyrics-syllable.line-synced.finished {
      color: color-mix(
        in srgb,
        var(--lyplus-text-primary) 50%,
        #888888
      ) !important;
    }

    .lyrics-syllable.pre-highlight {
      animation-name: pre-wipe-universal;
      animation-duration: var(--pre-wipe-duration);
      animation-delay: var(--pre-wipe-delay);
      animation-timing-function: linear;
      animation-fill-mode: forwards;
    }

    .lyrics-syllable.pre-highlight.rtl-text {
      animation-name: pre-wipe-universal-rtl;
    }

    .lyrics-syllable.transliteration {
      font-size: var(--lyplus-font-size-subtext);
      white-space: pre-wrap;
      pointer-events: none;
      user-select: none;
    }

    /* Syllable with chars: make syllable transparent, chars handle color */
    .lyrics-line .lyrics-syllable.has-chars:not(.finished) {
      background-color: transparent;
      color: transparent;
    }

    .lyrics-syllable span.char {
      display: inline-block;
      background-color: var(--lyplus-text-secondary);
      white-space: break-spaces;
      font-variant-ligatures: none;
      font-feature-settings: 'liga' 0;
      background-clip: text;
      -webkit-background-clip: text;
      backface-visibility: hidden;
      transform-origin: 50% 80%;
      transition:
        color 0.7s,
        background-color 0.7s,
        transform 0.7s ease;
    }

    .lyrics-syllable.finished span.char {
      background-color: var(--lyplus-text-primary);
      transition:
        color 0.7s,
        background-color 0.7s,
        transform 0.7s ease;
    }

    .lyrics-word.char-drag span.char {
      transition: color 0.18s;
    }

    /* Active char spans: structural only, wipe animation sets gradient */
    .lyrics-line.active .lyrics-syllable span.char {
      background-clip: text;
      -webkit-background-clip: text;
      background-repeat: no-repeat;
      background-image:
        linear-gradient(
          90deg,
          #ffffff00 0%,
          var(--lyplus-text-primary, #fff) 50%,
          #0000 100%
        ),
        linear-gradient(
          90deg,
          var(--lyplus-text-primary, #fff) 100%,
          #0000 100%
        );
      background-size:
        var(--wipe-gradient-width, 0.75em) 100%,
        0% 100%;
      background-position:
        calc(-1 * var(--wipe-gradient-width, 0.75em)) 0%,
        left;
      transition:
        transform 0.7s ease,
        color 0.18s;
    }

    .lyrics-line.active .lyrics-syllable span.char.highlight {
      background-image: linear-gradient(
        -90deg,
        var(--lyplus-text-primary, #fff) 0%,
        var(--lyplus-text-primary, #fff)
          calc(100% - var(--wipe-gradient-width, 0.75em)),
        #0000 100%
      );
      background-size: 0% 100%;
      background-position: right 0%;
    }

    .lyrics-line.active .lyrics-syllable span.char.pre-wipe-lead {
      animation-name: char-pre-wipe;
      animation-duration: var(--pre-wipe-duration);
      animation-delay: var(--pre-wipe-delay);
      animation-timing-function: linear;
      animation-fill-mode: forwards;
    }

    /* ==========================================================================
       INSTRUMENTAL GAP STYLES
       ========================================================================== */
    .lyrics-gap {
      max-height: 1.6em;
      padding: var(--lyplus-padding-gap);
      overflow: visible;
      opacity: 0;
      box-sizing: content-box;
      background-clip: unset;
      transform-origin: top;
      content-visibility: visible !important;
      contain: none !important;
      transition:
        opacity 160ms ease-out,
        transform var(--scroll-duration, 280ms) var(--lyrics-line-delay, 0ms);
    }

    .lyrics-gap.active {
      opacity: 1;
      transition:
        opacity 160ms ease-out,
        transform var(--scroll-duration, 280ms);
    }

    /* Exiting state: quickly collapse width and height so dots don't distort page, or remove max-height transition */
    .lyrics-gap.gap-exiting {
      opacity: 1;
    }

    .lyrics-gap .main-vocal-container {
      transform: translateY(-25%) scale(1);
      transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .lyrics-gap:not(.active):not(.gap-exiting) .main-vocal-container {
      transform: translateY(-25%) scale(0);
    }

    /* Pulse — must come BEFORE .gap-exiting so exiting wins via specificity+order */
    .lyrics-gap.active .main-vocal-container {
      animation: gap-loop var(--gap-pulse-duration, 4000ms) ease-in-out infinite
        alternate;
      animation-delay: var(--gap-loop-delay, 0ms);
    }

    /* Jump animation plays during exit — disable transition so animation wins.
       Placed AFTER .active so it wins when both classes are present briefly. */
    .lyrics-gap.gap-exiting .main-vocal-container {
      animation: gap-ended var(--gap-exit-duration, 360ms)
        cubic-bezier(0.33, 1, 0.68, 1) forwards;
      transition: none !important;
    }

    .lyrics-gap .lyrics-syllable {
      display: inline-block;
      width: var(--lyplus-gap-dot-size);
      height: var(--lyplus-gap-dot-size);
      background-color: var(--lyplus-text-primary);
      border-radius: 50%;
      margin: 0 var(--lyplus-gap-dot-margin);
    }

    /* Line-synced lyrics should fade in instantly/quickly instead of wiping */
    .lyrics-syllable.line-synced {
      background: transparent !important;
      color: var(--lyplus-text-secondary) !important;
    }

    .lyrics-line.active .lyrics-syllable.line-synced {
      animation: fade-in-line 0.2s ease-out forwards !important;
      color: var(--lyplus-text-primary) !important;
    }

    .lyrics-line.active .lyrics-syllable.line-synced span.char {
      background-image: none !important;
      background-color: var(--lyplus-text-primary) !important;
      transition: background-color 120ms ease-out !important;
    }

    @keyframes fade-in-line {
      from {
        opacity: 0.5;
        color: var(--lyplus-text-secondary);
      }
      to {
        opacity: 1;
        color: var(--lyplus-lyrics-palette);
      }
    }

    .lyrics-gap .lyrics-syllable {
      background-color: var(--lyplus-text-secondary);
      background-clip: unset;
    }

    .lyrics-gap.active .lyrics-syllable.finished,
    .lyrics-gap.gap-exiting .lyrics-syllable.finished,
    .lyrics-gap:not(.active):not(.gap-exiting).post-active-line
      .lyrics-syllable,
    .lyrics-gap:not(.active):not(.gap-exiting).lyrics-activest
      .lyrics-syllable {
      background-color: var(--lyplus-text-primary);
      animation: none !important;
      opacity: 1;
    }

    /* ==========================================================================
       METADATA & FOOTER STYLES
       ========================================================================== */
    .lyrics-plus-metadata {
      display: block;
      position: relative;
      box-sizing: border-box;
      font-weight: normal;
      transform: translateY(var(--lyrics-scroll-offset, 0px));
      transition:
        opacity 0.3s ease,
        transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)
          var(--lyrics-line-delay, 0ms),
        filter 0.3s ease;
    }

    .lyrics-plus-empty {
      display: block;
      height: 100vh;
      transform: translateY(var(--lyrics-scroll-offset, 0px));
    }

    .lyrics-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      text-align: left;
      font-size: calc(var(--lyplus-font-size-base) * 0.5);
      color: var(--lyplus-text-secondary);
      padding: 20px 0 50vh 0;
      margin-top: 10px;
      font-weight: 400;
      opacity: 0.8;
      transition:
        opacity 0.3s ease,
        transform 0.5s cubic-bezier(0.41, 0, 0.12, 0.99),
        filter 0.3s ease;
      transform-origin: left;
    }

    .lyrics-footer.lyrics-line {
      font-size: calc(var(--lyplus-font-size-base) * 0.5);
      padding: 20px var(--lyplus-padding-line) 50vh var(--lyplus-padding-line);
      margin-top: 0;
    }

    .lyrics-footer.active {
      opacity: 1;
      color: rgba(255, 255, 255, 0.5); /* Grey instead of primary */
    }

    .lyrics-footer.scroll-animate {
      transition: none !important;
      animation-name: lyrics-scroll;
      animation-duration: var(--scroll-duration, 280ms);
      animation-timing-function: cubic-bezier(0.41, 0, 0.12, 0.99);
      animation-fill-mode: both;
      animation-delay: var(--lyrics-line-delay, 0ms);
    }

    .lyrics-container.blur-inactive-enabled:not(.not-focused)
      .lyrics-footer:not(.active) {
      filter: blur(var(--lyplus-blur-amount));
      opacity: 0.5;
    }

    .lyrics-container.user-scrolling .lyrics-footer {
      transition: none !important;
      filter: none !important;
      opacity: 0.8 !important;
    }

    .lyrics-footer p {
      margin: 5px 0;
    }

    .lyrics-footer a {
      color: var(--lyplus-text-primary); /* Stand out using primary color */
      text-underline-offset: 2px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .lyrics-footer a:hover {
      opacity: 1;
    }

    .footer-content {
      display: flex;
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    .footer-controls {
      display: flex;
      align-items: center;
    }

    /* ==========================================================================
       HEADER & CONTROLS
       ========================================================================== */
    .lyrics-header {
      display: flex;
      padding: 10px 0;
      margin-bottom: 10px;
      gap: 10px;
      justify-content: space-between;
      align-items: center;
    }

    .lyrics-header .download-button {
      background: none;
      border: none;
      cursor: pointer;
      color: #aaa;
      padding: 0;
      margin-left: 10px;
      vertical-align: middle;
      display: inline-flex;
      align-items: center;
      font-family: inherit;
    }

    .lyrics-header .download-button:hover {
      color: rgba(255, 255, 255, 0.9);
    }

    .header-controls {
      display: flex;
      gap: 8px;
    }

    .download-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .source-switch-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      min-height: 28px;
      background: transparent;
      border-radius: 6px;
      color: #aaa;
      cursor: pointer;
      font-family: inherit;
      font-size: 11px;
      transition:
        color 0.2s ease,
        border-color 0.2s ease,
        background-color 0.2s ease,
        transform 0.12s ease;
    }

    .source-switch-btn::before {
      content: '';
      position: absolute;
      inset: -6px;
    }

    .source-switch-btn:active:not(:disabled) {
      transform: scale(0.96);
    }

    .source-switch-btn:disabled {
      cursor: default;
      opacity: 0.7;
    }

    .source-switch-svg {
      margin-right: 4px;
    }

    .source-switch-svg.is-loading {
      animation: source-switch-spin 1s linear infinite;
    }

    .control-button {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 0.8em;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      transition:
        color 0.2s,
        border-color 0.2s,
        background-color 0.2s;
      font-weight: normal;
    }

    .control-button:hover {
      color: rgba(255, 255, 255, 0.9);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .control-button.active {
      background-color: var(--lyplus-text-primary);
      border-color: var(--lyplus-text-primary);
      color: #000;
    }

    .format-select {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8em;
      margin-left: 10px;
      padding: 2px 5px;
      cursor: pointer;
      font-weight: normal;
      font-family: inherit;
    }

    .format-select:hover {
      color: rgba(255, 255, 255, 0.9);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .format-select option {
      background: #1a1a1a;
      color: #fff;
    }

    /* ==========================================================================
       TRANSLATION & ROMANIZATION
       ========================================================================== */
    .lyrics-translation-container,
    .lyrics-romanization-container {
      padding-top: 0.2em;
      opacity: 0.8;
      font-size: var(--lyplus-font-size-subtext);
      overflow-wrap: break-word;
      pointer-events: none;
      user-select: none;
      transition:
        opacity 0.3s ease,
        color 0.3s;
      font-weight: normal;
    }

    .lyrics-romanization-container {
      direction: ltr !important;
    }

    .lyrics-romanization-container.rtl-text {
      direction: rtl !important;
      text-align: right;
    }

    .lyrics-romanization-container .lyrics-syllable {
      white-space: pre-wrap;
    }

    .lyrics-translation-container {
      opacity: 0.5;
    }

    .main-line-wrapper.small {
      font-size: 0.5em;
      opacity: 0.8;
      display: block;
      margin-bottom: 0px;
    }

    .translation-line {
      font-size: 1em;
      font-weight: bold;
      display: block;
      margin-top: 0px;
      line-height: 1.1;
    }

    .romanized-line {
      font-size: 0.5em;
      color: rgba(255, 255, 255, 0.5);
      display: block;
      margin-top: 2px;
      font-weight: normal;
    }

    /* ==========================================================================
       SKELETON LOADING
       ========================================================================== */
    @keyframes skeleton-loading {
      0% {
        background-color: rgba(255, 255, 255, 0.1);
      }
      100% {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }

    .skeleton-line {
      height: 2.5em;
      margin: 20px 0;
      border-radius: 8px;
      animation: skeleton-loading 1s linear infinite alternate;
      opacity: 0.7;
      width: 60%;
    }

    .skeleton-line:nth-child(even) {
      width: 80%;
    }
    .skeleton-line:nth-child(3n) {
      width: 50%;
    }
    .skeleton-line:nth-child(5n) {
      width: 70%;
    }

    .no-lyrics {
      color: rgba(255, 255, 255, 0.5);
      font-size: 1.2em;
      text-align: center;
      padding: 2em;
      font-weight: normal;
    }

    /* ==========================================================================
       KEYFRAME ANIMATIONS
       ========================================================================== */

    @keyframes source-switch-spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Wipe animation for syllables */
    @keyframes wipe {
      from {
        background-size: 0% 100%;
        background-position: left;
      }
      to {
        background-size: calc(100% + var(--wipe-gradient-width, 0.75em)) 100%;
        background-position: left;
      }
    }

    @keyframes wipe-from-pre {
      from {
        background-size: var(--wipe-gradient-width, 0.75em) 100%;
        background-position: left;
      }
      to {
        background-size: calc(100% + var(--wipe-gradient-width, 0.75em)) 100%;
        background-position: left;
      }
    }

    @keyframes start-wipe {
      0% {
        background-size: 0% 100%;
        background-position: left;
      }
      100% {
        background-size: calc(100% + var(--wipe-gradient-width, 0.75em)) 100%;
        background-position: left;
      }
    }

    @keyframes wipe-rtl {
      from {
        background-size: 0% 100%;
        background-position: right 0%;
      }
      to {
        background-size: calc(100% + var(--wipe-gradient-width, 0.75em)) 100%;
        background-position: right 0%;
      }
    }

    @keyframes wipe-from-pre-rtl {
      from {
        background-size: var(--wipe-gradient-width, 0.75em) 100%;
        background-position: right 0%;
      }
      to {
        background-size: calc(100% + var(--wipe-gradient-width, 0.75em)) 100%;
        background-position: right 0%;
      }
    }

    @keyframes start-wipe-rtl {
      0% {
        background-size: 0% 100%;
        background-position: right 0%;
      }
      100% {
        background-size: calc(100% + var(--wipe-gradient-width, 0.75em)) 100%;
        background-position: right 0%;
      }
    }

    @keyframes pre-wipe-universal {
      from {
        background-size: 0% 100%;
        background-position: left;
      }
      to {
        background-size: var(--wipe-gradient-width, 0.75em) 100%;
        background-position: left;
      }
    }

    @keyframes pre-wipe-universal-rtl {
      from {
        background-size: 0% 100%;
        background-position: right 0%;
      }
      to {
        background-size: var(--wipe-gradient-width, 0.75em) 100%;
        background-position: right 0%;
      }
    }

    /* Character-rendered words use a separate moving gradient in front of
       their solid fill. This makes the individual glyph wipes read as one
       continuous word-level wipe. */
    @keyframes char-pre-wipe {
      from {
        background-size:
          var(--wipe-gradient-width, 0.75em) 100%,
          0% 100%;
        background-position:
          calc(-1 * var(--wipe-gradient-width, 0.75em)) 0%,
          left;
      }
      to {
        background-size:
          var(--wipe-gradient-width, 0.75em) 100%,
          0% 100%;
        background-position:
          calc(-1 * var(--wipe-gradient-half, 0.375em)) 0%,
          left;
      }
    }

    @keyframes char-start-wipe {
      from {
        background-size:
          var(--wipe-gradient-width, 0.75em) 100%,
          0% 100%;
        background-position:
          calc(-1 * var(--wipe-gradient-width, 0.75em)) 0%,
          left;
      }
      to {
        background-size:
          var(--wipe-gradient-width, 0.75em) 100%,
          100% 100%;
        background-position:
          calc(100% + var(--wipe-gradient-half, 0.375em)) 0%,
          left;
      }
    }

    @keyframes char-wipe {
      from {
        background-size:
          var(--wipe-gradient-width, 0.75em) 100%,
          0% 100%;
        background-position:
          calc(-1 * var(--wipe-gradient-half, 0.375em)) 0%,
          left;
      }
      to {
        background-size:
          var(--wipe-gradient-width, 0.75em) 100%,
          100% 100%;
        background-position:
          calc(100% + var(--wipe-gradient-half, 0.375em)) 0%,
          left;
      }
    }

    /* Gap dot animations */
    @keyframes gap-loop {
      from {
        transform: translateY(-25%) scale(1.12);
      }
      to {
        transform: translateY(-25%) scale(var(--gap-exit-scale, 0.85));
      }
    }

    @keyframes gap-ended {
      0% {
        transform: translateY(-25%) scale(var(--gap-exit-scale, 0.85));
      }
      35% {
        transform: translateY(-25%) scale(1.2);
      }
      100% {
        transform: translateY(-25%) scale(0);
      }
    }

    @keyframes fade-gap {
      from {
        background-color: var(--lyplus-text-secondary);
      }
      to {
        background-color: var(--lyplus-text-primary);
      }
    }

    /* Scroll animation — class is removed and re-added (with a forced
       reflow in between) to reliably restart the animation each time */
    @keyframes lyrics-scroll {
      from {
        transform: translate3d(0, var(--scroll-delta), 0);
      }
      to {
        transform: translate3d(0, 0, 0);
      }
    }

    /* Character grow animation — translate3d+scale3d for smooth transform,
       drop-shadow for glow */
    @keyframes grow-dynamic {
      0% {
        transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
        filter: drop-shadow(
          0 0 0
            color-mix(in srgb, var(--lyplus-lyrics-palette), transparent 100%)
        );
      }
      25%,
      30% {
        transform: translate3d(
            var(--char-offset-x, 0px),
            var(--translate-y-peak, -2px),
            0
          )
          scale3d(var(--matrix-scale, 1.1), var(--matrix-scale, 1.1), 1);
        filter: drop-shadow(
          0 0 0.1em
            color-mix(
              in srgb,
              var(--lyplus-lyrics-palette),
              transparent calc((1 - var(--shadow-intensity, 1)) * 100%)
            )
        );
      }
      75%,
      100% {
        transform: translate3d(0, var(--char-rise-y, -1.12px), 0)
          scale3d(1, 1, 1);
        filter: drop-shadow(
          0 0 0
            color-mix(in srgb, var(--lyplus-lyrics-palette), transparent 100%)
        );
      }
    }

    @keyframes rise-char {
      0% {
        transform: translate3d(0, 0, 0);
      }
      65%,
      100% {
        transform: translate3d(0, var(--char-rise-y, -1.12px), 0);
      }
    }

    @keyframes drag-char {
      0% {
        transform: translate3d(0, 0, 0);
      }
      100% {
        transform: translate3d(0, var(--char-rise-y, -1.12px), 0);
      }
    }

    @keyframes grow-static {
      0%,
      100% {
        transform: scale3d(1.01, 1.01, 1.1) translateY(-0.05%);
        text-shadow: 0 0 0
          color-mix(in srgb, var(--lyplus-lyrics-palette), transparent 100%);
      }
      30%,
      40% {
        transform: scale3d(1.1, 1.1, 1.1) translateY(-0.05%);
        text-shadow: 0 0 0.3em
          color-mix(in srgb, var(--lyplus-lyrics-palette), transparent 50%);
      }
    }

    /* Fade in animation */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 0.7;
        transform: translateY(0);
      }
    }

    /* Legacy support */
    .opposite-turn {
      text-align: right;
    }

    .singer-right {
      text-align: right;
      justify-content: flex-end;
    }

    .singer-left {
      text-align: left;
      justify-content: flex-start;
    }

    /* Legacy progress-text for backward compatibility */
    .progress-text {
      position: relative;
      display: inline-block;
      background: linear-gradient(
        to right,
        var(--lyplus-text-primary) 0%,
        var(--lyplus-text-primary) var(--line-progress, 0%),
        var(--lyplus-text-secondary) var(--line-progress, 0%),
        var(--lyplus-text-secondary) 100%
      );
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: var(--lyplus-text-secondary);
      transform: translate3d(0, 0, 0);
      will-change: background-size;
    }

    .progress-text::before {
      display: none;
    }

    .active-line {
      font-weight: bold;
    }

    .background-text {
      display: block;
      color: var(--lyplus-text-secondary);
      font-size: 0.8em;
      font-style: normal;
      margin: 0;
      flex-shrink: 0;
      line-height: 1.1;
    }

    .background-text.before {
      order: -1;
    }

    .background-text.after {
      order: 1;
    }

    .instrumental-line {
      display: inline-flex;
      align-items: baseline;
      gap: 8px;
      color: var(--lyplus-text-secondary);
      font-size: 0.9em;
      padding: 4px 10px;
      animation: fadeInUp 220ms ease;
      font-weight: normal;
    }

    .instrumental-duration {
      color: var(--lyplus-text-secondary);
      font-size: 0.8em;
    }
  `;
__decorate([
    n({ type: String })
], AmLyrics.prototype, "query", void 0);
__decorate([
    n({ type: String })
], AmLyrics.prototype, "musicId", void 0);
__decorate([
    n({ type: String })
], AmLyrics.prototype, "isrc", void 0);
__decorate([
    n({ type: String })
], AmLyrics.prototype, "ttml", void 0);
__decorate([
    n({ type: String, attribute: 'song-title' })
], AmLyrics.prototype, "songTitle", void 0);
__decorate([
    r()
], AmLyrics.prototype, "downloadFormat", void 0);
__decorate([
    n({ type: String, attribute: 'song-artist' })
], AmLyrics.prototype, "songArtist", void 0);
__decorate([
    n({ type: String, attribute: 'song-album' })
], AmLyrics.prototype, "songAlbum", void 0);
__decorate([
    n({ type: String, attribute: 'songwriters' })
], AmLyrics.prototype, "songwriters", void 0);
__decorate([
    n({ type: Number, attribute: 'song-duration' })
], AmLyrics.prototype, "songDurationMs", void 0);
__decorate([
    n({ type: String, attribute: 'highlight-color' })
], AmLyrics.prototype, "highlightColor", void 0);
__decorate([
    n({ type: String, attribute: 'font-family' })
], AmLyrics.prototype, "fontFamily", void 0);
__decorate([
    n({ type: Boolean })
], AmLyrics.prototype, "autoScroll", void 0);
__decorate([
    n({ type: Boolean })
], AmLyrics.prototype, "interpolate", void 0);
__decorate([
    r()
], AmLyrics.prototype, "showRomanization", void 0);
__decorate([
    r()
], AmLyrics.prototype, "showTranslation", void 0);
__decorate([
    n({ type: Number })
], AmLyrics.prototype, "duration", void 0);
__decorate([
    n({ type: Number, attribute: 'currenttime', hasChanged: () => false })
], AmLyrics.prototype, "currentTime", null);
__decorate([
    r()
], AmLyrics.prototype, "isLoading", void 0);
__decorate([
    r()
], AmLyrics.prototype, "lyrics", void 0);
__decorate([
    r()
], AmLyrics.prototype, "lyricsSource", void 0);
__decorate([
    r()
], AmLyrics.prototype, "availableSources", void 0);
__decorate([
    r()
], AmLyrics.prototype, "currentSourceIndex", void 0);
__decorate([
    e('.lyrics-container')
], AmLyrics.prototype, "lyricsContainer", void 0);

window.customElements.define('am-lyrics', AmLyrics);
//# sourceMappingURL=am-lyrics.js.map
