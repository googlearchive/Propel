#!/bin/bash
set -e

# NOTES:
#     To delete a tag use: git push origin :v1.0.0

if [[ $1 != "patch" && $1 != "minor" && $1 != "major" ]] ; then
  echo "    Bad input: \"$1\". Expected an update type of \"patch\", \"minor\" or \"major\"";
  exit 1;
fi

echo ""
echo ""
echo "Publishing Propel $PACKAGE_VERSION"
echo ""
echo ""
echo "Building Library"
echo ""
gulp default --throw-error

echo ""
echo ""
echo "Building Docs"
echo ""
esdoc -c esdoc.json

echo ""
echo ""
echo "Update NPM Version"
echo ""
npm --no-git-tag-version version $1

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo ""
echo ""
echo "Create and Copy Files for Release"
echo ""
# Remove any remain artifacts from the previous build
rm -rf ./tagged-release
mkdir tagged-release

# Copy over files that we want in the release
cp -r ./docs ./tagged-release
cp -r ./src ./tagged-release
cp -r ./dist ./tagged-release
cp LICENSE ./tagged-release

cd ./tagged-release/

echo ""
echo ""
echo "Git push to release branch"
echo ""
git init
git remote add origin https://github.com/GoogleChrome/Propel.git
git checkout -b release
git add .
git commit -m "New tagged release - $PACKAGE_VERSION"
git tag -f v$PACKAGE_VERSION
git push -f origin release v$PACKAGE_VERSION

echo ""
echo ""
echo "Publish update to NPM"
echo ""
npm publish

echo ""
echo ""
echo "Removing Tagged Release"
echo ""
cd ..
rm -rf ./tagged-release
