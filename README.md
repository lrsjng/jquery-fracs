# jQuery.fracs

* Website with download, docs and demo: <http://larsjung.de/fracs>
* Sources: <http://github.com/lrsjng/jQuery.fracs>

jQuery.fracs is provided under the terms of the [MIT License](http://github.com/lrsjng/jQuery.fracs/blob/master/LICENSE.txt).


## Changelog

### v0.11 - *2012-03-03*

* completely refactored and !not! compatible with previous versions
* now depends on jQuery 1.7
* fixes `ScrollState`
* `ScrollState` is now available for all elements
* removes `Cursor`
* removes most `$.fracs.*` methods
* moves all js code into one file
* adds tests
* adds comments
* updates to `modplug 0.7`
* removes `release` folder
* adds `docco` build dependency for docs


### v0.10 - *2011-09-17*

* refactored and redesigned
* added `autoFocus` to `OutlineOptions` and changed default `duration` to `0`
* added callbacks for the `max` and `min` methods
* added some cursor related methods
* added the corresponding objects `Element`, `Group` and `Cursor`


### v0.9 - *2011-08-13*

* now also provided: core lib without the large Outline feature (~66% in size)
* shortcut for the static method fracs
* static method scrollState and object ScrollState changed
* refactorings, finally found my modular plugin style


### v0.8.1 - *2011-08-10*

* added viewport styling to `OutlineOptions`
* fixed text selection on dragging


### v0.8 - *2011-08-09*

* added `duration`, `focusWidth` and `focusHeight` to `OutlineOptions`
* added static methods
    * `jQuery.fracs.scroll`
    * `jQuery.fracs.scrollState`
* added methods to `Rect`
    * `bind`
    * `unbind`
    * `check`
    * `fracs`


### v0.7.1 - *2011-08-01*

* fixed unchecked use of console.log


### v0.7 - *2011-07-27*

* changed license to MIT license, see `LICENSE.txt`


### v0.6 - *2011-07-26*

* added envelope
* started test suite


### v0.5 - *2011-07-21*

* added soft link, outline, min, max
* refactorings


### v0.4 - *2011-07-15*

* added scroll methods
* added FracsElement


### v0.3 - *2011-07-13*

* some API changes
* cleaned code
* first test of grouping elements
* added FracsGroup


### v0.2 - *2011-07-12*

* improved demo
