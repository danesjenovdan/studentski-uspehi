::
call uglifycss css\custom.css > dist\custom.min.css
::
call uglifyjs js\jquery.min.js js\countdown.min.js js\main.js -o dist\bundle.min.js -c -m
::
xcopy css\bootstrap.min.css dist\bootstrap.min.css* /Y