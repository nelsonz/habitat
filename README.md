h@bitat
=======

Infrastructure for Hackers@Berkeley.

Install dependencies listed in package.json with
> npm install

If you need to add modules to the project, run
> npm install <package> --save

Make sure if npm_modules shows up in your directory, to add it to gitignore using
> echo npm_modules >> .gitignore
or else the repo size will explode!

Run the app with
> node server.js
for the app use a remote mongo database and your local url.

or use
> node server.js local
to use a local mongo instance (name it hackerfair)

or
> node server.js production
to use a remote mongo database and the heroku url
(note this is really only useful when run in heroku)

if you want to run on a port different from the default value of 8000, use
> node server.js default <port>
to specify the port number.

To deploy to heroku, run
> git remote add heroku git@heroku.com:gentle-hollows-2295
If this fails, ask Nelson for access. Push to heroku with
> git push heroku master
(work on a separate branch and push when you're confident in your changes.)
