if [ "$TRAVIS_BRANCH" -ne "master" ]
then
  echo "Not on master branch, not deploying"
  exit 0
fi

if [ "$TRAVIS_PULL_REQUEST" = "true" ]
then
  echo "This is a pull request, not deploying"
  exit 0
fi

echo "Let's Deploy :)"
