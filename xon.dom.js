(function (xon) {
    'use strict';

    if (!xon) {
        xon = window.xon = {};
    }

    xon.dom = (function () {
        const selectorCache = new Map();
        const elementCache = new WeakMap();
        const animationCache = new WeakMap();
        const eventCache = new WeakMap();

        let lastCleanup = Date.now();
        const cleanupInterval = 30000;
        let rafId = null;
        const animationQueue = [];
        const transitionQueue = [];
        let mutationObserver = null;
        let observerInitialized = false;

        let config = {
            debug: false,
            cacheEnabled: true,
            domCacheTTL: 5000,
            selectorCacheSize: 100,
            animationDuration: 300,
            useRAF: true,
            autoCleanup: true,
            eventDelegation: true
        };

        const dom = {
            config(newConfig) {
                const oldAutoCleanup = config.autoCleanup;
                config = { ...config, ...newConfig };

                if (config.autoCleanup && !observerInitialized && document.body) {
                    this._initMutationObserver();
                    observerInitialized = true;
                } else if (!config.autoCleanup && observerInitialized) {
                    this._disableMutationObserver();
                    observerInitialized = false;
                }

                if (config.debug) {
                    console.log('DOM Configuration updated', config);
                }
                return this;
            },

            init() {
                if (config.debug) {
                    console.log('DOM Initializing...');
                }

                if (config.useRAF) {
                    this._animationLoop();
                }

                if (config.autoCleanup && document.body) {
                    this._initMutationObserver();
                    observerInitialized = true;
                }

                return this;
            },

            query(selector, context = document) {
                if (!selector || typeof selector !== 'string') {
                    return null;
                }

                if (config.cacheEnabled) {
                    const cacheKey = `${selector}|${context === document ? 'doc' : 'ctx'}`;
                    const cached = selectorCache.get(cacheKey);

                    if (cached && Date.now() - cached.timestamp < config.domCacheTTL) {
                        return cached.element;
                    }
                }

                const element = context.querySelector(selector);

                if (config.cacheEnabled && element) {
                    const cacheKey = `${selector}|${context === document ? 'doc' : 'ctx'}`;
                    selectorCache.set(cacheKey, {
                        element,
                        timestamp: Date.now()
                    });

                    if (selectorCache.size > config.selectorCacheSize) {
                        const firstKey = selectorCache.keys().next().value;
                        selectorCache.delete(firstKey);
                    }
                }

                if (config.debug && !element) {
                    console.warn('No element found for selector:', selector);
                }

                return element;
            },

            queryAll(selector, context = document) {
                if (!selector || typeof selector !== 'string') {
                    return [];
                }

                if (config.cacheEnabled) {
                    const cacheKey = `all:${selector}|${context === document ? 'doc' : 'ctx'}`;
                    const cached = selectorCache.get(cacheKey);

                    if (cached && Date.now() - cached.timestamp < config.domCacheTTL) {
                        return cached.elements;
                    }
                }

                const elements = context.querySelectorAll(selector);

                if (config.cacheEnabled && elements.length > 0) {
                    const cacheKey = `all:${selector}|${context === document ? 'doc' : 'ctx'}`;
                    selectorCache.set(cacheKey, {
                        elements,
                        timestamp: Date.now()
                    });
                }

                if (config.debug && elements.length === 0) {
                    console.warn('No elements found for selector:', selector);
                }

                return elements;
            },

            getById(id) {
                return document.getElementById(id);
            },

            getByClass(className, context = document) {
                return context.getElementsByClassName(className);
            },

            getByTag(tagName, context = document) {
                return context.getElementsByTagName(tagName);
            },

            create(tag, attributes = {}, children = []) {
                const element = document.createElement(tag);

                this.setAttributes(element, attributes);

                if (Array.isArray(children)) {
                    children.forEach(child => {
                        if (child instanceof Node) {
                            element.appendChild(child);
                        } else if (typeof child === 'string') {
                            element.appendChild(document.createTextNode(child));
                        }
                    });
                } else if (typeof children === 'string') {
                    element.innerHTML = children;
                }

                return element;
            },

            setAttributes(element, attributes) {
                if (!element || !attributes) return;

                Object.entries(attributes).forEach(([key, value]) => {
                    if (key === 'style' && typeof value === 'object') {
                        Object.assign(element.style, value);
                    } else if (key.startsWith('on') && typeof value === 'function') {
                        const eventName = key.substring(2).toLowerCase();
                        this.on(element, eventName, value);
                    } else if (value === null || value === undefined) {
                        element.removeAttribute(key);
                    } else {
                        element.setAttribute(key, value);
                    }
                });
            },

            getStyle(element, property) {
                if (!element) return '';
                return window.getComputedStyle(element)[property];
            },

            setStyle(element, styles) {
                if (!element || !styles) return;
                Object.assign(element.style, styles);
            },

            addClass(className, elementOrSelector) {
                const elements = this._resolveElements(elementOrSelector);
                let count = 0;

                elements.forEach(el => {
                    if (el && el.classList) {
                        el.classList.add(className);
                        count++;
                    }
                });

                return count;
            },

            removeClass(className, elementOrSelector) {
                const elements = this._resolveElements(elementOrSelector);
                let count = 0;

                elements.forEach(el => {
                    if (el && el.classList) {
                        el.classList.remove(className);
                        count++;
                    }
                });

                return count;
            },

            toggleClass(className, elementOrSelector, force = undefined) {
                const elements = this._resolveElements(elementOrSelector);
                let count = 0;

                elements.forEach(el => {
                    if (el && el.classList) {
                        el.classList.toggle(className, force);
                        count++;
                    }
                });

                return count;
            },

            hasClass(element, className) {
                return element?.classList?.contains(className) || false;
            },

            classIf(element, className, condition) {
                if (condition) {
                    this.addClass(className, element);
                } else {
                    this.removeClass(className, element);
                }
            },

            setText(element, text) {
                if (element) {
                    element.textContent = text || '';
                }
            },

            setHTML(element, html, sanitize = false) {
                if (!element) return;

                if (sanitize && xon.security?.sanitizeHTML) {
                    element.innerHTML = xon.security.sanitizeHTML(html);
                } else {
                    element.innerHTML = html || '';
                }
            },

            getRect(element) {
                if (!element) return null;

                const rect = element.getBoundingClientRect();
                return {
                    top: rect.top,
                    right: rect.right,
                    bottom: rect.bottom,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    x: rect.x,
                    y: rect.y,
                    centerX: rect.left + rect.width / 2,
                    centerY: rect.top + rect.height / 2,
                    isVisible: rect.top < window.innerHeight && rect.bottom > 0
                };
            },

            getAbsolutePosition(element) {
                const rect = element.getBoundingClientRect();
                return {
                    x: rect.left + window.scrollX,
                    y: rect.top + window.scrollY,
                    width: rect.width,
                    height: rect.height
                };
            },

            isVisible(element, threshold = 0.1) {
                if (!element) return false;

                const rect = element.getBoundingClientRect();
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                const windowWidth = window.innerWidth || document.documentElement.clientWidth;

                const vertInView = (rect.top <= windowHeight) && (rect.top + rect.height * threshold >= 0);
                const horInView = (rect.left <= windowWidth) && (rect.left + rect.width * threshold >= 0);

                return vertInView && horInView;
            },

            isInViewport(element, threshold = 0) {
                if (!element) return false;

                const rect = element.getBoundingClientRect();
                return (
                    rect.top >= -threshold &&
                    rect.left >= -threshold &&
                    rect.bottom <= (window.innerHeight + threshold) &&
                    rect.right <= (window.innerWidth + threshold)
                );
            },

            show(element, displayType = 'block') {
                if (!element) return;

                if (!element._originalDisplay) {
                    element._originalDisplay = this.getStyle(element, 'display') || displayType;
                }

                element.style.display = element._originalDisplay === 'none' ? displayType : element._originalDisplay;
            },

            hide(element) {
                if (!element) return;

                if (!element._originalDisplay) {
                    element._originalDisplay = this.getStyle(element, 'display');
                }

                element.style.display = 'none';
            },

            toggle(element, force = undefined) {
                if (!element) return false;

                const isVisible = element.style.display !== 'none';
                const shouldShow = force !== undefined ? force : !isVisible;

                if (shouldShow) {
                    this.show(element);
                } else {
                    this.hide(element);
                }

                return shouldShow;
            },

            fadeIn(element, duration = config.animationDuration, callback = null) {
                if (!element) return;

                this.show(element);

                element.style.opacity = '0';
                element.style.transition = `opacity ${duration}ms ease`;

                element.offsetHeight;

                element.style.opacity = '1';

                this._afterTransition(element, () => {
                    element.style.transition = '';
                    if (callback) callback();
                });
            },

            fadeOut(element, duration = config.animationDuration, callback = null) {
                if (!element) return;

                element.style.transition = `opacity ${duration}ms ease`;
                element.style.opacity = '1';

                element.offsetHeight;

                element.style.opacity = '0';

                this._afterTransition(element, () => {
                    this.hide(element);
                    element.style.opacity = '';
                    element.style.transition = '';
                    if (callback) callback();
                });
            },

            slideDown(element, duration = config.animationDuration, callback = null) {
                if (!element) return;

                const originalDisplay = this.getStyle(element, 'display');
                element.style.display = 'block';
                const originalHeight = this.getStyle(element, 'height');

                element.style.height = '0';
                element.style.overflow = 'hidden';
                element.style.transition = `height ${duration}ms ease`;

                const fullHeight = element.scrollHeight + 'px';

                element.offsetHeight;

                element.style.height = fullHeight;

                this._afterTransition(element, () => {
                    element.style.height = originalHeight;
                    element.style.overflow = '';
                    element.style.transition = '';
                    element.style.display = originalDisplay === 'none' ? 'block' : originalDisplay;
                    if (callback) callback();
                });
            },

            slideUp(element, duration = config.animationDuration, callback = null) {
                if (!element) return;

                const originalHeight = element.style.height || this.getStyle(element, 'height');

                element.style.height = originalHeight;
                element.style.overflow = 'hidden';
                element.style.transition = `height ${duration}ms ease`;

                element.offsetHeight;

                element.style.height = '0';

                this._afterTransition(element, () => {
                    this.hide(element);
                    element.style.height = originalHeight;
                    element.style.overflow = '';
                    element.style.transition = '';
                    if (callback) callback();
                });
            },

            on(target, event, handler, options = {}) {
                if (!target || !event || !handler) return;

                if (!eventCache.has(target)) {
                    eventCache.set(target, []);
                }

                const events = eventCache.get(target);
                events.push({ event, handler, options });

                target.addEventListener(event, handler, options);

                if (config.debug) {
                    console.log('Added event listener', { target, event });
                }
            },

            off(target, event, handler, options = {}) {
                if (!target || !event || !handler) return;

                target.removeEventListener(event, handler, options);

                if (eventCache.has(target)) {
                    const events = eventCache.get(target);
                    const index = events.findIndex(e =>
                        e.event === event && e.handler === handler
                    );
                    if (index > -1) {
                        events.splice(index, 1);
                    }
                }

                if (config.debug) {
                    console.log('Removed event listener', { target, event });
                }
            },

            once(target, event, handler, options = {}) {
                const onceHandler = (...args) => {
                    handler(...args);
                    this.off(target, event, onceHandler, options);
                };
                this.on(target, event, onceHandler, options);
            },

            trigger(element, eventName, detail = {}, bubbles = true) {
                if (!element) return;

                const event = new CustomEvent(eventName, {
                    detail,
                    bubbles,
                    cancelable: true
                });

                element.dispatchEvent(event);

                if (config.debug) {
                    console.log('Triggered event', eventName, 'on', element);
                }
            },

            delegate(parent, selector, event, handler, options = {}) {
                if (!parent || !selector || !event || !handler) return;

                const delegatedHandler = (e) => {
                    if (e.target.matches(selector) || e.target.closest(selector)) {
                        handler.call(e.target, e);
                    }
                };

                this.on(parent, event, delegatedHandler, options);

                if (config.debug) {
                    console.log('Delegated event', { parent, selector, event });
                }
            },

            closest(element, selector) {
                return element?.closest(selector) || null;
            },

            parents(element, selector = null) {
                const parents = [];
                let current = element?.parentElement;

                while (current) {
                    if (!selector || current.matches(selector)) {
                        parents.push(current);
                    }
                    current = current.parentElement;
                }

                return parents;
            },

            children(element, selector = null) {
                if (!element) return [];

                const children = Array.from(element.children);
                if (selector) {
                    return children.filter(child => child.matches(selector));
                }
                return children;
            },

            siblings(element, selector = null) {
                if (!element?.parentElement) return [];

                const siblings = Array.from(element.parentElement.children)
                    .filter(child => child !== element);

                if (selector) {
                    return siblings.filter(sibling => sibling.matches(selector));
                }
                return siblings;
            },

            insertBefore(element, target) {
                if (element && target?.parentNode) {
                    target.parentNode.insertBefore(element, target);
                }
            },

            insertAfter(element, target) {
                if (element && target?.parentNode) {
                    if (target.nextSibling) {
                        target.parentNode.insertBefore(element, target.nextSibling);
                    } else {
                        target.parentNode.appendChild(element);
                    }
                }
            },

            prepend(parent, element) {
                if (parent && element) {
                    parent.insertBefore(element, parent.firstChild);
                }
            },

            append(parent, element) {
                if (parent && element) {
                    parent.appendChild(element);
                }
            },

            remove(element, cleanup = true) {
                if (!element) return;

                if (cleanup) {
                    this._cleanupElement(element);
                }

                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            },

            empty(element, cleanup = true) {
                if (!element) return;

                while (element.lastChild) {
                    this.remove(element.lastChild, cleanup);
                }
            },

            replace(oldElement, newElement, cleanup = true) {
                if (!oldElement || !newElement) return;

                if (oldElement.parentNode) {
                    if (cleanup) {
                        this._cleanupElement(oldElement);
                    }

                    oldElement.parentNode.replaceChild(newElement, oldElement);
                }
            },

            clone(element, deep = true, copyEvents = false) {
                if (!element) return null;

                const cloned = element.cloneNode(deep);

                if (copyEvents && eventCache.has(element)) {
                    const events = eventCache.get(element);
                    events.forEach(({ event, handler, options }) => {
                        this.on(cloned, event, handler, options);
                    });
                }

                return cloned;
            },

            scrollTo(element, options = {}) {
                if (!element) return;

                const scrollOptions = {
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                    ...options
                };

                element.scrollIntoView(scrollOptions);
            },

            scrollTop(element, offset = 0) {
                if (element) {
                    element.scrollTop = offset;
                }
            },

            getScrollPosition(element = window) {
                if (element === window) {
                    return {
                        x: window.scrollX || document.documentElement.scrollLeft,
                        y: window.scrollY || document.documentElement.scrollTop
                    };
                }

                return {
                    x: element.scrollLeft,
                    y: element.scrollTop
                };
            },

            getViewport() {
                return {
                    width: window.innerWidth || document.documentElement.clientWidth,
                    height: window.innerHeight || document.documentElement.clientHeight
                };
            },

            inViewport(element, threshold = 0) {
                const rect = element.getBoundingClientRect();
                const viewport = this.getViewport();

                const visibleHeight = Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0);
                const visibleWidth = Math.min(rect.right, viewport.width) - Math.max(rect.left, 0);

                const visibleArea = visibleHeight * visibleWidth;
                const totalArea = rect.width * rect.height;

                const percentage = totalArea > 0 ? visibleArea / totalArea : 0;

                return {
                    fullyVisible: rect.top >= 0 && rect.left >= 0 &&
                        rect.bottom <= viewport.height &&
                        rect.right <= viewport.width,
                    partiallyVisible: visibleArea > 0,
                    percentage: percentage,
                    meetsThreshold: percentage >= threshold,
                    rect: rect,
                    viewport: viewport
                };
            },

            getFormData: function (form) {
                return new FormData(form);
            },

            clearForm: function (form) {
                form?.reset();
                return this;
            },

            clearCache() {
                selectorCache.clear();
                return this;
            },

            cleanupEvents() {
                eventCache.forEach((events, element) => {
                    events.forEach(({ event, handler, options }) => {
                        element.removeEventListener(event, handler, options);
                    });
                });
                eventCache.clear();
                return this;
            },

            reset() {
                this.clearCache();
                this.cleanupEvents();

                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }

                animationQueue.length = 0;
                transitionQueue.length = 0;

                this._disableMutationObserver();
                observerInitialized = false;

                return this;
            },

            getStats() {
                let totalEvents = 0;
                eventCache.forEach(events => {
                    totalEvents += events.length;
                });

                return {
                    selectorCacheSize: selectorCache.size,
                    eventCacheSize: eventCache.size,
                    totalEventListeners: totalEvents,
                    animationQueueSize: animationQueue.length,
                    transitionQueueSize: transitionQueue.length,
                    mutationObserverActive: !!mutationObserver,
                    config
                };
            },

            _resolveElements(elementOrSelector) {
                if (!elementOrSelector) return [];

                if (typeof elementOrSelector === 'string') {
                    return Array.from(this.queryAll(elementOrSelector));
                }

                if (Array.isArray(elementOrSelector)) {
                    return elementOrSelector.filter(el => el instanceof HTMLElement);
                }

                if (elementOrSelector instanceof HTMLElement) {
                    return [elementOrSelector];
                }

                if (elementOrSelector instanceof NodeList) {
                    return Array.from(elementOrSelector);
                }

                return [];
            },

            _cleanupElement(element) {
                if (eventCache.has(element)) {
                    const events = eventCache.get(element);
                    events.forEach(({ event, handler, options }) => {
                        element.removeEventListener(event, handler, options);
                    });
                    eventCache.delete(element);
                }

                if (animationCache.has(element)) {
                    animationCache.delete(element);
                }

                if (elementCache.has(element)) {
                    elementCache.delete(element);
                }
            },

            _afterTransition(element, callback) {
                if (!element || !callback) return;

                const handleTransitionEnd = (e) => {
                    if (e.target === element) {
                        element.removeEventListener('transitionend', handleTransitionEnd);
                        callback();
                    }
                };

                element.addEventListener('transitionend', handleTransitionEnd);

                setTimeout(() => {
                    element.removeEventListener('transitionend', handleTransitionEnd);
                    callback();
                }, config.animationDuration + 50);
            },

            _initMutationObserver() {
                if (!document.body) {
                    return;
                }

                if (mutationObserver) {
                    return;
                }

                mutationObserver = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            mutation.removedNodes.forEach((node) => {
                                if (node.nodeType === 1) {
                                    this._cleanupElement(node);

                                    const children = node.querySelectorAll('*');
                                    children.forEach(child => {
                                        this._cleanupElement(child);
                                    });
                                }
                            });
                        }
                    });

                    const now = Date.now();
                    if (now - lastCleanup > cleanupInterval) {
                        this._cleanupCache();
                        lastCleanup = now;
                    }
                });

                try {
                    mutationObserver.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                } catch (error) {
                    console.error('Failed to initialize mutation observer:', error);
                    mutationObserver = null;
                }
            },

            _disableMutationObserver() {
                if (mutationObserver) {
                    mutationObserver.disconnect();
                    mutationObserver = null;
                }
            },

            _cleanupCache() {
                const now = Date.now();

                for (const [key, value] of selectorCache.entries()) {
                    if (now - value.timestamp > config.domCacheTTL) {
                        selectorCache.delete(key);
                    }
                }

                for (const [element] of eventCache.entries()) {
                    if (!document.contains(element)) {
                        this._cleanupElement(element);
                    }
                }
            },

            _animationLoop() {
                if (!config.useRAF) return;

                if (animationQueue.length > 0) {
                    const now = performance.now();
                    const toKeep = [];

                    animationQueue.forEach((animation) => {
                        const elapsed = now - animation.startTime;
                        const progress = Math.min(elapsed / animation.duration, 1);

                        if (typeof animation.frame === 'function') {
                            animation.frame(progress);
                        }

                        if (progress < 1) {
                            toKeep.push(animation);
                        } else if (typeof animation.complete === 'function') {
                            animation.complete();
                        }
                    });

                    animationQueue.length = 0;
                    animationQueue.push(...toKeep);
                }

                rafId = requestAnimationFrame(() => this._animationLoop());
            }
        };

        // Assign to window.$ if it doesn't exist
        if (!window.$) {
            window.$ = {};
        }

        // Add DOM methods to $ shortcut
        Object.assign(window.$, {
            // DOM Querying
            query: dom.query.bind(dom),
            queryAll: dom.queryAll.bind(dom),
            getById: dom.getById.bind(dom),
            getByClass: dom.getByClass.bind(dom),
            getByTag: dom.getByTag.bind(dom),
            
            // DOM Creation
            create: dom.create.bind(dom),
            setAttributes: dom.setAttributes.bind(dom),
            
            // DOM Manipulation
            addClass: dom.addClass.bind(dom),
            removeClass: dom.removeClass.bind(dom),
            toggleClass: dom.toggleClass.bind(dom),
            hasClass: dom.hasClass.bind(dom),
            classIf: dom.classIf.bind(dom),
            setText: dom.setText.bind(dom),
            setHTML: dom.setHTML.bind(dom),
            
            // DOM Traversal
            closest: dom.closest.bind(dom),
            parents: dom.parents.bind(dom),
            children: dom.children.bind(dom),
            siblings: dom.siblings.bind(dom),
            
            // DOM Insertion/Removal
            prepend: dom.prepend.bind(dom),
            append: dom.append.bind(dom),
            insertBefore: dom.insertBefore.bind(dom),
            insertAfter: dom.insertAfter.bind(dom),
            remove: dom.remove.bind(dom),
            empty: dom.empty.bind(dom),
            replace: dom.replace.bind(dom),
            clone: dom.clone.bind(dom),
            
            // Event Handling
            on: dom.on.bind(dom),
            off: dom.off.bind(dom),
            once: dom.once.bind(dom),
            trigger: dom.trigger.bind(dom),
            delegate: dom.delegate.bind(dom),
            
            // Animation
            fadeIn: dom.fadeIn.bind(dom),
            fadeOut: dom.fadeOut.bind(dom),
            slideDown: dom.slideDown.bind(dom),
            slideUp: dom.slideUp.bind(dom),
            show: dom.show.bind(dom),
            hide: dom.hide.bind(dom),
            toggle: dom.toggle.bind(dom),
            
            // Position/Visibility
            getRect: dom.getRect.bind(dom),
            getAbsolutePosition: dom.getAbsolutePosition.bind(dom),
            isVisible: dom.isVisible.bind(dom),
            isInViewport: dom.isInViewport.bind(dom),
            inViewport: dom.inViewport.bind(dom),
            
            // Scroll
            scrollTo: dom.scrollTo.bind(dom),
            scrollTop: dom.scrollTop.bind(dom),
            getScrollPosition: dom.getScrollPosition.bind(dom),
            getViewport: dom.getViewport.bind(dom),
            
            // Forms
            getFormData: dom.getFormData.bind(dom),
            clearForm: dom.clearForm.bind(dom),
            
            // DOM-specific config and init
            config: dom.config.bind(dom),
            init: dom.init.bind(dom),
            reset: dom.reset.bind(dom),
            getStats: dom.getStats.bind(dom),
            
            // Reference to full dom object
            dom: dom
        });

        return dom;
    })();

    window.dom = xon.dom;

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        xon.dom.config({ debug: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            xon.dom.init();
        });
    } else {
        xon.dom.init();
    }

    console.log('XON DOM module loaded');

})(window.xon || {});