<p align="center">
  <img src="https://raw.githubusercontent.com/oncebuilder/xonjs/main/docs/logo.svg" alt="XON Framework Logo" width="200" height="200">
</p>

<h1 align="center">⚡ XON Framework vBeta</h1>

<p align="center">
  <strong>Build reactive web applications with HTML attributes only.</strong><br>
  No build process. No complex configuration. Pure declarative JavaScript.
</p>

<p align="center">
  <a href="https://github.com/oncebuilder/xonjs/releases">
    <img src="https://img.shields.io/badge/version-Beta-brightgreen.svg" alt="Version Beta">
  </a>
  <a href="https://github.com/oncebuilder/xonjs/issues">
    <img src="https://img.shields.io/github/issues/oncebuilder/xonjs" alt="GitHub Issues">
  </a>
  <a href="https://github.com/oncebuilder/xonjs/stargazers">
    <img src="https://img.shields.io/github/stars/oncebuilder/xonjs" alt="GitHub Stars">
  </a>
  <a href="#browser-compatibility">
    <img src="https://img.shields.io/badge/browser-Chrome%2060%2B,%20Firefox%2055%2B,%20Safari%2010%2B-brightgreen.svg" alt="Browser Support">
  </a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-examples">Examples</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-contributing">Contributing</a>
</p>

<p align="center">
  <a href="https://oncebuilder.github.io/xonjs" target="_blank">📚 Live Documentation</a> •
  <a href="https://oncebuilder.github.io/xonjs/examples" target="_blank">🚀 Live Examples</a> •
  <a href="https://github.com/oncebuilder/xonjs/issues/new" target="_blank">🐛 Report Bug</a>
</p>

---

# ✨ Why XON Framework?


XON Framework enables you to build modern, reactive web applications using only HTML attributes. It brings the power of reactive programming to vanilla HTML without the complexity of build tools or configuration files.


## 🚀 XON Framework JSON Approach


```
<!-- Just HTML with data-xon attributes -->
<div data-xon='{"$state":{"count":0},"$bind":{"count":".display"}}'>

  <div class="display"></div>

  <button data-xon="@click$state.count++">Increment</button>

</div>
<script src="xon.js"></script>
```

## ✨ Features


<table> <tr> <td><strong>🚀 Declarative Syntax</strong></td> <td>Build apps with HTML attributes, no JavaScript configuration needed</td> </tr> <tr> <td><strong>⚡ Reactive State</strong></td> <td>Automatic DOM updates with computed properties and memoization</td> </tr> <tr> <td><strong>🔗 Auto-Binding</strong></td> <td>DOM elements automatically sync with state changes</td> </tr> <tr> <td><strong>🎯 Enhanced Events</strong></td> <td>Delegated events with context variables ($this, $event, $data)</td> </tr> <tr> <td><strong>📦 Component System</strong></td> <td>Auto-rendering components with file loading</td> </tr> <tr> <td><strong>🛡️ Security First</strong></td> <td>Built-in sanitization and dangerous pattern blocking</td> </tr> <tr> <td><strong>📄 Template Engine</strong></td> <td>Powerful templating with form integration</td> </tr> <tr> <td><strong>🔄 Built-in Router</strong></td> <td>Client-side routing with history management</td> </tr> <tr> <td><strong>⚙️ Performance</strong></td> <td>Memoization, batching, and template caching</td> </tr> <tr> <td><strong>🌐 Modern Browsers</strong></td> <td>Works in Chrome 60+, Firefox 55+, Safari 10+, Edge 79+</td> </tr> </table>


# 🚀 Quick Start


## CDN (Recommended)


<!-- Latest version from CDN -->
```
<!--- comming soon -->

```


## Local Installation


### Download the file:
```
https://raw.githubusercontent.com/oncebuilder/xonjs/vBeta/xon.js
```

### Using curl
```
curl -O https://raw.githubusercontent.com/oncebuilder/xonjs/vBeta/xon.js
```

### Using wget
```
wget https://raw.githubusercontent.com/oncebuilder/xonjs/vBeta/xon.js
```

### Include in your HTML:

```
<script src="xon.js"></script>
```

###  NPM (Coming Soon) Planned for future release
```npm install xonjs```


# 🚀 Quick Start


## 📦 Examples


### Basic Counter
```
<!DOCTYPE html>
<html>
<head>
    <title>XON Counter App</title>
</head>
<body>
    <!-- Reactive counter -->
    <div data-xon='{"$state":{"count":0},"$bind":{"count":".display"}}'>
        <h2>Count: <span class="display"></span></h2>
        <button data-xon="@click$state.count++">Increment</button>
        <button data-xon="@click$state.count--">Decrement</button>
        <button data-xon="@click$state.count(0)">Reset</button>
    </div>

    <script src="xon.js"></script>
</body>
</html>
```

### Todo List App
```
<!DOCTYPE html>
<html>
<head>
    <title>XON Todo App</title>
</head>
<body>
    <!-- Todo List Container -->
    <div data-xon='{
        "$state": {
            "todos": [],
            "newTodo": ""
        },
        "$bind": {
            "newTodo": "#new-todo"
        }
    }'>
        <h1>Todo List</h1>
        
        <!-- Add Todo Form -->
        <input id="new-todo" placeholder="Add a new todo...">
        <button data-xon="@click$state.todos.push({text: $state.newTodo, done: false}); $state.newTodo('')">
            Add Todo
        </button>
        
        <!-- Todo List -->
        <div data-xon="%todoTemplate">
            <div class="todo-item">
                <input type="checkbox" data-xon="@change$state.todos[$index].done($this.checked)">
                <span style="text-decoration: {$done ? 'line-through' : 'none'}">
                    {$text}
                </span>
                <button data-xon="@click$state.todos.splice($index, 1)">❌</button>
            </div>
        </div>
        
        <!-- Todo Template Data -->
        <script type="application/json" id="todoTemplate">
        {
            "items": [],
            "template": ["text", "done"]
        }
        </script>
    </div>

    <script src="xon.js"></script>
</body>
</html>
```

### User Profile with Components
```
<!DOCTYPE html>
<html>
<head>
    <title>XON User Profile</title>
</head>
<body>
    <!-- Load header component -->
    <div data-xon="#header"></div>
    
    <!-- User Profile Container -->
    <div data-xon='{
        "$state": {
            "user": {
                "name": "John Doe",
                "email": "john@example.com",
                "avatar": "https://i.pravatar.cc/150?img=1"
            }
        },
        "$bind": {
            "user.name": ".user-name",
            "user.email": ".user-email"
        }
    }'>
        <div class="profile-card">
            <img src="{$user.avatar}" alt="Avatar" class="avatar">
            <h2 class="user-name"></h2>
            <p class="user-email"></p>
            <button data-xon="@click$state.user.name('Jane Smith')">
                Change Name
            </button>
        </div>
    </div>
    
    <!-- Load footer component -->
    <div data-xon="#footer"></div>

    <script src="xon.js"></script>
</body>
</html>
```

# 📖 Documentation


## Core Syntax
### Event Handling

```
<!-- Basic click event -->
<button data-xon="@click$showAlert('Hello!')">Click Me</button>

<!-- Multiple events -->
<button data-xon="@click$submit @mouseover$highlight @mouseout$unhighlight">
    Submit
</button>

<!-- With context variables -->
<button data-xon="@click$processData($this, $event, $data)">
    Process
</button>

<!-- Delegated events -->
<div data-xon="@click~>.item$selectItem($this)">
    <div class="item" data-id="1">Item 1</div>
    <div class="item" data-id="2">Item 2</div>
</div>
```

### State Management

```
<!-- State assignment -->
<button data-xon="@click$state.count(5)">Set to 5</button>
<button data-xon="@click$state.count++">Increment</button>
<button data-xon="@click$state.count--">Decrement</button>

<!-- Nested state -->
<button data-xon="@click$state.user.name('John')">Set Name</button>
<button data-xon="@click$state.user.email('john@example.com')">Set Email</button>

<!-- Array operations -->
<button data-xon="@click$state.items.push({id: 1, name: 'Item'})">
    Add Item
</button>
<button data-xon="@click$state.items.splice(0, 1)">
    Remove First
</button>
```


### Templates


```
<!-- Simple template -->
<template id="userTemplate">
{
    "items": [
        {"name": "John", "email": "john@example.com", "age": 30},
        {"name": "Jane", "email": "jane@example.com", "age": 25}
    ]
}
</template>

<div data-xon="%userTemplate">
    <div class="user-card">
        <h3>{$name}</h3>
        <p>{$email}</p>
        <p>Age: {$age}</p>
    </div>
</div>

<!-- Form templates -->
<button data-xon="@click%%userData~>#userForm">
    Load Form Data
</button>
```


### File Loading


```
<!-- Load component (auto-rendered) -->
<div data-xon="#header"></div>

<!-- Load HTML file -->
<div data-xon="#modal.html~>.modal-content"></div>

<!-- Load CSS -->
<div data-xon="#styles.css"></div>

<!-- Load JavaScript -->
<div data-xon="#utils.js"></div>
```


### Routing


```
<!-- Simple routing -->
<button data-xon="@click~/home">Go Home</button>
<button data-xon="@click~/dashboard">Dashboard</button>

<!-- Combine with file loading -->
<button data-xon="@click#dashboard.html~>#content~/dashboard">
    Load Dashboard
</button>

<!-- Direct route links -->
<a href="#" data-xon="~/home">Home</a>
<a href="#" data-xon="~/about">About</a>
```


# JSON Reactivity Containers


XON's most powerful feature is JSON Reactivity Containers:

```
<div data-xon='{
    "$state": {
        "count": 0,
        "name": "XON Application",
        "user": {
            "id": 1,
            "email": "user@example.com",
            "profile": {
                "avatar": "default.jpg",
                "bio": "Software developer"
            }
        },
        "items": [
            { "id": 1, "name": "Item 1", "price": 10 },
            { "id": 2, "name": "Item 2", "price": 20 }
        ],
        "settings": {
            "theme": "dark",
            "notifications": true
        }
    },
    "$bind": {
        "count": ".count-display",
        "name": ".app-title",
        "user.email": ".email-display",
        "user.profile.bio": ".bio-display",
        "settings.theme": ".theme-indicator"
    },
    "$computed": {
        "itemCount": ".item-count",
        "totalPrice": ".total-price"
    }
}'>
    <!-- Auto-bound elements -->
    <h1 class="app-title"></h1>
    <div class="count-display"></div>
    <div class="email-display"></div>
    <div class="bio-display"></div>
    <div class="theme-indicator"></div>
    <div class="item-count"></div>
    <div class="total-price"></div>
    
    <!-- State manipulation -->
    <button data-xon="@click$state.count++">Increment</button>
    <button data-xon="@click$state.user.email('new@example.com')">
        Update Email
    </button>
    <button data-xon="@click$state.settings.theme('light')">
        Toggle Theme
    </button>
</div>
```

### Context Variables
XON provides enhanced context variables available in all event handlers:

| Variable   | Description                         | Example                                   |
|-----------|-------------------------------------|--------------------------------------------|
| `$this`    | Current element                     | `$this.classList.add('active')`            |
| `$source`  | Source element with `data-xon`       | `$source.dataset.id`                       |
| `$target`  | Target element                      | `$target.innerHTML`                        |
| `$event`   | Native event object                 | `$event.preventDefault()`                 |
| `$document`| Document object                     | `$document.title`                         |
| `$window`  | Window object                       | `$window.scrollTo(0, 0)`                  |
| `$data`    | Element dataset                     | `$data.id`                                |
| `$value`   | Element value / text                | `$value.trim()`                           |
| `$index`   | Element index (templates)           | `Item {$index + 1}`                       |
| `$parent`  | Parent element                      | `$parent.removeChild($this)`              |
| `$children`| Child elements                      | `$children.length`                        |
| `$xon`     | XON framework instance              | `$xon.debug.log('test')`                  |
| `$state`   | Global reactive state               | `$state.count++`                          |
| `$bind`    | Binding system                      | `$bind.username = '.new-display'`         |


# 🔧 API Reference

## Core API

```
// Initialize framework
xon.init();

// Render specific elements
xon.render('#app');
xon.render(document.getElementById('container'));

// Load resources
xon.loadScript('app.js', callback, true);
xon.loadStyle('styles.css', callback);
xon.loadJSON('data.json', callback, null, 'users');

// Query shortcuts
xon.by('#id');                    // querySelector
xon.byAll('.class');              // querySelectorAll
xon.byId('element');              // getElementById
xon.byClass('items');             // getElementsByClassName
xon.byTag('div');                 // getElementsByTagName
```

### Reactivity API


```
// Create reactive state
xon.reactivity.createState('app', {
    counter: 0,
    user: { name: '', email: '' }
});

// Create state with computed properties
xon.reactivity.createStateWithComputed('cart', {
    items: [],
    taxRate: 0.1
}, {
    itemCount() { return this.items.length; },
    subtotal() { 
        return this.items.reduce((sum, item) => sum + item.price, 0);
    },
    tax() { return this.subtotal * this.taxRate; },
    total() { return this.subtotal + this.tax; }
});

// Memoization for expensive calculations
const result = xon.reactivity.memo(
    ['calculation', param1, param2],
    () => expensiveOperation(param1, param2),
    10000  // Cache for 10 seconds
);

// Batch multiple updates
xon.reactivity.batch(() => {
    state.a = 1;
    state.b = 2;
    state.c = 3;
    // Only one DOM update
});

// Clear cache
xon.reactivity.clearCache();                    // All cache
xon.reactivity.clearCache('specificKey');       // Specific key
```

# Template API

```
// Render template to element
xon.template.renderTo('templateName', targetElement, form, priority, customHTML);

// Render large datasets in chunks
xon.template.renderLarge('bigTemplate', '#container', 50); // 50 items per chunk

// Populate form with template data
xon.template.populateForm(formElement, 'templateName');

// Clear template cache
xon.template.clearCache();          // Clear all cache
xon.template.clearCache('template'); // Clear specific template
```

# Router API

```
// Navigate to route
xon.router.routeTo('/dashboard');

// Get current route
const current = xon.router.getCurrent();

// Enable/disable router
xon.router.enable(true);
xon.router.enable(false);

// Listen to route changes
window.addEventListener('xonroutechange', (e) => {
    console.log('Route changed:', e.detail.path);
});

window.addEventListener('xonroutepopstate', (e) => {
    console.log('Browser navigation:', e.detail.path);
});
```

# DOM API

```
// CSS class operations
xon.dom.addClass('active', '.btn');
xon.dom.removeClass('hidden', '#element');
xon.dom.toggleClass('selected', element);

// Query with caching
xon.dom.all('.items'); // Returns NodeList, caches results
```

# Security API

```
// Add allowed namespaces
xon.security.allowed.add('myApp');
xon.security.allowed.add('utils');

// Check security
xon.security.isSafe('myApp.function');    // true
xon.security.isSafe('eval.something');    // false
xon.security.isDangerous('innerHTML');    // true

// Sanitization
const safeHTML = xon.security.sanitizeHTML(userInput);
const safeText = xon.security.sanitizeTextContent(userInput);
const safeCode = xon.security.sanitizeJSCode(jsCode);
```


# Registration API



```
// Register functions for data-xon
window.xonRegister('app.sayHello', function(message) {
    console.log('Hello:', message);
});

// Register variables
window.xonRegisterVar('app.config', {
    version: 'Beta',
    debug: true,
    apiUrl: 'https://api.example.com'
});

// Register classes
window.xonRegisterClass('App.User', class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
    
    display() {
        return `${this.name} <${this.email}>`;
    }
});
```


## Allow namespace


```
window.xonAllowNamespace('myNamespace');

```


## Auto-register namespace


```
window.xonRegisterNamespace('myNamespace');
```


# Debugging API


## Enable debug mode

```
xon.debug.toggle(true);
```


## Debug logs


```
xon.debug.log('Message');
xon.debug.warn('Warning');
xon.debug.error('Error');
```

## Debug utilities

```
xon.demoComputedProperties();     // Demo reactivity system
xon.testMemoization();            // Test memoization
xon.debugComputedProperties();    // Show computed properties
```

## Console utilities
```
console.getHistory();      // Get console history (last 50 entries)
console.showHistory();     // Show console history```
```

### Press F1 to clear console

<p align="center"> Made with ❤️ for the web development community </p><p align="center"> <sub>If you find XON useful, please consider giving it a ⭐ on GitHub!</sub> </p>
