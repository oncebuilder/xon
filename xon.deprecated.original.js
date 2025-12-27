/*
 * Version: 1.0, 31.05.2012
 * by Adam Wysocki, goldpaid777@gmail.com
 * 
 * Licensed Under CC BY-NC-ND 5.0
 * 
 * Copyright (c) 2023 
 * 
*/

function a(a) {
	console.log(a); // Hello world!
}

function a2(arrayName, key) {
	if ((typeof v == "object") && (v !== null)) {
		var output = '';
		for (property in v) {
			output += property + ': ' + v[property] + '; ';
		}
		a(output);
	} else {
		a(v);
	}
}

function as() {
	console.log('Hello world!');
}

// access by calling "someArray.inArray(value);"
if (!Array.prototype.inArray) {
	Array.prototype.inArray = function (val) {
		for (key in this) {
			if (this[key] === val) {
				return true; // If you want the key of the matched value, change "true" to "key"
			}
		}
		return false;
	};
};

if (!String.prototype.replaceAll) {
	String.prototype.replaceAll = function (patern, replace) {
		var string = this;
		if (string == undefined)
			return string;
		while (string.indexOf(patern) >= 0) {
			string = string.replace(patern, replace);
		}
		return string;
	}
};

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

	Array.prototype.forEach = function (callback/*, thisArg*/) {

		var T, k;

		if (this == null) {
			throw new TypeError('this is null or not defined');
		}

		// 1. Let O be the result of calling toObject() passing the
		// |this| value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get() internal
		// method of O with the argument "length".
		// 3. Let len be toUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If isCallable(callback) is false, throw a TypeError exception. 
		// See: http://es5.github.com/#x9.11
		if (typeof callback !== 'function') {
			throw new TypeError(callback + ' is not a function');
		}

		// 5. If thisArg was supplied, let T be thisArg; else let
		// T be undefined.
		if (arguments.length > 1) {
			T = arguments[1];
		}

		// 6. Let k be 0.
		k = 0;

		// 7. Repeat while k < len.
		while (k < len) {

			var kValue;

			// a. Let Pk be ToString(k).
			//    This is implicit for LHS operands of the in operator.
			// b. Let kPresent be the result of calling the HasProperty
			//    internal method of O with argument Pk.
			//    This step can be combined with c.
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal
				// method of O with argument Pk.
				kValue = O[k];

				// ii. Call the Call internal method of callback with T as
				// the this value and argument list containing kValue, k, and O.
				callback.call(T, kValue, k, O);
			}
			// d. Increase k by 1.
			k++;
		}
		// 8. return undefined.
	};
}

window.console = console;

var xon = {
	tplSource: [],
	tplCache: [],
	tplCache2: [],
	/*** *** *** StartUP *** *** ***/
	cms: true,
	admin: true,
	creator: true,
	csrf_token: '123',
	path: '',
	CSSfiles: [],
	JSfiles: [],
	JSScripts: [],
	JSComponents: [],
	formDataToString: function (formDataName) {

	},
	formDataToString: function (formData) {
		const data = [...formData.entries()];
		const asString = data
			.map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
			.join('&');
		return asString;
	},
	/*** *** *** StartUP *** *** ***/
	commandURL: function (type, controller, option) {
		if (option == undefined) option = '';
		return xon.path + "/" + type + ".php?c=" + controller + "&o=" + option + "&csrf_token=" + xon.csrf_token
	},
	submitForm: function (formData, url, fn) {
		fetch(url, {
			body: formData,
			method: "post"
		})
			.then(response => response.json())
			.then(function (json) {
				fn(json);
			}).catch((error) => {
				console.log("Action Error: submitForm:" + error + "---->" + url);
			})
	},
	submitFormText: function (formData, url, fn) {
		fetch(url, {
			body: formData,
			method: "post"
		})
			.then(response => response.text())
			.then(function (json) {
				fn(json);
			}).catch((error) => {
				console.log("Action Error: submitForm:" + error + "---->" + url);
			})
	},
	isFunctionExist: function (functionName, context, obj) {
		if (functionName.indexOf(".") > -1) {
			var namespaces = functionName.split(".");
			var func = namespaces.pop();
			for (var i = 0; i < namespaces.length; i++) {
				if (typeof (context[namespaces[i]]) == 'undefined') {
					i = namespaces.length;
					return false;
				}
				context = context[namespaces[i]];
			}
			if (typeof (context[func]) != 'function' && context[func] != 'undefined') {
				return false;
			}
			return true;
		} else {
			if (typeof (window[functionName]) != 'function' && window[functionName] != 'undefined') {

				return false;
			}
			return true;
		}
	},
	executeFunctionByName: function (functionName, context, obj) {
		//var args = Array.prototype.slice.call(arguments).splice(2);
		if (functionName.indexOf(".") > -1) {
			var namespaces = functionName.split(".");
			var func = namespaces.pop();
			for (var i = 0; i < namespaces.length; i++) {
				if (typeof (context[namespaces[i]]) == 'undefined') {
					console.log("Function not exits: " + functionName);
					return false;
				}
				context = context[namespaces[i]];
			}
			if (typeof (context[func]) != 'function' && context[func] != 'undefined') {
				console.log("Function not exits: " + functionName);
				return false;
			}
			return context[func].apply(this, [obj]);
		} else {
			if (typeof (window[functionName]) != 'function' && window[functionName] != 'undefined') {
				console.log("Function not exits: " + functionName);
				return false;
			}
			return window[functionName](obj)
		}
	},
	lazyFunctionLoad: function (fn, window, component) {
		var winfix = setInterval(loader, 5);

		function loader() {
			if (xon.isFunctionExist(fn, window)) {
				myStopFunction();
			}
			xon.executeFunctionByName(fn, window, component);
		}

		function myStopFunction() {
			clearInterval(winfix);
		}
	},
	loadScript: function (url, fn, async) {
		if (!async) async = false;
		var script = document.createElement("script");
		script.addEventListener("load", function (event) {
			if (xon.isFunction(fn)) fn(event);
			console.log("Script: " + url + " loaded & executed");
		});
		script.src = url;
		script.async = async;
		document.getElementsByTagName("script")[0].parentNode.appendChild(script);
	},
	requireScript: function (src, fn, async) {
		if (!async) async = false;
		if (!xon.JSfiles.inArray(src)) {
			var script = xon.loadScript(src + "?" + Math.random(), fn, async);
			xon.JSfiles.push(src);
		} else {
			if (typeof (fn) == 'function') {
				fn();
			}
		}
	},
	loadStyle: function (url) {
		var link = document.createElement("link");
		link.addEventListener("load", function (event) {
			console.log("Style: " + url + " loaded & executed");
		});
		link.href = url;
		link.type = "text/css";
		link.rel = "stylesheet";
		link.media = "screen,print";

		document.getElementsByTagName("head")[0].appendChild(link);
	},
	requireStyle: function (src) {
		if (!xon.CSSfiles.inArray(src)) {
			xon.loadStyle(src + "?" + Math.random());
			xon.CSSfiles.push(src);
		}
	},
	readJSON: function (element) {
		let source = xon.byId(element);

		if (source) {
			let content = source.innerHTML.replace(/&amp;/g, '&');
			//content);
			if (xon.isJson(content)) {
				return JSON.parse(content);
			} else {
				a("Source: #" + element + " is not JSON format");
				
				return false;
			}
		} else {
			a("Source: #" + element + " is empty");
			return false;
		}
	},



	
	templateEngine: function (templateElement) {

		// Data for template
		var dataSource = templateElement.getAttribute("data-source");
		var jsonSource = xon.readJSON(templateElement.getAttribute("data-source"));

		// Template source code
		templateElement.removeAttribute("data-xon");
		templateElement.removeAttribute("data-source");

		var where = templateElement.getAttribute("data-where");
		var equal = templateElement.getAttribute("data-equal");

		var stackShow = templateElement.getAttribute("data-show");
		var stackInfo = templateElement.getAttribute("data-info");

		// If there is no items, check for item and save it as item
		if (typeof (jsonSource['items']) == 'undefined') {
			if (typeof (jsonSource['item']) != 'undefined') {
				jsonSource['items'] = [];
				jsonSource['items'].push(jsonSource['item']);
			}
		}

		// Run thru items and show replace selectors template
		if (typeof (jsonSource['items']) != 'undefined') {
			if (jsonSource.selectors) {
				for (let i = 0; i < jsonSource.selectors.length; i++) {
					if (typeof (jsonSource['items'][0][jsonSource.selectors[i]]) != 'undefined') {
						var value = jsonSource['items'][0][jsonSource.selectors[i]];
					} else {
						var value = '';
					}

					if (xon.isObject(templateElement.querySelector('[name="' + jsonSource.selectors[i] + '"]'))) {
						templateElement.querySelector('[name="' + jsonSource.selectors[i] + '"]').setAttribute("value", value);
					}
				}
			}
		}
		var ar = [];

		var templateCode = templateElement.outerHTML;
		if (typeof (jsonSource['items']) != 'undefined') {
			// Run thru items and generate array template from variables
			if (jsonSource.template) {
				if (jsonSource['items']) {
					for (let z = 0; z < jsonSource['items'].length; z++) {
						var templateTemp = templateCode;

						//a(jsonSource['items'][z]['category']);

						// Create a new element
						for (let i = 0; i < jsonSource.template.length; i++) {
							if (jsonSource['items'][z][jsonSource.template[i]] != undefined) {
								var value = jsonSource['items'][z][jsonSource.template[i]];
							} else {
								var value = '';
							}
							templateTemp = templateTemp.replaceAll("{$" + jsonSource.template[i] + "}", value);
						}

						if (where != null) {
							if (jsonSource['items'][z][where] == equal) {
								ar.push(templateTemp);
							}
						} else {
							ar.push(templateTemp);
						}

					}
				}
			}

			var left = document.querySelectorAll('[data-source=\"' + dataSource + '\"]').length;


			if (ar.length > 0) {
				//Locate prepared template string
				var previousElement = templateElement.previousElementSibling;
				if (previousElement) {
					ar.unshift(ar.pop());

					templateElement.outerHTML = ar[0];
					ar.shift()
					previousElement.insertAdjacentHTML('afterend', ar.join(""));
				} else {
					templateElement.outerHTML = ar.join("");
				}

				if (stackShow) {
					var toggles = stackShow.split(" ");
					for (let i = 0; i < toggles.length; i++) {
						var obj = document.querySelector(toggles[i]);
						xon.removeClass(obj, "d-none");
					}
				}
			}
		}

		if (ar.length == 0) {
			if (stackInfo) {
				var toggles = stackInfo.split(" ");
				for (let i = 0; i < toggles.length; i++) {
					var obj = document.querySelector(toggles[i]);
					xon.removeClass(obj, "d-none");
				}
			}
		}

		console.log('Template loaded #' + dataSource);
	},

	templateKeys: function (element) {
		var stackSource = element.getAttribute("data-source");

		var json = xon.readJSON(stackSource);

		// If there is no items, check for item and save it as item
		if (typeof (json['items']) == 'undefined') {
			if (typeof (json['item']) != 'undefined') {
				json['items'] = [];
				json['items'].push(json['item']);
			}
		}

		// Run thru items and show replace selectors template
		if (typeof (json['items']) != 'undefined') {
			// Read remplate and remove 
			element.removeAttribute("data-stack");
			element.removeAttribute("data-source");
			var template = element.outerHTML;

			// Run thru items and generate array template from variables
			var ar = [];
			if (json.template) {

				var templateKeys = [];
				Object.keys(json.template).forEach(function (key) {
					templateKeys.push(json.template[key])
				});

				if (json['items']) {
					// Create a new element
					for (let i = 0; i < templateKeys.length; i++) {
						var outerz = template;
						if (templateKeys[i] != undefined) {
							var value = templateKeys[i];
						} else {
							var value = '';
						}
						outerz = outerz.replaceAll("{$key}", value);
						outerz = outerz.replaceAll("{$value}", "{$" + value + "}");
						ar.push(outerz);
					}

				}
			}

			if (ar.length > 0) {
				//Locate prepared template string
				var previousElement = element.previousElementSibling;
				if (previousElement) {
					ar.unshift(ar.pop());

					element.outerHTML = ar[0];
					ar.shift()
					previousElement.insertAdjacentHTML('afterend', ar.join(""));
				} else {
					element.outerHTML = ar.join("");
				}
			}

		}
	},
	getXons: function (object, selector) {
		if (object) {
			return xon.byId(object).querySelectorAll(selector);
		} else {
			return document.querySelectorAll(selector);
		}
	},
	render: function (object) {
		a("Rendering: "+object);
		//a(object)

		xon.getXons(object, '[data-xon="&pretemplate"]').forEach(function (element) {
			xon.templateEngine(element);
		});

		xon.getXons(object, '[data-xon="&templatekeys"]').forEach(function (element) {
			xon.templateKeys(element);
		});

		xon.getXons(object, '[data-xon="&template"]').forEach(function (element) {
			xon.templateEngine(element);
		});

		xon.getXons(object, '[data-xon][data-component]').forEach(function (element) {
			var xonOption = element.getAttribute("data-xon");
			var component = element.getAttribute("data-component");

			// Check if this is component
			if (component != null && component) {
				if (!element.getAttribute("data-binded")) {
					element.setAttribute("data-binded", true);
					xon.requireScript(xon.path + "/js/xon." + component + ".js", function () {
						if (xon.isFunctionExist("xon." + component + ".init", window)) {
							xon.executeFunctionByName("xon." + component + ".init", window, element);
						} else {
							xon.lazyFunctionLoad("xon." + component + ".init", window, element);
						}
					});
				}
			} else if (xonOption == '&on') {

			}
		});
		/****
		 * 	[data-xon = {&on[event] <= on DOM event}]
		 *  [data-require = {script path to load}]
		 * */
		xon.getXons(object, '[data-require]').forEach(function (require) {
			var xonOption = require.getAttribute("data-xon");

			if (xonOption == '&onmouseover') {
				require.addEventListener('mouseover', function (e) {
					e.preventDefault();
					if (!require.getAttribute("data-binded2")) {
						require.setAttribute("data-binded2", true);

						var src = require.getAttribute("data-require");
						var load = require.getAttribute("data-load");
						xon.requireScript(src, function () {
							if (xon.isFunctionExist(load, window)) {
								xon.executeFunctionByName(load, window, require);
							} else {
								xon.lazyFunctionLoad(load, window, require);
							}
						});
					}
				}, false);
			} else {
				if (!require.getAttribute("data-binded2")) {
					require.setAttribute("data-binded2", true);
					var src = require.getAttribute("data-require");
					var load = require.getAttribute("data-load");

					xon.requireScript(src, function () {
						if (xon.isFunctionExist(load, window)) {
							xon.executeFunctionByName(load, window, require);
						} else {
							xon.lazyFunctionLoad(load, window, require);
						}
					});
				}
			}
		});
		/****
		 * 	[data-xon = {&on[event] <= event}]
		 *  [data-trigger = {DOM element that will be triggering event}]
		 *  [data-event = {global event <= to execute}]
		 * */
		xon.getXons(object, '[data-xon][data-trigger][data-event]').forEach(function (element) {
			var xonz = element.getAttribute("data-xon").substring(3);
			var eventName = element.getAttribute("data-event");
			var trigger = element.getAttribute("data-trigger");

			element.addEventListener(xonz, function (e) {
				let form = document.querySelector(trigger);
				var event = new CustomEvent(eventName);
				form.dispatchEvent(event);
			}, false);
		});

		/****
		 * 	[data-xon = {&on[click] <= event}]
		 *  [data-command = {functionname <= to execute}]
		 *  [data-query = {.selector <= selector from diffrent object}]
		 *  [data-command = {functionname functionname1 <= to execute}]
		 *  [data-queries = {#selector .selector <= selectors from diffrent object linked with commands}]
		 * */
		if (object) {
			var stacks = xon.byId(object).querySelectorAll('[data-xon]');
		} else {
			var stacks = document.querySelectorAll('[data-xon]');
		}
		stacks.forEach(function (element) {
			var xonOption = element.getAttribute("data-xon");

			if (xonOption != '&tpl' && xonOption != '&template' && xonOption != '&pretemplate' && xonOption != '&pretpl' && xonOption != 'undefined ' && xonOption != null && xonOption != '&bind') {

				if (xonOption == '&trigsger') {
					element.onclick = function () {
						let form = document.getElementById(this.getAttribute("data-trigger-submit"));
						if (form) {
							form.querySelector('[type="submit"]').click();
						}

						let show = this.getAttribute("data-target-show");
						if (show) xon.show(document.getElementById(this.getAttribute("data-target-show")));

						let hide = this.getAttribute("data-target-hide");
						if (hide) xon.hide(document.getElementById(this.getAttribute("data-target-hide")));
					};
				} else if (xonOption.indexOf("&on") == 0) {
					// Fetch Data to render
					var event = xonOption.substring(3);
					var query = element.getAttribute("data-query");
					var queries = element.getAttribute("data-queries");
					var command = element.getAttribute("data-command");
					var commands = element.getAttribute("data-commands");
					if (command || commands) {
						//a(event + "\nSingle:" + query + " -> " + command + "\nMultiple:" + queries + " -> " + commands);

						if (query) {// Single query for single command
							var queries = element.querySelectorAll(query);
							if (queries) {
								queries.forEach(function (queried) {
									queried.addEventListener(event, function (e) {
										e.preventDefault();
										// Make sure it not binds again
										element.setAttribute("data-binded", true);
										// Executing comand
										xon.executeFunctionByName(element.getAttribute("data-command"), window, this);
										// Just for debug
										a("Execute function: " + element.getAttribute("data-command"));
									}, false);
								});
							}
						} else if (queries) {//Multiple queries for multiple commands
							if (commands != '' && commands != null) {
								var queries = element.getAttribute("data-queries");
								commands = commands.split(" ");
								queries = queries.split(" ");
								for (let i = 0; i < queries.length; i++) {
									var query = element.querySelectorAll(queries[i]);
									query.forEach(function (queried) {
										///a(queried.hasAttribute("data-ignored"));
										if (!queried.hasAttribute("data-binded")) {
											queried.addEventListener(event, function (e) {
												e.preventDefault();
												// Make sure it not binds again
												// Executing comand
												xon.executeFunctionByName(commands[i], window, this);
												// Just for debug
												a("Execute function: " + commands[i]);
											}, false);
											queried.setAttribute("data-binded", true);
										}
									});

									/*								
									let x = 0;
									query.forEach(function (queried) {
										a(queried.hasAttribute("data-ignored"));
										if (x > 0) {
											if (!queried.hasAttribute("data-binded")) {
												queried.addEventListener(event, function (e) {
													e.preventDefault();
													// Make sure it not binds again
													// Executing comand
													xon.executeFunctionByName(commands[i], window, this);
													// Just for debug
													a("Execute function: " + commands[i]);
												}, false);
												queried.setAttribute("data-binded", true);
											}
										}
										if (x == 0) { x++; }
									});*/

								}

							}
						} else {//No query or queries
							if (xonOption == '&onload') {
								// Executing comand
								xon.executeFunctionByName(element.getAttribute("data-command"), window, element);
								// Just for debug
								a("Execute function: " + element.getAttribute("data-command"));
							} else {
								if (!element.getAttribute("data-bindedd") && element.getAttribute("data-command") != null) {
									element.addEventListener(event, function (e) {
										e.preventDefault();
										// Executing comand
										xon.executeFunctionByName(element.getAttribute("data-command"), window, this);
										// Just for debug
										a("Execute function: " + element.getAttribute("data-command"));
									}, false);
									// Make sure it not binds again
									element.setAttribute("data-bindedd", true);
								}
							}
						}
					}
				}
			}
		});
	},
	microTime: 0,
	microTimer: function (compare) {
		if (compare) xon.microTime = new Date().getTime() / 1000;
		else return (new Date().getTime() / 1000) - xon.microTime;
	},
	init: function () {
		xon.microTimer(true);
		// lazy IMG
		let lazyImages = [].slice.call(document.querySelectorAll("[data-lazy]"));
		let active = false;

		// Load IMG files as background
		const backgrounds = document.querySelectorAll("[data-background]");
		for (var i = 0; i < backgrounds.length; i++) {
			let element = backgrounds[i].getAttribute("data-background");
			if (element !== undefined) backgrounds[i].style.backgroundImage = "url('" + element + "')";
		}
		const lazyLoad = function () {
			if (active === false) {
				active = true;
				setTimeout(function () {
					lazyImages.forEach(function (lazyImage) {
						if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
							lazyImage.style.backgroundImage = 'url(' + lazyImage.dataset.lazy + ')';
							console.log(lazyImage.dataset.lazy);
							//alert(lazyImage.dataset.lazy);
							//lazyImage.srcset = lazyImage.dataset.srcset;
							//lazyImage.classList.remove("lazy");

							lazyImages = lazyImages.filter(function (image) {
								return image !== lazyImage;
							});

							if (lazyImages.length === 0) {
								document.removeEventListener("scroll", lazyLoad);
								window.removeEventListener("resize", lazyLoad);
								window.removeEventListener("orientationchange", lazyLoad);
							}
						}
					});
					active = false;
				}, 200);
			}
		};

		document.addEventListener("scroll", lazyLoad);
		window.addEventListener("resize", lazyLoad);
		window.addEventListener("orientationchange", lazyLoad);

		xon.render();

		if (false) {
			// if not rendered, render it
		}
	},
	/****
	 * 
	 * 	URL Prase functions
	 * 
	 * */
	URLEncode: function (object) {
		var encodedString = '';
		for (var prop in object) {
			if (object.hasOwnProperty(prop)) {
				if (encodedString.length > 0) {
					encodedString += '&';
				}
				encodedString += encodeURI(prop + '=' + object[prop]);
			}
		}
		return encodedString;
	},
	getURLParam: function () {
		var strHref = window.location.pathname;//
		var strQueryString = strHref.substr(1).toLowerCase();
		if (strQueryString.lastIndexOf('/') > 0) strQueryString = strQueryString.substr(0, strQueryString.lastIndexOf('/'));
		return strQueryString;
	},
	getURLParamValue: function (sParam) {
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;

		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	},
	getURLParamValue2: function (sParam) {
		/**
		 * Get the URL parameters
		 * source: https://css-tricks.com/snippets/javascript/get-url-variables/
		 * @param  {String} url The URL
		 * @return {Object}     The URL parameters
		 */
		var getParams = function (url) {
			var params = {};
			var parser = document.createElement('a');
			parser.href = url;
			var query = parser.search.substring(1);
			var vars = query.split('&');
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split('=');
				params[pair[0]] = decodeURIComponent(pair[1]);
			}
			return params;
		};
	},
	/****
	 * 
	 * 	DOM Selectors
	 * 	               ⢦⢄⣀⡀
			  ⢸⠀⠀⠈⠑⠢⣀⠀⠀⠀⡠⢒⠶⡀⠀⠀⠀⠀⠀⣶⡄⠀⠀⠀⠀⣼
			  ⢸⠀⠀⠀⠀⠀⠀⠣⡀⠀⡰⠁⠀⠈⠢⡀⠀⠀⢠⡇⠘⢄⠀⠀⣸⠎
			  ⢸⠀⠀⠀⠀⠀⠀⠀⡇⢰⠁⠀⠀⠀⠀⠱⡀⠀⣾⠁⠀⠀⠣⢼⠁
			  ⠘⡄⠀⠀⠀⠀⠀⠀⡇⢎⠀⠀⠀⠀⠀⠀⡇⢀⡇⠀⠀⠀⠀⢸
	⠀              ⢇⠀⢀⣀⡠⠔⠒⠁⠈⢆⠀⠀⠀⠀⡠⠃⡜⠀⠀⠀⠀⠀⢸
			  ⠀⢸⠒⠁⠀⠀⠀⠀⠀⠀⠀⠉⠑⠒⠉⠀⠸⠀⠀⠀⠀⠀⠀⢸
			  ⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁
	 * */
	by: function (s) {
		return document.querySelector(s);
	},
	byAll: function (s) {
		return document.querySelectorAll(s);
	},
	byId: function (s) {
		return document.getElementById(s);
	},
	byClass: function (s) {
		return document.getElementsByClassName(s);
	},
	byTagName: function (s) {
		return document.getElementsByTagName(s);
	},
	byContains: function (el, text) {
		var elements = document.querySelectorAll(el);
		return Array.prototype.filter.call(elements, function (element) {
			return RegExp(text).test(element.textContent);
		});
	},
	/****
	 * 
	 * 	DOM Animation
	 * 	               ⢦⢄⣀⡀
			  ⢸⠀⠀⠈⠑⠢⣀⠀⠀⠀⡠⢒⠶⡀⠀⠀⠀⠀⠀⣶⡄⠀⠀⠀⠀⣼
			  ⢸⠀⠀⠀⠀⠀⠀⠣⡀⠀⡰⠁⠀⠈⠢⡀⠀⠀⢠⡇⠘⢄⠀⠀⣸⠎
			  ⢸⠀⠀⠀⠀⠀⠀⠀⡇⢰⠁⠀⠀⠀⠀⠱⡀⠀⣾⠁⠀⠀⠣⢼⠁
			  ⠘⡄⠀⠀⠀⠀⠀⠀⡇⢎⠀⠀⠀⠀⠀⠀⡇⢀⡇⠀⠀⠀⠀⢸
	⠀              ⢇⠀⢀⣀⡠⠔⠒⠁⠈⢆⠀⠀⠀⠀⡠⠃⡜⠀⠀⠀⠀⠀⢸
			  ⠀⢸⠒⠁⠀⠀⠀⠀⠀⠀⠀⠉⠑⠒⠉⠀⠸⠀⠀⠀⠀⠀⠀⢸
			  ⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁
	 * */
	animate: function (el) {
		el.animate([
			{
				transform: 'translateY(-1000px) scaleY(2.5) scaleX(.2)',
				transformOrigin: '50% 0',
				filter: 'blur(40px)',
				opacity: 0
			},
			{
				transform: 'translateY(0) scaleY(1) scaleX(1)',
				transformOrigin: '50% 50%',
				filter: 'blur(0)',
				opacity: 1
			}
		], 1000);
	},
	show: function (el) {
		el.style.display = 'block';
	},
	hide: function (el) {
		el.style.display = 'none';
	},
	toggle: function (el) {

		a(el)
		if (el.ownerDocument.defaultView.getComputedStyle(el, null).display === 'none') {
			el.style.display = '' | 'inline' | 'inline-block' | 'inline-table' | 'block';
		} else {
			el.style.display = 'none';
		}
	},
	fadeIn: function (el) {
		el.style.opacity = 0;
		var last = +new Date();
		var tick = function () {
			el.style.opacity = +el.style.opacity + (new Date() - last) / 400;
			last = +new Date();

			if (+el.style.opacity < 1) {
				(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
			}
		};

		tick();
	},
	fadeOut: function (el) {
		el.style.opacity = 1;
		var last = +new Date();
		var tick = function () {
			el.style.opacity = +el.style.opacity + (new Date() - last) / 400;
			last = +new Date();

			if (+el.style.opacity > 0) {
				(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
			}
		};

		tick();
	},
	fadeTo: function (el) {
		el.style.transition = 'opacity 3s'; // assume 'slow' equals 3 seconds
		el.style.opacity = '0.15';
	},
	fadeToggle: function (el) {
		el.style.transition = 'opacity 3s';
		var opacity = el.ownerDocument.defaultView.getComputedStyle(el, null);
		if (opacity === '1') {
			el.style.opacity = '0';
		} else {
			el.style.opacity = '1';
		}
	},
	slideUp: function (el) {
		const originHeight = '100px';
		el.style.transition = 'height 3s';
		// slideUp
		el.style.height = '0px';
	},
	slideDown: function (el) {
		const originHeight = '100px';
		el.style.transition = 'height 3s';
		// slideDown
		el.style.height = originHeight;
	},
	slideToggle: function (el) {
		const originHeight = '100px';
		el.style.transition = 'height 3s';
		var height = el.ownerDocument.defaultView.getComputedStyle(el, null);
		if (parseInt(height, 10) === 0) {
			el.style.height = originHeight;
		} else {
			el.style.height = '0px';
		}
	},
	scrollTo: function () {
		$.fn.scrollTo = function (target, options, callback) {
			if (typeof options == 'function' && arguments.length == 2) { callback = options; options = target; }
			var settings = $.extend({
				scrollTarget: target,
				offsetTop: 50,
				duration: 500,
				easing: 'swing'
			}, options);
			return this.each(function () {
				var scrollPane = $(this);
				var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
				var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
				scrollPane.animate({ scrollTop: scrollY }, parseInt(settings.duration), settings.easing, function () {
					if (typeof callback == 'function') { callback.call(this); }
				});
			});
		}
	},
	scrollTop: function () {
		return (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
	},
	scrollToTop: function () {
		document.body.scrollTop = 0; // For Safari
		document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
	},
	/****
	 * 
	 * 	DOM Manimulation
	 * 	               ⢦⢄⣀⡀
			  ⢸⠀⠀⠈⠑⠢⣀⠀⠀⠀⡠⢒⠶⡀⠀⠀⠀⠀⠀⣶⡄⠀⠀⠀⠀⣼
			  ⢸⠀⠀⠀⠀⠀⠀⠣⡀⠀⡰⠁⠀⠈⠢⡀⠀⠀⢠⡇⠘⢄⠀⠀⣸⠎
			  ⢸⠀⠀⠀⠀⠀⠀⠀⡇⢰⠁⠀⠀⠀⠀⠱⡀⠀⣾⠁⠀⠀⠣⢼⠁
			  ⠘⡄⠀⠀⠀⠀⠀⠀⡇⢎⠀⠀⠀⠀⠀⠀⡇⢀⡇⠀⠀⠀⠀⢸
	⠀              ⢇⠀⢀⣀⡠⠔⠒⠁⠈⢆⠀⠀⠀⠀⡠⠃⡜⠀⠀⠀⠀⠀⢸
			  ⠀⢸⠒⠁⠀⠀⠀⠀⠀⠀⠀⠉⠑⠒⠉⠀⠸⠀⠀⠀⠀⠀⠀⢸
			  ⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁
	 * */
	hasClass: function (el, className) {
		if (el.classList) return el.classList.contains(className);
		else return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
	},
	addClass: function (el, className) {
		let addClass = function (el) {
			if (el.classList) el.classList.add(className);
			else el.className += ' ' + className;
		}
		if (xon.isElement(el)) {
			addClass(el);
		} else {
			el.forEach(function (el) {
				addClass(el);
			});
		}
	},
	removeClass: function (el, className) {
		let removeClass = function (el) {
			if (el.classList) el.classList.remove(className);
			else el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
		if (xon.isElement(el)) {
			removeClass(el);
		} else {
			el.forEach(function (el) {
				removeClass(el);
			});
		}
	},
	toggleClass: function (el, className) {
		if (el.classList) {
			el.classList.toggle(className);
		} else {
			var classes = el.className.split(' ');
			var existingIndex = classes.indexOf(className);

			if (existingIndex >= 0) classes.splice(existingIndex, 1);
			else classes.push(className);
			el.className = classes.join(' ');
		}
	},
	removeElement: function (el) {
		let removeElement = function (el) {
			el.parentNode.removeChild(el);
		}
		if (xon.isElement(el)) {
			removeElement(el);
		} else {
			el.forEach(function (el) {
				removeElement(el);
			});
		}
	},
	removeId: function (id) {
		var el = document.getElementById(id)
		el.parentNode.removeChild(el);
	},
	/****
	* 
	* 	DOM Manipulation
	* 	               ⢦⢄⣀⡀
	  ⢸⠀⠀⠈⠑⠢⣀⠀⠀⠀⡠⢒⠶⡀⠀⠀⠀⠀⠀⣶⡄⠀⠀⠀⠀⣼
	  ⢸⠀⠀⠀⠀⠀⠀⠣⡀⠀⡰⠁⠀⠈⠢⡀⠀⠀⢠⡇⠘⢄⠀⠀⣸⠎
	  ⢸⠀⠀⠀⠀⠀⠀⠀⡇⢰⠁⠀⠀⠀⠀⠱⡀⠀⣾⠁⠀⠀⠣⢼⠁
	  ⠘⡄⠀⠀⠀⠀⠀⠀⡇⢎⠀⠀⠀⠀⠀⠀⡇⢀⡇⠀⠀⠀⠀⢸
	⠀              ⢇⠀⢀⣀⡠⠔⠒⠁⠈⢆⠀⠀⠀⠀⡠⠃⡜⠀⠀⠀⠀⠀⢸
	  ⠀⢸⠒⠁⠀⠀⠀⠀⠀⠀⠀⠉⠑⠒⠉⠀⠸⠀⠀⠀⠀⠀⠀⢸
	  ⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁
	* */
	swapElements: function (el, el2) {
       //check if its tr element or its normal element then swap
	   if (xon.isElement(el) && xon.isElement(el2)) {
            var parent = el.parentNode;
            parent.insertBefore(el2, el);
            parent.insertBefore(el, el2);
       }
	   // check if its tr element
	   else if (el.tagName.toLowerCase() === 'tr' && el2.tagName.toLowerCase() === 'tr') {
            var parent = el.parentNode;
            parent.insertBefore(el2, el);
            parent.insertBefore(el, el2);
       }
    },
	replace: function (el, htmlString) {
        el.outerHTML = htmlString;
    },
    before: function (el, htmlString) {
        el.insertAdjacentHTML('beforebegin', htmlString);
    },
    after: function (el, htmlString) {
        el.insertAdjacentHTML('afterend', htmlString);
    },
    append: function (parent, el) {
        parent.appendChild(el);
    },
    appendStr: function (el, htmlString) {
        el.insertAdjacentHTML('beforeend', htmlString);
    },
    preappend: function (el, htmlString) {
        el.insertAdjacentHTML('beforebegin', htmlString);
    },
    empty: function (el) {
        while (el.firstChild) el.removeChild(el.firstChild);
    },
	isEmpty: function (el) {
		return !el.hasChildNodes()
	},
	clone: function (el) {
		return el.cloneNode(true);
	},
	found: function (el, selector) {
		return el.querySelector(selector) !== null;
	},
	replaceWith: function (el, string) {
		el.outerHTML = string;
	},
	parseHTML: function (str) {
		var parseHTML = function (str) {
			var tmp = document.implementation.createHTMLDocument();
			tmp.body.innerHTML = str;
			return tmp.body.children;
		};

		return parseHTML(htmlString);
	},
	parseHTML2: function (str) {
		const context = document.implementation.createHTMLDocument();

		// Set the base href for the created document so any parsed elements with URLs
		// are based on the document's URL
		const base = context.createElement('base');
		base.href = document.location.href;
		context.head.appendChild(base);

		context.body.innerHTML = str;
		return context.body.children;
	},
	/****
	 * 
	 * 	Some of the utilities may be usefull
	 * ⠀⡀
	⠀⠀               ⠒⡗⠒⠒⠒⠀⠀⠠⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀
	⠀⠀⠀               ⡇⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⢠⠀⠀⣄⠀⠀⠀⠀⠀⠀⡜
	⠀⠀               ⢀⣇⣀⣀⠤⠤⠄⠀⢣⠀⠀⠀⠀⡇⢣⢸⠈⡆⠀⠀⠀⠀⢰⠁
	⠀⠀               ⢰⠁⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⢀⠇⠘⣼⠀⠸⡀⠀⠀⢀⠇
	⠀⠀               ⢸⠀⠀⠀⠀⠀⠀⠀⠘⡄⠀⡠⠊⠀⠀⢹⠀⠀⠱⡀⢀⠎
	⠀⠀               ⢸⠀⠀⠀⠀⠀⠀⠀⠀⠈⠊⠀⠀⠀⠀⠀⠀⠀⠀⠱⣸
	⠀⠀               ⠀⠃
	⠀⠀⠀⠀⠀               ⠀⣀⠀⢀⣀⣀⣀⣀⡀⠀⠀⠀⠀⢀⠤⣀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⡀
	⠀⠀⠀               ⠀⢠⠊⠀⠀⠀⠀⠀⢠⠀⠁⠀⠀⠀⢠⠊⠀⠀⢱⠀⢀⠀⠈⡎⢆⠀⠀⠀⠀⢀⡇
	⠀⠀               ⡇⠀⠀⠀⠀⠀⠀⢸⠀⠀⢀⠀⠀⠈⠀⡄⠀⢸⠀⠀⠱⣀⠇⠀⠱⡀⠀⡔⠁
	⠀⠀⠀⠀               ⠈⠑⠤⠤⠤⠄⢄⡎⠀⠀⠀⡇⠀⠀⠀⠑⢄⡎⠀⠀⠀⢫⡆⠀⠀⠈⢆⢱
	⠀⠀⠀⠀⠀⠀               ⠀⠀⠀⠀⠈⠇⠀⠀⠀⠙⠂⠀⠀⠀⠀⠀⠀⠀⠀⠈⠃⠀⠀⠀⠀⠹
	 * */
	isArray: function (arr) {
		return Array.isArray(arr);
	},
	isWindow: function (obj) {
		return obj !== null && obj !== undefined && obj === obj.window;
	},
	isElement: function (el) {
		if (typeof (el) != 'undefined' && el != null) {
			return el instanceof Element || el instanceof HTMLDocument;
		}
	},
	inArray: function (arr, item) {
		return arr.indexOf(item) > -1;
	},
	isNumeric: function (n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},
	isFunction: function (obj) {
		if (typeof obj === 'function') {
			return true;
		}
		var type = Object.prototype.toString(obj);
		return type === '[object Function]' || type === '[object GeneratorFunction]';
	},
	isEmptyObject: function (obj) {
		return Object.keys(obj).length === 0;
	},
	isPlainObject: function (obj) {
		if (typeof (obj) !== 'object' || obj.nodeType || obj !== null && obj !== undefined && obj === obj.window) {
			return false;
		}

		if (obj.constructor &&
			!Object.prototype.hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
			return false;
		}
		return true;
	},
	isObject: function (val) {
		if (val === null) { return false; }
		return ((typeof val === 'function') || (typeof val === 'object'));
	},
	isJson: function (str) {
		try {
			JSON.parse(str);
			return true;
		} catch (e) {
			return false;
		}
	},
	forEach: function (a) {
		var l = this.length;
		for (var i = 0; i < l; i++) a(this[i], i)
	},
	map: function (a) {
		var l = this.length;
		var array = new Array(l), i = 0;
		for (; i < l; i++) { array[i] = a(this[i], i) }
		return array;
	},
	removeKey: function (arrayName, key) {
		var x;
		var tmpArray = new Array();
		for (x in arrayName) {
			if (x != key && typeof (arrayName[x]) !== 'function') { tmpArray.push(arrayName[x]); }
		}
		return tmpArray;
	},
	/****
	* 
	* 	Helpers
	* 	               ⢦⢄⣀⡀
		  ⢸⠀⠀⠈⠑⠢⣀⠀⠀⠀⡠⢒⠶⡀⠀⠀⠀⠀⠀⣶⡄⠀⠀⠀⠀⣼
		  ⢸⠀⠀⠀⠀⠀⠀⠣⡀⠀⡰⠁⠀⠈⠢⡀⠀⠀⢠⡇⠘⢄⠀⠀⣸⠎
		  ⢸⠀⠀⠀⠀⠀⠀⠀⡇⢰⠁⠀⠀⠀⠀⠱⡀⠀⣾⠁⠀⠀⠣⢼⠁
		  ⠘⡄⠀⠀⠀⠀⠀⠀⡇⢎⠀⠀⠀⠀⠀⠀⡇⢀⡇⠀⠀⠀⠀⢸
	⠀              ⢇⠀⢀⣀⡠⠔⠒⠁⠈⢆⠀⠀⠀⠀⡠⠃⡜⠀⠀⠀⠀⠀⢸
		  ⠀⢸⠒⠁⠀⠀⠀⠀⠀⠀⠀⠉⠑⠒⠉⠀⠸⠀⠀⠀⠀⠀⠀⢸
		  ⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁
	* */
	imageError: function (image, src) {
		setTimeout(function () { image.src = src }, 10);
	},
}

document.addEventListener("DOMContentLoaded", function () {
	xon.init();
});
