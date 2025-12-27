(function (xon) {
    'use strict';

    if (!xon) {
        xon = window.xon = {};
    }

    xon.utils = (function () {
        const cache = new Map();
        const memoCache = new Map();
        
        let config = {
            debug: false,
            cacheEnabled: true,
            cacheTTL: 300000
        };

        const utils = {
            config(newConfig) {
                config = { ...config, ...newConfig };
                
                if (config.debug) {
                    console.log('Configuration updated', config);
                }
                return this;
            },

            init() {
                if (config.debug) {
                    console.log('XON Utilities initialized');
                }
                return this;
            },

            deepClone: function(obj) {
                if (obj === null || typeof obj !== 'object') return obj;
                if (obj instanceof Date) return new Date(obj);
                if (obj instanceof RegExp) return new RegExp(obj);
                
                const clone = Array.isArray(obj) ? [] : {};
                
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        clone[key] = this.deepClone(obj[key]);
                    }
                }
                
                return clone;
            },

            getNested: function(obj, path, defaultValue = null) {
                if (!obj || typeof obj !== 'object') return defaultValue;
                
                const keys = path.split('.');
                let current = obj;
                
                for (const key of keys) {
                    if (current === null || current === undefined) return defaultValue;
                    current = current[key];
                }
                
                return current === undefined ? defaultValue : current;
            },

            setNested: function(obj, path, value) {
                if (!obj || typeof obj !== 'object') return obj;
                
                const keys = path.split('.');
                let current = obj;
                
                for (let i = 0; i < keys.length - 1; i++) {
                    const key = keys[i];
                    if (current[key] === undefined || current[key] === null) {
                        current[key] = {};
                    }
                    current = current[key];
                }
                
                current[keys[keys.length - 1]] = value;
                return obj;
            },

            merge: function(...objects) {
                return Object.assign({}, ...objects);
            },

            deepMerge: function(target, source) {
                if (!target || typeof target !== 'object') return source;
                if (!source || typeof source !== 'object') return target;
                
                const output = Array.isArray(target) ? [...target] : { ...target };
                
                for (const key in source) {
                    if (source.hasOwnProperty(key)) {
                        if (source[key] && typeof source[key] === 'object' && 
                            target[key] && typeof target[key] === 'object') {
                            output[key] = this.deepMerge(target[key], source[key]);
                        } else {
                            output[key] = source[key];
                        }
                    }
                }
                
                return output;
            },

            isObject: function(val) {
                return val !== null && typeof val === 'object' && !Array.isArray(val);
            },

            isPlainObject: function(val) {
                return Object.prototype.toString.call(val) === '[object Object]';
            },

            isArray: function(val) {
                return Array.isArray(val);
            },

            isFunction: function(val) {
                return typeof val === 'function';
            },

            isString: function(val) {
                return typeof val === 'string';
            },

            isNumber: function(val) {
                return typeof val === 'number' && !isNaN(val);
            },

            isBoolean: function(val) {
                return typeof val === 'boolean';
            },

            isNull: function(val) {
                return val === null;
            },

            isUndefined: function(val) {
                return val === undefined;
            },

            isEmpty: function(obj) {
                if (obj === null || obj === undefined) return true;
                if (Array.isArray(obj)) return obj.length === 0;
                if (typeof obj === 'object') return Object.keys(obj).length === 0;
                if (typeof obj === 'string') return obj.trim().length === 0;
                return false;
            },

            forEach: function(obj, fn) {
                Object.keys(obj).forEach(key => fn(obj[key], key, obj));
                return this;
            },

            map: function(obj, fn) {
                return Object.keys(obj).reduce((acc, key) => {
                    acc[key] = fn(obj[key], key, obj);
                    return acc;
                }, Array.isArray(obj) ? [] : {});
            },

            filter: function(obj, predicate) {
                return Object.keys(obj).reduce((acc, key) => {
                    if (predicate(obj[key], key, obj)) {
                        acc[key] = obj[key];
                    }
                    return acc;
                }, Array.isArray(obj) ? [] : {});
            },

            reduce: function(obj, fn, initialValue) {
                return Object.keys(obj).reduce((acc, key) => {
                    return fn(acc, obj[key], key, obj);
                }, initialValue);
            },

            pick: function(obj, keys) {
                return keys.reduce((acc, key) => {
                    if (obj[key] !== undefined) {
                        acc[key] = obj[key];
                    }
                    return acc;
                }, {});
            },

            omit: function(obj, keys) {
                return Object.keys(obj).reduce((acc, key) => {
                    if (!keys.includes(key)) {
                        acc[key] = obj[key];
                    }
                    return acc;
                }, {});
            },

            unique: function(arr) {
                return [...new Set(arr)];
            },

            flatten: function(arr) {
                return arr.flat(Infinity);
            },

            chunk: function(arr, size) {
                const chunks = [];
                for (let i = 0; i < arr.length; i += size) {
                    chunks.push(arr.slice(i, i + size));
                }
                return chunks;
            },

            groupBy: function(arr, key) {
                return arr.reduce((acc, item) => {
                    const groupKey = typeof key === 'function' ? key(item) : item[key];
                    if (!acc[groupKey]) acc[groupKey] = [];
                    acc[groupKey].push(item);
                    return acc;
                }, {});
            },

            sortBy: function(arr, key, direction = 'asc') {
                return [...arr].sort((a, b) => {
                    const aVal = typeof key === 'function' ? key(a) : a[key];
                    const bVal = typeof key === 'function' ? key(b) : b[key];
                    
                    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                    return 0;
                });
            },

            findBy: function(arr, key, value) {
                return arr.find(item => item[key] === value);
            },

            filterBy: function(arr, key, value) {
                return arr.filter(item => item[key] === value);
            },

            removeFromArray: function(arr, predicate) {
                const index = arr.findIndex(predicate);
                if (index > -1) {
                    return arr.splice(index, 1)[0];
                }
                return null;
            },

            capitalize: function(str) {
                if (!str) return '';
                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            },

            camelCase: function(str) {
                return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
            },

            kebabCase: function(str) {
                return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            },

            snakeCase: function(str) {
                return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
            },

            truncate: function(str, length, suffix = '...') {
                if (!str || str.length <= length) return str;
                return str.substring(0, length - suffix.length) + suffix;
            },

            stripTags: function(html) {
                const div = document.createElement('div');
                div.innerHTML = html;
                return div.textContent || div.innerText || '';
            },

            escapeHTML: function(str) {
                if (!str) return '';
                
                const map = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;',
                    '/': '&#47;',
                    '\\': '&#92;'
                };
                
                return str.replace(/[&<>"'\/\\]/g, m => map[m]);
            },

            unescapeHTML: function(str) {
                if (!str) return '';
                
                const map = {
                    '&amp;': '&',
                    '&lt;': '<',
                    '&gt;': '>',
                    '&quot;': '"',
                    '&#39;': "'",
                    '&#47;': '/',
                    '&#92;': '\\'
                };
                
                return str.replace(/&(amp|lt|gt|quot|#39|#47|#92);/g, m => map[m]);
            },

            isEmail: function(str) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
            },

            isURL: function(str) {
                try {
                    new URL(str);
                    return true;
                } catch {
                    return false;
                }
            },

            isPhone: function(str) {
                return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(str);
            },

            parseQueryString: function(str) {
                if (!str) return {};
                
                const params = new URLSearchParams(str);
                const result = {};
                
                for (const [key, value] of params.entries()) {
                    if (key.endsWith('[]')) {
                        const cleanKey = key.slice(0, -2);
                        if (!result[cleanKey]) result[cleanKey] = [];
                        result[cleanKey].push(value);
                    } else {
                        result[key] = value;
                    }
                }
                
                return result;
            },

            toQueryString: function(obj) {
                if (!obj || Object.keys(obj).length === 0) return '';
                
                const params = new URLSearchParams();
                
                Object.entries(obj).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach(item => {
                            params.append(`${key}[]`, item);
                        });
                    } else if (value !== null && value !== undefined) {
                        params.append(key, value);
                    }
                });
                
                return params.toString();
            },

            interpolate: function(template, data) {
                return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                    return data[key] !== undefined ? data[key] : match;
                });
            },

            debounce: function(func, wait, immediate = false) {
                let timeout;
                
                return function executedFunction(...args) {
                    const context = this;
                    const later = () => {
                        timeout = null;
                        if (!immediate) func.apply(context, args);
                    };
                    
                    const callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    
                    if (callNow) func.apply(context, args);
                };
            },

            throttle: function(func, limit) {
                let inThrottle;
                
                return function executedFunction(...args) {
                    if (!inThrottle) {
                        func.apply(this, args);
                        inThrottle = true;
                        setTimeout(() => inThrottle = false, limit);
                    }
                };
            },

            memoize: function(fn, ttl = 0) {
                const cacheKey = fn.toString();
                
                return function(...args) {
                    const key = JSON.stringify(args);
                    const cached = memoCache.get(cacheKey)?.[key];
                    
                    if (cached) {
                        if (!ttl || Date.now() - cached.timestamp < ttl) {
                            return cached.value;
                        }
                    }
                    
                    const result = fn.apply(this, args);
                    
                    if (!memoCache.has(cacheKey)) {
                        memoCache.set(cacheKey, {});
                    }
                    
                    memoCache.get(cacheKey)[key] = {
                        value: result,
                        timestamp: Date.now()
                    };
                    
                    return result;
                };
            },

            curry: function(fn) {
                const arity = fn.length;
                
                return function curried(...args) {
                    if (args.length >= arity) {
                        return fn.apply(this, args);
                    } else {
                        return function(...moreArgs) {
                            return curried.apply(this, args.concat(moreArgs));
                        };
                    }
                };
            },

            compose: function(...fns) {
                return function(x) {
                    return fns.reduceRight((acc, fn) => fn(acc), x);
                };
            },

            pipe: function(...fns) {
                return function(x) {
                    return fns.reduce((acc, fn) => fn(acc), x);
                };
            },

            bindAll: function(obj, methodNames) {
                methodNames.forEach(methodName => {
                    if (typeof obj[methodName] === 'function') {
                        obj[methodName] = obj[methodName].bind(obj);
                    }
                });
                return obj;
            },

            sleep: function(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            },

            retry: async function(fn, retries = 3, delay = 1000) {
                let lastError;
                
                for (let i = 0; i < retries; i++) {
                    try {
                        return await fn();
                    } catch (error) {
                        lastError = error;
                        if (i < retries - 1) {
                            await this.sleep(delay);
                        }
                    }
                }
                
                throw lastError;
            },

            timeout: function(promise, ms, errorMessage = 'Operation timeout') {
                return Promise.race([
                    promise,
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error(errorMessage)), ms)
                    )
                ]);
            },

            parallel: async function(tasks, concurrency = 5) {
                const results = [];
                const executing = [];
                
                for (const task of tasks) {
                    const p = Promise.resolve().then(() => task());
                    results.push(p);
                    
                    const e = p.then(() => executing.splice(executing.indexOf(e), 1));
                    executing.push(e);
                    
                    if (executing.length >= concurrency) {
                        await Promise.race(executing);
                    }
                }
                
                return Promise.all(results);
            },

            createEmitter: function() {
                const listeners = new Map();
                
                return {
                    on: function(event, handler) {
                        if (!listeners.has(event)) listeners.set(event, []);
                        listeners.get(event).push(handler);
                        return this;
                    },
                    
                    off: function(event, handler) {
                        const handlers = listeners.get(event);
                        if (handlers) {
                            const index = handlers.indexOf(handler);
                            if (index > -1) handlers.splice(index, 1);
                        }
                        return this;
                    },
                    
                    emit: function(event, ...args) {
                        const handlers = listeners.get(event);
                        if (handlers) handlers.forEach(handler => handler(...args));
                        return this;
                    },
                    
                    once: function(event, handler) {
                        const onceHandler = (...args) => {
                            handler(...args);
                            this.off(event, onceHandler);
                        };
                        this.on(event, onceHandler);
                        return this;
                    },
                    
                    clear: function(event = null) {
                        if (event) {
                            listeners.delete(event);
                        } else {
                            listeners.clear();
                        }
                        return this;
                    }
                };
            },

            serializeForm: function(form) {
                if (!form || form.tagName !== 'FORM') return {};
                
                const formData = new FormData(form);
                const data = {};
                
                for (const [key, value] of formData.entries()) {
                    if (key.endsWith('[]')) {
                        const cleanKey = key.slice(0, -2);
                        if (!data[cleanKey]) data[cleanKey] = [];
                        data[cleanKey].push(value);
                    } else {
                        data[key] = value;
                    }
                }
                
                const inputs = form.querySelectorAll('input[type="checkbox"], input[type="radio"]');
                inputs.forEach(input => {
                    if (input.type === 'checkbox' && !input.checked) {
                        if (!data[input.name]) {
                            data[input.name] = false;
                        }
                    }
                });
                
                return data;
            },

            validateForm: function(form, rules = {}) {
                const errors = {};
                const data = this.serializeForm(form);
                
                Object.keys(rules).forEach(field => {
                    const value = data[field];
                    const fieldRules = rules[field];
                    
                    fieldRules.forEach(rule => {
                        if (rule.required && (value === undefined || value === '' || value === null)) {
                            errors[field] = rule.message || `${field} is required`;
                        }
                        
                        if (rule.pattern && !rule.pattern.test(String(value))) {
                            errors[field] = rule.message || `${field} format is invalid`;
                        }
                        
                        if (rule.minLength && String(value).length < rule.minLength) {
                            errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
                        }
                        
                        if (rule.maxLength && String(value).length > rule.maxLength) {
                            errors[field] = rule.message || `${field} must be at most ${rule.maxLength} characters`;
                        }
                        
                        if (rule.min !== undefined && Number(value) < rule.min) {
                            errors[field] = rule.message || `${field} must be at least ${rule.min}`;
                        }
                        
                        if (rule.max !== undefined && Number(value) > rule.max) {
                            errors[field] = rule.message || `${field} must be at most ${rule.max}`;
                        }
                        
                        if (rule.custom && !rule.custom(value, data)) {
                            errors[field] = rule.message || `${field} is invalid`;
                        }
                    });
                });
                
                return {
                    isValid: Object.keys(errors).length === 0,
                    errors,
                    data
                };
            },

            clamp: function(value, min, max) {
                return Math.min(Math.max(value, min), max);
            },

            lerp: function(start, end, amount) {
                return start + (end - start) * amount;
            },

            normalize: function(value, min, max) {
                return (value - min) / (max - min);
            },

            round: function(value, decimals = 0) {
                const factor = Math.pow(10, decimals);
                return Math.round(value * factor) / factor;
            },

            random: function(min = 0, max = 1) {
                return min + Math.random() * (max - min);
            },

            randomInt: function(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            },

            randomItem: function(array) {
                return array[Math.floor(Math.random() * array.length)];
            },

            formatBytes: function(bytes, decimals = 2) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
            },

            formatNumber: function(num, options = {}) {
                const { locale = 'en-US', ...formatOptions } = options;
                return new Intl.NumberFormat(locale, formatOptions).format(num);
            },

            formatPercent: function(value, decimals = 1) {
                return `${(value * 100).toFixed(decimals)}%`;
            },

            sum: function(arr) {
                return arr.reduce((a, b) => a + b, 0);
            },

            average: function(arr) {
                return this.sum(arr) / arr.length;
            },

            median: function(arr) {
                const sorted = [...arr].sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                return sorted.length % 2 === 0 ? 
                    (sorted[mid - 1] + sorted[mid]) / 2 : 
                    sorted[mid];
            },

            min: function(arr) {
                return Math.min(...arr);
            },

            max: function(arr) {
                return Math.max(...arr);
            },

            formatDate: function(date = new Date(), format = 'YYYY-MM-DD') {
                const d = date instanceof Date ? date : new Date(date);
                const pad = (n) => n.toString().padStart(2, '0');
                
                return format
                    .replace('YYYY', d.getFullYear())
                    .replace('MM', pad(d.getMonth() + 1))
                    .replace('DD', pad(d.getDate()))
                    .replace('HH', pad(d.getHours()))
                    .replace('mm', pad(d.getMinutes()))
                    .replace('ss', pad(d.getSeconds()))
                    .replace('SSS', pad(d.getMilliseconds(), 3));
            },

            timeAgo: function(date) {
                const seconds = Math.floor((new Date() - new Date(date)) / 1000);
                const intervals = {
                    year: 31536000,
                    month: 2592000,
                    week: 604800,
                    day: 86400,
                    hour: 3600,
                    minute: 60,
                    second: 1
                };
                
                for (const [unit, secondsInUnit] of Object.entries(intervals)) {
                    const interval = Math.floor(seconds / secondsInUnit);
                    if (interval >= 1) {
                        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
                    }
                }
                return 'just now';
            },

            addDays: function(date, days) {
                const result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            },

            addMonths: function(date, months) {
                const result = new Date(date);
                result.setMonth(result.getMonth() + months);
                return result;
            },

            addYears: function(date, years) {
                const result = new Date(date);
                result.setFullYear(result.getFullYear() + years);
                return result;
            },

            isSameDay: function(date1, date2) {
                const d1 = new Date(date1);
                const d2 = new Date(date2);
                return d1.getFullYear() === d2.getFullYear() &&
                       d1.getMonth() === d2.getMonth() &&
                       d1.getDate() === d2.getDate();
            },

            isToday: function(date) {
                return this.isSameDay(date, new Date());
            },

            isYesterday: function(date) {
                return this.isSameDay(date, this.addDays(new Date(), -1));
            },

            isTomorrow: function(date) {
                return this.isSameDay(date, this.addDays(new Date(), 1));
            },

            isValidDate: function(date) {
                return date instanceof Date && !isNaN(date);
            },

            getCurrentTime: function() {
                return new Date().toISOString().split('T')[1].split('.')[0];
            },

            getTimestamp: function() {
                return Date.now();
            },

            getUnixTimestamp: function() {
                return Math.floor(Date.now() / 1000);
            },

            isRequired: function(value) {
                return value !== null && value !== undefined && value !== '';
            },

            isCreditCard: function(number) {
                const sanitized = String(number).replace(/\D/g, '');
                let sum = 0;
                let shouldDouble = false;
                
                for (let i = sanitized.length - 1; i >= 0; i--) {
                    let digit = parseInt(sanitized.charAt(i));
                    if (shouldDouble) {
                        digit *= 2;
                        if (digit > 9) digit -= 9;
                    }
                    sum += digit;
                    shouldDouble = !shouldDouble;
                }
                
                return sum % 10 === 0;
            },

            isStrongPassword: function(password) {
                const minLength = 8;
                const hasLower = /[a-z]/.test(password);
                const hasUpper = /[A-Z]/.test(password);
                const hasNumber = /\d/.test(password);
                const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                
                return password.length >= minLength && hasLower && hasUpper && hasNumber && hasSpecial;
            },

            readFile: function(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsText(file);
                });
            },

            readFileAsDataURL: function(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            },

            downloadFile: function(content, filename, type = 'text/plain') {
                const blob = new Blob([content], { type });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                return this;
            },

            clearUtilityCache: function(type = 'all') {
                if (type === 'all' || type === 'dom') {
                    cache.clear();
                }
                if (type === 'all' || type === 'memo') {
                    memoCache.clear();
                }
                
                return this;
            },

            getCacheStats: function() {
                return {
                    domCacheSize: cache.size,
                    memoCacheSize: memoCache.size
                };
            },

            log: function(...args) {
                if (config.debug) {
                    console.log(...args);
                }
            },

            warn: function(...args) {
                console.warn(...args);
            },

            error: function(...args) {
                console.error(...args);
            },

            isChrome: function() {
                return /chrome|chromium/i.test(navigator.userAgent);
            },

            isFirefox: function() {
                return /firefox/i.test(navigator.userAgent);
            },

            isSafari: function() {
                return /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
            },

            isEdge: function() {
                return /edg/i.test(navigator.userAgent);
            },

            isIE: function() {
                return /trident/i.test(navigator.userAgent);
            },

            supports: {
                proxy: function() { return typeof Proxy !== 'undefined'; },
                fetch: function() { return typeof fetch !== 'undefined'; },
                localStorage: function() { return typeof localStorage !== 'undefined'; },
                sessionStorage: function() { return typeof sessionStorage !== 'undefined'; },
                webComponents: function() { return 'customElements' in window; },
                intersectionObserver: function() { return 'IntersectionObserver' in window; },
                resizeObserver: function() { return 'ResizeObserver' in window; },
                mutationObserver: function() { return 'MutationObserver' in window; }
            },

            getQueryParam: function(name) {
                const urlParams = new URLSearchParams(window.location.search);
                return urlParams.get(name);
            },

            setQueryParam: function(name, value) {
                const url = new URL(window.location);
                url.searchParams.set(name, value);
                window.history.pushState({}, '', url);
                return this;
            },

            removeQueryParam: function(name) {
                const url = new URL(window.location);
                url.searchParams.delete(name);
                window.history.pushState({}, '', url);
                return this;
            },

            isMobile: function() {
                return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            },

            isTouchDevice: function() {
                return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            },

            getViewportSize: function() {
                return {
                    width: window.innerWidth || document.documentElement.clientWidth,
                    height: window.innerHeight || document.documentElement.clientHeight
                };
            },

            scrollToTop: function(options = {}) {
                window.scrollTo({ top: 0, ...options });
                return this;
            },

            copyToClipboard: async function(text) {
                try {
                    await navigator.clipboard.writeText(text);
                    return true;
                } catch {
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    return true;
                }
            },

            localStorage: {
                get: function(key, defaultValue = null) {
                    try {
                        const value = localStorage.getItem(key);
                        return value ? JSON.parse(value) : defaultValue;
                    } catch {
                        return defaultValue;
                    }
                },
                
                set: function(key, value) {
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                        return true;
                    } catch {
                        return false;
                    }
                },
                
                remove: function(key) {
                    localStorage.removeItem(key);
                },
                
                clear: function() {
                    localStorage.clear();
                },
                
                has: function(key) {
                    return localStorage.getItem(key) !== null;
                },
                
                keys: function() {
                    return Object.keys(localStorage);
                }
            },

            sessionStorage: {
                get: function(key, defaultValue = null) {
                    try {
                        const value = sessionStorage.getItem(key);
                        return value ? JSON.parse(value) : defaultValue;
                    } catch {
                        return defaultValue;
                    }
                },
                
                set: function(key, value) {
                    try {
                        sessionStorage.setItem(key, JSON.stringify(value));
                        return true;
                    } catch {
                        return false;
                    }
                }
            },

            cookie: {
                get: function(name) {
                    const cookies = document.cookie.split(';');
                    for (let cookie of cookies) {
                        const [key, value] = cookie.trim().split('=');
                        if (key === name) return decodeURIComponent(value);
                    }
                    return null;
                },
                
                set: function(name, value, days = 7, path = '/') {
                    const expires = new Date();
                    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
                    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=${path}`;
                },
                
                delete: function(name, path = '/') {
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path}`;
                }
            },

            reset: function() {
                this.clearUtilityCache('all');
                return this;
            }
        };

        // Assign to window.$ if it doesn't exist
        if (!window.$) {
            window.$ = {};
        }

        // Add a subset of commonly used utility methods to $
        Object.assign(window.$, {
            // Core utilities
            sleep: utils.sleep.bind(utils),
            
            // String utilities
            capitalize: utils.capitalize.bind(utils),
            camelCase: utils.camelCase.bind(utils),
            kebabCase: utils.kebabCase.bind(utils),
            snakeCase: utils.snakeCase.bind(utils),
            truncate: utils.truncate.bind(utils),
            stripTags: utils.stripTags.bind(utils),
            escapeHTML: utils.escapeHTML.bind(utils),
            unescapeHTML: utils.unescapeHTML.bind(utils),
            
            // Validation
            isEmail: utils.isEmail.bind(utils),
            isURL: utils.isURL.bind(utils),
            isPhone: utils.isPhone.bind(utils),
            isCreditCard: utils.isCreditCard.bind(utils),
            isStrongPassword: utils.isStrongPassword.bind(utils),
            
            // Date/time
            formatDate: utils.formatDate.bind(utils),
            timeAgo: utils.timeAgo.bind(utils),
            formatBytes: utils.formatBytes.bind(utils),
            formatNumber: utils.formatNumber.bind(utils),
            formatPercent: utils.formatPercent.bind(utils),
            
            // Math
            clamp: utils.clamp.bind(utils),
            round: utils.round.bind(utils),
            random: utils.random.bind(utils),
            randomInt: utils.randomInt.bind(utils),
            randomItem: utils.randomItem.bind(utils),
            
            // Array/object
            unique: utils.unique.bind(utils),
            flatten: utils.flatten.bind(utils),
            chunk: utils.chunk.bind(utils),
            groupBy: utils.groupBy.bind(utils),
            sortBy: utils.sortBy.bind(utils),
            
            // Functional
            debounce: utils.debounce.bind(utils),
            throttle: utils.throttle.bind(utils),
            memoize: utils.memoize.bind(utils),
            
            // Storage
            storage: utils.localStorage,
            cookie: utils.cookie,
            session: utils.sessionStorage,
            
            // URL
            getQueryParam: utils.getQueryParam.bind(utils),
            setQueryParam: utils.setQueryParam.bind(utils),
            removeQueryParam: utils.removeQueryParam.bind(utils),
            
            // Device/browser
            isMobile: utils.isMobile.bind(utils),
            isTouchDevice: utils.isTouchDevice.bind(utils),
            isChrome: utils.isChrome.bind(utils),
            isFirefox: utils.isFirefox.bind(utils),
            isSafari: utils.isSafari.bind(utils),
            
            // Clipboard
            copyToClipboard: utils.copyToClipboard.bind(utils),
            
            // Utility
            config: utils.config.bind(utils),
            init: utils.init.bind(utils),
            reset: utils.reset.bind(utils),
            
            // Reference to full utils
            utils: utils
        });

        return utils;
    })();

    window.utils = xon.utils;
    
    console.log('XON Utilities module loaded');

})(window.xon || {});