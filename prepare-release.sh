if [[ $1 != "patch" && $1 != "minor" && $1 != "major" ]] ; then
  echo "Bad input of \"$1\"- expected an update type of \"patch\", \"minor\" or \"major\"";
  exit 1;
fi

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

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
echo "Create and Copy Files for Release"
echo ""
mkdir -p tagged-release
cp -r ./docs ./tagged-release
cp -r ./src ./tagged-release
cp -r ./dist ./tagged-release

cd ./tagged-release/

echo ""
echo ""
echo "Git push to tagged-releases branch"
echo ""


echo ""
echo ""
echo "Update NPM Version"
echo ""
# npm version $1

echo ""
echo ""
echo "Publish updat to NPM"
echo ""
# npm publish




echo ""
echo ""
echo "Removing Tagged Release"
echo ""
cd ..
# rm -rf ./tagged-release
