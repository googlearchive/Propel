if [ "$TRAVIS_BRANCH" = "master" -a "$TRAVIS_PULL_REQUEST" = "false" ]
then
   echo "Deploying new docs to http://googlechrome.github.io/Propel/"

   # Helpful tips from Domenic https://gist.github.com/domenic/ec8b0fc8ab45f39403dd
   # go to the docs directory and create a *new* Git repo
   cd docs
   git init

   # inside this git repo we'll pretend to be a new user
   git config user.name "Travis CI"
   git config user.email "propel@google.com"

   # The first and only commit to this new Git repo contains all the
   # files present with the commit message "Deploy to GitHub Pages".
   git add .
   git commit -m "Deploy to GitHub Pages"

   # Force push from the current repo's master branch to the remote
   # repo's gh-pages branch. (All previous history on the gh-pages branch
   # will be lost, since we are overwriting it.) We redirect any output to
   # /dev/null to hide any sensitive credential data that might otherwise be exposed.
   git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
else
   echo "Not a travis build of the master branch, not deploying"
   # exit 0
fi
