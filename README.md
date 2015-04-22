# BikeJS
My JavaScript libraries

## require.js

**Usage:**

HTML:

```html
<body>
    <script data-main="main" src="../../libs/require.js"></script>
</body>
```

main.js

```javascript
require.config({
    baseUrl: '../../libs',
    removeScriptTags: true,

    config: {
        ajax: {
            type: 'GET',
            url: '//my.api.com/'
        }
    }
});
    
require(['utils', 'dom', 'ajax'], function(utils, dom, ajax) {
    /** Code... **/
});
```