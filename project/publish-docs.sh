#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "    Bad input: Expected a directory as the first argument for the docs to go into (i.e. master/ or releases/v1.0.0/)";
  exit 1;
fi

if [ "$TRAVIS" -a "$TRAVIS_BRANCH" = "master" -a "$TRAVIS_PULL_REQUEST" = "false" ]; then
  echo "In a travis build but not master branch so skipping doc deployment."
  exit 0
fi

echo ""
echo ""
echo "Deploying new docs to http://googlechrome.github.io/Propel/$1"
echo ""

echo ""
echo ""
echo "Clone repo and get gh-pages branch"
echo ""
git clone https://github.com/GoogleChrome/Propel/ ./gh-pages
cd ./gh-pages
git checkout gh-pages
cd ..

echo ""
echo ""
echo "Build the docs"
echo ""
npm run build-docs


echo ""
echo ""
echo "Copy docs to gh-pages"
echo ""
rm -rf ./gh-pages/$1
mkdir -p ./gh-pages/$1
cp -r ./docs/. ./gh-pages/$1


echo ""
echo ""
echo "Commit to gh-pages"
echo ""
# The curly braces act as a try / catch
{
  cd ./gh-pages

  if [ "$TRAVIS" ]; then
    # inside this git repo we'll pretend to be a new user
    git config user.name "Travis CI"
    git config user.email "propel@google.com"
  fi

  git add ./$1
  git commit -m "Deploy to GitHub Pages"

  if [ "$TRAVIS" ]; then
    # Force push from the current repo's master branch to the remote
    # repo's gh-pages branch. (All previous history on the gh-pages branch
    # will be lost, since we are overwriting it.) We redirect any output to
    # /dev/null to hide any sensitive credential data that might otherwise be exposed.
    git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" gh-pages > /dev/null 2>&1
  else
    git push --force origin gh-pages
  fi
} || {
  echo ""
  echo "ERROR: Unable to deploy docs!"
  echo ""
}

echo ""
echo ""
echo "Clean up gh-pages"
echo ""
cd ..
rm -rf ./gh-pages
