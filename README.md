# Gulp boilerplate to develop Drupal oriented front-end

Version 1.0.0

## NPM tasks

| Task  | Description |
| :-------------- | :------------- |
| `npm start`  | Run local development server at [localhost:8282](http://localhost:8282/)  |
| `npm run theme`  | Build Drupal theme resources (js, css, images) to `./` |
| `npm run slices` | Build slices to `./slices`. And this folder is being refreshed when `npm start` is running|

##PNG sprite

Implemented with module [gulp.spritesmith](https://github.com/twolfson/gulp.spritesmith). 
Source PNG files should be placed in `./src/png-icons/`. This folder should contain only PNG icons. 
Every icon should be presented by two images: 
                                                         
1. no retina icon `[file_name].png`;
2. and retina icon `[file_name]@2x.png` (dimensions should be 2x bigger). 

How to use in HTML:
```html
<span class="icon-instagram"></span>
```

How to use in SCSS:
```css
//include not retina icon (not recommended):
@include sprite($icon-instagram);

//or include retina icon (recommended):
@include retina-sprite($icon-instagram-group);
```

##SVG sprite

Implemented with module [gulp-svg-sprite](https://github.com/jkphl/gulp-svg-sprite). 
Source SVG files should be placed here - `./src/svg-icons/`. 

In dist folder the sprite file will be placed here - `./images/sprite.svg`

`./src/svg-icons/` will be copied to the disp folder `./svg-icons/`

How to use in HTML:
```
<svg>
   <use xlink:href="images/sprite.svg#instagram"></use>
</svg>
```

##Content files

Folder `./src/temp-files/` should contain files which are not required in production build: content images, videos, etc.

##Scripts

ES6.

Modules are supported with `require("./my-module");` syntax.

`./src/scripts/behaviors.js` - should import all js Drupal behaviors from `./src/scripts/behaviors/` folder in correct order.
In this case you can include only one file to the HTML page but not big list of files.

`./src/scripts/slice-only.js` - this file is built only in 'development' mode.
Here you can imitate Drupal behaviour calls and other functionality required only by samples.

##CSS reset

CSS reset is implemented with module [normalize.css](https://github.com/necolas/normalize.css).


##Configs

`./config.js` - root config. You can override config in `./config.local.js`. 
Please keep local config file in git ignore.


##Useful info
- browsersl.ist - https://browsersl.ist
